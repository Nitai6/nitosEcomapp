#!/usr/bin/env python3
"""
Multi-query Google Maps scraper. Runs multiple queries and merges results.
"""

import argparse
import json
import sys
import os
import subprocess
import concurrent.futures
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="Multi-query Google Maps scraper")
    parser.add_argument("--queries", nargs="+", required=True, help="List of search queries")
    parser.add_argument("--location", required=True, help="Location")
    parser.add_argument("--items_per_query", type=int, default=30, help="Items per query")
    parser.add_argument("--total_target", type=int, default=100, help="Total target leads")
    parser.add_argument("--output", required=True, help="Output JSON file")
    return parser.parse_args()


def run_single_query(query, location, max_items, output_path, script_dir):
    """Run a single scrape query."""
    cmd = [
        sys.executable,
        os.path.join(script_dir, "scrape_google_maps.py"),
        "--query", query,
        "--location", location,
        "--max_items", str(max_items),
        "--output", output_path,
    ]
    print(f"\nStarting query: {query}", file=sys.stderr)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if result.stderr:
        # Only print summary lines
        for line in result.stderr.split('\n'):
            if line.startswith('[') or line.startswith('Done') or line.startswith('Scraping') or 'Found' in line:
                print(f"  [{query}] {line}", file=sys.stderr)
    return output_path


def merge_results(file_paths, total_target):
    """Merge results from multiple scrapes, deduplicating by name and phone."""
    all_leads = []
    seen = set()

    for fp in file_paths:
        if not os.path.exists(fp):
            continue
        with open(fp, 'r', encoding='utf-8') as f:
            leads = json.load(f)
        for lead in leads:
            # Dedup key: normalized name + phone
            key_name = lead.get("name", "").strip().lower()
            key_phone = lead.get("phone", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "")
            dedup_key = f"{key_name}||{key_phone}"

            if dedup_key not in seen and key_name:
                seen.add(dedup_key)
                all_leads.append(lead)

    return all_leads[:total_target]


def main():
    args = parse_args()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    tmp_dir = os.path.join(os.path.dirname(script_dir), ".tmp")
    os.makedirs(tmp_dir, exist_ok=True)

    # Run queries sequentially (Playwright doesn't handle parallel well with single browser)
    file_paths = []
    for i, query in enumerate(args.queries):
        out_path = os.path.join(tmp_dir, f"query_{i}.json")
        file_paths.append(out_path)
        run_single_query(query, args.location, args.items_per_query, out_path, script_dir)

    # Merge and deduplicate
    print(f"\nMerging results from {len(args.queries)} queries...", file=sys.stderr)
    merged = merge_results(file_paths, args.total_target)

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"Final: {len(merged)} unique leads -> {args.output}", file=sys.stderr)

    # Cleanup temp files
    for fp in file_paths:
        if os.path.exists(fp):
            os.remove(fp)


if __name__ == "__main__":
    main()
