// Seed script — run with `tsx prisma/seed.ts` (or `npm run db:seed`).
//
// 1. Upsert the single-row AgentLock { id: 1, running: false, mode: "accelerated" }.
// 2. If no active Config exists, create a credible baseline active Config
//    (createdBy "human") so the app has something to render on first boot.
//
// Note on imports: tsx does not always resolve the "@/..." tsconfig path alias,
// so we import prisma via a relative path instead.
import { prisma } from "../lib/prisma";
import { ConfigJsonSchema, type ConfigJson } from "../lib/contract";

const BASELINE_CONFIG: ConfigJson = {
  headline: "Pilotez votre croissance avec un copilote qui agit",
  sousTitre:
    "Connectez vos données, laissez l'agent tester et optimiser votre page en continu. Vous gardez le contrôle, il fait le travail.",
  ctaText: "Demander une démo",
  ctaColor: "#2563eb",
  heroVariant: "A",
};

async function main() {
  // 1. AgentLock — single row, id always 1.
  const lock = await prisma.agentLock.upsert({
    where: { id: 1 },
    update: {}, // do not clobber an existing lock's running/mode on re-seed
    create: { id: 1, running: false, mode: "accelerated" },
  });
  console.log(
    `[seed] AgentLock ready (id=${lock.id}, running=${lock.running}, mode=${lock.mode}).`
  );

  // 2. Baseline active config — only if none is active yet.
  const existingActive = await prisma.config.findFirst({
    where: { active: true },
  });

  if (existingActive) {
    console.log(
      `[seed] Active config already exists (id=${existingActive.id}); skipping baseline creation.`
    );
  } else {
    // Validate the default shape against the shared contract before inserting.
    const json = ConfigJsonSchema.parse(BASELINE_CONFIG);
    const created = await prisma.config.create({
      data: { json, active: true, createdBy: "human" },
    });
    console.log(
      `[seed] Created baseline active config (id=${created.id}, createdBy="human").`
    );
  }

  console.log("[seed] Done.");
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
