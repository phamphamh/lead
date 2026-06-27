import { prisma } from "@/lib/prisma";
import { EVENT_TYPES } from "@/lib/contract";

// ---- Accelerated (deterministic) traffic generator ----
// Produces synthetic Events for a config so the agent can decide WITHOUT waiting
// for real traffic. Fully DETERMINISTIC: no Math.random — every (configId,pattern,n)
// triple always yields the exact same proximal/downstream pattern. This makes the
// scripted demo reproducible.
//
// Patterns:
//   "trap"   — the clickbait trap: proximal UP, downstream DOWN.
//              ~55% click the CTA but only ~6% qualify (high curiosity, low intent).
//   "normal" — a healthy config: ~25% click, ~9% qualify (proportional intent).
//
// forms are always a strict subset of clicks (you must click the CTA before you can
// fill the form), so downstreamRate <= proximalRate by construction.

type Pattern = "trap" | "normal";

const PATTERNS: Record<Pattern, { clickPct: number; formPct: number }> = {
  // proximal UP (55%), downstream DOWN (6%) → the trap
  trap: { clickPct: 55, formPct: 6 },
  // moderate clicks (25%) with proportional forms (9%)
  normal: { clickPct: 25, formPct: 9 },
};

export async function generateAcceleratedEvents(
  configId: string,
  pattern: Pattern,
  n: number,
): Promise<number> {
  const safeN = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  if (safeN === 0) return 0;

  const { clickPct, formPct } = PATTERNS[pattern] ?? PATTERNS.trap;

  const [VIEW, CLICK, FORM] = EVENT_TYPES; // "view" | "click_cta" | "form_qualified"

  const rows: {
    configId: string;
    sessionId: string;
    type: string;
    utmSource: string;
    utmTerm: string;
  }[] = [];

  for (let i = 0; i < safeN; i++) {
    const sessionId = `sim-${configId}-${i}`;
    const bucket = i % 100; // deterministic position within a 100-session cohort

    // Every synthetic session views the page.
    rows.push({
      configId,
      sessionId,
      type: VIEW,
      utmSource: "accelerated",
      utmTerm: pattern,
    });

    // Deterministic click: the first `clickPct` of every 100-cohort click.
    const clicked = bucket < clickPct;
    if (clicked) {
      rows.push({
        configId,
        sessionId,
        type: CLICK,
        utmSource: "accelerated",
        utmTerm: pattern,
      });
    }

    // Deterministic form: strict subset of clicks (formPct < clickPct).
    if (clicked && bucket < formPct) {
      rows.push({
        configId,
        sessionId,
        type: FORM,
        utmSource: "accelerated",
        utmTerm: pattern,
      });
    }
  }

  const result = await prisma.event.createMany({ data: rows });
  // createMany returns { count } on Postgres; fall back to rows.length defensively.
  return typeof result?.count === "number" ? result.count : rows.length;
}
