import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UserStats } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const definitions = await prisma.metricDefinition.findMany({
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    const slugs = definitions.map((d) => d.slug);

    const users = await prisma.user.findMany({
      include: { metrics: true },
      orderBy: { createdAt: "asc" },
    });

    const stats: UserStats[] = users.map((user) => {
      const metrics: Record<string, number> = {};
      for (const slug of slugs) metrics[slug] = 0;
      for (const m of user.metrics) {
        if (metrics[m.type] !== undefined) {
          metrics[m.type] += m.value;
        }
      }

      const totalScore = Object.values(metrics).reduce((sum, v) => sum + v, 0);

      return {
        id: user.id,
        name: user.name,
        color: user.color,
        metrics,
        totalScore,
      };
    });

    stats.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({
      team: stats,
      definitions: definitions.map((d) => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        icon: d.icon,
        color: d.color,
        inputType: d.inputType,
        unit: d.unit,
        isDefault: d.isDefault,
      })),
    });
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch team stats" },
      { status: 500 }
    );
  }
}
