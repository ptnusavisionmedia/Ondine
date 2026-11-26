/* ============================================================
   Data toko. Ganti nomor WhatsApp & alamat di STORE sebelum rilis.
   ============================================================ */

export const STORE = {
  name: "Ondine",
  tagline: "Toko aquascape dan studio rangkai akuarium",
  whatsapp: "6281234567890", // format internasional tanpa + atau 0 di depan
  phoneLabel: "0812-3456-7890",
  email: "halo@ondine.example",
  address: "Jl. Cimanuk No. 18, Bandung 40115",
  hours: "Setiap hari, 10.00 sampai 19.00 WIB",
  bank: [
    { bank: "BCA", no: "000 000 0000", name: "Ondine" },
    { bank: "Mandiri", no: "000 0000 0000 0", name: "Ondine" },
  ],
};

export type CatId = "tanaman" | "hardscape" | "substrat" | "fauna" | "akuarium" | "peralatan";

export interface Category {
  id: CatId;
  name: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { id: "tanaman", name: "Tanaman", blurb: "Stem, rosette, karpet, dan lumut. Dikirim basah, bebas siput." },
  { id: "hardscape", name: "Batu dan kayu", blurb: "Kerangka tata letak. Dipilih per potong." },
  { id: "substrat", name: "Substrat", blurb: "Soil nutrisi, pasir, dan kerikil untuk dasar tangki." },
  { id: "fauna", name: "Ikan dan udang", blurb: "Hasil tangkar lokal, dikarantina 14 hari sebelum dijual." },
  { id: "akuarium", name: "Akuarium dan lampu", blurb: "Kaca bening low-iron dan LED spektrum penuh." },
  { id: "peralatan", name: "Peralatan", blurb: "CO2, filter, pupuk, dan alat potong untuk perawatan." },
];

export type ArtKind =
  | "stem" | "rosette" | "carpet" | "moss" | "fern"
  | "rock" | "wood" | "soil" | "fish" | "shrimp"
  | "tank" | "light" | "co2" | "filter" | "tool" | "fert" | "heater";

export interface Product {
  id: string;
  name: string;
  latin?: string;
  cat: CatId;
  price: number;
  unit: string;
  stock: number;
  tag?: "Baru" | "Terlaris" | "Stok tipis";
  desc: string;
  specs: [string, string][];
  art: { kind: ArtKind; [k: string]: unknown };
}

