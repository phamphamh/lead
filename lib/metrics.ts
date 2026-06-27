import { prisma } from "@/lib/prisma";
import type { ConfigJson, ConfigMetrics } from "@/lib/contract";

const RECENT_CONFIGS = 6;

// Fetch the active config row (json + id). Returns null if none / on error.
export async function getActiveConfig(): Promise<{
  id: string;
  json: ConfigJson;
} | null> {
  try {
    const cfg = await prisma.config.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    if (!cfg) return null;
    return { id: cfg.id, json: cfg.json as unknown as ConfigJson };
  } catch {
    return null;
  }
}

// Compute per-config metrics for the ~6 most recent configs.
// proximalRate = clicks/views, downstreamRate = forms/views (0 when views=0).
export async function computeMetrics(): Promise<ConfigMetrics[]> {
  try {
    const configs = await prisma.config.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_CONFIGS,
    });
    if (configs.length === 0) return [];

    const ids = configs.map((c) => c.id);

    // One grouped count over all relevant events.
    const grouped = await prisma.event.groupBy({
      by: ["configId", "type"],
      where: { configId: { in: ids } },
      _count: { _all: true },
    });

    // Index counts: configId -> { view, click_cta, form_qualified }
    const counts = new Map<
      string,
      { views: number; clicks: number; forms: number }
    >();
    for (const id of ids) counts.set(id, { views: 0, clicks: 0, forms: 0 });

    for (const g of grouped) {
      const bucket = counts.get(g.configId);
      if (!bucket) continue;
      const n = g._count._all;
      if (g.type === "view") bucket.views = n;
      else if (g.type === "click_cta") bucket.clicks = n;
      else if (g.type === "form_qualified") bucket.forms = n;
    }

    return configs.map((c) => {
      const b = counts.get(c.id) ?? { views: 0, clicks: 0, forms: 0 };
      const proximalRate = b.views > 0 ? b.clicks / b.views : 0;
      const downstreamRate = b.views > 0 ? b.forms / b.views : 0;
      return {
        configId: c.id,
        active: c.active,
        json: c.json as unknown as ConfigJson,
        views: b.views,
        clicks: b.clicks,
        forms: b.forms,
        proximalRate,
        downstreamRate,
      };
    });
  } catch {
    return [];
  }
}
