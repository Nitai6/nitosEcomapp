#!/usr/bin/env python3
"""Bulk classify emails using sender patterns and subject keywords."""

import json
import re
import sys
from collections import Counter
from pathlib import Path

# Sender-based classification rules (lowercase matching)
SENDER_RULES = {
    # Finance
    "interactive brokers": "Finance",
    "israel interactive": "Finance",
    "אינטראקטיב ישראל": "Finance",
    "binance": "Finance",
    "webull": "Finance",
    "בנק דיסקונט": "Finance",
    "millennium bcp": "Finance",
    "מיטב גמל": "Finance",
    "paypal": "Finance",
    "קארדקום": "Finance",
    "cardcom": "Finance",
    "bank": "Finance",
    "בנק": "Finance",
    "max it finance": "Finance",
    "cal-online": "Finance",
    "isracard": "Finance",
    "ישראכרט": "Finance",
    "leumi": "Finance",
    "לאומי": "Finance",
    "hapoalim": "Finance",
    "הפועלים": "Finance",
    "mizrahi": "Finance",
    "מזרחי": "Finance",
    "bit.co.il": "Finance",
    "pepper": "Finance",
    "wise.com": "Finance",
    "revolut": "Finance",

    # Travel
    "ryanair": "Travel",
    "booking.com": "Travel",
    "airbnb": "Travel",
    "wizzair": "Travel",
    "easyjet": "Travel",
    "elal": "Travel",
    "אל על": "Travel",
    "hotel": "Travel",
    "hostel": "Travel",
    "skyscanner": "Travel",
    "kayak": "Travel",
    "momondo": "Travel",
    "rentalcars": "Travel",
    "uber trip": "Travel",

    # Shopping
    "aliexpress": "Shopping",
    "amazon": "Shopping",
    "ebay": "Shopping",
    "decathlon": "Shopping",
    "מחסני חשמל": "Shopping",
    "glovo": "Shopping",
    "bolt food": "Shopping",
    "wolt": "Shopping",
    "ikea": "Shopping",
    "zara": "Shopping",
    "h&m": "Shopping",
    "asos": "Shopping",
    "shein": "Shopping",
    "temu": "Shopping",
    "ali express": "Shopping",

    # Notifications - SaaS/Apps
    "make.com": "Notifications",
    "from make": "Notifications",
    "sentry": "Notifications",
    "cal.com": "Notifications",
    "manychat": "Notifications",
    "clickup": "Notifications",
    "monday.com": "Notifications",
    "airtable": "Notifications",
    "fastbots": "Notifications",
    "loom": "Notifications",
    "vercel": "Notifications",
    "trello": "Notifications",
    "slack": "Notifications",
    "notion": "Notifications",
    "figma": "Notifications",
    "github": "Notifications",
    "gitlab": "Notifications",
    "heroku": "Notifications",
    "netlify": "Notifications",
    "stripe": "Notifications",
    "twilio": "Notifications",
    "sendgrid": "Notifications",
    "mailchimp": "Notifications",
    "zapier": "Notifications",
    "hubspot": "Notifications",
    "intercom": "Notifications",
    "crisp": "Notifications",
    "lovable": "Notifications",
    "codepen": "Notifications",
    "vimeo": "Notifications",
    "leonardo.ai": "Notifications",
    "tiktok": "Notifications",
    "whatsapp business": "Notifications",
    "mail delivery subsystem": "Notifications",
    "mailer-daemon": "Notifications",
    "google": "Notifications",
    "apple": "Notifications",
    "steam": "Notifications",
    "duolingo": "Notifications",

    # Notifications - Social
    "linkedin": "Notifications",
    "facebook": "Notifications",
    "פייסבוק": "Notifications",
    "meta for business": "Notifications",
    "reddit": "Notifications",
    "twitter": "Notifications",
    "instagram": "Notifications",

    # Newsletters
    "substack": "Newsletters",
    "לקט quora": "Newsletters",
    "quora digest": "Newsletters",
    "coursera": "Newsletters",
    "medium": "Newsletters",
    "tyler t": "Newsletters",

    # Promotions - Real estate
    "idealista": "Promotions/Junk",
    "suncebeat": "Promotions/Junk",

    # Work
    "prospero": "Work",
    "upwork": "Work",
    "fiverr": "Work",

    # Receipts
    "upay": "Receipts",
    "info@upay": "Receipts",
}