export const PRODUCTS: Product[] = [
  /* ---------------- Tanaman ---------------- */
  {
    id: "rotala-rotundifolia-hra", name: "Rotala H'ra", latin: "Rotala rotundifolia 'H'ra'", cat: "tanaman",
    price: 22000, unit: "ikat 5 batang", stock: 40, tag: "Terlaris",
    desc: "Stem berdaun sempit yang memerah di bawah cahaya kuat. Pilihan klasik untuk latar belakang berwarna.",
    specs: [["Perawatan", "Sedang"], ["Cahaya", "Sedang sampai tinggi"], ["CO2", "Disarankan"], ["Tinggi", "20 sampai 40 cm"], ["Penempatan", "Tengah dan belakang"]],
    art: { kind: "stem", hue: ["#6c9a4a", "#b9506a", "#d77a8a"], leaf: "narrow" },
  },
  {
    id: "ludwigia-super-red", name: "Ludwigia Super Red", latin: "Ludwigia sp. 'Super Red'", cat: "tanaman",
    price: 25000, unit: "ikat 5 batang", stock: 28,
    desc: "Daun merah tua bagian bawahnya, cocok memberi titik fokus warna di antara hijau.",
    specs: [["Perawatan", "Sedang"], ["Cahaya", "Tinggi"], ["CO2", "Disarankan"], ["Tinggi", "25 sampai 50 cm"], ["Penempatan", "Belakang"]],
    art: { kind: "stem", hue: ["#7a2f3a", "#a8404a", "#c9605e"], leaf: "round" },
  },
  {
    id: "hygrophila-pinnatifida", name: "Hygrophila Pinnatifida", latin: "Hygrophila pinnatifida", cat: "tanaman",
    price: 30000, unit: "per rumpun", stock: 16,
    desc: "Daun bergelombang dengan urat kecokelatan. Menempel di batu dan kayu seperti epifit.",
    specs: [["Perawatan", "Mudah"], ["Cahaya", "Rendah sampai sedang"], ["CO2", "Tidak wajib"], ["Tinggi", "15 sampai 30 cm"], ["Penempatan", "Menempel di hardscape"]],
    art: { kind: "rosette", hue: ["#5d8a3c", "#8a6a2e"], leaf: "lobed", n: 7 },
  },
  {
    id: "anubias-nana", name: "Anubias Nana", latin: "Anubias barteri var. nana", cat: "tanaman",
    price: 35000, unit: "per rimpang", stock: 34, tag: "Terlaris",
    desc: "Daun tebal dan keras, hampir tak tersentuh ikan herbivora. Ikat ke kayu, jangan tanam rimpangnya.",
    specs: [["Perawatan", "Sangat mudah"], ["Cahaya", "Rendah"], ["CO2", "Tidak wajib"], ["Tinggi", "8 sampai 15 cm"], ["Penempatan", "Menempel di hardscape"]],
    art: { kind: "rosette", hue: ["#2f6a3a", "#4d8a4a"], leaf: "broad", n: 6 },
  },
  {
    id: "java-fern-narrow", name: "Java Fern Narrow", latin: "Microsorum pteropus 'Narrow'", cat: "tanaman",
    price: 28000, unit: "per rumpun", stock: 25,
    desc: "Paku air berdaun ramping. Tumbuh lambat, hampir tidak butuh pupuk tambahan.",
    specs: [["Perawatan", "Sangat mudah"], ["Cahaya", "Rendah"], ["CO2", "Tidak wajib"], ["Tinggi", "15 sampai 30 cm"], ["Penempatan", "Menempel di hardscape"]],
    art: { kind: "fern", hue: ["#3d7a3a", "#5a9a4a"] },
  },
  {
    id: "cryptocoryne-wendtii", name: "Cryptocoryne Wendtii", latin: "Cryptocoryne wendtii 'Green'", cat: "tanaman",
    price: 24000, unit: "per rumpun", stock: 30,
    desc: "Daun bergelombang yang rapat di tengah tangki. Bisa rontok saat pindah, lalu tumbuh lagi dalam dua minggu.",
    specs: [["Perawatan", "Mudah"], ["Cahaya", "Rendah sampai sedang"], ["CO2", "Tidak wajib"], ["Tinggi", "10 sampai 20 cm"], ["Penempatan", "Tengah"]],
    art: { kind: "rosette", hue: ["#4f7f3a", "#7a8a3a"], leaf: "wavy", n: 8 },
  },
  {
    id: "echinodorus-ozelot", name: "Echinodorus Ozelot", latin: "Echinodorus 'Ozelot'", cat: "tanaman",
    price: 65000, unit: "per rumpun", stock: 9, tag: "Stok tipis",
    desc: "Tanaman pedang besar dengan totol merah tua. Cocok sebagai titik fokus di tangki 90 cm ke atas.",
    specs: [["Perawatan", "Mudah"], ["Cahaya", "Sedang"], ["CO2", "Tidak wajib"], ["Tinggi", "30 sampai 50 cm"], ["Penempatan", "Tengah dan belakang"]],
    art: { kind: "rosette", hue: ["#5b7d33", "#8a3a3a"], leaf: "sword", n: 9 },
  },
  {
    id: "bucephalandra-kedagang", name: "Bucephalandra Kedagang", latin: "Bucephalandra sp. 'Kedagang'", cat: "tanaman",
    price: 55000, unit: "per rumpun", stock: 12, tag: "Baru",
    desc: "Daun kecil berkilau kebiruan dari Kalimantan. Tumbuh sangat pelan, cantik di sela batu.",
    specs: [["Perawatan", "Mudah"], ["Cahaya", "Rendah sampai sedang"], ["CO2", "Tidak wajib"], ["Tinggi", "5 sampai 10 cm"], ["Penempatan", "Menempel di hardscape"]],
    art: { kind: "rosette", hue: ["#1f5a58", "#3f8a80"], leaf: "round", n: 8, small: true },
  },
  {
    id: "monte-carlo", name: "Monte Carlo", latin: "Micranthemum 'Monte Carlo'", cat: "tanaman",
    price: 45000, unit: "pot 1 porsi", stock: 20,
    desc: "Penutup tanah berdaun bulat kecil. Satu pot cukup untuk area sekitar 10 x 10 cm.",
    specs: [["Perawatan", "Sedang"], ["Cahaya", "Sedang sampai tinggi"], ["CO2", "Disarankan"], ["Tinggi", "3 sampai 5 cm"], ["Penempatan", "Depan"]],
    art: { kind: "carpet", hue: ["#7fae3f", "#a6c85a"], tall: false },
  },
  {
    id: "hairgrass-eleocharis", name: "Hairgrass Mini", latin: "Eleocharis parvula", cat: "tanaman",
    price: 50000, unit: "pot 1 porsi", stock: 18,
    desc: "Rumput halus yang membuat hamparan seperti padang. Beri CO2 dan cahaya yang kuat agar merapat.",
    specs: [["Perawatan", "Sedang"], ["Cahaya", "Tinggi"], ["CO2", "Wajib"], ["Tinggi", "5 sampai 10 cm"], ["Penempatan", "Depan dan tengah"]],
    art: { kind: "carpet", hue: ["#5f9a3a", "#8ac04a"], tall: true },
  },
  {
    id: "java-moss", name: "Java Moss", latin: "Taxiphyllum barbieri", cat: "tanaman",
    price: 20000, unit: "segenggam", stock: 60,
    desc: "Lumut paling mudah untuk pemula. Tempat bersembunyi anak udang dan ikan.",
    specs: [["Perawatan", "Sangat mudah"], ["Cahaya", "Rendah"], ["CO2", "Tidak wajib"], ["Tinggi", "3 sampai 8 cm"], ["Penempatan", "Menempel di hardscape"]],
    art: { kind: "moss", hue: ["#2f5f2f", "#4a8a3a", "#6aa850"] },
  },
  {
    id: "riccia-fluitans", name: "Riccia Fluitans", latin: "Riccia fluitans", cat: "tanaman",
    price: 26000, unit: "segenggam", stock: 22,
    desc: "Tanaman berserat yang bisa mengambang atau diikat di batu hingga menjadi bantalan hijau terang.",
    specs: [["Perawatan", "Sedang"], ["Cahaya", "Sedang sampai tinggi"], ["CO2", "Disarankan"], ["Tinggi", "2 sampai 5 cm"], ["Penempatan", "Depan, atau mengambang"]],
    art: { kind: "moss", hue: ["#6aa02f", "#92c83f", "#b9e05a"] },
  },

  /* ---------------- Hardscape ---------------- */
  {
    id: "batu-seiryu", name: "Batu Seiryu", latin: "Seiryu stone", cat: "hardscape",
    price: 85000, unit: "per kg", stock: 120, tag: "Terlaris",
    desc: "Batu kapur abu kebiruan dengan urat putih. Menaikkan kesadahan air, cocok untuk gaya iwagumi.",
    specs: [["Warna", "Abu biru, urat putih"], ["Efek air", "Menaikkan GH dan KH"], ["Ukuran", "Pilih per potong"], ["Gaya", "Iwagumi, rock scape"]],
    art: { kind: "rock", tone: "#7e8a92", vein: true },
  },
  {
    id: "dragon-stone", name: "Dragon Stone", latin: "Ohko stone", cat: "hardscape",
    price: 70000, unit: "per kg", stock: 90,
    desc: "Batu berlubang berwarna cokelat keabuan yang memberi kesan kuno. Tidak mengubah parameter air.",
    specs: [["Warna", "Cokelat keabuan"], ["Efek air", "Netral"], ["Ukuran", "Pilih per potong"], ["Gaya", "Nature, jungle"]],
    art: { kind: "rock", tone: "#a08a6a", pits: true },
  },
  {
    id: "batu-frodo", name: "Batu Frodo", latin: "Frodo stone", cat: "hardscape",
    price: 60000, unit: "per kg", stock: 70,
    desc: "Batu gelap bertekstur kasar, cocok sebagai dasar menempelnya lumut. Aman untuk air lunak.",
    specs: [["Warna", "Abu gelap"], ["Efek air", "Netral"], ["Ukuran", "Pilih per potong"], ["Gaya", "Nature, lumut"]],
    art: { kind: "rock", tone: "#4e5456" },
  },
  {
    id: "spiderwood", name: "Spiderwood", latin: "Kayu apung bercabang", cat: "hardscape",
    price: 95000, unit: "per potong", stock: 24,
    desc: "Kayu bercabang halus seperti pohon musim dingin. Direbus dan direndam sebelum dikirim, jadi tidak menguning airnya.",
    specs: [["Warna", "Cokelat tua"], ["Panjang", "25 sampai 45 cm"], ["Persiapan", "Sudah direbus"], ["Gaya", "Nature, pohon"]],
    art: { kind: "wood", tone: "#6a4a30", branches: 6 },
  },
  {
    id: "akar-bakau", name: "Akar Bakau", latin: "Mangrove root", cat: "hardscape",
    price: 75000, unit: "per potong", stock: 18,
    desc: "Akar berliku dan padat. Tenggelam sendiri tanpa perlu dikaitkan, melepas sedikit tanin di minggu pertama.",
    specs: [["Warna", "Cokelat kemerahan"], ["Panjang", "20 sampai 40 cm"], ["Persiapan", "Rendam 3 hari"], ["Gaya", "Jungle, nature"]],
    art: { kind: "wood", tone: "#8a5a38", branches: 4 },
  },

  /* ---------------- Substrat ---------------- */
  {
    id: "aquasoil-hitam", name: "Aquasoil Nutrisi Hitam", cat: "substrat",
    price: 245000, unit: "9 liter", stock: 36, tag: "Terlaris",
    desc: "Soil butiran yang menurunkan pH dan menyimpan nutrisi untuk akar. Cukup untuk tangki 60 x 30 dengan tebal 5 cm.",
    specs: [["Isi", "9 liter"], ["pH air", "Menurunkan ke 6,0 sampai 6,8"], ["Umur", "12 sampai 18 bulan"], ["Cocok untuk", "Tanaman menuntut"]],
    art: { kind: "soil", tone: "#2a2420" },
  },
  {
    id: "pasir-silika-putih", name: "Pasir Silika Putih", cat: "substrat",
    price: 55000, unit: "5 kg", stock: 80,
    desc: "Pasir halus netral. Bagus untuk area terbuka di depan tata letak atau tangki ikan dasar.",
    specs: [["Isi", "5 kg"], ["Butiran", "0,5 sampai 1 mm"], ["Efek air", "Netral"], ["Dicuci", "Sudah, bilas ringan"]],
    art: { kind: "soil", tone: "#d8d2bf" },
  },
  {
    id: "pasir-vulkanik-hitam", name: "Pasir Vulkanik Hitam", cat: "substrat",
    price: 65000, unit: "5 kg", stock: 55,
    desc: "Pasir hitam dari gunung api yang membuat warna ikan dan tanaman terlihat lebih tajam.",
    specs: [["Isi", "5 kg"], ["Butiran", "1 sampai 2 mm"], ["Efek air", "Netral"], ["Dicuci", "Bilas hingga jernih"]],
    art: { kind: "soil", tone: "#3a3a3e" },
  },
  {
    id: "laterit-dasar", name: "Laterit Dasar Nutrisi", cat: "substrat",
    price: 48000, unit: "1 kg", stock: 42,
    desc: "Lapisan nutrisi yang dipasang di bawah pasir untuk tanaman akar. Cukup 1 kg per 60 cm.",
    specs: [["Isi", "1 kg"], ["Fungsi", "Pupuk dasar"], ["Penggunaan", "Taburkan sebelum pasir"], ["Efek air", "Netral"]],
    art: { kind: "soil", tone: "#7a4a34" },
  },

  /* ---------------- Fauna ---------------- */
  {
    id: "neon-tetra", name: "Neon Tetra", latin: "Paracheirodon innesi", cat: "fauna",
    price: 6000, unit: "per ekor, min. 10", stock: 200, tag: "Terlaris",
    desc: "Ikan kecil dengan garis biru neon yang hidup rukun dalam kelompok. Ukuran 2 cm, siap masuk tangki matang.",
    specs: [["Ukuran dewasa", "3 cm"], ["Suhu", "22 sampai 27 C"], ["pH", "5,5 sampai 7,5"], ["Perilaku", "Damai, berkelompok"], ["Minimal", "10 ekor"]],
    art: { kind: "fish", style: "tetra", body: "#9fb4c0", stripe: "#2fb8e0", belly: "#d8423a" },
  },
  {
    id: "ember-tetra", name: "Ember Tetra", latin: "Hyphessobrycon amandae", cat: "fauna",
    price: 7000, unit: "per ekor, min. 10", stock: 120,
    desc: "Tetra oranye menyala yang sangat kecil, ideal untuk tangki 40 cm yang rapat tanamannya.",
    specs: [["Ukuran dewasa", "2 cm"], ["Suhu", "23 sampai 28 C"], ["pH", "5,5 sampai 7,0"], ["Perilaku", "Damai, berkelompok"], ["Minimal", "10 ekor"]],
    art: { kind: "fish", style: "tetra", body: "#e88a3a", stripe: "#f0a050", belly: "#e07a2a" },
  },
  {
    id: "harlequin-rasbora", name: "Harlequin Rasbora", latin: "Trigonostigma heteromorpha", cat: "fauna",
    price: 9000, unit: "per ekor, min. 8", stock: 80,
    desc: "Badan keperakan keoranyean dengan segitiga hitam di punggungnya. Berenang tenang di tengah air.",
    specs: [["Ukuran dewasa", "4 cm"], ["Suhu", "23 sampai 28 C"], ["pH", "5,5 sampai 7,5"], ["Perilaku", "Damai, berkelompok"], ["Minimal", "8 ekor"]],
    art: { kind: "fish", style: "round", body: "#e8a05a", stripe: "#1c2224", belly: "#f0c090" },
  },
  {
    id: "otocinclus", name: "Otocinclus", latin: "Otocinclus affinis", cat: "fauna",
    price: 12000, unit: "per ekor", stock: 3, tag: "Stok tipis",
    desc: "Pemakan alga kecil yang bersih bekerja di daun dan kaca. Sebaiknya masuk tangki yang sudah berumur dua bulan.",
    specs: [["Ukuran dewasa", "4 cm"], ["Suhu", "22 sampai 26 C"], ["pH", "6,0 sampai 7,5"], ["Perilaku", "Damai, aktif sore"], ["Minimal", "4 ekor"]],
    art: { kind: "fish", style: "oto", body: "#8a9a7a", stripe: "#3a3f34", belly: "#cfd4be" },
  },
  {
    id: "corydoras-panda", name: "Corydoras Panda", latin: "Corydoras panda", cat: "fauna",
    price: 18000, unit: "per ekor, min. 4", stock: 40,
    desc: "Ikan dasar bermata hitam seperti panda. Gemar mengais pasir, jadi pilih pasir halus.",
    specs: [["Ukuran dewasa", "5 cm"], ["Suhu", "22 sampai 26 C"], ["pH", "6,0 sampai 7,5"], ["Perilaku", "Damai, di dasar"], ["Minimal", "4 ekor"]],
    art: { kind: "fish", style: "cory", body: "#e2c9a0", stripe: "#1c1c1c", belly: "#f1e1c2" },
  },
  {
    id: "red-cherry-shrimp", name: "Red Cherry Shrimp", latin: "Neocaridina davidi", cat: "fauna",
    price: 8000, unit: "per ekor, min. 6", stock: 150,
    desc: "Udang merah paling tangguh untuk pemula. Berkembang biak sendiri jika airnya stabil.",
    specs: [["Ukuran dewasa", "3 cm"], ["Suhu", "20 sampai 28 C"], ["pH", "6,5 sampai 8,0"], ["Perilaku", "Damai, pemakan alga"], ["Minimal", "6 ekor"]],
    art: { kind: "shrimp", color: "#d42a2a", bands: false },
  },
  {
    id: "crystal-red-shrimp", name: "Crystal Red Shrimp", latin: "Caridina cantonensis", cat: "fauna",
    price: 45000, unit: "per ekor", stock: 20, tag: "Baru",
    desc: "Udang bergaris merah-putih dengan pola belang. Butuh air lunak dan asam, cocok dipasang dengan soil.",
    specs: [["Ukuran dewasa", "2,5 cm"], ["Suhu", "20 sampai 24 C"], ["pH", "5,8 sampai 6,6"], ["Perilaku", "Damai, sensitif"], ["Minimal", "6 ekor"]],
    art: { kind: "shrimp", color: "#c0262e", bands: true },
  },

  /* ---------------- Akuarium & lampu ---------------- */
  {
    id: "akuarium-60", name: "Akuarium Kaca Bening 60 x 30 x 36", cat: "akuarium",
    price: 1150000, unit: "set dengan alas busa", stock: 10, tag: "Terlaris",
    desc: "Kaca low-iron 5 mm dengan sambungan silikon rapi tanpa gelembung. Ukuran yang paling pas untuk tangki pertama.",
    specs: [["Ukuran", "60 x 30 x 36 cm"], ["Volume", "Sekitar 65 liter"], ["Kaca", "Low-iron 5 mm"], ["Termasuk", "Alas busa"]],
    art: { kind: "tank", w: 3, h: 1.8 },
  },
  {
    id: "akuarium-90", name: "Akuarium Kaca Bening 90 x 45 x 45", cat: "akuarium",
    price: 3400000, unit: "set dengan alas busa", stock: 4,
    desc: "Kaca low-iron 8 mm untuk tata letak besar. Pengiriman memakai kayu pelindung, hanya Jawa dan Bali.",
    specs: [["Ukuran", "90 x 45 x 45 cm"], ["Volume", "Sekitar 180 liter"], ["Kaca", "Low-iron 8 mm"], ["Termasuk", "Alas busa"]],
    art: { kind: "tank", w: 3.4, h: 2.2 },
  },
  {
    id: "led-60", name: "Lampu LED Spektrum Penuh 60 cm", cat: "akuarium",
    price: 485000, unit: "per unit", stock: 22,
    desc: "LED 6500 K dengan kanal biru dan merah yang bisa diatur. Dilengkapi timer dan kaki penyangga.",
    specs: [["Panjang", "60 cm"], ["Daya", "36 W"], ["Warna", "6500 K, dimmable"], ["Termasuk", "Timer dan kaki"]],
    art: { kind: "light", n: 9 },
  },
  {
    id: "led-90", name: "Lampu LED Spektrum Penuh 90 cm", cat: "akuarium",
    price: 745000, unit: "per unit", stock: 8,
    desc: "Versi panjang dengan sebaran cahaya lebih merata untuk tangki 90 cm. Kanal dapat diatur lewat aplikasi.",
    specs: [["Panjang", "90 cm"], ["Daya", "54 W"], ["Warna", "6500 K, dimmable"], ["Termasuk", "Timer dan kaki"]],
    art: { kind: "light", n: 13 },
  },

  /* ---------------- Peralatan ---------------- */
  {
    id: "set-co2", name: "Set CO2 Tabung 2 kg", cat: "peralatan",
    price: 1650000, unit: "set lengkap", stock: 7,
    desc: "Tabung aluminium, regulator solenoid, bubble counter, dan drop checker. Siap pasang untuk tangki sampai 150 liter.",
    specs: [["Tabung", "2 kg"], ["Regulator", "Solenoid, dua tingkat"], ["Termasuk", "Bubble counter dan drop checker"], ["Isi ulang", "Tersedia di toko"]],
    art: { kind: "co2" },
  },
  {
    id: "filter-canister", name: "Filter Eksternal Canister 800", cat: "peralatan",
    price: 890000, unit: "per unit", stock: 11,
    desc: "Filter tertutup dengan empat keranjang media. Senyap, dan menjaga permukaan air tetap bersih.",
    specs: [["Aliran", "800 liter per jam"], ["Tangki", "60 sampai 120 liter"], ["Media", "4 keranjang"], ["Termasuk", "Selang dan pipa lily"]],
    art: { kind: "filter" },
  },
  {
    id: "heater-100", name: "Pemanas Akuarium 100 W", cat: "peralatan",
    price: 165000, unit: "per unit", stock: 26,
    desc: "Pemanas dengan termostat yang bisa diatur. Cocok untuk tangki sampai 80 liter di daerah dataran tinggi.",
    specs: [["Daya", "100 W"], ["Tangki", "Sampai 80 liter"], ["Rentang suhu", "20 sampai 34 C"], ["Material", "Kaca borosilikat"]],
    art: { kind: "heater" },
  },
  {
    id: "pupuk-makro", name: "Pupuk Makro NPK Cair", cat: "peralatan",
    price: 78000, unit: "250 ml", stock: 50,
    desc: "Nitrogen, fosfor, dan kalium untuk tanaman. Dosis harian 2 ml per 60 liter.",
    specs: [["Isi", "250 ml"], ["Kandungan", "N, P, K"], ["Dosis", "2 ml per 60 liter"], ["Frekuensi", "Harian"]],
    art: { kind: "fert", color: "#4a8a4a" },
  },
  {
    id: "pupuk-mikro", name: "Pupuk Mikro Besi dan Jejak", cat: "peralatan",
    price: 82000, unit: "250 ml", stock: 46,
    desc: "Besi dan unsur jejak untuk warna daun. Membuat merah pada stem tampak lebih tajam.",
    specs: [["Isi", "250 ml"], ["Kandungan", "Fe dan unsur jejak"], ["Dosis", "1 ml per 60 liter"], ["Frekuensi", "Dua hari sekali"]],
    art: { kind: "fert", color: "#a8553a" },
  },
  {
    id: "gunting-lurus", name: "Gunting Lurus Stainless 25 cm", cat: "peralatan",
    price: 145000, unit: "per unit", stock: 30,
    desc: "Gunting panjang untuk memangkas stem dan karpet di dalam air. Ujung tajam, pegangan nyaman.",
    specs: [["Panjang", "25 cm"], ["Material", "Stainless 304"], ["Bentuk", "Lurus"], ["Fungsi", "Pangkas"]],
    art: { kind: "tool", type: "scissors" },
  },
  {
    id: "pinset-lurus", name: "Pinset Lurus Stainless 27 cm", cat: "peralatan",
    price: 98000, unit: "per unit", stock: 33,
    desc: "Pinset panjang untuk menanam dan menata tanaman kecil tanpa mengaduk dasar.",
    specs: [["Panjang", "27 cm"], ["Material", "Stainless 304"], ["Bentuk", "Lurus"], ["Fungsi", "Menanam"]],
    art: { kind: "tool", type: "tweezers" },
  },
];

