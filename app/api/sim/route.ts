import { prisma } from "@/lib/prisma";
import { generateAcceleratedEvents } from "@/lib/accelerated";

export const dynamic = "force-dynamic";

// POST /api/sim  body { pattern?: "trap" | "normal", n?: number }
// Generate deterministic accelerated events for the currently active config.
// Defaults: pattern "trap", n 40. Returns { generated }.
export async function POST(req: Request) {
  let pattern: "trap" | "normal" = "trap";
  let n = 40;

  try {
    const body = await req.json().catch(() => ({}));
    if (body && (body.pattern === "trap" || body.pattern === "normal")) {
      pattern = body.pattern;
    }
    if (body && typeof body.n === "number" && Number.isFinite(body.n) && body.n > 0) {
      n = Math.floor(body.n);
    }
  } catch {
    // ignore malformed body — fall back to defaults
  }

  let configId: string | null = null;
  try {
    const active = await prisma.config.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    configId = active?.id ?? null;
  } catch {
    configId = null;
  }

  if (!configId) {
    return Response.json({ generated: 0 });
  }

  let generated = 0;
  try {
    generated = await generateAcceleratedEvents(configId, pattern, n);
  } catch {
    generated = 0;
  }

  return Response.json({ generated });
}
