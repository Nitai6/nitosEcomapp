#!/usr/bin/env python3
"""Create Gmail labels, apply them to classified messages, and archive."""

import argparse
import json
import sys
import time
from collections import defaultdict

from googleapiclient.errors import HttpError

from gmail_auth import get_gmail_service

DEFAULT_LABELS = [
    "Invoices",
    "Receipts",
    "Work",
    "Personal",
    "Newsletters",
    "Finance",
    "Travel",
    "Shopping",
    "Notifications",
    "Unsorted",
]

SKIP_CATEGORY = "Promotions/Junk"


def get_existing_labels(service):
    """Return a dict of {label_name: label_id} for all existing labels."""
    results = service.users().labels().list(userId="me").execute()
    labels = results.get("labels", [])
    return {label["name"]: label["id"] for label in labels}


def create_labels(service, label_names, dry_run=False):
    """Create labels that don't exist yet. Return {name: label_id} for all requested labels."""
    existing = get_existing_labels(service)
    label_map = {}

    for name in label_names:
        if name in existing:
            label_map[name] = existing[name]
            print(f"  Already exists: {name}")
        else:
            if dry_run:
                print(f"  Would create: {name}")
                label_map[name] = f"DRY_RUN_{name}"
            else:
                body = {
                    "name": name,
                    "labelListVisibility": "labelShow",
                    "messageListVisibility": "show",
                }
                result = service.users().labels().create(userId="me", body=body).execute()
                label_map[name] = result["id"]
                print(f"  Created: {name}")

    return label_map


def apply_labels_and_archive(service, classifications, label_map, archive=True, dry_run=False):
    """Apply labels to messages and optionally remove from inbox.

    Args:
        service: Gmail API service object.
        classifications: dict of {message_id: category_name}.
        label_map: dict of {category_name: label_id}.
        archive: if True, remove INBOX label from messages.
        dry_run: if True, print actions without executing.

    Returns:
        Report dict with counts per category, skipped promotions, and errors.
    """
    report = defaultdict(int)
    report["skipped_promotions"] = []
    report["errors"] = []

    # Group messages by category
    groups = defaultdict(list)
    for msg_id, category in classifications.items():
        if category == SKIP_CATEGORY:
            report["skipped_promotions"].append(msg_id)
            continue
        groups[category].append(msg_id)

    for category, msg_ids in groups.items():
        if category not in label_map:
            print(f"  Warning: no label found for category '{category}', skipping {len(msg_ids)} messages")
            report["errors"].extend(msg_ids)
            continue

        label_id = label_map[category]

        # Process in batches of 1000
        for i in range(0, len(msg_ids), 1000):
            batch = msg_ids[i : i + 1000]

            body = {
                "ids": batch,
                "addLabelIds": [label_id],
            }
            if archive:
                body["removeLabelIds"] = ["INBOX"]

            if dry_run:
                action = "label + archive" if archive else "label only"
                print(f"  Would {action}: {len(batch)} messages as '{category}'")
                report[category] += len(batch)
                continue

            retries = 0
            max_retries = 5
            while retries <= max_retries:
                try:
                    service.users().messages().batchModify(userId="me", body=body).execute()
                    report[category] += len(batch)
                    break
                except HttpError as e:
                    if e.resp.status == 429 and retries < max_retries:
                        wait = 2 ** retries
                        print(f"  Rate limited, retrying in {wait}s...")
                        time.sleep(wait)
                        retries += 1
                    else:
                        print(f"  Error applying '{category}' to {len(batch)} messages: {e}")
                        report["errors"].extend(batch)
                        break

            # Rate limiting between batches
            if not dry_run:
                time.sleep(1)

    return dict(report)


def print_promotions(service, classifications):
    """Print details of all Promotions/Junk emails for user review."""
    promo_ids = [mid for mid, cat in classifications.items() if cat == SKIP_CATEGORY]

    if not promo_ids:
        print("No Promotions/Junk emails found.")
        return

    print(f"Found {len(promo_ids)} Promotions/Junk emails:\n")
    for msg_id in promo_ids:
        try:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=msg_id, format="metadata", metadataHeaders=["From", "Subject"])
                .execute()
            )
            headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
            sender = headers.get("From", "unknown")
            subject = headers.get("Subject", "(no subject)")
            print(f"  ID: {msg_id}")
            print(f"    From: {sender}")
            print(f"    Subject: {subject}")
            print()
        except HttpError as e:
            print(f"  ID: {msg_id} - error fetching details: {e}")


def print_summary(report):
    """Print a summary line from the report dict."""
    total_applied = sum(v for k, v in report.items() if k not in ("skipped_promotions", "errors"))
    num_errors = len(report.get("errors", []))
    num_skipped = len(report.get("skipped_promotions", []))
    print(f"\nApplied labels to {total_applied} emails, {num_errors} errors, {num_skipped} promotions skipped")


def main():
    parser = argparse.ArgumentParser(description="Gmail label management and application")
    parser.add_argument("--create-labels", action="store_true", help="Create all default labels")
    parser.add_argument("--apply", action="store_true", help="Apply labels from classification file")
    parser.add_argument("--input", type=str, help="Path to classified.json file")
    parser.add_argument("--no-archive", action="store_true", help="Do not remove from inbox when applying labels")
    parser.add_argument("--dry-run", action="store_true", help="Print what would happen without making changes")
    parser.add_argument("--promotions", action="store_true", help="List all Promotions/Junk emails for review")
    args = parser.parse_args()

    if not (args.create_labels or args.apply or args.promotions):
        parser.print_help()
        sys.exit(1)

    if (args.apply or args.promotions) and not args.input:
        print("Error: --input is required with --apply and --promotions", file=sys.stderr)
        sys.exit(1)

    service = get_gmail_service()

    if args.create_labels:
        print("Creating labels...")
        create_labels(service, DEFAULT_LABELS, dry_run=args.dry_run)

    if args.promotions:
        with open(args.input) as f:
            classifications = json.load(f)
        print_promotions(service, classifications)

    if args.apply:
        with open(args.input) as f:
            classifications = json.load(f)

        # Ensure all needed labels exist
        categories = set(classifications.values()) - {SKIP_CATEGORY}
        all_labels = list(set(DEFAULT_LABELS) | categories)

        print("Ensuring labels exist...")
        label_map = create_labels(service, all_labels, dry_run=args.dry_run)

        archive = not args.no_archive
        action = "Applying labels" + (" and archiving" if archive else "")
        print(f"\n{action}...")

        report = apply_labels_and_archive(
            service, classifications, label_map, archive=archive, dry_run=args.dry_run
        )
        print_summary(report)


if __name__ == "__main__":
    main()
