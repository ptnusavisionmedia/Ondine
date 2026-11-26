/* Hero: akuarium yang tersusun mengikuti scroll.
   Seluruh adegan adalah fungsi dari progres (0..1) dan waktu, digambar di canvas. */

export const STAGES = [
  { at: 0.0, key: "air", label: "Air", href: "/toko/akuarium" },
  { at: 0.14, key: "substrat", label: "Substrat", href: "/toko/substrat" },
  { at: 0.3, key: "batu", label: "Batu", href: "/toko/hardscape" },
  { at: 0.48, key: "kayu", label: "Kayu", href: "/toko/hardscape" },
  { at: 0.6, key: "tanaman", label: "Tanaman", href: "/toko/tanaman" },
  { at: 0.84, key: "ikan", label: "Ikan", href: "/toko/fauna" },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeBack = (t: number) => {
  const c = 1.2;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Data adegan (koordinat 0..1 relatif tangki) ---------- */
const R = rng(20240611);

const sandH = (nx: number) => 0.1 + 0.055 * Math.exp(-Math.pow((nx - 0.3) / 0.22, 2)) + 0.03 * (1 - nx);

interface Rock { nx: number; w: number; h: number; pts: [number, number][]; tone: string; delay: number }
const rocks: Rock[] = [
  { nx: 0.34, w: 0.17, h: 0.5, tone: "#7d8b91", delay: 0 },
  { nx: 0.52, w: 0.12, h: 0.3, tone: "#6f7d84", delay: 0.2 },
  { nx: 0.2, w: 0.1, h: 0.22, tone: "#8794a0", delay: 0.4 },
].map((r) => {
  const n = 10;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 0.78 + R() * 0.32;
    pts.push([Math.cos(a) * j, Math.sin(a) * j * (Math.sin(a) > 0 ? 0.55 : 1)]);
  }
  return { ...r, pts };
});

function bez(p0: number[], p1: number[], p2: number[], p3: number[], t: number) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}
const woodMain = Array.from({ length: 40 }, (_, i) => bez([0.8, 0.92], [0.82, 0.6], [0.7, 0.5], [0.64, 0.2], i / 39));
const woodBranches = [
  { from: 0.35, pts: Array.from({ length: 16 }, (_, i) => bez([0, 0], [0.06, -0.05], [0.12, -0.04], [0.16, -0.16], i / 15)) },
  { from: 0.55, pts: Array.from({ length: 16 }, (_, i) => bez([0, 0], [-0.05, -0.06], [-0.1, -0.05], [-0.14, -0.18], i / 15)) },
  { from: 0.78, pts: Array.from({ length: 12 }, (_, i) => bez([0, 0], [0.04, -0.04], [0.08, -0.03], [0.1, -0.12], i / 11)) },
];

interface Blade { nx: number; h: number; lean: number; ph: number; col: string; w: number; delay: number }
const greens = ["#2f7a3f", "#3f9a4a", "#58b052", "#2a6a46"];
const blades: Blade[] = [];
for (let i = 0; i < 52; i++) {
  const side = R() < 0.55 ? R() * 0.2 + 0.03 : R() * 0.2 + 0.7;
  blades.push({ nx: side, h: 0.4 + R() * 0.38, lean: (R() - 0.5) * 0.12, ph: R() * 6, col: greens[(R() * 4) | 0], w: 2 + R() * 1.6, delay: R() * 0.35 });
}
const farBlades: Blade[] = [];
for (let i = 0; i < 46; i++) {
  farBlades.push({ nx: 0.04 + R() * 0.92, h: 0.22 + R() * 0.3, lean: (R() - 0.5) * 0.08, ph: R() * 6, col: ["#1d4f3a", "#235a42", "#1a4a40"][(R() * 3) | 0], w: 2.4 + R() * 1.4, delay: R() * 0.3 });
}
const carpet: Blade[] = [];
for (let i = 0; i < 190; i++) {
  const nx = 0.03 + R() * 0.94;
  if (nx > 0.26 && nx < 0.44) continue;
  carpet.push({ nx, h: 0.035 + R() * 0.06, lean: (R() - 0.5) * 0.03, ph: R() * 6, col: i % 3 ? "#7ac04a" : "#5aa83e", w: 1.6, delay: R() * 0.5 });
}
interface Sword { nx: number; n: number; scale: number; delay: number; col: string }
const swords: Sword[] = [
  { nx: 0.6, n: 7, scale: 1, delay: 0.08, col: "#4f9a46" },
  { nx: 0.69, n: 6, scale: 0.7, delay: 0.2, col: "#6aaa3e" },
];
interface Stems { nx: number; n: number; delay: number }
const stems: Stems[] = [{ nx: 0.88, n: 6, delay: 0.1 }, { nx: 0.78, n: 4, delay: 0.25 }];
const mossDots = Array.from({ length: 44 }, () => ({ a: R() * Math.PI, r: R(), s: 0.01 + R() * 0.016, c: ["#2f5f2f", "#4a8a3a", "#6aa850"][(R() * 3) | 0] }));
const woodMoss = Array.from({ length: 14 }, () => ({ i: Math.floor(R() * 36), s: 0.012 + R() * 0.014, dx: (R() - 0.5) * 0.02, c: ["#2f5f2f", "#4a8a3a"][(R() * 2) | 0] }));
const speckles = Array.from({ length: 220 }, () => ({ nx: R(), d: R(), s: 0.6 + R() * 1.4, l: R() > 0.5 }));
const motes = Array.from({ length: 46 }, () => ({ nx: R(), ph: R(), sp: 0.01 + R() * 0.02, s: 0.6 + R() * 1.4, sw: R() * 6 }));

