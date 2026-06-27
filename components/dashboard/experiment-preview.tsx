"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  GitBranch,
  Lock,
  TrendingUp,
} from "lucide-react";

import {
  StatusBadge,
  type ExperimentStatus,
} from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* --- preview mock data models ----------------------------------------- */

type PaywallProps = {
  plan: string;
  price: string;
  period: string;
  badge?: string;
  subnote?: string;
  cta: string;
};

type SignupProps = {
  fields: string[];
  cta: string;
  note?: string;
};

type HeroProps = {
  headline: string;
  sub: string;
  cta: string;
  proof?: string;
};

type Preview =
  | { kind: "paywall"; url: string; before: PaywallProps; after: PaywallProps }
  | { kind: "onboarding"; url: string; before: SignupProps; after: SignupProps }
  | { kind: "landing"; url: string; before: HeroProps; after: HeroProps };

export type ActiveExperiment = {
  id: string;
  surface: string;
  title: string;
  status: ExperimentStatus;
  hypothesis: string;
  uplift: string;
  confidence: string;
  visitors: string;
  preview: Preview;
};

/* --- shared chrome ----------------------------------------------------- */

function BrowserFrame({
  url,
  tone,
  children,
}: {
  url: string;
  tone: "control" | "variant";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background shadow-xs",
        tone === "variant" ? "border-primary/40" : "border-border",
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-2.5 py-1.5">
        <span className="size-2 rounded-full bg-muted-foreground/25" />
        <span className="size-2 rounded-full bg-muted-foreground/25" />
        <span className="size-2 rounded-full bg-muted-foreground/25" />
        <span className="ml-1.5 truncate font-mono text-[10px] text-muted-foreground">
          {url}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* --- surface mocks ----------------------------------------------------- */

function PaywallMock({ data }: { data: PaywallProps }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border p-3.5">
        <div className="text-xs font-medium text-muted-foreground">
          {data.plan}
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tabular-nums">
            {data.price}
          </span>
          <span className="text-xs text-muted-foreground">{data.period}</span>
        </div>
        {data.badge && (
          <Badge className="mt-2 bg-primary/15 text-primary">
            {data.badge}
          </Badge>
        )}
        {data.subnote && (
          <div className="mt-1.5 text-[11px] text-muted-foreground">
            {data.subnote}
          </div>
        )}
        <div className="mt-3 flex h-8 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">
          {data.cta}
        </div>
      </div>
    </div>
  );
}

function SignupMock({ data }: { data: SignupProps }) {
  return (
    <div className="space-y-2.5">
      {data.fields.map((f) => (
        <div key={f} className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground">
            {f}
          </div>
          <div className="h-7 rounded-md border border-border bg-muted/30" />
        </div>
      ))}
      <div className="mt-1 flex h-8 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">
        {data.cta}
      </div>
      {data.note && (
        <div className="text-center text-[10px] text-muted-foreground">
          {data.note}
        </div>
      )}
    </div>
  );
}

function HeroMock({ data }: { data: HeroProps }) {
  return (
    <div className="space-y-2.5 py-1 text-center">
      <div className="text-sm font-semibold leading-snug tracking-tight">
        {data.headline}
      </div>
      <div className="text-[11px] leading-relaxed text-muted-foreground">
        {data.sub}
      </div>
      <div className="flex justify-center pt-1">
        <div className="flex h-7 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground">
          {data.cta}
        </div>
      </div>
      {data.proof && (
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
          <span className="flex -space-x-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-3 rounded-full border border-background bg-chart-2/60"
              />
            ))}
          </span>
          {data.proof}
        </div>
      )}
    </div>
  );
}

function renderMock(kind: Preview["kind"], data: unknown) {
  if (kind === "paywall") return <PaywallMock data={data as PaywallProps} />;
  if (kind === "onboarding") return <SignupMock data={data as SignupProps} />;
  return <HeroMock data={data as HeroProps} />;
}

/* --- before / after ---------------------------------------------------- */

function BeforeAfter({ preview }: { preview: Preview }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Control
          </span>
          <Badge variant="secondary" className="font-normal">
            A
          </Badge>
        </div>
        <BrowserFrame url={preview.url} tone="control">
          {renderMock(preview.kind, preview.before)}
        </BrowserFrame>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wide text-primary">
            Variant
          </span>
          <Badge
            variant="outline"
            className="border-primary/40 font-normal text-primary"
          >
            B
          </Badge>
        </div>
        <BrowserFrame url={preview.url} tone="variant">
          {renderMock(preview.kind, preview.after)}
        </BrowserFrame>
      </div>
    </div>
  );
}

