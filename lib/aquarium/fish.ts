import { Mesh, type Vec3 } from "./geometry";

const TAU = Math.PI * 2;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// Each cross section gives x, vertical centre, height radius and thickness radius.
const sections = [
  [-0.33, 0.008, 0.026, 0.019],
  [-0.26, 0.009, 0.033, 0.025],
  [-0.16, 0.003, 0.07, 0.042],
  [-0.06, 0.0, 0.106, 0.061],
  [0.055, 0.0, 0.13, 0.076],
  [0.155, 0.003, 0.128, 0.077],
  [0.23, 0.01, 0.112, 0.07],
  [0.29, 0.013, 0.091, 0.064],
  [0.36, 0.014, 0.059, 0.046],
  [0.408, 0.014, 0.029, 0.026],
  [0.428, 0.016, 0.004, 0.004],
];

const tailWeight = (x: number) => Math.pow(clamp((0.22 - x) / 0.76, 0, 1), 1.75);
const latitudes = [-1, -0.91, -0.66, -0.36, -0.12, 0.075, 0.19, 0.36, 0.53, 0.77, 0.94, 1];

function pigment(x: number, latitude: number): Vec3 {
  // Iridophores form a narrow, continuous lateral band directly above the red flank.
  if (x < 0.27 && latitude > 0.075 && latitude < 0.36) {
    const glint = 0.5 + 0.5 * Math.cos((x + 0.05) * 8);
    return latitude < 0.19
      ? [0.08, 0.46 + glint * 0.13, 0.64 + glint * 0.13]
      : [0.22 + 0.07 * glint, 0.72 + glint * 0.13, 0.77 + glint * 0.1];
  }
  if (latitude < 0.075 && latitude > -0.86 && x < -0.015) {
    const glow = 1 - Math.abs(latitude + 0.26);
    const edge = clamp((x + 0.32) * 7, 0, 1);
    return [0.53 + 0.22 * glow + 0.095 * edge, 0.15 + 0.055 * glow, 0.18 + 0.05 * glow];
  }
  const shade = Math.pow((latitude + 1) / 2, 1.8);
  const silver = 0.044 * Math.cos((x - 0.03) * 8) * Math.max(0, latitude);
  return [mix(0.73, 0.32, shade) + silver, mix(0.77, 0.43, shade) + silver, mix(0.74, 0.43, shade) + silver];
}

function addBody(mesh: Mesh) {
  for (const side of [-1, 1]) {
    for (let i = 0; i < sections.length - 1; i++) {
      for (let j = 0; j < latitudes.length - 1; j++) {
        const color = pigment(
          (sections[i][0] + sections[i + 1][0]) / 2,
          (latitudes[j] + latitudes[j + 1]) / 2,
        );
        const vertex = (ring: number, level: number) => {
          const [x, y, height, depth] = sections[ring];
          const s = latitudes[level];
          const c = Math.sqrt(1 - s * s) * side;
          const prev = sections[Math.max(0, ring - 1)];
          const next = sections[Math.min(sections.length - 1, ring + 1)];
          const dy = next[1] - prev[1] + (next[2] - prev[2]) * s;
          const dz = (next[3] - prev[3]) * c;
          const ny = s / height;
          const nz = c / depth;
          const nx = -(dy * ny + dz * nz) / (next[0] - prev[0]);
          const length = Math.hypot(nx, ny, nz);
          return mesh.vertex(
            [x, y + s * height, c * depth],
            [nx / length, ny / length, nz / length],
            color,
            tailWeight(x),
          );
        };
        const a = vertex(i, j);
        const b = vertex(i + 1, j);
        const c = vertex(i + 1, j + 1);
        const d = vertex(i, j + 1);
        if (side > 0) mesh.quad(a, b, c, d);
        else mesh.quad(d, c, b, a);
      }
    }
  }
  for (const ring of [0, sections.length - 1]) {
    const [x, y, height, depth] = sections[ring];
    const direction = ring === 0 ? -1 : 1;
    const normal: Vec3 = [direction, 0, 0];
    const color = pigment(x, -0.1);
    const center = mesh.vertex([x, y, 0], normal, color, tailWeight(x));
    let old = mesh.vertex([x, y + height, 0], normal, color, tailWeight(x));
    for (let step = 1; step <= 16; step++) {
      const angle = (TAU * step) / 16;
      const next = mesh.vertex(
        [x, y + height * Math.cos(angle), depth * Math.sin(angle)],
        normal,
        color,
        tailWeight(x),
      );
      if (direction > 0) mesh.tri(center, old, next);
      else mesh.tri(center, next, old);
      old = next;
    }
  }
}