/* ---------------- Paket ---------------- */
export interface Bundle {
  id: string;
  name: string;
  note: string;
  items: { id: string; qty: number }[];
  discount: number; // 0.08 = 8%
}

export const BUNDLES: Bundle[] = [
  {
    id: "paket-pertama", name: "Paket tangki pertama 60 cm",
    note: "Semua yang diperlukan untuk tata letak tanpa CO2: tangki, lampu, soil, kayu, tanaman tahan banting, dan ikan.",
    items: [
      { id: "akuarium-60", qty: 1 }, { id: "led-60", qty: 1 }, { id: "aquasoil-hitam", qty: 1 },
      { id: "spiderwood", qty: 1 }, { id: "anubias-nana", qty: 2 }, { id: "java-fern-narrow", qty: 2 },
      { id: "java-moss", qty: 2 }, { id: "neon-tetra", qty: 10 },
    ],
    discount: 0.08,
  },
  {
    id: "paket-iwagumi", name: "Paket iwagumi 60 cm",
    note: "Batu seiryu, pasir putih, dan karpet halus. Membutuhkan CO2 dan cahaya kuat, sudah termasuk.",
    items: [
      { id: "akuarium-60", qty: 1 }, { id: "led-60", qty: 1 }, { id: "set-co2", qty: 1 },
      { id: "aquasoil-hitam", qty: 1 }, { id: "batu-seiryu", qty: 4 }, { id: "hairgrass-eleocharis", qty: 3 },
      { id: "ember-tetra", qty: 12 },
    ],
    discount: 0.06,
  },
  {
    id: "paket-perawatan", name: "Paket perawatan bulanan",
    note: "Pupuk, alat potong, dan pinset untuk menjaga tata letak tetap rapi.",
    items: [
      { id: "pupuk-makro", qty: 1 }, { id: "pupuk-mikro", qty: 1 },
      { id: "gunting-lurus", qty: 1 }, { id: "pinset-lurus", qty: 1 },
    ],
    discount: 0.1,
  },
];

