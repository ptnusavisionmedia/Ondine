/* Ilustrasi produk: SVG prosedural dalam satu bahasa gambar (lembar spesimen).
   Deterministik: id produk yang sama selalu menghasilkan gambar yang sama. */
import type { Product } from "./data";

function rng(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => +n.toFixed(1);

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c((n >> 16) & 255), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/* daun: pangkal di (0,0), mengarah ke atas, dirotasi */
function leaf(x: number, y: number, len: number, w: number, ang: number, fill: string, vein = true) {
  const d = `M0 0C${f(w)} ${f(-len * 0.25)} ${f(w)} ${f(-len * 0.7)} 0 ${f(-len)}C${f(-w)} ${f(-len * 0.7)} ${f(-w)} ${f(-len * 0.25)} 0 0Z`;
  const half = `M0 0C${f(w)} ${f(-len * 0.25)} ${f(w)} ${f(-len * 0.7)} 0 ${f(-len)}Z`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="${d}" fill="${fill}"/><path d="${half}" fill="#000" opacity=".11"/>${
    vein ?`<path d="M0 -2L0 ${f(-len * 0.9)}" stroke="${shade(fill, -0.12)}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".7"/>` : ""
  }</g>`;
}

const GROUND = 352;

let NO_GROUND = false;
function ground(color = "#b8b49f") {
  if (NO_GROUND) return "";
  return`<ellipse cx="200" cy="${GROUND + 6}" rx="150" ry="9" fill="${color}" opacity=".35"/>`;
}

/* ---------- Tanaman ---------- */
function stem(r: () => number, a: any) {
  const [c1, c2, c3] = a.hue as string[];
  let s = ground();
  const n = 5;
  for (let i = 0; i < n; i++) {
    const x = 90 + i * 55 + r() * 14;
    const h = 150 + r() * 110;
    const lean = (r() - 0.5) * 24;
    s += `<path d="M${f(x)} ${GROUND}Q${f(x + lean * 0.5)} ${f(GROUND - h / 2)} ${f(x + lean)} ${f(GROUND - h)}" stroke="${shade(c1, -0.08)}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    for (let y = 0; y < h - 12; y += 17) {
      const t = y / h;
      const px = x + lean * t * t * 1.4;
      const py = GROUND - y;
      const col = t > 0.55 ? c3 : t > 0.25 ? c2 : c1;
      const L = (a.leaf === "round" ? 28 : 36) * (1 - t * 0.35);
      const W = a.leaf === "round" ? 11 : 6;
      s += leaf(px, py, L, W, -64 - r() * 8, col, false) + leaf(px, py, L, W, 64 + r() * 8, col, false);
    }
    s += leaf(x + lean, GROUND - h, 30, a.leaf === "round" ? 11 : 6, (r() - 0.5) * 16, c3, false);
  }
  return s;
}

function rosette(r: () => number, a: any) {
  const [c1, c2] = a.hue as string[];
  const n = (a.n as number) ?? 8;
  const small = a.small ? 0.55 : 1;
  let s = ground();
  const kind = a.leaf as string;
  const len = (kind === "sword" ? 250 : kind === "broad" ? 140 : kind === "round" ? 120 : 175) * small;
  const w = (kind === "sword" ? 30 : kind === "broad" ? 46 : kind === "round" ? 30 : kind === "lobed" ? 28 : 20) * small;
  const order = Array.from({ length: n }, (_, i) => i).sort((p, q) => Math.abs(q - n / 2) - Math.abs(p - n / 2));
  for (const i of order) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const ang = t * 120 + (r() - 0.5) * 10;
    const col = i % 2 ? c1 : c2;
    const L = len * (0.7 + 0.3 * (1 - Math.abs(t) * 1.4)) * (0.9 + r() * 0.2);
    s += leaf(200 + t * 24, GROUND - 4, L, w, ang, col);
    if (kind === "wavy" || kind === "lobed") {
      // pinggiran bergelombang
      s += `<path d="M${f(200 + t * 24)} ${GROUND - 4}" />`;
    }
  }
  if (a.leaf === "broad" || a.leaf === "round")
    s += `<path d="M120 ${GROUND + 2}Q200 ${GROUND - 12} 280 ${GROUND + 2}" stroke="#6a4a30" stroke-width="9" stroke-linecap="round" fill="none"/>`;
  return s;
}

