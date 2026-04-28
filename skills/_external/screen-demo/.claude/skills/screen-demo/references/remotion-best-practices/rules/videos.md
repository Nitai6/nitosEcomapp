---
name: videos
description: Embedding videos in Remotion - trimming, speed, and OffthreadVideo
metadata:
  tags: video, media, trim, speed, offthreadvideo
---

# Using videos in Remotion

## Prerequisites

The @remotion/media package needs to be installed:

```bash
bunx remotion add @remotion/media
```

## OffthreadVideo

Use `<OffthreadVideo>` for rendering. It extracts frames independently and is more reliable than `<Video>` during server-side rendering.

```tsx
import { OffthreadVideo } from "remotion";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <OffthreadVideo src={staticFile("video.mp4")} />;
};
```

Remote URLs are also supported:

```tsx
<OffthreadVideo src="https://example.com/video.mp4" />
```

## Trimming

Use `startFrom` to seek into the video at a specific frame. Use `endAt` to stop at a specific frame.

```tsx
const { fps } = useVideoConfig();

<OffthreadVideo
  src={staticFile("video.mp4")}
  startFrom={2 * fps} // Start from 2 seconds in
  endAt={10 * fps} // End at the 10 second mark
/>
```

Alternatively, `trimBefore` and `trimAfter` can be used for non-destructive trimming:

```tsx
<OffthreadVideo
  src={staticFile("video.mp4")}
  trimBefore={2 * fps}
  trimAfter={10 * fps}
/>
```

## Speed

Use `playbackRate` to change the playback speed:

```tsx
<OffthreadVideo src={staticFile("video.mp4")} playbackRate={2} /> {/* 2x speed */}
<OffthreadVideo src={staticFile("video.mp4")} playbackRate={0.5} /> {/* Half speed */}
```

Reverse playback is not supported.

## Sizing

Use the `style` prop to control size:

```tsx
<OffthreadVideo
  src={staticFile("video.mp4")}
  style={{
    width: 500,
    height: 300,
    objectFit: "cover",
  }}
/>
```
