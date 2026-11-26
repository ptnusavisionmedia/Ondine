"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="page wrap">
      <div className="empty">
        <h1>Terjadi kesalahan</h1>
        <p>Halaman ini gagal dimuat. Coba lagi, atau hubungi kami lewat WhatsApp bila terus terjadi.</p>
        <button className="btn" type="button" onClick={reset}>
          Coba lagi
        </button>
      </div>
    </section>
  );
}
