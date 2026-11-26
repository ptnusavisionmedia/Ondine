import Image from "next/image";
import { plate, styleScene, type StyleKind } from "@/lib/art";
import type { Product } from "@/lib/data";
import { productImage, styleImage } from "@/lib/images";

const STYLE_NAME: Record<StyleKind, string> = { iwagumi: "Iwagumi", nature: "Nature style", jungle: "Jungle" };

/* Grid memakai satu kolom jika lebar konten belum cukup untuk dua kartu. */
const CARD_SIZES = "(max-width: 550px) 100vw, (max-width: 840px) 50vw, (max-width: 1100px) 40vw, 320px";

/* priority: hanya untuk gambar utama (LCP) di halaman detail produk.
   Gambar ilustrasi bila tersedia di lib/images.json; selain itu ilustrasi SVG yang dibuat dari data. */
export function Plate({ p, sizes = CARD_SIZES, priority = false }: { p: Product; sizes?: string; priority?: boolean }) {
  const img = productImage(p.id);
  if (img) {
    return (
      <Image
        className="art-img art-img--product"
        src={img.src}
        width={img.width}
        height={img.height}
        alt={`Ilustrasi ${p.name}`}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }
  return <span className="art" dangerouslySetInnerHTML={{ __html: plate(p) }} />;
}

export function Scene({
  kind,
  sizes = "(max-width: 860px) 100vw, 60vw",
  priority = false,
}: {
  kind: StyleKind;
  sizes?: string;
  priority?: boolean;
}) {
  const img = styleImage(kind);
  if (img) {
    return (
      <Image
        className="art-img art-img--scene"
        src={img.src}
        width={img.width}
        height={img.height}
        alt={`Contoh tata letak aquascape gaya ${STYLE_NAME[kind]}`}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }
  return <span className="art" dangerouslySetInnerHTML={{ __html: styleScene(kind) }} />;
}
