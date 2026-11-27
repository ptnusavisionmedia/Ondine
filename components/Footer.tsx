import Link from "next/link";
import { CATEGORIES, STORE } from "@/lib/data";
import { BrandLogo } from "./BrandLogo";
import { Wave } from "./Wave";

export function Footer() {
  return (
    <footer className="footer">
      <Wave from="var(--glass)" to="var(--abyss)" />
      <div className="wrap foot">
        <div className="foot__brand">
          <p className="logo">
            <BrandLogo />
          </p>
          <p>{STORE.tagline}.</p>
          <p>
            {STORE.address}
            <br />
            {STORE.hours}
          </p>
        </div>
        <nav aria-label="Belanja">
          <h2>Belanja</h2>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/toko/${c.id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informasi">
          <h2>Informasi</h2>
          <ul>
            <li>
              <Link href="/panduan">Panduan</Link>
            </li>
            <li>
              <Link href="/toko-kami">Toko kami</Link>
            </li>
            <li>
              <Link href="/keranjang">Keranjang</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2>Hubungi kami</h2>
          <ul>
            <li>
              <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer">
                WhatsApp {STORE.phoneLabel}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="wrap foot__fine">
        © {new Date().getFullYear()} {STORE.name}. Gambar produk adalah ilustrasi; foto asli dikirim admin
        sebelum pembayaran.
      </p>
    </footer>
  );
}
