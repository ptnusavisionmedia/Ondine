import Link from "next/link";
import { Plate, Scene } from "@/components/Art";
import { BundleButton, AddButton } from "@/components/CartButtons";
import { Hero } from "@/components/Hero";
import { ICONS } from "@/components/Icons";
import { PlateCard } from "@/components/ProductBits";
import { StyleTabs } from "@/components/StyleTabs";
import { Wave } from "@/components/Wave";
import { BUNDLES, CATEGORIES, GUIDES, PRODUCTS, byId, code, rupiah, type CatId } from "@/lib/data";
import { waLink } from "@/lib/order";
import { bundleTotals } from "@/lib/product-ui";

const CAT_AREA: Record<CatId, string> = {
  tanaman: "tan",
  hardscape: "har",
  substrat: "sub",
  fauna: "fau",
  akuarium: "aqu",
  peralatan: "per",
};

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.tag === "Terlaris" || p.tag === "Baru").slice(0, 8);
  const spec = byId("crystal-red-shrimp")!;

  return (
    <>
      <Hero />
      <Wave from="var(--abyss)" to="var(--glass)" />

      <section className="band band--first" id="kategori">
        <div className="wrap">
          <header className="sec-head">
            <h2 className="sec-title">Belanja menurut bahan</h2>
            <p className="sec-lead">
              Enam rak, satu urutan: dari tangki sampai ikan. Stok tampil sesuai kondisi toko hari ini.
            </p>
          </header>
          <div className="cats">
            {CATEGORIES.map((c) => {
              const sample = PRODUCTS.find(
                (p) => p.cat === c.id && (c.id === "tanaman" ? p.id === "rotala-rotundifolia-hra" : true),
              )!;
              const n = PRODUCTS.filter((p) => p.cat === c.id).length;
              return (
                <Link key={c.id} className={`cat cat--${CAT_AREA[c.id]}`} data-cat={c.id} href={`/toko/${c.id}`}>
                  <span className="cat__art">
                    <Plate p={sample} />
                  </span>
                  <span className="cat__txt">
                    <b>{c.name}</b>
                    <small>{n} produk</small>
                    <span>{c.blurb}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band band--pad0">
        <div className="wrap specimen">
          <Link className="specimen__art" data-cat={spec.cat} href={`/produk/${spec.id}`} aria-label={spec.name}>
            <Plate p={spec} />
            <span className="plate__no">{code(spec)}</span>
          </Link>
          <div className="specimen__body">
            <p className="specimen__pick">Pilihan penata pekan ini</p>
            <h2 className="specimen__title">{spec.name}</h2>
            <p className="latin latin--lg">{spec.latin}</p>
            <blockquote className="specimen__note">
              Kami memeliharanya tiga bulan di tangki soil 40 cm sebelum menjualnya. Tangguh bila airnya stabil, dan
              paling indah dilihat dari samping saat lampu menyala.
            </blockquote>
            <dl className="specimen__facts">
              {spec.specs.slice(1, 4).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="specimen__buy">
              <p className="price price--lg">
                {rupiah(spec.price)}
                <small>{spec.unit}</small>
              </p>
              <AddButton id={spec.id} className="btn btn--lg">
                Tambah ke keranjang
              </AddButton>
              <Link className="link" href={`/produk/${spec.id}`}>
                Lihat detail
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--tint">
        <div className="wrap">
          <header className="sec-head">
            <h2 className="sec-title">Paket siap rakit</h2>
            <p className="sec-lead">
              Satu klik memasukkan semua isi paket ke keranjang. Hemat 6 sampai 10 persen dibanding beli satuan.
            </p>
          </header>
          <div className="bundles">
            {BUNDLES.map((b) => {
              const t = bundleTotals(b.id);
              return (
                <article className="bundle" key={b.id}>
                  <div className="bundle__main">
                    <h3>{b.name}</h3>
                    <p>{b.note}</p>
                  </div>
                  <ul className="bundle__list">
                    {b.items.map((i) => (
                      <li key={i.id}>
                        <span>{byId(i.id)!.name}</span>
                        <i>x{i.qty}</i>
                      </li>
                    ))}
                  </ul>
                  <div className="bundle__buy">
                    <p className="bundle__old">{rupiah(t.sum)}</p>
                    <p className="bundle__price">{rupiah(t.final)}</p>
                    <p className="bundle__save">Hemat {rupiah(t.save)}</p>
                    <BundleButton id={b.id} className="btn">
                      Masukkan paket
                    </BundleButton>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band" id="gaya">
        <div className="wrap">
          <header className="sec-head">
            <h2 className="sec-title">Belum tahu mau tata letak seperti apa?</h2>
            <p className="sec-lead">
              Tiga gaya yang paling sering kami rangkai. Pilih satu, lalu lihat bahan yang dibutuhkan.
            </p>
          </header>
          <StyleTabs />
        </div>
      </section>

      <section className="band band--pad0">
        <div className="wrap">
          <header className="sec-head sec-head--row">
            <div>
              <h2 className="sec-title">Paling sering dibawa pulang</h2>
              <p className="sec-lead">Pilihan pemula dan pendatang baru minggu ini.</p>
            </div>
            <Link className="link" href="/toko">
              Lihat semua produk
            </Link>
          </header>
          <div className="grid">
            {featured.map((p) => (
              <PlateCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      <Wave from="var(--glass)" to="var(--tank)" />
      <section className="band band--tank band--flush">
        <div className="wrap care">
          <header>
            <h2 className="sec-title">Cara kami mengirim makhluk hidup</h2>
            <p className="sec-lead">
              Tanaman, ikan, dan udang bepergian dalam kondisi terbaik. Ini yang kami lakukan.
            </p>
          </header>
          <dl className="care__list">
            <div>
              {ICONS.look}
              <dt>Karantina 14 hari</dt>
              <dd>Setiap ikan dan udang diamati dua minggu sebelum dijual. Yang sakit tidak masuk etalase.</dd>
            </div>
            <div>
              {ICONS.air}
              <dt>Kemasan oksigen</dt>
              <dd>Plastik berisi oksigen dalam styrofoam, dengan pemanas sekali pakai bila cuaca dingin.</dd>
            </div>
            <div>
              {ICONS.cal}
              <dt>Kirim Senin sampai Rabu</dt>
              <dd>Supaya paket tidak menginap di gudang kurir akhir pekan. Pesanan Kamis dikirim hari Senin.</dd>
            </div>
            <div>
              {ICONS.play}
              <dt>Garansi mati saat tiba</dt>
              <dd>Rekam video saat membuka paket dan kirim dalam 24 jam. Kami ganti atau kembalikan dananya.</dd>
            </div>
          </dl>
        </div>
      </section>
      <Wave from="var(--tank)" to="var(--glass)" />

      <section className="band band--flush2">
        <div className="wrap">
          <header className="sec-head sec-head--row">
            <div>
              <h2 className="sec-title">Panduan dari meja kerja kami</h2>
              <p className="sec-lead">Tulisan pendek untuk pertanyaan yang paling sering diajukan pelanggan.</p>
            </div>
            <Link className="link" href="/panduan">
              Semua panduan
            </Link>
          </header>
          <ul className="guide-cards">
            {GUIDES.slice(0, 3).map((g) => {
              const p = byId(g.art)!;
              return (
                <li key={g.id}>
                  <Link href={`/panduan/${g.id}`}>
                    <span className="guide__art" data-cat={p.cat}>
                      <Plate p={p} />
                    </span>
                    <h3>{g.title}</h3>
                    <p>{g.summary}</p>
                    <span className="guide__min">{g.minutes} menit baca</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="band studio">
        <div className="wrap studio__in">
          <div className="studio__copy">
            <h2 className="sec-title">Punya ruang, belum punya tata letak?</h2>
            <p className="sec-lead">
              Ceritakan ukuran dan sudut rumah Anda. Kami rangkai di studio, merawatnya sampai matang, lalu
              mengantarnya.
            </p>
            <div className="studio__cta">
              <a
                className="btn btn--lg"
                href={waLink("Halo, saya mau tanya layanan rangkai aquascape.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Konsultasi lewat WhatsApp
              </a>
              <Link className="link" href="/toko-kami">
                Lihat layanan studio
              </Link>
            </div>
          </div>
          <div className="studio__art">
            <Scene kind="nature" />
          </div>
        </div>
      </section>
    </>
  );
}
