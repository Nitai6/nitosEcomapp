#!/usr/bin/env python3
"""
Generate a hand-drawn LinkedIn carousel slide using Nano Banana Pro.

Takes an SVG blueprint (like gemini-diagram) and renders it as a hand-drawn
illustration in 1:1 square format. Combines the layout precision of SVG
blueprints with the sketchy aesthetic of Nano Banana Pro.

Usage:
    # SVG blueprint mode (primary)
    python3 generate_handdrawn_slide.py \
        --svg workspace/slide-1-blueprint.svg \
        --output workspace/slide-1.png

    # SVG + extra instructions
    python3 generate_handdrawn_slide.py \
        --svg workspace/slide-1-blueprint.svg \
        --prompt "Make the arrows thicker and more playful" \
        --output workspace/slide-1.png

    # Text-only mode (quick/experimental)
    python3 generate_handdrawn_slide.py \
        --prompt "A hand-drawn carousel slide showing..." \
        --output workspace/slide-1.png

    # Mono style
    python3 generate_handdrawn_slide.py \
        --svg workspace/slide-1-blueprint.svg \
        --style mono \
        --output workspace/slide-1.png

    # With additional reference images
    python3 generate_handdrawn_slide.py \
        --svg workspace/slide-1-blueprint.svg \
        --reference workspace/refs/logo.png \
        --output workspace/slide-1.png

Environment variables (or .env file):
    GEMINI_API_KEY   - Required
    TAVILY_API_KEY   - Required for image placeholder resolution
"""

import argparse
import os
import re
import sys
import time
from pathlib import Path

import requests
from google import genai
from google.genai import types
from PIL import Image


MODEL = "nano-banana-pro-preview"

SLIDE_PROMPT_HEADER_COLOR = """Generate a hand-drawn LinkedIn carousel slide in the PaperBanana / sketchy whiteboard illustration style shown in the reference images.

Format: 1:1 square (1080x1080) carousel slide.

Style: Color (warm illustrated)
- Warm cream background (#FDF6E3) filling the entire canvas
- Black ink outlines (#2D2D2D) on everything — every shape has a visible stroke
- Colored accents: coral red (#EF6351), sky blue (#4BA3D4), soft green (#6BBF6A), golden yellow (#F4C542), lavender (#9B7ED8)
- Thick wobbly outlines, organic hand-drawn feel — nothing mechanical
- Bold handwritten-style labels, readable at mobile size
- Small doodle icons (lightbulbs, gears, stars, checkmarks) scattered where appropriate
- Colored pill/badge labels with white text inside
- Arrows with thick strokes and bezier curves — never straight ruler lines
- 8-15 small decorative elements (stars, sparkles, squiggles) in empty space

CRITICAL RULES:
- This is a CAROUSEL SLIDE — must work as a standalone visual at small size
- Keep text concise — maximum ~40 words total on the slide
- Bold typography for headlines — must be readable on a phone screen
- Generous padding — content should not crowd the edges (60px+ margins)
- One main idea per slide — do not overload with information
- Hand-drawn aesthetic throughout — wobbly lines, imperfect shapes, organic feel
"""

SLIDE_PROMPT_HEADER_MONO = """Generate a hand-drawn LinkedIn carousel slide in the PaperBanana / sketchy whiteboard illustration style shown in the reference images.

Format: 1:1 square (1080x1080) carousel slide.

Style: Mono (black and white ink)
- Light cream background
- Pure black ink outlines, no color accents
- Thick wobbly outlines, dashed connectors, crosshatch fills for emphasis
- Bold handwritten-style labels, readable at mobile size
- Stick figures, simple icons, bracket groups
- All elements use weight and opacity for hierarchy, not color

CRITICAL RULES:
- This is a CAROUSEL SLIDE — must work as a standalone visual at small size
- Keep text concise — maximum ~40 words total on the slide
- Bold typography for headlines — must be readable on a phone screen
- Generous padding — content should not crowd the edges (60px+ margins)
- One main idea per slide — do not overload with information
- Hand-drawn aesthetic throughout — wobbly lines, imperfect shapes, organic feel
- No color ever — only black ink on cream/white
"""


# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

def load_env(env_path=".env"):
    env = {}
    path = Path(env_path)
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def get_key(name, env):
    return os.environ.get(name) or env.get(name)


# ---------------------------------------------------------------------------
# Reference images (style guides from ref/ directory)
# ---------------------------------------------------------------------------

def load_style_refs(ref_dir="ref"):
    parts = []
    ref_path = Path(ref_dir)
    if not ref_path.exists():
        return parts
    for f in sorted(ref_path.iterdir()):
        if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
            mime = "image/png" if f.suffix.lower() == ".png" else "image/jpeg"
            parts.append(types.Part.from_bytes(data=f.read_bytes(), mime_type=mime))
            print(f"  [style-ref] {f.name} ({f.stat().st_size // 1024}KB)")
    return parts


