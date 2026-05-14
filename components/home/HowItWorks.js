const steps = [
  {
    num: 1,
    title: "Search or Upload",
    description:
      "Type a medicine name like Dolo 650, enter a drug pair to check, or drag and drop your blood test PDF. MedIQ handles text and images.",
    iconBg: "bg-teal text-white shadow-md shadow-teal/20",
    numBorder: "border-teal text-teal",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
  },
  {
    num: 2,
    title: "Verified Data Check",
    description:
      "Information is cross-referenced against pharmaceutical databases, clinical guidelines, and peer-reviewed interaction studies — including FDA and NHS sources.",
    iconBg: "bg-charcoal text-white shadow-md",
    numBorder: "border-charcoal text-charcoal",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    num: 3,
    title: "Plain English Results",
    description:
      "No jargon. Every finding is written so you can understand it — and know exactly what to ask your doctor next.",
    iconBg: "bg-teal-50 border-2 border-teal-muted text-teal",
    numBorder: "border-teal-muted text-teal",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
            The process
          </p>
          <h2 className="text-3xl md:text-4xl font-heading text-charcoal tracking-tight">
            Plain answers in three steps.
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-ash z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${step.iconBg} mb-6 relative`}>
                  <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    {step.icon}
                  </svg>
                  <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 ${step.numBorder} text-xs font-bold flex items-center justify-center`}>
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-2">{step.title}</h3>
                <p className="text-sm text-slate leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
