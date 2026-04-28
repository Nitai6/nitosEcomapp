# Owner's Content Sourcing Method (verbatim)

> Doing research in Reddit questions, Quora, YouTube, Google blog posts, and we create content from content by taking a question in Reddit for example and answering it in a comprehensive blog post. For example we take a blog post from someone else in our niche, take a paragraph, and make from this paragraph a full authorial blog post. This is the way of extracting and getting content from.

## Source types + how to mine each

| Source | Tool | What to extract |
|---|---|---|
| **Reddit** | reddit MCP / playwright on subreddit search | Top-upvoted questions in niche; pain points in comments |
| **Quora** | playwright | Questions with 5+ answers (validates demand) |
| **YouTube** | playwright (search niche keyword) | Top videos to embed; comment threads for objections |
| **Google blogs** | dataforseo SERP + playwright fetch | Take a paragraph, expand to authorial post |
| **PubMed** | pubmed MCP | Studies for research-grade claims (EEAT) |
| **Apify** | playwright web scraper | Bulk niche-site scraping when needed |

## Workflow

1. Pick microtopic from topic plan
2. Run 5 searches (one per source type above) with niche keywords
3. Save top 10 results from each to `state/seo-blog/sources/{slug}/`
4. Score each by: relevance (1-10), depth (1-10), authority (1-10)
5. Pick top 5 → become the research base for the article
6. Write article using formula picker → reference all 5 sources for EEAT

## EEAT-source priority

For YMYL (health/money/safety) topics:
1. PubMed studies
2. Wikipedia (fact base + nofollow link target)
3. Established niche authorities
4. Reddit/Quora (only for pain-point qualitative, not factual claims)

## Helpful, not sales

> Per owner: "the product mentions are helpful mentions as a helpful resource and not sales pitches."

Insert product mentions only where they genuinely solve the reader's problem in context. Cap: 2-4 product mentions per 2,000 words.
