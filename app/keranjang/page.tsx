import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Keranjang",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <section className="page wrap">
      <CartView />
    </section>
  );
}