function carpet(r: () => number, a: any) {
  const [c1, c2] = a.hue as string[];
  let s = `<path d="M40 ${GROUND + 4}Q200 ${GROUND - 40} 360 ${GROUND + 4}Z" fill="#6c5a44" opacity=".85"/>`;
  const tall = !!a.tall;
  for (let i = 0; i < 90; i++) {
    const x = 50 + r() * 300;
    const edge = 1 - Math.abs(x - 200) / 160;
    const base = GROUND - Math.max(0, edge) * 22 * 0.6 + 4;
    const hh = (tall ? 70 : 34) * (0.4 + r() * 0.8) * (0.6 + edge * 0.5);
    const col = r() > 0.5 ? c1 : c2;
    if (tall) {
      const lean = (r() - 0.5) * 30;
      s += `<path d="M${f(x)} ${f(base)}Q${f(x + lean * 0.3)} ${f(base - hh * 0.6)} ${f(x + lean)} ${f(base - hh)}" stroke="${col}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    } else {
      s += `<path d="M${f(x)} ${f(base)}L${f(x)} ${f(base - hh * 0.7)}" stroke="${shade(c1, -0.1)}" stroke-width="1.5"/><circle cx="${f(x)}" cy="${f(base - hh * 0.75)}" r="${f(4 + r() * 4)}" fill="${col}"/>`;
    }
  }
  return s;
}

function moss(r: () => number, a: any) {
  const cols = a.hue as string[];
  let s = ground();
  s += `<path d="M110 ${GROUND}Q130 270 200 262Q270 270 290 ${GROUND}Z" fill="#5a5c5c"/>`;
  for (let i = 0; i < 70; i++) {
    const ang = r() * Math.PI;
    const rad = 60 + r() * 90;
    const x = 200 + Math.cos(ang) * rad * 0.95;
    const y = GROUND - 10 - Math.sin(ang) * rad * 0.85;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(12 + r() * 20)}" fill="${cols[Math.floor(r() * cols.length)]}"/>`;
  }
  for (let i = 0; i < 160; i++) {
    const ang = r() * Math.PI, rad = r() * 150;
    s += `<circle cx="${f(200 + Math.cos(ang) * rad)}" cy="${f(GROUND - 10 - Math.sin(ang) * rad * 0.85)}" r="1.6" fill="${shade(cols[2], 0.18)}" opacity=".7"/>`;
  }
  return s;
}

function fern(r: () => number, a: any) {
  const [c1, c2] = a.hue as string[];
  let s = ground() + `<path d="M150 ${GROUND}Q200 ${GROUND - 14} 250 ${GROUND}" stroke="#6a4a30" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  const n = 11;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) - 0.5;
    s += leaf(200 + t * 70, GROUND - 6, 220 - Math.abs(t) * 80, 16, t * 105 + (r() - 0.5) * 8, i % 2 ? c1 : c2);
  }
  return s;
}

/* ---------- Hardscape ---------- */
function rockShape(cx: number, cy: number, rw: number, rh: number, tone: string, r: () => number, opt: any) {
  const n = 9;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 0.78 + r() * 0.34;
    pts.push([cx + Math.cos(a) * rw * j, cy + Math.sin(a) * rh * j * (Math.sin(a) > 0 ? 0.6 : 1)]);
  }
  const light: [number, number] = [cx - rw * 0.15, cy - rh * 0.3];
  let s = `<polygon points="${pts.map((p) => p.map(f).join(",")).join(" ")}" fill="${tone}"/>`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy;
    const lit = (-mx * 0.7 - my * 1.0) / Math.hypot(mx, my);
    s += `<polygon points="${f(p[0])},${f(p[1])} ${f(q[0])},${f(q[1])} ${f(light[0])},${f(light[1])}" fill="${shade(tone, lit * 0.12 + (r() - 0.5) * 0.04)}"/>`;
  }
  if (opt.vein) for (let i = 0; i < 3; i++) {
    const y0 = cy - rh * 0.5 + r() * rh;
    s += `<path d="M${f(cx - rw * 0.7)} ${f(y0)}Q${f(cx)} ${f(y0 + (r() - 0.5) * 50)} ${f(cx + rw * 0.7)} ${f(y0 + (r() - 0.5) * 30)}" stroke="#e8ecee" stroke-width="2" fill="none" opacity=".7"/>`;
  }
  if (opt.pits) for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2, d = r() * 0.6;
    s += `<ellipse cx="${f(cx + Math.cos(a) * rw * d)}" cy="${f(cy + Math.sin(a) * rh * d)}" rx="${f(4 + r() * 8)}" ry="${f(3 + r() * 5)}" fill="${shade(tone, -0.2)}"/>`;
  }
  return s;
}
function rock(r: () => number, a: any) {
  const tone = a.tone as string;
  return ground() + rockShape(130, 305, 80, 62, shade(tone, -0.04), r, a) + rockShape(270, 315, 70, 48, shade(tone, 0.03), r, a) + rockShape(205, 262, 90, 78, tone, r, a);
}

function wood(r: () => number, a: any) {
  const tone = a.tone as string;
  let s = ground("#8a7a60");
  const trunk = `M120 ${GROUND}C130 300 180 280 205 220C225 170 190 120 160 80`;
  s += `<path d="${trunk}" stroke="${shade(tone, -0.06)}" stroke-width="26" fill="none" stroke-linecap="round"/>`;
  s += `<path d="${trunk}" stroke="${tone}" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  const n = (a.branches as number) ?? 5;
  for (let i = 0; i < n; i++) {
    const t = 0.2 + (i / n) * 0.7;
    const bx = 120 + (205 - 120) * t + (r() - 0.5) * 30;
    const by = GROUND - 250 * t;
    const dir = i % 2 ? 1 : -1;
    const len = 60 + r() * 80;
    const ex = bx + dir * len, ey = by - 20 - r() * 60;
    s += `<path d="M${f(bx)} ${f(by)}Q${f(bx + dir * len * 0.4)} ${f(by - 10)} ${f(ex)} ${f(ey)}" stroke="${tone}" stroke-width="${f(11 - i)}" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${f(ex)} ${f(ey)}l${f(dir * 22)} ${f(-26)}M${f(ex)} ${f(ey)}l${f(dir * 8)} ${f(-34)}" stroke="${tone}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
  }
  s += `<path d="M118 ${GROUND}C135 305 185 284 208 224" stroke="${shade(tone, 0.12)}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  return s;
}

function soil(r: () => number, a: any) {
  const tone = a.tone as string;
  let s = ground();
  s += `<path d="M60 ${GROUND}Q200 150 340 ${GROUND}Z" fill="${shade(tone, -0.05)}"/>`;
  for (let i = 0; i < 320; i++) {
    const x = 70 + r() * 260;
    const maxH = (1 - Math.pow((x - 200) / 140, 2)) * 195;
    const y = GROUND - r() * Math.max(2, maxH);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 3.5)}" fill="${shade(tone, (r() - 0.5) * 0.18)}"/>`;
  }
  return s;
}

