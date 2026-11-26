import { Mesh, type Vec3 } from "./geometry";

const halfWidth = 3.6;
const halfDepth = 1.42;
const floor = -1.45;
const rim = 1.65;
const waterline = 1.53;
const pane = 0.042;

function tint(color: Vec3, amount: number): Vec3 {
  return [color[0] * amount, color[1] * amount, color[2] * amount];
}

function face(mesh: Mesh, a: Vec3, b: Vec3, c: Vec3, d: Vec3, normal: Vec3, color: Vec3) {
  mesh.quad(
    mesh.vertex(a, normal, color),
    mesh.vertex(b, normal, color),
    mesh.vertex(c, normal, color),
    mesh.vertex(d, normal, color),
  );
}

// A rounded rectangle with a second, much smaller bevel where the edge meets the top.
function slab(mesh: Mesh, center: Vec3, size: Vec3, radius: number, bevel: number, color: Vec3) {
  const [x, y, z] = center;
  const [width, height, depth] = size;
  const corners = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  const profile = [
    { level: -height / 2, inset: bevel, tilt: -0.86 },
    { level: -height / 2 + bevel, inset: 0, tilt: -0.24 },
    { level: height / 2 - bevel, inset: 0, tilt: 0.24 },
    { level: height / 2, inset: bevel, tilt: 0.86 },
  ];
  const rings: number[][] = [];
  for (const { level, inset, tilt } of profile) {
    const ring = [];
    for (let corner = 0; corner < 4; corner++) {
      for (let segment = 0; segment <= 4; segment++) {
        const angle = ((corner + segment / 4) * Math.PI) / 2;
        const nx = Math.cos(angle),
          nz = Math.sin(angle);
        const side = Math.sqrt(1 - tilt * tilt);
        ring.push(
          mesh.vertex(
            [
              x + corners[corner][0] * (width / 2 - radius) + (radius - inset) * nx,
              y + level,
              z + corners[corner][1] * (depth / 2 - radius) + (radius - inset) * nz,
            ],
            [nx * side, tilt, nz * side],
            color,
          ),
        );
      }
    }
    rings.push(ring);
  }
  const base = mesh.vertex([x, y - height / 2, z], [0, -1, 0], color);
  const cap = mesh.vertex([x, y + height / 2, z], [0, 1, 0], color);
  for (let i = 0; i < rings[0].length; i++) {
    const next = (i + 1) % rings[0].length;
    for (let k = 1; k < rings.length; k++) {
      mesh.quad(rings[k - 1][i], rings[k][i], rings[k][next], rings[k - 1][next]);
    }
    mesh.tri(base, rings[0][i], rings[0][next]);
    mesh.tri(cap, rings[3][next], rings[3][i]);
  }
}

function lightArm(mesh: Mesh, x: number, lightY: number, metal: Vec3, charcoal: Vec3) {
  const rear = -halfDepth - pane - 0.049;
  const arm: Vec3 = [0.34, 0.38, 0.37];
  // The two jaws straddle the real rear pane. The bridge clears its polished top edge.
  slab(mesh, [x, rim - 0.056, -halfDepth + 0.018], [0.135, 0.146, 0.036], 0.016, 0.005, charcoal);
  slab(mesh, [x, rim - 0.035, rear], [0.145, 0.21, 0.1], 0.02, 0.007, metal);
  slab(mesh, [x, rim + 0.025, -halfDepth - 0.039], [0.145, 0.04, 0.15], 0.018, 0.005, metal);
  slab(mesh, [x, rim + 0.079, rear], [0.085, 0.036, 0.085], 0.033, 0.005, charcoal);

  const radius = 0.023,
    bend = 0.105;
  const path: [number, number][] = [[rim + 0.075, rear]];
  for (let i = 0; i <= 8; i++) {
    const angle = (i * Math.PI) / 16;
    path.push([lightY - bend + bend * Math.sin(angle), rear + bend * (1 - Math.cos(angle))]);
  }
  path.push([lightY, -0.225]);
  let previous: number[] = [];
  for (let i = 0; i < path.length; i++) {
    const [y, z] = path[i],
      a = path[Math.max(0, i - 1)],
      b = path[Math.min(path.length - 1, i + 1)];
    const dy = b[0] - a[0],
      dz = b[1] - a[1];
    const length = Math.hypot(dy, dz);
    const ring: number[] = [];
    for (let j = 0; j < 10; j++) {
      const angle = (2 * Math.PI * j) / 10;
      const s = Math.sin(angle);
      const normal: Vec3 = [Math.cos(angle), (s * dz) / length, (-s * dy) / length];
      ring.push(
        mesh.vertex([x + radius * normal[0], y + radius * normal[1], z + radius * normal[2]], normal, arm),
      );
    }
    if (i > 0) {
      for (let j = 0; j < ring.length; j++) {
        const next = (j + 1) % ring.length;
        mesh.quad(previous[j], previous[next], ring[next], ring[j]);
      }
    }
    previous = ring;
  }
  slab(mesh, [x, lightY, -0.248], [0.098, 0.068, 0.086], 0.022, 0.008, metal);
}

