export type Vec3 = [number, number, number];

/** Interleaved position, normal, sRGB albedo, motion weight and assembly anchor height. */
export class Mesh {
  static readonly STRIDE = 11;
  readonly vertices: number[] = [];
  readonly indices: number[] = [];
  // Set once per rooted object so attached leaves and branches share its growth origin.
  anchorY = 0;

  vertex(position: Vec3, normal: Vec3, color: Vec3, motion = 0) {
    const index = this.vertices.length / Mesh.STRIDE;
    this.vertices.push(...position, ...normal, ...color, motion, this.anchorY);
    return index;
  }

  tri(a: number, b: number, c: number) {
    this.indices.push(a, b, c);
  }

  quad(a: number, b: number, c: number, d: number) {
    this.indices.push(a, b, c, a, c, d);
  }
}

function unit(x: number, y: number, z: number): Vec3 {
  const n = Math.hypot(x, y, z) || 1;
  return [x / n, y / n, z / n];
}

export function lookAt(eye: Vec3, target: Vec3) {
  const z = unit(eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]);
  const x = unit(z[2], 0, -z[0]);
  const y = [z[1] * x[2], z[2] * x[0] - z[0] * x[2], -z[1] * x[0]];
  const dot = (v: number[]) => v[0] * eye[0] + v[1] * eye[1] + v[2] * eye[2];
  return new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x),
    -dot(y),
    -dot(z),
    1,
  ]);
}

export function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
    }
  }
  return out;
}

export function perspective(fov: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fov / 2);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
}

export function orthographic(width: number, height: number, near: number, far: number) {
  return new Float32Array([
    2 / width,
    0,
    0,
    0,
    0,
    2 / height,
    0,
    0,
    0,
    0,
    -2 / (far - near),
    0,
    0,
    0,
    -(far + near) / (far - near),
    1,
  ]);
}
