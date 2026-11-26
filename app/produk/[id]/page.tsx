import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plate } from "@/components/Art";
import { JsonLd } from "@/components/JsonLd";
import { Crumbs, Meters, PlateCard, Status } from "@/components/ProductBits";
import { ProductBuy } from "@/components/ProductBuy";
import { PRODUCTS, STORE, byId, catName, code, rupiah } from "@/lib/data";
import { waLink } from "@/lib/order";
import { SHIP_NOTE } from "@/lib/product-ui";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = byId((await params).id);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.desc} ${rupiah(p.price)} ${p.unit}.`,
    alternates: { canonical: `/produk/${p.id}` },
    openGraph: { title: `${p.name} | ${STORE.name}`, description: p.desc, type: "website" },
  };
}

export default async function Page({ params }: Props) {
  const p = byId((await params).id);
  if (!p) notFound();
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: code(p),
    description: p.desc,
    category: catName(p.cat),
    url: `${SITE_URL}/produk/${p.id}`,
    brand: { "@type": "Brand", name: STORE.name },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "IDR",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: STORE.name },
    },
  };

  return (
    <section className="page wrap">
      <Crumbs
        items={[
          { href: "/", label: "Beranda" },
          { href: "/toko", label: "Toko" },
          { href: `/toko/${p.cat}`, label: catName(p.cat) },
          { label: p.name },
        ]}
      />
      <div className="pdp">
        <div className="pdp__art" data-cat={p.cat}>
          <Plate p={p} />
          <span className="plate__no">{code(p)}</span>
          {p.tag && <span className="plate__tag">{p.tag}</span>}
        </div>
        <div className="pdp__info">
          <h1 className="pdp__title">{p.name}</h1>
          {p.latin && <p className="latin latin--lg">{p.latin}</p>}
          <p className="pdp__price">
            {rupiah(p.price)}
            <small>{p.unit}</small>
          </p>
          <p className="pdp__desc">{p.desc}</p>
          <Meters p={p} large />

          <ProductBuy id={p.id}>
            <Status p={p} />
          </ProductBuy>

          <dl className="specs">
            {p.specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="note">
            <h2>Pengiriman</h2>
            <p>{SHIP_NOTE[p.cat]}</p>
            <a
              className="link"
              href={waLink(`Halo, saya mau tanya soal ${p.name} (${code(p)}).`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tanya admin lewat WhatsApp
            </a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2 className="sec-title sec-title--sm">Dari rak yang sama</h2>
          <div className="grid">
            {related.map((r) => (
              <PlateCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
      <JsonLd data={productLd} />
    </section>
  );
}
