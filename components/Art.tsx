import { plate, styleScene, type StyleKind } from "@/lib/art";
import type { Product } from "@/lib/data";

/* Ilustrasi SVG dibuat deterministik dari data, jadi aman dirender di server maupun klien. */
export function Plate({ p }: { p: Product }) {
  return <span className="art" dangerouslySetInnerHTML={{ __html: plate(p) }} />;
}

export function Scene({ kind }: { kind: StyleKind }) {
  return <span className="art" dangerouslySetInnerHTML={{ __html: styleScene(kind) }} />;
}
