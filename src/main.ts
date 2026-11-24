import "@fontsource-variable/funnel-sans";
import "@fontsource-variable/funnel-display";
import "@fontsource-variable/literata";
import "@fontsource-variable/literata/wght-italic.css";
import "./style.css";
import "./refine.css";

import { cart } from "./cart";
import { BUNDLES, CATEGORIES, STORE, byId } from "./data";
import { toast } from "./ui";
import { about, cartView, guides, home, notFound, product, shop, type View } from "./views";

const app = document.getElementById("app")!;
const countEl = document.getElementById("cartCount")!;
const footer = document.getElementById("footer")!;
const nav = document.getElementById("nav")!;
const menuBtn = document.getElementById("menuBtn") as HTMLButtonElement;

let cleanup: void | (() => void);

function route(): View {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, qs = ""] = raw.split("?");
  const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
  const query = new URLSearchParams(qs);
  switch (parts[0]) {
    case undefined: return home();
    case "toko": return shop(parts[1], query);
    case "produk": return parts[1] ? product(parts[1]) : notFound();
    case "keranjang": return cartView();
    case "panduan": return guides(parts[1]);
    case "toko-kami": return about();
    default: return notFound();
  }
}

function render() {
  if (typeof cleanup === "function") cleanup();
  const view = route();
  document.title = view.title;
  app.innerHTML = view.html;
  cleanup = view.mount?.(app);
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  nav.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");

  const here = location.hash.split("/")[1]?.split("?")[0] ?? "";
  nav.querySelectorAll("a").forEach((a) => {
    const t = a.getAttribute("href")!.split("/")[1] ?? "";
    a.toggleAttribute("aria-current", t === here && here !== "");
    if (t === here && here !== "") a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.body.classList.toggle("is-home", here === "");
  app.focus({ preventScroll: true });
  app.classList.remove("enter");
  void app.offsetWidth;
  app.classList.add("enter");
}

cart.subscribe(() => {
  countEl.textContent = String(cart.count);
  countEl.hidden = cart.count === 0;
  countEl.classList.remove("bump");
  void countEl.offsetWidth;
  countEl.classList.add("bump");
});
countEl.textContent = String(cart.count);
countEl.hidden = cart.count === 0;

/* Delegasi klik: tombol Tambah dan Paket di semua halaman */
document.addEventListener("click", (e) => {
  const t = e.target as HTMLElement;
  const add = t.closest<HTMLElement>("[data-add]");
  if (add) {
    const p = byId(add.dataset.add!);
    if (!p) return;
    cart.add(p.id, 1);
    toast(`${p.name} masuk keranjang`);
    return;
  }
  const bundle = t.closest<HTMLElement>("[data-bundle]");
  if (bundle) {
    const b = BUNDLES.find((x) => x.id === bundle.dataset.bundle);
    if (!b) return;
    cart.addBundle(b.id);
    toast(`${b.name} masuk keranjang`);
  }
});

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

footer.innerHTML = `
  <div class="wave" style="--a:var(--glass);--b:var(--abyss)" aria-hidden="true"><svg viewBox="0 0 1440 56" preserveAspectRatio="none"><path d="M0 30C120 6 240 54 360 30S600 6 720 30 960 54 1080 30 1320 6 1440 30V56H0Z"/></svg></div>
  <div class="wrap foot">
    <div class="foot__brand">
      <p class="logo"><svg class="mark" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="19" r="8" fill="currentColor"/><path d="M14 11C14 6 17 3 22 2c0 5-3 8-8 9z" fill="#C9D63F"/></svg><span>${STORE.name}</span></p>
      <p>${STORE.tagline}.</p>
      <p>${STORE.address}<br />${STORE.hours}</p>
    </div>
    <nav aria-label="Belanja">
      <h2>Belanja</h2>
      <ul>${CATEGORIES.map((c) => `<li><a href="#/toko/${c.id}">${c.name}</a></li>`).join("")}</ul>
    </nav>
    <nav aria-label="Informasi">
      <h2>Informasi</h2>
      <ul>
        <li><a href="#/panduan">Panduan</a></li>
        <li><a href="#/toko-kami">Toko kami</a></li>
        <li><a href="#/keranjang">Keranjang</a></li>
      </ul>
    </nav>
    <div>
      <h2>Hubungi kami</h2>
      <ul>
        <li><a href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener">WhatsApp ${STORE.phoneLabel}</a></li>
        <li><a href="mailto:${STORE.email}">${STORE.email}</a></li>
      </ul>
    </div>
  </div>
  <p class="wrap foot__fine">© ${new Date().getFullYear()} ${STORE.name}. Gambar produk adalah ilustrasi; foto asli dikirim admin sebelum pembayaran.</p>`;

addEventListener("hashchange", render);
render();
