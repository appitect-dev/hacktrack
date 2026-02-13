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
    <div className="min-h-screen flex flex-col">
      <Countdown />
      <nav className="border-b-2 border-muted px-4 py-3 flex items-center justify-between">
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
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
