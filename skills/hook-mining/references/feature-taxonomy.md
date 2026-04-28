# Hook Feature Taxonomy

The exact value space for each feature. This Claude session is prompted with this taxonomy so output is consistent and joinable.

## Visual

| Path | Allowed values |
|---|---|
| `dominant_color` | red, orange, yellow, green, blue, purple, pink, brown, white, black, neutral_gray, beige |
| `palette_hex` | array of 3 hex strings |
| `indoor_outdoor` | indoor, outdoor, mixed, ambiguous |
| `person_present` | bool |
| `person_count` | 0,1,2,3,4+ |
| `person_gender` | female, male, mixed, unclear, na |
| `person_age_band` | <18, 18-24, 25-34, 35-44, 45+, unclear, na |
| `face_framing` | extreme_close, close_up, medium, wide, no_face |
| `text_overlay_present` | bool |
| `text_overlay_words` | int (0 if none) |
| `text_overlay_style` | yellow_bold_caps, white_bold_caps, white_thin, black_bold, hand_drawn, native_caption, none |
| `aesthetic` | ugc_handheld, studio_clean, cinematic, meme, animated, screen_recording, mixed |
| `props` | array of strings (free-form, max 5) |
| `lighting` | natural_window, ring_light, studio_softbox, sunlight, low_light, mixed, unclear |
| `background_clutter` | low, medium, high |

## Audio

| Path | Allowed values |
|---|---|
| `has_voice` | bool |
| `voice_gender` | female, male, multiple, na |
| `voice_pace_wpm` | int |
| `first_word` | string (lowercased) |
| `first_sentence` | string (raw) |
| `hook_delivery` | question, command, statement, story_lead, surprise, listicle_intro, na |
| `music_present` | bool |
| `music_genre` | lo-fi, pop, hip-hop, electronic, rock, ambient, classical, viral_trending, na |
| `music_energy` | low, medium, high, na |
| `sfx_present` | bool |
| `sfx_types` | array: whoosh, ding, pop, swipe, glitch, riser, na |

## Movement

| Path | Allowed values |
|---|---|
| `camera_motion` | static, handheld, pan, tilt, zoom_in, zoom_out, tracking, orbit, mixed |
| `cuts_in_first_3s` | int |
| `cuts_per_sec` | float (over hook duration) |
| `subject_motion` | low, medium, high |
| `transition_types` | array: jump_cut, whip_pan, match_cut, dissolve, zoom_punch, none |
| `gesture_present` | bool |
| `gesture_types` | array: point_at_camera, hand_reveal, thumbs_up, head_shake, head_nod, walking, dance, none |

## Hook duration

`hook_duration_sec` = time from t=0 until the "value reveal" — the moment the video's promise is delivered or the topic shifts from setup to content. This Claude session decides based on visual + audio cues. Bounded [0.5, 8.0].

## Note for the vision prompt

Always return all keys. Use `na` / `unclear` rather than omitting. Output strict JSON.
