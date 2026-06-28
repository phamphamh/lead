"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { AuditStep } from "@/components/onboarding/audit-step";
import { ConnectStep } from "@/components/onboarding/connect-step";
import { DEMO_REPO, type Repo } from "@/components/onboarding/data";
import { ReportStep } from "@/components/onboarding/report-step";
import { RepoStep } from "@/components/onboarding/repo-step";
import { Stepper, type StepKey } from "@/components/onboarding/stepper";
import { type AuditResult } from "@/lib/agents/types";
import { useSession } from "@/lib/auth-client";

export default function OnboardingPage() {
  const { isPending } = useSession();
  // After the GitHub OAuth round-trip we return to `/onboarding?step=repo`; honor
  // that query param so the user lands on repo selection. Any plain visit starts
  // at Connect — even when a session already exists — so the visitor explicitly
  // confirms (or switches) which GitHub account is plugged in, instead of a stale
  // cookie silently reconnecting the previous user's account.
  const [step, setStep] = React.useState<StepKey | null>(() => {
    if (typeof window === "undefined") return null;
    const s = new URLSearchParams(window.location.search).get("step");
    return s === "repo" || s === "audit" || s === "report"
      ? (s as StepKey)
      : null;
  });
  const [repo, setRepo] = React.useState<Repo | null>(null);
  const [audit, setAudit] = React.useState<AuditResult | null>(null);
  // "Try it on our landing": run the audit/launch on Vela's own repo with NO
  // GitHub login — the server acts as the repo owner (see /api/demo/*).
  const [demo, setDemo] = React.useState(false);

  const startDemo = React.useCallback(() => {
    setDemo(true);
    setRepo(DEMO_REPO);
    setStep("audit");
  }, []);

  const current = step ?? (isPending ? null : "connect");

  if (current === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-4xl flex-1 flex-col items-center gap-8">
      <Stepper current={current} />

      <div className="flex w-full flex-1 justify-center">
        {current === "connect" && (
          <ConnectStep
            onContinue={() => setStep("repo")}
            onDemo={startDemo}
          />
        )}

        {current === "repo" && (
          <RepoStep
            onBack={() => setStep("connect")}
            onDemo={startDemo}
            onSelect={(r) => {
              setRepo(r);
              setStep("audit");
            }}
          />
        )}

        {current === "audit" && repo && (
          <AuditStep
            repoFullName={repo.name}
            demo={demo}
            onComplete={(result) => {
              setAudit(result);
              setStep("report");
            }}
          />
        )}

        {current === "report" && repo && audit && (
          <ReportStep repoName={repo.name} audit={audit} demo={demo} />
        )}
      </div>
    </div>
  );
}