/* ---------- Fauna ---------- */
function fishBody(cx: number, cy: number, sc: number, a: any, flip: number) {
  const style = a.style as string;
  const body = a.body as string, stripe = a.stripe as string, belly = a.belly as string;
  const len = style === "oto" ? 150 : style === "cory" ? 120 : 140;
  const hgt = style === "round" ? 56 : style === "cory" ? 62 : style === "oto" ? 28 : 38;
  const tail = style === "cory" ? 28 : 40;
  let s = `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(sc * flip)} ${f(sc)})">`;
  s += `<path d="M${-len / 2} 0L${-len / 2 - tail} ${-hgt * 0.65}Q${-len / 2 - tail * 0.5} 0 ${-len / 2 - tail} ${hgt * 0.65}Z" fill="${shade(body, -0.08)}"/>`;
  s += `<path d="M${-len / 2} 0C${-len / 3} ${-hgt} ${len / 4} ${-hgt * 0.9} ${len / 2} -4C${len / 2 + 4} 0 ${len / 2 + 4} 4 ${len / 2} 6C${len / 4} ${hgt * 0.9} ${-len / 3} ${hgt} ${-len / 2} 0Z" fill="${body}"/>`;
  s += `<path d="M${-len / 3} ${hgt * 0.35}C0 ${hgt * 0.95} ${len / 4} ${hgt * 0.7} ${len / 2 - 4} 4C${len / 4} ${hgt * 0.15} 0 ${hgt * 0.2} ${-len / 3} ${hgt * 0.35}Z" fill="${belly}"/>`;
  if (style === "tetra") {
    s += `<path d="M${-len / 2 + 6} -4L${len / 2 - 6} -2" stroke="${stripe}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<path d="M${-len / 8} 9C${len / 6} 12 ${len / 3} 8 ${len / 2 - 14} 5L${-len / 2 + 22} 8Z" fill="${belly}"/>`;
  }
  if (style === "round") s += `<path d="M${-len / 8} ${-hgt * 0.35}L${len / 2 - 10} -2L${-len / 8} ${hgt * 0.55}Z" fill="${stripe}"/>`;
  if (style === "oto") s += `<path d="M${-len / 2 + 10} 0L${len / 2 - 14} 0" stroke="${stripe}" stroke-width="6" stroke-linecap="round"/>`;
  if (style === "cory") {
    s += `<circle cx="${len / 2 - 28}" cy="-8" r="10" fill="${stripe}"/><circle cx="${-len / 5}" cy="2" r="16" fill="${stripe}" opacity=".9"/>`;
  }
  s += `<path d="M${-len / 8} ${-hgt * 0.85}L${len / 10} ${-hgt * 1.2}L${len / 5} ${-hgt * 0.78}Z" fill="${shade(body, -0.14)}"/>`;
  s += `<circle cx="${len / 2 - 22}" cy="-6" r="5" fill="#fff"/><circle cx="${len / 2 - 21}" cy="-6" r="3" fill="#111"/>`;
  return s + "</g>";
}
function fish(r: () => number, a: any) {
  return (
    fishBody(170, 190, 1.3, a, 1) +
    fishBody(250, 260, 0.75, a, -1) +
    fishBody(120, 285, 0.55, a, 1)
  );
}

