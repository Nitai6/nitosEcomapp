---
name: video-creator
description: Create 3-second 3D animated videos featuring cute scenes with abstract shapes and playful motion or text animations with cute elements. Output as MP4 files at 1080x1920 resolution (portrait/vertical format for Stories/TikTok), 30fps, silent videos only. Use when the user asks to create a short animation, video clip, motion graphic, or cute animated scene.
---

# Cute 3D Animation Video Creator

Generate 3-second silent MP4 videos featuring cute 3D-style animated scenes with abstract shapes, playful motion, or text animations with cute elements.

**CRITICAL: The only deliverable is an MP4 video file. Never output PNG frames, screenshots, or image files. All intermediate artifacts must be temporary and cleaned up automatically. The user receives one .mp4 file and nothing else.**

## Specifications

- **Duration**: Exactly 3 seconds
- **Format**: MP4 (H.264)
- **Resolution**: 1080x1920 (portrait/vertical - optimized for Stories/TikTok)
- **Frame Rate**: 30fps (90 frames total)
- **Audio**: Silent only
- **Style**: 3D rendered animations with cute aesthetic
- **Color Palette**: Decide based on scene context - pastel for calm scenes, vibrant for energetic scenes

## Technical Approaches

### Approach 1: HTML/CSS/JS + Browser Capture (Preferred)

Create an HTML file with CSS animations and JavaScript timeline, then record directly to video using Playwright's built-in video recording (no intermediate PNG frames). This approach provides the most control over 3D-style rendering via Three.js or CSS 3D transforms.

**Structure of the HTML animation file:**

```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    /* scene styles */
  }
  /* CSS animations with @keyframes */
</style>
</head>
<body id="stage">
  <!-- Scene elements -->
<script>
  // Timeline-based animation control
  // Signal completion: window._animationDone = true after 3000ms
</script>
</body>
</html>
```

**For 3D scenes, embed Three.js via CDN:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

**Capture directly to MP4 using the bundled capture script (records video, no PNG frames):**
```bash
node scripts/capture-animation.js <path-to-animation.html> <output.mp4> [--width 1080] [--height 1920] [--duration 3]
```

### Approach 2: Python Direct-to-Video (Fallback)

Use Pillow for frame generation + ffmpeg piped directly to MP4 when browser capture is unavailable. Never save PNG frames to disk.

```bash
pip3 install Pillow numpy
```

```python
# Pipe frames directly to ffmpeg - no intermediate files
import subprocess
proc = subprocess.Popen([
    'ffmpeg', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
    '-s', '1080x1920', '-r', '30', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
    '-an', 'output.mp4'
], stdin=subprocess.PIPE)
for frame in generate_frames():  # yields PIL Images
    proc.stdin.write(frame.tobytes())
proc.stdin.close()
proc.wait()
```

### Approach 3: Manim (Mathematical/Motion Graphics)

Use Manim for smooth mathematical animations and motion graphics.

```bash
pip3 install manim
manim -ql --format mp4 --media_dir ./output scene.py CuteScene
```

## Workflow

### Step 1: Parse the Request

Determine the animation type:
- **Abstract shapes**: Bouncing spheres, rotating cubes, morphing shapes, floating geometric patterns
- **Text animations**: Bouncing letters, spinning text, text with cute companion objects (hearts, stars, sparkles)
- **Combination**: Text with animated shape elements

Select a color palette:
- **Pastel/Soft**: Calm, gentle, romantic, or dreamy scenes
- **Vibrant/Saturated**: Energetic, playful, exciting, or bold scenes
- **Gradient blends**: Dynamic or transitioning moods

### Step 2: Choose Technical Approach

| Scene Type | Recommended Approach |
|---|---|
| 3D objects with lighting/shadows | HTML + Three.js (Approach 1) |
| CSS-animatable 2D/2.5D elements | HTML + CSS 3D transforms (Approach 1) |
| Simple shape/text motion | HTML + CSS animations (Approach 1) |
| Mathematical patterns | Manim (Approach 3) |
| Pixel-art or raster effects | Python + Pillow (Approach 2) |

### Step 3: Create the Animation

Before building:
1. Verify prerequisites: `which ffmpeg && which node`
2. For Approach 1, verify Playwright: `npx playwright --version` (install if needed: `npx playwright install chromium`)

Animation principles to follow:
- Use easing functions (ease-in-out, cubic-bezier) - never linear motion
- Add anticipation and follow-through for organic feel
- Keep motion playful but not chaotic
- Use soft, rounded shapes for maximum cuteness
- Add subtle shadows and lighting for depth
- Apply gradients or soft colors rather than harsh flat tones

### Step 4: Render to MP4

**IMPORTANT: Output only MP4. Never leave PNG frames, screenshots, or intermediate image files. All approaches must produce a single .mp4 file directly.**

For HTML animations, use the bundled capture script (records video directly via Playwright):
```bash
node scripts/capture-animation.js animation.html output.mp4
```

For Python approach, pipe frames directly to ffmpeg (see Approach 2 example above).

Verify the output:
```bash
ffprobe -v error -show_entries stream=width,height,duration,r_frame_rate,codec_name -of default=noprint_wrappers=1 output.mp4
```

Expected: 1080x1920, ~3s duration, 30fps, h264 codec.

### Step 5: Present

Confirm the file exists and report the file path and size to the user.

## Error Handling

- If browser capture fails, fall back to Python frame-by-frame generation
- If file size exceeds 10MB, reduce scene complexity or add `-crf 28` to ffmpeg
- If ffmpeg is not installed, prompt the user to install it: `brew install ffmpeg`
- If Playwright is not installed: `npx playwright install chromium`
- Always verify the output file exists and has non-zero size before reporting success

## Example Scenes

### Bouncing Pastel Spheres
Soft-colored 3D spheres bouncing with squash-and-stretch in a gradient background. Use Three.js with MeshStandardMaterial, ambient light, and soft shadows.

### Floating Hearts Text
"Hello!" text with 3D bouncing letters, surrounded by floating heart shapes that drift upward. Use CSS 3D transforms with staggered animation delays per letter.

### Morphing Geometric Shapes
A cube smoothly morphs into a sphere, then into a star shape, each in a different pastel color. Use Three.js morph targets.

### Sparkle Burst
Particle system creating a burst of sparkles that form a heart shape, then dissolve. Use Three.js Points with custom shaders or HTML canvas particles.
