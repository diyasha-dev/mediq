export default function SeverityBadge({ level, size = "sm" }) {
  const config = {
    MAJOR: {
      label: "MAJOR",
      bg: "bg-severity-major-bg",
      text: "text-severity-major",
      border: "border-severity-major-border",
      dot: "bg-severity-major",
    },
    MODERATE: {
      label: "MODERATE",
      bg: "bg-severity-moderate-bg",
      text: "text-severity-moderate",
      border: "border-severity-moderate-border",
      dot: "bg-severity-moderate",
    },
    MINOR: {
      label: "MINOR",
      bg: "bg-severity-minor-bg",
      text: "text-severity-minor",
      border: "border-severity-minor-border",
      dot: "bg-severity-minor",
    },
    SAFE: {
      label: "SAFE",
      bg: "bg-severity-safe-bg",
      text: "text-severity-safe",
      border: "border-severity-safe-border",
      dot: "bg-severity-safe",
    },
  };

  const c = config[level] || config.SAFE;
  const sizeClass = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClass} font-bold tracking-wide uppercase rounded-full border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
      {c.label}
    </span>
  );
}
