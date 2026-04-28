# Owner's Multi-Shot Video Prompt Template (verbatim example)

Image-to-video pipeline: build a multi-shot prompt from the locked image. Per owner: "We want to create prompts from images, then send AI the video setting + image."

## Shot anatomy (per shot)

Each shot block must contain:
1. **Duration** (e.g., 3s, 4s)
2. **Shot type** (extreme close-up / medium close-up / vertical full-body / over-shoulder)
3. **Subject + action** — what they're doing
4. **Wardrobe + texture** — fabric details, wrinkles, translucency
5. **Hand/finger detail** — uneven pressure, slight tremble, natural nails
6. **Camera motion** — handheld micro-shake, autofocus breathing, exposure shift
7. **Facial micro-expression** — asymmetrical smile, blinking, head tilt
8. **Lighting** — daylight only, soft shadows, dappled highlights
9. **Background motion** — leaves moving, blurred patrons
10. **Skin detail** — pores, peach fuzz, redness from water
11. **Negatives** — no slow motion, no cinematic grading, no beauty filters

## Reference example (4-shot shower routine)

### Shot 1 — 4s
> A hyper-realistic vertical video of a young woman standing in an outdoor stone shower surrounded by lush tropical plants and soft morning sunlight. She is wearing a slightly wrinkled white cotton robe with natural fabric texture and subtle translucency at the edges. Her pink hair is freshly styled, with soft flyaways and uneven strands visible near the hairline. She holds a shampoo bottle at chest height with both hands, fingers slightly bent and imperfectly aligned, showing realistic skin texture, faint veins, and natural nail beds. The label on the bottle is fully readable, correctly aligned, and slightly reflective under sunlight. The camera is handheld at eye level with very subtle micro-shake, realistic autofocus breathing, and slight exposure adjustment as the light shifts. Her facial expression is warm and conversational, lips moving naturally as if speaking mid-sentence, with realistic blinking, micro head tilts, and asymmetrical smiling. Lighting is natural daylight only — no studio light — with soft shadows cast from surrounding plants. Background depth feels real with gentle motion in leaves from a light breeze. Skin texture shows pores, light peach fuzz, and natural highlight on cheeks and nose. Ultra-realistic smartphone footage, no beauty filters, no artificial smoothing, no cinematic grading.

### Shot 2 — 3s
> Extreme close-up vertical shot inside the outdoor shower, focused on the woman's hands and hair as she massages shampoo into her wet scalp. Water droplets visibly run down strands of hair, clinging unevenly and forming small rivulets. Foam builds naturally — not excessive — with realistic translucency and varying bubble sizes. Her fingers press into the scalp with uneven pressure, showing natural hand movement, slight tremble, and realistic skin creases at the knuckles. Fingertips appear slightly reddened from water exposure. Hair strands clump together realistically, darker where fully soaked, lighter where water thins. The camera feels like a real handheld phone brought closer, with shallow depth of field causing parts of the hands and hair to drift softly in and out of focus. Water splashes occasionally hit the lens, causing brief soft blur before clearing. Lighting is diffuse daylight filtered through leaves above, creating soft dappled highlights on hair and foam. No slow motion, no cinematic lighting, no artificial glow — pure real-world shower footage.

### Shot 3 — 3s
> Close-up vertical shot of the woman gently towel-drying her hair just outside the shower area. A textured off-white towel presses against damp hair, visibly absorbing water and darkening in patches. Hair appears slightly tangled and uneven, with individual strands sticking out naturally. Her hands move casually, not perfectly synchronized, creating a realistic everyday motion. Small droplets fall from the ends of her hair onto her robe, leaving visible wet spots that slowly spread into the fabric. The camera remains handheld at chest level, with natural movement and slight tilt as if filmed casually. Focus shifts subtly between the towel, hands, and hair. Lighting remains natural daylight with soft contrast. Skin shows natural redness from warm water, light shine on cheeks, and realistic under-eye texture. No glam lighting, no artificial smoothing.

### Shot 4 — 3s
> Medium close-up vertical shot of the woman looking directly into the camera and smiling naturally after finishing her routine. Her hair is damp but settling naturally, with a few loose strands framing her face. The robe sits imperfectly, slightly creased and relaxed, enhancing realism. Her smile is asymmetrical and genuine, with subtle eye crinkles, natural blinking, and a small head tilt. She exhales lightly through her nose, visible in the gentle movement of her shoulders. Background remains the outdoor stone shower and greenery, softly out of focus, with sunlight catching the edges of leaves behind her. The camera has minimal handheld movement, slight exposure correction as her face fills the frame. Overall look is indistinguishable from real influencer UGC shot on a modern smartphone — no cinematic effects, no filters, no AI artefacts, no perfect symmetry.

## Total clip math

4 shots × ~3.25s avg = ~13s. Tune to platform: TikTok/Reels 15–30s; Stories 9–15s.

## Models that accept this format

- Higgsfield (image-to-video)
- Seedance 2.0
- Kling 3.0
