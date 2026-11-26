"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { byId, code, minQty, rupiah } from "@/lib/data";
import { toast } from "@/lib/toast-store";
import { BodyClass } from "./BodyClass";

/* Pemilih jumlah + tombol beli di halaman produk, termasuk bar lengket di layar kecil. */
export function ProductBuy({ id, children }: { id: string; children?: React.ReactNode }) {
  const p = byId(id)!;
  const lo = minQty(p);
  const [qty, setQty] = useState(String(lo));
  const inCart = useCart((s) => s.lines.find((l) => l.id === id)?.qty ?? 0);
  const add = useCart((s) => s.add);
  const out = p.stock <= 0;

  const clamp = (v: string | number) => Math.min(p.stock, Math.max(lo, Math.floor(Number(v) || lo)));

  const onAdd = () => {
    const n = clamp(qty);
    setQty(String(n));
    const before = useCart.getState().lines.find((l) => l.id === id)?.qty ?? 0;
    add(p.id, n);
    const after = useCart.getState().lines.find((l) => l.id === id)?.qty ?? 0;
    toast(after - before < n ? `Hanya ${p.stock} tersedia. Keranjang diperbarui.` : `${p.name} masuk keranjang`);
  };

  return (
    <>
      <BodyClass name="has-bar" />
      <div className="buy">
        <div className="qty" role="group" aria-label="Jumlah">
          <button type="button" aria-label="Kurangi" onClick={() => setQty(String(clamp(Number(qty) - 1)))}>
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={p.stock}
            value={qty}
            aria-label="Jumlah"
            onChange={(e) => setQty(e.target.value)}
            onBlur={() => setQty(String(clamp(qty)))}
          />
          <button type="button" aria-label="Tambah" onClick={() => setQty(String(clamp(Number(qty) + 1)))}>
            +
          </button>
        </div>
        <button className="btn btn--lg" type="button" disabled={out} onClick={onAdd}>
          {out ? "Stok habis" : "Tambah ke keranjang"}
        </button>
      </div>
      <p className="pdp__stock">
        {children} <span>{inCart ? `${inCart} sudah di keranjang` : ""}</span>
        <span className="pdp__code">Kode {code(p)}</span>
      </p>

      <div className="pdp__bar">
        <p className="pdp__barinfo">
          <b>{rupiah(p.price)}</b>
          <small>{p.unit}</small>
        </p>
        <button className="btn" type="button" disabled={out} onClick={onAdd}>
          Tambah
        </button>
      </div>
    </>
  );
}