function addEye(mesh: Mesh, side: number) {
  const center: Vec3 = [0.289, 0.048, 0.063 * side];
  const outline: Vec3 = [0.24, 0.27, 0.22];
  const iris: Vec3 = [0.6, 0.63, 0.53];
  const pupil: Vec3 = [0.026, 0.051, 0.047];
  const rings: [number, number, Vec3][] = [
    [0.038, 0.001, outline],
    [0.034, 0.009, iris],
    [0.027, 0.012, iris],
    [0.026, 0.015, pupil],
    [0.0001, 0.022, pupil],
  ];
  const normal: Vec3 = [0.24, 0.18, 0.954 * side];
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < 10; i++) {
      const point = (k: number, angle: number) => {
        const [radius, rise] = rings[k];
        const dx = radius * Math.cos(angle);
        const dy = radius * Math.sin(angle);
        return mesh.vertex(
          [center[0] + dx, center[1] + dy, center[2] + (rise - 0.24 * dx - 0.18 * dy) * side],
          normal,
          rings[k][2],
        );
      };
      const a = point(r, (TAU * i) / 10);
      const b = point(r, (TAU * (i + 1)) / 10);
      const c = point(r + 1, (TAU * (i + 1)) / 10);
      const d = point(r + 1, (TAU * i) / 10);
      if (side > 0) mesh.quad(a, b, c, d);
      else mesh.quad(d, c, b, a);
    }
  }
}

function addFin(mesh: Mesh, root: Vec3, edges: Vec3[], normal: Vec3) {
  // Thin gaps between the distal rays transmit the colour of the water behind the fin.
  const membrane: Vec3 = [0.43, 0.54, 0.52];
  const ray: Vec3 = [0.54, 0.63, 0.6];
  const vertex = (p: Vec3, color: Vec3) => mesh.vertex(p, normal, color, tailWeight(p[0]));
  const between = (a: Vec3, b: Vec3, t: number): Vec3 => [
    mix(a[0], b[0], t),
    mix(a[1], b[1], t),
    mix(a[2], b[2], t),
  ];
  const origin = vertex(root, membrane);
  for (let segment = 1; segment < edges.length; segment++) {
    const from = edges[segment - 1];
    const to = edges[segment];
    for (let k = 0; k < 4; k++) {
      const edge0 = between(from, to, k / 4);
      const edge1 = between(from, to, (k + 1) / 4);
      const inner0 = vertex(between(root, edge0, 0.48), membrane);
      const inner1 = vertex(between(root, edge1, 0.48), membrane);
      const tip0 = vertex(edge0, ray);
      const tip1 = vertex(between(edge0, edge1, 0.35), membrane);
      mesh.tri(origin, inner0, inner1);
      mesh.quad(inner0, tip0, tip1, inner1);
      mesh.tri(inner1, inner0, origin);
      mesh.quad(inner1, tip1, tip0, inner0);
    }
  }
}

