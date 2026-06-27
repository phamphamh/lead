import { prisma } from "@/lib/prisma";
import { computeMetrics } from "@/lib/metrics";
import { runAgentDecision } from "@/lib/claude";
import type { ConfigMetrics } from "@/lib/contract";

export const dynamic = "force-dynamic";

export async function POST() {
  // Ensure the single lock row exists.
  let lock;
  try {
    lock = await prisma.agentLock.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "lock error" },
      { status: 500 }
    );
  }

  if (lock.running) {
    return Response.json({ skipped: true });
  }

  // Acquire the lock.
  await prisma.agentLock.update({ where: { id: 1 }, data: { running: true } });

  try {
    const metrics = await computeMetrics();
    const active = metrics.find((m) => m.active) ?? null;

    const decision = await runAgentDecision(metrics, active as ConfigMetrics | null);

    let configIdTo: string | null = null;

    if (decision.verdict === "ship" && decision.config) {
      // Deactivate the current active config, then create + activate the new one.
      if (active) {
        await prisma.config.updateMany({
          where: { active: true },
          data: { active: false },
        });
      }
      const shipped = await prisma.config.create({
        data: {
          json: decision.config,
          active: true,
          createdBy: "agent",
          parentId: active?.configId ?? null,
        },
      });
      configIdTo = shipped.id;
    }

    const created = await prisma.decision.create({
      data: {
        configIdFrom: active?.configId ?? null,
        configIdTo,
        hypothesis: decision.hypothesis,
        reasoning: decision.reasoning,
        proximalDelta: decision.proximalDelta,
        downstreamDelta: decision.downstreamDelta,
        verdict: decision.verdict,
        accelerated: lock.mode === "accelerated",
      },
    });

    return Response.json(created);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "agent step failed" },
      { status: 500 }
    );
  } finally {
    // Always release the lock.
    await prisma.agentLock
      .update({ where: { id: 1 }, data: { running: false } })
      .catch(() => {});
  }
}
