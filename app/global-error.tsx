"use client";

import { Inter, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-center px-6">
        <div className="w-20 h-20 bg-severity-major-bg text-severity-major rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-4">
          A critical error occurred
        </h1>
        <p className="text-slate mb-8 max-w-md mx-auto">
          We encountered an unexpected error that prevented the app from loading.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-teal text-white font-semibold rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
