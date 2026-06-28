import { NextResponse } from "next/server";

import { runLaunch, type LaunchEvent } from "@/lib/agents/launch-experiment";
import { getDemoContext } from "@/lib/demo";
import { env } from "@/lib/env";
import { ensureSdkKey } from "@/lib/sdk-key";
import { type SurfaceKey } from "@/lib/agents/types";

// Same as /api/experiments/launch, but NO session: it launches an A/B test on
// the hard-coded demo repo, acting as the repo owner. Opens a real PR via the
// owner's GitHub App installation. Lets a visitor try Vela without a login.
export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Agent not configured." }, { status: 503 });
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

  // Optional seed hint from the audit (best-effort).
  let hint: { surface?: SurfaceKey; title?: string; rationale?: string } | null = null;
  try {
    const body = (await request.json()) as {
      surface?: string;
      title?: string;
      rationale?: string;
    } | null;
    if (body && ["landing", "onboarding", "paywall"].includes(body.surface ?? "")) {
      hint = {
        surface: body.surface as SurfaceKey,
        title: typeof body.title === "string" ? body.title : undefined,
        rationale: typeof body.rationale === "string" ? body.rationale : undefined,
      };
    }
  } catch {
    // no body — the agent picks the surface itself
  }

  await ensureSdkKey(project);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: LaunchEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        await runLaunch({
          userToken: token,
          projectId: project.id,
          repoFullName: project.repoFullName,
          branch: project.defaultBranch,
          repoPrivate: project.private,
          hint,
          onEvent: send,
        });
      } catch (e) {
        console.error("[demo-launch] failed", e);
        send({ type: "error", message: e instanceof Error ? e.message : "Launch failed." });
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
