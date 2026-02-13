"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-text-muted hover:text-red-500 text-sm font-black uppercase tracking-widest cursor-pointer transition-colors"
    >
      [LOGOUT]
    </button>
  );
}
