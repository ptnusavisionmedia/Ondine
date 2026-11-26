import type { ReactNode } from "react";

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    className="icon"
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const ICONS = {
  look: (
    <Icon>
      <circle cx="17" cy="17" r="10" />
      <path d="M25 25l10 10" />
      <path d="M11 17c2-3 4-3 6 0s4 3 6 0" />
    </Icon>
  ),
  air: (
    <Icon>
      <circle cx="14" cy="26" r="7" />
      <circle cx="27" cy="17" r="4.5" />
      <circle cx="22" cy="6" r="2.5" />
    </Icon>
  ),
  cal: (
    <Icon>
      <rect x="5" y="8" width="30" height="27" rx="4" />
      <path d="M5 17h30M13 4v7M27 4v7" />
      <path d="M12 25h4M18 25h4M24 25h4" />
    </Icon>
  ),
  play: (
    <Icon>
      <rect x="4" y="9" width="32" height="22" rx="5" />
      <path d="M17 15l8 5-8 5z" />
    </Icon>
  ),
};