# ---------------------------------------------------------------------------
# Additional reference images (logos, icons, etc.)
# ---------------------------------------------------------------------------

def load_reference_images(paths):
    """Load additional reference images (logos, icons, etc.) as Parts."""
    parts = []
    for p in paths:
        path = Path(p)
        if not path.exists():
            print(f"  [ref] Warning: File not found: {p}")
            continue
        # Validate it's actually an image
        with open(path, "rb") as f:
            header = f.read(256)
        if b"<!DOCTYPE" in header or b"<html" in header or b"<HTML" in header:
            print(f"  [ref] Warning: '{p}' is HTML, not an image. Skipping.")
            continue

        mime = "image/png" if path.suffix.lower() == ".png" else "image/jpeg"
        # Resize if too large
        img = Image.open(path)
        w, h = img.size
        if max(w, h) > 2048:
            ratio = 2048 / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
            from io import BytesIO
            buf = BytesIO()
            img.save(buf, format="PNG")
            data = buf.getvalue()
        else:
            data = path.read_bytes()

        parts.append(types.Part.from_bytes(data=data, mime_type=mime))
        print(f"  [ref] Loaded: {path.name} ({len(data) // 1024}KB)")
    return parts


# ---------------------------------------------------------------------------
# SVG placeholder parsing & Tavily image search
# ---------------------------------------------------------------------------

IMAGE_PLACEHOLDER_RE = re.compile(r"<!--\s*IMAGE:\s*(.+?)\s*-->", re.IGNORECASE)


def extract_image_placeholders(svg_content):
    matches = IMAGE_PLACEHOLDER_RE.findall(svg_content)
    seen = set()
    queries = []
    for m in matches:
        m = m.strip()
        if m and m.lower() not in seen:
            seen.add(m.lower())
            queries.append(m)
    return queries


def search_images_tavily(query, api_key, max_results=3):
    try:
        r = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": query,
                "search_depth": "basic",
                "include_images": True,
                "max_results": max_results,
            },
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("images", [])[:max_results]
    except Exception as e:
        print(f"  [tavily] Warning: search failed for '{query}': {e}")
        return []


def download_image(url, timeout=10):
    try:
        r = requests.get(url, timeout=timeout, headers={
            "User-Agent": "Mozilla/5.0 (compatible; CarouselGenerator/1.0)"
        })
        r.raise_for_status()
        content_type = r.headers.get("content-type", "image/jpeg")
        if "png" in content_type:
            mime = "image/png"
        elif "webp" in content_type:
            mime = "image/webp"
        elif "gif" in content_type:
            mime = "image/gif"
        else:
            mime = "image/jpeg"
        return r.content, mime
    except Exception as e:
        print(f"  [download] Warning: failed to download {url[:80]}: {e}")
        return None, None


def resolve_image_placeholders(queries, tavily_key):
    results = []
    for query in queries:
        print(f"  [tavily] Searching: '{query}'")
        urls = search_images_tavily(query, tavily_key)
        found = False
        for url in urls:
            img_bytes, mime = download_image(url)
            if img_bytes and len(img_bytes) > 1000:
                results.append((query, img_bytes, mime))
                print(f"  [tavily] Found image for '{query}' ({len(img_bytes) // 1024}KB)")
                found = True
                break
        if not found:
            print(f"  [tavily] No usable image found for '{query}'")
    return results


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

