import Anthropic from "@anthropic-ai/sdk";
import {
  AgentDecisionSchema,
  HERO_VARIANTS,
  SAMPLE_GATE_N,
  VERDICTS,
  type AgentDecision,
  type ConfigMetrics,
} from "@/lib/contract";

const MODEL = process.env.AGENT_MODEL ?? "claude-opus-4-8";

// JSON Schema mirroring AgentDecisionSchema — forces structured tool output.
const SUBMIT_DECISION_SCHEMA = {
  type: "object" as const,
  properties: {
    hypothesis: {
      type: "string",
      description: "L'hypothèse testée, en français, concise.",
    },
    reasoning: {
      type: "string",
      description: "Le raisonnement CRO derrière le verdict, en français, concis.",
    },
    verdict: {
      type: "string",
      enum: [...VERDICTS],
      description: "ship = déployer la nouvelle config, reject = rejeter, abstain = pas assez de données.",
    },
    proximalDelta: {
      type: ["number", "null"],
      description: "Delta du taux de clic vs config active (ex 0.12 = +12 pts). null si inconnu.",
    },
    downstreamDelta: {
      type: ["number", "null"],
      description: "Delta du taux de formulaires qualifiés vs config active. null si inconnu.",
    },
    config: {
      type: ["object", "null"],
      description: "La nouvelle config proposée. Requis si verdict=ship, sinon null.",
      properties: {
        headline: { type: "string" },
        sousTitre: { type: "string" },
        ctaText: { type: "string" },
        ctaColor: {
          type: "string",
          description: "Couleur hex 6 chiffres, ex #2563eb.",
        },
        heroVariant: { type: "string", enum: [...HERO_VARIANTS] },
      },
      required: ["headline", "sousTitre", "ctaText", "ctaColor", "heroVariant"],
      additionalProperties: false,
    },
  },
  required: [
    "hypothesis",
    "reasoning",
    "verdict",
    "proximalDelta",
    "downstreamDelta",
    "config",
  ],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `Tu es un agent CRO (Conversion Rate Optimization) senior qui pilote l'itération d'une landing page de génération de leads. Tu décides s'il faut déployer une nouvelle variante de la page, rejeter une piste, ou t'abstenir.

La page a une config: { headline, sousTitre, ctaText, ctaColor (hex), heroVariant ('A'|'B'|'C') }.
Métriques par config:
- proximalRate = clics CTA / vues (signal proximal, faible valeur).
- downstreamRate = formulaires qualifiés / vues (signal aval, VRAIE valeur business = leads qualifiés / CAC).

RÈGLES DE JUGEMENT (impératives, dans cet ordre):
1) SAMPLE GATE: si la variante active ou candidate a moins de ${SAMPLE_GATE_N} évènements, le verdict DOIT être "abstain", avec un raisonnement honnête "données insuffisantes (n=X)" où X est le nombre d'évènements observés. Pas de config dans ce cas.
2) FAUX POSITIF PROXIMAL: si une variante candidate AUGMENTE le taux de clic proximal (proximalRate) mais BAISSE le taux aval de formulaires qualifiés (downstreamRate), le verdict DOIT être "reject". Le raisonnement DOIT expliquer qu'on optimise le CAC réel et le volume de leads qualifiés, pas le simple taux de clic — un meilleur clic qui convertit moins est un piège.
3) SINON: propose une nouvelle config améliorée (headline/sousTitre/ctaText/ctaColor/heroVariant) et donne le verdict "ship", avec une hypothèse claire et un raisonnement concis.

Réponds TOUJOURS via l'outil submit_decision. Raisonnement et hypothèse en français, concis. Renseigne proximalDelta et downstreamDelta (en points décimaux vs la config active) quand tu peux les estimer, sinon null.`;

const TOOL_NAME = "submit_decision";

function buildUserMessage(
  metrics: ConfigMetrics[],
  active: ConfigMetrics | null
): string {
  return JSON.stringify(
    {
      sampleGateN: SAMPLE_GATE_N,
      activeConfig: active,
      recentConfigs: metrics,
      note: "events = views + clicks + forms pour évaluer la sample gate.",
    },
    null,
    2
  );
}

async function callOnce(
  client: Anthropic,
  metrics: ConfigMetrics[],
  active: ConfigMetrics | null
): Promise<unknown> {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: TOOL_NAME,
        description:
          "Soumet la décision structurée de l'agent CRO (verdict + config proposée).",
        input_schema: SUBMIT_DECISION_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [
      { role: "user", content: buildUserMessage(metrics, active) },
    ],
  });

  const toolBlock = resp.content.find(
    (b): b is Anthropic.ToolUseBlock =>
      b.type === "tool_use" && b.name === TOOL_NAME
  );
  if (!toolBlock) throw new Error("Claude n'a pas renvoyé d'appel d'outil submit_decision.");
  return toolBlock.input;
}

// Run the agent: forced structured output, validated server-side. Retries once on invalid.
export async function runAgentDecision(
  metrics: ConfigMetrics[],
  active: ConfigMetrics | null
): Promise<AgentDecision> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await callOnce(client, metrics, active);
    const parsed = AgentDecisionSchema.safeParse(raw);
    if (parsed.success) {
      // Enforce contract: ship requires a config; otherwise drop it.
      const d = parsed.data;
      if (d.verdict !== "ship") {
        return { ...d, config: null };
      }
      if (d.config) return d;
      lastErr = new Error("verdict=ship sans config");
      continue;
    }
    lastErr = parsed.error;
  }
  throw new Error(
    `Décision agent invalide après retry: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`
  );
}
