import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Config (override via env) ────────────────────────────────────────────────

const SUPERADMIN_NAME = (process.env.SUPERADMIN_NAME || "ADMIN").toUpperCase();
const SUPERADMIN_PIN = process.env.SUPERADMIN_PIN || "0000";

const ORGANIZER_NAME = (process.env.ORGANIZER_NAME || "ORGANIZER").toUpperCase();
const ORGANIZER_PIN = process.env.ORGANIZER_PIN || "1234";

import { DEFAULT_METRIC_TEMPLATES, randomInviteCode } from "../lib/hackathon-defaults";
export { DEFAULT_METRIC_TEMPLATES, randomInviteCode };

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[seed] Starting...");

  // Superadmin
  const superadminHash = await bcrypt.hash(SUPERADMIN_PIN, 10);
  const superadmin = await prisma.user.upsert({
    where: { name: SUPERADMIN_NAME },
    update: {},
    create: {
      name: SUPERADMIN_NAME,
      pinHash: superadminHash,
      color: "#ff0040",
      role: "SUPERADMIN",
    },
  });
  console.log(`[seed] Superadmin "${superadmin.name}" OK`);

  // Organizer
  const organizerHash = await bcrypt.hash(ORGANIZER_PIN, 10);
  const organizer = await prisma.user.upsert({
    where: { name: ORGANIZER_NAME },
    update: {},
    create: {
      name: ORGANIZER_NAME,
      pinHash: organizerHash,
      color: "#ff8800",
      role: "ORGANIZER",
    },
  });
  console.log(`[seed] Organizer "${organizer.name}" OK`);

  // Sample hackathon (ACTIVE, ends 30 days from now)
  const now = new Date();
  const startAt = now;
  const endAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let hackathon = await prisma.hackathon.findFirst({
    where: { organizerId: organizer.id, name: "HACKTRACK DEV HACKATHON" },
  });

  if (!hackathon) {
    hackathon = await prisma.hackathon.create({
      data: {
        name: "HACKTRACK DEV HACKATHON",
        description: "Sample event for development and testing.",
        status: "ACTIVE",
        startAt,
        endAt,
        organizerId: organizer.id,
      },
    });
    console.log(`[seed] Hackathon "${hackathon.name}" created`);
  } else {
    console.log(`[seed] Hackathon "${hackathon.name}" already exists`);
  }

  // Metric definitions scoped to this hackathon
  for (const tpl of DEFAULT_METRIC_TEMPLATES) {
    await prisma.metricDefinition.upsert({
      where: { slug_hackathonId: { slug: tpl.slug, hackathonId: hackathon.id } },
      update: { color: tpl.color },
      create: { ...tpl, hackathonId: hackathon.id, createdBy: organizer.id },
    });
  }
  console.log("[seed] Metric definitions OK");

  // Team Alpha
  let teamAlpha = await prisma.team.findFirst({
    where: { hackathonId: hackathon.id, name: "TEAM ALPHA" },
  });
  if (!teamAlpha) {
    teamAlpha = await prisma.team.create({
      data: {
        name: "TEAM ALPHA",
        color: "#00ffff",
        inviteCode: "ALPH",
        hackathonId: hackathon.id,
      },
    });
  }
  console.log(`[seed] Team "TEAM ALPHA" OK (code: ${teamAlpha.inviteCode})`);

  // Team Beta
  let teamBeta = await prisma.team.findFirst({
    where: { hackathonId: hackathon.id, name: "TEAM BETA" },
  });
  if (!teamBeta) {
    teamBeta = await prisma.team.create({
      data: {
        name: "TEAM BETA",
        color: "#ff00ff",
        inviteCode: "BETA",
        hackathonId: hackathon.id,
      },
    });
  }
  console.log(`[seed] Team "TEAM BETA" OK (code: ${teamBeta.inviteCode})`);

  // Sample members
  const members = [
    { name: "ALICE", pin: "1111", color: "#00ff41", teamId: teamAlpha.id, isAdmin: true },
    { name: "BOB", pin: "2222", color: "#00ffff", teamId: teamAlpha.id, isAdmin: false },
    { name: "CAROL", pin: "3333", color: "#ff00ff", teamId: teamBeta.id, isAdmin: true },
    { name: "DAVE", pin: "4444", color: "#ffff00", teamId: teamBeta.id, isAdmin: false },
  ];

  for (const m of members) {
    const hash = await bcrypt.hash(m.pin, 10);
    const user = await prisma.user.upsert({
      where: { name: m.name },
      update: {},
      create: { name: m.name, pinHash: hash, color: m.color, role: "MEMBER" },
    });
    await prisma.teamMembership.upsert({
      where: { userId_teamId: { userId: user.id, teamId: m.teamId } },
      update: {},
      create: { userId: user.id, teamId: m.teamId, isAdmin: m.isAdmin },
    });
    const teamLabel = m.teamId === teamAlpha.id ? "ALPHA" : "BETA";
    console.log(`[seed] Member "${user.name}" → TEAM ${teamLabel}`);
  }

  console.log("\n[seed] Done.");
  console.log(`  Superadmin  : ${SUPERADMIN_NAME} / PIN ${SUPERADMIN_PIN}`);
  console.log(`  Organizer   : ${ORGANIZER_NAME} / PIN ${ORGANIZER_PIN}`);
  console.log(`  Team ALPHA  : invite code ALPH  (captain: ALICE / 1111)`);
  console.log(`  Team BETA   : invite code BETA  (captain: CAROL / 3333)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