function pendant(fixture: Mesh, led: Mesh) {
  const metal: Vec3 = [0.28, 0.32, 0.32];
  const charcoal: Vec3 = [0.125, 0.155, 0.155];
  const light: Vec3 = [0.94, 1, 0.92];
  const y = 2.13;
  slab(fixture, [0, y, 0], [6.04, 0.095, 0.48], 0.075, 0.016, metal);
  slab(fixture, [0, y - 0.052, 0], [5.97, 0.035, 0.455], 0.06, 0.007, charcoal);
  for (const z of [-0.15, 0, 0.15]) {
    slab(led, [0, y - 0.073, z], [5.8, 0.015, 0.07], 0.025, 0.004, light);
  }
  // On a high camera angle only the lower bevel of the diffuser catches the eye.
  slab(led, [0, y - 0.051, 0.232], [5.72, 0.012, 0.018], 0.008, 0.003, tint(light, 0.9));
  for (let i = -3; i <= 3; i++) {
    slab(fixture, [0, y + 0.056, i * 0.049], [5.87, 0.023, 0.017], 0.007, 0.003, metal);
  }
  for (const x of [-2.36, 2.36]) lightArm(fixture, x, y + 0.008, metal, charcoal);
}

function base(plinth: Mesh) {
  const wood: Vec3 = [0.29, 0.205, 0.145];
  const felt: Vec3 = [0.095, 0.107, 0.101];
  slab(plinth, [0, -1.716, 0], [7.24, 0.102, 2.88], 0.07, 0.015, felt);
  slab(plinth, [0, -1.591, 0], [7.48, 0.17, 3.08], 0.082, 0.027, wood);
  slab(plinth, [0, -1.498, 0], [7.31, 0.024, 2.96], 0.045, 0.006, felt);

  // Short longitudinal fibers follow the face of the plank, stopping inside its bevels.
  const grain: Vec3 = [0.238, 0.168, 0.124];
  for (let i = 0; i < 26; i++) {
    const seed = (k: number) => {
      const n = Math.sin(i * 27.89 + k * 14.47) * 31669.17;
      return n - Math.floor(n);
    };
    const start = -3.58 + 6.38 * seed(1);
    const width = Math.min(3.57 - start, 0.34 + seed(2) * 1.34);
    const y = -1.636 + seed(3) * 0.091;
    const z = 1.5407;
    let prevA = 0,
      prevB = 0;
    for (let j = 0; j <= 8; j++) {
      const t = j / 8,
        x = start + width * t;
      const bend = Math.sin(t * 6 + i) * 0.0025;
      const thickness = Math.sin(t * Math.PI) * (0.0015 + 0.0018 * seed(4));
      const a = plinth.vertex([x, y + bend, z], [0, 0, 1], grain);
      const b = plinth.vertex([x, y + bend + thickness, z], [0, 0, 1], grain);
      if (j > 0) plinth.quad(prevA, a, b, prevB);
      prevA = a;
      prevB = b;
    }
  }
}

function backPanel(mesh: Mesh) {
  const rows = 12,
    columns = 20;
  let previous: number[] = [];
  for (let row = 0; row <= rows; row++) {
    const y = row / rows;
    const line: number[] = [];
    for (let col = 0; col <= columns; col++) {
      const x = col / columns;
      // Frosted glass picks up the broad central pool of light from the pendant.
      const pool = Math.exp(-(((x - 0.47) / 0.54) ** 2 + ((y - 0.97) / 0.7) ** 2));
      const c: Vec3 = [
        0.1 + 0.32 * pool + 0.03 * y,
        0.23 + 0.38 * pool + 0.035 * y,
        0.24 + 0.34 * pool + 0.03 * y,
      ];
      line.push(
        mesh.vertex([(x * 2 - 1) * halfWidth, floor + y * (rim - floor), -halfDepth - 0.016], [0, 0, 1], c),
      );
      if (row && col) mesh.quad(previous[col - 1], previous[col], line[col], line[col - 1]);
    }
    previous = line;
  }
  face(
    mesh,
    [-halfWidth, floor - 0.004, -halfDepth],
    [-halfWidth, floor - 0.004, halfDepth],
    [halfWidth, floor - 0.004, halfDepth],
    [halfWidth, floor - 0.004, -halfDepth],
    [0, 1, 0],
    [0.29, 0.39, 0.35],
  );
}

