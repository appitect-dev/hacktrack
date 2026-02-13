export function AsciiHeader({ title }: { title: string }) {
  const line = "+" + "-".repeat(title.length + 2) + "+";
  return (
    <pre className="text-primary glow-sm text-sm leading-tight">
      {line}
      {"\n"}| {title} |{"\n"}
      {line}
    </pre>
  );
}
