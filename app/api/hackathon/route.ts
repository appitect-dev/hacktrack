import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isOrganizer } from "@/lib/auth";

// GET /api/hackathon — list all hackathons
// ORGANIZER/SUPERADMIN sees all; MEMBER sees only those they're in
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "[ERR] Unauthorized" }, { status: 401 });
    }

    const hackathons = isOrganizer(session)
      ? await prisma.hackathon.findMany({
          include: { _count: { select: { teams: true } } },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.hackathon.findMany({
          where: {
            teams: {
              some: {
                members: { some: { userId: session.userId } },
              },
            },
          },
          include: { _count: { select: { teams: true } } },
          orderBy: { createdAt: "desc" },
        });

    return NextResponse.json({
      hackathons: hackathons.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        status: h.status,
        startAt: h.startAt.toISOString(),
        endAt: h.endAt.toISOString(),
        organizerId: h.organizerId,
        teamCount: h._count.teams,
        createdAt: h.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Hackathon GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch hackathons" },
      { status: 500 }
    );
  }
}

// POST /api/hackathon — create hackathon (ORGANIZER+)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isOrganizer(session)) {
      return NextResponse.json({ error: "[ERR] Forbidden" }, { status: 403 });
    }

    const { name, description, startAt, endAt } = await request.json();

    if (!name || !startAt || !endAt) {
      return NextResponse.json(
        { error: "[ERR] name, startAt, and endAt are required" },
        { status: 400 }
      );
    }

    const start = new Date(startAt);
    const end = new Date(endAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "[ERR] Invalid date format" },
        { status: 400 }
      );
    }
    if (end <= start) {
      return NextResponse.json(
        { error: "[ERR] endAt must be after startAt" },
        { status: 400 }
      );
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        name: name.trim().toUpperCase().slice(0, 60),
        description: description?.trim() || null,
        startAt: start,
        endAt: end,
        status: "DRAFT",
        organizerId: session.userId,
      },
    });

    return NextResponse.json(
      {
        message: "[OK] Hackathon created",
        hackathon: {
          id: hackathon.id,
          name: hackathon.name,
          status: hackathon.status,
          startAt: hackathon.startAt.toISOString(),
          endAt: hackathon.endAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Hackathon POST error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to create hackathon" },
      { status: 500 }
    );
  }
}
