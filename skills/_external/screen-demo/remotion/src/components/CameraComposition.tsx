import React from "react";
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  interpolateKeyframes,
  clampPan,
  type CameraKeyframe,
} from "../lib/springInterpolate";

export interface Segment {
  startMs: number;
  endMs: number;
}

export interface CameraConfig {
  fps: number;
  width: number;
  height: number;
  source: string;
  segments: Segment[];
  keyframes: CameraKeyframe[];
  playbackRate?: number;
  padding?: number;
  borderRadius?: number;
  outputGif?: boolean;
}

interface Props {
  cameraConfig: CameraConfig;
}

const SPRING_CONFIG = { damping: 28, stiffness: 60, mass: 0.8 };

/**
 * Continuous virtual camera composition.
 *
 * Replaces the old clip-based ScreenDemo + ZoomClip approach.
 * Instead of discrete clips with fade transitions, this renders
 * one continuous video with a spring-interpolated camera that
 * smoothly zooms and pans between keyframes.
 *
 * Segments define which parts of the source recording to include
 * (gaps are hard-cut, no fades). The camera moves continuously
 * across segment boundaries.
 */
export const CameraComposition: React.FC<Props> = ({ cameraConfig }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const padding = cameraConfig.padding ?? 64;
  const borderRadius = cameraConfig.borderRadius ?? 24;

  // Interpolate camera position from keyframes
  const raw = interpolateKeyframes(
    frame,
    fps,
    cameraConfig.keyframes,
    SPRING_CONFIG
  );

  // Clamp pan to prevent empty space at edges
  const { panX, panY } = clampPan(raw.panX, raw.panY, raw.zoom);
  const zoom = raw.zoom;

  // Video content dimensions (inside padding)
  const videoWidth = cameraConfig.width - 2 * padding;
  const videoHeight = cameraConfig.height - 2 * padding;

  // Translate so the focus point (panX%, panY%) is centered in viewport
  const focusX = (panX / 100) * videoWidth;
  const focusY = (panY / 100) * videoHeight;
  const translateX = videoWidth / 2 - focusX * zoom;
  const translateY = videoHeight / 2 - focusY * zoom;

  // Build segment timeline
  const rate = cameraConfig.playbackRate ?? 1;
  const msToFrames = (ms: number) => Math.round((ms / 1000) * fps);
  let cumulativeFrame = 0;
  const segmentEntries = cameraConfig.segments.map((seg) => {
    const sourceDurationMs = seg.endMs - seg.startMs;
    const outputDurationMs = sourceDurationMs / rate;
    const duration = msToFrames(outputDurationMs);
    const startFrame = cumulativeFrame;
    const seekFrame = msToFrames(seg.startMs);
    cumulativeFrame += duration;
    return { startFrame, duration, seekFrame };
  });

  return (
    <AbsoluteFill>
      {/* Static gradient background */}
      <Img
        src={staticFile("gradient.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
        }}
      />

      {/* Padded frame with chrome */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding,
          display: "flex",
        }}
      >
        <div
          style={{
            flex: 1,
            borderRadius,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            border: "2px solid rgba(180, 180, 180, 0.6)",
            position: "relative",
          }}
        >
          {/* Camera transform - moves every frame */}
          <div
            style={{
              width: videoWidth,
              height: videoHeight,
              transformOrigin: "0 0",
              transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {/* Source video segments laid out sequentially */}
            {segmentEntries.map(({ startFrame, duration, seekFrame }, i) => (
              <Sequence
                key={i}
                from={startFrame}
                durationInFrames={duration}
                layout="none"
              >
                <OffthreadVideo
                  src={staticFile(cameraConfig.source)}
                  startFrom={seekFrame}
                  playbackRate={rate}
                  style={{
                    width: videoWidth,
                    height: videoHeight,
                    objectFit: "cover",
                  }}
                />
              </Sequence>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
