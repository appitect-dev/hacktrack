import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { FullscreenToggle } from "@/components/fullscreen-toggle";
import { Countdown } from "@/components/countdown";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  // Organizers/admins have their own dashboard
  if (session.role === "ORGANIZER" || session.role === "SUPERADMIN") redirect("/organizer");
  // Members without a team get sent to the join flow
  if (!session.teamId) redirect("/join");

  const hackathon = session.hackathonId
    ? await prisma.hackathon.findUnique({
        where: { id: session.hackathonId },
        select: { endAt: true },
      })
    : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Countdown endAt={hackathon?.endAt.toISOString()} />
      <nav className="shrink-0 border-b-2 border-muted px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-primary font-black tracking-widest text-xl glow-sm">
            HACKTRACK
          </span>
          <div className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-text-muted hover:text-primary text-base font-black uppercase tracking-widest transition-colors"
            >
              /team
            </Link>
            <Link
              href="/dashboard/track"
              className="text-text-muted hover:text-primary text-base font-black uppercase tracking-widest transition-colors"
            >
              /track
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {session && (
            <Link
              href="/dashboard/profile"
              className="text-base font-black uppercase tracking-widest hover:underline transition-colors"
              style={{ color: session.color }}
            >
              {session.name}
            </Link>
          )}
          <FullscreenToggle />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 overflow-hidden p-3 w-full">
        {children}
      </main>
    </div>
  );
}
