---
name: carousel-machine-english
description: Automated Instagram carousel content pipeline — English version. Scrapes trending topics from YouTube/Twitter/Reddit, generates English carousel copy, creates slide images via Gemini, and pushes to Airtable. Use when the user wants to create English-language carousels, run the English carousel pipeline, or invokes /carousel-machine-english.
---

# /carousel-machine-english skill

Automated Instagram carousel content pipeline. Scrapes trending topics, generates English copy + slide images via Gemini (NanoBanana), and pushes to Airtable. All output text and image prompts are in English.

Source: https://github.com/peleg-jpg/carousel-machine

## Project location

`/Users/avivmalka/projects/carousel-machine2/`

(Same codebase as carousel-machine2 — uses the same pipeline with English output.)

## When this skill is invoked

Parse the user's command to determine the run mode, then execute the appropriate pipeline step.

## Run modes

| Command | Action |
|---|---|
| `/carousel-machine-english` | Full pipeline: scrape → analyze → write → image prompts → Airtable |
| `/carousel-machine-english --research` | Research phase only (scrape + analyze + push research to Airtable) |
| `/carousel-machine-english --generate` | Generate from existing Airtable research (skip scraping) |
| `/carousel-machine-english --topic "X"` | Generate carousel for specific topic X |
| `/carousel-machine-english [YouTube URL]` | Generate carousel from a specific YouTube video |
| `/carousel-machine-english --test` | Test mode: 1 carousel only |

## How to execute

### Option A — Python CLI (preferred when API keys are configured)

```bash
cd /Users/avivmalka/projects/carousel-machine2

# Full pipeline
python3 pipeline.py

# Research only
python3 pipeline.py --research-only

# Generate from existing research
python3 pipeline.py --generate

# Specific topic
python3 pipeline.py --topic "Claude Code memory system"

# Test mode
python3 pipeline.py --test
```

### Option B — Claude-native (when running as Claude Code skill)

When the user provides a YouTube URL or a topic directly:
1. Use the Apify scraper (`scrapers/youtube.py`) to fetch the transcript
2. Call `analysis/trend_analyzer.py` to extract the best angle
3. Call `generation/carousel_writer.py` to generate English copy
4. Call `generation/image_prompts.py` to build Gemini image prompts
5. Call `output/airtable.py` to push everything to Airtable

## Pre-flight check

Before running, verify:
1. `.env` exists at `/Users/avivmalka/projects/carousel-machine2/.env` with all required keys filled in
2. Python dependencies installed: `python3 -m pip install -r requirements.txt`
3. Airtable base has the correct tables (see README for schema)

## Required API keys (.env)

```
OPENROUTER_API_KEY=     # openrouter.ai/keys
APIFY_API_TOKEN=        # console.apify.com/account/integrations
AIRTABLE_API_KEY=       # airtable.com/create/tokens
AIRTABLE_BASE_ID=       # from Airtable base URL: airtable.com/appXXXXX/...
GEMINI_API_KEY=         # aistudio.google.com/apikey
TELEGRAM_BOT_TOKEN=     # optional - from @BotFather
TELEGRAM_CHAT_ID=       # optional
```

## Output

- Carousel JSON files saved to `/Users/avivmalka/projects/carousel-machine2/data/generated/`
- Records pushed to Airtable: "Ideas & Sources" + "Created Images" tables
- Images generated via Gemini stored as attachments in Airtable

## Design system

### Cream style (default — highest performing)
- Background: `#F2EDE6` (warm cream paper texture)
- Text: `#8B2500` (dark red-brown)
- Accent: `#E8762B` (orange stickers/highlights)
- Icons: Dark charcoal rounded squares with orange line art (3D app icon style)
- Brand bar: `@americanlegendrider` on every slide
- Format: 1:1 square (1080×1080)

### Dark tech style (legacy)
- Background: `#1A1A1F` with subtle grid texture overlay (5-8% opacity)
- Primary accent: `#D4845A` (warm salmon/copper)
- Secondary: `#00E64D` (terminal green for rays/highlights)
- Format: 4:5 (1080×1350)

## Carousel structure rules

- **Slide count:** 5-10 slides (sweet spot: 7-8)
- **Slide flow:** Hook/Cover → Context/Explainer → Info slides (one concept each, 30-50 words) → Optional mid-carousel CTA → CTA slide
- Cover must be a scroll-stopper: bold text + visual, max 5 words
- Every slide must be standalone (understandable without context)
- Progress indicator on every content slide
- All text on slides must be in English

## English copy rules (non-negotiable)

- Flowing sentences, NEVER bullet points on slides
- NEVER stack fragments ("Faster. Smarter. Better.") = AI slop
- BANNED words: crazy, magic, revolutionary, game-changer, groundbreaking
- Write "Claude Code" in English (no transliteration)
- Address audience in second person plural for IG: "you all" / "your" (community feel)
- CTA = invitation, not command (e.g., "Drop a comment below" not "Comment now!")
- Sentence length: mix short punchy sentences with longer explanatory ones for rhythm
- Tone: conversational, confident, educational — never corporate or robotic

## Airtable schema

**Ideas & Sources table:** topic, Status, source, source_url, source_type, source_author, angle, content_pillar, engagement_score, scraped_date

**Created Images table:** slide_index (0-based), slide_type (`hook`/`info`/`CTA`), text_en, visual_prompt_used, image (attachment), status, date_created, carousel_ref

See full design system + NanoBanana prompt templates in `/Users/avivmalka/projects/carousel-machine2/CLAUDE.md`.
