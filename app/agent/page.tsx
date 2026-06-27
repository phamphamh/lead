import Dashboard from "@/components/Dashboard";
import Controls from "@/components/Controls";
import ReasoningLog from "@/components/ReasoningLog";

// This page reads live state through client components that hit the API.
// Force dynamic so the build never tries to prerender against a placeholder DB.
export const dynamic = "force-dynamic";

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Title bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-[1600px] px-5 py-3 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <h1 className="text-sm sm:text-base font-semibold tracking-tight">
            Growth Agent
            <span className="text-neutral-500 font-normal"> — autonomous CRO</span>
          </h1>
          <span className="ml-auto text-[11px] font-mono uppercase tracking-widest text-neutral-500">
            /agent
          </span>
        </div>
      </header>

      {/* Split screen */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* LEFT — live preview + dashboard */}
          <section className="flex flex-col gap-5">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                  Live preview — landing
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
                  <span className="h-2 w-2 rounded-full bg-red-500/70" />
                  <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                </span>
              </div>
              <div className="relative bg-white">
                <iframe
                  src="/"
                  title="Aperçu live de la landing"
                  className="h-[420px] w-full border-0"
                />
              </div>
            </div>
            <Dashboard />
          </section>

          {/* RIGHT — controls + reasoning log (the star) */}
          <section className="flex flex-col gap-5">
            <Controls />
            <ReasoningLog />
          </section>
        </div>
      </main>
    </div>
  );
}
