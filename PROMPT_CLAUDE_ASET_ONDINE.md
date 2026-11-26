# Prompt untuk Claude Code — Aset visual Ondine

Bekerjalah di repositori Ondine. Gunakan 42 berkas WebP yang sudah tersedia untuk seluruh ilustrasi statis. Pertahankan perubahan lokal pengguna. Bila sebuah halaman sudah menampilkan berkas yang benar, cukup verifikasi hasilnya.

## Pasangkan aset ke data

- Pasangkan setiap entri `PRODUCTS` di `lib/data.ts` dengan `public/assets/ondine/products/<product.id>.webp`. Keenam kategori berisi 12 tanaman, 5 batu dan kayu, 4 substrat, 7 fauna, 4 akuarium dan lampu, serta 7 peralatan. Nama dasar berkas selalu sama persis dengan ID. URL publik dimulai dengan `/assets/ondine/`.
- Pasangkan tiga tab gaya dengan `styles/iwagumi.webp`, `styles/nature.webp`, dan `styles/jungle.webp`. Di beranda, bagian studio memakai Nature. Halaman Toko Kami memakai Jungle. Bagian panduan mengambil gambar produk dari `guide.art`. Lihat `REFERENSI_VISUAL_ONDINE.md` untuk memeriksa ciri setiap subjek.
- Jalankan `npm run images:sync`. Periksa `lib/images.json` untuk memastikan semua 39 ID produk dan 3 ID gaya memiliki berkas serta dimensi yang sesuai. Gunakan aset lokal yang tersedia. Hindari gambar dari URL luar dan pemetaan berdasarkan kemiripan nama atau urutan array.

## Tampilkan melalui komponen yang ada

Gunakan `Plate` dan `productImage(p.id)` untuk kartu kategori, sorotan Crystal Red, katalog, detail, rekomendasi, daftar barang pada tab gaya, panduan, serta keranjang kosong dan berisi. Gunakan `Scene` dan `styleImage(kind)` untuk contoh tata letak. Pertahankan rasio gambar melalui `next/image`, nilai `sizes` sesuai wadah, dan pemuatan prioritas pada gambar utama halaman produk.

Pastikan ujung daun, ekor, antena, kaki lampu, serta ujung gunting dan pinset terlihat utuh pada kartu maupun halaman detail. Gunakan teks alternatif berbahasa Indonesia yang mengidentifikasi produk atau gaya. Pertahankan keterangan bahwa gambar detail merupakan ilustrasi. Spesifikasi, harga, stok, nama produk, dan isi paket tetap bersumber dari katalog. Gambar perangkat dan botol pupuk mewakili spesifikasi generik Ondine. Jangan menambahkan merek, klaim foto stok aktual, atau aksesori baru.

Batasi pekerjaan pada ilustrasi statis. Biarkan `components/Hero.tsx`, `lib/scene.ts`, `lib/aquarium/`, `app/styles/aquarium.css`, serta rangkaian poster `public/images/akuarium-*.webp` seperti semula. Logo, ikon, dan ornamen antarmuka juga berada di luar pekerjaan ini.

## Verifikasi hasil

1. Buka katalog pada lebar ponsel dan desktop. Periksa detail setidaknya satu produk tiap kategori, thumbnail keranjang, satu halaman panduan, dan ketiga tab gaya.
2. Periksa khusus Neon Tetra dan Ember Tetra, Red Cherry dan Crystal Red, Java Moss dan Riccia, kedua ukuran tangki dan lampu, serta pupuk NPK dan mikro besi. Bandingkan gambar dengan ciri visual pada dokumen referensi.
3. Jalankan `npm run lint`, `npm run typecheck`, dan `npm run build`. Laporkan jumlah gambar yang berhasil dimuat, ID yang masih memakai SVG cadangan atau berkas yang gagal dibuka, serta hasil pengujian.
