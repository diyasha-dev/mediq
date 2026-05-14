"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { addToast: () => {} };
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, { type = "success", action } = {}) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, action, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3 ${
              toast.exiting ? "toast-exit" : "toast-enter"
            } ${
              toast.type === "success"
                ? "bg-severity-safe-bg text-severity-safe border border-severity-safe/20"
                : toast.type === "error"
                ? "bg-severity-major-bg text-severity-major border border-severity-major/20"
                : "bg-white text-charcoal border border-ash"
            }`}
          >
            {toast.type === "success" && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action.onClick();
                  dismiss(toast.id);
                }}
                className="text-xs font-bold uppercase tracking-wider hover:underline shrink-0"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
