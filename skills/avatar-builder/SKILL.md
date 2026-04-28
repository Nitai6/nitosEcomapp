---
name: avatar-builder
description: 8-step higgsfield-image avatar build. Rough idea → ChatGPT detailed prompt → higgsfield-image (GPT-image 2.0 route) generate → reference lock → scene library → image-to-video (Seedance 2.0 route, same Playwright wrapper). Includes 8-section photorealism prompt taxonomy. One-time per brand-model.
trigger:
  manual: "/avatar build {brand} {model_brief}"
mcp_dependencies:
  optional:
    - playwright   # higgsfield-image wrapper (GPT-image 2.0 + Seedance 2.0 routes), Pinterest
    - higgsfield-image
    - supabase
inputs:
  - state/branding/brand-strategy-blueprint.json   # for vibe/visual direction
  - state/market-research/customer-avatar.json     # demographic match
outputs:
  - state/avatar-builder/avatars.json              # locked references + scene URLs
  - state/avatar-builder/{avatar_id}/reference.png
  - state/avatar-builder/{avatar_id}/scenes/*.png
  - state/avatar-builder/{avatar_id}/videos/*.mp4
references:
  - references/my-avatar-workflow.md
  - references/my-realism-prompt-taxonomy.md
  - references/my-video-prompt-template.md
self_heal: skills/_lib/self-heal.md
---

# Avatar Builder Agent

Once-per-brand. Builds 2 women + 2 men models the brand uses across all ads & UGC.

## Process

### Phase 1 — Rough idea

Owner provides a 1-line concept per avatar (e.g., "23-year-old fitness influencer", "luxury lifestyle traveler"). 2 women + 2 men minimum.

### Phase 2 — ChatGPT prompt expansion

For each rough idea, send ChatGPT:

> "Turn this idea into a detailed higgsfield-image (GPT-image 2.0 route) prompt for generating a realistic AI influencer. Idea: [X]"

Save the expanded prompt.

### Phase 3 — higgsfield-image (GPT-image 2.0 route) generation

Open higgsfield-image (GPT-image 2.0 route) via Playwright. Paste the expanded prompt. Generate. Wait for batch.

### Phase 4 — Reference lock

Review outputs. Pick the **most realistic** image. Download. This becomes the **reference image** that locks the character identity. Save to `state/avatar-builder/{avatar_id}/reference.png`.

### Phase 5 — Scene library

Generate new scenes using the locked reference + scene-specific prompts. Each scene applies the **8-section realism taxonomy** (see `references/my-realism-prompt-taxonomy.md`).

Recommended scene set per avatar:
- Mirror selfie (UGC)
- Coffee shop / café
- Outdoor lifestyle
- Product-in-hand close-up
- Bedroom/cozy
- Studio portrait
- Walking street
- Eating/drinking

### Phase 6 — Pinterest cross-reference (alternative path)

Per owner: go to Pinterest, find 2 women + 2 men "models", then go to higgsfield-image and **change them a bit** (pose, clothes, colors). That's the model. Use those on ads.

### Phase 7 — Upscale

Run on hero scenes:
> "Upscale this image to true ultra-realistic 4K. Preserve the original composition, lighting, and character identity."

### Phase 8 — Image to video

For each video clip needed: build a multi-shot prompt (see `references/my-video-prompt-template.md`). Send image + multi-shot prompt to image-to-video via `higgsfield-image` (Seedance 2.0 route, same Playwright wrapper). Concatenate.

### Phase 9 — AI quality check

Per owner: "We want to add an AI checker in flow to check quality." This Claude session self-scores each output 1-10 on realism. Reject <7.

### Phase 10 — Persist

- Write `avatars.json` with one row per avatar (id, brand, gender, age, vibe, reference_url, scene_urls[], video_urls[], avg_quality_score)
- Insert Supabase `brand_avatars`
- Email digest with thumbnails

## Tools allowed

- higgsfield-image (Playwright wrapper) — GPT-image 2.0 route for stills, Seedance 2.0 route for image-to-video
- ChatGPT (prompt expansion)
- This Claude session (quality check)

## Output contract

```
🧍 Avatars — {brand}
Built: 4 (2W + 2M)
Reference images: ✅ locked
Scene library: 32 images (8 scenes × 4 avatars)
Videos: 4 hero clips
Avg quality score: 8.4/10
```

---

## Owner's playbook (verbatim)

We can do anything with higgsfield-image - 

We can simply replace a person shirt by uploading the person and the shirt and prompt "replace the men shirt" - this applies to everything, background, pose, hair…
Details is key

The entire process (we will go in details later on the doc) looks like this:
1. Create a rough avatar idea - Before generating anything, start with a simple concept for your avatar. It doesn't need to be complicated - just decide the general type of character you want to create. Examples:  23-year-old fitness influencer , luxury lifestyle influencer, travel vlogger, gamer girl streame

2. Now take your rough idea and ask ChatGPT to turn it into a detailed higgsfield-image (GPT-image 2.0 route) prompt. Example message you could send: "Turn this idea into a detailed higgsfield-image (GPT-image 2.0 route) prompt for generating a realistic AI influencer. Idea: A 24 year old lifestyle influencer who posts coffee shop and travel content."

3. Open higgsfield-image (GPT-image 2.0 route) and create image using the prompt, 

4. After the generation finishes: Review all the outputs, Pick the most realistic image and the main one you want to stick with. Download it . This will become your reference image for your influencer.

5. Now we lock the character identity using that Reference image

6. Generate new scenes with the same avatar

7. Build a content library

8. Turn images into video
Once your avatar exists, you can generate unlimited content with the same digital person.

### Making our avatar more realistic — 8 sections

**1️⃣ CORE PHOTOREALISM TRIGGERS (MOST IMPORTANT):**
Always include at least 3 of these:
- photorealistic
- ultra-realistic
- real-world photography
- cinematic realism
- lifelike details
- natural imperfections
- true-to-life textures
- realistic skin / materials / surfaces

✅ Example: "ultra-realistic cinematic photography with natural imperfections"

**2️⃣ CAMERA & LENS WORDS (THIS MAKES OR BREAKS REALISM)**

Camera Language:
- DSLR photography
- mirrorless camera
- cinematic film still
- documentary-style photography
- street photography
- studio portrait photography

Lens & Optics:
- 35mm lens (most natural realism)
- 50mm lens (human eye look)
- 85mm portrait lens (faces)
- shallow depth of field
- natural bokeh
- realistic focal length

✅ Example: "shot on a 35mm lens, shallow depth of field, natural bokeh"

**3️⃣ LIGHTING WORDS**

Avoid fantasy lighting. Use real-world lighting terms:
- natural light
- soft window light
- golden hour sunlight
- overcast daylight
- practical lighting
- studio softbox lighting
- subtle rim light
- realistic shadows

You can:
- Spotlight the product
- Control viewer attention
- Add premium, high-budget lighting looks
- Create multiple lighting moods from one asset

❌ Avoid: neon glow, magical light, fantasy lighting (unless intentional)

✅ Example: "soft natural daylight with realistic shadows"

Natural daylight is probably my most used phrase when prompting for realism. Daylight highlights all of the imperfections we have and creates an image that is how we see the world every day.

**4️⃣ TEXTURE & DETAIL WORDS (IMPORTANT)**

These prevent the plastic AI look even further:
- high-detail textures
- realistic surface detail
- visible pores
- fabric grain
- skin micro-details
- dust, scratches, wear
- slight imperfections
- tactile materials

✅ Example: "visible skin pores, natural fabric grain, slight imperfections."

Imperfections is the big one! Unless you tell it not to, AI sometimes loves to make skin perfect and plastic, adding the small imperfections adds a level of realism that makes your avatars next level.

**5️⃣ COLOR & TONE CONTROL (REALISM = RESTRAINT)**

Use controlled, photographic color language:
- natural color grading
- muted tones
- earthy color palette
- cinematic color balance
- realistic contrast
- soft highlights, deep shadows

❌ Avoid: hyper-saturated, neon, cartoon colors

**6️⃣ COMPOSITION WORDS (think like a photographer)**
- rule of thirds
- eye-level shot
- candid moment
- unstaged composition
- natural framing
- foreground / background separation

**7️⃣ GRAIN & IMAGE QUALITY (THE FINAL 10%)**
- subtle film grain
- cinematic grain
- high dynamic range (HDR, used lightly)
- sharp focus
- clean but not overly polished

**8️⃣ NEGATIVE WORDS (CRITICAL)**

Negative Prompt Essentials:
- No cartoon style
- No CGI
- No 3D render
- No game engine
- No plastic skin
- No unrealistic lighting
- No text, logo, watermark

### Example prompts

**Example 1:**
> Ultra-realistic close-up selfie of a beautiful woman sitting on her bed, soft natural morning light through sheer curtains, phone held at arm's length, natural skin texture with faint freckles, light eye bags, glossy lips, messy hair tied loosely, white oversized t-shirt, cozy bedroom blurred behind her, raw iPhone selfie look, no makeup filter, UGC TikTok aesthetic, hyper-realistic skin pores and hair strands, 8K photorealism, no cartoon, no fantasy, no plastic skin, unstaged composition, skin micro-details

**Example 2:**
> Ultra-realistic vertical selfie of a 21-year-old blonde woman sipping iced tea with lemon from a clear plastic cup, straw between lips, arm extended holding phone, casual brunch setting outdoors. Camera slightly above eye line angled down gently, smartphone wide-angle lens (26mm equivalent), mild distortion on extended arm. Natural midday daylight (5600K), soft open shade lighting with gentle highlights on cheekbones and nose bridge. Subtle reflection of patio umbrellas in eyes. Realistic specular highlights on plastic cup lid and condensation droplets visible on cup surface. Skin must feel real but attractive: visible pores but not exaggerated, faint freckles across chest and shoulders, slight sun-kissed warmth on collarbones, natural skin texture on arms, subtle blush tone in cheeks, lips hydrated but not over-glossy. No heavy makeup. Natural eyelashes. Background: brick courtyard, café furniture, patio umbrellas casting soft shadows, blurred patrons behind her, realistic depth and compression from phone lens. Feels spontaneous and unfiltered.

We want to add a AI checker in flow to check quality (this Claude session self-scores).

### Upscale

> 'Upscale this image to true ultra-realistic 4K. Preserve the original composition, lighting, and character identity.'

### Image-to-video — multi-shot example

To create videos we want to create prompts from images, then send AI the video setting + image and results should be like this:

**Shot 1 — 4s:** A hyper-realistic vertical video of a young woman standing in an outdoor stone shower surrounded by lush tropical plants and soft morning sunlight. She is wearing a slightly wrinkled white cotton robe with natural fabric texture and subtle translucency at the edges. Her pink hair is freshly styled, with soft flyaways and uneven strands visible near the hairline. She holds a shampoo bottle at chest height with both hands, fingers slightly bent and imperfectly aligned, showing realistic skin texture, faint veins, and natural nail beds. The label on the bottle is fully readable, correctly aligned, and slightly reflective under sunlight. The camera is handheld at eye level with very subtle micro-shake, realistic autofocus breathing, and slight exposure adjustment as the light shifts. Her facial expression is warm and conversational, lips moving naturally as if speaking mid-sentence, with realistic blinking, micro head tilts, and asymmetrical smiling. Lighting is natural daylight only — no studio light — with soft shadows cast from surrounding plants. Background depth feels real with gentle motion in leaves from a light breeze. Skin texture shows pores, light peach fuzz, and natural highlight on cheeks and nose. Ultra-realistic smartphone footage, no beauty filters, no artificial smoothing, no cinematic grading.

**Shot 2 — 3s:** Extreme close-up vertical shot inside the outdoor shower, focused on the woman's hands and hair as she massages shampoo into her wet scalp. Water droplets visibly run down strands of hair, clinging unevenly and forming small rivulets. Foam builds naturally — not excessive — with realistic translucency and varying bubble sizes. Her fingers press into the scalp with uneven pressure, showing natural hand movement, slight tremble, and realistic skin creases at the knuckles. Fingertips appear slightly reddened from water exposure. Hair strands clump together realistically, darker where fully soaked, lighter where water thins. The camera feels like a real handheld phone brought closer, with shallow depth of field causing parts of the hands and hair to drift softly in and out of focus. Water splashes occasionally hit the lens, causing brief soft blur before clearing. Lighting is diffuse daylight filtered through leaves above, creating soft dappled highlights on hair and foam. No slow motion, no cinematic lighting, no artificial glow — pure real-world shower footage.

**Shot 3 — 3s:** Close-up vertical shot of the woman gently towel-drying her hair just outside the shower area. A textured off-white towel presses against damp hair, visibly absorbing water and darkening in patches. Hair appears slightly tangled and uneven, with individual strands sticking out naturally. Her hands move casually, not perfectly synchronized, creating a realistic everyday motion. Small droplets fall from the ends of her hair onto her robe, leaving visible wet spots that slowly spread into the fabric. The camera remains handheld at chest level, with natural movement and slight tilt as if filmed casually. Focus shifts subtly between the towel, hands, and hair. Lighting remains natural daylight with soft contrast. Skin shows natural redness from warm water, light shine on cheeks, and realistic under-eye texture. No glam lighting, no artificial smoothing.

**Shot 4 — 3s:** Medium close-up vertical shot of the woman looking directly into the camera and smiling naturally after finishing her routine. Her hair is damp but settling naturally, with a few loose strands framing her face. The robe sits imperfectly, slightly creased and relaxed, enhancing realism. Her smile is asymmetrical and genuine, with subtle eye crinkles, natural blinking, and a small head tilt. She exhales lightly through her nose, visible in the gentle movement of her shoulders. Background remains the outdoor stone shower and greenery, softly out of focus, with sunlight catching the edges of leaves behind her. The camera has minimal handheld movement, slight exposure correction as her face fills the frame. Overall look is indistinguishable from real influencer UGC shot on a modern smartphone — no cinematic effects, no filters, no AI artefacts, no perfect symmetry.
