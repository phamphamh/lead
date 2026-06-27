import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* --- mock data -------------------------------------------------------- */

const kpis = [
  { label: "Blended conversion", value: "8.4%", delta: "+1.9pp", up: true },
  { label: "Cumulative uplift", value: "+18.2%", delta: "since connect", up: true, accent: true },
  { label: "Experiments shipped", value: "7", delta: "3 this month", up: true },
  { label: "Avg. time to signif.", value: "9.2d", delta: "−1.4d", up: true },
];

// conversion-over-time series (weekly, %)
const series = [5.1, 5.4, 5.2, 6.0, 6.4, 6.1, 7.0, 7.3, 7.1, 7.8, 8.1, 8.4];
const seriesLabels = ["W1", "W3", "W5", "W7", "W9", "W11"];

const funnels = [
  {
    surface: "Landing",
    steps: [
      { label: "Visit", value: 100 },
      { label: "Scroll CTA", value: 56 },
      { label: "Click CTA", value: 18 },
      { label: "Signup", value: 4.2 },
    ],
  },
  {
    surface: "Onboarding",
    steps: [
      { label: "Start", value: 100 },
      { label: "Email", value: 71 },
      { label: "Workspace", value: 52 },
      { label: "Activated", value: 38 },
    ],
  },
  {
    surface: "Paywall",
    steps: [
      { label: "View", value: 100 },
      { label: "Select plan", value: 34 },
      { label: "Checkout", value: 16 },
      { label: "Paid", value: 11.8 },
    ],
  },
];

type Learning = {
  insight: string;
  surface: string;
  evidence: string;
  direction: "win" | "loss";
};

const learnings: Learning[] = [
  {
    insight: "Annual-first pricing beats monthly-first on this audience.",
    surface: "Paywall",
    evidence: "#142 · +12.4% checkout starts at 95%",
    direction: "win",
  },
  {
    insight: "Email-only signup lifts activation more than progressive profiling.",
    surface: "Onboarding",
    evidence: "#139 · +9.1% activation at 98%",
    direction: "win",
  },
  {
    insight: "A persistent nav CTA reliably increases trial starts.",
    surface: "Landing",
    evidence: "#135 · +6.5% trials at 96%",
    direction: "win",
  },
  {
    insight: "Guarantee badges did not move checkout on this product.",
    surface: "Paywall",
    evidence: "#128 · −1.2%, inconclusive at 42%",
    direction: "loss",
  },
  {
    insight: "A day-1 checklist drives retention more than email nudges.",
    surface: "Onboarding",
    evidence: "#131 · +14.8% D1 retention at 99%",
    direction: "win",
  },
];

/* --- line chart (inline svg) ------------------------------------------ */

function TrendChart({ data }: { data: number[] }) {
  const w = 720;
  const h = 200;
  const pad = 8;
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (data.length - 1);
  const y = (v: number) =>
    pad + (h - pad * 2) * (1 - (v - min) / (max - min));

  const line = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-48 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Conversion rate over time"
    >
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={pad + (h - pad * 2) * g}
          y2={pad + (h - pad * 2) * g}
          className="stroke-border"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}
      <polygon points={area} className="fill-primary/10" />
      <polyline
        points={line}
        className="fill-none stroke-primary"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === data.length - 1 ? 4 : 0}
          className="fill-primary"
        />
      ))}
    </svg>
  );
}

/* --- page ------------------------------------------------------------- */

export default function InsightsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conversion trends, funnels, and what the agent has learned.
          </p>
        </div>
        <Button size="sm" variant="outline">
          Last 90 days
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {k.label}
              </div>
              <div
                className={cn(
                  "font-mono text-3xl font-semibold tabular-nums",
                  k.accent && "text-primary",
                )}
              >
                {k.value}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {k.up && k.delta.match(/[+−-]/) && (
                  <TrendingUp className="size-3.5 text-primary" />
                )}
                {k.delta}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blended conversion over time</CardTitle>
          <CardDescription>
            Weighted across all surfaces · weekly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <TrendChart data={series} />
          <div className="flex justify-between px-1 font-mono text-[11px] text-muted-foreground">
            {seriesLabels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* funnels */}
      <div className="grid gap-4 lg:grid-cols-3">
        {funnels.map((f) => (
          <Card key={f.surface}>
            <CardHeader>
              <CardTitle className="text-base">{f.surface} funnel</CardTitle>
              <CardDescription className="font-mono text-xs">
                {f.steps[f.steps.length - 1].value}% end-to-end
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {f.steps.map((step, i) => {
                const drop =
                  i > 0
                    ? Math.round(
                        ((f.steps[i - 1].value - step.value) /
                          f.steps[i - 1].value) *
                          100,
                      )
                    : 0;
                return (
                  <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{step.label}</span>
                      <span className="font-mono tabular-nums">
                        {step.value}%
                        {i > 0 && (
                          <span className="ml-1.5 text-muted-foreground/60">
                            −{drop}%
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-6 overflow-hidden rounded-sm bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-sm",
                          i === f.steps.length - 1
                            ? "bg-primary"
                            : "bg-chart-2/70",
                        )}
                        style={{ width: `${step.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* learnings library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-primary" />
            Learnings library
          </CardTitle>
          <CardDescription>
            Durable conclusions that feed the agent&apos;s next hypotheses.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {learnings.map((l) => (
            <div
              key={l.insight}
              className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                  l.direction === "win"
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {l.direction === "win" ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-chart-2" />
                  <span className="text-sm font-medium">{l.insight}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 pl-5">
                  <Badge variant="outline" className="font-normal">
                    {l.surface}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {l.evidence}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
