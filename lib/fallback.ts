import type { ConfigJson } from "@/lib/contract";

// FALLBACK_RUN — the pre-recorded, scripted demo narrative (stage safety net).
//
// Story (read top to bottom):
//  0. BASELINE  — a credible human-written landing page (clair, honnête).
//  1. The agent SHIPS a "trap" clickbait variant: the proximal metric (clics)
//     is expected to jump, so the agent takes the bet.
//  2. Accelerated data comes back: proximal UP (+18 pts de clic) but downstream
//     DOWN (-9 pts de formulaires qualifiés) — the clickbait pulls in unqualified
//     traffic. The agent REJECTS its own ship and REVERTS to the baseline.
//  3. The agent then SHIPS a genuinely better, downstream-focused variant:
//     a clear value+proof headline that lifts qualified leads (+12 pts downstream)
//     with a modest proximal gain (+5 pts) — the real win.
//
// Encoded purely as data so /api/fallback can replay it in one transaction even
// if the live Claude call fails on stage. All reasoning is in French.

export interface FallbackConfig {
  json: ConfigJson;
  active: boolean;
  createdBy: string; // 'human' | 'agent'
}

export interface FallbackDecision {
  hypothesis: string;
  reasoning: string;
  verdict: "ship" | "reject" | "abstain";
  proximalDelta: number | null;
  downstreamDelta: number | null;
  accelerated: true;
}

export interface FallbackRun {
  configs: FallbackConfig[];
  decisions: FallbackDecision[];
}

// Index 0 = baseline (human), 1 = trap clickbait (agent), 2 = winner (agent, active).
export const FALLBACK_RUN: FallbackRun = {
  configs: [
    {
      // 0 — BASELINE (human)
      json: {
        headline: "Pilotez votre croissance avec un copilote qui agit",
        sousTitre:
          "Connectez vos données, laissez l'agent tester et optimiser votre page en continu. Vous gardez le contrôle, il fait le travail.",
        ctaText: "Demander une démo",
        ctaColor: "#2563eb",
        heroVariant: "A",
      },
      active: false,
      createdBy: "human",
    },
    {
      // 1 — TRAP clickbait variant (agent) — shipped then reverted
      json: {
        headline: "Doublez vos leads en 24h — sans effort, garanti",
        sousTitre:
          "La méthode secrète que les agences ne veulent pas que vous connaissiez. Cliquez maintenant, les places sont limitées.",
        ctaText: "Je veux mes leads gratuits",
        ctaColor: "#dc2626",
        heroVariant: "B",
      },
      active: false,
      createdBy: "agent",
    },
    {
      // 2 — WINNER, downstream-focused variant (agent) — final active
      json: {
        headline: "Transformez vos visiteurs en rendez-vous qualifiés",
        sousTitre:
          "Un agent qui teste chaque variante et ne garde que ce qui génère de vrais leads. +30% de demandes qualifiées en moyenne, mesuré sur vos données.",
        ctaText: "Réserver un créneau",
        ctaColor: "#059669",
        heroVariant: "C",
      },
      active: true,
      createdBy: "agent",
    },
  ],
  decisions: [
    {
      // Decision 1 — SHIP the trap variant (the tempting bet)
      hypothesis:
        "Un titre putaclic ultra-promesse (« Doublez vos leads en 24h ») et un CTA rouge urgent vont faire grimper le taux de clic par rapport à la baseline.",
      reasoning:
        "Le signal proximal est clair : la promesse forte et l'urgence augmentent presque toujours le clic. Je tente la variante pour mesurer l'impact réel sur le tunnel. Risque assumé : si les leads ne sont pas qualifiés, je reviendrai en arrière.",
      verdict: "ship",
      proximalDelta: 0.15,
      downstreamDelta: null,
      accelerated: true,
    },
    {
      // Decision 2 — REJECT / revert after accelerated data
      hypothesis:
        "Si le clickbait n'attire que du trafic non qualifié, le taux de clic montera mais le taux de formulaires qualifiés chutera.",
      reasoning:
        "Données accélérées sans appel : le proximal explose (+18 pts de clic) mais le downstream s'effondre (-9 pts de formulaires qualifiés). Le titre putaclic attire des curieux qui ne convertissent pas. La métrique qui compte (leads qualifiés) régresse. Je rejette ma propre variante et je reviens à la baseline.",
      verdict: "reject",
      proximalDelta: 0.18,
      downstreamDelta: -0.09,
      accelerated: true,
    },
    {
      // Decision 3 — SHIP the genuinely better, downstream-focused variant
      hypothesis:
        "Un titre clair centré sur le résultat business (« rendez-vous qualifiés ») avec une preuve chiffrée et un CTA d'action concret augmentera les leads qualifiés, même si le gain de clic est modeste.",
      reasoning:
        "Plutôt que d'optimiser le clic, j'optimise le tunnel complet. La promesse honnête + la preuve (+30% mesuré) qualifient le visiteur avant le clic : moins de bruit, plus d'intention. Données accélérées : proximal +5 pts et surtout downstream +12 pts de formulaires qualifiés. C'est le vrai gain — je ship.",
      verdict: "ship",
      proximalDelta: 0.05,
      downstreamDelta: 0.12,
      accelerated: true,
    },
  ],
};
