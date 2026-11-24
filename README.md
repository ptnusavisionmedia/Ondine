# Ondine: toko aquascape

Vite + TypeScript tanpa framework. Router berbasis hash, keranjang di localStorage, checkout lewat WhatsApp.

```
npm install
npm run dev      # pengembangan
npm run build    # hasil di dist/
```

## Yang perlu diganti sebelum rilis
- `src/data.ts` → `STORE`: nomor WhatsApp (format `62812...`), alamat, jam buka, email, rekening bank.
- `src/data.ts` → `PRODUCTS`, `BUNDLES`, `GUIDES`: isi katalog, harga, stok, paket, dan artikel.
- Catatan penata di bagian "Pilihan penata pekan ini" (`src/views.ts`, kelas `specimen__note`) adalah contoh teks. Ganti dengan pengalaman toko Anda.
- Kebijakan di beranda (karantina 14 hari, garansi 24 jam, kirim Senin sampai Rabu) harus sesuai kebiasaan toko Anda.

## Struktur
- `src/scene.ts`: akuarium di hero yang tersusun saat scroll (canvas).
- `src/art.ts`: ilustrasi SVG produk. Untuk memakai foto asli, ganti pemanggilan `plate(p)` di `src/views.ts` dengan `<img>`.
- `src/views.ts`: seluruh halaman. `src/cart.ts`: keranjang dan pesan WhatsApp.
