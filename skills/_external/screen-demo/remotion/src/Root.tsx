import React from "react";
import { Composition } from "remotion";
import {
  CameraComposition,
  type CameraConfig,
} from "./components/CameraComposition";

type CompositionProps = {
  cameraConfig: CameraConfig;
};

const defaultConfig: CameraConfig = {
  fps: 60,
  width: 1920,
  height: 1080,
  source: "recording.mp4",
  segments: [{ startMs: 0, endMs: 5000 }],
  keyframes: [{ timeMs: 0, zoom: 1.0, panX: 50, panY: 50 }],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ScreenDemo"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={CameraComposition as React.FC<any>}
      durationInFrames={300}
      fps={60}
      width={1920}
      height={1080}
      defaultProps={{ cameraConfig: defaultConfig }}
      calculateMetadata={({ props }) => {
        const { cameraConfig } = props as CompositionProps;
        const fps = cameraConfig.fps;
        const rate = cameraConfig.playbackRate ?? 1;

        const totalSourceMs = cameraConfig.segments.reduce(
          (sum: number, seg: { startMs: number; endMs: number }) =>
            sum + (seg.endMs - seg.startMs),
          0
        );
        const totalOutputMs = totalSourceMs / rate;
        const durationInFrames = Math.max(
          1,
          Math.round((totalOutputMs / 1000) * fps)
        );

        return {
          durationInFrames,
          fps,
          width: cameraConfig.width,
          height: cameraConfig.height,
        };
      }}
    />
  );
};
