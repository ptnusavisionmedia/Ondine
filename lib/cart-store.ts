"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BUNDLES, byId, minQty } from "./data";

export interface Line {
  id: string;
  qty: number;
}

interface CartState {
  lines: Line[];
  add: (id: string, qty?: number) => void;
  set: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  addBundle: (id: string) => void;
}

const addLine = (lines: Line[], id: string, qty: number): Line[] => {
  const p = byId(id);
  if (!p) return lines;
  const existing = lines.find((l) => l.id === id);
  if (existing) {
    return lines.map((l) => (l.id === id ? { ...l, qty: Math.min(p.stock, l.qty + qty) } : l));
  }
  return [...lines, { id, qty: Math.min(p.stock, Math.max(qty, minQty(p))) }];
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (id, qty = 1) => set((s) => ({ lines: addLine(s.lines, id, qty) })),
      set: (id, qty) =>
        set((s) => {
          const p = byId(id);
          if (!p) return s;
          if (qty <= 0) return { lines: s.lines.filter((l) => l.id !== id) };
          return { lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, p.stock) } : l)) };
        }),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      addBundle: (id) =>
        set((s) => {
          const b = BUNDLES.find((x) => x.id === id);
          if (!b) return s;
          return { lines: b.items.reduce((acc, i) => addLine(acc, i.id, i.qty), s.lines) };
        }),
    }),
    {
      name: "ondine.cart.v1",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Versi lama menyimpan array mentah; versi baru menyimpan { lines }
      migrate: (persisted) => {
        const raw = Array.isArray(persisted) ? persisted : (persisted as { lines?: Line[] })?.lines;
        return { lines: (raw ?? []).filter((l) => byId(l.id)) } as CartState;
      },
      partialize: (s) => ({ lines: s.lines }) as CartState,
    },
  ),
);

export const cartCount = (lines: Line[]) => lines.reduce((a, l) => a + l.qty, 0);
export const cartSubtotal = (lines: Line[]) => lines.reduce((a, l) => a + (byId(l.id)?.price ?? 0) * l.qty, 0);