/* ---------------- Panduan ---------------- */
export interface Guide {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  art: string;
  body: { h?: string; p: string }[];
}

export const GUIDES: Guide[] = [
  {
    id: "memulai-aquascape",
    title: "Memulai aquascape pertama Anda",
    summary: "Dari tangki kosong sampai tata letak yang siap diisi ikan, dalam urutan yang aman.",
    minutes: 5,
    art: "akuarium-60",
    body: [
      { h: "Mulai dari tangki, bukan dari tanaman", p: "Pilih ukuran 60 x 30 cm. Volume air sekitar 65 liter cukup besar untuk stabil, tapi masih mudah dirawat. Tangki yang terlalu kecil berubah suhu dan kandungan air dengan cepat." },
      { h: "Susun hardscape sebelum diisi air", p: "Letakkan batu atau kayu di atas soil, dengan tinggi tidak sama. Satu titik fokus di sepertiga kiri atau kanan membuat tata letak lebih menarik daripada menaruhnya di tengah." },
      { h: "Tanam dari belakang ke depan", p: "Pakai pinset. Stem di belakang, rosette di tengah, karpet di depan. Semprot daun agar tidak kering sebelum tangki diisi air perlahan." },
      { h: "Tunggu sebelum memasukkan ikan", p: "Biarkan tangki berjalan minimal dua minggu. Ini waktu bakteri baik berkembang, dan tanaman beradaptasi." },
    ],
  },
  {
    id: "siklus-nitrogen",
    title: "Siklus nitrogen: kenapa ikan tidak langsung masuk",
    summary: "Amonia dari sisa makanan harus diurai dulu. Begini cara mengetahuinya sudah aman.",
    minutes: 4,
    art: "filter-canister",
    body: [
      { h: "Apa yang terjadi di dalam filter", p: "Sisa makanan dan kotoran menghasilkan amonia, racun bagi ikan. Bakteri mengubahnya menjadi nitrit, lalu menjadi nitrat yang jauh lebih aman." },
      { h: "Cara mengujinya", p: "Pakai test kit amonia dan nitrit. Tangki siap bila keduanya terbaca nol sementara nitrat terdeteksi, biasanya setelah dua sampai empat minggu." },
      { h: "Mempercepat prosesnya", p: "Pakai soil nutrisi, bakteri starter, dan tanaman cepat tumbuh seperti stem. Tanaman menyerap amonia sehingga tangki lebih tenang." },
    ],
  },
  {
    id: "cahaya-dan-co2",
    title: "Cahaya dan CO2: seimbangkan dulu, baru tambah",
    summary: "Alga hampir selalu berarti cahaya, nutrisi, dan karbon tidak seimbang.",
    minutes: 5,
    art: "led-60",
    body: [
      { h: "Tanpa CO2 pun bisa", p: "Tangki low-tech dengan Anubias, paku air, dan lumut tumbuh baik dengan cahaya sedang selama 6 jam. Tidak perlu pupuk berat." },
      { h: "Dengan CO2, semuanya naik", p: "Tanaman karpet dan stem merah memerlukan CO2 sekitar 25 sampai 30 ppm. Tanda drop checker berwarna lime muda berarti kadar ini tercapai." },
      { h: "Atur durasi, bukan hanya intensitas", p: "Mulai 6 jam sehari, naikkan perlahan. Pasang timer agar konsisten, karena alga lebih suka perubahan mendadak." },
    ],
  },
  {
    id: "merawat-karpet",
    title: "Merawat tanaman karpet",
    summary: "Monte Carlo dan hairgrass butuh sedikit disiplin, tapi hasilnya memuaskan.",
    minutes: 3,
    art: "monte-carlo",
    body: [
      { h: "Pecah menjadi rumpun kecil", p: "Pisahkan pot menjadi potongan sebesar kuku, lalu tanam dengan pinset berjarak 2 cm. Semakin rapat, semakin cepat menutup." },
      { h: "Pangkas rutin", p: "Setelah tumbuh setinggi 5 cm, pangkas dengan gunting lurus. Tanaman akan bercabang ke samping dan semakin padat." },
      { h: "Jaga sirkulasi", p: "Arahkan aliran filter agar menyapu permukaan karpet. Kotoran yang menumpuk membuat bagian bawah menguning." },
    ],
  },
  {
    id: "memilih-hardscape",
    title: "Memilih batu dan kayu",
    summary: "Batu mengubah kesadahan air, kayu mengubah warnanya. Pilih sesuai ikan dan tanaman Anda.",
    minutes: 4,
    art: "batu-seiryu",
    body: [
      { h: "Batu yang menaikkan GH dan KH", p: "Seiryu dan sejenisnya melepaskan kalsium. Bagus untuk ikan yang suka air keras, tapi kurang cocok untuk udang crystal dan Rummy nose." },
      { h: "Batu netral", p: "Dragon stone dan batu Frodo aman untuk semua jenis air. Gunakan keduanya bila Anda ingin parameter tetap rendah." },
      { h: "Kayu dan tanin", p: "Kayu baru melepas tanin yang membuat air kecokelatan. Rebus 1 jam atau rendam 3 hari agar tenggelam dan jernih." },
    ],
  },
];

