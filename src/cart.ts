import { BUNDLES, STORE, byId, code, minQty, rupiah } from "./data";

export interface Line { id: string; qty: number }

const KEY = "ondine.cart.v1";
let lines: Line[] = [];
const listeners = new Set<() => void>();

try {
  const raw = localStorage.getItem(KEY);
  if (raw) lines = (JSON.parse(raw) as Line[]).filter((l) => byId(l.id));
} catch { /* storage tidak tersedia, abaikan */ }

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* abaikan */ }
  listeners.forEach((fn) => fn());
}

export const cart = {
  get lines() { return lines; },
  get count() { return lines.reduce((a, l) => a + l.qty, 0); },
  get subtotal() { return lines.reduce((a, l) => a + (byId(l.id)?.price ?? 0) * l.qty, 0); },
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },
  qtyOf(id: string) { return lines.find((l) => l.id === id)?.qty ?? 0; },
  add(id: string, qty = 1) {
    const p = byId(id);
    if (!p) return;
    const l = lines.find((x) => x.id === id);
    const next = Math.min(p.stock, (l?.qty ?? 0) + qty);
    if (l) l.qty = next; else lines.push({ id, qty: Math.min(p.stock, Math.max(qty, minQty(p))) });
    save();
  },
  set(id: string, qty: number) {
    const p = byId(id);
    if (!p) return;
    if (qty <= 0) lines = lines.filter((l) => l.id !== id);
    else {
      const l = lines.find((x) => x.id === id);
      if (l) l.qty = Math.min(qty, p.stock);
    }
    save();
  },
  remove(id: string) { lines = lines.filter((l) => l.id !== id); save(); },
  clear() { lines = []; save(); },
  addBundle(id: string) {
    const b = BUNDLES.find((x) => x.id === id);
    if (b) { b.items.forEach((i) => cart.add(i.id, i.qty)); }
  },
};

export interface Customer {
  nama: string; hp: string; alamat: string; kota: string; kurir: string; catatan: string;
}

/* Pesan WhatsApp yang rapi dan mudah dibaca admin */
export function buildOrderText(c: Customer) {
  const rows = lines.map((l, i) => {
    const p = byId(l.id)!;
    return `${i + 1}. ${p.name} (${code(p)}) x${l.qty}  ${rupiah(p.price * l.qty)}`;
  });
  return [
    `Halo ${STORE.name}, saya mau pesan:`,
    "",
    ...rows,
    "",
    `Subtotal: ${rupiah(cart.subtotal)}`,
    "Ongkir: mohon dihitungkan",
    "",
    `Nama: ${c.nama}`,
    `WhatsApp: ${c.hp}`,
    `Alamat: ${c.alamat}, ${c.kota}`,
    `Kurir: ${c.kurir}`,
    c.catatan ? `Catatan: ${c.catatan}` : "",
  ].filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n");
}

export function waLink(text: string) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}
