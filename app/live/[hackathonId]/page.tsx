import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LiveView } from "./live-view";

export default async function LivePage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = await params;

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { id: true, name: true, status: true },
  });

  if (!hackathon) notFound();

  return <LiveView hackathonId={hackathonId} />;
}
