interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  unit?: string;
  color?: string;
}

export function StatCard({ label, value, unit, color = "#00ff41" }: StatCardProps) {
  return (
    <div className="neon-border rounded p-3" style={{ borderColor: color }}>
      <div className="text-text-muted text-sm font-black uppercase tracking-widest">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-4xl font-black tabular-nums glow-sm"
          style={{ color }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-text-muted text-base font-black">{unit}</span>
        )}
      </div>
    </div>
  );
}
