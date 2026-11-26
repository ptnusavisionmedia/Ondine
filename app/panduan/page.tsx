import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/Art";
import { Crumbs } from "@/components/ProductBits";
import { GUIDES, byId } from "@/lib/data";

export const metadata: Metadata = {
  title: "Panduan",
  description: "Panduan aquascape dari tangki pertama sampai perawatan bulanan.",
  alternates: { canonical: "/panduan" },
};

export default function Page() {
  return (
    <section className="page wrap">
      <header className="page__head">
        <Crumbs items={[{ href: "/", label: "Beranda" }, { label: "Panduan" }]} />
        <h1 className="page__title">Panduan</h1>
        <p className="page__lead">
          Dari tangki pertama sampai perawatan bulanan. Ditulis oleh orang yang merangkai tangki setiap hari.
        </p>
      </header>
      <ul className="guide-list guide-list--full">
        {GUIDES.map((g) => {
          const p = byId(g.art)!;
          return (
            <li key={g.id}>
              <Link href={`/panduan/${g.id}`}>
                <span className="guide__art guide__art--sm" data-cat={p.cat}>
                  <Plate p={p} sizes="(max-width: 700px) 30vw, 240px" />
                </span>
                <span>
                  <h2>{g.title}</h2>
                  <p>{g.summary}</p>
                  <span className="guide__min">{g.minutes} menit baca</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
