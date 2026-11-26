import type { CSSProperties } from "react";

/* Garis permukaan air sebagai pemisah antar bagian */
export function Wave({ from, to }: { from: string; to: string }) {
  return (
    <div className="wave" style={{ "--a": from, "--b": to } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 1440 56" preserveAspectRatio="none">
        <path d="M0 30C120 6 240 54 360 30S600 6 720 30 960 54 1080 30 1320 6 1440 30V56H0Z" />
      </svg>
    </div>
  );
}
