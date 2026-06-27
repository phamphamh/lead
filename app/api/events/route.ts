import { prisma } from "@/lib/prisma";
import { EVENT_TYPES, type EventType } from "@/lib/contract";

export const dynamic = "force-dynamic";

interface EventBody {
  type?: unknown;
  configId?: unknown;
  sessionId?: unknown;
  utmSource?: unknown;
  utmTerm?: unknown;
}

export async function POST(req: Request) {
  let body: EventBody;
  try {
    body = (await req.json()) as EventBody;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { type, configId, sessionId } = body;

  if (typeof type !== "string" || !EVENT_TYPES.includes(type as EventType)) {
    return Response.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }
  if (typeof configId !== "string" || !configId) {
    return Response.json({ ok: false, error: "missing_configId" }, { status: 400 });
  }
  if (typeof sessionId !== "string" || !sessionId) {
    return Response.json({ ok: false, error: "missing_sessionId" }, { status: 400 });
  }

  const utmSource = typeof body.utmSource === "string" ? body.utmSource : null;
  const utmTerm = typeof body.utmTerm === "string" ? body.utmTerm : null;

  try {
    // Dedup "view" per (configId, sessionId): only the first view counts.
    if (type === "view") {
      const existing = await prisma.event.findFirst({
        where: { configId, sessionId, type: "view" },
        select: { id: true },
      });
      if (existing) {
        return Response.json({ ok: true, deduped: true });
      }
    }

    await prisma.event.create({
      data: {
        configId,
        sessionId,
        type,
        utmSource,
        utmTerm,
      },
    });

    return Response.json({ ok: true });
  } catch {
    // Never surface DB errors to the landing page — telemetry must not break UX.
    return Response.json({ ok: false, error: "db_error" }, { status: 200 });
  }
}