function glazing(seams: Mesh, far: Mesh, near: Mesh) {
  const thickness: Vec3 = [0.32, 0.48, 0.43];
  const cutEdge: Vec3 = [0.5, 0.66, 0.6];
  const clear: Vec3 = [0.6, 0.79, 0.77];
  const bottom = floor - pane,
    width = halfWidth + pane,
    depth = halfDepth + pane;
  for (const sign of [-1, 1]) {
    const z = sign * depth;
    const strip = sign * halfDepth;
    face(
      seams,
      [-width, rim, strip],
      [-width, rim, z],
      [width, rim, z],
      [width, rim, strip],
      [0, 1, 0],
      cutEdge,
    );
    face(
      seams,
      [-width, bottom, z],
      [width, bottom, z],
      [width, floor, z],
      [-width, floor, z],
      [0, 0, sign],
      thickness,
    );
    face(
      sign < 0 ? far : near,
      [-width, floor, z],
      [width, floor, z],
      [width, rim, z],
      [-width, rim, z],
      [0, 0, sign],
      clear,
    );
    for (const x of [-width + 0.005, width - 0.005]) {
      face(
        seams,
        [x - 0.005, floor, z],
        [x + 0.005, floor, z],
        [x + 0.005, rim, z],
        [x - 0.005, rim, z],
        [0, 0, sign],
        tint(thickness, 0.86),
      );
    }
  }
  for (const sign of [-1, 1]) {
    const x = sign * width,
      strip = sign * halfWidth;
    face(
      seams,
      [strip, rim, -halfDepth],
      [strip, rim, halfDepth],
      [x, rim, halfDepth],
      [x, rim, -halfDepth],
      [0, 1, 0],
      thickness,
    );
    face(
      seams,
      [x, bottom, -depth],
      [x, bottom, depth],
      [x, floor, depth],
      [x, floor, -depth],
      [sign, 0, 0],
      thickness,
    );
    face(
      sign < 0 ? far : near,
      [x, floor, -depth],
      [x, floor, depth],
      [x, rim, depth],
      [x, rim, -depth],
      [sign, 0, 0],
      clear,
    );
  }
}

function liquid(water: Mesh, meniscus: Mesh) {
  const across = 64,
    deep = 26;
  const color: Vec3 = [0.5, 0.75, 0.7];
  const edge: Vec3 = [0.62, 0.82, 0.75];
  let last: number[] = [];
  for (let zi = 0; zi <= deep; zi++) {
    const z = ((2 * zi) / deep - 1) * halfDepth;
    const line: number[] = [];
    for (let xi = 0; xi <= across; xi++) {
      const x = ((2 * xi) / across - 1) * halfWidth;
      line.push(water.vertex([x, waterline, z], [0, 1, 0], color));
      if (xi && zi) water.quad(last[xi - 1], line[xi - 1], line[xi], last[xi]);
    }
    last = line;
  }
  // Water rises fractionally against the pane. Tessellation keeps this line in step with the ripples.
  for (const sign of [-1, 1]) {
    const z = halfDepth * sign,
      x = halfWidth * sign;
    for (let i = 0; i < across; i++) {
      const a = halfWidth * ((2 * i) / across - 1),
        b = a + (2 * halfWidth) / across;
      face(
        meniscus,
        [a, waterline, z - sign * 0.022],
        [a, waterline + 0.011, z],
        [b, waterline + 0.011, z],
        [b, waterline, z - sign * 0.022],
        [0, 0.85, -sign * 0.527],
        edge,
      );
    }
    for (let i = 0; i < deep; i++) {
      const a = halfDepth * ((2 * i) / deep - 1),
        b = a + (2 * halfDepth) / deep;
      face(
        meniscus,
        [x - sign * 0.022, waterline, a],
        [x, waterline + 0.011, a],
        [x, waterline + 0.011, b],
        [x - sign * 0.022, waterline, b],
        [-sign * 0.527, 0.85, 0],
        edge,
      );
    }
  }
}

export function buildTank() {
  const fixture = new Mesh(),
    led = new Mesh(),
    plinth = new Mesh(),
    backing = new Mesh();
  const seams = new Mesh(),
    glassFar = new Mesh(),
    glassNear = new Mesh();
  const water = new Mesh(),
    meniscus = new Mesh();
  pendant(fixture, led);
  base(plinth);
  backPanel(backing);
  glazing(seams, glassFar, glassNear);
  liquid(water, meniscus);
  return { fixture, led, plinth, backing, seams, glassFar, glassNear, water, meniscus };
}
