import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, createSession, setSessionCookie } from "@/lib/auth";
import { NEON_COLORS } from "@/lib/types";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "[ERR] User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      color: user.color,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "[ERR] Unauthorized" },
        { status: 401 }
      );
    }

    const { name, color, pin } = await request.json();

    const updates: { name?: string; color?: string; pinHash?: string } = {};

    if (name !== undefined) {
      const trimmed = name.trim().toUpperCase();
      if (trimmed.length < 2 || trimmed.length > 20) {
        return NextResponse.json(
          { error: "[ERR] Name must be 2-20 characters" },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({
        where: { name: trimmed },
      });
      if (existing && existing.id !== session.userId) {
        return NextResponse.json(
          { error: "[ERR] Handle already taken" },
          { status: 409 }
        );
      }

      updates.name = trimmed;
    }

    if (color !== undefined) {
      const valid = NEON_COLORS.includes(color as typeof NEON_COLORS[number]);
      updates.color = valid ? color : session.color;
    }

    if (pin !== undefined) {
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { error: "[ERR] PIN must be 4 digits" },
          { status: 400 }
        );
      }
      updates.pinHash = await bcrypt.hash(pin, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "[ERR] No changes" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: updates,
    });

    // Re-issue session token with updated data
    const token = await createSession({
      userId: user.id,
      name: user.name,
      color: user.color,
    });

    const cookieStore = await cookies();
    cookieStore.set(setSessionCookie(token));

    return NextResponse.json({
      message: "[OK] Profile updated",
      user: { id: user.id, name: user.name, color: user.color },
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "[ERR] Failed to update profile" },
      { status: 500 }
    );
  }
}
