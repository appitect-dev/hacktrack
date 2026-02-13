import { UserStats, MetricDefinition } from "@/lib/types";

interface LeaderboardProps {
  team: UserStats[];
  definitions: MetricDefinition[];
}

export function Leaderboard({ team, definitions }: LeaderboardProps) {
  if (team.length === 0) {
    return (
      <div className="text-text-muted text-center py-8">
        <p>[NO DATA]</p>
        <p className="text-xs mt-2">
          Waiting for operatives to report...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted uppercase tracking-widest text-xs border-b border-muted">
            <th className="text-left py-2 px-2">#</th>
            <th className="text-left py-2 px-2">HANDLE</th>
            {definitions.map((def) => (
              <th key={def.slug} className="text-right py-2 px-2">
                {def.name}
              </th>
            ))}
            <th className="text-right py-2 px-2">CAFF_SCORE</th>
          </tr>
        </thead>
        <tbody>
          {team.map((user, i) => (
            <tr
              key={user.id}
              className="border-b border-dim hover:bg-primary/5 transition-colors"
            >
              <td className="py-2 px-2 text-text-muted tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="py-2 px-2 font-bold" style={{ color: user.color }}>
                {user.name}
              </td>
              {definitions.map((def) => {
                const val = user.metrics[def.slug] || 0;
                return (
                  <td
                    key={def.slug}
                    className="text-right py-2 px-2 tabular-nums"
                    style={{ color: def.color }}
                  >
                    {def.inputType === "NUMBER" ? val.toFixed(1) : val}
                    {def.unit ? def.unit.charAt(0) : ""}
                  </td>
                );
              })}
              <td
                className="text-right py-2 px-2 tabular-nums font-bold glow-sm"
                style={{ color: user.color }}
              >
                {user.caffeineScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
