import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Revert the last "ship": deactivate the shipped config, reactivate its parent.
export async function POST() {
  try {
    const lastShip = await prisma.decision.findFirst({
      where: { verdict: "ship", configIdTo: { not: null } },
      orderBy: { createdAt: "desc" },
    });

    if (!lastShip || !lastShip.configIdTo) {
      return Response.json({ ok: false });
    }

    // Deactivate the shipped config.
    await prisma.config.update({
      where: { id: lastShip.configIdTo },
      data: { active: false },
    });

    // Reactivate the previous (parent) config if known.
    if (lastShip.configIdFrom) {
      await prisma.config.update({
        where: { id: lastShip.configIdFrom },
        data: { active: true },
      });
    }

    return Response.json({ ok: true, reverted: lastShip.id });
  } catch {
    return Response.json({ ok: false });
  }
}