function shrimp(r: () => number, a: any) {
  const c = a.color as string;
  const P = [[96, 268], [150, 120], [318, 118], [304, 300]];
  const at = (t: number) => {
    const u = 1 - t;
    return [
      u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0],
      u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1],
    ];
  };
  const ang = (t: number) => {
    const [x1, y1] = at(Math.max(0, t - 0.01)), [x2, y2] = at(Math.min(1, t + 0.01));
    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  };
  let s = "";
  const N = 12;
  // kaki renang kecil di sisi bawah perut
  for (let i = 3; i < N - 2; i++) {
    const t = i / N, [x, y] = at(t), an = ang(t) + 90;
    const dx = Math.cos((an * Math.PI) / 180), dy = Math.sin((an * Math.PI) / 180);
    s += `<path d="M${f(x + dx * 14)} ${f(y + dy * 14)}l${f(dx * 16 - 4)} ${f(dy * 16 + 6)}" stroke="${shade(c, -0.12)}" stroke-width="3" stroke-linecap="round"/>`;
  }
  // antena dan rostrum
  s += `<path d="M122 236Q70 170 44 92M128 242Q64 200 30 170" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M104 232l-30 -14l32 6z" fill="${shade(c, -0.1)}"/>`;
  // kipas ekor
  const [tx, ty] = at(1), ta = ang(1);
  for (const d of [-26, 0, 26]) {
    s += `<g transform="translate(${f(tx)} ${f(ty)}) rotate(${f(ta + d)})"><path d="M0 0C10 -12 40 -12 44 0C40 12 10 12 0 0Z" fill="${shade(c, d === 0 ? -0.05 : -0.14)}"/></g>`;
  }
  // ruas badan, dari ekor ke kepala supaya kepala berada di atas
  for (let i = N; i >= 0; i--) {
    const t = i / N, [x, y] = at(t);
    const rr = 15 + (1 - t) * 24;
    const white = a.bands && i % 4 === 2;
    const fill = white ? "#f4efe4" : c;
    s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr * 1.05)}" ry="${f(rr * 0.82)}" fill="${fill}" transform="rotate(${f(ang(t))} ${f(x)} ${f(y)})"/>`;
    s += `<ellipse cx="${f(x - 2)}" cy="${f(y - rr * 0.35)}" rx="${f(rr * 0.5)}" ry="${f(rr * 0.2)}" fill="#fff" opacity=".22" transform="rotate(${f(ang(t))} ${f(x)} ${f(y)})"/>`;
  }
  const [hx, hy] = at(0.02);
  s += `<circle cx="${f(hx + 6)}" cy="${f(hy - 14)}" r="6" fill="#141414"/><circle cx="${f(hx + 8)}" cy="${f(hy - 16)}" r="1.8" fill="#fff"/>`;
  return s;
}

