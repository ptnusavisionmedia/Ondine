import { plate, styleScene } from "./art";
import { cart, buildOrderText, waLink, type Customer } from "./cart";
import {
  BUNDLES, CATEGORIES, GUIDES, PRODUCTS, STORE, STYLES, byId, care, catName, code, minQty, rupiah,
  type CatId, type Product,
} from "./data";
import { mountHero } from "./hero";
import { STAGES } from "./scene";
import { ICONS, toast } from "./ui";

export interface View { html: string; title: string; mount?: (root: HTMLElement) => void | (() => void) }

/* ---------- Potongan umum ---------- */
function status(p: Product) {
  if (p.stock <= 0) return `<span class="status" data-s="out">Habis</span>`;
  if (p.stock < 10) return `<span class="status" data-s="low">Sisa ${p.stock}</span>`;
  return `<span class="status" data-s="ok">Tersedia</span>`;
}

const LIGHT = ["", "Rendah", "Sedang", "Tinggi"];
const CO2 = ["Tidak wajib", "Disarankan", "Wajib"];

function dots(n: number, max: number) {
  return Array.from({ length: max }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
}

function meters(p: Product, large = false) {
  const c = care(p);
  if (!c) return "";
  return `<div class="meters ${large ? "meters--lg" : ""}">
    <span class="meter" role="img" aria-label="Kebutuhan cahaya: ${LIGHT[c.light]}"><em>Cahaya</em><b>${dots(c.light, 3)}</b>${large ? `<small>${LIGHT[c.light]}</small>` : ""}</span>
    <span class="meter" role="img" aria-label="CO2: ${CO2[c.co2]}"><em>CO2</em><b>${dots(c.co2 + 1, 3)}</b>${large ? `<small>${CO2[c.co2]}</small>` : ""}</span>
  </div>`;
}

function plateCard(p: Product) {
  return `
  <article class="plate" data-cat="${p.cat}">
    <a class="plate__art" href="#/produk/${p.id}" aria-label="${p.name}">
      ${plate(p)}
      <span class="plate__no">${code(p)}</span>
      ${p.tag ? `<span class="plate__tag">${p.tag}</span>` : ""}
    </a>
    <div class="plate__meta">
      <h3 class="plate__name"><a href="#/produk/${p.id}">${p.name}</a></h3>
      ${p.latin ? `<p class="latin">${p.latin}</p>` : `<p class="latin latin--blank">${catName(p.cat)}</p>`}
      ${meters(p)}
      <div class="plate__row">
        <p class="price">${rupiah(p.price)}<small>${p.unit}</small></p>
      </div>
      <div class="plate__row">
        ${status(p)}
        <button class="btn btn--small" type="button" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>Tambah</button>
      </div>
    </div>
  </article>`;
}

function bundleTotals(id: string) {
  const b = BUNDLES.find((x) => x.id === id)!;
  const sum = b.items.reduce((a, i) => a + byId(i.id)!.price * i.qty, 0);
  return { sum, final: sum * (1 - b.discount), save: sum * b.discount };
}

/* Garis permukaan air sebagai pemisah antar bagian */
const wave = (from: string, to: string) =>
  `<div class="wave" style="--a:${from};--b:${to}" aria-hidden="true"><svg viewBox="0 0 1440 56" preserveAspectRatio="none"><path d="M0 30C120 6 240 54 360 30S600 6 720 30 960 54 1080 30 1320 6 1440 30V56H0Z"/></svg></div>`;

/* ============================================================
   BERANDA
   ============================================================ */
const HERO_COPY = [
  { t: "Mulai dari air yang tenang.", p: "Akuarium kaca low-iron 60 sampai 90 cm dengan sambungan silikon yang rapi.", cta: "Lihat akuarium" },
  { t: "Dasar yang memberi makan akar.", p: "Soil nutrisi, pasir silika, dan laterit untuk setiap jenis tata letak.", cta: "Belanja substrat" },
  { t: "Batu menentukan wataknya.", p: "Seiryu, dragon stone, dan batu Frodo. Dipilih dan difoto per potong.", cta: "Belanja batu dan kayu" },
  { t: "Kayu memberi umur.", p: "Spiderwood dan akar bakau yang sudah direbus, tanpa air cokelat.", cta: "Belanja batu dan kayu" },
  { t: "Lalu hijau mulai tumbuh.", p: "Stem, rosette, karpet, dan lumut. Dikirim basah dan bebas siput.", cta: "Belanja tanaman" },
  { t: "Terakhir, penghuninya.", p: "Ikan dan udang tangkar lokal, dikarantina 14 hari sebelum dijual.", cta: "Belanja ikan dan udang" },
];

const CAT_AREA: Record<CatId, string> = {
  tanaman: "tan", hardscape: "har", substrat: "sub", fauna: "fau", akuarium: "aqu", peralatan: "per",
};

function stylePanel(i: number) {
  const s = STYLES[i];
  const b = s.bundle ? BUNDLES.find((x) => x.id === s.bundle) : undefined;
  return `
  <div class="style__scene" data-s="${s.id}">${styleScene(s.id)}</div>
  <div class="style__info">
    <p class="style__lead">${s.lead}</p>
    <dl class="style__needs">${s.needs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
    <ul class="style__items">
      ${s.items.map((id) => {
        const p = byId(id)!;
        return `<li data-cat="${p.cat}"><a class="style__thumb" href="#/produk/${p.id}" aria-hidden="true" tabindex="-1">${plate(p)}</a>
          <a class="style__name" href="#/produk/${p.id}">${p.name}</a><span class="style__price">${rupiah(p.price)}</span>
          <button class="btn btn--small" type="button" data-add="${p.id}">Tambah</button></li>`;
      }).join("")}
    </ul>
    ${b ? `<p class="style__bundle">Atau ambil semuanya dalam <b>${b.name}</b>. <button class="link link--btn link--inline" type="button" data-bundle="${b.id}">Masukkan paket ke keranjang</button></p>` : ""}
  </div>`;
}

export function home(): View {
  const featured = PRODUCTS.filter((p) => p.tag === "Terlaris" || p.tag === "Baru").slice(0, 8);
  const spec = byId("crystal-red-shrimp")!;

  const heroHtml = `
  <section class="hero" aria-label="Akuarium yang tersusun saat Anda menggulir">
    <div class="hero__track" id="heroTrack">
      <div class="hero__stage">
        <canvas id="heroCanvas" class="hero__canvas" aria-hidden="true"></canvas>
        <div class="hero__copy">
          ${HERO_COPY.map((c, i) => `
          <div class="chapter ${i === 0 ? "is-on" : ""}" ${i ? 'inert aria-hidden="true"' : ""}>
            ${i === 0 ? `<h1 class="chapter__t">${c.t}</h1>` : `<h2 class="chapter__t">${c.t}</h2>`}
            <p class="chapter__p">${c.p}</p>
            <a class="btn btn--light" href="${STAGES[i].href}">${c.cta}</a>
          </div>`).join("")}
        </div>
        <ol class="steps" aria-label="Tahap menyusun akuarium">
          ${STAGES.map((s, i) => `<li><button type="button" class="${i === 0 ? "is-on" : ""}"><span class="steps__n">${i + 1}</span>${s.label}</button></li>`).join("")}
        </ol>
        <p class="hero__hint">Gulir untuk menyusunnya</p>
        <a class="hero__skip" href="#/toko">Lewati, langsung belanja</a>
        <div class="hero__rail" aria-hidden="true"><i id="heroRail"></i></div>
      </div>
    </div>
  </section>`;

  const html = `
  ${heroHtml}
  ${wave("var(--abyss)", "var(--glass)")}

  <section class="band band--first" id="kategori">
    <div class="wrap">
      <header class="sec-head">
        <h2 class="sec-title">Belanja menurut bahan</h2>
        <p class="sec-lead">Enam rak, satu urutan: dari tangki sampai ikan. Stok tampil sesuai kondisi toko hari ini.</p>
      </header>
      <div class="cats">
        ${CATEGORIES.map((c) => {
          const sample = PRODUCTS.find((p) => p.cat === c.id && (c.id === "tanaman" ? p.id === "rotala-rotundifolia-hra" : true))!;
          const n = PRODUCTS.filter((p) => p.cat === c.id).length;
          return `<a class="cat cat--${CAT_AREA[c.id]}" data-cat="${c.id}" href="#/toko/${c.id}">
            <span class="cat__art">${plate(sample)}</span>
            <span class="cat__txt"><b>${c.name}</b><small>${n} produk</small><span>${c.blurb}</span></span>
          </a>`;
        }).join("")}
      </div>
    </div>
  </section>

  <section class="band band--pad0">
    <div class="wrap specimen">
      <a class="specimen__art" data-cat="${spec.cat}" href="#/produk/${spec.id}" aria-label="${spec.name}">
        ${plate(spec)}<span class="plate__no">${code(spec)}</span>
      </a>
      <div class="specimen__body">
        <p class="specimen__pick">Pilihan penata pekan ini</p>
        <h2 class="specimen__title">${spec.name}</h2>
        <p class="latin latin--lg">${spec.latin}</p>
        <blockquote class="specimen__note">
          Kami memeliharanya tiga bulan di tangki soil 40 cm sebelum menjualnya. Tangguh bila airnya stabil, dan paling indah dilihat dari samping saat lampu menyala.
        </blockquote>
        <dl class="specimen__facts">
          ${spec.specs.slice(1, 4).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}
        </dl>
        <div class="specimen__buy">
          <p class="price price--lg">${rupiah(spec.price)}<small>${spec.unit}</small></p>
          <button class="btn btn--lg" type="button" data-add="${spec.id}">Tambah ke keranjang</button>
          <a class="link" href="#/produk/${spec.id}">Lihat detail</a>
        </div>
      </div>
    </div>
  </section>

  <section class="band band--tint">
    <div class="wrap">
      <header class="sec-head">
        <h2 class="sec-title">Paket siap rakit</h2>
        <p class="sec-lead">Satu klik memasukkan semua isi paket ke keranjang. Hemat 6 sampai 10 persen dibanding beli satuan.</p>
      </header>
      <div class="bundles">
        ${BUNDLES.map((b) => {
          const t = bundleTotals(b.id);
          return `<article class="bundle">
            <div class="bundle__main"><h3>${b.name}</h3><p>${b.note}</p></div>
            <ul class="bundle__list">${b.items.map((i) => `<li><span>${byId(i.id)!.name}</span><i>x${i.qty}</i></li>`).join("")}</ul>
            <div class="bundle__buy">
              <p class="bundle__old">${rupiah(t.sum)}</p>
              <p class="bundle__price">${rupiah(t.final)}</p>
              <p class="bundle__save">Hemat ${rupiah(t.save)}</p>
              <button class="btn" type="button" data-bundle="${b.id}">Masukkan paket</button>
            </div>
          </article>`;
        }).join("")}
      </div>
    </div>
  </section>

  <section class="band" id="gaya">
    <div class="wrap">
      <header class="sec-head">
        <h2 class="sec-title">Belum tahu mau tata letak seperti apa?</h2>
        <p class="sec-lead">Tiga gaya yang paling sering kami rangkai. Pilih satu, lalu lihat bahan yang dibutuhkan.</p>
      </header>
      <div class="styles">
        <div class="styles__tabs" role="tablist" aria-label="Gaya aquascape">
          ${STYLES.map((s, i) => `<button role="tab" type="button" class="${i === 0 ? "is-on" : ""}" aria-selected="${i === 0}" data-style="${i}">${s.name}</button>`).join("")}
        </div>
        <div class="styles__panel" id="stylePanel" role="tabpanel">${stylePanel(0)}</div>
      </div>
    </div>
  </section>

  <section class="band band--pad0">
    <div class="wrap">
      <header class="sec-head sec-head--row">
        <div>
          <h2 class="sec-title">Paling sering dibawa pulang</h2>
          <p class="sec-lead">Pilihan pemula dan pendatang baru minggu ini.</p>
        </div>
        <a class="link" href="#/toko">Lihat semua produk</a>
      </header>
      <div class="grid">${featured.map(plateCard).join("")}</div>
    </div>
  </section>

  ${wave("var(--glass)", "var(--tank)")}
  <section class="band band--tank band--flush">
    <div class="wrap care">
      <header>
        <h2 class="sec-title">Cara kami mengirim makhluk hidup</h2>
        <p class="sec-lead">Tanaman, ikan, dan udang bepergian dalam kondisi terbaik. Ini yang kami lakukan.</p>
      </header>
      <dl class="care__list">
        <div>${ICONS.look}<dt>Karantina 14 hari</dt><dd>Setiap ikan dan udang diamati dua minggu sebelum dijual. Yang sakit tidak masuk etalase.</dd></div>
        <div>${ICONS.air}<dt>Kemasan oksigen</dt><dd>Plastik berisi oksigen dalam styrofoam, dengan pemanas sekali pakai bila cuaca dingin.</dd></div>
        <div>${ICONS.cal}<dt>Kirim Senin sampai Rabu</dt><dd>Supaya paket tidak menginap di gudang kurir akhir pekan. Pesanan Kamis dikirim hari Senin.</dd></div>
        <div>${ICONS.play}<dt>Garansi mati saat tiba</dt><dd>Rekam video saat membuka paket dan kirim dalam 24 jam. Kami ganti atau kembalikan dananya.</dd></div>
      </dl>
    </div>
  </section>
  ${wave("var(--tank)", "var(--glass)")}

  <section class="band band--flush2">
    <div class="wrap">
      <header class="sec-head sec-head--row">
        <div>
          <h2 class="sec-title">Panduan dari meja kerja kami</h2>
          <p class="sec-lead">Tulisan pendek untuk pertanyaan yang paling sering diajukan pelanggan.</p>
        </div>
        <a class="link" href="#/panduan">Semua panduan</a>
      </header>
      <ul class="guide-cards">
        ${GUIDES.slice(0, 3).map((g) => {
          const p = byId(g.art)!;
          return `<li><a href="#/panduan/${g.id}">
            <span class="guide__art" data-cat="${p.cat}">${plate(p)}</span>
            <h3>${g.title}</h3><p>${g.summary}</p><span class="guide__min">${g.minutes} menit baca</span></a></li>`;
        }).join("")}
      </ul>
    </div>
  </section>

  <section class="band studio">
    <div class="wrap studio__in">
      <div class="studio__copy">
        <h2 class="sec-title">Punya ruang, belum punya tata letak?</h2>
        <p class="sec-lead">Ceritakan ukuran dan sudut rumah Anda. Kami rangkai di studio, merawatnya sampai matang, lalu mengantarnya.</p>
        <div class="studio__cta">
          <a class="btn btn--lg" href="${waLink("Halo, saya mau tanya layanan rangkai aquascape.")}" target="_blank" rel="noopener">Konsultasi lewat WhatsApp</a>
          <a class="link" href="#/toko-kami">Lihat layanan studio</a>
        </div>
      </div>
      <div class="studio__art">${styleScene("nature")}</div>
    </div>
  </section>`;

  return {
    html,
    title: `${STORE.name}: toko aquascape dan studio rangkai`,
    mount: (root) => {
      const cleanHero = mountHero(root);
      const panel = root.querySelector<HTMLElement>("#stylePanel")!;
      const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-style]")];
      tabs.forEach((t) => t.addEventListener("click", () => {
        tabs.forEach((x) => { x.classList.toggle("is-on", x === t); x.setAttribute("aria-selected", String(x === t)); });
        panel.innerHTML = stylePanel(+t.dataset.style!);
      }));
      return cleanHero;
    },
  };
}

