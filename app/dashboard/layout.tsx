import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-muted px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-primary font-bold tracking-widest text-sm glow-sm">
            HACKTRACK
          </span>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-text-muted hover:text-primary text-xs uppercase tracking-widest transition-colors"
            >
              /team
            </Link>
            <Link
              href="/dashboard/track"
              className="text-text-muted hover:text-primary text-xs uppercase tracking-widest transition-colors"
            >
              /track
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session && (
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: session.color }}
            >
              {session.name}
            </span>
          )}
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
