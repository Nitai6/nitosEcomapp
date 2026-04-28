---
name: scrape-leads-israel
description: Scrape and verify Israeli business leads directly from Google Maps, classify with LLM, enrich emails, and save to Google Sheets. Use when user asks to find leads, scrape businesses, generate prospect lists, or build lead databases for any industry in Israel.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Lead Scraping & Verification — Israel

## Goal
Scrape Israeli business leads directly from Google Maps (no Apify), verify their relevance (industry match > 80%), and save them to a Google Sheet. For large scrapes (1000+ leads), use parallel scraping across Israeli regions for 3-5x faster performance.

## Inputs
- **Industry**: The target industry (e.g., "שיפוצניקים", "מסעדות", "Software Agencies")
- **Location**: An Israeli location (e.g., "תל אביב", "חיפה", "Israel", "באר שבע"). Defaults to all of Israel if not specified.
- **Total Count**: The total number of leads desired

## Scripts
All scripts are in `./scripts/`:
- `scrape_google_maps.py` – Direct Google Maps scraper, for <1000 leads
- `scrape_google_maps_parallel.py` – Parallel Google Maps scraping across Israeli regions, for 1000+ leads
- `enrich_emails.py` – Email enrichment by scraping business websites (free, no API key needed)
- `update_sheet.py` – Batch sheet updates (includes Email column)
- `read_sheet.py` – Read data from Google Sheets

## Process

### Small Scrapes (<1000 Leads)

1. **Test Scrape**
```bash
python3 ./scripts/scrape_google_maps.py --query "INDUSTRY" --location "LOCATION, Israel" --max_items 25 --output .tmp/test_leads.json
```

2. **Verification**
- Read `.tmp/test_leads.json`
- Check if at least 20/25 (80%) leads match the industry
- **Pass**: Proceed to step 3
- **Fail**: Stop and ask user to refine keywords (try Hebrew keywords if English didn't work, or vice versa)

3. **Full Scrape**
```bash
python3 ./scripts/scrape_google_maps.py --query "INDUSTRY" --location "LOCATION, Israel" --max_items TOTAL_COUNT --output .tmp/leads.json
```

4. **[Optional] LLM Classification** (for complex niches)
```bash
python3 ./scripts/classify_leads_llm.py .tmp/leads.json --classification_type product_saas --output .tmp/classified_leads.json
```

5. **Enrich Emails** (scrapes business websites for email addresses)
```bash
python3 ./scripts/enrich_emails.py .tmp/leads.json
```

6. **Upload to Google Sheet**
```bash
python3 ./scripts/update_sheet.py .tmp/leads.json --title "Leads - INDUSTRY - Israel"
```

### Large Scrapes (1000+ Leads)

1. **Test Scrape** (same as above with 25 items)

2. **Parallel Full Scrape**
```bash
python3 ./scripts/scrape_google_maps_parallel.py \
  --query "INDUSTRY" \
  --total_count 4000 \
  --location "Israel" \
  --strategy regions
```

Geographic partitioning for Israel is automatic:
- **Central**: Tel Aviv, Ramat Gan, Petah Tikva, Rishon LeZion, Holon, Bat Yam, Bnei Brak, Herzliya, Netanya, Kfar Saba, Ra'anana
- **North**: Haifa, Nazareth, Tiberias, Acre, Nahariya, Afula, Karmiel, Safed
- **South**: Beer Sheva, Ashdod, Ashkelon, Eilat, Arad, Dimona, Kiryat Gat
- **Jerusalem & Surroundings**: Jerusalem, Beit Shemesh, Modi'in, Ramla, Lod
- **Sharon & Shfela**: Netanya, Hadera, Rehovot, Nes Ziona, Yavne, Lod

3. Continue with steps 4-6 from small scrapes (enrich emails, then upload)

## Israel-Specific Notes
- **Hebrew queries** often yield more results than English for local businesses. Try both if results are low.
- **Location format**: Always append ", Israel" to city names (e.g., "תל אביב, Israel" or "Tel Aviv, Israel").
- **Phone format**: Israeli numbers typically start with +972. The scraper preserves the original format from Google Maps.
- **Business hours**: Results may include Shabbat/holiday closures — this is expected and not an error.

## Outputs
**The ONLY deliverable is the Google Sheet URL.** Local JSON files in `.tmp/` are temporary intermediates.

## Edge Cases
- **No leads found**: Try Hebrew keywords, broaden location, or ask user to refine search
- **API Error**: Check credentials in `.env`
- **Low quality classifications**: If >80% "unclear", improve scrape keywords
- **Duplicate leads across regions**: The parallel scraper deduplicates by phone number and business name

## Environment
Requires in `.env`:
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
ANTHROPIC_API_KEY=your_key