/* ============================================================
   TOKO (katalog)
   ============================================================ */
export function shop(catParam: string | undefined, query: URLSearchParams): View {
  const cat = CATEGORIES.find((c) => c.id === catParam)?.id as CatId | undefined;
  const heading = cat ? catName(cat) : "Semua produk";
  const sample = cat ? PRODUCTS.find((p) => p.cat === cat)! : byId("batu-seiryu")!;
  const html = `
  <section class="page wrap">
    <header class="page__head page__head--split">
      <div>
        <nav class="crumbs" aria-label="Jalur"><a href="#/">Beranda</a><span>Toko</span>${cat ? `<span>${heading}</span>` : ""}</nav>
        <h1 class="page__title">${heading}</h1>
        <p class="page__lead">${cat ? CATEGORIES.find((c) => c.id === cat)!.blurb : "Seluruh rak dari tangki sampai ikan. Gunakan filter untuk mempersempit."}</p>
      </div>
      <div class="page__plate" data-cat="${sample.cat}" aria-hidden="true">${plate(sample)}</div>
    </header>

    <div class="shop">
      <aside class="filters" aria-label="Filter produk">
        <div class="field">
          <label for="q">Cari produk</label>
          <input id="q" type="search" placeholder="Nama atau nama latin" autocomplete="off" />
        </div>
        <fieldset class="field">
          <legend>Kategori</legend>
          <ul class="catlist">
            <li><a href="#/toko" ${!cat ? 'aria-current="page"' : ""}>Semua<i>${PRODUCTS.length}</i></a></li>
            ${CATEGORIES.map((c) => `<li><a href="#/toko/${c.id}" ${cat === c.id ? 'aria-current="page"' : ""}>${c.name}<i>${PRODUCTS.filter((p) => p.cat === c.id).length}</i></a></li>`).join("")}
          </ul>
        </fieldset>
        ${cat === "tanaman" ? `
        <fieldset class="field">
          <legend>Cahaya yang Anda punya</legend>
          <div class="seg" role="radiogroup" aria-label="Cahaya">
            <label><input type="radio" name="light" value="0" checked /><span>Semua</span></label>
            <label><input type="radio" name="light" value="1" /><span>Rendah</span></label>
            <label><input type="radio" name="light" value="2" /><span>Sedang</span></label>
            <label><input type="radio" name="light" value="3" /><span>Tinggi</span></label>
          </div>
          <p class="hint">Menampilkan tanaman yang bisa hidup pada cahaya itu.</p>
        </fieldset>
        <label class="check"><input id="noco2" type="checkbox" /> Tanpa CO2</label>` : ""}
        <div class="field">
          <label for="sort">Urutkan</label>
          <select id="sort">
            <option value="rec">Rekomendasi</option>
            <option value="asc">Harga terendah</option>
            <option value="desc">Harga tertinggi</option>
            <option value="az">Nama A sampai Z</option>
          </select>
        </div>
        <label class="check"><input id="instock" type="checkbox" /> Hanya yang tersedia</label>
      </aside>

      <div>
        <p class="count" id="count" role="status" aria-live="polite"></p>
        <div class="grid grid--shop" id="list"></div>
      </div>
    </div>
  </section>`;

  return {
    html,
    title: `${heading} | ${STORE.name}`,
    mount: (root) => {
      const q = root.querySelector<HTMLInputElement>("#q")!;
      const sort = root.querySelector<HTMLSelectElement>("#sort")!;
      const instock = root.querySelector<HTMLInputElement>("#instock")!;
      const noco2 = root.querySelector<HTMLInputElement>("#noco2");
      const lights = [...root.querySelectorAll<HTMLInputElement>('input[name="light"]')];
      const list = root.querySelector<HTMLElement>("#list")!;
      const count = root.querySelector<HTMLElement>("#count")!;
      q.value = query.get("q") ?? "";

      const render = () => {
        const term = q.value.trim().toLowerCase();
        let items = PRODUCTS.filter((p) => !cat || p.cat === cat);
        if (term) items = items.filter((p) => (p.name + " " + (p.latin ?? "")).toLowerCase().includes(term));
        if (instock.checked) items = items.filter((p) => p.stock > 0);
        const lv = +(lights.find((l) => l.checked)?.value ?? 0);
        if (lv) items = items.filter((p) => (care(p)?.light ?? 0) <= lv);
        if (noco2?.checked) items = items.filter((p) => care(p)?.co2 === 0);
        const s = sort.value;
        if (s === "asc") items = [...items].sort((a, b) => a.price - b.price);
        if (s === "desc") items = [...items].sort((a, b) => b.price - a.price);
        if (s === "az") items = [...items].sort((a, b) => a.name.localeCompare(b.name, "id"));
        count.textContent = `${items.length} produk`;
        list.innerHTML = items.length
          ? items.map(plateCard).join("")
          : `<div class="empty"><h3>Tidak ada yang cocok</h3><p>Coba kata kunci lain, longgarkan filter cahaya, atau hapus pilihan "hanya yang tersedia".</p></div>`;
      };
      [q, sort, instock, noco2, ...lights].forEach((el) => el?.addEventListener("input", render));
      render();
    },
  };
}

