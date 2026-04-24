#!/usr/bin/env python3
"""Generate RTL Hebrew PDF proposal from JSON data."""
import os
import json
import sys
from pathlib import Path
from datetime import datetime

# WeasyPrint needs homebrew libs on macOS
os.environ.setdefault("DYLD_LIBRARY_PATH", "/opt/homebrew/lib")

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

SCRIPT_DIR = Path(__file__).parent
ASSETS_DIR = SCRIPT_DIR.parent / "assets"
TEMPLATE_FILE = "proposal-template.html"


def generate_pdf(data: dict, output_path: str = None) -> str:
    """Generate PDF from proposal data dict. Returns output file path."""
    env = Environment(loader=FileSystemLoader(str(ASSETS_DIR)))
    template = env.get_template(TEMPLATE_FILE)

    html_content = template.render(**data)

    if not output_path:
        client = data.get("client_name", "client").replace(" ", "-")
        date_str = datetime.now().strftime("%Y-%m-%d")
        output_path = f"proposal-{client}-{date_str}.pdf"

    HTML(string=html_content).write_pdf(output_path)
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate-pdf.py <input.json> [output.pdf]")
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.load(f)

    output = sys.argv[2] if len(sys.argv) > 2 else None
    result = generate_pdf(data, output)
    print(f"PDF generated: {result}")
