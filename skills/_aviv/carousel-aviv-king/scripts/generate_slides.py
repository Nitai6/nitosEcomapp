#!/usr/bin/env python3
"""
Generate Instagram carousel slide images using Gemini (Nano Banana Pro).
Marketing Harry style: white bg, pink-to-orange gradients, 3D renders, Hebrew RTL.

Usage:
    python3 generate_slides.py --slides slides.json --output /path/to/output/

Input: JSON file with array of slide prompt objects.
Output: PNG images saved to output directory + manifest.json.
"""
import argparse
import json
import base64
import time
import sys
from pathlib import Path
from dotenv import load_dotenv
import os
import requests

# Load env from carousel-machine2 project (has GEMINI_API_KEY)
ENV_PATHS = [
    Path.home() / "projects" / "carousel-machine2" / ".env",
    Path(__file__).resolve().parent.parent / ".env",
    Path.cwd() / ".env",
]
for env_path in ENV_PATHS:
    if env_path.exists():
        load_dotenv(env_path)
        break

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("[ERR] GEMINI_API_KEY not found. Set it in .env or environment.")
    sys.exit(1)

MODEL = "gemini-3.1-flash-image-preview"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={GEMINI_API_KEY}"


def generate_slide(prompt: str, index: int):
    """Call Gemini to generate one slide image. Returns raw PNG bytes or None."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }
    headers = {"Content-Type": "application/json"}

    resp = requests.post(API_URL, json=payload, headers=headers, timeout=120)
    if resp.status_code != 200:
        print(f"  [ERR] Slide {index}: HTTP {resp.status_code} {resp.text[:300]}")
        return None

    data = resp.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])
    except (KeyError, IndexError) as e:
        print(f"  [ERR] Slide {index}: parse error {e}")
    return None


def main():
    parser = argparse.ArgumentParser(description="Generate carousel slide images via Gemini")
    parser.add_argument("--slides", required=True, help="Path to slides JSON file")
    parser.add_argument("--output", required=True, help="Output directory for images")
    args = parser.parse_args()

    slides_path = Path(args.slides)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    with open(slides_path, "r", encoding="utf-8") as f:
        slides = json.load(f)

    print(f"Generating {len(slides)} slides via Nano Banana Pro ({MODEL})")
    print(f"Output: {output_dir}\n")

    generated = []

    for slide in slides:
        idx = slide["index"]
        stype = slide["type"]
        prompt = slide["prompt"]

        print(f"  Slide {idx} ({stype})...")
        img_bytes = generate_slide(prompt, idx)

        if img_bytes:
            out_path = output_dir / f"slide_{idx:02d}_{stype}.png"
            out_path.write_bytes(img_bytes)
            size_kb = len(img_bytes) // 1024
            print(f"    [OK] {out_path.name} ({size_kb}KB)")
            generated.append({"index": idx, "path": str(out_path), "type": stype})
        else:
            print(f"    [SKIP] Failed")

        # Rate limit
        time.sleep(4)

    manifest = output_dir / "manifest.json"
    manifest.write_text(json.dumps(generated, indent=2, ensure_ascii=False))

    print(f"\n[DONE] {len(generated)}/{len(slides)} slides generated")
    print(f"Images: {output_dir}")
    return generated


if __name__ == "__main__":
    main()
