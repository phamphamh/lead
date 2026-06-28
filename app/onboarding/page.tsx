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
  const { data: session, isPending } = useSession();
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

  // "Try it on our landing" path: connect Vela's own public repo and jump
  // straight to the audit, skipping repo selection. Set when the user picks the
  // demo on Connect — either inline (already signed in) or via the OAuth return
  // to `/onboarding?demo=1`.
  const [demoMode, setDemoMode] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("demo") === "1";
  });
  const demoTriggered = React.useRef(false);

  const connectDemo = React.useCallback(async () => {
    if (demoTriggered.current) return;
    demoTriggered.current = true;
    setDemoMode(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoFullName: DEMO_REPO.name,
          repoUrl: DEMO_REPO.url,
          defaultBranch: DEMO_REPO.defaultBranch,
          private: DEMO_REPO.private,
        }),
      });
      if (!res.ok) throw new Error("demo connect failed");
      setRepo(DEMO_REPO);
      setStep("audit");
    } catch {
      // Fall back to the normal Connect screen so the user can retry.
      demoTriggered.current = false;
      setDemoMode(false);
      setStep("connect");
    }
  }, []);

  // Auto-run the demo connect when we return from OAuth with `?demo=1`.
  React.useEffect(() => {
    if (isPending || !session || !demoMode || demoTriggered.current) return;
    void connectDemo();
  }, [isPending, session, demoMode, connectDemo]);

  const current = step ?? (isPending ? null : "connect");
  // While the demo project is being connected, show a loader instead of flashing
  // the Connect screen.
  const showLoader =
    current === null ||
    (demoMode && step !== "audit" && step !== "report");

  if (showLoader) {
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
            onDemo={connectDemo}
          />
        )}

        {current === "repo" && (
          <RepoStep
            onBack={() => setStep("connect")}
            onSelect={(r) => {
              setRepo(r);
              setStep("audit");
            }}
          />
        )}

        {current === "audit" && repo && (
          <AuditStep
            repoFullName={repo.name}
            onComplete={(result) => {
              setAudit(result);
              setStep("report");
            }}
          />
        )}

        {current === "report" && repo && audit && (
          <ReportStep repoName={repo.name} audit={audit} />
        )}
      </div>
    </div>
  );
}
