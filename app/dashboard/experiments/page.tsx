"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  GitBranch,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  StatusBadge,
  type ExperimentStatus,
} from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* --- mock data -------------------------------------------------------- */

type Surface = "Landing" | "Onboarding" | "Paywall";

type Experiment = {
  id: string;
  surface: Surface;
  title: string;
  hypothesis: string;
  status: ExperimentStatus;
  uplift: number | null; // percentage points
  confidence: number | null;
  visitors: number;
  running: string;
};

const experiments: Experiment[] = [
  {
    id: "142",
    surface: "Paywall",
    title: "Pricing emphasis",
    hypothesis: "Leading with annual savings lifts checkout starts.",
    status: "RUNNING",
    uplift: 12.4,
    confidence: 95,
    visitors: 3201,
    running: "6d",
  },
  {
    id: "139",
    surface: "Onboarding",
    title: "Shorter signup",
    hypothesis: "Cutting the form to email-only raises activation.",
    status: "CONCLUSIVE",
    uplift: 9.1,
    confidence: 98,
    visitors: 5402,
    running: "11d",
  },
  {
    id: "141",
    surface: "Landing",
    title: "Hero headline rewrite",
    hypothesis: "Outcome-led headline beats feature-led on signups.",
    status: "RUNNING",
    uplift: 3.2,
    confidence: 71,
    visitors: 2140,
    running: "4d",
  },
  {
    id: "143",
    surface: "Paywall",
    title: "Annual plan default",
    hypothesis: "Pre-selecting annual increases ARPU without churn.",
    status: "QUEUED",
    uplift: null,
    confidence: null,
    visitors: 0,
    running: "—",
  },
  {
    id: "144",
    surface: "Landing",
    title: "Social proof above the fold",
    hypothesis: "Logos + count near the CTA reduce bounce.",
    status: "DRAFT",
    uplift: null,
    confidence: null,
    visitors: 0,
    running: "—",
  },
  {
    id: "131",
    surface: "Onboarding",
    title: "Progress checklist",
    hypothesis: "A visible checklist drives day-1 retention.",
    status: "COMPLETED",
    uplift: 14.8,
    confidence: 99,
    visitors: 8810,
    running: "shipped",
  },
  {
    id: "128",
    surface: "Paywall",
    title: "Money-back guarantee badge",
    hypothesis: "A guarantee badge lowers checkout anxiety.",
    status: "ABANDONED",
    uplift: -1.2,
    confidence: 42,
    visitors: 1980,
    running: "dropped",
  },
  {
    id: "135",
    surface: "Landing",
    title: "Sticky nav CTA",
    hypothesis: "A persistent CTA increases trial starts.",
    status: "COMPLETED",
    uplift: 6.5,
    confidence: 96,
    visitors: 6120,
    running: "shipped",
  },
];

const SURFACES = ["All surfaces", "Landing", "Onboarding", "Paywall"] as const;
const STATUSES = [
  "All statuses",
  "DRAFT",
  "QUEUED",
  "RUNNING",
  "CONCLUSIVE",
  "COMPLETED",
  "ABANDONED",
] as const;

/* --- helpers ---------------------------------------------------------- */

function Uplift({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  const positive = value > 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono tabular-nums",
        positive ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/* --- page ------------------------------------------------------------- */

export default function ExperimentsPage() {
  const [query, setQuery] = React.useState("");
  const [surface, setSurface] =
    React.useState<(typeof SURFACES)[number]>("All surfaces");
  const [status, setStatus] =
    React.useState<(typeof STATUSES)[number]>("All statuses");

  const filtered = experiments.filter((e) => {
    if (surface !== "All surfaces" && e.surface !== surface) return false;
    if (status !== "All statuses" && e.status !== status) return false;
    if (
      query &&
      !`${e.title} ${e.hypothesis} ${e.surface}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every test across the full lifecycle, on{" "}
            <span className="font-mono">acme/web</span>.
          </p>
        </div>
        <Button size="sm">
          <Plus className="size-4" />
          New experiment
        </Button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hypotheses…"
            className="pl-8"
          />
        </div>
        <Select
          value={surface}
          onValueChange={(v) => setSurface(v as (typeof SURFACES)[number])}
        >
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SURFACES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as (typeof STATUSES)[number])}
        >
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === "All statuses" ? s : s.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* table */}
      <Card className="py-0">
        <CardContent className="px-0">
          {/* column headers */}
          <div className="hidden grid-cols-12 gap-3 border-b border-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground md:grid">
            <div className="col-span-4">Experiment</div>
            <div className="col-span-2">Surface</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Uplift</div>
            <div className="col-span-1 text-right">Conf.</div>
            <div className="col-span-1 text-right">Running</div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((e) => (
              <Link
                key={e.id}
                href={`/dashboard/experiments/${e.id}`}
                className="group grid grid-cols-1 items-center gap-x-3 gap-y-2 px-5 py-3.5 transition-colors hover:bg-accent/50 md:grid-cols-12"
              >
                {/* experiment */}
                <div className="flex min-w-0 items-start gap-2.5 md:col-span-4">
                  <GitBranch className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {e.title}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground/70">
                        #{e.id}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {e.hypothesis}
                    </div>
                  </div>
                </div>

                {/* surface */}
                <div className="md:col-span-2">
                  <Badge variant="outline" className="font-normal">
                    {e.surface}
                  </Badge>
                </div>

                {/* status */}
                <div className="md:col-span-2">
                  <StatusBadge status={e.status} />
                </div>

                {/* uplift */}
                <div className="flex items-center justify-between text-sm md:col-span-2 md:justify-end">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground md:hidden">
                    Uplift
                  </span>
                  <Uplift value={e.uplift} />
                </div>

                {/* confidence */}
                <div className="flex items-center justify-between md:col-span-1 md:justify-end">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground md:hidden">
                    Confidence
                  </span>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {e.confidence !== null ? `${e.confidence}%` : "—"}
                  </span>
                </div>

                {/* running + chevron */}
                <div className="flex items-center justify-between md:col-span-1 md:justify-end md:gap-1">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground md:hidden">
                    Running
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {e.running}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden" />
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No experiments match these filters.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-center font-mono text-xs text-muted-foreground">
        {filtered.length} of {experiments.length} experiments
      </p>
    </div>
  );
}