/* ---------- Peralatan ---------- */
function tank(r: () => number, a: any) {
  const w = (a.w as number) * 70, h = (a.h as number) * 70;
  const x = 200 - w / 2, y = 190 - h / 2 + 10;
  let s = `<rect x="${f(x - 6)}" y="${f(y + h)}" width="${f(w + 12)}" height="16" rx="3" fill="#2a2e2d"/>`;
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="#a9d4d6" opacity=".55"/>`;
  s += `<rect x="${f(x)}" y="${f(y + h * 0.18)}" width="${f(w)}" height="${f(h * 0.82)}" fill="#6fb5b6" opacity=".45"/>`;
  s += `<path d="M${f(x)} ${f(y + h)}L${f(x)} ${f(y + h - 22)}Q${f(x + w * 0.4)} ${f(y + h - 34)} ${f(x + w)} ${f(y + h - 16)}L${f(x + w)} ${f(y + h)}Z" fill="#3a332c"/>`;
  s += rockShape(x + w * 0.38, y + h - 30, 36, 24, "#7e8a92", r, { vein: true });
  for (let i = 0; i < 9; i++) {
    const px = x + 14 + r() * (w - 28);
    s += leaf(px, y + h - 18, 26 + r() * 40, 5, (r() - 0.5) * 26, "#4f8a3a", false);
  }
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="#eef4f2" stroke-width="3" opacity=".9"/>`;
  s += `<path d="M${f(x + 10)} ${f(y + 8)}l0 ${f(h * 0.6)}" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>`;
  return s;
}

function light(r: () => number, a: any) {
  const n = a.n as number;
  const w = 90 + n * 13;
  const x = 200 - w / 2;
  let s = `<path d="M${f(x + 6)} 130L${f(x - 40)} 340L${f(x + w + 40)} 340L${f(x + w - 6)} 130Z" fill="#fff6c8" opacity=".35"/>`;
  s += `<rect x="${f(x)}" y="108" width="${f(w)}" height="26" rx="6" fill="#d9dcd8"/>`;
  s += `<rect x="${f(x + 4)}" y="132" width="${f(w - 8)}" height="9" rx="3" fill="#3a3e3d"/>`;
  for (let i = 0; i < n; i++) s += `<circle cx="${f(x + 14 + i * ((w - 28) / (n - 1)))}" cy="136" r="3" fill="${i % 3 === 0 ? "#9fd3ff" : "#fff3b0"}"/>`;
  s += `<path d="M${f(x + 14)} 108L${f(x + 14)} 70M${f(x + w - 14)} 108L${f(x + w - 14)} 70" stroke="#9aa09c" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}

function co2() {
  let s = `<rect x="110" y="140" width="100" height="204" rx="22" fill="#2f5f5a"/><rect x="110" y="196" width="100" height="34" fill="#c9d63f"/>`;
  s += `<rect x="146" y="112" width="28" height="30" rx="4" fill="#9aa09c"/><rect x="128" y="86" width="72" height="30" rx="7" fill="#c8ccc8"/>`;
  s += `<circle cx="164" cy="101" r="9" fill="#2a2e2d"/><path d="M200 100Q250 100 252 150Q252 200 280 214" stroke="#2a2e2d" stroke-width="5" fill="none"/>`;
  s += `<rect x="262" y="200" width="42" height="64" rx="10" fill="#d9eef0" stroke="#2a2e2d" stroke-width="3"/>`;
  s += `<circle cx="283" cy="240" r="4" fill="#fff"/><circle cx="289" cy="226" r="3" fill="#fff"/><circle cx="279" cy="214" r="2.4" fill="#fff"/>`;
  s += `<circle cx="318" cy="150" r="14" fill="#c9d63f" stroke="#2a2e2d" stroke-width="3"/><path d="M318 164V190" stroke="#2a2e2d" stroke-width="3"/>`;
  return s;
}

function filter() {
  let s = `<rect x="130" y="130" width="140" height="210" rx="18" fill="#2f3534"/>`;
  s += `<rect x="124" y="150" width="152" height="10" rx="3" fill="#8e9894"/><rect x="124" y="310" width="152" height="10" rx="3" fill="#8e9894"/>`;
  s += `<rect x="150" y="96" width="100" height="44" rx="8" fill="#4a524f"/>`;
  s += `<path d="M164 96Q164 50 110 50M236 96Q236 50 290 50" stroke="#2a8a86" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="200" cy="230" r="26" fill="none" stroke="#c9d63f" stroke-width="5"/><path d="M200 214V230L212 238" stroke="#c9d63f" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  return s;
}

