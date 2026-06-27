import type { HeroVariant } from "@/lib/contract";

interface HeroVariantsProps {
  variant: HeroVariant;
  headline: string;
  sousTitre: string;
}

// Three visually distinct, pre-coded hero layouts. The agent only swaps `variant`.
export default function HeroVariants({ variant, headline, sousTitre }: HeroVariantsProps) {
  if (variant === "B") {
    // B: left text / right placeholder visual
    return (
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Now in private beta
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
            {headline}
          </h1>
          <p className="max-w-md text-lg leading-8 text-slate-600">{sousTitre}</p>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-slate-100 shadow-sm">
            <div className="flex h-full flex-col gap-3 p-6">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="grid flex-1 grid-cols-3 gap-3">
                <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-100" />
                <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-100" />
                <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-100" />
              </div>
              <div className="h-24 rounded-lg bg-white shadow-sm ring-1 ring-slate-100" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "C") {
    // C: minimal with eyebrow label
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-24 md:py-32">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Autonomous revenue ops
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
          {headline}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{sousTitre}</p>
        <div className="mt-8 h-px w-full bg-slate-200" />
      </section>
    );
  }

  // A: centered big headline (default)
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 text-center md:py-32">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
        Trusted by 120+ revenue teams
      </span>
      <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
        {headline}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">{sousTitre}</p>
    </section>
  );
}
