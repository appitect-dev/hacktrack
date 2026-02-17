import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JoinConfirm } from "./join-confirm";

export default async function JoinCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await getSession();
  if (!session) redirect(`/login`);

  const normalized = code.toUpperCase();

  const team = await prisma.team.findUnique({
    where: { inviteCode: normalized },
    include: {
      hackathon: {
        select: { id: true, name: true, status: true, endAt: true },
      },
      _count: { select: { members: true } },
    },
  });

  // Already on this team
  if (session.teamId && session.teamId === team?.id) {
    redirect("/dashboard");
  }

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4">
        <div className="text-red-500 text-2xl font-black tracking-widest">
          [ERR] INVALID INVITE CODE
        </div>
        <p className="text-text-muted text-sm uppercase tracking-widest">
          Code: {normalized}
        </p>
        <a
          href="/join"
          className="text-primary text-sm uppercase tracking-widest hover:underline"
        >
          → Try another code
        </a>
      </div>
    );
  }

  if (team.hackathon.status !== "ACTIVE") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4">
        <div className="text-yellow-400 text-2xl font-black tracking-widest">
          [ERR] HACKATHON NOT ACTIVE
        </div>
        <p className="text-text-muted text-sm uppercase tracking-widest">
          {team.hackathon.name} — {team.hackathon.status}
        </p>
      </div>
    );
  }

  return (
    <JoinConfirm
      inviteCode={normalized}
      teamName={team.name}
      teamColor={team.color}
      hackathonName={team.hackathon.name}
      memberCount={team._count.members}
      hackathonEndAt={team.hackathon.endAt.toISOString()}
    />
  );
}
