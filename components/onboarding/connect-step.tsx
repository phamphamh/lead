"use client";

import * as React from "react";
import {
  ArrowRight,
  Eye,
  GitPullRequest,
  Loader2,
  Lock,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import { authClient, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const guarantees = [
  {
    icon: Eye,
    title: "Read-only audit first",
    desc: "We analyze your landing, onboarding, and paywall surfaces — nothing is changed without you.",
  },
  {
    icon: GitPullRequest,
    title: "Every change is a reviewable PR",
    desc: "Variants ship as real pull requests behind a feature flag. Your CI deploys them.",
  },
  {
    icon: ShieldCheck,
    title: "Review-gated by default",
    desc: "The agent drafts; a human approves before anything goes live.",
  },
];

export function ConnectStep({
  onContinue,
  onDemo,
}: {
  onContinue: () => void;
  onDemo: () => void;
}) {
  const { data: session } = useSession();
  const [connecting, setConnecting] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState(false);
  const user = session?.user;

  function tryDemo() {
    // No GitHub login required: the demo runs server-side as the repo owner.
    setDemoLoading(true);
    onDemo();
  }

  async function connect() {
    setConnecting(true);
    try {
      // Full-page redirect to GitHub, returning to the repo step authenticated.
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/onboarding?step=repo",
      });
    } catch {
      setConnecting(false);
    }
  }

  async function switchAccount() {
    setSwitching(true);
    try {
      // Clear the current Better Auth session, then restart GitHub OAuth so a
      // different account can be plugged in — otherwise a stale cookie silently
      // reconnects the previous user's GitHub.
      await signOut();
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/onboarding?step=repo",
      });
    } catch {
      setSwitching(false);
    }
  }

  return (
    <div className="w-full max-w-lg space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Connect your repository
        </h1>
        <p className="text-sm text-muted-foreground">
          Vela reads your codebase to find and ship higher-converting landing
          pages, onboarding, and paywalls — automatically.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-left">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium uppercase">
                  {(user.name ?? user.email ?? "?").slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {user.name ?? "Signed in"}
                  </div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={onContinue}>
                Continue as {user.name ?? "this account"}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={switchAccount}
                disabled={switching}
              >
                {switching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Switching account…
                  </>
                ) : (
                  "Use a different GitHub account"
                )}
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={connect}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <GithubMark className="size-4" />
                  Continue with GitHub
                </>
              )}
            </Button>
          )}

          {/* No public landing of your own? See it on Vela's own landing. */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={tryDemo}
            disabled={demoLoading || connecting || switching}
            className="flex w-full items-center gap-3 rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-accent/50 disabled:opacity-60"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
              {demoLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Rocket className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                No GitHub? Try it on our landing
              </div>
              <div className="text-xs text-muted-foreground">
                Run a real audit + A/B test on Vela&apos;s own landing — no login
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </button>

          <div className="space-y-3.5 text-left">
            {guarantees.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{g.title}</div>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 font-mono text-xs text-muted-foreground">
        <Lock className="size-3" />
        We request access to read your repositories so the agent can analyze
        your surfaces.
      </p>
    </div>
  );
}
