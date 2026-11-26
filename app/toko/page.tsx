import type { Metadata } from "next";
import { ShopPage } from "@/components/ShopPage";

export const metadata: Metadata = {
  title: "Semua produk",
  description: "Tanaman air, batu, kayu, substrat, ikan, udang, akuarium, dan peralatan aquascape.",
  alternates: { canonical: "/toko" },
};

export default function Page() {
  return <ShopPage />;
}
