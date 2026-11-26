"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { STORE, byId, code, rupiah } from "@/lib/data";
import { COURIERS, buildOrderText, customerSchema, waLink } from "@/lib/order";
import { Plate } from "./Art";

const subscribeHydration = (cb: () => void) => useCart.persist.onFinishHydration(cb);
const useHydrated = () =>
  useSyncExternalStore(subscribeHydration, () => useCart.persist.hasHydrated(), () => false);

type Errors = Partial<Record<"nama" | "hp" | "alamat" | "kota" | "kurir" | "catatan", string>>;

export function CartView() {
  const hydrated = useHydrated();
  const { lines, set, remove, clear } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<{ link: string; total: number } | null>(null);
  const subtotal = cartSubtotal(lines);

  if (done) {
    return (
      <div className="done">
        <h1 className="page__title">Pesanan siap dikirim</h1>
        <p className="page__lead">
          WhatsApp terbuka dengan rincian pesanan Anda. Tekan kirim di sana agar admin menerimanya. Jika tidak
          terbuka, gunakan tombol di bawah.
        </p>
        <a className="btn btn--lg" href={done.link} target="_blank" rel="noopener noreferrer">
          Buka WhatsApp lagi
        </a>
        <div className="note note--plain">
          <h2>Setelah admin membalas</h2>
          <p>
            Transfer sebesar total yang dikonfirmasi (subtotal {rupiah(done.total)} ditambah ongkir) ke salah satu
            rekening ini, lalu kirim bukti transfer.
          </p>
          <ul className="bank">
            {STORE.bank.map((b) => (
              <li key={b.bank}>
                <b>{b.bank}</b>
                <span>{b.no}</span>
                <i>a.n. {b.name}</i>
              </li>
            ))}
          </ul>
        </div>
        <Link className="link" href="/toko">
          Kembali berbelanja
        </Link>
      </div>
    );
  }

  const head = (
    <header className="page__head">
      <h1 className="page__title">Keranjang</h1>
      {lines.length > 0 && (
        <p className="page__lead">
          Periksa pesanan, isi data pengiriman, lalu kirim lewat WhatsApp. Admin akan menghitung ongkir dan
          mengonfirmasi stok.
        </p>
      )}
    </header>
  );

  if (!hydrated) {
    return (
      <>
        {head}
        <p className="count" role="status">
          Memuat keranjang…
        </p>
      </>
    );
  }

  if (!lines.length) {
    return (
      <>
        {head}
        <div className="empty empty--art">
          <div className="empty__art" data-cat="akuarium">
            <Plate p={byId("akuarium-60")!} sizes="240px" />
          </div>
          <div>
            <h2>Keranjang masih kosong</h2>
            <p>Mulai dari rak tanaman, atau pilih satu paket siap rakit.</p>
            <Link className="btn" href="/toko">
              Lihat produk
            </Link>
          </div>
        </div>
      </>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = customerSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Errors;
        errs[k] ??= issue.message;
      }
      setErrors(errs);
      const first = Object.keys(errs)[0];
      if (first) form.querySelector<HTMLElement>(`#${first}`)?.focus();
      return;
    }
    setErrors({});
    const link = waLink(buildOrderText(lines, parsed.data));
    window.open(link, "_blank", "noopener");
    setDone({ link, total: subtotal });
    clear();
    window.scrollTo({ top: 0 });
  };

  const err = (k: keyof Errors) => (
    <p className="err" id={`${k}-err`}>
      {errors[k] ?? ""}
    </p>
  );
  const aria = (k: keyof Errors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${k}-err` : undefined,
  });

  return (
    <>
      {head}
      <div className="checkout">
        <ul className="rows">
          {lines.map((l) => {
            const p = byId(l.id)!;
            return (
              <li className="row" key={p.id}>
                <Link className="row__art" data-cat={p.cat} href={`/produk/${p.id}`}>
                  <Plate p={p} sizes="96px" />
                </Link>
                <div className="row__info">
                  <Link className="row__name" href={`/produk/${p.id}`}>
                    {p.name}
                  </Link>
                  {p.latin && <p className="latin">{p.latin}</p>}
                  <p className="row__unit">
                    {code(p)} · {rupiah(p.price)} · {p.unit}
                  </p>
                  <button className="link link--btn" type="button" onClick={() => remove(p.id)}>
                    Hapus
                  </button>
                </div>
                <div className="qty qty--sm" role="group" aria-label={`Jumlah ${p.name}`}>
                  <button type="button" aria-label="Kurangi" onClick={() => set(p.id, l.qty - 1)}>
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={p.stock}
                    aria-label="Jumlah"
                    key={l.qty}
                    defaultValue={l.qty}
                    onBlur={(e) => set(p.id, Math.floor(Number(e.target.value) || 1))}
                  />
                  <button type="button" aria-label="Tambah" onClick={() => set(p.id, l.qty + 1)}>
                    +
                  </button>
                </div>
                <p className="row__total">{rupiah(p.price * l.qty)}</p>
              </li>
            );
          })}
        </ul>

        <form className="order" noValidate onSubmit={onSubmit}>
          <h2>Data pengiriman</h2>
          <div className="field">
            <label htmlFor="nama">Nama penerima</label>
            <input id="nama" name="nama" autoComplete="name" required {...aria("nama")} />
            {err("nama")}
          </div>
          <div className="field">
            <label htmlFor="hp">Nomor WhatsApp</label>
            <input
              id="hp"
              name="hp"
              inputMode="tel"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              required
              {...aria("hp")}
            />
            {err("hp")}
          </div>
          <div className="field">
            <label htmlFor="alamat">Alamat lengkap</label>
            <textarea
              id="alamat"
              name="alamat"
              rows={3}
              autoComplete="street-address"
              required
              {...aria("alamat")}
            />
            {err("alamat")}
          </div>
          <div className="field">
            <label htmlFor="kota">Kota atau kabupaten</label>
            <input id="kota" name="kota" autoComplete="address-level2" required {...aria("kota")} />
            {err("kota")}
          </div>
          <div className="field">
            <label htmlFor="kurir">Kurir</label>
            <select id="kurir" name="kurir" defaultValue={COURIERS[0]}>
              {COURIERS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="catatan">Catatan (opsional)</label>
            <textarea
              id="catatan"
              name="catatan"
              rows={2}
              placeholder="Misalnya: pilih batu yang tinggi"
              {...aria("catatan")}
            />
            {err("catatan")}
          </div>

          <dl className="sum">
            <div>
              <dt>Subtotal</dt>
              <dd>{rupiah(subtotal)}</dd>
            </div>
            <div>
              <dt>Ongkos kirim</dt>
              <dd>Dihitung admin</dd>
            </div>
          </dl>
          <button className="btn btn--lg btn--block" type="submit">
            Kirim pesanan lewat WhatsApp
          </button>
          <p className="fine">
            Pembayaran lewat transfer bank setelah admin mengonfirmasi total dan stok. Anda tidak dikenai biaya apa
            pun di halaman ini.
          </p>
        </form>
      </div>
    </>
  );
}
