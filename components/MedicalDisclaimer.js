export default function MedicalDisclaimer({ variant = "default" }) {
  const isProminent = variant === "prominent";

  return (
    <div
      className={`rounded-xl px-5 py-4 flex gap-3 items-start ${
        isProminent
          ? "bg-amber-50 border border-amber-200"
          : "bg-white/60 border border-ash"
      }`}
    >
      <svg
        className={`w-5 h-5 mt-0.5 shrink-0 ${
          isProminent ? "text-amber-600" : "text-muted"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      <p
        className={`text-sm leading-relaxed ${
          isProminent ? "text-amber-800" : "text-muted"
        }`}
      >
        <span className="font-semibold">Medical Disclaimer: </span>
        MedIQ provides general health information for educational purposes only.
        It is not a substitute for professional medical advice, diagnosis, or
        treatment. Always consult a qualified healthcare provider before making
        changes to your medication regimen.
      </p>
    </div>
  );
}
