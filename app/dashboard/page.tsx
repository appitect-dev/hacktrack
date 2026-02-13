import { prisma } from "@/lib/prisma";
import { AsciiHeader } from "@/components/ascii-header";
import { Leaderboard } from "@/components/leaderboard";
import { TeamBarChartWrapper } from "@/components/team-bar-chart-wrapper";
import { UserStats, MetricDefinition } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const definitions = await prisma.metricDefinition.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const slugs = definitions.map((d) => d.slug);

  const users = await prisma.user.findMany({
    include: { metrics: true },
    orderBy: { createdAt: "asc" },
  });

  const team: UserStats[] = users.map((user) => {
    const metrics: Record<string, number> = {};
    for (const slug of slugs) metrics[slug] = 0;
    for (const m of user.metrics) {
      if (metrics[m.type] !== undefined) {
        metrics[m.type] += m.value;
      }
    }

    return {
      id: user.id,
      name: user.name,
      color: user.color,
      metrics,
      caffeineScore: (metrics["RED_BULL"] || 0) * 2 + (metrics["COFFEE"] || 0),
    };
  });

  team.sort((a, b) => b.caffeineScore - a.caffeineScore);

  const totals: Record<string, number> = {};
  for (const slug of slugs) totals[slug] = 0;
  for (const user of team) {
    for (const slug of slugs) {
      totals[slug] += user.metrics[slug] || 0;
    }
  }

  const defs: MetricDefinition[] = definitions.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    icon: d.icon,
    color: d.color,
    inputType: d.inputType,
    unit: d.unit,
    isDefault: d.isDefault,
  }));

  const teamChartData = team.map((u) => ({
    name: u.name,
    ...u.metrics,
  }));

  return (
    <div className="space-y-8">
      <AsciiHeader title="TEAM DASHBOARD" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {defs.map((def) => (
          <div key={def.slug} className="neon-border rounded p-4 text-center">
            <div className="text-text-muted text-xs uppercase tracking-widest mb-1">
              TOTAL {def.name}
            </div>
            <div
              className="text-2xl font-bold tabular-nums glow-sm"
              style={{ color: def.color }}
            >
              {def.inputType === "NUMBER"
                ? (totals[def.slug] || 0).toFixed(1)
                : totals[def.slug] || 0}
              {def.unit ? <span className="text-sm text-text-muted ml-1">{def.unit}</span> : null}
            </div>
          </div>
        ))}
      </div>

      <TeamBarChartWrapper data={teamChartData} definitions={defs} />

      <Leaderboard team={team} definitions={defs} />

      <div className="text-text-muted text-xs text-center">
        CAFF_SCORE = (RED_BULL * 2) + COFFEE // HIGHER = MORE FUEL
      </div>
    </div>
  );
}
