import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isOrganizer } from "@/lib/auth";
import { DEFAULT_METRIC_TEMPLATES, randomInviteCode } from "@/lib/hackathon-defaults";

// GET /api/hackathon/[id] — detail + teams + leaderboard
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "[ERR] Unauthorized" }, { status: 401 });
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
      include: {
        teams: {
          include: { _count: { select: { members: true } } },
          orderBy: { createdAt: "asc" },
        },
        definitions: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        },
        organizer: { select: { name: true, color: true } },
      },
    });

    if (!hackathon) {
      return NextResponse.json(
        { error: "[ERR] Hackathon not found" },
        { status: 404 }
      );
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
        organizerName: hackathon.organizer.name,
        organizerColor: hackathon.organizer.color,
        teams: hackathon.teams.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          inviteCode: t.inviteCode,
          memberCount: t._count.members,
        })),
        definitions: hackathon.definitions.map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          icon: d.icon,
          color: d.color,
          inputType: d.inputType,
          unit: d.unit,
          isDefault: d.isDefault,
        })),
      },
    });
  } catch (error) {
    console.error("Hackathon GET [id] error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch hackathon" },
      { status: 500 }
    );
  }
}

// PUT /api/hackathon/[id] — update hackathon (ORGANIZER+)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !isOrganizer(session)) {
      return NextResponse.json({ error: "[ERR] Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, startAt, endAt, status } = body;

    const existing = await prisma.hackathon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "[ERR] Hackathon not found" },
        { status: 404 }
      );
    }

    // Only the organizer who created it (or superadmin) can edit
    if (
      session.role !== "SUPERADMIN" &&
      existing.organizerId !== session.userId
    ) {
      return NextResponse.json({ error: "[ERR] Forbidden" }, { status: 403 });
    }

    // Validate status transition
    if (status) {
      const validStatuses = ["DRAFT", "ACTIVE", "ENDED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "[ERR] Invalid status" },
          { status: 400 }
        );
      }
      // Enforce: only one ACTIVE hackathon at a time
      if (status === "ACTIVE" && existing.status !== "ACTIVE") {
        const currentActive = await prisma.hackathon.findFirst({
          where: { status: "ACTIVE", id: { not: id } },
        });
        if (currentActive) {
          return NextResponse.json(
            {
              error: `[ERR] Another hackathon is already ACTIVE: ${currentActive.name}`,
            },
            { status: 409 }
          );
        }
        // When activating: seed default metric definitions if none exist
        const defCount = await prisma.metricDefinition.count({
          where: { hackathonId: id },
        });
        if (defCount === 0) {
          await prisma.metricDefinition.createMany({
            data: DEFAULT_METRIC_TEMPLATES.map((t) => ({
              ...t,
              hackathonId: id,
              createdBy: session.userId,
            })),
          });
        }
      }
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim().toUpperCase().slice(0, 60);
    if (description !== undefined) updates.description = description?.trim() || null;
    if (startAt !== undefined) updates.startAt = new Date(startAt);
    if (endAt !== undefined) updates.endAt = new Date(endAt);
    if (status !== undefined) updates.status = status;

    const hackathon = await prisma.hackathon.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      message: "[OK] Hackathon updated",
      hackathon: {
        id: hackathon.id,
        name: hackathon.name,
        status: hackathon.status,
        startAt: hackathon.startAt.toISOString(),
        endAt: hackathon.endAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Hackathon PUT error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to update hackathon" },
      { status: 500 }
    );
  }
}

// POST body action: create a team within this hackathon
// We handle team creation as a nested action via POST /api/hackathon/[id]/teams
// But for simplicity, handle it here with an "action" field
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !isOrganizer(session)) {
      return NextResponse.json({ error: "[ERR] Forbidden" }, { status: 403 });
    }

    const { name, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "[ERR] Team name required" },
        { status: 400 }
      );
    }

    const hackathon = await prisma.hackathon.findUnique({ where: { id } });
    if (!hackathon) {
      return NextResponse.json(
        { error: "[ERR] Hackathon not found" },
        { status: 404 }
      );
    }

    // Generate a unique invite code
    let inviteCode: string;
    let attempts = 0;
    do {
      inviteCode = randomInviteCode();
      const existing = await prisma.team.findUnique({ where: { inviteCode } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const team = await prisma.team.create({
      data: {
        name: name.trim().toUpperCase().slice(0, 40),
        color: color || "#00ff41",
        inviteCode: inviteCode!,
        hackathonId: id,
      },
    });

    return NextResponse.json(
      {
        message: "[OK] Team created",
        team: {
          id: team.id,
          name: team.name,
          color: team.color,
          inviteCode: team.inviteCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Hackathon POST team error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to create team" },
      { status: 500 }
    );
  }
}
