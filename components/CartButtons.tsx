"use client";

import type { ReactNode } from "react";
import { useCart } from "@/lib/cart-store";
import { BUNDLES, byId } from "@/lib/data";
import { toast } from "@/lib/toast-store";

interface Props {
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}

export function AddButton({ id, ...rest }: Props & { id: string }) {
  const add = useCart((s) => s.add);
  return (
    <button
      type="button"
      className={rest.className}
      disabled={rest.disabled}
      onClick={() => {
        const p = byId(id);
        if (!p) return;
        add(p.id, 1);
        toast(`${p.name} masuk keranjang`);
      }}
    >
      {rest.children}
    </button>
  );
}

export function BundleButton({ id, ...rest }: Props & { id: string }) {
  const addBundle = useCart((s) => s.addBundle);
  return (
    <button
      type="button"
      className={rest.className}
      onClick={() => {
        const b = BUNDLES.find((x) => x.id === id);
        if (!b) return;
        addBundle(b.id);
        toast(`${b.name} masuk keranjang`);
      }}
    >
      {rest.children}
    </button>
  );
}
