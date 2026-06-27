"use client";

import { useEffect, useState } from "react";
import type { Verdict } from "@/lib/contract";

interface Decision {
  id: string;
  configIdFrom: string | null;
  configIdTo: string | null;
  hypothesis: string;
  reasoning: string;
  proximalDelta: number | null;
  downstreamDelta: number | null;
  verdict: Verdict | string;
  accelerated: boolean;
  createdAt: string;
}

function fmtDelta(d: number | null): string {
  if (d === null || d === undefined) return "—";
  const pts = d * 100;
  const sign = pts > 0 ? "+" : "";
  return `${sign}${pts.toFixed(1)}pts`;
}

function deltaColor(d: number | null): string {
  if (d === null || d === undefined) return "text-neutral-500";
  if (d > 0) return "text-emerald-400";
  if (d < 0) return "text-red-400";
  return "text-neutral-400";
}

function timeOf(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

const VERDICT_STYLE: Record<string, { badge: string; label: string }> = {
  ship: {
    badge: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40",
    label: "SHIP",
  },
  reject: {
    badge: "bg-red-500/20 text-red-300 ring-1 ring-red-500/40",
    label: "REJECT",
  },
  abstain: {
    badge: "bg-neutral-700/40 text-neutral-300 ring-1 ring-neutral-600",
    label: "ABSTAIN",
  },
};

export default function ReasoningLog() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/decisions?limit=20", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Decision[];
        if (!alive) return;
        setDecisions(Array.isArray(data) ? data : []);
        setStale(false);
      } catch {
        if (alive) setStale(true);
      }
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/40">
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-2.5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
          Reasoning log
        </span>
        <span className="text-[10px] font-mono text-neutral-600">
          le raisonnement de l&apos;agent, en direct
        </span>
        <span className="ml-auto text-[10px] font-mono text-neutral-600">
          {stale ? (
            <span className="text-red-400/80">offline</span>
          ) : (
            `${decisions.length} décision${decisions.length > 1 ? "s" : ""}`
          )}
        </span>
      </div>

      <div className="max-h-[640px] space-y-3 overflow-y-auto p-4 font-mono">
        {decisions.length === 0 ? (
          <p className="py-8 text-center text-xs text-neutral-500">
            En attente du premier raisonnement…
          </p>
        ) : (
          decisions.map((d) => {
            const isReject = d.verdict === "reject";
            const style = VERDICT_STYLE[d.verdict] ?? VERDICT_STYLE.abstain;
            return (
              <article
                key={d.id}
                className={`rounded-lg border p-3.5 transition-colors ${
                  isReject
                    ? "border-red-500/60 bg-red-950/20 ring-1 ring-red-500/20"
                    : "border-neutral-800 bg-neutral-950/50"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  {d.accelerated && (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-300 ring-1 ring-amber-500/30">
                      sim
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-neutral-600">
                    {timeOf(d.createdAt)}
                  </span>
                </div>

                {isReject && (
                  <div className="mb-2 inline-block rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                    REFUSÉ — optimise le CAC réel
                  </div>
                )}

                <p className="mb-1.5 text-xs leading-relaxed text-neutral-200">
                  <span className="text-neutral-500">hypothèse&gt; </span>
                  {d.hypothesis}
                </p>
                <p className="text-xs leading-relaxed text-neutral-400">
                  <span className="text-neutral-600">raisonnement&gt; </span>
                  {d.reasoning}
                </p>

                <div className="mt-2.5 flex items-center gap-4 border-t border-neutral-800/80 pt-2 text-[10px]">
                  <span className="text-neutral-500">
                    proximal{" "}
                    <span className={`font-semibold ${deltaColor(d.proximalDelta)}`}>
                      {fmtDelta(d.proximalDelta)}
                    </span>
                  </span>
                  <span className="text-neutral-500">
                    downstream{" "}
                    <span className={`font-semibold ${deltaColor(d.downstreamDelta)}`}>
                      {fmtDelta(d.downstreamDelta)}
                    </span>
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
