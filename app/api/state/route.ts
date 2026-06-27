import { prisma } from "@/lib/prisma";
import { computeMetrics, getActiveConfig } from "@/lib/metrics";
import type { Mode } from "@/lib/contract";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [activeConfig, lock, metrics] = await Promise.all([
      getActiveConfig(),
      prisma.agentLock.findUnique({ where: { id: 1 } }),
      computeMetrics(),
    ]);

    const mode: Mode = (lock?.mode as Mode) ?? "accelerated";
    const running = lock?.running ?? false;

    return Response.json({ activeConfig, mode, running, metrics });
  } catch {
    return Response.json({
      activeConfig: null,
      mode: "accelerated",
      running: false,
      metrics: [],
    });
  }
}
