import type { StyleKind } from "./art";
import manifest from "./images.json";

/* lib/images.json dibuat oleh `npm run images:sync` dari isi public/assets/ondine/.
   ID yang tidak tercantum tidak punya gambar dan tetap memakai ilustrasi SVG. */
export interface ImageAsset {
  src: string;
  width: number;
  height: number;
}

const products: Record<string, ImageAsset | undefined> = manifest.products;
const styles: Record<string, ImageAsset | undefined> = manifest.styles;

export const productImage = (id: string) => products[id];
export const styleImage = (kind: StyleKind) => styles[kind];
