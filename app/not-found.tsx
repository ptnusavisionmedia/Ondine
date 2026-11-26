import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page wrap">
      <div className="empty">
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang Anda buka tidak ada atau produknya sudah dipindahkan.</p>
        <Link className="btn" href="/toko">
          Lihat semua produk
        </Link>
      </div>
    </section>
  );
}
