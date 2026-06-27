"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConfigJson } from "@/lib/contract";

interface Metric {
  configId: string;
  active: boolean;
  json: ConfigJson;
  views: number;
  clicks: number;
  forms: number;
  proximalRate: number;
  downstreamRate: number;
}

interface StateResp {
  metrics?: Metric[];
}

const pct = (x: number) => `${Math.round((x || 0) * 100)}%`;

export default function VariantGrid() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      const d = (await r.json()) as StateResp;
      setMetrics(Array.isArray(d.metrics) ? d.metrics : []);
    } catch {
      /* keep last */
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, [load]);

  const share = useCallback(
    async (id: string) => {
      const url = `${origin}/v/${id}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
      setCopied(id);
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    },
    [origin],
  );

  if (metrics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 px-6 py-12 text-center">
        <p className="text-sm text-neutral-300">Aucune version pour l’instant.</p>
        <p className="mt-1 text-xs text-neutral-500">
          Clique <span className="text-emerald-400">« Avancer l’agent »</span> pour qu’il en
          génère une, ou <span className="text-violet-400">« Rejouer la démo »</span> pour voir
          le scénario complet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((m, i) => {
        const isCopied = copied === m.configId;
        // newest first comes from the API; label by recency
        const label = m.active ? "EN LIGNE" : `Version ${metrics.length - i}`;
        return (
          <div
            key={m.configId}
            className={`flex flex-col overflow-hidden rounded-xl border bg-neutral-900/50 ${
              m.active ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : "border-neutral-800"
            }`}
          >
            {/* Live thumbnail of the actual landing variant */}
            <div className="relative h-44 w-full overflow-hidden border-b border-neutral-800 bg-white">
              <iframe
                src={`/v/${m.configId}?preview=1`}
                title={`Aperçu ${label}`}
                tabIndex={-1}
                className="absolute left-0 top-0 origin-top-left"
                style={{
                  width: "285%",
                  height: "285%",
                  transform: "scale(0.35)",
                  pointerEvents: "none",
                }}
              />
              <span
                className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${
                  m.active
                    ? "bg-emerald-500 text-emerald-950"
                    : "bg-neutral-800/90 text-neutral-300"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Headline + what changed */}
            <div className="flex flex-1 flex-col gap-3 p-3">
              <p className="line-clamp-2 text-sm font-medium text-neutral-100">
                {m.json.headline}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <span
                  className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: m.json.ctaColor }}
                />
                <span className="truncate">CTA : « {m.json.ctaText} »</span>
                <span className="ml-auto font-mono">hero {m.json.heroVariant}</span>
              </div>

              {/* Metrics: the whole point — clicks vs qualified leads */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-neutral-950/60 px-2.5 py-1.5">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500">
                    Clic
                  </div>
                  <div className="font-mono text-sm text-neutral-300">
                    {pct(m.proximalRate)}
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-950/60 px-2.5 py-1.5">
                  <div className="text-[10px] uppercase tracking-wide text-emerald-500/80">
                    Leads qualifiés
                  </div>
                  <div className="font-mono text-sm text-emerald-300">
                    {pct(m.downstreamRate)}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-neutral-600">
                {m.views} vues · {m.clicks} clics · {m.forms} leads
              </div>

              {/* Actions: see it / share it to a client */}
              <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`/v/${m.configId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-100 ring-1 ring-neutral-700 transition-colors hover:bg-neutral-700"
                >
                  Voir ↗
                </a>
                <button
                  onClick={() => void share(m.configId)}
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isCopied
                      ? "bg-emerald-500 text-emerald-950"
                      : "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30 hover:bg-sky-500/25"
                  }`}
                >
                  {isCopied ? "Lien copié ✓" : "Partager"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
