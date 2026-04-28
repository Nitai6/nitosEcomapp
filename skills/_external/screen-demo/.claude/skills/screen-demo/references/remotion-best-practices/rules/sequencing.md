---
name: sequencing
description: Sequencing patterns for Remotion - delay and limit duration of items
metadata:
  tags: sequence, timing, delay
---

Use `<Sequence>` to control when an element appears in the timeline and for how long.

```tsx
import { Sequence } from "remotion";

const { fps } = useVideoConfig();

<Sequence from={1 * fps} durationInFrames={2 * fps}>
  <Title />
</Sequence>
<Sequence from={2 * fps} durationInFrames={2 * fps}>
  <Subtitle />
</Sequence>
```

This will by default wrap the component in an absolute fill element.
If the items should not be wrapped, use the `layout` prop:

```tsx
<Sequence layout="none">
  <Title />
</Sequence>
```

## Frame References Inside Sequences

Inside a Sequence, `useCurrentFrame()` returns the local frame (starting from 0):

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent />
  {/* Inside MyComponent, useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```
