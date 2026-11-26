import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plate } from "@/components/Art";
import { JsonLd } from "@/components/JsonLd";
import { Crumbs } from "@/components/ProductBits";
import { GUIDES, STORE, byId } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.id === slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.summary,
    alternates: { canonical: `/panduan/${g.id}` },
    openGraph: { type: "article", title: g.title, description: g.summary },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.id === slug);
  if (!g) notFound();
  const next = GUIDES[(GUIDES.indexOf(g) + 1) % GUIDES.length];
  const art = byId(g.art)!;

  return (
    <article className="page wrap article">
      <Crumbs items={[{ href: "/", label: "Beranda" }, { href: "/panduan", label: "Panduan" }, { label: g.title }]} />
      <div className="article__head">
        <div>
          <h1 className="page__title">{g.title}</h1>
          <p className="page__lead">
            {g.summary} <span className="mins">{g.minutes} menit baca</span>
          </p>
        </div>
        <div className="article__art" data-cat={art.cat} aria-hidden="true">
          <Plate p={art} sizes="40vw" />
        </div>
      </div>
      <div className="prose prose--serif">
        {g.body.map((b, i) => (
          <div key={i}>
            {b.h && <h2>{b.h}</h2>}
            <p>{b.p}</p>
          </div>
        ))}
      </div>
      <aside className="next">
        <p>Berikutnya</p>
        <Link href={`/panduan/${next.id}`}>{next.title}</Link>
      </aside>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.summary,
          inLanguage: "id",
          url: `${SITE_URL}/panduan/${g.id}`,
          publisher: { "@type": "Organization", name: STORE.name },
        }}
      />
    </article>
  );
}