export const rupiah = (n: number) =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));

/** Jumlah minimum beli, dibaca dari satuan seperti "per ekor, min. 10". */
export const minQty = (p: Product) => Math.min(p.stock || 1, Number(p.unit.match(/min\. (\d+)/)?.[1] ?? 1));

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
export const catName = (id: CatId) => CATEGORIES.find((c) => c.id === id)!.name;

/** Kode produk pendek untuk pesanan lewat WhatsApp. */
export const code = (p: Product) => "ON-" + String(PRODUCTS.indexOf(p) + 1).padStart(2, "0");

/** Kebutuhan tanaman dibaca dari spesifikasi: cahaya 1 sampai 3, CO2 0 sampai 2. */
export function care(p: Product): { light: number; co2: number } | null {
  if (p.cat !== "tanaman") return null;
  const spec = (k: string) => (p.specs.find(([a]) => a === k)?.[1] ?? "").toLowerCase();
  const l = spec("Cahaya");
  const light = l.includes("tinggi") ? 3 : l.includes("sedang") ? 2 : 1;
  const c = spec("CO2");
  const co2 = c.includes("tidak") ? 0 : c.includes("wajib") ? 2 : 1;
  return { light, co2 };
}

export interface StyleGuide {
  id: "iwagumi" | "nature" | "jungle";
  name: string;
  lead: string;
  needs: [string, string][];
  items: string[];
  bundle?: string;
}

