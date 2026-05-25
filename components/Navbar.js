"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Medicine Search" },
  { href: "/interactions", label: "Interactions" },
  { href: "/report", label: "Report" },
  { href: "/vault", label: "Vault" },
];

function UserButton({ user, handleSignOut, pathname }: { user: any, handleSignOut: () => void, pathname: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (user) {
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const initial = name.charAt(0).toUpperCase()

    return (
      <div className="hidden md:flex items-center gap-3 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-teal text-white text-xs font-bold flex items-center justify-center">
            {initial}
          </div>
          <span>{name.split(' ')[0]}</span>
          <svg className={`w-3.5 h-3.5 text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-10 z-40 w-52 bg-white border border-ash rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-ash">
                <p className="text-sm font-semibold text-charcoal truncate">{name}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/vault"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate hover:bg-stone-50 hover:text-charcoal transition-colors"
                >
                  <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Vault
                </Link>
                <Link
                  href="/report"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate hover:bg-stone-50 hover:text-charcoal transition-colors"
                >
                  <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Reports
                </Link>
              </div>
              <div className="border-t border-ash py-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-severity-major hover:bg-severity-major-bg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Not logged in — show Sign In button
  return (
    <Link
      href={`/auth?redirect=${pathname}`}
      className="hidden md:inline-flex items-center px-4 py-1.5 text-sm font-semibold text-white bg-teal rounded-lg hover:bg-teal-hover transition-colors"
    >
      Sign In
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setMobileOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "glass-nav-scrolled" : "glass-nav"
        }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}

        {/* Logo */}

        <Link href="/" className="flex items-center shrink-1 -ml-6">
          <div className="w-13 h-13 flex items-center justify-center">
            <img src="/logo.png" alt="MedIQ Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-3xl font-heading text-charcoal tracking-tight -ml-2">
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
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${active
                    ? "text-teal bg-teal-50"
                    : "text-slate hover:text-charcoal hover:bg-stone-100"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* UserButton + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <UserButton user={user} handleSignOut={handleSignOut} pathname={pathname} />
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
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${active
                      ? "text-teal bg-teal-50"
                      : "text-slate hover:text-charcoal hover:bg-stone-100"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <div className="mt-2 pt-2 border-t border-ash">
                <div className="px-4 py-2 mb-1">
                  <p className="text-sm font-semibold text-charcoal truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-severity-major hover:bg-severity-major-bg rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href={`/auth?redirect=${pathname}`}
                className="mt-2 text-center px-4 py-2.5 text-sm font-semibold text-white bg-teal rounded-lg hover:bg-teal-hover transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}