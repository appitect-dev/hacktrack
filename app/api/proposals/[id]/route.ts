import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isOrganizer } from "@/lib/auth";

// PUT /api/proposals/[id] — organizer approves or rejects
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

    const { status, reason } = await request.json();

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        { error: "[ERR] status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    const proposal = await prisma.metricProposal.findUnique({ where: { id } });
    if (!proposal) {
      return NextResponse.json(
        { error: "[ERR] Proposal not found" },
        { status: 404 }
      );
    }
    if (proposal.status !== "PENDING") {
      return NextResponse.json(
        { error: "[ERR] Proposal already resolved" },
        { status: 409 }
      );
    }

    if (status === "APPROVED") {
      // Create the MetricDefinition
      const definition = await prisma.metricDefinition.create({
        data: {
          slug: proposal.slug,
          name: proposal.name,
          icon: proposal.icon,
          color: "#00ff41",
          inputType: proposal.inputType,
          unit: proposal.unit,
          isDefault: false,
          hackathonId: proposal.hackathonId,
          createdBy: session.userId,
        },
      });

      await prisma.metricProposal.update({
        where: { id },
        data: {
          status: "APPROVED",
          definitionId: definition.id,
          resolvedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "[OK] Proposal approved — metric definition created",
        definitionId: definition.id,
      });
    } else {
      await prisma.metricProposal.update({
        where: { id },
        data: {
          status: "REJECTED",
          reason: reason?.trim() || null,
          resolvedAt: new Date(),
        },
      });

      return NextResponse.json({ message: "[OK] Proposal rejected" });
    }
  } catch (error) {
    console.error("Proposal PUT error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to resolve proposal" },
      { status: 500 }
    );
  }
}