export function buildFish(): Mesh {
  const mesh = new Mesh();
  addBody(mesh);
  for (const side of [-1, 1]) {
    addEye(mesh, side);
    addFin(
      mesh,
      [0.17, -0.026, 0.068 * side],
      [
        [0.063, -0.06, 0.148 * side],
        [0.071, -0.081, 0.159 * side],
        [0.12, -0.073, 0.13 * side],
      ],
      [0.22, 0.88, side * 0.42],
    );
    addFin(
      mesh,
      [0.037, -0.099, 0.031 * side],
      [
        [-0.054, -0.17, 0.052 * side],
        [-0.018, -0.114, 0.043 * side],
      ],
      [0, 0.2, side * 0.98],
    );
  }
  addFin(
    mesh,
    [-0.298, 0.009, 0],
    [
      [-0.32, 0.042, 0.002],
      [-0.535, 0.141, 0.011],
      [-0.491, 0.071, 0.009],
      [-0.428, 0.007, 0.002],
      [-0.49, -0.065, 0.007],
      [-0.529, -0.119, 0.012],
      [-0.32, -0.024, 0.002],
    ],
    [0.02, 0.02, 1],
  );
  addFin(
    mesh,
    [0.047, 0.109, 0],
    [
      [0.071, 0.13, 0],
      [-0.008, 0.224, 0.006],
      [-0.046, 0.19, 0.005],
      [-0.089, 0.097, 0],
      [-0.117, 0.074, 0],
    ],
    [0, 0.05, 1],
  );
  addFin(
    mesh,
    [-0.093, -0.07, 0],
    [
      [-0.067, -0.098, 0],
      [-0.149, -0.155, 0.004],
      [-0.186, -0.098, 0.002],
      [-0.265, -0.038, 0],
    ],
    [0, -0.03, 1],
  );
  addFin(
    mesh,
    [-0.205, 0.045, 0],
    [
      [-0.235, 0.075, 0.001],
      [-0.266, 0.041, 0],
    ],
    [0, 0, 1],
  );
  return mesh;
}

// Arc-length lookup keeps the school spaced as the narrower ends of the circuit turn away from the glass.
const pathX = (a: number) => 2.6 * Math.sin(a) + 0.15 * Math.sin(3 * a);
const pathZ = (a: number) => 0.78 + 0.43 * Math.cos(a) - 0.06 * Math.cos(3 * a);
const arcSamples = 192;
const arcLengths = new Float64Array(arcSamples + 1);
for (let i = 1; i <= arcSamples; i++) {
  const a = (TAU * (i - 1)) / arcSamples;
  const b = (TAU * i) / arcSamples;
  arcLengths[i] = arcLengths[i - 1] + Math.hypot(pathX(b) - pathX(a), pathZ(b) - pathZ(a));
}
const circuit = arcLengths[arcSamples];

function pathAngle(distance: number) {
  const wrapped = ((distance % circuit) + circuit) % circuit;
  let lo = 0;
  let hi = arcSamples;
  while (hi - lo > 1) {
    const mid = (hi + lo) >> 1;
    if (arcLengths[mid] <= wrapped) lo = mid;
    else hi = mid;
  }
  return ((lo + (wrapped - arcLengths[lo]) / (arcLengths[hi] - arcLengths[lo])) * TAU) / arcSamples;
}

export interface FishPose {
  model: Float32Array;
  tailPhase: number;
  lag: number;
  elevation: number;
  lane: number;
  size: number;
  phase: number;
  beat: number;
  groupPhase: number;
}

// Offsets along, above and across the current. A smaller shoal circles on the far side of the planting.
const shoals = [
  {
    start: -0.54,
    phase: 0.02,
    positions: [
      [-1.19, -0.15, -0.14],
      [-0.81, 0.095, -0.055],
      [-0.43, -0.29, 0.065],
      [-0.26, 0.3, -0.16],
      [0.064, -0.046, 0.052],
      [0.48, 0.19, 0.018],
      [0.69, -0.21, -0.192],
      [1.24, 0.065, -0.088],
    ],
  },
  {
    start: circuit * 0.56,
    phase: 2.53,
    positions: [
      [-0.84, 0.28, -0.126],
      [-0.41, -0.035, 0.039],
      [-0.01, 0.42, -0.19],
      [0.355, 0.17, -0.088],
      [0.91, -0.124, -0.048],
    ],
  },
];

