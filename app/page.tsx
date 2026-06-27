import { prisma } from "@/lib/prisma";
import { ConfigJsonSchema, type ConfigJson } from "@/lib/contract";
import Landing from "@/components/Landing";

// DB-backed + must never be statically prerendered.
export const dynamic = "force-dynamic";

// Used when no active config exists or the DB is unreachable (e.g. at build time).
const DEFAULT_CONFIG: ConfigJson = {
  headline: "Your pipeline, finally on autopilot.",
  sousTitre:
    "Cadence keeps every deal scored, every forecast honest, and every play running — so your revenue team can stop updating the CRM and start closing.",
  ctaText: "Start free pilot",
  ctaColor: "#4f46e5",
  heroVariant: "A",
};

interface PageProps {
  searchParams: Promise<{ utm_source?: string; utm_term?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const utmSource = typeof sp.utm_source === "string" ? sp.utm_source : undefined;
  const utmTerm = typeof sp.utm_term === "string" ? sp.utm_term : undefined;

  let cfgJson: ConfigJson = DEFAULT_CONFIG;
  let configId: string | null = null;

  try {
    const active = await prisma.config.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    if (active) {
      const parsed = ConfigJsonSchema.safeParse(active.json);
      if (parsed.success) {
        cfgJson = parsed.data;
        configId = active.id;
      }
    }
  } catch {
    // DB unreachable (build-time prerender / placeholder DB) — fall back to defaults.
  }

  return (
    <Landing
      config={cfgJson}
      configId={configId}
      utmSource={utmSource}
      utmTerm={utmTerm}
    />
  );
}
