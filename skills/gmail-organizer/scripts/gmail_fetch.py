#!/usr/bin/env python3
"""Fetch all Gmail messages and extract metadata for classification."""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

from googleapiclient.errors import HttpError

from gmail_auth import get_gmail_service

CONFIG_DIR = Path.home() / ".gmail-organizer"


def fetch_all_message_ids(service, query=""):
    """Paginate through messages().list() and return all message IDs plus estimate."""
    message_ids = []
    page_token = None
    estimate = 0

    while True:
        kwargs = {"userId": "me", "maxResults": 500, "q": query}
        if page_token:
            kwargs["pageToken"] = page_token

        response = _retry_request(
            lambda kw=kwargs: service.users().messages().list(**kw).execute()
        )

        estimate = response.get("resultSizeEstimate", estimate)
        messages = response.get("messages", [])
        message_ids.extend(msg["id"] for msg in messages)

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return message_ids, estimate


def fetch_metadata_batch(service, message_ids, estimate, all_messages):
    """Fetch message metadata in batches of 100 using BatchHttpRequest."""
    failed = []

    for batch_start in range(0, len(message_ids), 100):
        batch_ids = message_ids[batch_start : batch_start + 100]
        batch = service.new_batch_http_request()

        for msg_id in batch_ids:
            request = service.users().messages().get(
                userId="me",
                id=msg_id,
                format="metadata",
                metadataHeaders=["From", "Subject", "Date"],
            )
            batch.add(request, callback=_make_callback(msg_id, all_messages, failed))

        _retry_request(lambda b=batch: b.execute())

        fetched = len(all_messages) + len(failed)
        if fetched % 500 < 100 or batch_start + 100 >= len(message_ids):
            print(f"Fetched {fetched}/~{estimate} messages...")


def _make_callback(msg_id, results, failed):
    """Create a batch callback that extracts metadata from a message."""
    def callback(request_id, response, exception):
        if exception:
            print(f"Warning: failed to fetch message {msg_id}: {exception}", file=sys.stderr)
            failed.append(msg_id)
            return

        headers = {}
        for header in response.get("payload", {}).get("headers", []):
            name = header.get("name", "")
            if name in ("From", "Subject", "Date"):
                headers[name] = header.get("value", "")

        results.append({
            "id": response["id"],
            "subject": headers.get("Subject", ""),
            "sender": headers.get("From", ""),
            "date": headers.get("Date", ""),
            "snippet": response.get("snippet", ""),
            "labelIds": response.get("labelIds", []),
        })

    return callback


def _retry_request(fn, max_retries=3):
    """Execute a request with exponential backoff on rate limits and network errors."""
    for attempt in range(max_retries):
        try:
            return fn()
        except HttpError as e:
            if e.resp.status == 429 and attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"Rate limited, waiting {wait}s...", file=sys.stderr)
                time.sleep(wait)
                continue
            raise
        except (ConnectionError, TimeoutError) as e:
            if attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"Network error, retrying in {wait}s: {e}", file=sys.stderr)
                time.sleep(wait)
                continue
            raise


def fetch_all_messages(service, query=""):
    """Fetch all messages and return list of metadata dicts."""
    print("Listing message IDs...")
    message_ids, estimate = fetch_all_message_ids(service, query)
    print(f"Found {len(message_ids)} messages (estimate was ~{estimate})")

    if not message_ids:
        return []

    all_messages = []
    fetch_metadata_batch(service, message_ids, estimate, all_messages)
    print(f"Done. Got metadata for {len(all_messages)} messages.")
    return all_messages


def default_output_path():
    """Return default output path with today's date."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    return CONFIG_DIR / f"scan_{datetime.now().strftime('%Y%m%d')}.json"


def main():
    parser = argparse.ArgumentParser(description="Fetch Gmail messages for classification")
    parser.add_argument("--query", default="", help="Gmail search query (default: all mail)")
    parser.add_argument("--output", default=None, help="Output JSON file path")
    args = parser.parse_args()

    output_path = Path(args.output) if args.output else default_output_path()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    service = get_gmail_service()
    messages = fetch_all_messages(service, query=args.query)

    output_path.write_text(json.dumps(messages, ensure_ascii=False, indent=2))
    print(f"Saved {len(messages)} messages to {output_path}")


if __name__ == "__main__":
    main()
