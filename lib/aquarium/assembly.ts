export const WATER_START = 0.008;

// The first button returns to the dry tank. Later buttons show the completed layer.
export const STAGES = [
  { at: 0, end: 0.135, key: "air", label: "Akuarium", href: "/toko/akuarium" },
  { at: 0.14, end: 0.29, key: "substrat", label: "Substrat", href: "/toko/substrat" },
  { at: 0.3, end: 0.46, key: "batu", label: "Batu", href: "/toko/hardscape" },
  { at: 0.465, end: 0.59, key: "kayu", label: "Kayu", href: "/toko/hardscape" },
  { at: 0.595, end: 0.81, key: "tanaman", label: "Tanaman", href: "/toko/tanaman" },
  { at: 0.815, end: 0.96, key: "ikan", label: "Ikan", href: "/toko/fauna" },
].map((stage, i) => ({ ...stage, viewAt: i === 0 ? 0 : stage.end }));

/** Water, sand, stone, wood, plants, fish, in construction order. */
export function assemblyAt(progress: number) {
  return STAGES.map((stage, i) => {
    const start = i === 0 ? WATER_START : stage.at;
    const t = Math.max(0, Math.min(1, (progress - start) / (stage.end - start)));
    return t * t * (3 - 2 * t);
  });
}
