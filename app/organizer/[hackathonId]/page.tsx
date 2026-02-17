import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, isOrganizer } from "@/lib/auth";
import { HackathonDetail } from "./hackathon-detail";
import { ProposalsPanel } from "./proposals-panel";

export default async function OrganizerHackathonPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = await params;
  const session = await getSession();
  if (!session || !isOrganizer(session)) redirect("/login");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
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

  if (!hackathon) notFound();

  const data = {
    id: hackathon.id,
    name: hackathon.name,
    description: hackathon.description ?? undefined,
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
  };

  return (
    <div className="space-y-12">
      <HackathonDetail hackathon={data} />
      <ProposalsPanel hackathonId={hackathonId} />
    </div>
  );
}