/* --- preview sheet ----------------------------------------------------- */

function PreviewSheet({
  experiment,
  open,
  onOpenChange,
}: {
  experiment: ActiveExperiment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 !max-w-none sm:w-[44rem]"
      >
        {experiment && (
          <>
            <SheetHeader className="gap-3 border-b border-border p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{experiment.surface}</Badge>
                <StatusBadge status={experiment.status} />
                <span className="font-mono text-xs text-muted-foreground">
                  #{experiment.id}
                </span>
              </div>
              <SheetTitle className="text-lg">{experiment.title}</SheetTitle>
              <SheetDescription className="leading-relaxed">
                {experiment.hypothesis}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 p-5">
              {/* quick metrics */}
              <div className="grid grid-cols-3 gap-3">
                <Stat
                  label="Uplift"
                  value={experiment.uplift}
                  accent={experiment.uplift.startsWith("+")}
                  icon={TrendingUp}
                />
                <Stat label="Confidence" value={experiment.confidence} />
                <Stat label="Visitors" value={experiment.visitors} />
              </div>

              {/* before / after */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Change preview</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    rendered mock
                  </span>
                </div>
                <BeforeAfter preview={experiment.preview} />
              </div>

              {/* footer actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
                {experiment.status === "CONCLUSIVE" ? (
                  <Button size="sm">
                    <CheckCircle2 className="size-4" />
                    Ship winner
                  </Button>
                ) : experiment.status === "DRAFT" ? (
                  <Button size="sm">
                    <Check className="size-4" />
                    Approve
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    <Lock className="size-3.5" />
                    Running
                  </Button>
                )}
                <Button size="sm" variant="ghost" asChild>
                  <Link
                    href={`/dashboard/experiments/${experiment.id}`}
                    className="text-muted-foreground"
                  >
                    View full experiment
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon?: typeof TrendingUp;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 flex items-center gap-1 font-mono text-lg font-semibold tabular-nums",
          accent && "text-primary",
        )}
      >
        {accent && Icon && <Icon className="size-4" />}
        {value}
      </div>
    </div>
  );
}

/* --- active experiments table (the clickable surface) ----------------- */

export function ActiveExperiments({ data }: { data: ActiveExperiment[] }) {
  const [selected, setSelected] = React.useState<ActiveExperiment | null>(null);
  const [open, setOpen] = React.useState(false);

  function openPreview(e: ActiveExperiment) {
    setSelected(e);
    setOpen(true);
  }

  return (
    <>
      {/* column headers */}
      <div className="hidden grid-cols-12 gap-3 border-b border-border pb-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground sm:grid">
        <div className="col-span-5">Experiment</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Uplift</div>
        <div className="col-span-2 text-right">Confidence</div>
        <div className="col-span-1 text-right">Visitors</div>
      </div>
      <div className="divide-y divide-border">
        {data.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => openPreview(e)}
            className="group grid w-full grid-cols-2 items-center gap-3 py-3 text-left transition-colors hover:bg-accent/50 sm:grid-cols-12"
          >
            <div className="col-span-2 flex items-center gap-2.5 sm:col-span-5">
              <GitBranch className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {e.title}
                  </span>
                  <Eye className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {e.surface}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <StatusBadge status={e.status} />
            </div>
            <div
              className={cn(
                "text-right font-mono text-sm tabular-nums sm:col-span-2",
                e.uplift.startsWith("+") && "text-primary",
              )}
            >
              {e.uplift !== "—" && (
                <TrendingUp className="mr-1 inline size-3.5 align-[-2px]" />
              )}
              {e.uplift}
            </div>
            <div className="hidden text-right font-mono text-sm tabular-nums text-muted-foreground sm:col-span-2 sm:block">
              {e.confidence}
            </div>
            <div className="hidden text-right font-mono text-sm tabular-nums text-muted-foreground sm:col-span-1 sm:block">
              {e.visitors}
            </div>
          </button>
        ))}
      </div>

      <PreviewSheet
        experiment={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
