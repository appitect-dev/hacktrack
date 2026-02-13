import Link from "next/link";
import { getSession } from "@/lib/auth";
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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Countdown />
      <nav className="shrink-0 border-b-2 border-muted px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-primary font-black tracking-widest text-base glow-sm">
            HACKTRACK
          </span>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-text-muted hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors"
            >
              /team
            </Link>
            <Link
              href="/dashboard/track"
              className="text-text-muted hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors"
            >
              /track
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session && (
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: session.color }}
            >
              {session.name}
            </span>
          )}
          <FullscreenToggle />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-3 md:p-4 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
