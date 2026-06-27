import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = Number(searchParams.get("limit"));
    const limit =
      Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), 100) : 20;

    const decisions = await prisma.decision.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return Response.json(decisions);
  } catch {
    return Response.json([]);
  }
}