interface School { cx: number; cy: number; ax: number; ay: number; sp: number; ph: number; body: string; belly: string; stripe: string; n: number; size: number; delay: number }
const schools: School[] = [
  { cx: 0.52, cy: 0.3, ax: 0.2, ay: 0.05, sp: 0.38, ph: 0.4, body: "#9fb8c2", belly: "#d8423a", stripe: "#2fd0f0", n: 7, size: 1, delay: 0 },
  { cx: 0.36, cy: 0.5, ax: 0.14, ay: 0.04, sp: 0.3, ph: 2.6, body: "#e0904a", belly: "#f0b070", stripe: "#f2a65a", n: 4, size: 0.85, delay: 0.25 },
];

/* ---------- Penggambar ---------- */
export function createScene(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  let W = 0, H = 0, dpr = 1;
  let tx = 0, ty = 0, tw = 0, th = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W >= 900) {
      tw = Math.min(W * 0.6, H * 1.45);
      th = Math.min(H * 0.68, tw * 0.64);
      tw = Math.min(tw, th / 0.5);
      tx = W - tw - Math.max(28, W * 0.04);
      ty = (H - th) / 2 + 22;
    } else {
      tw = W - 32;
      th = Math.min(tw * 0.84, H * 0.42);
      tx = 16;
      ty = H * 0.17;
    }
  }

  const X = (nx: number) => tx + nx * tw;
  const Y = (ny: number) => ty + ny * th;

  function draw(p: number, t: number) {
    const water = easeOut(seg(p, 0, 0.14));
    const sand = easeOut(seg(p, 0.14, 0.28));
    const plantsOn = seg(p, 0.58, 0.84);
    const fishOn = seg(p, 0.84, 0.94);
    const lamp = easeOut(seg(p, 0.56, 0.7));

    /* ---- ruangan ---- */
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0b2a27");
    bg.addColorStop(0.7, "#071d1c");
    bg.addColorStop(1, "#051413");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // pendar lampu di dinding
    if (lamp > 0) {
      const gl = ctx.createRadialGradient(tx + tw / 2, ty - 10, 10, tx + tw / 2, ty + th * 0.4, tw * 0.85);
      gl.addColorStop(0, `rgba(190,235,215,${0.2 * lamp})`);
      gl.addColorStop(1, "rgba(190,235,215,0)");
      ctx.fillStyle = gl;
      ctx.fillRect(0, 0, W, H);
    }

    // lemari
    const cabH = Math.min(H - (ty + th) + 40, th * 0.3);
    const cy0 = ty + th;
    ctx.fillStyle = "rgba(0,0,0,.38)";
    ctx.fillRect(tx - 18, cy0 + 6, tw + 36, cabH);
    const cab = ctx.createLinearGradient(0, cy0, 0, cy0 + cabH);
    cab.addColorStop(0, "#20382f");
    cab.addColorStop(1, "#0f211d");
    ctx.fillStyle = cab;
    ctx.fillRect(tx - 14, cy0, tw + 28, cabH);
    ctx.fillStyle = "#33564a";
    ctx.fillRect(tx - 14, cy0, tw + 28, 3);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(tx - 14 + (tw + 28) / 2 - 1, cy0 + 10, 2, cabH);

    // lampu gantung
    const lampY = ty - Math.min(46, th * 0.09);
    ctx.strokeStyle = "rgba(180,205,198,.35)";
    ctx.lineWidth = 1.2;
    for (const k of [0.22, 0.78]) {
      ctx.beginPath(); ctx.moveTo(X(k), 0); ctx.lineTo(X(k), lampY + 4); ctx.stroke();
    }
    ctx.fillStyle = "#1d2e2b";
    ctx.beginPath();
    ctx.roundRect(tx + tw * 0.08, lampY, tw * 0.84, 14, 6);
    ctx.fill();
    ctx.fillStyle = lamp > 0 ? `rgba(255,248,214,${0.25 + 0.75 * lamp})` : "#2c403c";
    ctx.beginPath();
    ctx.roundRect(tx + tw * 0.1, lampY + 10, tw * 0.8, 3, 2);
    ctx.fill();

    /* ---- tangki ---- */
    ctx.save();
    ctx.beginPath();
    ctx.rect(tx, ty, tw, th);
    ctx.clip();

    // panel belakang
    const back = ctx.createLinearGradient(0, ty, 0, ty + th);
    back.addColorStop(0, "rgba(150,205,200,.12)");
    back.addColorStop(1, "rgba(150,205,200,.05)");
    ctx.fillStyle = back;
    ctx.fillRect(tx, ty, tw, th);

    const wy = ty + th * (1 - water * 0.94);
    if (water > 0) {
      const g = ctx.createLinearGradient(0, wy, 0, ty + th);
      g.addColorStop(0, "#2f9088");
      g.addColorStop(0.45, "#17615e");
      g.addColorStop(1, "#093434");
      ctx.fillStyle = g;
      ctx.fillRect(tx, wy, tw, ty + th - wy);

      // kabut kedalaman di sisi kiri dan kanan
      const fogL = ctx.createLinearGradient(tx, 0, tx + tw * 0.18, 0);
      fogL.addColorStop(0, "rgba(4,24,24,.55)");
      fogL.addColorStop(1, "rgba(4,24,24,0)");
      ctx.fillStyle = fogL;
      ctx.fillRect(tx, wy, tw * 0.18, ty + th - wy);
      const fogR = ctx.createLinearGradient(tx + tw, 0, tx + tw * 0.82, 0);
      fogR.addColorStop(0, "rgba(4,24,24,.55)");
      fogR.addColorStop(1, "rgba(4,24,24,0)");
      ctx.fillStyle = fogR;
      ctx.fillRect(tx + tw * 0.82, wy, tw * 0.18, ty + th - wy);

      // permukaan
      ctx.strokeStyle = "rgba(225,255,245,.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= tw; x += 8) {
        const y = wy + Math.sin(x * 0.03 + t * 1.3) * 1.6;
        x === 0 ? ctx.moveTo(tx + x, y) : ctx.lineTo(tx + x, y);
      }
      ctx.stroke();

      // berkas cahaya (aditif)
      const ray = 0.03 + 0.13 * lamp + 0.03 * fishOn;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(235,255,230,${ray})`;
      for (let i = 0; i < 6; i++) {
        const bx = tx + tw * (0.06 + i * 0.17) + Math.sin(t * 0.3 + i) * 14;
        const sw = Math.sin(t * 0.4 + i * 2) * 22;
        ctx.beginPath();
        ctx.moveTo(bx, wy);
        ctx.lineTo(bx + 30, wy);
        ctx.lineTo(bx - 40 + sw, ty + th);
        ctx.lineTo(bx - 120 + sw, ty + th);
        ctx.fill();
      }
      ctx.restore();

      // partikel melayang
      ctx.fillStyle = "rgba(220,250,240,.35)";
      for (const m of motes) {
        const k = (t * m.sp + m.ph) % 1;
        const mx = X(m.nx) + Math.sin(t * 0.4 + m.sw) * 10;
        const my = ty + th - k * (ty + th - wy);
        ctx.globalAlpha = Math.sin(k * Math.PI) * 0.7;
        ctx.beginPath();
        ctx.arc(mx, my, m.s, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* ---- tanaman latar (gelap, memberi kedalaman) ---- */
    const blade = (b: Blade, grow: number, alpha = 1) => {
      const gr = easeOut(clamp((grow - b.delay) / (1 - b.delay)));
      if (gr <= 0) return;
      const x0 = X(b.nx), y0 = Y(1 - sandH(b.nx) * sand + 0.012);
      const h = b.h * th * gr;
      const sway = Math.sin(t * 0.9 + b.ph + b.nx * 5) * (0.02 + b.h * 0.05) * th * gr;
      const x1 = x0 + b.lean * tw * gr + sway;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = b.col;
      ctx.lineWidth = b.w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + sway * 0.3, y0 - h * 0.55, x1, y0 - h);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    for (const b of farBlades) blade(b, plantsOn, 0.9);

    /* ---- kayu ---- */
    const woodK = easeOut(seg(p, 0.48, 0.6));
    const sh = (nx: number, ny: number) => [X(nx), Y(ny + (1 - sand) * 0.1)];
    if (woodK > 0) {
      const drawPath = (pts: number[][], base: number[], width: number, k: number) => {
        const n = Math.max(2, Math.floor(pts.length * k));
        for (let pass = 0; pass < 3; pass++) {
          ctx.beginPath();
          for (let i = 0; i < n; i++) {
            const [sx, sy] = sh(base[0] + pts[i][0], base[1] + pts[i][1] - (pass === 2 ? 0.006 : 0));
            i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = ["#2e2015", "#6e4c30", "#9a7048"][pass];
          ctx.lineWidth = [width + 3, width, width * 0.3][pass];
          ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.stroke();
        }
      };
      drawPath(woodMain, [0, 0], th * 0.05, woodK);
      for (const b of woodBranches) {
        const bk = clamp((woodK - b.from) / (1 - b.from));
        if (bk <= 0) continue;
        drawPath(b.pts, woodMain[Math.floor((woodMain.length - 1) * b.from)], th * 0.026, bk);
      }
      // lumut di kayu
      if (plantsOn > 0.25) {
        for (const m of woodMoss) {
          const pt = woodMain[m.i];
          const [sx, sy] = sh(pt[0] + m.dx, pt[1]);
          ctx.fillStyle = m.c;
          ctx.globalAlpha = clamp((plantsOn - 0.25) * 3);
          ctx.beginPath();
          ctx.arc(sx, sy, m.s * th, 0, 7);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    /* ---- batu ---- */
    for (const r of rocks) {
      const k = seg(p, 0.3 + r.delay * 0.12, 0.3 + r.delay * 0.12 + 0.12);
      if (k <= 0) continue;
      const e = easeBack(k);
      const baseY = 1 - sandH(r.nx) * sand + 0.015;
      const rw = r.w * th * 1.5, rh = r.h * th * 0.5;
      const cx = X(r.nx), cy = Y(baseY) - rh * 0.5 - (1 - e) * th * 1.1;
      ctx.globalAlpha = clamp(k * 4);
      ctx.beginPath();
      r.pts.forEach(([a, b], i) => {
        const x = cx + a * rw, y = cy + b * rh;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = r.tone;
      ctx.fill();
      const n = r.pts.length;
      const lx = cx - rw * 0.2, ly = cy - rh * 0.4;
      for (let i = 0; i < n; i++) {
        const a = r.pts[i], b = r.pts[(i + 1) % n];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const lit = (-mx * 0.6 - my) / Math.hypot(mx, my);
        ctx.beginPath();
        ctx.moveTo(cx + a[0] * rw, cy + a[1] * rh);
        ctx.lineTo(cx + b[0] * rw, cy + b[1] * rh);
        ctx.lineTo(lx, ly);
        ctx.closePath();
        const v = lit * 28;
        ctx.fillStyle = `rgb(${clamp(125 + v, 0, 255) | 0},${clamp(139 + v, 0, 255) | 0},${clamp(145 + v, 0, 255) | 0})`;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (r.nx === 0.34 && plantsOn > 0.3) {
        for (const d of mossDots) {
          ctx.fillStyle = d.c;
          ctx.globalAlpha = clamp((plantsOn - 0.3) * 3);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(d.a) * rw * (0.3 + d.r * 0.6), cy - Math.sin(d.a) * rh * 0.8, d.s * th, 0, 7);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    /* ---- tanaman tengah ---- */
    for (const b of blades) blade(b, plantsOn);

    for (const s of swords) {
      const g = easeOut(clamp((plantsOn - s.delay) / (1 - s.delay)));
      if (g <= 0) continue;
      const x0 = X(s.nx), y0 = Y(1 - sandH(s.nx) * sand);
      for (let i = 0; i < s.n; i++) {
        const a = (i / (s.n - 1) - 0.5) * 2.1 + Math.sin(t * 0.8 + i + s.nx * 7) * 0.05 * g;
        const L = th * 0.34 * s.scale * g * (0.8 + 0.2 * Math.cos(a));
        const w = L * 0.17;
        ctx.save();
        ctx.translate(x0, y0);
        ctx.rotate(a);
        ctx.fillStyle = i % 2 ? s.col : "#3d8a40";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(w, -L * 0.25, w, -L * 0.7, 0, -L);
        ctx.bezierCurveTo(-w, -L * 0.7, -w, -L * 0.25, 0, 0);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,.13)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(w, -L * 0.25, w, -L * 0.7, 0, -L);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    for (const s of stems) {
      const g = easeOut(clamp((plantsOn - s.delay) / (1 - s.delay)));
      if (g <= 0) continue;
      for (let i = 0; i < s.n; i++) {
        const nx = s.nx + (i - s.n / 2) * 0.014;
        const x0 = X(nx), y0 = Y(1 - sandH(nx) * sand);
        const h = th * (0.32 + (i % 3) * 0.08) * g;
        const sw = Math.sin(t * 0.9 + i + nx * 6) * 0.015 * th * g;
        ctx.strokeStyle = "#7a3a3a";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 + sw, y0 - h * 0.5, x0 + sw * 1.6, y0 - h);
        ctx.stroke();
        for (let k = 0.15; k < 1; k += 0.13) {
          const lx = x0 + sw * 1.6 * k * k, ly = y0 - h * k;
          ctx.fillStyle = k > 0.5 ? "#d4607a" : "#9a3f55";
          for (const d of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(lx + d * th * 0.022, ly, th * 0.026, th * 0.009, d * -0.5, 0, 7);
            ctx.fill();
          }
        }
      }
    }

    /* ---- substrat ---- */
    if (sand > 0) {
      ctx.beginPath();
      ctx.moveTo(tx, ty + th);
      for (let i = 0; i <= 40; i++) {
        const nx = i / 40;
        ctx.lineTo(X(nx), Y(1 - sandH(nx) * sand));
      }
      ctx.lineTo(tx + tw, ty + th);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, Y(0.8), 0, ty + th);
      g.addColorStop(0, "#54432f");
      g.addColorStop(1, "#231a13");
      ctx.fillStyle = g;
      ctx.fill();
      // butiran
      for (const s of speckles) {
        const top = 1 - sandH(s.nx) * sand;
        const yy = Y(top + s.d * sandH(s.nx) * sand * 0.95);
        ctx.fillStyle = s.l ? "rgba(255,230,190,.18)" : "rgba(0,0,0,.28)";
        ctx.fillRect(X(s.nx), yy, s.s, s.s);
      }
      // kaustik cahaya di permukaan substrat
      if (lamp > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = `rgba(240,255,220,${0.16 * lamp})`;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 16; i++) {
          const nx = 0.03 + (i / 16) * 0.94 + Math.sin(t * 0.5 + i) * 0.012;
          const yy = Y(1 - sandH(nx) * sand) + 4 + (i % 4) * 5;
          ctx.beginPath();
          ctx.moveTo(X(nx), yy);
          ctx.quadraticCurveTo(X(nx) + 12, yy - 3 + Math.sin(t * 1.1 + i) * 2, X(nx) + 26, yy + 1);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    /* ---- karpet depan ---- */
    for (const b of carpet) blade(b, clamp(plantsOn * 1.25 - 0.2));

    /* ---- udang di dasar ---- */
    if (fishOn > 0.2) {
      const a = clamp((fishOn - 0.2) * 3);
      for (let i = 0; i < 3; i++) {
        const nx = 0.12 + i * 0.3 + Math.sin(t * 0.07 + i * 2) * 0.05;
        const dir = Math.cos(t * 0.07 + i * 2) >= 0 ? 1 : -1;
        const x = X(nx), y = Y(1 - sandH(nx) * sand) - th * 0.004;
        const s = th * 0.012;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(x, y);
        ctx.scale(dir, 1);
        ctx.fillStyle = "#d4372e";
        for (let k = 0; k < 5; k++) {
          ctx.beginPath();
          ctx.ellipse(-k * s * 1.1, -Math.sin(k * 0.7) * s * 0.9, s * (1.5 - k * 0.14), s * (1 - k * 0.08), 0, 0, 7);
          ctx.fill();
        }
        ctx.strokeStyle = "#e8554a";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(s * 1.2, -s * 1.2); ctx.lineTo(s * 3.6, -s * 2.4); ctx.stroke();
        ctx.fillStyle = "#06191a";
        ctx.beginPath(); ctx.arc(s * 0.9, -s * 0.7, s * 0.22, 0, 7); ctx.fill();
        ctx.restore();
      }
    }

    /* ---- ikan (kawanan) ---- */
    if (fishOn > 0) {
      for (const sc of schools) {
        for (let i = 0; i < sc.n; i++) {
          const a = clamp((fishOn - sc.delay * 0.5 - i * 0.03) * 2.4);
          if (a <= 0) continue;
          const ang = t * sc.sp + sc.ph + i * 0.16;
          const ox = Math.sin(i * 2.3) * 0.05, oy = Math.cos(i * 1.7) * 0.05;
          const nx = sc.cx + Math.sin(ang) * sc.ax + ox;
          const ny = sc.cy + Math.sin(ang * 1.9 + i * 0.4) * sc.ay + oy;
          const dir = Math.cos(ang) >= 0 ? 1 : -1;
          const s = th * 0.04 * sc.size * (0.9 + (i % 3) * 0.08);
          ctx.save();
          ctx.globalAlpha = a;
          ctx.translate(X(nx), Y(ny));
          ctx.rotate(Math.sin(ang * 1.9 + i * 0.4) * 0.12 * dir);
          ctx.scale(dir, 1);
          const wag = Math.sin(t * 9 + i * 1.3) * s * 0.22;
          ctx.fillStyle = sc.body;
          ctx.globalAlpha = a * 0.85;
          ctx.beginPath();
          ctx.moveTo(-s * 1.3, 0);
          ctx.lineTo(-s * 2.3, -s * 0.8 + wag);
          ctx.lineTo(-s * 2.3, s * 0.8 + wag);
          ctx.fill();
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 1.5, s * 0.62, 0, 0, 7);
          ctx.fill();
          ctx.fillStyle = sc.belly;
          ctx.beginPath();
          ctx.ellipse(-s * 0.25, s * 0.25, s * 1.1, s * 0.32, 0, 0, 7);
          ctx.fill();
          ctx.strokeStyle = sc.stripe;
          ctx.lineWidth = s * 0.28;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-s * 1.0, -s * 0.12);
          ctx.lineTo(s * 1.2, -s * 0.1);
          ctx.stroke();
          ctx.fillStyle = "#06191a";
          ctx.beginPath();
          ctx.arc(s * 1.0, -s * 0.15, s * 0.12, 0, 7);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    /* ---- gelembung CO2 ---- */
    if (plantsOn > 0.2) {
      ctx.fillStyle = "rgba(235,255,250,.55)";
      for (let i = 0; i < 11; i++) {
        const k = (t * 0.22 + i / 11) % 1;
        const bx = X(0.92) + Math.sin(k * 14 + i) * 6;
        const by = Y(1 - sandH(0.92) * sand) - k * (Y(1) - wy);
        ctx.beginPath();
        ctx.arc(bx, by, 1.4 + k * 2.2, 0, 7);
        ctx.fill();
      }
    }

    ctx.restore();

    /* ---- kaca dan bingkai ---- */
    // kilau diagonal yang bergeser pelan mengikuti scroll
    ctx.save();
    ctx.beginPath();
    ctx.rect(tx, ty, tw, th);
    ctx.clip();
    const sheenX = tx + ((p * 0.6 + 0.1) % 1) * tw * 1.4 - tw * 0.2;
    const sg = ctx.createLinearGradient(sheenX, ty, sheenX + tw * 0.22, ty + th);
    sg.addColorStop(0, "rgba(255,255,255,0)");
    sg.addColorStop(0.5, "rgba(255,255,255,.07)");
    sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(tx, ty, tw, th);
    ctx.restore();

    ctx.strokeStyle = "rgba(225,245,240,.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(tx, ty, tw, th);
    // rim silikon hitam atas dan bawah
    ctx.fillStyle = "#0a1413";
    ctx.fillRect(tx - 3, ty - 5, tw + 6, 7);
    ctx.fillRect(tx - 3, ty + th - 3, tw + 6, 6);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fillRect(tx + 10, ty + 14, 5, th * 0.5);
  }

  resize();
  return { draw, resize };
}
