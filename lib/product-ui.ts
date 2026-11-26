import { BUNDLES, byId, type CatId } from "./data";

export const LIGHT = ["", "Rendah", "Sedang", "Tinggi"];
export const CO2 = ["Tidak wajib", "Disarankan", "Wajib"];

export function bundleTotals(id: string) {
  const b = BUNDLES.find((x) => x.id === id)!;
  const sum = b.items.reduce((a, i) => a + byId(i.id)!.price * i.qty, 0);
  return { sum, final: sum * (1 - b.discount), save: sum * b.discount };
}

export const SHIP_NOTE: Record<CatId, string> = {
  tanaman: "Dikirim basah, dibungkus tisu lembap, bebas siput. Kirim Senin sampai Rabu.",
  hardscape: "Dikemas per potong dengan busa. Berat dihitung saat penimbangan, ongkir dikonfirmasi admin.",
  substrat: "Dikemas karung kedap air. Ongkir mengikuti berat.",
  fauna: "Dikirim dengan oksigen, Senin sampai Rabu. Garansi mati saat tiba, wajib video unboxing.",
  akuarium: "Dikirim dengan kayu pelindung. Hanya Jawa dan Bali, atau ambil di toko.",
  peralatan: "Dikemas rapi dengan busa pelindung. Garansi alat 3 bulan.",
};
