import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/live/[hackathonId] — public, no auth required
// Returns hackathon info + team leaderboard with metric totals
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ hackathonId: string }> }
) {
  try {
    const { hackathonId } = await params;

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startAt: true,
        endAt: true,
      },
    });

    if (!hackathon) {
      return NextResponse.json(
        { error: "[ERR] Hackathon not found" },
        { status: 404 }
      );
    }

    const definitions = await prisma.metricDefinition.findMany({
      where: { hackathonId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    const slugs = definitions.map((d) => d.slug);

    const teams = await prisma.team.findMany({
      where: { hackathonId },
      include: {
        members: {
          include: {
            user: {
              include: { metrics: { where: { teamId: { not: null } } } },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const teamStats = teams.map((team) => {
      const memberStats = team.members.map((m) => {
        const metrics: Record<string, number> = {};
        for (const slug of slugs) metrics[slug] = 0;
        for (const metric of m.user.metrics) {
          // Only count metrics logged while on this team
          if (metric.teamId === team.id && metrics[metric.type] !== undefined) {
            metrics[metric.type] += metric.value;
          }
        }
        const totalScore = Object.values(metrics).reduce((s, v) => s + v, 0);
        return {
          id: m.user.id,
          name: m.user.name,
          color: m.user.color,
          isAdmin: m.isAdmin,
          metrics,
          totalScore,
        };
      });

      const teamMetrics: Record<string, number> = {};
      for (const slug of slugs) teamMetrics[slug] = 0;
      for (const member of memberStats) {
        for (const slug of slugs) {
          teamMetrics[slug] += member.metrics[slug] || 0;
        }
      }
      const teamScore = Object.values(teamMetrics).reduce((s, v) => s + v, 0);

      return {
        id: team.id,
        name: team.name,
        color: team.color,
        metrics: teamMetrics,
        totalScore: teamScore,
        members: memberStats.sort((a, b) => b.totalScore - a.totalScore),
      };
    });

    teamStats.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json(
      {
        hackathon: {
          id: hackathon.id,
          name: hackathon.name,
          description: hackathon.description,
          status: hackathon.status,
          startAt: hackathon.startAt.toISOString(),
          endAt: hackathon.endAt.toISOString(),
        },
        definitions: definitions.map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          color: d.color,
          inputType: d.inputType,
          unit: d.unit,
        })),
        teams: teamStats,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Live GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch live data" },
      { status: 500 }
    );
  }
}