function heater() {
  let s = `<rect x="178" y="70" width="44" height="40" rx="8" fill="#2a2e2d"/><circle cx="200" cy="90" r="11" fill="#c9d63f"/>`;
  s += `<rect x="184" y="110" width="32" height="230" rx="16" fill="#cfe6e4" opacity=".85" stroke="#8fb4b0" stroke-width="3"/>`;
  s += `<path d="M192 130V320M208 130V320" stroke="#e46a3a" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="M178 60H222" stroke="#2a2e2d" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}

function fert(r: () => number, a: any) {
  const c = a.color as string;
  let s = `<rect x="168" y="70" width="64" height="26" rx="6" fill="#2a2e2d"/><rect x="180" y="96" width="40" height="22" fill="${shade(c, -0.15)}"/>`;
  s += `<rect x="130" y="116" width="140" height="224" rx="26" fill="${c}"/>`;
  s += `<rect x="130" y="180" width="140" height="100" fill="#f2f0e6"/><rect x="130" y="180" width="140" height="14" fill="#c9d63f"/>`;
  s += `<path d="M150 214H250M150 234H220M150 254H240" stroke="#1d2a28" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  s += `<path d="M148 130Q148 300 148 320" stroke="#fff" stroke-width="5" opacity=".25" stroke-linecap="round"/>`;
  return s;
}

function tool(r: () => number, a: any) {
  const metal = "#b8bfbd", dark = "#3a403f";
  if (a.type === "scissors") {
    return (
      `<g transform="rotate(-38 200 210)">` +
      `<path d="M196 70L204 70L216 250L184 250Z" fill="${metal}"/><path d="M204 70L216 250L204 250Z" fill="#9aa2a0"/>` +
      `<circle cx="200" cy="254" r="9" fill="${dark}"/>` +
      `<path d="M184 262Q150 310 170 350Q205 360 210 300" stroke="${dark}" stroke-width="9" fill="none" stroke-linecap="round"/>` +
      `<path d="M216 262Q250 310 230 350Q195 360 190 300" stroke="${dark}" stroke-width="9" fill="none" stroke-linecap="round"/></g>`
    );
  }
  return (
    `<g transform="rotate(-36 200 210)">` +
    `<path d="M192 60L198 60L216 340L204 340Z" fill="${metal}"/><path d="M208 60L202 60L184 340L196 340Z" fill="#9aa2a0"/>` +
    `<rect x="182" y="280" width="36" height="70" rx="8" fill="${dark}"/><path d="M200 60V90" stroke="${dark}" stroke-width="3"/></g>`
  );
}

const ART: Record<string, (r: () => number, a: any) => string> = {
  stem, rosette, carpet, moss, fern, rock, wood, soil, fish, shrimp, tank, light, co2, filter, tool, fert, heater,
};

