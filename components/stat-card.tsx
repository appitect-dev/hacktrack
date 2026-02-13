interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  unit?: string;
  color?: string;
}

export function StatCard({ icon, label, value, unit, color = "#00ff41" }: StatCardProps) {
  return (
    <div className="neon-border rounded p-4" style={{ borderColor: color }}>
      <div className="text-text-muted text-xs uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg">{icon}</span>
        <span
          className="text-3xl font-bold tabular-nums glow-sm"
          style={{ color }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-text-muted text-sm">{unit}</span>
        )}
      </div>
    </div>
  );
}
