import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/ShopPage";
import { CATEGORIES } from "@/lib/data";

type Props = { params: Promise<{ kategori: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ kategori: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori } = await params;
  const c = CATEGORIES.find((x) => x.id === kategori);
  if (!c) return {};
  return { title: c.name, description: c.blurb, alternates: { canonical: `/toko/${c.id}` } };
}

export default async function Page({ params }: Props) {
  const { kategori } = await params;
  const c = CATEGORIES.find((x) => x.id === kategori);
  if (!c) notFound();
  return <ShopPage cat={c.id} />;
}
