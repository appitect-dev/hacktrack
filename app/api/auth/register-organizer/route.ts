import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";
import { NEON_COLORS } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { name, pin, color, organizerSecret } = await request.json();

    if (!name || !pin || !organizerSecret) {
      return NextResponse.json(
        { error: "[ERR] Name, PIN, and organizer secret required" },
        { status: 400 }
      );
    }

    const expectedSecret = process.env.ORGANIZER_SECRET;
    if (!expectedSecret || organizerSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "[ERR] Invalid organizer secret" },
        { status: 403 }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "[ERR] PIN must be 4 digits" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim().toUpperCase();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json(
        { error: "[ERR] Name must be 2-20 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { name: trimmedName },
    });
    if (existing) {
      return NextResponse.json(
        { error: "[ERR] Handle already taken" },
        { status: 409 }
      );
    }

    const validColor =
      color && NEON_COLORS.includes(color) ? color : "#ff8800";
    const pinHash = await bcrypt.hash(pin, 10);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        pinHash,
        color: validColor,
        role: "ORGANIZER",
      },
    });

    const token = await createSession({
      userId: user.id,
      name: user.name,
      color: user.color,
      role: "ORGANIZER",
      teamId: null,
      hackathonId: null,
    });

    const response = NextResponse.json(
      {
        message: "[OK] Organizer registered",
        user: { id: user.id, name: user.name, color: user.color, role: "ORGANIZER" },
      },
      { status: 201 }
    );
    response.cookies.set(setSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Organizer register error:", error);
    return NextResponse.json(
      { error: "[ERR] Registration failed" },
      { status: 500 }
    );
  }
}
