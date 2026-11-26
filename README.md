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
- `lib/scene.ts` dan `lib/aquarium/`: akuarium 3D WebGL di beranda. Kamera tetap menghadap tangki kosong.
  Posisi gulir menentukan tinggi air dan kemunculan substrat, batu, kayu, tanaman, serta ikan. Peramban tanpa
  WebGL menampilkan rangkaian gambar dari sudut yang sama. `lib/art.ts`: ilustrasi SVG produk
  dan gaya, dipakai sebagai cadangan bila gambar belum ada.

## Gambar produk dan gaya
Ilustrasi 39 produk ada di `public/assets/ondine/products/<id-produk>.webp`. Contoh Iwagumi, Nature, dan Jungle
ada di `public/assets/ondine/styles/`. Setiap nama berkas mengikuti ID pada katalog. Setelah mengganti aset,
jalankan `npm run images:sync` untuk memperbarui `lib/images.json`. Sinkronisasi juga berjalan sebelum build.
Referensi untuk setiap gambar tercatat di [REFERENSI_VISUAL_ONDINE.md](./REFERENSI_VISUAL_ONDINE.md).
Instruksi integrasi tersedia di [PROMPT_CLAUDE_ASET_ONDINE.md](./PROMPT_CLAUDE_ASET_ONDINE.md).

## SEO
Setiap produk, kategori, dan panduan punya URL sendiri (bukan `#/` lagi), judul & deskripsi meta, canonical,
Open Graph, dan data terstruktur JSON-LD (`Store`, `Product`, `Article`).
