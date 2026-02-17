import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "[ERR] Unauthorized" }, { status: 401 });
    }

    const { inviteCode } = await request.json();
    if (!inviteCode) {
      return NextResponse.json(
        { error: "[ERR] Invite code required" },
        { status: 400 }
      );
    }

    const normalized = String(inviteCode).trim().toUpperCase();

    const team = await prisma.team.findUnique({
      where: { inviteCode: normalized },
      include: { hackathon: true },
    });

    if (!team) {
      return NextResponse.json(
        { error: "[ERR] Invalid invite code" },
        { status: 404 }
      );
    }

    if (team.hackathon.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "[ERR] Hackathon is not active" },
        { status: 400 }
      );
    }

    // Already on this team
    if (session.teamId === team.id) {
      return NextResponse.json(
        { error: "[ERR] Already a member of this team" },
        { status: 409 }
      );
    }

    // Already in another team in this hackathon
    const existingMembership = await prisma.teamMembership.findFirst({
      where: {
        userId: session.userId,
        team: { hackathonId: team.hackathonId },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "[ERR] Already in a team for this hackathon" },
        { status: 409 }
      );
    }

    await prisma.teamMembership.create({
      data: {
        userId: session.userId,
        teamId: team.id,
        isAdmin: false,
      },
    });

    // Re-issue session with team context
    const token = await createSession({
      userId: session.userId,
      name: session.name,
      color: session.color,
      role: session.role,
      teamId: team.id,
      hackathonId: team.hackathonId,
    });

    const cookieStore = await cookies();
    cookieStore.set(setSessionCookie(token));

    return NextResponse.json({
      message: "[OK] Joined team",
      team: { id: team.id, name: team.name, color: team.color },
    });
  } catch (error) {
    console.error("Team join error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to join team" },
      { status: 500 }
    );
  }
}
