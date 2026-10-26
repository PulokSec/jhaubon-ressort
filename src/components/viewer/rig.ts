import type { Pose } from "@/lib/spaces";

type V3 = [number, number, number];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/**
 * Orbits the camera around a target point. With a short distance this feels like
 * turning your head in a room; with a long one it feels like circling an object.
 * Pure math, no PlayCanvas types, so it can be unit-tested.
 */
export class CameraRig {
  target: V3 = [0, 0, 0];
  yaw = 0;
  pitch = 0;
  distance = 1;
  minDistance = 0.25;
  maxDistance = 10;
  private drift = false;

  private fly: { from: Pose; to: Pose; t: number; duration: number } | null = null;
  private idle = 0;

  setDrift(on: boolean) {
    this.drift = on;
  }

  setPose(pose: Pose) {
    this.fly = null;
    this.target = [...pose.target];
    const d: V3 = [
      pose.position[0] - pose.target[0],
      pose.position[1] - pose.target[1],
      pose.position[2] - pose.target[2],
    ];
    this.distance = Math.max(1e-3, Math.hypot(...d));
    this.yaw = Math.atan2(d[0], d[2]);
    this.pitch = Math.asin(clamp(d[1] / this.distance, -1, 1));
  }

  flyTo(pose: Pose, duration = 1.6) {
    if (duration <= 0) return this.setPose(pose);
    this.fly = { from: { position: this.position(), target: [...this.target] }, to: pose, t: 0, duration };
  }

  get flying() {
    return this.fly !== null;
  }

  position(): V3 {
    const c = Math.cos(this.pitch);
    return [
      this.target[0] + this.distance * c * Math.sin(this.yaw),
      this.target[1] + this.distance * Math.sin(this.pitch),
      this.target[2] + this.distance * c * Math.cos(this.yaw),
    ];
  }

  /** Drag in CSS pixels. Interrupts any fly-to. */
  rotate(dx: number, dy: number) {
    this.stopFly();
    this.idle = 0;
    this.yaw -= dx * 0.005;
    this.pitch = clamp(this.pitch + dy * 0.005, -1.3, 1.3);
  }

  /** factor > 1 moves away, < 1 moves closer. */
  zoom(factor: number) {
    this.stopFly();
    this.idle = 0;
    this.distance = clamp(this.distance * factor, this.minDistance, this.maxDistance);
  }

  private stopFly() {
    if (!this.fly) return;
    const p = this.position();
    this.fly = null;
    this.setPose({ position: p, target: this.target });
  }

  /** Returns the camera position and look-at target for this frame. */
  update(dt: number): Pose {
    if (this.fly) {
      this.fly.t = Math.min(1, this.fly.t + dt / this.fly.duration);
      const k = ease(this.fly.t);
      const pose = {
        position: lerp3(this.fly.from.position, this.fly.to.position, k),
        target: lerp3(this.fly.from.target, this.fly.to.target, k),
      };
      if (this.fly.t >= 1) this.setPose(this.fly.to);
      return pose;
    }
    this.idle += dt;
    if (this.drift && this.idle > 3) this.yaw += Math.sin(this.idle * 0.15) * dt * 0.04;
    return { position: this.position(), target: this.target };
  }
}
