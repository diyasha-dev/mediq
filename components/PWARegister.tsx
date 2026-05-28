"use client";

import { useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface VaultMed {
  id: string;
  drug_name: string;
  reminder_time?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

async function scheduleAlarms(reg: ServiceWorkerRegistration) {
  try {
    const res = await fetch("/api/vault");
    if (!res.ok) return;
    const data = await res.json();
    const meds: VaultMed[] = data.medications || [];

    // Build alarm list — only meds that have at least one reminder time
    const alarms = meds
      .filter((m) => m.reminder_time && m.reminder_time.length > 0)
      .map((m) => ({
        id: m.id,
        drugName: m.drug_name,
        times: m.reminder_time!.filter(Boolean),
      }));

    const sw = reg.active || reg.waiting || reg.installing;
    if (sw) {
      sw.postMessage({ type: "SCHEDULE_ALARMS", alarms });
    }
  } catch (err) {
    console.warn("[MedIQ] Could not schedule alarms:", err);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let reg: ServiceWorkerRegistration | null = null;

    const init = async () => {
      try {
        reg = await navigator.serviceWorker.register("/sw.js");
        console.log("[MedIQ PWA] Service worker registered:", reg.scope);

        // Wait until the SW is actually active
        await navigator.serviceWorker.ready;

        const granted = await requestNotificationPermission();
        if (granted && reg) {
          await scheduleAlarms(reg);
        }
      } catch (err) {
        console.warn("[MedIQ PWA] Service worker registration failed:", err);
      }
    };

    init();

    // Re-schedule whenever the user comes back to the tab
    // (picks up any new reminders added while on other tabs)
    const handleFocus = async () => {
      if (!reg) return;
      const swReg = await navigator.serviceWorker.ready;
      const granted = Notification.permission === "granted";
      if (granted) await scheduleAlarms(swReg);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return null;
}
