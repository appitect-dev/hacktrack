import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { JoinForm } from "./join-form";

export default async function JoinPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.teamId) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-primary glow-sm text-2xl font-black tracking-widest mb-1">
          HACKTRACK
        </div>
        <div className="text-text-muted text-xs uppercase tracking-widest mb-10">
          &gt; JOIN A TEAM
        </div>

        <JoinForm />

        <p className="text-text-muted text-xs text-center mt-8 uppercase tracking-widest">
          GET YOUR INVITE CODE FROM YOUR TEAM CAPTAIN
        </p>
      </div>
    </div>
  );
}