/* ============================================================
   PRODUK
   ============================================================ */
const SHIP_NOTE: Record<CatId, string> = {
  tanaman: "Dikirim basah, dibungkus tisu lembap, bebas siput. Kirim Senin sampai Rabu.",
  hardscape: "Dikemas per potong dengan busa. Berat dihitung saat penimbangan, ongkir dikonfirmasi admin.",
  substrat: "Dikemas karung kedap air. Ongkir mengikuti berat.",
  fauna: "Dikirim dengan oksigen, Senin sampai Rabu. Garansi mati saat tiba, wajib video unboxing.",
  akuarium: "Dikirim dengan kayu pelindung. Hanya Jawa dan Bali, atau ambil di toko.",
  peralatan: "Dikemas rapi dengan busa pelindung. Garansi alat 3 bulan.",
};

export function product(id: string): View {
  const p = byId(id);
  if (!p) return notFound();
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  const html = `
  <section class="page wrap">
    <nav class="crumbs" aria-label="Jalur"><a href="#/">Beranda</a><a href="#/toko">Toko</a><a href="#/toko/${p.cat}">${catName(p.cat)}</a><span>${p.name}</span></nav>
    <div class="pdp">
      <div class="pdp__art" data-cat="${p.cat}">${plate(p)}<span class="plate__no">${code(p)}</span>${p.tag ? `<span class="plate__tag">${p.tag}</span>` : ""}</div>
      <div class="pdp__info">
        <h1 class="pdp__title">${p.name}</h1>
        ${p.latin ? `<p class="latin latin--lg">${p.latin}</p>` : ""}
        <p class="pdp__price">${rupiah(p.price)}<small>${p.unit}</small></p>
        <p class="pdp__desc">${p.desc}</p>
        ${meters(p, true)}

        <div class="buy">
          <div class="qty" role="group" aria-label="Jumlah">
            <button type="button" id="dec" aria-label="Kurangi">−</button>
            <input id="qty" type="number" inputmode="numeric" min="1" max="${p.stock}" value="${minQty(p)}" aria-label="Jumlah" />
            <button type="button" id="inc" aria-label="Tambah">+</button>
          </div>
          <button class="btn btn--lg" id="addBtn" type="button" ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? "Stok habis" : "Tambah ke keranjang"}</button>
        </div>
        <p class="pdp__stock">${status(p)} <span id="inCart"></span><span class="pdp__code">Kode ${code(p)}</span></p>

        <dl class="specs">
          ${p.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}
        </dl>

        <div class="note">
          <h2>Pengiriman</h2>
          <p>${SHIP_NOTE[p.cat]}</p>
          <a class="link" href="${waLink(`Halo, saya mau tanya soal ${p.name} (${code(p)}).`)}" target="_blank" rel="noopener">Tanya admin lewat WhatsApp</a>
        </div>
      </div>
    </div>

    ${related.length ? `<section class="related"><h2 class="sec-title sec-title--sm">Dari rak yang sama</h2><div class="grid">${related.map(plateCard).join("")}</div></section>` : ""}
  </section>

  <div class="pdp__bar">
    <p class="pdp__barinfo"><b>${rupiah(p.price)}</b><small>${p.unit}</small></p>
    <button class="btn" id="addBar" type="button" ${p.stock <= 0 ? "disabled" : ""}>Tambah</button>
  </div>`;

  return {
    html,
    title: `${p.name} | ${STORE.name}`,
    mount: (root) => {
      document.body.classList.add("has-bar");
      const qty = root.querySelector<HTMLInputElement>("#qty")!;
      const inCart = root.querySelector<HTMLElement>("#inCart")!;
      const lo = minQty(p);
      const clampQ = () => { qty.value = String(Math.min(p.stock, Math.max(lo, Math.floor(+qty.value || lo)))); };
      const showInCart = () => { const n = cart.qtyOf(p.id); inCart.textContent = n ? `${n} sudah di keranjang` : ""; };
      root.querySelector("#dec")!.addEventListener("click", () => { qty.value = String(+qty.value - 1); clampQ(); });
      root.querySelector("#inc")!.addEventListener("click", () => { qty.value = String(+qty.value + 1); clampQ(); });
      qty.addEventListener("change", clampQ);
      const add = () => {
        clampQ();
        const before = cart.qtyOf(p.id);
        cart.add(p.id, +qty.value);
        const added = cart.qtyOf(p.id) - before;
        toast(added < +qty.value ? `Hanya ${p.stock} tersedia. Keranjang diperbarui.` : `${p.name} masuk keranjang`);
        showInCart();
      };
      root.querySelector("#addBtn")!.addEventListener("click", add);
      root.querySelector("#addBar")!.addEventListener("click", add);
      showInCart();
      return () => document.body.classList.remove("has-bar");
    },
  };
}