# Subject keyword rules (checked if sender didn't match)
SUBJECT_RULES = [
    # Invoices
    (r"(invoice|חשבונית|bill|חיוב|payment due|תשלום)", "Invoices"),
    # Receipts
    (r"(receipt|קבלה|order confirm|הזמנה.*אושרה|payment received|thank.*purchase)", "Receipts"),
    # Finance
    (r"(statement|bank|transaction|transfer|העברה|יתרה|balance|tax|מס הכנסה|ביטוח לאומי)", "Finance"),
    # Travel
    (r"(flight|טיסה|booking confirm|hotel|hostel|itinerary|check.in|boarding pass)", "Travel"),
    # Shopping
    (r"(shipped|delivered|tracking|out for delivery|משלוח|נשלח|הגיע)", "Shopping"),
    # Notifications
    (r"(verify|security code|sign.in|password|אימות|reset|2fa|otp|login attempt)", "Notifications"),
    (r"(notification|alert|reminder|תזכורת)", "Notifications"),
    # Newsletters
    (r"(newsletter|digest|weekly|roundup|עדכון שבועי)", "Newsletters"),
    # Promotions
    (r"(sale|discount|offer|limited time|exclusive|מבצע|הנחה|% off|\bfree\b|coupon|קופון)", "Promotions/Junk"),
]


def classify_email(email):
    sender = (email.get("sender") or "").lower()
    subject = (email.get("subject") or "").lower()
    snippet = (email.get("snippet") or "").lower()
    label_ids = email.get("labelIds", [])

    # Check sender rules
    for pattern, category in SENDER_RULES.items():
        if pattern in sender:
            return category

    # Self-sent emails
    if "pelegitto" in sender and ("gmail" in sender or "peleg" in sender.split("<")[0].lower() if "<" in sender else "peleg" in sender):
        return "Personal"

    # Check subject rules
    for pattern, category in SUBJECT_RULES:
        if re.search(pattern, subject, re.IGNORECASE):
            return category
        if re.search(pattern, snippet, re.IGNORECASE):
            return category

    # Gmail's own category labels as hints
    if "CATEGORY_PROMOTIONS" in label_ids:
        return "Promotions/Junk"
    if "CATEGORY_SOCIAL" in label_ids:
        return "Notifications"
    if "CATEGORY_FORUMS" in label_ids:
        return "Newsletters"

    # Emails from individuals (no noreply, no automated patterns)
    if not any(x in sender for x in ["noreply", "no-reply", "donotreply", "notification", "info@", "support@", "team@", "hello@", "news@", "marketing@"]):
        # Check if it looks like a personal email
        if re.search(r"@gmail\.com|@hotmail|@yahoo|@outlook", sender):
            return "Personal"

    return "Unsorted"


def main():
    scan_path = Path.home() / ".gmail-organizer" / "scan.json"
    with open(scan_path) as f:
        emails = json.load(f)

    classifications = {}
    category_counts = Counter()
    category_samples = {}

    for email in emails:
        msg_id = email.get("id", "")
        category = classify_email(email)
        classifications[msg_id] = category
        category_counts[category] += 1

        # Save samples (first 3 per category)
        if category not in category_samples:
            category_samples[category] = []
        if len(category_samples[category]) < 3:
            sender = (email.get("sender") or "unknown")
            if "<" in sender:
                sender = sender.split("<")[0].strip().strip('"')
            subject = email.get("subject", "(no subject)")
            category_samples[category].append(f"{sender} - {subject}")

    # Save classifications
    output_path = Path.home() / ".gmail-organizer" / "classified.json"
    with open(output_path, "w") as f:
        json.dump(classifications, f, indent=2, ensure_ascii=False)

    # Print summary
    print(f"Total classified: {len(classifications)}")
    print(f"\n{'Category':<20} {'Count':>6}")
    print("-" * 28)
    for category, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"{category:<20} {count:>6}")

    print("\n--- Samples per category ---")
    for category in sorted(category_samples.keys()):
        print(f"\n{category}:")
        for sample in category_samples[category]:
            print(f"  - {sample[:100]}")

    print(f"\nClassifications saved to {output_path}")


if __name__ == "__main__":
    main()
