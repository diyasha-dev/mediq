import Link from "next/link";

export default function ClosingCTA() {
  return (
    <section className="py-16 border-t border-ash">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-heading text-charcoal mb-4 tracking-tight">
          Ready to understand your medications?
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-severity-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            No account needed for search
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-severity-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Verified FDA / NHS data
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-severity-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Private by default
          </span>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors shadow-sm"
        >
          Try MedIQ Free
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
