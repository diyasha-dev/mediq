"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Medicine Search" },
  { href: "/interactions", label: "Interactions" },
  { href: "/report", label: "Report" },
  { href: "/vault", label: "Vault" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "glass-nav-scrolled" : "glass-nav"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xl font-heading text-charcoal tracking-tight">
            Med<span className="text-teal">IQ</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-teal bg-teal-50"
                    : "text-slate hover:text-charcoal hover:bg-stone-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Sign In + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="hidden md:inline-flex items-center px-4 py-1.5 text-sm font-semibold text-white bg-teal rounded-lg hover:bg-teal-hover transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate hover:text-charcoal rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ash bg-ivory/95 backdrop-blur-sm">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "text-teal bg-teal-50"
                      : "text-slate hover:text-charcoal hover:bg-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/auth"
              className="mt-2 text-center px-4 py-2.5 text-sm font-semibold text-white bg-teal rounded-lg hover:bg-teal-hover transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