def generate_slide(
    svg_content=None,
    prompt=None,
    output_path="output.png",
    gemini_key=None,
    tavily_key=None,
    style_refs=None,
    reference_parts=None,
    style="color",
    skip_images=False,
):
    """Generate a single hand-drawn carousel slide via Nano Banana Pro."""
    client = genai.Client(api_key=gemini_key)
    parts = []

    # 1. Style reference images (PaperBanana examples from ref/)
    if style_refs:
        parts.extend(style_refs)

    # 2. Additional reference images (logos, icons)
    if reference_parts:
        parts.extend(reference_parts)

    # Pick style header
    header = SLIDE_PROMPT_HEADER_COLOR if style == "color" else SLIDE_PROMPT_HEADER_MONO

    # Build prompt
    prompt_parts = [header]

    if svg_content:
        # SVG blueprint mode — resolve placeholders
        placeholder_images = []
        if not skip_images and tavily_key:
            queries = extract_image_placeholders(svg_content)
            if queries:
                print(f"\n[placeholders] Found {len(queries)} image placeholder(s)")
                placeholder_images = resolve_image_placeholders(queries, tavily_key)

        for query, img_bytes, mime in placeholder_images:
            parts.append(types.Part.from_text(text=f"Reference image for '{query}':"))
            parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime))

        prompt_parts.append(
            f"""I have an SVG blueprint that defines the LAYOUT and CONTENT for this carousel slide.
Redraw this as a hand-drawn illustration in the sketchy whiteboard style.

IMPORTANT:
- Preserve the same layout structure, text content, and spatial arrangement from the SVG
- Render it as a beautiful hand-drawn carousel slide — as if sketched with markers on paper
- This is a single slide in a carousel sequence, so it must work standalone at small size
- Include ALL text labels and content from the SVG — don't skip any text

SVG Blueprint:
```svg
{svg_content}
```"""
        )

        if placeholder_images:
            prompt_parts.append(
                "\nI've included reference images for the IMAGE placeholders. "
                "Incorporate visual elements inspired by these references."
            )

        if prompt:
            prompt_parts.append(f"\nAdditional instructions: {prompt}")

    elif prompt:
        prompt_parts.append(f"\nSlide content to illustrate:\n{prompt}")
    else:
        print("[error] Provide --svg, --prompt, or both", file=sys.stderr)
        return False

    parts.append(types.Part.from_text(text="\n\n".join(prompt_parts)))

    # Generate
    mode = "SVG blueprint" if svg_content else "text-only"
    print(f"\n[gemini] Generating hand-drawn slide with {MODEL} ({mode} mode)...")
    t0 = time.time()

    response = client.models.generate_content(
        model=MODEL,
        contents=types.Content(role="user", parts=parts),
        config=types.GenerateContentConfig(
            response_modalities=["image", "text"],
            temperature=1.0,
            image_config=types.ImageConfig(aspect_ratio="1:1"),
        ),
    )

    elapsed = time.time() - t0
    print(f"[gemini] Generation completed in {elapsed:.1f}s")

    # Save
    saved = False
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            out = Path(output_path)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(part.inline_data.data)
            size_kb = len(part.inline_data.data) // 1024
            print(f"\n[output] Saved: {out} ({size_kb}KB, {part.inline_data.mime_type})")
            saved = True
        elif part.text:
            print(f"[gemini] Note: {part.text[:300]}")

    if not saved:
        print("[error] No image was generated in the response")
        return False

    return True


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate hand-drawn LinkedIn carousel slides with Nano Banana Pro",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # SVG blueprint → hand-drawn slide (primary mode)
  python3 generate_handdrawn_slide.py --svg slide-blueprint.svg -o slide-1.png

  # With extra instructions
  python3 generate_handdrawn_slide.py --svg slide-blueprint.svg --prompt "Emphasize the arrows" -o slide-1.png

  # Text-only quick mode
  python3 generate_handdrawn_slide.py --prompt "Hook slide: '5 AI Tools You Need'" -o slide-1.png

  # Mono style
  python3 generate_handdrawn_slide.py --svg slide-blueprint.svg --style mono -o slide-1.png

  # With reference images (logos, icons)
  python3 generate_handdrawn_slide.py --svg slide-blueprint.svg --reference logo.png icon.png -o slide-1.png
        """,
    )
    parser.add_argument("--svg", help="Path to SVG blueprint file")
    parser.add_argument("--prompt", help="Text prompt (alone = text-only, with --svg = extra instructions)")
    parser.add_argument("-o", "--output", required=True, help="Output image path (.png)")
    parser.add_argument(
        "--style", default="color", choices=["color", "mono"],
        help="Visual style: color (warm illustrated) or mono (black & white ink). Default: color"
    )
    parser.add_argument(
        "--reference", nargs="*", default=[],
        help="Additional reference images (logos, icons, previous slides)"
    )
    parser.add_argument("--no-images", action="store_true", help="Skip Tavily image search")
    parser.add_argument("--ref-dir", default="ref", help="Style reference directory (default: ref/)")
    parser.add_argument("--env", default=".env", help="Path to .env file (default: .env)")

    args = parser.parse_args()

    if not args.svg and not args.prompt:
        parser.error("Provide --svg, --prompt, or both")

    # Load keys
    env = load_env(args.env)
    gemini_key = get_key("GEMINI_API_KEY", env)
    tavily_key = get_key("TAVILY_API_KEY", env)

    if not gemini_key:
        sys.exit("[error] GEMINI_API_KEY not found in environment or .env")

    # Load style refs
    print("[refs] Loading style references...")
    style_refs = load_style_refs(args.ref_dir)
    if not style_refs:
        print("[refs] Warning: No reference images found in ref/ directory")

    # Load additional reference images
    reference_parts = []
    if args.reference:
        print("[refs] Loading reference images...")
        reference_parts = load_reference_images(args.reference)

    # Load SVG
    svg_content = None
    if args.svg:
        svg_path = Path(args.svg)
        if not svg_path.exists():
            sys.exit(f"[error] SVG file not found: {svg_path}")
        svg_content = svg_path.read_text()
        print(f"[svg] Loaded {svg_path} ({len(svg_content)} chars)")

    # Generate
    success = generate_slide(
        svg_content=svg_content,
        prompt=args.prompt,
        output_path=args.output,
        gemini_key=gemini_key,
        tavily_key=tavily_key if not args.no_images else None,
        style_refs=style_refs,
        reference_parts=reference_parts,
        style=args.style,
        skip_images=args.no_images,
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
