import Link from "next/link";
import InteractionWidget from "./InteractionWidget";

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Soft background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(13,148,136,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left — Copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-muted rounded-full text-xs font-semibold text-teal mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            Free to use · No account required to search
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading text-charcoal leading-[1.08] mb-5 tracking-tight">
            Know your{" "}
            <span className="text-teal">medicine</span>{" "}
            better.
          </h1>

          <p className="text-lg text-slate leading-relaxed mb-8 max-w-md">
            MedIQ decodes prescriptions, checks dangerous drug combinations,
            and turns blood test numbers into plain language — all verified
            against FDA and NHS data.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link
              href="/search"
              className="px-7 py-3.5 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors shadow-sm"
            >
              Try MedIQ Free →
            </Link>
            <Link
              href="/interactions"
              className="px-6 py-3.5 text-sm font-medium text-charcoal bg-white border border-ash rounded-xl hover:bg-stone-50 hover:border-stone-200 transition-colors"
            >
              Check drug interactions
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-5 mt-8">
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Evidence-based data
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private by default
            </div>
          </div>
        </div>

        {/* Right — Live interaction widget */}
        <div className="flex justify-center md:justify-end">
          <InteractionWidget />
        </div>
      </div>
    </section>
  );
}
