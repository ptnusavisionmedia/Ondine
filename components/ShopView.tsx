"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, care, type CatId } from "@/lib/data";
import { PlateCard } from "./ProductBits";

type Sort = "rec" | "asc" | "desc" | "az";

export function ShopView({ cat }: { cat?: CatId }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>((params.get("urut") as Sort) ?? "rec");
  const [inStock, setInStock] = useState(params.get("tersedia") === "1");
  const [light, setLight] = useState(0);
  const [noCo2, setNoCo2] = useState(false);
  const term = useDeferredValue(q.trim().toLowerCase());

  // Simpan pencarian & urutan di URL supaya bisa dibagikan
  const syncUrl = (next: { q?: string; urut?: Sort; tersedia?: boolean }) => {
    const sp = new URLSearchParams(params.toString());
    const set = (k: string, v: string | undefined) => (v ? sp.set(k, v) : sp.delete(k));
    if ("q" in next) set("q", next.q?.trim() || undefined);
    if ("urut" in next) set("urut", next.urut === "rec" ? undefined : next.urut);
    if ("tersedia" in next) set("tersedia", next.tersedia ? "1" : undefined);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const items = useMemo(() => {
    let list = PRODUCTS.filter((p) => !cat || p.cat === cat);
    if (term) list = list.filter((p) => `${p.name} ${p.latin ?? ""}`.toLowerCase().includes(term));
    if (inStock) list = list.filter((p) => p.stock > 0);
    if (cat === "tanaman" && light) list = list.filter((p) => (care(p)?.light ?? 0) <= light);
    if (cat === "tanaman" && noCo2) list = list.filter((p) => care(p)?.co2 === 0);
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "id"));
    return list;
  }, [cat, term, inStock, light, noCo2, sort]);

  const qs = params.toString() ? `?${params.toString()}` : "";

  return (
    <div className="shop">
      <aside className="filters" aria-label="Filter produk">
        <div className="field">
          <label htmlFor="q">Cari produk</label>
          <input
            id="q"
            type="search"
            placeholder="Nama atau nama latin"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => syncUrl({ q })}
          />
        </div>
        <fieldset className="field">
          <legend>Kategori</legend>
          <ul className="catlist">
            <li>
              <Link href={`/toko${qs}`} aria-current={!cat ? "page" : undefined}>
                Semua<i>{PRODUCTS.length}</i>
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/toko/${c.id}${qs}`} aria-current={cat === c.id ? "page" : undefined}>
                  {c.name}
                  <i>{PRODUCTS.filter((p) => p.cat === c.id).length}</i>
                </Link>
              </li>
            ))}
          </ul>
        </fieldset>
        {cat === "tanaman" && (
          <>
            <fieldset className="field">
              <legend>Cahaya yang Anda punya</legend>
              <div className="seg" role="radiogroup" aria-label="Cahaya">
                {["Semua", "Rendah", "Sedang", "Tinggi"].map((label, v) => (
                  <label key={label}>
                    <input
                      type="radio"
                      name="light"
                      value={v}
                      checked={light === v}
                      onChange={() => setLight(v)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <p className="hint">Menampilkan tanaman yang bisa hidup pada cahaya itu.</p>
            </fieldset>
            <label className="check">
              <input type="checkbox" checked={noCo2} onChange={(e) => setNoCo2(e.target.checked)} /> Tanpa CO2
            </label>
          </>
        )}
        <div className="field">
          <label htmlFor="sort">Urutkan</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              const v = e.target.value as Sort;
              setSort(v);
              syncUrl({ urut: v });
            }}
          >
            <option value="rec">Rekomendasi</option>
            <option value="asc">Harga terendah</option>
            <option value="desc">Harga tertinggi</option>
            <option value="az">Nama A sampai Z</option>
          </select>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              setInStock(e.target.checked);
              syncUrl({ tersedia: e.target.checked });
            }}
          />{" "}
          Hanya yang tersedia
        </label>
      </aside>

      <div>
        <p className="count" role="status" aria-live="polite">
          {items.length} produk
        </p>
        <div className="grid grid--shop">
          {items.length ? (
            items.map((p) => <PlateCard key={p.id} p={p} />)
          ) : (
            <div className="empty">
              <h3>Tidak ada yang cocok</h3>
              <p>
                Coba kata kunci lain, longgarkan filter cahaya, atau hapus pilihan &quot;hanya yang
                tersedia&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
