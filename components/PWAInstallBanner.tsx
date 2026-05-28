"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed as PWA — don't show
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if user already dismissed (persisted in sessionStorage)
    if (sessionStorage.getItem("mediq-install-dismissed") === "1") {
      setDismissed(true);
      return;
    }

    // iOS detection
    const ua = navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // iOS doesn't fire beforeinstallprompt — show our custom guide
      // Wait a moment so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }

    // Android / Desktop — listen for the browser's native install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("mediq-install-dismissed", "1");
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible || dismissed || isStandalone) return null;

  // ── iOS banner ──────────────────────────────────────────────────────────────
  if (isIOS) {
    return (
      <div
        role="banner"
        aria-label="Install MedIQ app"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: "16px 20px 24px",
          background: "linear-gradient(135deg, #0D9488 0%, #0f766e 100%)",
          color: "#fff",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
          borderRadius: "20px 20px 0 0",
          animation: "slideUp 0.4s ease",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        <button
          onClick={dismiss}
          aria-label="Close install banner"
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192x192.png"
            alt="MedIQ icon"
            width={48}
            height={48}
            style={{ borderRadius: 12, flexShrink: 0 }}
          />
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Install MedIQ</p>
            <p style={{ fontSize: 13, opacity: 0.88, margin: "2px 0 0" }}>
              Get reminders &amp; offline access on your phone
            </p>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: "10px 14px",
          }}
        >
          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Tap{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 6,
                padding: "1px 6px",
                fontWeight: 600,
              }}
            >
              {/* iOS Share icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>{" "}
              Share
            </span>{" "}
            then{" "}
            <strong>&ldquo;Add to Home Screen&rdquo;</strong> to install MedIQ like
            a native app.
          </p>
        </div>
      </div>
    );
  }

  // ── Android / Desktop banner ────────────────────────────────────────────────
  return (
    <div
      role="banner"
      aria-label="Install MedIQ app"
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "min(420px, calc(100vw - 32px))",
        padding: "16px 18px",
        background: "linear-gradient(135deg, #0D9488 0%, #0f766e 100%)",
        color: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        animation: "slideUp 0.4s ease",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-192x192.png"
        alt="MedIQ"
        width={44}
        height={44}
        style={{ borderRadius: 10, flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Install MedIQ</p>
        <p style={{ fontSize: 12, opacity: 0.85, margin: "2px 0 0" }}>
          Add to home screen for reminders &amp; offline use
        </p>
      </div>

      <button
        id="pwa-install-btn"
        onClick={install}
        style={{
          flexShrink: 0,
          padding: "8px 14px",
          background: "#fff",
          color: "#0D9488",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Install
      </button>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          background: "rgba(255,255,255,0.15)",
          border: "none",
          borderRadius: "50%",
          width: 26,
          height: 26,
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
        }}
      >
        ✕
      </button>
    </div>
  );
}