/* ============================================================
   KERANJANG & CHECKOUT
   ============================================================ */
export function cartView(): View {
  const draw = () => {
    if (!cart.lines.length) {
      return `<section class="page wrap"><header class="page__head"><h1 class="page__title">Keranjang</h1></header>
      <div class="empty empty--art"><div class="empty__art" data-cat="akuarium">${plate(byId("akuarium-60")!)}</div>
      <div><h2>Keranjang masih kosong</h2><p>Mulai dari rak tanaman, atau pilih satu paket siap rakit.</p><a class="btn" href="#/toko">Lihat produk</a></div></div></section>`;
    }
    const rows = cart.lines.map((l) => {
      const p = byId(l.id)!;
      return `<li class="row" data-id="${p.id}">
        <a class="row__art" data-cat="${p.cat}" href="#/produk/${p.id}">${plate(p)}</a>
        <div class="row__info">
          <a class="row__name" href="#/produk/${p.id}">${p.name}</a>
          ${p.latin ? `<p class="latin">${p.latin}</p>` : ""}
          <p class="row__unit">${code(p)} · ${rupiah(p.price)} · ${p.unit}</p>
          <button class="link link--btn" type="button" data-rm="${p.id}">Hapus</button>
        </div>
        <div class="qty qty--sm" role="group" aria-label="Jumlah ${p.name}">
          <button type="button" data-dec="${p.id}" aria-label="Kurangi">−</button>
          <input type="number" min="1" max="${p.stock}" value="${l.qty}" data-q="${p.id}" aria-label="Jumlah" />
          <button type="button" data-inc="${p.id}" aria-label="Tambah">+</button>
        </div>
        <p class="row__total">${rupiah(p.price * l.qty)}</p>
      </li>`;
    }).join("");
    return `
    <section class="page wrap">
      <header class="page__head"><h1 class="page__title">Keranjang</h1><p class="page__lead">Periksa pesanan, isi data pengiriman, lalu kirim lewat WhatsApp. Admin akan menghitung ongkir dan mengonfirmasi stok.</p></header>
      <div class="checkout">
        <ul class="rows">${rows}</ul>
        <form class="order" id="orderForm" novalidate>
          <h2>Data pengiriman</h2>
          <div class="field"><label for="nama">Nama penerima</label><input id="nama" name="nama" autocomplete="name" required /><p class="err" data-for="nama"></p></div>
          <div class="field"><label for="hp">Nomor WhatsApp</label><input id="hp" name="hp" inputmode="tel" autocomplete="tel" placeholder="08xxxxxxxxxx" required /><p class="err" data-for="hp"></p></div>
          <div class="field"><label for="alamat">Alamat lengkap</label><textarea id="alamat" name="alamat" rows="3" autocomplete="street-address" required></textarea><p class="err" data-for="alamat"></p></div>
          <div class="field"><label for="kota">Kota atau kabupaten</label><input id="kota" name="kota" autocomplete="address-level2" required /><p class="err" data-for="kota"></p></div>
          <div class="field"><label for="kurir">Kurir</label>
            <select id="kurir" name="kurir"><option>JNE</option><option>J&amp;T</option><option>SiCepat</option><option>Gojek atau Grab (satu kota)</option><option>Ambil di toko</option></select></div>
          <div class="field"><label for="catatan">Catatan (opsional)</label><textarea id="catatan" name="catatan" rows="2" placeholder="Misalnya: pilih batu yang tinggi"></textarea></div>

          <dl class="sum">
            <div><dt>Subtotal</dt><dd>${rupiah(cart.subtotal)}</dd></div>
            <div><dt>Ongkos kirim</dt><dd>Dihitung admin</dd></div>
          </dl>
          <button class="btn btn--lg btn--block" type="submit">Kirim pesanan lewat WhatsApp</button>
          <p class="fine">Pembayaran lewat transfer bank setelah admin mengonfirmasi total dan stok. Anda tidak dikenai biaya apa pun di halaman ini.</p>
        </form>
      </div>
    </section>`;
  };

  return {
    html: draw(),
    title: `Keranjang | ${STORE.name}`,
    mount: (root) => {
      const rerender = () => { root.innerHTML = draw(); bind(); };
      const bind = () => {
        root.querySelectorAll<HTMLElement>("[data-rm]").forEach((b) => b.addEventListener("click", () => { cart.remove(b.dataset.rm!); rerender(); }));
        root.querySelectorAll<HTMLElement>("[data-dec]").forEach((b) => b.addEventListener("click", () => { const id = b.dataset.dec!; cart.set(id, cart.qtyOf(id) - 1); rerender(); }));
        root.querySelectorAll<HTMLElement>("[data-inc]").forEach((b) => b.addEventListener("click", () => { const id = b.dataset.inc!; cart.set(id, cart.qtyOf(id) + 1); rerender(); }));
        root.querySelectorAll<HTMLInputElement>("[data-q]").forEach((i) => i.addEventListener("change", () => { cart.set(i.dataset.q!, Math.floor(+i.value || 1)); rerender(); }));

        const form = root.querySelector<HTMLFormElement>("#orderForm");
        form?.addEventListener("submit", (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          const c: Customer = {
            nama: String(fd.get("nama") ?? "").trim(), hp: String(fd.get("hp") ?? "").trim(),
            alamat: String(fd.get("alamat") ?? "").trim(), kota: String(fd.get("kota") ?? "").trim(),
            kurir: String(fd.get("kurir") ?? ""), catatan: String(fd.get("catatan") ?? "").trim(),
          };
          const errs: Record<string, string> = {};
          if (c.nama.length < 2) errs.nama = "Isi nama penerima.";
          if (!/^(\+?62|0)8\d{7,12}$/.test(c.hp.replace(/[\s-]/g, ""))) errs.hp = "Isi nomor WhatsApp yang valid, misalnya 081234567890.";
          if (c.alamat.length < 10) errs.alamat = "Tulis alamat selengkapnya, termasuk kecamatan dan kode pos.";
          if (c.kota.length < 3) errs.kota = "Isi kota atau kabupaten.";
          form.querySelectorAll<HTMLElement>(".err").forEach((el) => { el.textContent = errs[el.dataset.for!] ?? ""; });
          const first = Object.keys(errs)[0];
          if (first) { form.querySelector<HTMLElement>(`#${first}`)?.focus(); return; }

          const link = waLink(buildOrderText(c));
          const total = cart.subtotal;
          window.open(link, "_blank", "noopener");
          cart.clear();
          root.innerHTML = `
          <section class="page wrap"><div class="done">
            <h1 class="page__title">Pesanan siap dikirim</h1>
            <p class="page__lead">WhatsApp terbuka dengan rincian pesanan Anda. Tekan kirim di sana agar admin menerimanya. Jika tidak terbuka, gunakan tombol di bawah.</p>
            <a class="btn btn--lg" href="${link}" target="_blank" rel="noopener">Buka WhatsApp lagi</a>
            <div class="note note--plain">
              <h2>Setelah admin membalas</h2>
              <p>Transfer sebesar total yang dikonfirmasi (subtotal ${rupiah(total)} ditambah ongkir) ke salah satu rekening ini, lalu kirim bukti transfer.</p>
              <ul class="bank">${STORE.bank.map((b) => `<li><b>${b.bank}</b><span>${b.no}</span><i>a.n. ${b.name}</i></li>`).join("")}</ul>
            </div>
            <a class="link" href="#/toko">Kembali berbelanja</a>
          </div></section>`;
          window.scrollTo({ top: 0 });
        });
      };
      bind();
    },
  };
}

