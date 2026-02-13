import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";
import { NEON_COLORS } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { name, pin, color } = await request.json();

    if (!name || !pin) {
      return NextResponse.json(
        { error: "[ERR] Name and PIN required" },
        { status: 400 }
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
      color && NEON_COLORS.includes(color) ? color : "#00ff41";
    const pinHash = await bcrypt.hash(pin, 10);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        pinHash,
        color: validColor,
      },
    });

    const token = await createSession({
      userId: user.id,
      name: user.name,
      color: user.color,
    });

    const response = NextResponse.json(
      { message: "[OK] User registered", user: { id: user.id, name: user.name, color: user.color } },
      { status: 201 }
    );
    response.cookies.set(setSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "[ERR] Registration failed" },
      { status: 500 }
    );
  }
}
