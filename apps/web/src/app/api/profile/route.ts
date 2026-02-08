import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireUserApi } from "@/lib/auth/requireUserApi";

type Gender = "MALE" | "FEMALE" | "DIVERSE" | "UNKNOWN";
type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

type PatchProfileInput = {
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  age?: number | null;
  gender?: Gender | null;
  phone?: string | null;
  themePreference?: ThemePreference;
};

function normStr(v: unknown, maxLen: number) {
  if (v === null) return null;
  if (v === undefined) return undefined;
  const s = String(v).trim();
  if (!s) return null;
  if (s.length > maxLen) throw new Error("too long");
  return s;
}

export async function GET() {
  const { user, error } = await requireUserApi();
  if (error) return error;

  // Ensure profile exists (for older users created before Profile was introduced).
  const profile = await prisma.profile.upsert({
    where: { userId: user!.id },
    create: { userId: user!.id, themePreference: "SYSTEM" },
    update: {},
    select: {
      firstName: true,
      lastName: true,
      company: true,
      age: true,
      gender: true,
      phone: true,
      themePreference: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    email: user!.email,
    profile,
  });
}

export async function PATCH(req: Request) {
  const { user, error } = await requireUserApi();
  if (error) return error;

  let body: PatchProfileInput;
  try {
    body = (await req.json()) as PatchProfileInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const patch: Record<string, unknown> = {};

    const firstName = normStr(body.firstName, 64);
    if (firstName !== undefined) patch.firstName = firstName;

    const lastName = normStr(body.lastName, 64);
    if (lastName !== undefined) patch.lastName = lastName;

    const company = normStr(body.company, 64);
    if (company !== undefined) patch.company = company;

    if (body.age !== undefined) {
      if (body.age === null) {
        patch.age = null;
      } else {
        const age = Math.round(Number(body.age));
        if (!Number.isFinite(age) || age < 0 || age > 130) return NextResponse.json({ error: "age invalid" }, { status: 400 });
        patch.age = age;
      }
    }

    if (body.gender !== undefined) {
      if (body.gender === null) {
        patch.gender = null;
      } else {
        const allowed = new Set<Gender>(["MALE", "FEMALE", "DIVERSE", "UNKNOWN"]);
        if (!allowed.has(body.gender)) return NextResponse.json({ error: "gender invalid" }, { status: 400 });
        patch.gender = body.gender;
      }
    }

    const phone = normStr(body.phone, 32);
    if (phone !== undefined) patch.phone = phone;

    if (body.themePreference !== undefined) {
      const allowed = new Set<ThemePreference>(["LIGHT", "DARK", "SYSTEM"]);
      if (!allowed.has(body.themePreference)) {
        return NextResponse.json({ error: "themePreference invalid" }, { status: 400 });
      }
      patch.themePreference = body.themePreference;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No changes" }, { status: 400 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user!.id },
      create: { userId: user!.id, themePreference: "SYSTEM", ...patch },
      update: patch,
      select: {
        firstName: true,
        lastName: true,
        company: true,
        age: true,
        gender: true,
        phone: true,
        themePreference: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ email: user!.email, profile }, { status: 200 });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("too long")) return NextResponse.json({ error: "Value too long" }, { status: 400 });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
