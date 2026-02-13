import { UserStats, MetricDefinition } from "@/lib/types";

interface LeaderboardProps {
  team: UserStats[];
  definitions: MetricDefinition[];
}

export function Leaderboard({ team, definitions }: LeaderboardProps) {
  if (team.length === 0) {
    return (
      <div className="text-text-muted text-center py-4">
        <p className="text-lg font-black">[NO DATA]</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {team.map((user, i) => (
        <div
          key={user.id}
          className="border-b-2 border-dim pb-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-lg font-black tabular-nums">
                #{String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="font-black text-xl tracking-wide"
                style={{ color: user.color }}
              >
                {user.name}
              </span>
            </div>
            <span
              className="text-2xl font-black tabular-nums glow-sm"
              style={{ color: user.color }}
            >
              {user.caffeineScore}
            </span>
          </div>
          <div className="flex gap-3 mt-0.5">
            {definitions.map((def) => {
              const val = user.metrics[def.slug] || 0;
              return (
                <span
                  key={def.slug}
                  className="text-sm font-black tabular-nums"
                  style={{ color: def.color }}
                >
                  {def.name}: {def.inputType === "NUMBER" ? val.toFixed(1) : val}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
