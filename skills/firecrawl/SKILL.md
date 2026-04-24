---
name: firecrawl
description: Scrape, crawl, and extract structured data from any website using Firecrawl. Use when the user wants to scrape a URL, crawl a website, extract structured data from web pages, take screenshots, or search the web and get full page content. Trigger on words like "scrape", "crawl", "extract from website", "web scraping", or when given a URL to extract content from.
---

# Firecrawl — Web Scraping Skill

Firecrawl converts any URL to clean markdown, HTML, screenshots, or structured JSON — ready for LLM processing.

## Setup

**SDK installed:** `firecrawl-py` (v4.22.1)

**API key required:** Get it from firecrawl.dev → add to env:
```bash
export FIRECRAWL_API_KEY=fc-your-key-here
```
Or check `~/.claude/.env` / project `.env` for `FIRECRAWL_API_KEY`.

## How to use in code

### Scrape a single URL → Markdown
```python
from firecrawl import FirecrawlApp
import os

app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
result = app.scrape_url("https://example.com")
print(result.markdown)
```

### Scrape → structured JSON (with schema)
```python
from pydantic import BaseModel

class ProductSchema(BaseModel):
    name: str
    price: str
    description: str

result = app.scrape_url(
    "https://example.com/product",
    formats=["extract"],
    extract={"schema": ProductSchema.model_json_schema()}
)
print(result.extract)
```

### Crawl entire website
```python
result = app.crawl_url(
    "https://example.com",
    limit=50,           # max pages
    scrape_options={"formats": ["markdown"]}
)
for page in result.data:
    print(page.url, page.markdown[:200])
```

### Web search + full page content
```python
results = app.search("claude code tips", limit=5)
for r in results.data:
    print(r.url, r.markdown[:300])
```

### Screenshot
```python
result = app.scrape_url("https://example.com", formats=["screenshot"])
# result.screenshot → base64 image or URL
```

## When Claude runs Firecrawl directly

When the user gives a URL to scrape/extract:

1. Check `FIRECRAWL_API_KEY` is set — if not, ask the user
2. Write a short Python script to `/tmp/firecrawl_run.py`
3. Run it with `python3 /tmp/firecrawl_run.py`
4. Return the extracted content to the user

**Quick one-liner for scraping:**
```bash
python3 -c "
from firecrawl import FirecrawlApp
import os
app = FirecrawlApp(api_key=os.getenv('FIRECRAWL_API_KEY'))
r = app.scrape_url('URL_HERE')
print(r.markdown)
"
```

## Common use cases

| Task | Method |
|---|---|
| Get page content as markdown | `scrape_url(url)` |
| Extract specific fields | `scrape_url(url, formats=['extract'], extract={...})` |
| Scrape all pages of a site | `crawl_url(url, limit=N)` |
| Search + get page content | `search(query, limit=N)` |
| Take screenshot | `scrape_url(url, formats=['screenshot'])` |
| Interact with page (click/type) | `scrape_url(url, actions=[...])` |

## Pricing note

Free tier: 500 credits/month. Scraping 1 page = 1 credit. Crawling = 1 credit/page.
