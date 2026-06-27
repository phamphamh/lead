import Controls from "@/components/Controls";
import ReasoningLog from "@/components/ReasoningLog";
import VariantGrid from "@/components/VariantGrid";

// Dashboard. All live data comes through client components hitting the API.
export const dynamic = "force-dynamic";

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Title bar */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <h1 className="text-sm font-semibold tracking-tight sm:text-base">
            Growth Agent
            <span className="font-normal text-neutral-500"> — console</span>
          </h1>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="ml-auto rounded-md px-2 py-1 text-[11px] font-mono uppercase tracking-widest text-neutral-400 ring-1 ring-neutral-800 hover:text-neutral-200"
          >
            Landing en ligne ↗
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-5 py-6">
        {/* What this is — plain language */}
        <section className="mb-6 rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-neutral-900/20 p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Un agent qui optimise ta landing tout seul.
          </h2>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-neutral-400">
            Objectif :{" "}
            <span className="text-emerald-300">maximiser les leads qualifiés</span>, pas juste
            les clics. À chaque pas, l’agent lit les chiffres, écrit une nouvelle version de la
            page, et la garde seulement si elle vend mieux en aval. Une version qui fait plus de
            clics mais moins de vrais leads, il la <span className="text-red-300">refuse</span>.
          </p>
          <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500">
            <li>
              <span className="font-mono text-neutral-400">1.</span> Avancer l’agent → il crée /
              ajuste une version
            </li>
            <li>
              <span className="font-mono text-neutral-400">2.</span> Chaque version a son lien
              partageable
            </li>
            <li>
              <span className="font-mono text-neutral-400">3.</span> Envoie la meilleure à ton
              client
            </li>
          </ol>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Controls column */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Controls />
          </aside>

          {/* Gallery + decisions */}
          <section className="flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-baseline gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  Les versions générées
                </h3>
                <span className="text-[11px] text-neutral-600">
                  clique « Voir » pour ouvrir, « Partager » pour le lien client
                </span>
              </div>
              <VariantGrid />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">
                Journal des décisions de l’agent
              </h3>
              <ReasoningLog />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
