#!/usr/bin/env python3
"""
Gmail classifier - reads scan JSON and outputs structured batches
for Claude Code to classify inline. Does NOT call any AI API directly.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any


CATEGORIES = [
    "Invoices",
    "Receipts",
    "Work",
    "Personal",
    "Newsletters",
    "Finance",
    "Travel",
    "Shopping",
    "Notifications",
    "Promotions/Junk",
    "Unsorted",
]

GMAIL_CATEGORY_LABELS: dict[str, str] = {
    "CATEGORY_PROMOTIONS": "Promotions",
    "CATEGORY_SOCIAL": "Social",
    "CATEGORY_UPDATES": "Updates",
    "CATEGORY_FORUMS": "Forums",
    "CATEGORY_PERSONAL": "Personal",
}


def load_emails(input_path: str) -> list[dict[str, Any]]:
    path = Path(input_path)
    if not path.exists():
        print(f"Error: file not found - {input_path}", file=sys.stderr)
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        print("Error: scan JSON must be a top-level array", file=sys.stderr)
        sys.exit(1)
    return data


def extract_sender_name(sender: str) -> str:
    """Pull a readable name from the sender field."""
    if "<" in sender:
        return sender.split("<")[0].strip().strip('"')
    return sender.strip()


def get_sender(email: dict[str, Any]) -> str:
    """Get sender string from an email dict, with fallback."""
    raw = email.get("sender")
    if raw is None:
        raw = email.get("from", "unknown")
    return str(raw)


def print_summary(emails: list[dict[str, Any]]) -> None:
    total = len(emails)
    print(f"Total emails: {total}\n")

    # Top senders
    sender_counts: Counter[str] = Counter()
    for email in emails:
        sender_counts[extract_sender_name(get_sender(email))] += 1

    print("Top 20 senders:")
    for sender, count in sender_counts.most_common(20):
        print(f"  {count:>5}  {sender}")

    # Existing Gmail category labels
    label_counts: Counter[str] = Counter()
    for email in emails:
        label_ids: list[str] = email.get("labelIds", [])
        for label in label_ids:
            if label in GMAIL_CATEGORY_LABELS:
                label_counts[GMAIL_CATEGORY_LABELS[label]] += 1

    if label_counts:
        print("\nExisting Gmail category labels:")
        for label, count in label_counts.most_common():
            print(f"  {count:>5}  {label}")
    else:
        print("\nNo Gmail category labels found on these emails.")


def print_batch(
    emails: list[dict[str, Any]],
    batch_num: int,
    total_batches: int,
    global_offset: int,
) -> None:
    start = global_offset + 1
    end = global_offset + len(emails)
    print(f"--- Batch {batch_num}/{total_batches} (emails {start}-{end}) ---\n")

    for i, email in enumerate(emails, start=1):
        sender = get_sender(email)
        subject = email.get("subject", "(no subject)")
        snippet = email.get("snippet", "")
        # Truncate snippet for readability
        if len(snippet) > 120:
            snippet = snippet[:120] + "..."
        print(f"{i}. From: {sender} | Subject: {subject} | Snippet: {snippet}")

    categories_str = ", ".join(CATEGORIES)
    print(f"\nClassify each email into one of: {categories_str}")
    print('Output as JSON: {"1": "Category", "2": "Category", ...}')


def split_batches(
    emails: list[dict[str, Any]], batch_size: int
) -> list[list[dict[str, Any]]]:
    batches: list[list[dict[str, Any]]] = []
    for i in range(0, len(emails), batch_size):
        batches.append(emails[i : i + batch_size])
    return batches


def write_merged_output(
    output_path: str,
    emails: list[dict[str, Any]],
    classifications: dict[str, str],
) -> None:
    """Write a merged JSON mapping message_id to category."""
    merged: dict[str, str] = {}
    for idx_str, category in classifications.items():
        idx = int(idx_str) - 1
        if 0 <= idx < len(emails):
            msg_id = emails[idx].get("id", f"unknown-{idx}")
            merged[str(msg_id)] = category
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(merged)} classifications to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Prepare Gmail scan data for Claude Code classification"
    )
    parser.add_argument("--input", required=True, help="Path to scan JSON file")
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Emails per batch (default: 50)",
    )
    parser.add_argument(
        "--batch-number",
        type=int,
        default=None,
        help="Print only this batch number (1-indexed)",
    )
    parser.add_argument(
        "--summary",
        action="store_true",
        help="Show email count and top senders only",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Path for merged classification output JSON",
    )

    args = parser.parse_args()

    emails = load_emails(args.input)

    if not emails:
        print("No emails found in scan file.")
        return

    if args.summary:
        print_summary(emails)
        return

    batches = split_batches(emails, args.batch_size)
    total_batches = len(batches)

    if args.batch_number is not None:
        if args.batch_number < 1 or args.batch_number > total_batches:
            print(
                f"Error: batch number must be between 1 and {total_batches}",
                file=sys.stderr,
            )
            sys.exit(1)
        idx = args.batch_number - 1
        global_offset = idx * args.batch_size
        print_batch(batches[idx], args.batch_number, total_batches, global_offset)
    else:
        for i, batch in enumerate(batches):
            global_offset = i * args.batch_size
            print_batch(batch, i + 1, total_batches, global_offset)
            if i < len(batches) - 1:
                print("\n")

    # If --output is given, print instructions for merging
    if args.output:
        output_path = args.output
        print("\n--- Output mode ---")
        print(f"After classifying all batches, merge results into: {output_path}")
        print("Expected format: JSON object mapping message_id to category.")
        print("Use this script with --batch-number to process one batch at a time.")


if __name__ == "__main__":
    main()
