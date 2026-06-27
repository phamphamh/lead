import { prisma } from "@/lib/prisma";
import { ConfigJsonSchema, type ConfigJson } from "@/lib/contract";
import Landing from "@/components/Landing";
import { notFound } from "next/navigation";

// One shareable URL per generated landing variant. Send /v/<id> straight to a client.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string; utm_source?: string; utm_term?: string }>;
}

export default async function VariantPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const preview = sp.preview === "1";
  const utmSource = typeof sp.utm_source === "string" ? sp.utm_source : undefined;
  const utmTerm = typeof sp.utm_term === "string" ? sp.utm_term : undefined;

  let cfgJson: ConfigJson | null = null;
  try {
    const cfg = await prisma.config.findUnique({ where: { id } });
    if (cfg) {
      const parsed = ConfigJsonSchema.safeParse(cfg.json);
      if (parsed.success) cfgJson = parsed.data;
    }
  } catch {
    // DB unreachable (build-time prerender) — fall through to notFound.
  }

  if (!cfgJson) notFound();

  return (
    <Landing
      config={cfgJson}
      configId={id}
      preview={preview}
      utmSource={utmSource}
      utmTerm={utmTerm}
    />
  );
}
