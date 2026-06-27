"use client";

import { useEffect, useState } from "react";
import type { ConfigMetrics, ConfigJson, Mode } from "@/lib/contract";

interface StateResponse {
  activeConfig: { id: string; json: ConfigJson } | null;
  mode: Mode;
  running: boolean;
  metrics: ConfigMetrics[];
}

const EMPTY: StateResponse = {
  activeConfig: null,
  mode: "accelerated",
  running: false,
  metrics: [],
};

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export default function Dashboard() {
  const [state, setState] = useState<StateResponse>(EMPTY);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as StateResponse;
        if (!alive) return;
        setState(data);
        setStale(false);
      } catch {
        if (alive) setStale(true);
      }
    };
    load();
    const id = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const activeId = state.activeConfig?.id ?? null;
  const metrics = state.metrics ?? [];

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-2.5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
          Dashboard
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
              state.mode === "live"
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
            }`}
          >
            {state.mode === "live" ? "LIVE" : "SIM"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
              state.running
                ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30"
                : "bg-neutral-700/40 text-neutral-400 ring-1 ring-neutral-700"
            }`}
          >
            {state.running ? "running" : "idle"}
          </span>
          {stale && (
            <span className="text-[10px] font-mono text-red-400/80">offline</span>
          )}
        </div>
      </div>

      <div className="p-4">
        {metrics.length === 0 ? (
          <p className="py-6 text-center text-xs font-mono text-neutral-500">
            Aucune donnée pour le moment — injecte du trafic ou lance l&apos;agent.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {metrics.map((m) => {
              const isActive = m.configId === activeId || m.active;
              return (
                <div
                  key={m.configId}
                  className={`rounded-lg border p-3 transition-colors ${
                    isActive
                      ? "border-emerald-500/40 bg-emerald-500/[0.06] ring-1 ring-emerald-500/20"
                      : "border-neutral-800 bg-neutral-900/40"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                      hero {m.json?.heroVariant ?? "?"}
                    </span>
                    {isActive && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                        active
                      </span>
                    )}
                    <span className="ml-auto truncate font-mono text-[10px] text-neutral-600">
                      {m.configId.slice(0, 8)}
                    </span>
                  </div>

                  <p className="mb-3 truncate text-xs text-neutral-300" title={m.json?.headline}>
                    {m.json?.headline ?? "—"}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Stat label="views" value={String(m.views)} />
                    <Stat label="proximal" value={pct(m.proximalRate)} accent="sky" />
                    <Stat label="downstream" value={pct(m.downstreamRate)} accent="emerald" />
                  </div>
                  <div className="mt-2 text-center text-[10px] font-mono text-neutral-600">
                    {m.clicks} clicks · {m.forms} forms
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "sky" | "emerald";
}) {
  const color =
    accent === "sky"
      ? "text-sky-300"
      : accent === "emerald"
        ? "text-emerald-300"
        : "text-neutral-100";
  return (
    <div className="rounded-md bg-neutral-950/60 py-2">
      <div className={`font-mono text-sm font-semibold tabular-nums ${color}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-500">
        {label}
      </div>
    </div>
  );
}
