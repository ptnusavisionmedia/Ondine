import { Mesh, type Vec3 } from "./geometry";
import { groundHeight } from "./habitat";

// Control points follow the centre of a limb; the last coordinate is its local radius.
type Joint = [number, number, number, number];

const tau = Math.PI * 2;
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const difference = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const unit = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};

function pointOnLimb(joints: Joint[], t: number): Vec3 {
  const i = Math.min(joints.length - 2, Math.floor(t));
  const u = t - i,
    u2 = u * u,
    u3 = u2 * u;
  const a = joints[Math.max(0, i - 1)],
    b = joints[i];
  const c = joints[i + 1],
    d = joints[Math.min(joints.length - 1, i + 2)];
  function coord(k: number) {
    return (
      (2 * b[k] +
        (c[k] - a[k]) * u +
        (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u2 +
        (3 * b[k] - 3 * c[k] + d[k] - a[k]) * u3) *
      0.5
    );
  }
  return [coord(0), coord(1), coord(2)];
}

function addLimb(mesh: Mesh, joints: Joint[], seed: number, snapped = false) {
  const maxRadius = Math.max(...joints.map((p) => p[3]));
  const sides = maxRadius > 0.15 ? 42 : maxRadius > 0.075 ? 29 : 12;
  const steps = (joints.length - 1) * 5;
  const shell: Vec3[][] = [],
    tones: Vec3[][] = [];
  const grainTurn = (t: number) => 0.18 * Math.sin(t * 0.62 + seed) + 0.055 * t;
  let previousV: Vec3 = [0, 0, 1];

  for (let row = 0; row <= steps; row++) {
    const t = row / 5;
    const center = pointOnLimb(joints, t);
    const tangent = unit(
      difference(
        pointOnLimb(joints, Math.min(t + 0.025, joints.length - 1)),
        pointOnLimb(joints, Math.max(t - 0.025, 0)),
      ),
    );
    // Transport the previous ring along the spline, avoiding a seam at vertical tangents.
    const axisU = unit(cross(previousV, tangent));
    const axisV = unit(cross(tangent, axisU));
    previousV = axisV;
    const i = Math.min(Math.floor(t), joints.length - 2);
    const rawRadius = joints[i][3] + (joints[i + 1][3] - joints[i][3]) * (t - i);
    // The exposed upper arms have weathered down to harder central heartwood.
    const exposure = Math.min(1, Math.max(0, (center[1] + 0.5) * 1.3));
    const radius = rawRadius * (1 - 0.31 * exposure) * (1 + 0.045 * Math.sin(3.5 * t + seed));
    const line: Vec3[] = [],
      colors: Vec3[] = [];
    for (let j = 0; j < sides; j++) {
      const angle = (tau * j) / sides;
      const fibre = angle + grainTurn(t);
      const ridge =
        Math.cos(3 * fibre + seed + 0.17 * Math.sin(t)) * 0.57 +
        Math.sin(5 * fibre - seed) * 0.27 +
        Math.cos(2 * fibre - seed * 0.82) * 0.16;
      const channel = Math.cos(4 * fibre + 0.8 * Math.sin(fibre - seed) + seed);
      const cleft = Math.pow(Math.max(0, channel), 6);
      const split = Math.pow(Math.max(0, Math.cos(7 * fibre - seed)), 9);
      const breadth = radius * (0.98 + 0.23 * ridge - 0.28 * cleft - 0.08 * split);
      const u = breadth * Math.cos(angle),
        v = breadth * Math.sin(angle) * (0.69 + 0.1 * Math.cos(t * 0.8 + seed));
      const fracture = snapped && row === steps ? radius * (0.76 * ridge + 0.35 * Math.sin(angle * 2)) : 0;
      line.push([
        center[0] + axisU[0] * u + axisV[0] * v + tangent[0] * fracture,
        center[1] + axisU[1] * u + axisV[1] * v + tangent[1] * fracture,
        center[2] + axisU[2] * u + axisV[2] * v + tangent[2] * fracture,
      ]);
      const highWood = Math.max(0, ridge - 0.12) * (0.8 + 0.2 * Math.sin(t * 1.2 - seed));
      const wetGrain =
        -0.127 * cleft -
        0.042 * split +
        0.018 * Math.sin(9 * fibre + seed) +
        0.015 * Math.cos(seed + t * 1.2);
      colors.push([
        0.346 + highWood * 0.152 + wetGrain,
        0.219 + highWood * 0.135 + wetGrain * 0.75,
        0.138 + highWood * 0.1 + wetGrain * 0.45,
      ]);
    }
    shell.push(line);
    tones.push(colors);
  }

  const rings = shell.map((line, row) =>
    Array.from({ length: sides + 1 }, (_, seamIndex) => {
      const j = seamIndex % sides;
      const around = difference(line[(j + 1) % sides], line[(j + sides - 1) % sides]);
      const along = difference(shell[Math.min(steps, row + 1)][j], shell[Math.max(0, row - 1)][j]);
      // Duplicate the seam so that fine longitudinal striations interpolate around the circumference.
      const fibre = seamIndex / sides + grainTurn(row / 5) / tau;
      return mesh.vertex(line[j], unit(cross(around, along)), tones[row][j], fibre);
    }),
  );
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < sides; j++) {
      const k = j + 1;
      mesh.quad(rings[i][j], rings[i][k], rings[i + 1][k], rings[i + 1][j]);
    }
  }
  // A split end exposes lighter irregular heartwood across the grain.
  const end = pointOnLimb(joints, joints.length - 1);
  const normal = unit(difference(end, pointOnLimb(joints, joints.length - 1.04)));
  const tone: Vec3 = snapped ? [0.475, 0.345, 0.238] : [0.315, 0.21, 0.15];
  const center = mesh.vertex(end, normal, tone);
  const edges = shell[steps].map((point, j) => {
    const shade = 0.03 * Math.sin(j * 3.2 + seed);
    return mesh.vertex(point, normal, [tone[0] + shade, tone[1] + shade, tone[2] + shade]);
  });
  for (let j = 0; j < sides; j++) mesh.tri(center, edges[j], edges[(j + 1) % sides]);
}

