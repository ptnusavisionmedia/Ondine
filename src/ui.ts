let timer = 0;

export function toast(msg: string) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove("is-on"), 2600);
}

const svg = (inner: string) =>
  `<svg class="icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  look: svg(`<circle cx="17" cy="17" r="10"/><path d="M25 25l10 10"/><path d="M11 17c2-3 4-3 6 0s4 3 6 0"/>`),
  air: svg(`<circle cx="14" cy="26" r="7"/><circle cx="27" cy="17" r="4.5"/><circle cx="22" cy="6" r="2.5"/>`),
  cal: svg(`<rect x="5" y="8" width="30" height="27" rx="4"/><path d="M5 17h30M13 4v7M27 4v7"/><path d="M12 25h4M18 25h4M24 25h4" />`),
  play: svg(`<rect x="4" y="9" width="32" height="22" rx="5"/><path d="M17 15l8 5-8 5z"/>`),
};

/* Tanda merek: batu bulat dengan satu helai daun */
export const MARK = `<svg class="mark" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="19" r="8" fill="currentColor"/><path d="M14 11C14 6 17 3 22 2c0 5-3 8-8 9z" fill="var(--lime)"/></svg>`;
