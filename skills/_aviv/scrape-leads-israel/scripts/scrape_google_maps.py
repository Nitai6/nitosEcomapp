#!/usr/bin/env python3
"""
Google Maps lead scraper using Playwright.
Scrapes business listings directly from Google Maps search results.
"""

import argparse
import json
import time
import re
import sys
from urllib.parse import unquote
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout


def parse_args():
    parser = argparse.ArgumentParser(description="Scrape Google Maps for business leads")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--location", required=True, help="Location")
    parser.add_argument("--max_items", type=int, default=25, help="Max leads to scrape")
    parser.add_argument("--output", required=True, help="Output JSON file path")
    return parser.parse_args()


def scroll_results(page, target_count, max_scrolls=200):
    """Scroll the results panel to load more businesses."""
    prev_count = 0
    no_change_count = 0

    for i in range(max_scrolls):
        items = page.query_selector_all('div[role="feed"] > div > div > a[href*="/maps/place/"]')
        current_count = len(items)
        print(f"  Scroll {i+1}: {current_count} items loaded", file=sys.stderr)

        if current_count >= target_count:
            break

        if current_count == prev_count:
            no_change_count += 1
            if no_change_count >= 5:
                end_text = page.query_selector('span.HlvSq')
                if end_text or no_change_count >= 10:
                    print(f"  Reached end of results at {current_count} items", file=sys.stderr)
                    break
        else:
            no_change_count = 0

        prev_count = current_count
        feed = page.query_selector('div[role="feed"]')
        if feed:
            feed.evaluate('el => el.scrollTop = el.scrollHeight')
        time.sleep(1.5)

    return page.query_selector_all('div[role="feed"] > div > div > a[href*="/maps/place/"]')


def extract_from_page(page):
    """Extract business details from a Google Maps place page."""
    result = {
        "name": "", "phone": "", "website": "", "address": "",
        "rating": "", "reviews_count": "", "category": "",
        "google_maps_url": page.url
    }

    try:
        page.wait_for_selector('h1', timeout=8000)
        time.sleep(1.5)
    except PlaywrightTimeout:
        return result

    # Name
    h1 = page.query_selector('h1')
    if h1:
        result["name"] = h1.inner_text().strip()

    # Category
    cat = page.query_selector('button[jsaction*="category"]')
    if cat:
        result["category"] = cat.inner_text().strip()

    # Rating
    rating_el = page.query_selector('div.fontDisplayLarge')
    if rating_el:
        result["rating"] = rating_el.inner_text().strip()

    # Reviews
    reviews_el = page.query_selector('span[aria-label*="review"], span[aria-label*="ביקורת"]')
    if reviews_el:
        aria = reviews_el.get_attribute("aria-label") or ""
        nums = re.findall(r'[\d,]+', aria)
        if nums:
            result["reviews_count"] = nums[0].replace(",", "")

    # Extract info from all aria-labeled elements in the info section
    all_buttons = page.query_selector_all('button[aria-label], a[aria-label]')
    for btn in all_buttons:
        aria = (btn.get_attribute("aria-label") or "").strip()
        data_id = (btn.get_attribute("data-item-id") or "").strip()

        # Phone
        if not result["phone"] and ("phone" in data_id or "טלפון" in aria.lower() or "phone" in aria.lower()):
            phones = re.findall(r'[\d\-+() ]{7,}', aria)
            if phones:
                result["phone"] = phones[0].strip()

        # Address
        if not result["address"] and ("address" in data_id or "כתובת" in aria.lower() or "address" in aria.lower()):
            addr = re.sub(r'^(Copy address|העתק כתובת)[:\s]*', '', aria, flags=re.IGNORECASE).strip()
            if addr and addr != aria:
                result["address"] = addr
            elif len(aria) > 10 and not any(k in aria.lower() for k in ["phone", "website", "טלפון", "אתר"]):
                result["address"] = aria

        # Website (from href)
        if not result["website"] and ("authority" in data_id or "website" in data_id or "אתר" in aria.lower() or "website" in aria.lower()):
            href = btn.get_attribute("href") or ""
            if href and "google" not in href:
                result["website"] = href

    # Fallback: try extracting phone from the page text
    if not result["phone"]:
        phone_btn = page.query_selector('[data-item-id*="phone"] .fontBodyMedium')
        if phone_btn:
            result["phone"] = phone_btn.inner_text().strip()

    # Fallback: extract address from dedicated element
    if not result["address"]:
        addr_btn = page.query_selector('[data-item-id="address"] .fontBodyMedium')
        if addr_btn:
            result["address"] = addr_btn.inner_text().strip()

    # Fallback: extract website from link
    if not result["website"]:
        web_link = page.query_selector('a[data-item-id="authority"]')
        if web_link:
            result["website"] = web_link.get_attribute("href") or ""

    return result


def scrape_google_maps(query, location, max_items, output_path):
    """Main scraping function."""
    search_term = f"{query} {location}"
    maps_url = f"https://www.google.com/maps/search/{search_term.replace(' ', '+')}"

    print(f"Scraping: {search_term}", file=sys.stderr)
    print(f"Target: {max_items} leads", file=sys.stderr)
    print(f"URL: {maps_url}", file=sys.stderr)

    leads = []
    seen_names = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            locale="he-IL",
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        try:
            page.goto(maps_url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(5)

            # Accept consent if prompted
            try:
                consent = page.query_selector('button[aria-label*="Accept"], form[action*="consent"] button')
                if consent:
                    consent.click()
                    time.sleep(2)
            except:
                pass

            # Check for results feed
            feed = page.query_selector('div[role="feed"]')
            if not feed:
                # Might be a single result page
                print("No feed found, checking for single result...", file=sys.stderr)
                detail = extract_from_page(page)
                if detail["name"]:
                    leads.append(detail)
            else:
                # Scroll to load results
                print(f"\nScrolling to load {max_items} results...", file=sys.stderr)
                link_elements = scroll_results(page, max_items)
                total_found = len(link_elements)
                print(f"\nFound {total_found} listings. Extracting details...\n", file=sys.stderr)

                # Collect hrefs
                hrefs = []
                for el in link_elements[:max_items]:
                    href = el.get_attribute("href")
                    if href:
                        hrefs.append(href)

                for i, href in enumerate(hrefs):
                    try:
                        page.goto(href, wait_until="domcontentloaded", timeout=15000)
                        time.sleep(2)
                        detail = extract_from_page(page)

                        # Fallback name from URL
                        if not detail["name"]:
                            name_part = href.split("/maps/place/")[1].split("/")[0] if "/maps/place/" in href else ""
                            detail["name"] = unquote(name_part.replace("+", " ")).strip()

                        if detail["name"] and detail["name"] not in seen_names:
                            seen_names.add(detail["name"])
                            leads.append(detail)
                            print(f"[{i+1}/{len(hrefs)}] {detail['name']} | {detail['phone']} | {detail['website']}", file=sys.stderr)
                        else:
                            print(f"[{i+1}/{len(hrefs)}] (duplicate or empty, skipped)", file=sys.stderr)

                    except Exception as e:
                        print(f"[{i+1}/{len(hrefs)}] Error: {e}", file=sys.stderr)

        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
        finally:
            browser.close()

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {len(leads)} leads -> {output_path}", file=sys.stderr)
    return leads


if __name__ == "__main__":
    args = parse_args()
    scrape_google_maps(args.query, args.location, args.max_items, args.output)
