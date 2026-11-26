import { lookAt, multiply, perspective, type Vec3 } from "./geometry";

// Fit the entire tank on resize. Scroll changes the contents of this frame only.
export function aquariumCamera(aspect: number) {
  const target: Vec3 = [0, 0.13, 0];
  const fov = 0.54;
  const yaw = 0.18;
  const pitch = 0.208;
  const distance = Math.max(3.88 / aspect, 2.27) / Math.tan(fov / 2) + 1.38;
  const eye: Vec3 = [
    Math.sin(yaw) * Math.cos(pitch) * distance,
    target[1] + Math.sin(pitch) * distance,
    Math.cos(yaw) * Math.cos(pitch) * distance,
  ];
  return { eye, vp: multiply(perspective(fov, aspect, 0.12, 112), lookAt(eye, target)) };
}
