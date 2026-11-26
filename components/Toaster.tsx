"use client";

import { useToast } from "@/lib/toast-store";

export function Toaster() {
  const { msg, on } = useToast();
  return (
    <div className={`toast ${on ? "is-on" : ""}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
