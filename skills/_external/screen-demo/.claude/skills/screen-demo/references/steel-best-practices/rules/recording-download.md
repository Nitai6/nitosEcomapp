---
name: recording-download
description: Downloading Steel session recordings via HLS endpoint and ffmpeg
metadata:
  tags: recording, hls, ffmpeg, download, mp4, retry
---

# Recording Download

Steel recordings are delivered via HLS (HTTP Live Streaming). Use ffmpeg to convert to MP4.

## HLS Endpoint

```
GET https://api.steel.dev/v1/sessions/{session_id}/hls
Header: steel-api-key: YOUR_KEY
```

Returns an M3U8 playlist. The recording becomes available 5-30 seconds after session release.

## ffmpeg Download

```bash
ffmpeg -y \
  -headers "steel-api-key: YOUR_KEY\r\n" \
  -i "https://api.steel.dev/v1/sessions/{session_id}/hls" \
  -c copy \
  -movflags +faststart \
  output.mp4
```

Key flags:
- `-y` - Overwrite output without asking
- `-headers` - Pass the API key for authentication (note the `\r\n` terminator)
- `-c copy` - Copy streams without re-encoding (fast)
- `-movflags +faststart` - Move metadata to the front for web playback

## Retry Logic

The HLS endpoint returns errors until processing is complete. Implement retry with backoff:

```python
for attempt in range(6):
    wait_secs = 5 * (attempt + 1)  # 5, 10, 15, 20, 25, 30
    time.sleep(wait_secs)

    # Check if playlist is ready
    response = requests.get(hls_url, headers={"steel-api-key": api_key})
    if "#EXTM3U" in response.text:
        # Ready - download with ffmpeg
        break
```

Total retry window: up to ~105 seconds (5+10+15+20+25+30). Most recordings are ready within 15 seconds.

## Verifying the Download

After ffmpeg completes, verify:
1. File exists and has non-zero size
2. ffmpeg return code is 0

```python
if result.returncode == 0 and os.path.exists(output_path):
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Recording saved: {output_path} ({size_mb:.1f} MB)")
```

## Recording Properties

- **Framerate:** 25fps (WebRTC capture rate)
- **Resolution:** Matches the viewport size (typically 1920x1080)
- **Format:** H.264 video in HLS container, converted to MP4
- **Audio:** No audio is recorded (browser sessions are silent)

## Session Viewer URL

The `session.session_viewer_url` provides an alternative way to view recordings:
- During the session: live view of the browser
- After release: replay of the recorded session
- Can be shared with others (no API key needed to view)
- Useful as a fallback if HLS download fails

## Troubleshooting

**HLS returns 404 after all retries:** The recording may have failed to process. Use the viewer URL as a fallback - the user can screen-record it manually.

**ffmpeg fails with "Protocol not found":** Ensure ffmpeg was compiled with HTTPS support. Homebrew's ffmpeg includes this by default (`brew install ffmpeg`).

**Downloaded MP4 has no video / very short:** The session may have ended before any meaningful browsing occurred. Check that the browse plan has enough `wait` time for pages to load.

**Large file size:** Steel records at the full viewport resolution. A 30-second session at 1920x1080 typically produces a 5-15MB MP4. Longer sessions scale linearly.
