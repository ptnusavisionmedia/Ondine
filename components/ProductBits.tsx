import Link from "next/link";
import { care, catName, code, rupiah, type Product } from "@/lib/data";
import { CO2, LIGHT } from "@/lib/product-ui";
import { Plate } from "./Art";
import { AddButton } from "./CartButtons";

export function Status({ p }: { p: Product }) {
  if (p.stock <= 0) return <span className="status" data-s="out">Habis</span>;
  if (p.stock < 10) return <span className="status" data-s="low">Sisa {p.stock}</span>;
  return <span className="status" data-s="ok">Tersedia</span>;
}

const Dots = ({ n, max }: { n: number; max: number }) => (
  <>
    {Array.from({ length: max }, (_, i) => (
      <i key={i} className={i < n ? "on" : ""} />
    ))}
  </>
);

export function Meters({ p, large = false }: { p: Product; large?: boolean }) {
  const c = care(p);
  if (!c) return null;
  return (
    <div className={`meters ${large ? "meters--lg" : ""}`}>
      <span className="meter" role="img" aria-label={`Kebutuhan cahaya: ${LIGHT[c.light]}`}>
        <em>Cahaya</em>
        <b>
          <Dots n={c.light} max={3} />
        </b>
        {large && <small>{LIGHT[c.light]}</small>}
      </span>
      <span className="meter" role="img" aria-label={`CO2: ${CO2[c.co2]}`}>
        <em>CO2</em>
        <b>
          <Dots n={c.co2 + 1} max={3} />
        </b>
        {large && <small>{CO2[c.co2]}</small>}
      </span>
    </div>
  );
}

export function PlateCard({ p }: { p: Product }) {
  return (
    <article className="plate" data-cat={p.cat}>
      <Link className="plate__art" href={`/produk/${p.id}`} aria-label={p.name}>
        <Plate p={p} />
        <span className="plate__no">{code(p)}</span>
        {p.tag && <span className="plate__tag">{p.tag}</span>}
      </Link>
      <div className="plate__meta">
        <h3 className="plate__name">
          <Link href={`/produk/${p.id}`}>{p.name}</Link>
        </h3>
        {p.latin ? <p className="latin">{p.latin}</p> : <p className="latin latin--blank">{catName(p.cat)}</p>}
        <Meters p={p} />
        <div className="plate__row">
          <p className="price">
            {rupiah(p.price)}
            <small>{p.unit}</small>
          </p>
        </div>
        <div className="plate__row">
          <Status p={p} />
          <AddButton id={p.id} className="btn btn--small" disabled={p.stock <= 0}>
            Tambah
          </AddButton>
        </div>
      </div>
    </article>
  );
}

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Jalur">
      {items.map((it) =>
        it.href ? (
          <Link key={it.label} href={it.href}>
            {it.label}
          </Link>
        ) : (
          <span key={it.label}>{it.label}</span>
        ),
      )}
    </nav>
  );
}
