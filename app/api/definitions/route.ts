import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

    return NextResponse.json({ definitions });
  } catch (error) {
    console.error("Definitions GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch definitions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const { slug, name, icon, color, inputType, unit } = await request.json();

    if (!slug || !name) {
      return NextResponse.json(
        { error: "[ERR] Slug and name required" },
        { status: 400 }
      );
    }

    const normalized = slug.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    if (normalized.length < 2 || normalized.length > 30) {
      return NextResponse.json(
        { error: "[ERR] Slug must be 2-30 chars" },
        { status: 400 }
      );
    }

    const existing = await prisma.metricDefinition.findUnique({
      where: { slug: normalized },
    });
    if (existing) {
      return NextResponse.json(
        { error: "[ERR] Slug already exists" },
        { status: 409 }
      );
    }

    const definition = await prisma.metricDefinition.create({
      data: {
        slug: normalized,
        name: name.toUpperCase().slice(0, 30),
        icon: icon || "///",
        color: color || "#00ff41",
        inputType: inputType === "NUMBER" ? "NUMBER" : "COUNTER",
        unit: unit || "",
        isDefault: false,
        createdBy: session.userId,
      },
    });

    return NextResponse.json({ definition }, { status: 201 });
  } catch (error) {
    console.error("Definitions POST error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to create definition" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "[ERR] Definition ID required" },
        { status: 400 }
      );
    }

    const existing = await prisma.metricDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "[ERR] Definition not found" },
        { status: 404 }
      );
    }

    // Delete all metrics of this type, then the definition
    await prisma.metric.deleteMany({ where: { type: existing.slug } });
    await prisma.metricDefinition.delete({ where: { id } });

    return NextResponse.json({ message: "[OK] Definition deleted" });
  } catch (error) {
    console.error("Definitions DELETE error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to delete definition" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const { id, name, color, inputType, unit } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "[ERR] Definition ID required" },
        { status: 400 }
      );
    }

    const existing = await prisma.metricDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "[ERR] Definition not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name.toUpperCase().slice(0, 30);
    if (color !== undefined) updates.color = color;
    if (inputType !== undefined)
      updates.inputType = inputType === "NUMBER" ? "NUMBER" : "COUNTER";
    if (unit !== undefined) updates.unit = unit.slice(0, 10);

    const definition = await prisma.metricDefinition.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ definition });
  } catch (error) {
    console.error("Definitions PUT error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to update definition" },
      { status: 500 }
    );
  }
}
