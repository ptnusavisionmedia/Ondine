import { z } from "zod";
import { STORE, byId, code, rupiah } from "./data";
import type { Line } from "./cart-store";

export const COURIERS = ["JNE", "J&T", "SiCepat", "Gojek atau Grab (satu kota)", "Ambil di toko"] as const;

export const customerSchema = z.object({
  nama: z.string().trim().min(2, "Isi nama penerima."),
  hp: z
    .string()
    .trim()
    .refine((v) => /^(\+?62|0)8\d{7,12}$/.test(v.replace(/[\s-]/g, "")), "Isi nomor WhatsApp yang valid, misalnya 081234567890."),
  alamat: z.string().trim().min(10, "Tulis alamat selengkapnya, termasuk kecamatan dan kode pos."),
  kota: z.string().trim().min(3, "Isi kota atau kabupaten."),
  kurir: z.enum(COURIERS),
  catatan: z.string().trim().max(500, "Catatan maksimal 500 karakter."),
});

export type Customer = z.infer<typeof customerSchema>;

/* Pesan WhatsApp yang rapi dan mudah dibaca admin */
export function buildOrderText(lines: Line[], c: Customer) {
  let subtotal = 0;
  const rows = lines.map((l, i) => {
    const p = byId(l.id)!;
    subtotal += p.price * l.qty;
    return `${i + 1}. ${p.name} (${code(p)}) x${l.qty}  ${rupiah(p.price * l.qty)}`;
  });
  return [
    `Halo ${STORE.name}, saya mau pesan:`,
    "",
    ...rows,
    "",
    `Subtotal: ${rupiah(subtotal)}`,
    "Ongkir: mohon dihitungkan",
    "",
    `Nama: ${c.nama}`,
    `WhatsApp: ${c.hp}`,
    `Alamat: ${c.alamat}, ${c.kota}`,
    `Kurir: ${c.kurir}`,
    c.catatan ? `Catatan: ${c.catatan}` : "",
  ]
    .filter((x, i, a) => !(x === "" && a[i - 1] === ""))
    .join("\n");
}

export function waLink(text: string) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}
