# Owner's 25 Copy Deliverables Prompt (Prompt 2)

Full prompt in `../SKILL.md` → "Owner's playbook (verbatim) → Prompt 2".

## Output structure

```json
{
  "phase_1_core_brand": {
    "tagline": "...",
    "elevator_pitch": "...",
    "manifesto": "..."
  },
  "phase_2_storefront": {
    "hero_headline": "...",
    "hero_sub": "...",
    "hero_cta": "...",
    "trust_bar": ["...", "...", "..."],
    "category_hooks": ["...", "...", "..."],
    "social_proof_header": "..."
  },
  "phase_3_conversion_engine": {
    "product_description_hook": "...",
    "core_mechanism_explainer": "...",
    "shipping_accordion": "...",
    "objection_faq": [{"q": "...", "a": "..."}, ...]
  },
  "phase_4_checkout_retention": {
    "cart_drawer": "...",
    "checkout_guarantee": "...",
    "thank_you_page": "..."
  },
  "phase_5_backend": {
    "welcome_1": {"subject": "...", "body": "..."},
    "welcome_2": {"subject": "...", "body": "..."},
    "abandoned_cart_1": {"subject": "...", "body": "..."},
    "viral_loop_email": {"subject": "...", "body": "..."}
  },
  "phase_6_top_of_funnel": {
    "video_ad_script": {"visual": "...", "hook": "...", "body": "...", "cta": "..."},
    "native_ad_copy": {"primary_text": "...", "headline": "..."},
    "retargeting_ad": "..."
  },
  "phase_7_cx": {
    "unboxing_insert": "...",
    "cx_macro_shipping": "..."
  }
}
```

## Routing

- `phase_5` → `emails-sms`
- `phase_6` → `ads-create`
- `phase_2`, `phase_3`, `phase_4` → `website-builder`
- `phase_1`, `phase_7` → repo branding/cx docs
