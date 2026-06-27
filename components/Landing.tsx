"use client";

import { useEffect, useRef, useState } from "react";
import type { ConfigJson, EventType } from "@/lib/contract";
import { getSessionId } from "@/lib/session";
import HeroVariants from "@/components/HeroVariants";

interface LandingProps {
  config: ConfigJson;
  configId: string | null;
  utmSource?: string;
  utmTerm?: string;
}

export default function Landing({ config, configId, utmSource, utmTerm }: LandingProps) {
  const formRef = useRef<HTMLDivElement | null>(null);
  const viewFired = useRef(false);

  const [ctaPosting, setCtaPosting] = useState(false);
  const [formPosting, setFormPosting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fire exactly one "view" event on mount (server also dedups per session).
  useEffect(() => {
    if (viewFired.current) return;
    viewFired.current = true;
    void postEvent("view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postEvent(type: EventType): Promise<void> {
    if (!configId) return; // no real config (DB unreachable) — nothing to attribute to.
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          configId,
          sessionId: getSessionId(),
          ...(utmSource ? { utmSource } : {}),
          ...(utmTerm ? { utmTerm } : {}),
        }),
        keepalive: true,
      });
    } catch {
      // Never block the UI on telemetry failures.
    }
  }

  async function handleCta() {
    if (ctaPosting) return;
    setCtaPosting(true);
    try {
      await postEvent("click_cta");
    } finally {
      setCtaPosting(false);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (formPosting) return;
    setFormPosting(true);
    try {
      await postEvent("form_qualified");
      setSubmitted(true);
    } finally {
      setFormPosting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600" />
            <span className="text-sm font-semibold tracking-tight">Cadence</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <span className="cursor-default hover:text-slate-900">Product</span>
            <span className="cursor-default hover:text-slate-900">Customers</span>
            <span className="cursor-default hover:text-slate-900">Pricing</span>
            <span className="cursor-default hover:text-slate-900">Docs</span>
          </nav>
          <button
            onClick={handleCta}
            disabled={ctaPosting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-60"
            style={{ backgroundColor: config.ctaColor }}
          >
            {config.ctaText}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <HeroVariants
          variant={config.heroVariant}
          headline={config.headline}
          sousTitre={config.sousTitre}
        />

        {/* Primary CTA below hero */}
        <div className="mx-auto -mt-6 flex w-full max-w-6xl flex-col items-center gap-3 px-6 pb-10 md:flex-row md:items-center md:justify-center">
          <button
            onClick={handleCta}
            disabled={ctaPosting}
            className="inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
            style={{ backgroundColor: config.ctaColor }}
          >
            {ctaPosting ? "One sec…" : config.ctaText}
          </button>
          <span className="text-sm text-slate-500">No credit card required · 14-day pilot</span>
        </div>

        {/* Logo strip */}
        <div className="border-y border-slate-100 bg-slate-50/60">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-8 text-sm font-semibold text-slate-400">
            <span>NORTHWIND</span>
            <span>Arclight</span>
            <span>VECTORA</span>
            <span>Brightpath</span>
            <span>Helio</span>
            <span>Forma</span>
          </div>
        </div>

        {/* Feature grid */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Pipeline that updates itself",
                body: "Cadence watches every signal across your CRM and product, then keeps each opportunity scored and stage-accurate without a single manual update.",
              },
              {
                title: "Forecasts you can defend",
                body: "Roll-ups your board trusts. We surface the deals that move the number and flag the ones quietly slipping before quarter-end.",
              },
              {
                title: "Plays that run themselves",
                body: "Define the motion once. Cadence triggers the right outreach, hand-off, or task the moment a deal qualifies — at any hour.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <div className="h-4 w-4 rounded-sm bg-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quote */}
        <section className="mx-auto w-full max-w-3xl px-6 pb-20 text-center">
          <blockquote className="text-xl font-medium leading-9 text-slate-800 md:text-2xl">
            “We cut forecast prep from two days to twenty minutes. Cadence pays for itself in the
            first month.”
          </blockquote>
          <p className="mt-4 text-sm text-slate-500">
            Dana Whitfield · VP Revenue Operations, Arclight
          </p>
        </section>

        {/* Qualification form */}
        <section
          ref={formRef}
          className="scroll-mt-24 border-t border-slate-100 bg-slate-50"
        >
          <div className="mx-auto w-full max-w-xl px-6 py-20">
            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                  ✓
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">You’re on the list</h2>
                <p className="mt-2 text-slate-600">
                  Thanks — a member of our team will reach out within one business day to schedule
                  your pilot.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Book your pilot
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Tell us a little about your team and we’ll tailor the demo.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Work email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company" className="text-sm font-medium text-slate-700">
                      Company
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      placeholder="Acme Inc."
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="budget" className="text-sm font-medium text-slate-700">
                      Annual budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      required
                      defaultValue=""
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="" disabled>
                        Select a range
                      </option>
                      <option value="<5k">&lt;5k</option>
                      <option value="5-20k">5-20k</option>
                      <option value=">20k">&gt;20k</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="intention" className="text-sm font-medium text-slate-700">
                      What are you hoping to solve?
                    </label>
                    <textarea
                      id="intention"
                      name="intention"
                      rows={4}
                      placeholder="We’re trying to tighten our forecast accuracy ahead of Q4…"
                      className="resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formPosting}
                    className="mt-2 inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: config.ctaColor }}
                  >
                    {formPosting ? "Submitting…" : "Request my pilot"}
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    By submitting you agree to be contacted about Cadence. No spam.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-slate-400 md:flex-row">
          <span>© {new Date().getFullYear()} Cadence Labs, Inc.</span>
          <span>Privacy · Terms · Security</span>
        </div>
      </footer>
    </div>
  );
}
