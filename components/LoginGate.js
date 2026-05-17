import Link from "next/link";

export default function LoginGate({ feature }) {
  return (
    <div className="relative">
      {/* Blurred placeholder content */}
      <div className="filter blur-sm pointer-events-none select-none" aria-hidden="true">
        <div className="bg-white border border-ash rounded-2xl p-6 mb-4">
          <div className="h-5 bg-stone-200 rounded w-48 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-stone-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Overlay card */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white border border-ash rounded-2xl shadow-lg px-8 py-7 text-center max-w-xs">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-charcoal mb-1">
            Sign in to access {feature}
          </h3>
          <p className="text-sm text-muted mb-5 leading-relaxed">
            Create a free account to keep your health data private and secure.
          </p>
        <Link
            href={`/auth?redirect=${typeof window !== 'undefined' ? window.location.pathname : '/'}`}
            className="block w-full py-2.5 text-sm font-semibold text-white bg-teal rounded-lg hover:bg-teal-hover transition-colors"
            >
            Sign In
            </Link>
            <Link
            href={`/auth?tab=signup&redirect=${typeof window !== 'undefined' ? window.location.pathname : '/'}`}
            className="block text-sm text-teal hover:text-teal-hover mt-3 transition-colors"
            >
            Create a free account
        </Link>
        </div>
      </div>
    </div>
  );
}
