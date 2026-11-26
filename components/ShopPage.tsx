import { Suspense } from "react";
import { CATEGORIES, PRODUCTS, byId, catName, type CatId } from "@/lib/data";
import { Plate } from "./Art";
import { Crumbs, PlateCard } from "./ProductBits";
import { ShopView } from "./ShopView";

/* Kerangka halaman katalog; daftar & filter interaktif ada di ShopView (klien). */
export function ShopPage({ cat }: { cat?: CatId }) {
  const heading = cat ? catName(cat) : "Semua produk";
  const sample = cat ? PRODUCTS.find((p) => p.cat === cat)! : byId("batu-seiryu")!;
  return (
    <section className="page wrap">
      <header className="page__head page__head--split">
        <div>
          <Crumbs
            items={[
              { href: "/", label: "Beranda" },
              cat ? { href: "/toko", label: "Toko" } : { label: "Toko" },
              ...(cat ? [{ label: heading }] : []),
            ]}
          />
          <h1 className="page__title">{heading}</h1>
          <p className="page__lead">
            {cat
              ? CATEGORIES.find((c) => c.id === cat)!.blurb
              : "Seluruh rak dari tangki sampai ikan. Gunakan filter untuk mempersempit."}
          </p>
        </div>
        <div className="page__plate" data-cat={sample.cat} aria-hidden="true">
          <Plate p={sample} />
        </div>
      </header>
      {/* Fallback statis berisi semua produk supaya HTML hasil build tetap lengkap untuk mesin pencari */}
      <Suspense
        fallback={
          <div className="grid grid--shop">
            {PRODUCTS.filter((p) => !cat || p.cat === cat).map((p) => (
              <PlateCard key={p.id} p={p} />
            ))}
          </div>
        }
      >
        <ShopView cat={cat} />
      </Suspense>
    </section>
  );
}
