import { prisma } from "@/lib/prisma";
import { MODES, type Mode } from "@/lib/contract";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { mode?: string };
    const mode = body.mode;

    if (!mode || !(MODES as readonly string[]).includes(mode)) {
      return Response.json(
        { ok: false, error: "mode invalide" },
        { status: 400 }
      );
    }

    await prisma.agentLock.upsert({
      where: { id: 1 },
      update: { mode: mode as Mode },
      create: { id: 1, mode: mode as Mode },
    });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "mode error" },
      { status: 500 }
    );
  }
}
