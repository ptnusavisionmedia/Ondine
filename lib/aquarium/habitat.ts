import { Mesh, type Vec3 } from "./geometry";

const width = 3.57;
const depth = 1.39;
const floor = -1.44;
const tau = Math.PI * 2;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const fade = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const unit = (x: number, y: number, z: number): Vec3 => {
  const d = Math.hypot(x, y, z) || 1;
  return [x / d, y / d, z / d];
};
const tint = (c: Vec3, v: number): Vec3 => [c[0] * v, c[1] * v, c[2] * v];
const blend = (a: Vec3, b: Vec3, t: number): Vec3 => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

function randomGenerator() {
  let seed = 431022;
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
type Random = () => number;

// Distance from the two banks of a winding path, which narrows toward the rear glass.
function bank(x: number, z: number) {
  const t = (depth - z) / (2 * depth);
  const middle = -0.78 + 1.03 * t + 0.34 * Math.sin(6.4 * t + 0.52);
  const half = mix(0.6, 0.17, t) + 0.085 * Math.sin(8 * t);
  return fade((Math.abs(x - middle) - half + 0.08) / 0.29);
}

export function groundHeight(x: number, z: number) {
  const back = (depth - z) / (depth * 2);
  const mound = (dx: number, dz: number, spread: number) => Math.exp((-dx * dx) / spread - (dz * dz) / 0.95);
  const soil =
    0.075 +
    0.11 * back +
    0.35 * mound(x - 1.48, z + 0.42, 1.15) +
    0.23 * mound(x + 1.92, z + 0.52, 1.03) +
    0.029 * Math.sin(4.4 * x + 1.4 * z) * Math.cos(3.1 * z);
  return -1.265 + 0.26 * back + bank(x, z) * soil + 0.012 * Math.sin(5.1 * z + 2.4 * x);
}

function earthColor(x: number, z: number): Vec3 {
  const quartz: Vec3 = [0.735, 0.687, 0.558];
  const loam: Vec3 = [0.307, 0.281, 0.226];
  const mottling = 0.97 + 0.031 * Math.sin(6.1 * x - 3.1 * z) + 0.027 * Math.cos(9.6 * z + x);
  return tint(blend(quartz, loam, bank(x, z)), mottling);
}

function substrate(mesh: Mesh, random: Random) {
  mesh.anchorY = floor;
  const nx = 50,
    nz = 25;
  const rows: number[][] = [];
  for (let j = 0; j <= nz; j++) {
    const row: number[] = [];
    for (let i = 0; i <= nx; i++) {
      const x = ((2 * i) / nx - 1) * width,
        z = ((2 * j) / nz - 1) * depth;
      const dx = groundHeight(x + 0.02, z) - groundHeight(x - 0.02, z);
      const dz = groundHeight(x, z + 0.02) - groundHeight(x, z - 0.02);
      row.push(
        mesh.vertex([x, groundHeight(x, z), z], unit(-dx, 0.04, -dz), earthColor(x, z), cover(x, z) * 0.84),
      );
      if (i && j) mesh.quad(rows[j - 1][i - 1], row[i - 1], row[i], rows[j - 1][i]);
    }
    rows.push(row);
  }

  const walls: [Vec3, Vec3, Vec3, number][] = [
    [[-width, floor, depth], [width, floor, depth], [0, 0, 1], nx],
    [[width, floor, depth], [width, floor, -depth], [1, 0, 0], nz],
    [[width, floor, -depth], [-width, floor, -depth], [0, 0, -1], nx],
    [[-width, floor, -depth], [-width, floor, depth], [-1, 0, 0], nz],
  ];
  for (const [a, b, normal, count] of walls) {
    let prev: number[] = [];
    for (let i = 0; i <= count; i++) {
      const x = mix(a[0], b[0], i / count),
        z = mix(a[2], b[2], i / count);
      const h = groundHeight(x, z);
      const top = earthColor(x, z),
        buried: Vec3 = [0.18, 0.154, 0.121];
      const cut = [0, 0.18, 0.58, 0.77, 1].map((v, k) => {
        const seam = k > 0 && k < 4 ? 0.012 * Math.sin(x * 5 + z * 4 + k * 2) : 0;
        return mesh.vertex([x, mix(floor, h, v) + seam, z], normal, blend(buried, top, v * v));
      });
      if (i) for (let j = 0; j < cut.length - 1; j++) mesh.quad(prev[j], cut[j], cut[j + 1], prev[j + 1]);
      prev = cut;
    }
  }

  // Tiny embedded grains catch the light above the finer material texture.
  for (let i = 0; i < 1120; i++) {
    const x = (random() * 2 - 1) * (width - 0.035),
      z = (random() * 2 - 1) * (depth - 0.035);
    const y = groundHeight(x, z) + 0.001;
    const radius = 0.009 + random() ** 2 * (0.017 + bank(x, z) * 0.024);
    const color = tint(earthColor(x, z), 0.59 + random() * 0.66);
    const moss = cover(x, z) * 0.84;
    const top = mesh.vertex([x, y + radius * 0.69, z], [0, 1, 0], tint(color, 1.06), moss);
    const ring: number[] = [];
    const phase = random() * tau;
    for (let k = 0; k < 5; k++) {
      const a = phase + (tau * k) / 5;
      const c = Math.cos(a),
        s = Math.sin(a);
      ring.push(
        mesh.vertex([x + radius * c, y - radius * 0.18, z + radius * s * 0.8], unit(c, 0.46, s), color, moss),
      );
    }
    for (let k = 0; k < 5; k++) mesh.tri(top, ring[(k + 1) % 5], ring[k]);
  }
}

interface Boulder {
  x: number;
  z: number;
  rx: number;
  rz: number;
  h: number;
  lean: number;
  seed: number;
}

const stones: Boulder[] = [
  { x: 1.32, z: -0.25, rx: 0.8, rz: 0.57, h: 1.64, lean: -0.31, seed: 2.8 },
  { x: 1.97, z: -0.48, rx: 0.51, rz: 0.46, h: 1.04, lean: -0.21, seed: 7.7 },
  { x: 1.98, z: 0.18, rx: 0.48, rz: 0.35, h: 0.53, lean: -0.13, seed: 13.3 },
  { x: 0.68, z: 0.21, rx: 0.43, rz: 0.33, h: 0.56, lean: -0.15, seed: 11.1 },
  { x: 1.15, z: 0.64, rx: 0.33, rz: 0.26, h: 0.34, lean: -0.1, seed: 9.2 },
  { x: -1.98, z: -0.4, rx: 0.68, rz: 0.52, h: 1.05, lean: -0.18, seed: 5.1 },
  { x: -2.5, z: -0.33, rx: 0.42, rz: 0.4, h: 0.66, lean: -0.16, seed: 17.4 },
  { x: -1.62, z: 0.06, rx: 0.43, rz: 0.3, h: 0.48, lean: -0.12, seed: 3.7 },
  { x: -1.83, z: 0.5, rx: 0.26, rz: 0.23, h: 0.29, lean: -0.08, seed: 10.4 },
];

function boulder(mesh: Mesh, b: Boulder, segments: number, layers: number) {
  const { x, z, rx, rz, h, lean, seed } = b;
  const ground = groundHeight(x, z);
  const bottom = ground - 0.105 * h - Math.min(rx, 0.24) * 0.35;
  mesh.anchorY = bottom;
  const main = h > 1.3;
  const crownWidth = main ? 0.57 : 0.39 + 0.36 * Math.abs(Math.sin(seed * 5.6));
  // Oblique fracture planes form slabs large enough to read at the overview distance.
  const faces = Array.from({ length: 7 }, (_, j) => ({
    direction: seed + (j * tau) / 7 + 0.15 * Math.sin(seed * 2 + j * 3.9),
    distance: 0.84 + 0.15 * Math.sin(j * 3 + seed),
    slope: 0.18 * Math.sin(seed * 2.5 + j),
  }));
  // Cleavage exposes short planar ledges on differently oriented faces.
  function fracture(a: number, t: number) {
    if (h < 0.29) return 0;
    let depth = 0;
    for (let i = 0; i < 4; i++) {
      const direction = 0.31 + i * 1.15 + 0.49 * Math.sin(seed * 1.73 + i);
      const arc = fade((Math.cos(a - direction) - 0.49) * 2.7);
      const plane = 0.21 + i * 0.145 + 0.19 * Math.sin(a - 1.3 + i * 0.18) + 0.027 * Math.cos(7.3 * a + seed);
      const d = t - plane;
      const cut = d < 0 ? clamp(1 + d / 0.035) : clamp(1 - d / 0.16);
      depth += arc * cut * (0.13 + 0.055 * Math.sin(seed + i * 2));
    }
    return depth;
  }
  function point(a: number, t: number): Vec3 {
    let radius = 1.2;
    for (const face of faces) {
      const cosine = Math.cos(a - face.direction);
      if (cosine > 0.01) radius = Math.min(radius, (face.distance + t * face.slope) / cosine);
    }
    const c = Math.cos(a),
      s = Math.sin(a);
    const brokenSide = fade(1.9 * t - 0.76 + 0.48 * Math.sin(a + seed));
    const bevel = fade((t - 0.83) * 6);
    const outline = 0.97 - (1 - crownWidth) * brokenSide - 0.11 * bevel + 0.12 * Math.sin(t * Math.PI);
    // A few narrow clefts stop halfway up the stone, leaving the other faces intact.
    const field = 3 * a - 2.1 * t + seed + 0.32 * Math.sin(5.8 * t + a);
    const fissure =
      Math.pow(clamp(0.5 + 0.5 * Math.cos(field)), 26) * (0.025 + 0.15 * Math.sin(Math.PI * clamp(t * 1.26)));
    const chips = Math.abs(Math.sin(8 * a - 3.8 * t + seed) * Math.sin(5 * a + t * 9.1 + seed)) * 0.044;
    const r = outline * (radius - fissure - chips - fracture(a, t));
    const px = x + rx * r * c + lean * t,
      pz = z + rz * r * s - rz * 0.12 * t;
    const slope = main ? 0.17 : 0.12 + 0.08 * Math.sin(seed);
    const top = 0.96 - slope * c + 0.055 * s + 0.036 * Math.sin(3 * a + seed);
    const py =
      bottom +
      h * (t * top + 0.024 * Math.sin(t * Math.PI) * Math.sin(a * 3 + seed)) +
      (groundHeight(px, pz) - ground) * (1 - fade(t * 2.8));
    return [px, py, pz];
  }
  function normal(a: number, t: number): Vec3 {
    const left = point(a - 0.023, t),
      right = point(a + 0.023, t);
    const down = point(a, Math.max(0, t - 0.016)),
      up = point(a, Math.min(1, t + 0.016));
    const ax = up[0] - down[0],
      ay = up[1] - down[1],
      az = up[2] - down[2];
    const bx = right[0] - left[0],
      by = right[1] - left[1],
      bz = right[2] - left[2];
    return unit(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
  }
  const bed: Vec3 = [0.236, 0.253, 0.224],
    summit: Vec3 = [0.477, 0.497, 0.463];
  const rows: number[][] = [];
  for (let j = 0; j <= layers; j++) {
    const row: number[] = [],
      t = j / layers;
    for (let i = 0; i < segments; i++) {
      const a = (i * tau) / segments;
      const weathering =
        0.037 * Math.sin(5 * a + 1.8 * t + seed) + 0.021 * Math.sin(12.1 * a - 5.6 * t + seed);
      const value = 0.97 + 0.048 * Math.cos(2 * a + seed) + weathering - 0.97 * fracture(a, t);
      row.push(mesh.vertex(point(a, t), normal(a, t), tint(blend(bed, summit, t ** 0.7), value)));
    }
    if (j)
      for (let i = 0; i < segments; i++) {
        const n = (i + 1) % segments;
        mesh.quad(rows[j - 1][i], row[i], row[n], rows[j - 1][n]);
      }
    rows.push(row);
  }
  // A chipped inclined crown with an irregular raised corner closes each stone.
  const topCenter: Vec3 = [x + lean - rx * 0.12, bottom + h * 1.012, z - rz * 0.16];
  let rim = rows[layers];
  for (let k = 1; k < 4; k++) {
    const next = [];
    const inset = k / 4;
    for (let i = 0; i < segments; i++) {
      const a = (i * tau) / segments,
        lip = point(a, 1);
      const bump = Math.sin(Math.PI * inset) * (0.01 + 0.02 * Math.sin(seed + a * 2));
      const p: Vec3 = [
        mix(lip[0], topCenter[0], inset),
        mix(lip[1], topCenter[1], inset) + bump * h,
        mix(lip[2], topCenter[2], inset),
      ];
      next.push(mesh.vertex(p, unit(0.3 + 0.16 * Math.cos(a), 1, -0.1 + 0.09 * Math.sin(a)), summit));
    }
    for (let i = 0; i < segments; i++)
      mesh.quad(rim[i], next[i], next[(i + 1) % segments], rim[(i + 1) % segments]);
    rim = next;
  }
  const middle = mesh.vertex(topCenter, unit(0.3, 1, -0.1), summit);
  for (let i = 0; i < segments; i++) mesh.tri(rim[i], middle, rim[(i + 1) % segments]);

  // Only exposed inclusions of the larger stones show short, oblique mineral seams.
  if (h < 0.85) return;
  const vein: Vec3 = [0.514, 0.529, 0.474];
  for (let v = 0; v < (main ? 2 : 1); v++) {
    const start = 0.53 + Math.abs(Math.sin(seed + 2 * v)) * 1.21;
    let previous: number[] = [];
    for (let i = 0; i <= 19; i++) {
      const u = i / 19,
        a = start + u * (0.48 + 0.25 * Math.cos(v + seed));
      const t =
        0.32 + 0.16 * v + 0.13 * u + 0.018 * Math.sin(u * 6.4 + seed) + 0.009 * Math.sin(u * 21 - seed * 2);
      const thickness = (0.0032 * (0.1 + Math.sin(u * Math.PI))) / Math.sqrt(h);
      const row = [-1, 1].map((side) => {
        const p = point(a, t + side * thickness),
          n = normal(a, t);
        return mesh.vertex([p[0] + n[0] * 0.004, p[1] + n[1] * 0.004, p[2] + n[2] * 0.004], n, vein);
      });
      if (i) mesh.quad(previous[0], previous[1], row[1], row[0]);
      previous = row;
    }
  }
}

function nearRock(x: number, z: number, padding: number) {
  return stones.some((b) => ((x - b.x) / (b.rx * padding)) ** 2 + ((z - b.z) / (b.rz * padding)) ** 2 < 1);
}

type Leaf = "ribbon" | "sword" | "round";

// Blades bend inward as they brush the glass. The margin also leaves room for the animated current.
function insideGlass(value: number, boundary: number) {
  const start = boundary - 0.19;
  const d = Math.abs(value) - start;
  return d <= 0 ? value : Math.sign(value) * (start + 0.19 * (1 - Math.exp(-d / 0.19)));
}

function leaf(
  mesh: Mesh,
  root: Vec3,
  angle: number,
  h: number,
  reach: number,
  w: number,
  color: Vec3,
  kind: Leaf,
  phase: number,
  inheritedMotion = 0,
) {
  const wide = kind !== "ribbon",
    segments = h < 0.3 || kind === "round" ? 3 : 5;
  const c = Math.cos(angle),
    s = Math.sin(angle);
  let previous: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments,
      bow = Math.sin(Math.PI * t);
    const radius = reach * (kind === "round" ? t : t ** 1.52);
    const sway = (Math.sin(phase + t * 4) - Math.sin(phase)) * h * 0.079 * t;
    const x = root[0] + c * radius + sway * s + 0.044 * h * t * t;
    const z = root[2] + s * radius - sway * c;
    const y = root[1] + h * (t + (kind === "ribbon" ? 0.09 : 0.27) * bow);
    const cross = angle + 0.72 * t * Math.sin(phase);
    const wc = Math.cos(cross),
      ws = Math.sin(cross);
    const bladeWidth =
      kind === "ribbon"
        ? (0.48 + 0.52 * Math.sin(Math.PI * t * 0.85)) * (1 - t ** 2.8)
        : Math.sin(Math.PI * t ** (kind === "round" ? 1.45 : 1.1)) ** 0.74;
    const half = w * (0.023 + bladeWidth);
    const row: number[] = [];
    for (const side of wide ? [-1, 0, 1] : [-1, 1]) {
      const fold = side === 0 ? half * 0.31 : 0;
      const norm = unit(
        -c * h - ws * side * h * 0.48,
        Math.max(0.04, reach * (0.35 + t)),
        -s * h + wc * side * h * 0.48,
      );
      const value = (0.57 + 0.45 * Math.sqrt(t)) * (side === 0 ? 1.11 : 0.98);
      row.push(
        mesh.vertex(
          [
            insideGlass(x - ws * half * side, width - 0.04),
            y + fold,
            insideGlass(z + wc * half * side, depth - 0.019),
          ],
          norm,
          tint(color, value),
          inheritedMotion + (1 - inheritedMotion) * t ** 1.6 * Math.min(1, h),
        ),
      );
    }
    if (i) for (let k = 1; k < row.length; k++) mesh.quad(previous[k - 1], row[k - 1], row[k], previous[k]);
    previous = row;
  }
}

const grasses: Vec3[] = [
  [0.3, 0.51, 0.245],
  [0.37, 0.57, 0.26],
  [0.46, 0.595, 0.27],
  [0.24, 0.46, 0.3],
];
const swords: Vec3[] = [
  [0.37, 0.5, 0.235],
  [0.46, 0.54, 0.25],
  [0.35, 0.48, 0.27],
  [0.47, 0.46, 0.26],
];
function rosette(mesh: Mesh, x: number, z: number, scale: number, kind: "ribbon" | "sword", random: Random) {
  const y = groundHeight(x, z) - 0.018,
    start = random() * tau;
  mesh.anchorY = y;
  const colors = kind === "ribbon" ? grasses : swords;
  const base = colors[Math.floor(random() * colors.length)];
  const count = Math.round(7 + random() * 3);
  for (let k = 0; k < count; k++) {
    const a = start + ((k + random() * 0.51) * tau) / count;
    const size = scale * (0.48 + random() * 0.63);
    const reach = size * (kind === "ribbon" ? 0.16 + random() * 0.46 : 0.45 + random() * 0.76);
    const w = kind === "sword" ? size * 0.095 : 0.007 + 0.009 * size;
    leaf(
      mesh,
      [x + 0.014 * Math.cos(a), y, z + 0.014 * Math.sin(a)],
      a,
      size,
      reach,
      w,
      tint(base, 0.87 + random() * 0.21),
      kind,
      random() * tau,
    );
  }
}

// Six vertices describe the petiole, two rounded flanks and the distal end of a small leaf.
function smallLeaf(
  mesh: Mesh,
  p: Vec3,
  a: number,
  reach: number,
  rise: number,
  width: number,
  color: Vec3,
  motion: number,
) {
  const c = Math.cos(a),
    s = Math.sin(a);
  const ring = [
    [0, 0, 0],
    [0.36, -0.8, 0.17],
    [0.82, -0.7, 0.09],
    [1, 0, 0],
    [0.82, 0.7, 0.09],
    [0.36, 0.8, 0.17],
  ];
  const vertices = ring.map(([u, v, bulge]) =>
    mesh.vertex(
      [
        insideGlass(p[0] + c * reach * u - s * v * width, 3.52),
        p[1] + u * rise + width * bulge,
        insideGlass(p[2] + s * reach * u + c * v * width, 1.37),
      ],
      unit(-c * rise * 2 - s * v * 0.013, Math.max(0.018, reach), -s * rise * 2 + c * v * 0.013),
      tint(color, 0.78 + 0.22 * u + 0.04 * v),
      motion + 0.02 * u,
    ),
  );
  mesh.tri(vertices[0], vertices[1], vertices[5]);
  mesh.quad(vertices[5], vertices[1], vertices[2], vertices[4]);
  mesh.tri(vertices[4], vertices[2], vertices[3]);
}

function stem(mesh: Mesh, x: number, z: number, h: number, bronze: number, random: Random) {
  const y = groundHeight(x, z) - 0.012,
    a = random() * tau;
  mesh.anchorY = y;
  const base = blend([0.2, 0.38, 0.19], [0.39, 0.3, 0.18], bronze);
  const tip = blend([0.43, 0.59, 0.237], [0.63, 0.399, 0.24], bronze);
  const joints = Math.round(9 + h * 4);
  let previous: number[] = [];
  for (let j = 0; j <= joints; j++) {
    const t = j / joints,
      radius = 0.01 * (1 - 0.62 * t);
    const p: Vec3 = [
      x + (0.05 + Math.cos(a) * 0.15) * h * t * t,
      y + h * t,
      z + Math.sin(a) * 0.13 * h * t * t,
    ];
    const color = blend(base, tip, t * t);
    const row = [];
    for (let i = 0; i < 3; i++) {
      const q = (i * tau) / 3,
        c = Math.cos(q),
        s = Math.sin(q);
      row.push(
        mesh.vertex(
          [insideGlass(p[0] + c * radius, 3.52), p[1], insideGlass(p[2] + s * radius, 1.37)],
          [c, 0, s],
          tint(color, 0.85),
          t * 0.65,
        ),
      );
    }
    if (j) {
      for (let i = 0; i < 3; i++) mesh.quad(previous[i], row[i], row[(i + 1) % 3], previous[(i + 1) % 3]);
      for (let k = 0; k < 3; k++) {
        const theta = a + j * 2.17 + (k * tau) / 3 + random() * 0.36;
        const reach = (0.2 - 0.078 * t) * (0.63 + random() * 0.6) * Math.min(1, h + 0.18);
        smallLeaf(
          mesh,
          p,
          theta,
          reach,
          0.03 + random() * 0.067,
          reach * (0.16 + random() * 0.07),
          tint(color, 0.88 + random() * 0.15),
          t * 0.65,
        );
      }
    }
    previous = row;
  }
}

// Creeping Monte Carlo forms cushions of tiny horizontal leaves along the bank.
function cover(x: number, z: number) {
  const patches =
    0.45 +
    0.15 * Math.sin(x * 3.8 + z * 5) +
    0.12 * Math.sin(x * 8 - z * 2.9) +
    0.1 * Math.cos(z * 8.2 + x * 4.6) +
    0.052 * Math.sin(x * 19.2 - z * 12.8);
  const border = Math.min(width - Math.abs(x), depth - Math.abs(z));
  return fade((bank(x, z) - 0.19) / 0.65) * fade((border - 0.035) / 0.073) * fade((patches - 0.245) / 0.34);
}
function carpetBed(mesh: Mesh, random: Random) {
  for (let i = 0; i < 8900; i++) {
    const x = (random() * 2 - 1) * (width - 0.075),
      z = (random() * 2 - 1) * (depth - 0.064);
    const d = cover(x, z);
    if (random() > d * 0.98 || nearRock(x, z, 0.79)) continue;
    const size = 0.028 + random() ** 1.5 * 0.043,
      angle = random() * tau;
    const green = blend([0.32, 0.46, 0.162], [0.55, 0.66, 0.297], random() * 0.8 + 0.13);
    const y = groundHeight(x, z) - 0.002,
      count = random() < 0.42 ? 2 : 3;
    mesh.anchorY = y;
    for (let k = 0; k < count; k++) {
      const a = angle + k * 2.55 + random() * 0.77;
      smallLeaf(
        mesh,
        [x, y, z],
        a,
        size * (0.82 + random() * 0.38),
        size * (0.41 + random() * 0.61),
        size * 0.42,
        green,
        0.025 * d,
      );
    }
  }
}

function vegetation(mesh: Mesh, random: Random) {
  // Background Vallisneria grows in runners that leave distinct gaps between stands.
  for (const [cx, cz, spread, height, count] of [
    [-2.79, -0.9, 0.61, 1.43, 24],
    [-1.65, -1.03, 0.5, 1.04, 20],
    [0.94, -1.06, 0.36, 0.79, 13],
    [2.76, -1.03, 0.61, 1.51, 26],
    [2.97, -0.13, 0.3, 0.84, 13],
    [-3.02, 0.13, 0.29, 0.65, 12],
  ]) {
    for (let k = 0; k < count; k++) {
      const a = random() * tau,
        r = Math.sqrt(random()),
        x = cx + spread * r * Math.cos(a);
      const z = cz + 0.28 * r * Math.sin(a);
      if (!nearRock(x, z, 0.81))
        rosette(mesh, x, z, height * (1 - 0.26 * r) * (0.72 + 0.38 * random()), "ribbon", random);
    }
  }
  for (const [cx, cz, spread, h, bronze, count] of [
    [-2.78, -0.51, 0.48, 1.25, 0.14, 32],
    [-1.39, -0.95, 0.57, 1.1, 0.08, 27],
    [-2.54, -0.2, 0.29, 0.69, 0.78, 14],
    [0.7, -0.99, 0.45, 0.87, 0.22, 19],
    [2.59, -0.68, 0.4, 1.19, 0.4, 29],
    [2.97, -0.19, 0.29, 0.83, 0.82, 16],
  ]) {
    for (let k = 0; k < count; k++) {
      const a = random() * tau,
        r = Math.sqrt(random());
      const x = cx + Math.cos(a) * spread * r,
        z = cz + Math.sin(a) * 0.285 * r;
      if (!nearRock(x, z, 0.77))
        stem(mesh, x, z, h * (1 - 0.28 * r) * (0.75 + 0.38 * random()), bronze, random);
    }
  }
  // Broader Cryptocoryne rosettes break up the scale between the stones and the small leaves.
  for (const [cx, cz, spread, scale] of [
    [-2.73, 0.33, 0.39, 0.41],
    [-1.36, 0.29, 0.29, 0.33],
    [-1.38, -0.53, 0.3, 0.48],
    [2.42, 0.33, 0.4, 0.47],
    [0.51, -0.51, 0.27, 0.38],
    [1.63, 0.65, 0.26, 0.31],
  ]) {
    for (let k = 0; k < 7; k++) {
      const x = cx + (random() * 2 - 1) * spread,
        z = cz + (random() * 2 - 1) * 0.23;
      if (!nearRock(x, z, 0.77)) rosette(mesh, x, z, scale * (0.76 + random() * 0.38), "sword", random);
    }
  }
  carpetBed(mesh, random);
}

export function buildHabitat() {
  const sand = new Mesh(),
    rock = new Mesh(),
    plants = new Mesh();
  const random = randomGenerator();
  substrate(sand, random);
  for (const b of stones) boulder(rock, b, b.h > 0.6 ? 37 : 25, b.h > 0.6 ? 20 : 13);
  // Weathered chips concentrate at the feet of the larger stones and at the path margin.
  for (let k = 0; k < 106; k++) {
    const x = (random() * 2 - 1) * (width - 0.12),
      z = mix(-0.95, depth - 0.12, random());
    if (nearRock(x, z, 0.85) || (bank(x, z) < 0.08 && random() < 0.85)) continue;
    const size = 0.033 + random() ** 2 * 0.105;
    boulder(
      rock,
      {
        x,
        z,
        rx: size,
        rz: size * 0.72,
        h: size * (0.53 + random() * 0.71),
        lean: -size * 0.18,
        seed: random() * 40,
      },
      8,
      3,
    );
  }
  vegetation(plants, random);
  return { sand, rock, plants };
}
