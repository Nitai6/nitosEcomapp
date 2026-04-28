---
name: action-timing
description: Wait times, action pacing, and timing patterns for smooth recordings
metadata:
  tags: wait, timing, delay, pacing, smooth, recording
---

# Action Timing

Getting wait times right is the difference between a recording that feels natural and one that's either rushed (missed content) or sluggish (dead time that needs to be cut).

## Recommended Wait Times by Action

| Action | Wait (ms) | Notes |
|--------|-----------|-------|
| `navigate` | 2000-3000 | Longer for JS-heavy sites (Google: 3000, SPAs: 2000) |
| `click` (button/link) | 800-1500 | Longer if it triggers content loading |
| `click` (dropdown item) | 1000-1500 | Wait for dropdown to close and selection to register |
| `type` | 1000-1500 | Wait for autocomplete/validation to appear |
| `scroll` | 1500-2000 | Let the smooth scroll animation complete |
| `hover` | 800-1000 | Show the hover state before moving on |
| `press` (Enter) | 3000-5000 | If it triggers navigation or search |
| `press` (Escape) | 500-1000 | Quick dismiss |
| `evaluate` | 500-1000 | Depends on what the script does |
| `wait` | varies | Use for explicit pauses (page transitions, animations) |

## Timing Philosophy

**Keep wait times tight.** Excess wait time creates dead time in the recording that must be cut in post-production. It's better to have slightly short waits (worst case: the next action happens before content finishes loading, which still looks intentional at 4x playback speed) than excess dead time.

## The 4x Playback Factor

The final video plays at 4x speed. This means:
- A 1000ms wait in the recording becomes 250ms in the output
- A 5000ms wait becomes 1250ms
- Human perception at 4x speed is forgiving - minor timing issues are invisible

This means you can be aggressive with short waits. The recording doesn't need to look perfect at 1x - it needs to look smooth at 4x.

## Typing Delay

The `steel-browse.py` script types at 80ms per character. This is fast enough to be efficient but slow enough to be visible in the recording.

At 4x playback: 80ms becomes 20ms per character, which still looks like typing rather than instant text appearance.

## Cursor Movement Timing

Before each click/hover/type action, the cursor moves smoothly to the target element with a 300ms pause after arriving (before clicking). This makes the cursor movement visible in the recording.

```
[move cursor to element ~500ms] -> [pause 300ms] -> [click] -> [wait]
```

Total visible time per click: ~800ms of cursor movement + the wait time after.

## Pacing Multiple Actions

When chaining actions (like filling a form), maintain consistent pacing:

```json
{ "action": "type", "selector": "#name", "text": "John", "wait": 800 },
{ "action": "type", "selector": "#email", "text": "john@example.com", "wait": 800 },
{ "action": "click", "selector": "button[type='submit']", "wait": 2000 }
```

Same `wait` for similar actions creates a rhythm. Different `wait` for different action types breaks the rhythm naturally.

## Post-Navigation Wait

After any action that causes a full page navigation (clicking a link, submitting a form), use 3000-5000ms:

```json
{ "action": "click", "selector": "a.result-link", "wait": 4000, "label": "Click result - wait for page load" }
```

This is separate from the `navigate` action wait. Link clicks trigger browser navigation but the cursor overlay won't be re-injected automatically.

## End-of-Session Pause

Always add a 2000ms pause at the very end of the browse plan (or rely on the 2000ms pause built into `steel-browse.py` before browser close). This ensures the final action's visual result is captured in the recording.
