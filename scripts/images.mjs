// Aset gambar produk dan gaya aquascape Ondine.
//
//   node scripts/images.mjs import <folder-sumber>   salin gambar sumber sesuai tabel, lalu sinkronkan
//   node scripts/images.mjs sync                     tulis ulang lib/images.json dari isi public/assets/ondine
//
// Gambar hanya dipasang bila namanya persis sama dengan ID produk/gaya. ID tanpa gambar tetap
// memakai ilustrasi SVG. Pemetaan nama sumber berasal dari PROMPT_CLAUDE_ASET_ONDINE.md.
import { copyFileSync, existsSync, mkdirSync, openSync, readSync, closeSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const BASE = join(ROOT, "public", "assets", "ondine");
const OUT = join(ROOT, "lib", "images.json");
const EXTS = [".webp", ".png", ".jpg", ".jpeg", ".avif"];

const PRODUCTS = {
  "rotala-rotundifolia-hra": "Rotala H'ra aquarium plant bundle.png",
  "ludwigia-super-red": "Ludwigia Super Red Five-Stem Plant.png",
  "hygrophila-pinnatifida": "Hygrophila pinnatifida with Lobed Reddish Leaves.png",
  "anubias-nana": "Anubias Nana with Exposed Rhizome.png",
  "java-fern-narrow": "Narrow Java Fern Aquarium Plant.png",
  "cryptocoryne-wendtii": "Green Cryptocoryne wendtii rosette.png",
  "echinodorus-ozelot": "Echinodorus Ozelot spotted leaf rosette.png",
  "bucephalandra-kedagang": "Bucephalandra Kedagang, wavy-leaf aquatic plant.png",
  "monte-carlo": "Micranthemum Monte Carlo Carpet Plant.png",
  "hairgrass-eleocharis": "Dwarf hairgrass tuft.png",
  "java-moss": "Tangled Java moss specimen.png",
  "riccia-fluitans": "Bright green Riccia fluitans cushion.png",
  "batu-seiryu": "Jagged blue-grey Seiryu aquascaping rock.png",
  "dragon-stone": "Rugged Ohko Dragon Aquascape Stone.png",
  "batu-frodo": "Weathered dark grey aquascape rock.png",
  spiderwood: "Branching spiderwood aquarium driftwood.png",
  "akar-bakau": "Twisted mangrove root driftwood.png",
  "aquasoil-hitam": "Porous black aquasoil granules.png",
  "pasir-silika-putih": "Pale silica aquarium sand pile.png",
  "pasir-vulkanik-hitam": "Fine black volcanic aquarium sand.png",
  "laterit-dasar": "Natural laterite substrate granules.png",
  "neon-tetra": "Naturalistic Neon Tetra Profile.png",
  "ember-tetra": "Ember Tetra on Warm Ivory.png",
  "harlequin-rasbora": "Copper harlequin rasbora side profile.png",
  otocinclus: "Otocinclus catfish side profile.png",
  "corydoras-panda": "Panda corydoras studio portrait.png",
  "red-cherry-shrimp": "Red Cherry Shrimp Studio Portrait.png",
  "crystal-red-shrimp": "Crystal Red Bee Shrimp.png",
  "akuarium-60": "Rimless glass aquarium on black foam.png",
  "akuarium-90": "Rimless glass aquarium on ivory backdrop.png",
  "led-60": "Slim 60 cm aquarium LED bar.png",
  "led-90": "90 cm aquarium LED light bar.png",
  "set-co2": "Aquarium CO2 system with gauges.png",
  "filter-canister": "Realistic aquarium canister filter.png",
  "heater-100": "Glass submersible aquarium heater.png",
  "pupuk-makro": "Minimalist aquarium fertilizer bottle(1).png",
  "pupuk-mikro": "Minimalist aquarium fertilizer bottle.png",
  "gunting-lurus": "Straight stainless steel aquascaping scissors.png",
  "pinset-lurus": "Straight stainless steel aquascaping tweezers.png",
};

const STYLES = {
  iwagumi: "Serene Iwagumi Stone Aquascape.png",
  nature: "Natural driftwood freshwater aquascape.png",
  jungle: "Freshwater Jungle Aquascape with Driftwood.png",
};

/** Baca lebar dan tinggi dari header PNG, JPEG, atau WebP tanpa dependensi tambahan. */
function dimensions(file) {
  const fd = openSync(file, "r");
  const buf = Buffer.alloc(64 * 1024);
  const n = readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);
  const b = buf.subarray(0, n);
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  return null;
}

function importFrom(src) {
  const dir = resolve(src);
  if (!existsSync(dir)) throw new Error(`Folder sumber tidak ditemukan: ${dir}`);
  for (const [group, table] of [["products", PRODUCTS], ["styles", STYLES]]) {
    mkdirSync(join(BASE, group), { recursive: true });
    for (const [id, name] of Object.entries(table)) {
      const from = join(dir, name);
      if (!existsSync(from)) continue;
      copyFileSync(from, join(BASE, group, id + extname(name).toLowerCase()));
      console.log(`salin  ${name}  ->  ${group}/${id}${extname(name).toLowerCase()}`);
    }
  }
}

function sync() {
  const manifest = { products: {}, styles: {} };
  const missing = { products: [], styles: [] };
  for (const [group, table] of [["products", PRODUCTS], ["styles", STYLES]]) {
    const dir = join(BASE, group);
    const files = existsSync(dir) ? readdirSync(dir) : [];
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      const id = file.slice(0, -ext.length);
      if (!EXTS.includes(ext) || !(id in table)) console.warn(`lewati  ${group}/${file} (nama bukan ID yang dikenal)`);
    }
    for (const id of Object.keys(table)) {
      const file = EXTS.map((ext) => id + ext).find((f) => files.includes(f));
      if (!file) {
        missing[group].push(id);
        continue;
      }
      const size = dimensions(join(dir, file));
      if (!size) {
        console.warn(`lewati  ${group}/${file} (berkas gambar tidak valid)`);
        missing[group].push(id);
        continue;
      }
      manifest[group][id] = { src: `/assets/ondine/${group}/${file}`, ...size };
    }
  }
  writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
  const count = (g) => Object.keys(manifest[g]).length;
  console.log(`gambar terpasang: ${count("products")}/${Object.keys(PRODUCTS).length} produk, ${count("styles")}/3 gaya`);
  if (missing.products.length) console.log(`produk tanpa gambar (pakai SVG): ${missing.products.join(", ")}`);
  if (missing.styles.length) console.log(`gaya tanpa gambar (pakai SVG): ${missing.styles.join(", ")}`);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "import") {
  if (!arg) throw new Error("Pakai: node scripts/images.mjs import <folder-sumber>");
  importFrom(arg);
  sync();
} else if (cmd === "sync") sync();
else console.log("Pakai: node scripts/images.mjs import <folder-sumber> | sync");
