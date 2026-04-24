---
name: templates-library
description: Reusable animation templates library - copy-paste patterns for common motion graphics effects
metadata:
  tags: templates, effects, animations, text, particles, glitch, wave
---

## Templates Library

A collection of 15 ready-to-use animation components in `src/templates/`.
When building a new animation, ALWAYS check if an existing template can be used as a starting point.
Copy the template, rename the component, and customize - don't build from scratch.

### When to use templates

Before writing any new animation, match the user's request against this table.
If a template matches even partially, start from that template and modify it.

| User wants... | Start from | Then customize... |
|---|---|---|
| Text appearing letter by letter | `animated-text.tsx` | Change text, timing, direction |
| Typewriter / typing effect | `typewriter-subtitle.tsx` | Change text, speed, cursor style |
| Text sliding in | `slide-text.tsx` | Change direction, easing, text |
| Bouncing title card | `bounce-text.tsx` | Change text, colors, subtitle |
| Glitch / distortion effect | `glitch-text.tsx` | Change intensity, colors, text |
| Pulsing / breathing text | `pulsing-text.tsx` | Change text, pulse speed, glow |
| Floating / hovering element | `floating-bubble-text.tsx` | Change content, float amplitude |
| Text in bubbles / circles | `bubble-pop-text.tsx` | Change text, colors, size |
| List / items appearing | `animated-list.tsx` | Change items, layout, stagger |
| Card flip / 3D rotation | `card-flip.tsx` | Change content, axis, speed |
| Particles / explosion | `particle-explosion.tsx` | Change count, colors, pattern |
| Matrix / falling text | `matrix-rain.tsx` | Change characters, colors, speed |
| Wave / liquid effect | `liquid-wave.tsx` | Change wave params, colors |
| Audio visualizer / bars | `sound-wave.tsx` | Change bar count, colors, motion |
| Geometric / abstract patterns | `geometric-patterns.tsx` | Change shapes, count, colors |

### Template source patterns

All templates follow these conventions:
- Default export as a React functional component
- Use `useCurrentFrame()` and `useVideoConfig()` for all animation
- NO CSS transitions or animation classes (Remotion-incompatible)
- Self-contained with no external dependencies

#### Pattern: Spring entrance (most templates)

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const scale = spring({
  frame: frame - delay,
  fps,
  from: 0,
  to: 1,
  config: { damping: 12, mass: 0.5 },
});
```

#### Pattern: Continuous oscillation (glitch, float, wave)

```tsx
const offset = Math.sin(frame / 10) * amplitude;
```

#### Pattern: Per-character stagger

```tsx
text.split("").map((char, i) => {
  const delay = i * 5; // 5 frames between each character
  const anim = spring({ frame: frame - delay, fps, ... });
  return <span style={{ transform: `...${anim}...` }}>{char}</span>;
});
```

#### Pattern: Particle system

```tsx
import { random } from "remotion";

const particles = Array.from({ length: COUNT }).map((_, i) => {
  const angle = (i / COUNT) * Math.PI * 2;
  const distance = spring({ frame, fps, ... });
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  return { x, y };
});
```

#### Pattern: Looping animation

```tsx
const cycleProgress = ((frame - delay) % cycleDuration) / cycleDuration;
const value = interpolate(cycleProgress, [0, 0.5, 1], [min, max, min]);
```

### How to integrate a template into a composition

1. Copy the template file or import the component directly
2. Remove the `"use client"` directive (not needed in Remotion)
3. Wrap in a `<Sequence>` for timing control
4. Add to `Root.tsx` as a `<Composition>`

```tsx
// In Root.tsx
import GlitchText from "./templates/glitch-text";

<Composition
  id="GlitchText"
  component={GlitchText}
  durationInFrames={90}
  fps={30}
  width={1920}
  height={1080}
/>
```

### Combining templates

Templates can be layered using `<AbsoluteFill>` and `<Sequence>`:

```tsx
<AbsoluteFill>
  <Sequence from={0} premountFor={fps}>
    <ParticleExplosion />
  </Sequence>
  <Sequence from={15} premountFor={fps} layout="none">
    <GlitchText />
  </Sequence>
</AbsoluteFill>
```
