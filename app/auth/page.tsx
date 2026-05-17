"use client";

// import { useState } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotMode, setForgotMode] = useState(false);

const router = useRouter();
const supabase = createSupabaseBrowserClient();
const isSignUp = mode === "signup";

// Get redirect URL from query params
// const searchParams = new URLSearchParams(
//   typeof window !== 'undefined' ? window.location.search : ''
// )
// const redirectTo = searchParams.get('redirect') || '/vault'
const [redirectTo, setRedirectTo] = useState('/vault')

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')
  if (redirect) setRedirectTo(redirect)
}, [])

  const handleGoogleLogin = async () => {
  const supabase = createSupabaseBrowserClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
    },
  })
 }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset email sent! Check your inbox.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (isSignUp && !name.trim()) {
      setError("Please enter your full name");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Save name to profiles table
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: name
        });
        setSuccess("Account created! Please check your email to confirm your account before signing in.");
        setEmail("");
        setPassword("");
        setName("");
      }
    } else {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError("Please confirm your email first. Check your inbox for the confirmation link.");
        } else if (error.message.includes('Invalid login')) {
          setError("Incorrect email or password. Please try again.");
        } else {
          setError(error.message);
        }
      } else {
          router.push(redirectTo);
      }
    }

    setLoading(false);
  };

  // Forgot password view
  if (forgotMode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white border border-ash rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 justify-center mb-7">
              <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-heading text-charcoal text-xl tracking-tight">
                Med<span className="text-teal">IQ</span>
              </span>
            </div>

            <h1 className="text-2xl font-heading text-charcoal text-center mb-1">Reset Password</h1>
            <p className="text-sm text-muted text-center mb-7">
              Enter your email and we'll send you a reset link.
            </p>

            {success && (
              <div className="bg-severity-safe-bg border border-severity-safe-border text-severity-safe px-4 py-3 rounded-xl mb-4 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-severity-major-bg border border-severity-major-border text-severity-major px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <><span className="spinner" />Sending…</> : "Send Reset Link"}
              </button>
            </form>

            <p className="text-sm text-muted text-center mt-5">
              <button
                onClick={() => { setForgotMode(false); setError(""); setSuccess(""); }}
                className="text-teal hover:text-teal-hover font-semibold transition-colors"
              >
                ← Back to Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm text-muted hover:text-slate mb-8 transition-colors self-start max-w-sm w-full mx-auto"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to MedIQ
      </Link>

      <div className="w-full max-w-sm bg-white border border-ash rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-8">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-7">
            <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-heading text-charcoal text-xl tracking-tight">
              Med<span className="text-teal">IQ</span>
            </span>
          </div>

          <h1 className="text-2xl font-heading text-charcoal text-center mb-1">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted text-center mb-7">
            {isSignUp
              ? "Start managing your medications for free."
              : "Sign in to your MedIQ account."}
          </p>

          {/* Success message */}
          {success && (
            <div className="bg-severity-safe-bg border border-severity-safe-border text-severity-safe px-4 py-3 rounded-xl mb-5 text-sm">
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-severity-major-bg border border-severity-major-border text-severity-major px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          {/* Benefits — signup only */}
          {isSignUp && (
            <div className="bg-teal-50 rounded-xl px-4 py-3 mb-5 space-y-1.5">
              {["Save your medication list", "Get drug interaction alerts", "Upload & explain blood reports"].map((b) => (
                <p key={b} className="text-sm text-teal flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {b}
                </p>
              ))}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-ash rounded-xl text-sm font-medium text-charcoal hover:bg-stone-50 hover:border-stone-200 active:bg-stone-100 transition-all mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ash" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-ash" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-charcoal">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(""); setSuccess(""); }}
                    className="text-sm text-teal hover:text-teal-hover transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-slate transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors mt-1 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <><span className="spinner" />{isSignUp ? "Creating…" : "Signing in…"}</>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-sm text-muted text-center mt-5">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setMode(isSignUp ? "signin" : "signup"); setError(""); setSuccess(""); }}
              className="text-teal hover:text-teal-hover font-semibold transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        {/* Terms */}
        <div className="border-t border-ash px-8 py-4">
          <p className="text-xs text-muted text-center leading-relaxed">
            By continuing, you agree to MedIQ's{" "}
            <a href="#" className="text-slate hover:text-teal underline transition-colors">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-slate hover:text-teal underline transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}