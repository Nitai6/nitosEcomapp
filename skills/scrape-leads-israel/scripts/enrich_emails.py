#!/usr/bin/env python3
"""
Email enrichment by scraping business websites.
Visits each lead's website and extracts email addresses from the page content.
"""

import argparse
import json
import re
import sys
import time
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Common contact page paths to check if no email found on homepage
CONTACT_PATHS = [
    "/contact", "/contact-us", "/about", "/about-us",
    "/צור-קשר", "/צרו-קשר", "/יצירת-קשר",
    "/kontakt", "/contacto",
]

EMAIL_REGEX = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

# Emails to ignore (generic/placeholder)
IGNORED_EMAILS = {
    "example@example.com", "email@example.com", "your@email.com",
    "info@example.com", "test@test.com", "name@domain.com",
}

IGNORED_DOMAINS = {
    "sentry.io", "wixpress.com", "googleapis.com", "google.com",
    "facebook.com", "twitter.com", "instagram.com", "youtube.com",
    "w3.org", "schema.org", "gravatar.com", "wordpress.org",
    "cloudflare.com", "jsdelivr.net", "gstatic.com", "site123.com",
}


def is_valid_email(email):
    """Filter out junk emails."""
    email = email.lower().strip()
    if email in IGNORED_EMAILS:
        return False
    domain = email.split("@")[1] if "@" in email else ""
    if domain in IGNORED_DOMAINS or any(domain.endswith("." + d) for d in IGNORED_DOMAINS):
        return False
    if domain.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".css", ".js")):
        return False
    if len(email) > 80:
        return False
    return True


def extract_emails_from_html(html):
    """Extract emails from raw HTML content."""
    # Find mailto: links
    mailto_emails = re.findall(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', html)
    # Find emails in visible text
    text_emails = EMAIL_REGEX.findall(html)

    all_emails = set(mailto_emails + text_emails)
    return [e for e in all_emails if is_valid_email(e)]


def scrape_emails_from_website(browser, website_url, check_contact_page=True):
    """Visit a website and extract email addresses."""
    emails = []
    context = None

    try:
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Block images/fonts/media for speed
        page.route("**/*.{png,jpg,jpeg,gif,svg,webp,woff,woff2,ttf,mp4,mp3}", lambda route: route.abort())

        # Visit homepage
        page.goto(website_url, wait_until="domcontentloaded", timeout=15000)
        time.sleep(2)
        html = page.content()
        emails = extract_emails_from_html(html)

        # If no email found, try contact page
        if not emails and check_contact_page:
            for path in CONTACT_PATHS:
                try:
                    contact_url = urljoin(website_url, path)
                    page.goto(contact_url, wait_until="domcontentloaded", timeout=10000)
                    time.sleep(1.5)
                    html = page.content()
                    found = extract_emails_from_html(html)
                    if found:
                        emails = found
                        break
                except:
                    continue

    except Exception:
        pass
    finally:
        if context:
            context.close()

    return emails


def enrich_leads(input_path, output_path=None, max_workers=3):
    """Enrich leads with emails by scraping their websites."""
    with open(input_path, 'r', encoding='utf-8') as f:
        leads = json.load(f)

    if output_path is None:
        output_path = input_path

    total = len(leads)
    with_website = sum(1 for l in leads if l.get("website"))
    print(f"Enriching {total} leads ({with_website} have websites)...", file=sys.stderr)

    enriched = 0
    skipped = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for i, lead in enumerate(leads):
            website = lead.get("website", "").strip()

            if not website:
                skipped += 1
                print(f"[{i+1}/{total}] {lead.get('name', '?')} — no website, skipped", file=sys.stderr)
                continue

            # Ensure URL has scheme
            if not website.startswith(("http://", "https://")):
                website = "https://" + website

            emails = scrape_emails_from_website(browser, website)

            if emails:
                lead["email"] = emails[0]  # Primary email
                lead["all_emails"] = ", ".join(emails) if len(emails) > 1 else ""
                enriched += 1
                print(f"[{i+1}/{total}] {lead.get('name', '?')} — {emails[0]}", file=sys.stderr)
            else:
                lead["email"] = ""
                lead["all_emails"] = ""
                print(f"[{i+1}/{total}] {lead.get('name', '?')} — no email found", file=sys.stderr)

        browser.close()

    # Save enriched leads
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {enriched}/{with_website} websites had emails ({total} total leads)", file=sys.stderr)
    print(f"Saved to: {output_path}", file=sys.stderr)
    return leads


def parse_args():
    parser = argparse.ArgumentParser(description="Enrich leads with emails by scraping websites")
    parser.add_argument("input", help="Path to leads JSON file")
    parser.add_argument("--output", help="Output JSON path (defaults to overwriting input)")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    enrich_leads(args.input, args.output)
