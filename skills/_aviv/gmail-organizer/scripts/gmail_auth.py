#!/usr/bin/env python3
"""OAuth2 authentication for Gmail API access."""

import argparse
import sys
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
CONFIG_DIR = Path.home() / ".gmail-organizer"
TOKEN_PATH = CONFIG_DIR / "token.json"
CLIENT_SECRET_PATH = CONFIG_DIR / "client_secret.json"


def get_gmail_service():
    """Return an authenticated Gmail API service object."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    creds = None

    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_PATH.write_text(creds.to_json())
    elif not creds or not creds.valid:
        if not CLIENT_SECRET_PATH.exists():
            print(
                f"Error: {CLIENT_SECRET_PATH} not found.\n\n"
                "To set up Gmail API access:\n"
                "1. Go to https://console.cloud.google.com/apis/credentials\n"
                "2. Create an OAuth 2.0 Client ID (Desktop app)\n"
                "3. Download the JSON and save it as:\n"
                f"   {CLIENT_SECRET_PATH}\n"
                "4. Enable the Gmail API at:\n"
                "   https://console.cloud.google.com/apis/library/gmail.googleapis.com",
                file=sys.stderr,
            )
            sys.exit(1)

        flow = InstalledAppFlow.from_client_secrets_file(
            str(CLIENT_SECRET_PATH), SCOPES
        )
        creds = flow.run_local_server(port=0)
        TOKEN_PATH.write_text(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def main():
    parser = argparse.ArgumentParser(description="Gmail OAuth2 authentication")
    parser.add_argument("--test", action="store_true", help="Print authenticated email")
    args = parser.parse_args()

    if args.test:
        service = get_gmail_service()
        profile = service.users().getProfile(userId="me").execute()
        print(f"Authenticated as: {profile['emailAddress']}")


if __name__ == "__main__":
    main()
