export default function StatusBadge({ status }) {
  const config = {
    HIGH: {
      bg: "bg-status-high-bg",
      text: "text-status-high",
      border: "border-status-high/20",
      icon: "↑",
    },
    LOW: {
      bg: "bg-status-low-bg",
      text: "text-status-low",
      border: "border-status-low/20",
      icon: "↓",
    },
    NORMAL: {
      bg: "bg-status-normal-bg",
      text: "text-status-normal",
      border: "border-status-normal/20",
      icon: "✓",
    },
  };

  const c = config[status] || config.NORMAL;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className="text-[10px]">{c.icon}</span>
      {status}
    </span>
  );
}
