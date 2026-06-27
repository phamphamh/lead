"use client";

import * as React from "react";
import {
  Bot,
  Check,
  CircleDot,
  FileSearch,
  GitPullRequest,
  Loader2,
  Pause,
  PencilRuler,
  Play,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
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

/* --- autonomy ---------------------------------------------------------- */

type AutonomyLevel = {
  key: string;
  label: string;
  desc: string;
};

const autonomyLevels: AutonomyLevel[] = [
  {
    key: "review",
    label: "Review-gated",
    desc: "Agent drafts everything; a human approves before any deploy. Safest default.",
  },
  {
    key: "semi",
    label: "Semi-auto",
    desc: "Agent deploys low-risk variants within guardrails; gates ships and rollbacks.",
  },
  {
    key: "auto",
    label: "Autonomous",
    desc: "Agent runs the full loop within guardrails; you're notified, not blocked.",
  },
];

function AutonomyDial() {
  const [level, setLevel] = React.useState("review");
  const active = autonomyLevels.find((l) => l.key === level)!;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-primary" />
          Autonomy
        </CardTitle>
        <CardDescription>
          How much the agent can do before it needs you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* segmented control */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {autonomyLevels.map((l) => (
            <button
              key={l.key}
              type="button"
              onClick={() => setLevel(l.key)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                level === l.key
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{active.desc}</p>
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
          <CircleDot className="size-3.5 text-success" />
          <span className="text-xs text-muted-foreground">
            Guardrails: max 3 concurrent experiments · no pricing changes &gt;
            20% · auto-rollback on −5% regression.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* --- work queue -------------------------------------------------------- */

type QueueItem = {
  task: string;
  surface: string;
  state: "running" | "queued";
  icon: LucideIcon;
  detail: string;
};

const queue: QueueItem[] = [
  {
    task: "Drafting variant",
    surface: "Paywall",
    state: "running",
    icon: PencilRuler,
    detail: "Annual plan default · writing PlanCard.tsx diff",
  },
  {
    task: "Analyzing surface",
    surface: "Landing",
    state: "running",
    icon: FileSearch,
    detail: "Re-scan after last deploy · 60% complete",
  },
  {
    task: "Opening PR",
    surface: "Onboarding",
    state: "queued",
    icon: GitPullRequest,
    detail: "Shorter signup · waiting on draft approval",
  },
];

/* --- run history ------------------------------------------------------- */

type Run = {
  id: string;
  title: string;
  kind: "analyze" | "draft" | "deploy" | "evaluate";
  status: "success" | "running";
  duration: string;
  when: string;
  summary: string;
};

const runs: Run[] = [
  {
    id: "run_8f21",
    title: "Evaluate onboarding experiment",
    kind: "evaluate",
    status: "success",
    duration: "9s",
    when: "12m ago",
    summary: "Reached 98% confidence on #139; flagged for ship decision.",
  },
  {
    id: "run_8f1a",
    title: "Draft paywall variant",
    kind: "draft",
    status: "running",
    duration: "—",
    when: "now",
    summary: "Writing annual-emphasis diff for components/paywall/PlanCard.tsx.",
  },
  {
    id: "run_8e93",
    title: "Open PR #318 on acme/web",
    kind: "deploy",
    status: "success",
    duration: "23s",
    when: "2h ago",
    summary: "Branch lead/paywall-annual-emphasis pushed; flag wired via SDK.",
  },
  {
    id: "run_8e44",
    title: "Analyze landing page",
    kind: "analyze",
    status: "success",
    duration: "1m 14s",
    when: "3h ago",
    summary: "Found 3 opportunities; CTA-above-fold ranked highest (score 86).",
  },
  {
    id: "run_8d70",
    title: "Start experiment #142",
    kind: "deploy",
    status: "success",
    duration: "31s",
    when: "6d ago",
    summary: "Pricing-emphasis test live at 50/50 split.",
  },
];

const kindMeta: Record<Run["kind"], { label: string; icon: LucideIcon }> = {
  analyze: { label: "Analyze", icon: FileSearch },
  draft: { label: "Draft", icon: PencilRuler },
  deploy: { label: "Deploy", icon: GitPullRequest },
  evaluate: { label: "Evaluate", icon: Sparkles },
};

/* --- page -------------------------------------------------------------- */

export default function AgentPage() {
  const [paused, setPaused] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Bot className="size-6 text-primary" />
            Agent
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The orchestrator running the optimization loop on{" "}
            <span className="font-mono">acme/web</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "gap-1.5",
              paused
                ? "bg-secondary text-secondary-foreground"
                : "bg-success text-success-foreground",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full bg-current",
                !paused && "animate-pulse",
              )}
            />
            {paused ? "Paused" : "Active"}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? (
              <>
                <Play className="size-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="size-4" />
                Pause
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* left column: autonomy + queue */}
        <div className="space-y-6 lg:col-span-1">
          <AutonomyDial />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Work queue</CardTitle>
              <CardDescription>What the agent is doing now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {queue.map((q) => {
                const Icon = q.icon;
                return (
                  <div
                    key={q.task + q.surface}
                    className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{q.task}</span>
                        <Badge variant="outline" className="font-normal">
                          {q.surface}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{q.detail}</p>
                    </div>
                    {q.state === "running" ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        queued
                      </span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* right column: run history */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Run history</CardTitle>
            <CardDescription>
              Chronological log of orchestrator runs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {runs.map((r, i) => {
                const meta = kindMeta[r.kind];
                const Icon = meta.icon;
                const isLast = i === runs.length - 1;
                return (
                  <div key={r.id} className="flex gap-3.5">
                    {/* timeline rail */}
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full border",
                          r.status === "running"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-secondary text-muted-foreground",
                        )}
                      >
                        {r.status === "running" ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Icon className="size-3.5" />
                        )}
                      </span>
                      {!isLast && (
                        <span className="w-px flex-1 bg-border" />
                      )}
                    </div>

                    {/* content */}
                    <div className="min-w-0 flex-1 pb-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{r.title}</span>
                        <Badge variant="secondary" className="font-normal">
                          {meta.label}
                        </Badge>
                        {r.status === "success" && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-success">
                            <Check className="size-3" />
                            {r.duration}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.summary}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground/70">
                        <span>{r.id}</span>
                        <span>·</span>
                        <span>{r.when}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
