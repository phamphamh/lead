import { NextResponse } from "next/server";

import { runAudit } from "@/lib/agents/audit";
import { type AuditEvent } from "@/lib/agents/types";
import { db } from "@/lib/db";
import { getDemoContext } from "@/lib/demo";
import { env } from "@/lib/env";
import { type Prisma } from "@/lib/generated/prisma/client";

// Same as /api/audit/repo, but NO session: it always audits the hard-coded demo
// repo, acting as the repo owner. Lets a visitor try Vela without a GitHub login.
export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST() {
  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Audit agent not configured (missing ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  let ctx;
  try {
    ctx = await getDemoContext();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Demo unavailable." },
      { status: 503 },
    );
  }

  const { token, project } = ctx;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AuditEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };
      try {
        const result = await runAudit({
          token,
          repoFullName: project.repoFullName,
          branch: project.defaultBranch,
          onEvent: send,
        });
        const scores = result.surfaces.map((s) => s.score);
        const avg = scores.length
          ? Math.round(scores.reduce((n, v) => n + v, 0) / scores.length)
          : 0;
        await db.projectAudit.create({
          data: {
            projectId: project.id,
            score: avg,
            result: result as unknown as Prisma.InputJsonValue,
          },
        });
      } catch (e) {
        console.error("[demo-audit] run failed", e);
        send({
          type: "error",
          message: e instanceof Error ? e.message : "Audit failed.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
    },
  });
}
