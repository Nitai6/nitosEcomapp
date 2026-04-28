---
name: utm-params
description: Generate standardized UTM parameters for Meta ad URLs based on campaign, ad set, and ad details
---

# UTM Parameter Generator

Generate standardized UTM parameters for Meta ad URLs. Every ad URL must use this format.

## UTM Structure

```
{base_url}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}&utm_term={term}
```

## Field Definitions

### utm_source
Where the traffic comes from. Always lowercase, no spaces.

| Platform | Value |
|----------|-------|
| Meta (Facebook/Instagram) | `meta` |
| Google Ads | `google` |
| TikTok Ads | `tiktok` |
| Email | `email` |
| Organic social | `organic` |

### utm_medium
Traffic type. Always lowercase.

| Type | Value |
|------|-------|
| Paid ads | `paid` |
| Organic post | `organic` |
| Email campaign | `email` |
| Referral | `referral` |

### utm_campaign
Campaign name. Lowercase, hyphens instead of spaces. Must match the campaign purpose.

Format: `{product}-{phase}`

**Examples:**
- `your-product-launch`
- `your-product-scaling`
- `your-product-retargeting`

### utm_content
Ad set angle or content variant. Lowercase, hyphens instead of spaces.

**Examples:**
- `meme-humor`
- `transformation`
- `aspirational`
- `social-proof`
- `authority`
- `value-stack`
- `pain-point`
- `retargeting-web`
- `retargeting-ig`

### utm_term
Specific creative or ad identifier. Lowercase, hyphens instead of spaces. Use the creative slug from `creative-db.json`.

**Examples:**
- `drake`
- `distracted-boyfriend`
- `heist-crew-v2`
- `before-after`

## Rules

- All values are **lowercase**
- Use **hyphens** as separators, never underscores or spaces
- Never include tracking IDs, tokens, or PII in UTM params
- Every ad created through the API must include UTM parameters
- Base URLs never have trailing slashes
- Read `creative-db.json` to look up creative slugs when generating UTMs

## Process

1. Ask for (or derive from context): base URL, campaign name, ad set angle, creative slug
2. Generate the full URL with UTM params
3. Output in a format ready to paste or use in API calls

## Output Format

For a single URL:
```
https://your-destination-url.com?utm_source=meta&utm_medium=paid&utm_campaign=your-product-launch&utm_content=meme-humor&utm_term=drake
```

For a batch (when generating for multiple ads):
```
| Creative | URL |
|----------|-----|
| drake | https://your-destination-url.com?utm_source=meta&utm_medium=paid&utm_campaign=your-product-launch&utm_content=meme-humor&utm_term=drake |
| distracted-boyfriend | https://your-destination-url.com?utm_source=meta&utm_medium=paid&utm_campaign=your-product-launch&utm_content=meme-humor&utm_term=distracted-boyfriend |
```

## Defaults

- **Base URL:** Set `DESTINATION_URL` in `.env`
- **Source:** `meta`
- **Medium:** `paid`
- **utm_campaign:** `your-product-launch` (update to match your campaign phase)