/* ============================================================
   PANDUAN
   ============================================================ */
export function guides(id?: string): View {
  const g = GUIDES.find((x) => x.id === id);
  if (id && !g) return notFound();
  if (g) {
    const idx = GUIDES.indexOf(g);
    const next = GUIDES[(idx + 1) % GUIDES.length];
    const art = byId(g.art)!;
    return {
      title: `${g.title} | ${STORE.name}`,
      html: `
      <article class="page wrap article">
        <nav class="crumbs" aria-label="Jalur"><a href="#/">Beranda</a><a href="#/panduan">Panduan</a><span>${g.title}</span></nav>
        <div class="article__head">
          <div>
            <h1 class="page__title">${g.title}</h1>
            <p class="page__lead">${g.summary} <span class="mins">${g.minutes} menit baca</span></p>
          </div>
          <div class="article__art" data-cat="${art.cat}" aria-hidden="true">${plate(art)}</div>
        </div>
        <div class="prose prose--serif">${g.body.map((b) => `${b.h ? `<h2>${b.h}</h2>` : ""}<p>${b.p}</p>`).join("")}</div>
        <aside class="next"><p>Berikutnya</p><a href="#/panduan/${next.id}">${next.title}</a></aside>
      </article>`,
    };
  }
  return {
    title: `Panduan | ${STORE.name}`,
    html: `
    <section class="page wrap">
      <header class="page__head"><nav class="crumbs" aria-label="Jalur"><a href="#/">Beranda</a><span>Panduan</span></nav>
        <h1 class="page__title">Panduan</h1><p class="page__lead">Dari tangki pertama sampai perawatan bulanan. Ditulis oleh orang yang merangkai tangki setiap hari.</p></header>
      <ul class="guide-list guide-list--full">
        ${GUIDES.map((x) => {
          const p = byId(x.art)!;
          return `<li><a href="#/panduan/${x.id}"><span class="guide__art guide__art--sm" data-cat="${p.cat}">${plate(p)}</span>
            <span><h2>${x.title}</h2><p>${x.summary}</p><span class="guide__min">${x.minutes} menit baca</span></span></a></li>`;
        }).join("")}
      </ul>
    </section>`,
  };
}

