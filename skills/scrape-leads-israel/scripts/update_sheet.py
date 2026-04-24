#!/usr/bin/env python3
"""
Upload leads JSON to Google Sheets using OAuth credentials.
"""

import argparse
import json
import os
import sys

import gspread
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CREDS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "credentials")
CLIENT_SECRET = os.path.join(CREDS_DIR, "client_secret.json")
TOKEN_FILE = os.path.join(CREDS_DIR, "token.json")


def get_credentials():
    """Get or refresh OAuth credentials."""
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())

    return creds


def upload_to_sheet(json_path, title="Leads"):
    """Upload leads from JSON file to a new Google Sheet."""
    # Load leads
    with open(json_path, 'r', encoding='utf-8') as f:
        leads = json.load(f)

    if not leads:
        print("No leads to upload!", file=sys.stderr)
        return None

    print(f"Uploading {len(leads)} leads to Google Sheets...", file=sys.stderr)

    # Authenticate
    creds = get_credentials()
    gc = gspread.authorize(creds)

    # Create spreadsheet
    sh = gc.create(title)

    # Share with anyone who has the link (viewer)
    sh.share('', perm_type='anyone', role='writer')

    # Get first worksheet
    ws = sh.sheet1
    ws.update_title("Leads")

    # Headers
    headers = ["Name", "Phone", "Email", "Website", "Address", "Rating", "Reviews", "Category", "Google Maps URL"]

    # Prepare rows
    rows = [headers]
    for lead in leads:
        rows.append([
            lead.get("name", ""),
            lead.get("phone", ""),
            lead.get("email", ""),
            lead.get("website", ""),
            lead.get("address", ""),
            lead.get("rating", ""),
            lead.get("reviews_count", ""),
            lead.get("category", ""),
            lead.get("google_maps_url", ""),
        ])

    # Batch update
    ws.update(rows, 'A1')

    # Format header row (bold)
    ws.format('A1:I1', {
        'textFormat': {'bold': True},
        'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.95}
    })

    # Auto-resize columns
    sheet_url = sh.url
    print(f"\nGoogle Sheet created: {sheet_url}", file=sys.stderr)
    print(sheet_url)  # stdout for programmatic use
    return sheet_url


def parse_args():
    parser = argparse.ArgumentParser(description="Upload leads to Google Sheets")
    parser.add_argument("json_path", help="Path to leads JSON file")
    parser.add_argument("--title", default="Leads", help="Sheet title")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    upload_to_sheet(args.json_path, args.title)
