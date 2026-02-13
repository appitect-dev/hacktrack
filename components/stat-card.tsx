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
      <div className="text-text-muted text-sm font-bold uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold">{icon}</span>
        <span
          className="text-4xl font-black tabular-nums glow-sm"
          style={{ color }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-text-muted text-base font-bold">{unit}</span>
        )}
      </div>
    </div>
  );
}