export const STYLES: StyleGuide[] = [
  {
    id: "iwagumi", name: "Iwagumi",
    lead: "Satu jenis karpet, tiga batu, dan banyak ruang kosong. Tampak sederhana, tapi tiap sudut batu harus dipikirkan.",
    needs: [["Cahaya", "Tinggi"], ["CO2", "Wajib"], ["Perawatan", "Sedang"]],
    items: ["batu-seiryu", "hairgrass-eleocharis", "aquasoil-hitam", "ember-tetra"],
    bundle: "paket-iwagumi",
  },
  {
    id: "nature", name: "Nature style",
    lead: "Kayu sebagai pohon, batu kecil sebagai bukit, dan tanaman bertingkat dari depan ke belakang. Gaya paling populer di kalangan pemula.",
    needs: [["Cahaya", "Sedang"], ["CO2", "Disarankan"], ["Perawatan", "Sedang"]],
    items: ["spiderwood", "rotala-rotundifolia-hra", "monte-carlo", "java-moss"],
    bundle: "paket-pertama",
  },
  {
    id: "jungle", name: "Jungle",
    lead: "Padat, liar, dan hijau. Tanaman tahan banting dibiarkan tumbuh menutupi akar bakau. Paling memaafkan kesalahan.",
    needs: [["Cahaya", "Rendah"], ["CO2", "Tidak wajib"], ["Perawatan", "Mudah"]],
    items: ["akar-bakau", "anubias-nana", "java-fern-narrow", "echinodorus-ozelot"],
  },
];
