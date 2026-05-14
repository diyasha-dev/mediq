const FILTERS = ["Overview", "Dosage", "Side Effects", "Warnings"];

export default function FilterChips({ active, onToggle }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted mr-1">Jump to:</span>
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() => onToggle(filter)}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all ${
            active.includes(filter)
              ? "bg-teal text-white border-teal"
              : "bg-white text-slate border-ash hover:border-teal hover:text-teal"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
