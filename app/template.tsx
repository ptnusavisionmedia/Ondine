import type { ReactNode } from "react";

/* Dipasang ulang setiap pindah halaman, jadi animasi masuk berjalan lagi. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
