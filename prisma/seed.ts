import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const defaults = [
  {
    slug: "RED_BULL",
    name: "RED BULL",
    icon: "///",
    color: "#f87171",
    inputType: "COUNTER" as const,
    unit: "cans",
    isDefault: true,
  },
  {
    slug: "COFFEE",
    name: "COFFEE",
    icon: "///",
    color: "#facc15",
    inputType: "COUNTER" as const,
    unit: "cups",
    isDefault: true,
  },
  {
    slug: "SLEEP",
    name: "SLEEP",
    icon: "///",
    color: "#a855f7",
    inputType: "NUMBER" as const,
    unit: "hrs",
    isDefault: true,
  },
];

async function main() {
  for (const def of defaults) {
    await prisma.metricDefinition.upsert({
      where: { slug: def.slug },
      update: { color: def.color },
      create: def,
    });
  }
  console.log("[OK] Seeded default metric definitions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
