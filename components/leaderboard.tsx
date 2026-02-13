import { UserStats, MetricDefinition } from "@/lib/types";

interface LeaderboardProps {
  team: UserStats[];
  definitions: MetricDefinition[];
}

export function Leaderboard({ team, definitions }: LeaderboardProps) {
  if (team.length === 0) {
    return (
      <div className="text-text-muted text-center py-8">
        <p className="text-lg font-bold">[NO DATA]</p>
        <p className="text-sm font-bold mt-2">
          Waiting for operatives to report...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="text-text-muted uppercase tracking-widest text-sm font-bold border-b-2 border-muted">
            <th className="text-left py-3 px-3">#</th>
            <th className="text-left py-3 px-3">HANDLE</th>
            {definitions.map((def) => (
              <th key={def.slug} className="text-right py-3 px-3">
                {def.name}
              </th>
            ))}
            <th className="text-right py-3 px-3">CAFF_SCORE</th>
          </tr>
        </thead>
        <tbody>
          {team.map((user, i) => (
            <tr
              key={user.id}
              className="border-b-2 border-dim hover:bg-primary/5 transition-colors"
            >
              <td className="py-3 px-3 text-text-muted font-bold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="py-3 px-3 font-black text-lg" style={{ color: user.color }}>
                {user.name}
              </td>
              {definitions.map((def) => {
                const val = user.metrics[def.slug] || 0;
                return (
                  <td
                    key={def.slug}
                    className="text-right py-3 px-3 tabular-nums font-bold text-lg"
                    style={{ color: def.color }}
                  >
                    {def.inputType === "NUMBER" ? val.toFixed(1) : val}
                    {def.unit ? def.unit.charAt(0) : ""}
                  </td>
                );
              })}
              <td
                className="text-right py-3 px-3 tabular-nums font-black text-lg glow-sm"
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