/* ============================================================
   TOKO KAMI
   ============================================================ */
export function about(): View {
  return {
    title: `Toko kami | ${STORE.name}`,
    html: `
    <section class="page wrap">
      <header class="page__head"><nav class="crumbs" aria-label="Jalur"><a href="#/">Beranda</a><span>Toko kami</span></nav>
        <h1 class="page__title">Toko dan studio rangkai</h1>
        <p class="page__lead">Kami menanam, menata, dan merawat akuarium setiap hari. Yang kami jual adalah yang kami pakai sendiri.</p></header>
      <div class="about__scene">${styleScene("jungle")}</div>
      <div class="about">
        <div class="prose prose--serif">
          <h2>Mulai dari satu tangki di kamar kos</h2>
          <p>Toko ini lahir dari kebiasaan menukar potongan tanaman dengan sesama hobi. Kini kami menyediakan tanaman, batu, kayu, dan ikan dari pemasok yang sudah kami kenal bertahun-tahun, dan memeriksa semuanya sebelum dikemas.</p>
          <h2>Layanan studio</h2>
          <ul class="services">
            <li><b>Rangkai di studio</b><span>Anda pilih gaya dan ukuran, kami rangkai dan rawat sampai tangki matang, lalu antar.</span></li>
            <li><b>Pasang di rumah</b><span>Teknisi datang membawa semua bahan dan menata di tempat. Tersedia untuk Bandung dan sekitarnya.</span></li>
            <li><b>Perawatan bulanan</b><span>Pangkas, ganti air, bersihkan filter, dan cek parameter air setiap bulan.</span></li>
          </ul>
          <a class="btn" href="${waLink("Halo, saya mau tanya layanan rangkai aquascape.")}" target="_blank" rel="noopener">Tanya layanan lewat WhatsApp</a>
        </div>
        <aside class="visit">
          <h2>Datang ke toko</h2>
          <dl>
            <div><dt>Alamat</dt><dd>${STORE.address}</dd></div>
            <div><dt>Jam buka</dt><dd>${STORE.hours}</dd></div>
            <div><dt>WhatsApp</dt><dd>${STORE.phoneLabel}</dd></div>
            <div><dt>Email</dt><dd>${STORE.email}</dd></div>
          </dl>
        </aside>
      </div>
    </section>`,
  };
}

export function notFound(): View {
  return {
    title: `Halaman tidak ditemukan | ${STORE.name}`,
    html: `<section class="page wrap"><div class="empty"><h1>Halaman tidak ditemukan</h1><p>Alamat yang Anda buka tidak ada atau produknya sudah dipindahkan.</p><a class="btn" href="#/toko">Lihat semua produk</a></div></section>`,
  };
}
