import Link from "next/link";

const features = [
  {
    title: "Medicine Search",
    description:
      "Look up any drug — dosage guidelines, mechanism of action, side effects, and plain-English summaries designed for patients, not pharmacists.",
    cta: { label: "Search drugs →", href: "/search" },
    style: "md:col-span-5 bg-teal text-white min-h-[280px]",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    titleColor: "text-white",
    descColor: "text-teal-muted",
    ctaColor: "text-white underline decoration-white/40 hover:decoration-white",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
  },
  {
    title: "Interaction Checker",
    description:
      "Enter two or more drugs and instantly see interactions ranked by severity — MAJOR, MODERATE, MINOR, or SAFE — with evidence-backed explanations.",
    cta: { label: "Check interactions →", href: "/interactions" },
    style: "md:col-span-7 bg-charcoal text-white",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    titleColor: "text-white",
    descColor: "text-stone-400",
    ctaColor: "text-teal-light hover:text-teal-muted",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
  },
  {
    title: "Report Explainer",
    description:
      "Upload a blood test report and get a row-by-row breakdown in language your doctor forgot to use.",
    cta: { label: "Upload report →", href: "/report" },
    style: "bg-stone-50 border border-ash hover:border-teal hover:bg-teal-50/40",
    iconBg: "bg-teal-50",
    iconColor: "text-teal",
    titleColor: "text-charcoal",
    descColor: "text-slate",
    ctaColor: "text-teal hover:text-teal-hover",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    title: "Medication Vault",
    description:
      "Store your full medication list, set reminders, and get warned when your drugs conflict with each other.",
    cta: { label: "Open vault →", href: "/vault" },
    style: "bg-stone-50 border border-ash hover:border-teal hover:bg-teal-50/40",
    iconBg: "bg-teal-50",
    iconColor: "text-teal",
    titleColor: "text-charcoal",
    descColor: "text-slate",
    ctaColor: "text-teal hover:text-teal-hover",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    ),
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-20 bg-white border-y border-ash">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
            What MedIQ does
          </p>
          <h2 className="text-3xl md:text-4xl font-heading text-charcoal tracking-tight">
            Four tools. One purpose.
          </h2>
        </div>

        {/* Asymmetric bento grid from Folder A */}
        <div className="grid md:grid-cols-12 gap-5">
          {/* Large card */}
          <div className={`md:col-span-5 rounded-2xl p-8 flex flex-col justify-between group transition-colors ${features[0].style}`}>
            <div className={`w-10 h-10 rounded-xl ${features[0].iconBg} flex items-center justify-center mb-6`}>
              <svg className={`w-5 h-5 ${features[0].iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {features[0].icon}
              </svg>
            </div>
            <div>
              <h3 className={`text-xl font-bold ${features[0].titleColor} mb-2`}>{features[0].title}</h3>
              <p className={`${features[0].descColor} text-sm leading-relaxed mb-5`}>{features[0].description}</p>
              <Link href={features[0].cta.href} className={`text-sm font-semibold ${features[0].ctaColor} transition-all`}>
                {features[0].cta.label}
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="md:col-span-7 grid grid-rows-2 gap-5">
            {/* Dark card */}
            <div className={`rounded-2xl p-7 flex items-start gap-5 group transition-colors ${features[1].style}`}>
              <div className={`w-10 h-10 rounded-xl ${features[1].iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <svg className={`w-5 h-5 ${features[1].iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  {features[1].icon}
                </svg>
              </div>
              <div>
                <h3 className={`text-base font-bold ${features[1].titleColor} mb-1.5`}>{features[1].title}</h3>
                <p className={`${features[1].descColor} text-sm leading-relaxed`}>{features[1].description}</p>
                <Link href={features[1].cta.href} className={`mt-3 inline-block text-sm font-medium ${features[1].ctaColor} transition-colors`}>
                  {features[1].cta.label}
                </Link>
              </div>
            </div>

            {/* Two small cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.slice(2).map((f, i) => (
                <div key={i} className={`rounded-2xl p-6 group transition-colors ${f.style}`}>
                  <div className={`w-9 h-9 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                    <svg className={`w-4.5 h-4.5 ${f.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      {f.icon}
                    </svg>
                  </div>
                  <h3 className={`text-sm font-bold ${f.titleColor} mb-1.5`}>{f.title}</h3>
                  <p className={`${f.descColor} text-xs leading-relaxed`}>{f.description}</p>
                  <Link href={f.cta.href} className={`mt-3 inline-block text-xs font-semibold ${f.ctaColor} transition-colors`}>
                    {f.cta.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