export function plate(p: Product): string {
  const r = rng(p.id);
  const inner = ART[p.art.kind](r, p.art);
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi ${p.name}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

/* ---------- Adegan tata letak (untuk bagian "Pilih gaya") ---------- */
export type StyleKind = "iwagumi" | "nature" | "jungle";

export function styleScene(kind: StyleKind): string {
  NO_GROUND = true;
  let n = 0;
  const el = (name: string, a: any, x: number, y: number, s: number, sy = s) => {
    const g = ART[name](rng(kind + name + n++), a);
    return `<g transform="translate(${f(x)} ${f(y - 352 * sy)}) scale(${f(s)} ${f(sy)})">${g}</g>`;
  };
  const top = 56, bottom = 424, left = 48, right = 752;
  let body = "";

  if (kind === "iwagumi") {
    body += `<rect x="${left}" y="360" width="${right - left}" height="${bottom - 360}" fill="#d9d3c0"/>`;
    body += el("carpet", { hue: ["#5f9a3a", "#8ac04a"], tall: true }, left - 120, 366, 2.5, 1.7);
    body += el("rock", { tone: "#7e8a92", vein: true }, 170, 392, 1.5);
    body += el("rock", { tone: "#78848c", vein: true }, 450, 392, 0.85);
    body += el("fish", { style: "tetra", body: "#9fb4c0", stripe: "#2fb8e0", belly: "#d8423a" }, 560, 220, 0.35);
  } else if (kind === "nature") {
    body += `<rect x="${left}" y="368" width="${right - left}" height="${bottom - 368}" fill="#3b2f26"/>`;
    body += el("stem", { hue: ["#6c9a4a", "#b9506a", "#d77a8a"], leaf: "narrow" }, 470, 376, 1.15);
    body += el("wood", { tone: "#6a4a30", branches: 6 }, 130, 380, 1.25);
    body += el("moss", { hue: ["#2f5f2f", "#4a8a3a", "#6aa850"] }, 300, 380, 0.6);
    body += el("rock", { tone: "#a08a6a", pits: true }, 330, 392, 0.7);
    body += el("carpet", { hue: ["#7fae3f", "#a6c85a"], tall: false }, left - 80, 392, 2.4, 0.8);
    body += el("fish", { style: "round", body: "#e8a05a", stripe: "#1c2224", belly: "#f0c090" }, 400, 120, 0.3);
  } else {
    body += `<rect x="${left}" y="372" width="${right - left}" height="${bottom - 372}" fill="#33281f"/>`;
    body += el("stem", { hue: ["#4f8a3a", "#6a9a3a", "#8ab84a"], leaf: "narrow" }, 80, 380, 1.15);
    body += el("stem", { hue: ["#7a2f3a", "#a8404a", "#c9605e"], leaf: "round" }, 520, 380, 1.1);
    body += el("wood", { tone: "#5a3f28", branches: 5 }, 230, 382, 1.05);
    body += el("rosette", { hue: ["#4f7f3a", "#7a8a3a"], leaf: "wavy", n: 8 }, 330, 384, 0.95);
    body += el("fern", { hue: ["#3d7a3a", "#5a9a4a"] }, 560, 388, 0.85);
    body += el("rosette", { hue: ["#2f6a3a", "#4d8a4a"], leaf: "broad", n: 6 }, 190, 392, 0.7);
    body += el("moss", { hue: ["#2f5f2f", "#4a8a3a", "#6aa850"] }, 440, 396, 0.5);
    body += el("fish", { style: "tetra", body: "#e88a3a", stripe: "#f0a050", belly: "#e07a2a" }, 380, 150, 0.3);
  }
  NO_GROUND = false;

  const id = `sc-${kind}`;
  return `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contoh tata letak gaya ${kind}">
    <defs>
      <clipPath id="${id}"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath>
      <linearGradient id="${id}-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccfc9"/><stop offset="1" stop-color="#4f9a93"/></linearGradient>
    </defs>
    <rect x="${left - 4}" y="${bottom}" width="${right - left + 8}" height="22" rx="3" fill="#1a2b28"/>
    <g clip-path="url(#${id})"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" fill="url(#${id}-w)"/>${body}</g>
    <rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" fill="none" stroke="#f3f8f5" stroke-width="4" opacity=".85"/>
    <rect x="${left - 4}" y="${top - 6}" width="${right - left + 8}" height="8" fill="#17302c"/>
    <path d="M${left + 18} ${top + 20}v120" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>
  </svg>`;
}