export function createSchool(): FishPose[] {
  let index = 0;
  const school = shoals.flatMap(({ start, phase: groupPhase, positions }) =>
    positions.map(([lag, elevation, lane]) => {
      const i = index++;
      const phase = i * 2.39996;
      return {
        model: new Float32Array(16),
        tailPhase: 0,
        phase,
        groupPhase,
        lag: start + lag,
        elevation,
        lane,
        size: 0.335 + 0.059 * Math.sin(phase + 1.13) + 0.017 * Math.cos(phase * 0.38),
        beat: 15.5 + 1.6 * Math.cos(phase),
      };
    }),
  );
  updateSchool(school, 0);
  return school;
}

export function updateSchool(school: FishPose[], time: number): void {
  const travelled = time * 0.56 + 0.18 * Math.sin(time * 0.45);
  const pace = 0.56 + 0.081 * Math.cos(time * 0.45);
  for (const fish of school) {
    const groupDrift = time * 0.31 + fish.groupPhase;
    const drift = time * 0.71 + fish.phase;
    const a = pathAngle(travelled + fish.lag + 0.2 * Math.sin(groupDrift) + 0.07 * Math.sin(drift));
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    const dx = 2.6 * cos + 0.45 * Math.cos(3 * a);
    const dz = -0.43 * sin + 0.18 * Math.sin(3 * a);
    const speed = Math.hypot(dx, dz);
    const angularSpeed = (pace + 0.062 * Math.cos(groupDrift) + 0.0497 * Math.cos(drift)) / speed;
    const rise = time * 0.63 + fish.phase;
    const height = 0.63 + fish.elevation + 0.089 * Math.sin(1.0 + 2 * a) + 0.044 * Math.sin(rise);
    // A lane follows the normal to the circuit, including at its ends, to preserve space during turns.
    const lanePhase = time * 0.5 + fish.phase;
    const lane = fish.lane + 0.017 * Math.sin(lanePhase);
    const laneSpeed = 0.0085 * Math.cos(lanePhase);
    const ddx = -2.6 * sin - 1.35 * Math.sin(3 * a);
    const ddz = -0.43 * cos + 0.54 * Math.cos(3 * a);
    const curvature = (dx * ddz - dz * ddx) / (speed * speed * speed);
    const laneAngularSpeed = (1 - curvature * lane) * angularSpeed;
    const vx = dx * laneAngularSpeed - (dz / speed) * laneSpeed;
    const vy = 0.178 * Math.cos(1.0 + 2 * a) * angularSpeed + 0.02772 * Math.cos(rise);
    const vz = dz * laneAngularSpeed + (dx / speed) * laneSpeed;
    const norm = Math.hypot(vx, vy, vz);
    const horizontal = Math.hypot(vx, vz);
    const fx = vx / norm,
      fy = vy / norm,
      fz = vz / norm;
    const zx = -vz / horizontal,
      zz = vx / horizontal;
    const ux = -zz * fy,
      uy = horizontal / norm,
      uz = zx * fy;
    const bank = -0.115 * Math.pow(sin, 6) + 0.021 * Math.sin(rise);
    const c = Math.cos(bank),
      s = Math.sin(bank);
    const size = fish.size,
      m = fish.model;
    m[0] = fx * size;
    m[1] = fy * size;
    m[2] = fz * size;
    m[4] = (ux * c + zx * s) * size;
    m[5] = uy * c * size;
    m[6] = (uz * c + zz * s) * size;
    m[8] = (zx * c - ux * s) * size;
    m[9] = -uy * s * size;
    m[10] = (zz * c - uz * s) * size;
    m[12] = pathX(a) - (dz / speed) * lane;
    m[13] = height;
    m[14] = pathZ(a) + (dx / speed) * lane;
    m[15] = 1;
    fish.tailPhase =
      fish.beat * time + fish.phase + 0.93 * Math.sin(time * 1.06 + fish.phase) + 0.7 * Math.sin(0.45 * time);
  }
}
