import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isOrganizer } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isOrganizer(session)) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="shrink-0 border-b-2 border-muted px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/organizer"
            className="text-primary font-black tracking-widest text-xl glow-sm"
          >
            HACKTRACK
          </Link>
          <span className="text-text-muted text-xs uppercase tracking-widest border border-muted rounded px-2 py-0.5">
            ORGANIZER
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span
            className="text-base font-black uppercase tracking-widest"
            style={{ color: session.color }}
          >
            {session.name}
          </span>
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
