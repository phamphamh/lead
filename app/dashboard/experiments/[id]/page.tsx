import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitPullRequest,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  MeterBar,
  StatusBadge,
  type ExperimentStatus,
} from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* --- mock data -------------------------------------------------------- */

type DiffLine = { type: "ctx" | "add" | "del" | "meta"; text: string };

type Variant = {
  key: string;
  name: string;
  kind: "control" | "treatment";
  split: number; // traffic %
  visitors: number;
  conversions: number;
  rate: number; // %
  reasoning?: string;
  file?: string;
  diff?: DiffLine[];
  winner?: boolean;
};

type ExperimentDetail = {
  id: string;
  title: string;
  surface: string;
  status: ExperimentStatus;
  hypothesis: string;
  running: string;
  goal: string;
  pr: { number: number; repo: string; branch: string; state: string };
  uplift: number;
  confidence: number;
  totalVisitors: number;
  toSignificance: string;
  variants: Variant[];
};

const experiment: ExperimentDetail = {
  id: "142",
  title: "Pricing emphasis",
  surface: "Paywall",
  status: "RUNNING",
  hypothesis:
    "Leading the paywall with annual savings (vs. the monthly price) reduces price anchoring friction and lifts checkout starts.",
  running: "6d 4h",
  goal: "Checkout started",
  pr: { number: 318, repo: "acme/web", branch: "vela/paywall-annual-emphasis", state: "Open" },
  uplift: 12.4,
  confidence: 95,
  totalVisitors: 3201,
  toSignificance: "~2 days",
  variants: [
    {
      key: "control",
      name: "Control",
      kind: "control",
      split: 50,
      visitors: 1602,
      conversions: 184,
      rate: 11.5,
    },
    {
      key: "B",
      name: "Annual-first",
      kind: "treatment",
      split: 50,
      visitors: 1599,
      conversions: 207,
      rate: 12.9,
      winner: true,
      file: "components/paywall/PlanCard.tsx",
      reasoning:
        "Surface the annual price as the primary number with a 'save 20%' chip, demote the monthly equivalent to a sub-label. This reframes the anchor around yearly value while keeping monthly available, which the hypothesis predicts will raise checkout starts.",
      diff: [
        { type: "meta", text: "components/paywall/PlanCard.tsx" },
        { type: "ctx", text: "   <div className=\"plan-card\">" },
        { type: "ctx", text: "     <h3>{plan.name}</h3>" },
        { type: "del", text: "     <span className=\"price\">${plan.monthly}/mo</span>" },
        { type: "del", text: "     <span className=\"period\">billed monthly</span>" },
        { type: "add", text: "     <span className=\"price\">${plan.annual}/yr</span>" },
        { type: "add", text: "     <Badge tone=\"accent\">Save 20%</Badge>" },
        { type: "add", text: "     <span className=\"period\">${plan.monthly}/mo billed annually</span>" },
        { type: "ctx", text: "     <Button>Start free trial</Button>" },
        { type: "ctx", text: "   </div>" },
      ],
    },
  ],
};

const metrics = [
  {
    label: "Uplift",
    value: `+${experiment.uplift}%`,
    sub: "treatment vs. control",
    accent: true,
    icon: TrendingUp,
  },
  {
    label: "Confidence",
    value: `${experiment.confidence}%`,
    sub: "statistical significance",
    icon: CheckCircle2,
  },
  {
    label: "Visitors",
    value: experiment.totalVisitors.toLocaleString(),
    sub: "in test, both arms",
    icon: Users,
  },
  {
    label: "To significance",
    value: experiment.toSignificance,
    sub: "at current traffic",
    icon: Clock,
  },
];

/* --- diff renderer ---------------------------------------------------- */

