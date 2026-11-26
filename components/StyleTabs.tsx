"use client";

import Link from "next/link";
import { useState } from "react";
import { BUNDLES, STYLES, byId, rupiah } from "@/lib/data";
import { Plate, Scene } from "./Art";
import { AddButton, BundleButton } from "./CartButtons";

export function StyleTabs() {
  const [i, setI] = useState(0);
  const s = STYLES[i];
  const b = s.bundle ? BUNDLES.find((x) => x.id === s.bundle) : undefined;

  return (
    <div className="styles">
      <div className="styles__tabs" role="tablist" aria-label="Gaya aquascape">
        {STYLES.map((x, idx) => (
          <button
            key={x.id}
            role="tab"
            type="button"
            id={`tab-${x.id}`}
            aria-controls="stylePanel"
            className={idx === i ? "is-on" : ""}
            aria-selected={idx === i}
            onClick={() => setI(idx)}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="styles__panel" id="stylePanel" role="tabpanel" aria-labelledby={`tab-${s.id}`} key={s.id}>
        <div className="style__scene" data-s={s.id}>
          <Scene kind={s.id} />
        </div>
        <div className="style__info">
          <p className="style__lead">{s.lead}</p>
          <dl className="style__needs">
            {s.needs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="style__items">
            {s.items.map((id) => {
              const p = byId(id)!;
              return (
                <li key={id} data-cat={p.cat}>
                  <Link className="style__thumb" href={`/produk/${p.id}`} aria-hidden="true" tabIndex={-1}>
                    <Plate p={p} sizes="80px" />
                  </Link>
                  <Link className="style__name" href={`/produk/${p.id}`}>
                    {p.name}
                  </Link>
                  <span className="style__price">{rupiah(p.price)}</span>
                  <AddButton id={p.id} className="btn btn--small">
                    Tambah
                  </AddButton>
                </li>
              );
            })}
          </ul>
          {b && (
            <p className="style__bundle">
              Atau ambil semuanya dalam <b>{b.name}</b>.{" "}
              <BundleButton id={b.id} className="link link--btn link--inline">
                Masukkan paket ke keranjang
              </BundleButton>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
