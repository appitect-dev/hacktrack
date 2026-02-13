import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "[OK] Logged out" });
  response.cookies.set(clearSessionCookie());
  return response;
}
