# Ondine: toko aquascape

Next.js 16 (App Router) + React 19 + TypeScript. Semua halaman dirender statis saat build (SSG), keranjang
disimpan di localStorage lewat Zustand, data checkout divalidasi dengan Zod, lalu pesanan dikirim lewat WhatsApp.

```
npm install
npm run dev        # pengembangan, http://localhost:3000
npm run build      # build produksi
npm start          # menjalankan hasil build
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run format     # Prettier
```

Salin `.env.example` menjadi `.env.local` dan isi `NEXT_PUBLIC_SITE_URL` dengan domain asli. Nilai ini dipakai
untuk sitemap, canonical URL, dan Open Graph. Siap di-deploy ke Vercel atau server Node mana pun.

## Yang perlu diganti sebelum rilis
- `lib/data.ts` → `STORE`: nomor WhatsApp (format `62812...`), alamat, jam buka, email, rekening bank.
- `lib/data.ts` → `PRODUCTS`, `BUNDLES`, `GUIDES`: isi katalog, harga, stok, paket, dan artikel.
- Catatan penata di bagian "Pilihan penata pekan ini" (`app/page.tsx`, kelas `specimen__note`) adalah contoh teks.
- Kebijakan di beranda (karantina 14 hari, garansi 24 jam, kirim Senin sampai Rabu) harus sesuai kebiasaan toko.

## Struktur
- `app/`: halaman (beranda, `toko`, `toko/[kategori]`, `produk/[id]`, `keranjang`, `panduan`, `panduan/[slug]`,
  `toko-kami`), plus `sitemap.ts`, `robots.ts`, `manifest.ts`, halaman 404 dan error.
- `components/`: komponen UI. Yang interaktif (`Hero`, `ShopView`, `CartView`, `ProductBuy`, `StyleTabs`,
  `Header`) adalah client component; sisanya dirender di server.
- `lib/data.ts`: katalog. `lib/cart-store.ts`: keranjang (Zustand + persist). `lib/order.ts`: skema checkout
  (Zod) dan pesan WhatsApp.
- `lib/scene.ts`: akuarium di hero yang tersusun saat scroll (canvas). `lib/art.ts`: ilustrasi SVG produk. Untuk
  memakai foto asli, ganti komponen `Plate` di `components/Art.tsx` dengan `next/image`.

## SEO
Setiap produk, kategori, dan panduan punya URL sendiri (bukan `#/` lagi), judul & deskripsi meta, canonical,
Open Graph, dan data terstruktur JSON-LD (`Store`, `Product`, `Article`).
