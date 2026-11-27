"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartCount, useCart } from "@/lib/cart-store";
import { BrandLogo } from "./BrandLogo";

const NAV = [
  { href: "/toko", label: "Toko" },
  { href: "/panduan", label: "Panduan" },
  { href: "/toko-kami", label: "Toko kami" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const count = useCart((s) => cartCount(s.lines));

  // Keranjang disimpan di localStorage; dimuat setelah halaman terpasang agar tidak bentrok dengan SSR.
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  // Tutup menu setiap pindah halaman
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const section = "/" + (pathname.split("/")[1] ?? "");

  return (
    <header className="top" id="top">
      <Link className="logo" href="/" aria-label="Ondine, ke beranda">
        <BrandLogo inHeader />
      </Link>
      <nav className={`nav ${open ? "is-open" : ""}`} id="nav" aria-label="Utama">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={section === n.href ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="top__right">
        <Link className="cartbtn" href="/keranjang" aria-label={`Buka keranjang, ${count} barang`}>
          Keranjang{" "}
          <span key={count} className="cartbtn__n bump" hidden={count === 0}>
            {count}
          </span>
        </Link>
        <button
          className="menubtn"
          type="button"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpen((o) => !o)}
        >
          Menu
        </button>
      </div>
    </header>
  );
}
