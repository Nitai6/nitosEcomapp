# Owner's Website Build Prompts (verbatim)

Three prompts for the 6-step Claude Design build. Use exactly as written; substitute `[X]` placeholders only.

## Prompt 1 — Site spec / hero / vibe

> "I want to build a website using cloud design, and I'm looking for some inspiration on the type of website I should build. the product i sell is[X], the brand rules are[X], the marketing research we did and the potential avatar of a customer are [X] & [X], our competitors we found from the competitors research are [X]. What should the hero section and the actual copy be like? What should the vibe be like? Help me build an example brand website and give me a spec for this website. Every website should follow at least 75% of this following building rules [X]."

**Substitutions:**
- product = `state/market-research/offer-brief.json`
- brand rules = `state/branding/brand-strategy-blueprint.json`
- marketing research = `state/market-research/customer-avatar.json`
- avatar = same file
- competitors = `state/ads-competitor/patterns.json`
- building rules = `references/my-homepage-anatomy.md` + `references/my-product-page-anatomy.md` + `references/my-banner-formulas.md`

## Prompt 2 — Hero background video (image + video prompts)

> "Awesome, I want to create a video that will play in the background of the hero section and it will just be on an endless loop. I need a video idea that will fit the vibe and will have a wow factor for people that go to our website. We should also be thinking about the text that will be displayed on the hero section. The background video will not include any text, but it has to have room where we could insert a block for the hero text and subtext.
>
> What I need is for you to give me an image prompt for this background and then give me a video prompt in order to animate that background in a way that, like I said, isn't distracting but has a wow factor and fits the vibe of what we're trying to sell here, the brand we're trying to sell. The video prompt should not have any camera movement because we want the start frame and the end frame for this video to be the same so it feels more like an endless loop."

**Output:** two strings — `image_prompt` and `video_prompt`. Image goes to Higgsfield text-to-image; image+video prompt goes to Higgsfield image-to-video.

**Constraints:**
- No text in video
- Room for hero text block (typically left side)
- No camera movement
- Start frame = end frame (loop)

## Prompt 3 — Final assembly

> "Hey Claude Design, I've given you a couple things. I've got a sketch which is just my basically idea for the website. There's going to be a lot going on, which you will be on your own to figure out what that should look like (play kinda with the rules). I've given you the video. This is a video that I want you to be playing on an endless loop in the background and you should see that the hero text will be on the left side compared to that. I also added animation from motions Ai that i liked + other websites part i loved (make them relevant to my business). And then I added the following: product i sell is[X], the brand rules are[X], the marketing research we did and the potential avatar of a customer are [X] & [X], our competitors we found from the competitors research are [X]. What should the hero section and the actual copy be like? What should the vibe be like? Help me build an example brand website and give me a spec for this website. Every website should follow at least 75% of this following building rules [X]."

After Prompt 3 → owner plays with it → tell Claude Design to **optimize for phone** → push to Shopify via MCP.
