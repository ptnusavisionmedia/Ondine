import type { Metadata } from "next";
import { Scene } from "@/components/Art";
import { Crumbs } from "@/components/ProductBits";
import { STORE } from "@/lib/data";
import { waLink } from "@/lib/order";

export const metadata: Metadata = {
  title: "Toko kami",
  description: "Toko dan studio rangkai aquascape di Bandung: rangkai di studio, pasang di rumah, perawatan bulanan.",
  alternates: { canonical: "/toko-kami" },
};

export default function Page() {
  return (
    <section className="page wrap">
      <header className="page__head">
        <Crumbs items={[{ href: "/", label: "Beranda" }, { label: "Toko kami" }]} />
        <h1 className="page__title">Toko dan studio rangkai</h1>
        <p className="page__lead">
          Kami menanam, menata, dan merawat akuarium setiap hari. Yang kami jual adalah yang kami pakai sendiri.
        </p>
      </header>
      <div className="about__scene">
        <Scene kind="jungle" />
      </div>
      <div className="about">
        <div className="prose prose--serif">
          <h2>Mulai dari satu tangki di kamar kos</h2>
          <p>
            Toko ini lahir dari kebiasaan menukar potongan tanaman dengan sesama hobi. Kini kami menyediakan tanaman,
            batu, kayu, dan ikan dari pemasok yang sudah kami kenal bertahun-tahun, dan memeriksa semuanya sebelum
            dikemas.
          </p>
          <h2>Layanan studio</h2>
          <ul className="services">
            <li>
              <b>Rangkai di studio</b>
              <span>Anda pilih gaya dan ukuran, kami rangkai dan rawat sampai tangki matang, lalu antar.</span>
            </li>
            <li>
              <b>Pasang di rumah</b>
              <span>
                Teknisi datang membawa semua bahan dan menata di tempat. Tersedia untuk Bandung dan sekitarnya.
              </span>
            </li>
            <li>
              <b>Perawatan bulanan</b>
              <span>Pangkas, ganti air, bersihkan filter, dan cek parameter air setiap bulan.</span>
            </li>
          </ul>
          <a
            className="btn"
            href={waLink("Halo, saya mau tanya layanan rangkai aquascape.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanya layanan lewat WhatsApp
          </a>
        </div>
        <aside className="visit">
          <h2>Datang ke toko</h2>
          <dl>
            <div>
              <dt>Alamat</dt>
              <dd>{STORE.address}</dd>
            </div>
            <div>
              <dt>Jam buka</dt>
              <dd>{STORE.hours}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{STORE.phoneLabel}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{STORE.email}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
