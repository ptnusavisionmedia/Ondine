import type { MetadataRoute } from "next";
import { CATEGORIES, GUIDES, PRODUCTS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/toko",
    "/panduan",
    "/toko-kami",
    ...CATEGORIES.map((c) => `/toko/${c.id}`),
    ...PRODUCTS.map((p) => `/produk/${p.id}`),
    ...GUIDES.map((g) => `/panduan/${g.id}`),
  ];
  return paths.map((p) => ({ url: `${SITE_URL}${p}` }));
}
