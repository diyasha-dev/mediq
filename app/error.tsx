"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-severity-major-bg text-severity-major rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-4">
        Something went wrong!
      </h1>
      <p className="text-slate mb-8 max-w-md mx-auto">
        We encountered an unexpected error. Please try again or return to the homepage.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-teal text-white font-semibold rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors w-full sm:w-auto"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-stone-100 text-charcoal font-semibold rounded-xl hover:bg-stone-200 transition-colors w-full sm:w-auto"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
