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
