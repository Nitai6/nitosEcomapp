#!/usr/bin/env node
/**
 * Remotion Render Bridge
 *
 * Takes a camera config JSON + source recording and renders a polished
 * demo video using Remotion's programmatic API.
 *
 * Usage:
 *   node remotion/render.mjs <camera-config.json> <source-video.mp4> <output.mp4>
 *
 * The camera config defines segments (trimming), keyframes (zoom/pan),
 * and the source video path. The source is copied into remotion/public/
 * for Remotion to access via staticFile().
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, copyFileSync, readFileSync, mkdirSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REMOTION_DIR = __dirname;

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error(
      "Usage: node remotion/render.mjs <camera-config.json> <source-video.mp4> <output.mp4>"
    );
    process.exit(1);
  }

  const [configPath, sourcePath, outputPath] = args;

  // Validate inputs
  if (!existsSync(configPath)) {
    console.error(`Error: Config not found: ${configPath}`);
    process.exit(1);
  }
  if (!existsSync(sourcePath)) {
    console.error(`Error: Source video not found: ${sourcePath}`);
    process.exit(1);
  }

  // Load camera config
  const cameraConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  console.log(
    `Loaded config: ${cameraConfig.segments.length} segments, ${cameraConfig.keyframes.length} keyframes, ${cameraConfig.fps}fps, ${cameraConfig.width}x${cameraConfig.height}`
  );

  // Copy source video to remotion/public/
  const publicDir = resolve(REMOTION_DIR, "public");
  mkdirSync(publicDir, { recursive: true });
  const sourceFilename = cameraConfig.source || "recording.mp4";
  const destPath = resolve(publicDir, sourceFilename);
  console.log(`Copying source video to ${destPath}...`);
  copyFileSync(resolve(sourcePath), destPath);

  // Bundle the Remotion project
  console.log("Bundling Remotion project...");
  const entryPoint = resolve(REMOTION_DIR, "src", "index.ts");
  const bundleLocation = await bundle({
    entryPoint,
    publicDir,
  });
  console.log("Bundle complete.");

  // Select the composition with our config as inputProps
  const inputProps = { cameraConfig };
  console.log("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ScreenDemo",
    inputProps,
  });
  console.log(
    `Composition: ${composition.durationInFrames} frames @ ${composition.fps}fps (${(composition.durationInFrames / composition.fps).toFixed(1)}s)`
  );

  // Render
  const resolvedOutput = resolve(outputPath);
  console.log(`Rendering to ${resolvedOutput}...`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: resolvedOutput,
    inputProps,
    chromiumOptions: {
      enableMultiProcessOnLinux: true,
    },
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) {
        process.stderr.write(`\r  Rendering: ${pct}%`);
      }
    },
  });

  console.log(`\nDone - saved to ${resolvedOutput}`);

  // GIF conversion (optional)
  if (cameraConfig.outputGif) {
    const gifPath = resolvedOutput.replace(/\.mp4$/, ".gif");
    console.log(`Converting to GIF: ${gifPath}...`);
    try {
      execSync(
        `ffmpeg -y -i "${resolvedOutput}" -vf "fps=15,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}"`,
        { stdio: ["pipe", "pipe", "pipe"], timeout: 300000 }
      );
      const sizeMb = (statSync(gifPath).size / (1024 * 1024)).toFixed(1);
      console.log(`GIF saved: ${gifPath} (${sizeMb} MB)`);
    } catch (err) {
      console.error(`GIF conversion failed: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("Render failed:", err.message);
  process.exit(1);
});
