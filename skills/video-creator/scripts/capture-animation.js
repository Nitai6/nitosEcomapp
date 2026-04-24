#!/usr/bin/env node
/**
 * Captures an HTML animation directly as an MP4 video using Playwright's
 * built-in video recording. No intermediate PNG frames.
 *
 * Usage:
 *   node capture-animation.js <input.html> <output.mp4> [options]
 *
 * Options:
 *   --width    Frame width in pixels (default: 1080)
 *   --height   Frame height in pixels (default: 1920)
 *   --duration Duration in seconds (default: 3)
 *
 * Prerequisites:
 *   - Node.js
 *   - npx playwright install chromium
 *   - ffmpeg (for re-encoding to exact specs if needed)
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    width: 1080,
    height: 1920,
    duration: 3,
    input: null,
    output: null,
  };

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[++i];
      if (key in opts) opts[key] = Number(val);
    } else {
      positional.push(args[i]);
    }
  }

  opts.input = positional[0];
  opts.output = positional[1];

  if (!opts.input || !opts.output) {
    console.error('Usage: capture-animation.js <input.html> <output.mp4> [--width N] [--height N] [--duration N]');
    process.exit(1);
  }

  return opts;
}

async function main() {
  const opts = parseArgs();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'animation-video-'));
  const inputPath = path.resolve(opts.input);
  const outputPath = path.resolve(opts.output);

  console.log(`Recording ${opts.duration}s video at ${opts.width}x${opts.height}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: opts.width, height: opts.height },
    recordVideo: {
      dir: tmpDir,
      size: { width: opts.width, height: opts.height },
    },
  });

  const page = await context.newPage();
  await page.goto(`file://${inputPath}`, { waitUntil: 'domcontentloaded' });

  // Wait for the animation duration
  console.log(`Recording for ${opts.duration} seconds...`);
  await page.waitForTimeout(opts.duration * 1000);

  // Close context to finalize the video file
  await context.close();
  await browser.close();

  // Find the recorded webm file
  const files = fs.readdirSync(tmpDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (!videoFile) {
    console.error('Error: No video file was recorded');
    process.exit(1);
  }

  const rawVideoPath = path.join(tmpDir, videoFile);

  // Re-encode to MP4 H.264 at exact specs: 30fps, yuv420p
  console.log(`Encoding to MP4: ${outputPath}`);
  execSync([
    'ffmpeg', '-y',
    '-i', `"${rawVideoPath}"`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-crf', '18',
    '-preset', 'medium',
    '-an',
    '-t', String(opts.duration),
    `"${outputPath}"`,
  ].join(' '), { stdio: 'inherit' });

  // Clean up temp directory
  fs.rmSync(tmpDir, { recursive: true, force: true });

  // Verify output
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`Done! Output: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error('Error: Output file was not created');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Capture failed:', err.message);
  process.exit(1);
});
