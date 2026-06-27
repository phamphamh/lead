"use client";

import * as React from "react";
import {
  AlertTriangle,
  CreditCard,
  LayoutTemplate,
  Route,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { MeterBar } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* --- mock data -------------------------------------------------------- */

type Impact = "High" | "Medium" | "Low";

type Opportunity = {
  title: string;
  rationale: string;
  impact: Impact;
  score: number; // 0–100 expected impact
  effort: "S" | "M" | "L";
};

type SurfaceData = {
  key: string;
  name: string;
  icon: LucideIcon;
  route: string;
  convRate: number;
  convTrend: number;
  activeExperiments: number;
  lastAnalyzed: string;
  issues: { text: string; severity: "high" | "med" }[];
  opportunities: Opportunity[];
};

const surfaces: SurfaceData[] = [
  {
    key: "landing",
    name: "Landing",
    icon: LayoutTemplate,
    route: "app/(marketing)/page.tsx",
    convRate: 4.2,
    convTrend: 0.6,
    activeExperiments: 2,
    lastAnalyzed: "3h ago",
    issues: [
      { text: "Hero CTA below the fold on mobile (≥40% of traffic).", severity: "high" },
      { text: "No social proof within the first viewport.", severity: "med" },
      { text: "Headline is feature-led, not outcome-led.", severity: "med" },
    ],
    opportunities: [
      {
        title: "Move primary CTA above the fold on mobile",
        rationale: "44% of sessions never scroll to the current CTA position.",
        impact: "High",
        score: 86,
        effort: "S",
      },
      {
        title: "Add logo strip + customer count near hero",
        rationale: "Trust signals at first paint reduce bounce on cold traffic.",
        impact: "High",
        score: 78,
        effort: "S",
      },
      {
        title: "Rewrite headline around the core outcome",
        rationale: "Outcome-led copy historically beats feature-led on signups.",
        impact: "Medium",
        score: 61,
        effort: "M",
      },
    ],
  },
  {
    key: "onboarding",
    name: "Onboarding",
    icon: Route,
    route: "app/(app)/onboarding/*",
    convRate: 38.0,
    convTrend: 2.1,
    activeExperiments: 1,
    lastAnalyzed: "3h ago",
    issues: [
      { text: "Signup form asks for 6 fields before any value is shown.", severity: "high" },
      { text: "No progress indication across the 4-step flow.", severity: "med" },
    ],
    opportunities: [
      {
        title: "Reduce signup to email-only, defer the rest",
        rationale: "Each removed field on step 1 compounds activation.",
        impact: "High",
        score: 82,
        effort: "M",
      },
      {
        title: "Add a step progress checklist",
        rationale: "Visible progress lifts completion on multi-step flows.",
        impact: "Medium",
        score: 64,
        effort: "S",
      },
      {
        title: "Show a sample workspace before account creation",
        rationale: "Demonstrating value pre-signup lowers abandonment.",
        impact: "Medium",
        score: 55,
        effort: "L",
      },
    ],
  },
  {
    key: "paywall",
    name: "Paywall",
    icon: CreditCard,
    route: "components/paywall/*",
    convRate: 11.8,
    convTrend: 1.4,
    activeExperiments: 2,
    lastAnalyzed: "1h ago",
    issues: [
      { text: "Monthly price anchors higher than annual-equivalent.", severity: "med" },
      { text: "No risk-reversal (guarantee / cancel-anytime) near CTA.", severity: "med" },
    ],
    opportunities: [
      {
        title: "Default to annual with a savings chip",
        rationale: "Reframes the anchor around yearly value; lifts checkout starts.",
        impact: "High",
        score: 80,
        effort: "S",
      },
      {
        title: "Add 'cancel anytime' microcopy under the CTA",
        rationale: "Risk-reversal reduces checkout hesitation.",
        impact: "Medium",
        score: 58,
        effort: "S",
      },
      {
        title: "Collapse to 2 plans on the paywall",
        rationale: "Fewer options reduce choice paralysis at the decision point.",
        impact: "Low",
        score: 41,
        effort: "M",
      },
    ],
  },
];

/* --- helpers ---------------------------------------------------------- */

const impactTone: Record<Impact, string> = {
  High: "border-primary/40 text-primary",
  Medium: "border-chart-2/50 text-foreground",
  Low: "text-muted-foreground",
};

function SurfacePanel({ s }: { s: SurfaceData }) {
  return (
    <div className="space-y-6">
      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Conversion rate
            </div>
            <div className="font-mono text-3xl font-semibold tabular-nums">
              {s.convRate}%
            </div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="size-3.5" />+{s.convTrend}% vs. last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Active experiments
            </div>
            <div className="font-mono text-3xl font-semibold tabular-nums">
              {s.activeExperiments}
            </div>
            <div className="text-xs text-muted-foreground">
              on this surface
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Source
            </div>
            <div className="truncate pt-1 font-mono text-sm">{s.route}</div>
            <div className="text-xs text-muted-foreground">
              analyzed {s.lastAnalyzed}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* detected issues */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Detected issues</CardTitle>
            <CardDescription>
              What the agent flagged on the last scan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {s.issues.map((issue) => (
              <div key={issue.text} className="flex items-start gap-2.5">
                <AlertTriangle
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    issue.severity === "high"
                      ? "text-destructive"
                      : "text-chart-2",
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {issue.text}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* opportunity backlog */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Opportunity backlog</CardTitle>
            <CardDescription>
              Agent-proposed improvements, ranked by expected impact.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {s.opportunities.map((o, i) => (
              <div
                key={o.title}
                className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <span className="mt-0.5 font-mono text-xs text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{o.title}</span>
                    <Badge
                      variant="outline"
                      className={cn("font-normal", impactTone[o.impact])}
                    >
                      {o.impact} impact
                    </Badge>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      effort {o.effort}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.rationale}</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <MeterBar value={o.score} className="max-w-[140px]" />
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {o.score}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  <Sparkles className="size-3.5" />
                  Draft
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* --- page ------------------------------------------------------------- */

export default function SurfacesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Surfaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conversion surfaces the agent monitors, with ranked opportunities.
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Sparkles className="size-4" />
          Re-scan surfaces
        </Button>
      </div>

      <Tabs defaultValue="landing" className="gap-6">
        <TabsList>
          {surfaces.map((s) => {
            const Icon = s.icon;
            return (
              <TabsTrigger key={s.key} value={s.key} className="gap-1.5">
                <Icon className="size-4" />
                {s.name}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {surfaces.map((s) => (
          <TabsContent key={s.key} value={s.key}>
            <SurfacePanel s={s} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
