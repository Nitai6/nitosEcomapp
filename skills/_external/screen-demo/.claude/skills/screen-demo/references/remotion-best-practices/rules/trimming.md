---
name: trimming
description: Trimming patterns for Remotion - limit duration of items
metadata:
  tags: sequence, trim, clip, cut
---

## Trim the End

Use `durationInFrames` on a `<Sequence>` to unmount content after a specified duration:

```tsx
<Sequence durationInFrames={1.5 * fps}>
  <MyAnimation />
</Sequence>
```

The content plays for the specified number of frames, then the component unmounts.

## Trim the Beginning

A negative `from` value shifts time backwards, making the content start partway through:

```tsx
import { Sequence, useVideoConfig } from "remotion";

const { fps } = useVideoConfig();

<Sequence from={-0.5 * fps}>
  <MyAnimation />
</Sequence>;
```

Inside `<MyAnimation>`, `useCurrentFrame()` starts at 15 instead of 0 - the first 15 frames are trimmed off.