function Diff({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-muted/30 font-mono text-xs leading-relaxed">
      {lines.map((line, i) => {
        if (line.type === "meta") {
          return (
            <div
              key={i}
              className="flex items-center gap-2 border-b border-border bg-secondary/60 px-3 py-1.5 text-muted-foreground"
            >
              <GitPullRequest className="size-3.5" />
              {line.text}
            </div>
          );
        }
        const prefix =
          line.type === "add" ? "+" : line.type === "del" ? "−" : " ";
        return (
          <div
            key={i}
            className={cn(
              "whitespace-pre px-3 py-0.5",
              line.type === "add" &&
                "bg-success/10 text-foreground",
              line.type === "del" &&
                "bg-destructive/10 text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "mr-3 select-none",
                line.type === "add" && "text-success",
                line.type === "del" && "text-destructive",
                line.type === "ctx" && "text-muted-foreground/40",
              )}
            >
              {prefix}
            </span>
            {line.text}
          </div>
        );
      })}
    </div>
  );
}

/* --- page ------------------------------------------------------------- */

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params; // mock: same experiment for any id
  const e = experiment;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      {/* breadcrumb / back */}
      <Link
        href="/dashboard/experiments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Experiments
      </Link>

      {/* header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{e.surface}</Badge>
              <StatusBadge status={e.status} />
              <span className="font-mono text-xs text-muted-foreground">
                #{e.id} · running {e.running}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{e.title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {e.hypothesis}
            </p>
          </div>
        </div>

        {/* decision controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">
            <Sparkles className="size-4" />
            Ship winner
          </Button>
          <Button size="sm" variant="outline">
            Extend
          </Button>
          <Button size="sm" variant="outline">
            Abandon
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled
          >
            Roll back
          </Button>
          <div className="ml-auto">
            <Button size="sm" variant="ghost" asChild>
              <a href="#" className="text-muted-foreground">
                <GitPullRequest className="size-4" />
                PR #{e.pr.number}
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* live metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </span>
                  <Icon className="size-4 text-muted-foreground/60" />
                </div>
                <div
                  className={cn(
                    "font-mono text-3xl font-semibold tabular-nums",
                    m.accent && "text-primary",
                  )}
                >
                  {m.value}
                </div>
                <div className="text-xs text-muted-foreground">{m.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* significance progress */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Statistical confidence</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {e.confidence}% / 95% target
            </span>
          </div>
          <MeterBar value={e.confidence} tone="success" />
          <p className="text-xs text-muted-foreground">
            Measuring{" "}
            <span className="font-medium text-foreground">{e.goal}</span>. The
            treatment has crossed the 95% threshold — eligible to ship.
          </p>
        </CardContent>
      </Card>

      {/* variants */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Variants</h2>
          <Badge variant="secondary" className="tabular-nums">
            {e.variants.length}
          </Badge>
        </div>

        {e.variants.map((v) => (
          <Card key={v.key} className={cn(v.winner && "border-primary/40")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-muted-foreground">
                  {v.kind === "control" ? "A" : v.key}
                </span>
                {v.name}
                {v.kind === "control" ? (
                  <Badge variant="secondary">Control</Badge>
                ) : (
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Treatment
                  </Badge>
                )}
                {v.winner && (
                  <Badge className="gap-1 bg-success text-success-foreground">
                    <CheckCircle2 className="size-3" />
                    Leading
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {v.split}% traffic · {v.visitors.toLocaleString()} visitors ·{" "}
                {v.conversions.toLocaleString()} conversions
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* per-variant conversion rate */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    Conv. rate
                  </div>
                  <div className="font-mono text-xl font-semibold tabular-nums">
                    {v.rate}%
                  </div>
                </div>
                <div className="col-span-2 flex flex-col justify-center gap-1.5">
                  <MeterBar
                    value={(v.rate / 15) * 100}
                    tone={v.winner ? "success" : "muted"}
                  />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {v.conversions} / {v.visitors.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* reasoning + diff for treatments */}
              {v.kind === "treatment" && (
                <>
                  <Separator />
                  {v.reasoning && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                        <Sparkles className="size-3.5 text-primary" />
                        Agent reasoning
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {v.reasoning}
                      </p>
                    </div>
                  )}
                  {v.diff && (
                    <div className="space-y-1.5">
                      <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                        Code change
                      </div>
                      <Diff lines={v.diff} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
