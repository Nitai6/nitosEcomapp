import { spring, type SpringConfig } from "remotion";

export interface CameraKeyframe {
  timeMs: number;
  zoom: number;
  panX: number; // 0-100, horizontal focus point
  panY: number; // 0-100, vertical focus point
}

interface CameraState {
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Interpolate between camera keyframes using spring physics.
 *
 * For each frame, finds the two bracketing keyframes and uses
 * Remotion's spring() with durationInFrames to smoothly transition
 * between them. This produces Screen Studio-style continuous camera
 * movement instead of discrete per-clip zoom animations.
 */
export function interpolateKeyframes(
  frame: number,
  fps: number,
  keyframes: CameraKeyframe[],
  springCfg: Partial<SpringConfig>
): CameraState {
  if (keyframes.length === 0) {
    return { zoom: 1, panX: 50, panY: 50 };
  }

  const timeMs = (frame / fps) * 1000;

  // Before first keyframe
  if (timeMs <= keyframes[0].timeMs) {
    return pick(keyframes[0]);
  }

  // After last keyframe
  if (timeMs >= keyframes[keyframes.length - 1].timeMs) {
    return pick(keyframes[keyframes.length - 1]);
  }

  // Find bracketing keyframes
  let prevIdx = 0;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (keyframes[i].timeMs <= timeMs && keyframes[i + 1].timeMs > timeMs) {
      prevIdx = i;
      break;
    }
  }

  const prev = keyframes[prevIdx];
  const next = keyframes[prevIdx + 1];

  // Spring progress between the two keyframes
  const segStartFrame = Math.round((prev.timeMs / 1000) * fps);
  const segEndFrame = Math.round((next.timeMs / 1000) * fps);
  const segDuration = segEndFrame - segStartFrame;
  const localFrame = frame - segStartFrame;

  if (segDuration <= 0) return pick(next);

  const progress = spring({
    frame: localFrame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: segDuration,
    config: springCfg,
  });

  return {
    zoom: lerp(prev.zoom, next.zoom, progress),
    panX: lerp(prev.panX, next.panX, progress),
    panY: lerp(prev.panY, next.panY, progress),
  };
}

/**
 * Clamp pan values to prevent showing empty space at edges when zoomed in.
 * At zoom Z, the visible region is 1/Z of the total, so the center
 * can range from 50/Z to 100 - 50/Z.
 */
export function clampPan(
  panX: number,
  panY: number,
  zoom: number
): { panX: number; panY: number } {
  if (zoom <= 1) return { panX, panY };
  const minPan = 50 / zoom;
  const maxPan = 100 - 50 / zoom;
  return {
    panX: Math.max(minPan, Math.min(maxPan, panX)),
    panY: Math.max(minPan, Math.min(maxPan, panY)),
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function pick(kf: CameraKeyframe): CameraState {
  return { zoom: kf.zoom, panX: kf.panX, panY: kf.panY };
}
