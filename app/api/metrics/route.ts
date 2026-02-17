import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildHourlyTimeline } from "@/lib/chart-utils";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const { type, value } = await request.json();

    // Validate definition exists for this hackathon (or globally if no hackathon)
    const definition = session.hackathonId
      ? await prisma.metricDefinition.findUnique({
          where: {
            slug_hackathonId: { slug: type, hackathonId: session.hackathonId },
          },
        })
      : await prisma.metricDefinition.findFirst({ where: { slug: type } });

    if (!definition) {
      return NextResponse.json(
        { error: "[ERR] Invalid metric type" },
        { status: 400 }
      );
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue === 0) {
      return NextResponse.json(
        { error: "[ERR] Value must be non-zero" },
        { status: 400 }
      );
    }

    const metric = await prisma.metric.create({
      data: {
        userId: session.userId,
        teamId: session.teamId ?? null,
        type,
        value: numValue,
      },
    });

    return NextResponse.json({
      message: "[OK] Metric logged",
      metric: {
        id: metric.id,
        type: metric.type,
        value: metric.value,
        createdAt: metric.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Metric POST error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to log metric" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const definitionWhere = session.hackathonId
      ? { hackathonId: session.hackathonId }
      : {};

    const definitions = await prisma.metricDefinition.findMany({
      where: definitionWhere,
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    const slugs = definitions.map((d) => d.slug);

    const recent = await prisma.metric.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const allMetrics = await prisma.metric.findMany({
      where: { userId: session.userId },
    });

    const totals: Record<string, number> = {};
    for (const slug of slugs) totals[slug] = 0;
    for (const m of allMetrics) {
      if (totals[m.type] !== undefined) {
        totals[m.type] += m.value;
      }
    }

    const timeline = buildHourlyTimeline(allMetrics, slugs, 24);

    return NextResponse.json({
      totals,
      recent: recent.map((m) => ({
        id: m.id,
        type: m.type,
        value: m.value,
        createdAt: m.createdAt.toISOString(),
      })),
      timeline,
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
    console.error("Metric GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
