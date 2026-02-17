import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isOrganizer } from "@/lib/auth";

// POST /api/proposals — member proposes a new metric
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "[ERR] Unauthorized" }, { status: 401 });
    }

    if (!session.hackathonId) {
      return NextResponse.json(
        { error: "[ERR] No active hackathon — join a team first" },
        { status: 400 }
      );
    }

    const { name, icon, inputType, unit } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "[ERR] Name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim().toUpperCase().slice(0, 30);
    const slug = trimmedName.replace(/[^A-Z0-9]/g, "_");

    // Check for duplicate pending proposal from same user in same hackathon
    const existingProposal = await prisma.metricProposal.findFirst({
      where: {
        hackathonId: session.hackathonId,
        proposedById: session.userId,
        slug,
        status: "PENDING",
      },
    });
    if (existingProposal) {
      return NextResponse.json(
        { error: "[ERR] You already have a pending proposal for this metric" },
        { status: 409 }
      );
    }

    // Check if metric with this slug already exists in the hackathon
    const existingDef = await prisma.metricDefinition.findUnique({
      where: {
        slug_hackathonId: { slug, hackathonId: session.hackathonId },
      },
    });
    if (existingDef) {
      return NextResponse.json(
        { error: "[ERR] A metric with this name already exists" },
        { status: 409 }
      );
    }

    const proposal = await prisma.metricProposal.create({
      data: {
        name: trimmedName,
        slug,
        icon: icon || "///",
        inputType: inputType === "NUMBER" ? "NUMBER" : "COUNTER",
        unit: unit?.trim().slice(0, 10) || "",
        hackathonId: session.hackathonId,
        proposedById: session.userId,
      },
    });

    return NextResponse.json(
      {
        message: "[OK] Proposal submitted",
        proposal: {
          id: proposal.id,
          name: proposal.name,
          slug: proposal.slug,
          status: proposal.status,
          createdAt: proposal.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Proposal POST error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to submit proposal" },
      { status: 500 }
    );
  }
}

// GET /api/proposals — organizer sees all for hackathon; member sees their own
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "[ERR] Unauthorized" }, { status: 401 });
    }

    if (!session.hackathonId) {
      return NextResponse.json({ proposals: [] });
    }

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    const where = isOrganizer(session)
      ? {
          hackathonId: session.hackathonId,
          ...(statusFilter ? { status: statusFilter as "PENDING" | "APPROVED" | "REJECTED" } : {}),
        }
      : {
          hackathonId: session.hackathonId,
          proposedById: session.userId,
        };

    const proposals = await prisma.metricProposal.findMany({
      where,
      include: { proposedBy: { select: { name: true, color: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      proposals: proposals.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        icon: p.icon,
        inputType: p.inputType,
        unit: p.unit,
        status: p.status,
        reason: p.reason,
        proposedById: p.proposedById,
        proposedByName: p.proposedBy.name,
        proposedByColor: p.proposedBy.color,
        hackathonId: p.hackathonId,
        definitionId: p.definitionId,
        createdAt: p.createdAt.toISOString(),
        resolvedAt: p.resolvedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("Proposal GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