const buried = (x: number, z: number, radius: number): Joint => [
  x,
  groundHeight(x, z) - radius * 0.55,
  z,
  radius,
];

export function buildWood(): Mesh {
  const mesh = new Mesh();
  const foot = buried(2.38, -0.62, 0.31);
  mesh.anchorY = foot[1];
  const fork: Joint = [1.95, -0.17, -0.52, 0.21];
  const elbow: Joint = [1.35, 0.7, -0.68, 0.145];
  const crook: Joint = [0.48, 0.63, -0.44, 0.078];
  const lateral: Joint = [1.76, 0.1, 0.22, 0.112];
  const branch = (...points: Joint[]) => points;
  const limbs: Joint[][] = [
    // The long arm climbs behind the main stone then reaches across the open water.
    branch(
      foot,
      [2.26, -0.49, -0.58, 0.29],
      fork,
      [1.75, 0.32, -0.64, 0.16],
      elbow,
      [0.97, 0.74, -0.56, 0.121],
      crook,
      [0.22, 0.77, -0.64, 0.052],
      [-0.09, 0.91, -0.68, 0.036],
      [-0.43, 0.88, -0.53, 0.029],
      [-0.59, 0.91, -0.41, 0.023],
      [-0.68, 0.99, -0.39, 0.017],
      [-0.94, 1.02, -0.48, 0.012],
      [-1.11, 1.11, -0.52, 0.004],
    ),
    branch(
      [1.98, -0.2, -0.53, 0.158],
      [1.92, 0.03, -0.17, 0.141],
      lateral,
      [1.51, -0.02, 0.38, 0.089],
      [1.28, -0.12, 0.48, 0.065],
      [1.16, -0.28, 0.56, 0.047],
      [0.89, -0.32, 0.59, 0.031],
      [0.73, -0.43, 0.56, 0.022],
      [0.47, -0.5, 0.67, 0.006],
    ),
    branch(
      [1.37, 0.68, -0.68, 0.093],
      [1.35, 0.83, -0.71, 0.086],
      [1.36, 0.95, -0.74, 0.067],
      [1.23, 1.03, -0.87, 0.052],
      [1.13, 1.02, -0.91, 0.042],
      [1.02, 1.09, -1.02, 0.032],
      [0.9, 1.12, -1.04, 0.022],
    ),
    branch(
      [0.53, 0.64, -0.44, 0.061],
      [0.32, 0.68, -0.31, 0.057],
      [0.04, 0.6, -0.16, 0.042],
      [-0.24, 0.55, -0.05, 0.026],
      [-0.5, 0.63, 0.12, 0.005],
    ),
    branch([-0.08, 0.9, -0.67, 0.029], [-0.22, 1.07, -0.79, 0.024], [-0.38, 1.19, -0.89, 0.004]),
    branch(
      [2.2, -0.48, -0.57, 0.15],
      [2.34, -0.17, -0.79, 0.114],
      [2.54, -0.02, -0.83, 0.073],
      [2.72, 0.23, -0.85, 0.042],
      [2.73, 0.48, -0.99, 0.009],
    ),
    branch([2.5, -0.04, -0.83, 0.052], [2.75, 0.01, -0.79, 0.042], [2.99, 0.18, -0.72, 0.009]),
    branch(
      [1.35, 0.94, -0.74, 0.035],
      [1.48, 0.99, -0.68, 0.021],
      [1.57, 1.12, -0.64, 0.015],
      [1.57, 1.25, -0.52, 0.006],
    ),
    branch(
      [1.16, -0.28, 0.56, 0.039],
      [1.13, -0.42, 0.62, 0.031],
      [0.94, -0.6, 0.7, 0.023],
      [0.91, -0.73, 0.72, 0.016],
      [0.86, -0.81, 0.75, 0.006],
    ),
    branch(
      [2.27, -0.51, -0.58, 0.18],
      [2.43, -0.6, -0.29, 0.13],
      [2.47, -0.71, 0.03, 0.1],
      [2.56, -0.82, 0.38, 0.069],
      buried(2.91, 0.74, 0.03),
    ),
    branch(
      [2.3, -0.55, -0.61, 0.145],
      [2.67, -0.65, -0.56, 0.128],
      [2.96, -0.69, -0.35, 0.087],
      buried(3.32, -0.27, 0.038),
    ),
    branch(
      [2.24, -0.54, -0.56, 0.151],
      [2.03, -0.67, -0.28, 0.123],
      [1.81, -0.68, 0.04, 0.1],
      [1.52, -0.85, 0.28, 0.062],
      buried(1.17, 0.35, 0.027),
    ),
    branch([1.79, -0.7, 0.04, 0.068], [1.75, -0.8, 0.39, 0.053], buried(1.79, 0.75, 0.03)),
  ];
  limbs.forEach((points, i) => addLimb(mesh, points, 1.8 + i * 2.38, i === 2));
  // Shorter rootlets split along the prevailing direction, catching water in slender irregular forks.
  // Sample the parent centreline so the joint remains embedded even when a spline curves away in depth.
  const rootlet = (limb: number, t: number, radius: number, offsets: Joint[], snapped = false) => {
    const p = pointOnLimb(limbs[limb], t);
    const points: Joint[] = [
      [...p, radius],
      ...offsets.map(([x, y, z, r]): Joint => [p[0] + x, p[1] + y, p[2] + z, r]),
    ];
    addLimb(mesh, points, 5.19 + limb + t, snapped);
  };
  rootlet(0, 9.1, 0.019, [
    [-0.12, -0.045, 0.08, 0.015],
    [-0.2, -0.11, 0.14, 0.012],
    [-0.42, -0.15, 0.19, 0.004],
  ]);
  rootlet(
    0,
    5.3,
    0.043,
    [
      [-0.1, 0.09, 0.02, 0.039],
      [-0.22, 0.12, -0.01, 0.035],
      [-0.33, 0.18, 0.02, 0.023],
    ],
    true,
  );
  rootlet(1, 3.4, 0.053, [
    [-0.14, 0.025, 0.12, 0.046],
    [-0.26, 0.072, 0.17, 0.031],
    [-0.42, 0.019, 0.28, 0.025],
    [-0.59, 0.015, 0.32, 0.017],
    [-0.74, -0.09, 0.43, 0.005],
  ]);
  rootlet(1, 6.3, 0.021, [
    [-0.08, 0.017, -0.08, 0.013],
    [-0.15, 0.009, -0.14, 0.009],
    [-0.21, 0.055, -0.24, 0.003],
  ]);
  rootlet(2, 3.4, 0.027, [
    [-0.055, 0.09, -0.05, 0.02],
    [-0.057, 0.16, -0.09, 0.012],
    [-0.1, 0.23, -0.11, 0.003],
  ]);
  rootlet(3, 2.1, 0.031, [
    [-0.11, -0.095, 0.13, 0.018],
    [-0.25, -0.22, 0.16, 0.012],
    [-0.45, -0.265, 0.18, 0.003],
  ]);
  rootlet(
    5,
    2.8,
    0.033,
    [
      [0.1, 0.105, 0.08, 0.027],
      [0.13, 0.19, 0.11, 0.02],
      [0.24, 0.28, 0.19, 0.012],
    ],
    true,
  );
  addLimb(
    mesh,
    branch([2.1, -0.31, -0.58, 0.124], [2.11, -0.09, -0.69, 0.094], [2.04, 0.08, -0.82, 0.057]),
    6.2,
    true,
  );
  addLimb(
    mesh,
    branch([0.96, 0.74, -0.56, 0.074], [0.77, 0.72, -0.4, 0.054], [0.62, 0.69, -0.32, 0.034]),
    3.3,
    true,
  );
  return mesh;
}
