import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/hackathon/active — returns the current ACTIVE hackathon (if any)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "[ERR] Unauthorized" }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findFirst({
      where: { status: "ACTIVE" },
      include: { _count: { select: { teams: true } } },
      orderBy: { startAt: "desc" },
    });

    if (!hackathon) {
      return NextResponse.json({ hackathon: null });
    }

    return NextResponse.json({
      hackathon: {
        id: hackathon.id,
        name: hackathon.name,
        description: hackathon.description,
        status: hackathon.status,
        startAt: hackathon.startAt.toISOString(),
        endAt: hackathon.endAt.toISOString(),
        organizerId: hackathon.organizerId,
        teamCount: hackathon._count.teams,
      },
    });
  } catch (error) {
    console.error("Hackathon active GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch active hackathon" },
      { status: 500 }
    );
  }
}
