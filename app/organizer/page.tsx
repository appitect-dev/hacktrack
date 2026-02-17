import { prisma } from "@/lib/prisma";
import { getSession, isOrganizer } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HackathonList } from "./hackathon-list";

export default async function OrganizerPage() {
  const session = await getSession();
  if (!session || !isOrganizer(session)) redirect("/login");

  const hackathons = await prisma.hackathon.findMany({
    include: { _count: { select: { teams: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data = hackathons.map((h) => ({
    id: h.id,
    name: h.name,
    description: h.description ?? undefined,
    status: h.status,
    startAt: h.startAt.toISOString(),
    endAt: h.endAt.toISOString(),
    organizerId: h.organizerId,
    teamCount: h._count.teams,
  }));

  return <HackathonList initial={data} />;
}
