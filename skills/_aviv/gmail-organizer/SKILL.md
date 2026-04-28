---
name: gmail-organizer
description: This skill should be used when the user asks to "organize my Gmail", "clean up my inbox", "label my emails", "sort my Gmail", "categorize emails", "Gmail cleanup", "organize email", or needs to scan, classify, and archive Gmail messages into organized labels.
version: 0.1.0
---

# Gmail Organizer

Scan an entire Gmail inbox, classify every email into categories (Invoices, Receipts, Work, Personal, Newsletters, Finance, Travel, Shopping, Notifications), apply Gmail labels, and archive labeled emails. Promotional/junk emails always require explicit user approval before any action.

The workflow has three phases: dry run (scan + classify + preview), execute (label + archive), and summary report. Classification happens inline - Claude Code classifies emails directly rather than calling an external API.

## Prerequisites

Before first use, complete the one-time OAuth setup described in `references/setup-guide.md`. This creates a Desktop OAuth client in GCP and saves credentials to `~/.gmail-organizer/`.

Verify authentication works:

```bash
python3 ~/.claude/skills/gmail-organizer/scripts/gmail_auth.py --test
```

If this fails or no token exists, read `references/setup-guide.md` and walk the user through setup. The GCP project is `lead-scraper-claude`, the account is `pelegitto@gmail.com`.

Required scope: `gmail.modify` (read messages, create/apply labels, archive - no delete access).

## Phase 1: Dry Run

### Step 1 - Fetch all messages

Run the fetch script to pull metadata for every email in the inbox:

```bash
cd ~/.claude/skills/gmail-organizer/scripts
python3 gmail_fetch.py --output ~/.gmail-organizer/scan.json
```

For subsequent runs on new emails only:

```bash
python3 gmail_fetch.py --query "newer_than:7d" --output ~/.gmail-organizer/scan.json
```

This saves message metadata (id, subject, sender, date, snippet, labels) as JSON. Full inbox scans may take 1-2 minutes depending on mailbox size.

### Step 2 - Review summary

Get an overview before classifying:

```bash
python3 gmail_classify.py --input ~/.gmail-organizer/scan.json --summary
```

This prints total email count, top 20 senders, and existing Gmail category labels. Share this summary with the user.

### Step 3 - Classify emails

Read `references/categories.md` for category definitions and priority rules before classifying.

Process one batch at a time:

```bash
python3 gmail_classify.py --input ~/.gmail-organizer/scan.json --batch-size 50 --batch-number 1
```

For each batch, the script outputs a numbered list of emails with sender, subject, and snippet. Classify each email into one of the categories defined in `references/categories.md`:

**Invoices, Receipts, Work, Personal, Newsletters, Finance, Travel, Shopping, Notifications, Promotions/Junk, Unsorted**

Output classification as JSON mapping the batch index to category. Collect all batch results into a single classification file:

```json
{
  "message_id_1": "Invoices",
  "message_id_2": "Shopping",
  "message_id_3": "Promotions/Junk"
}
```

Save to `~/.gmail-organizer/classified.json`.

Classification rules:
- Read `references/categories.md` for keyword hints and priority rules
- When an email fits multiple categories, follow the priority rules (e.g., Amazon invoice = Invoices, not Shopping)
- When genuinely ambiguous, use "Unsorted" rather than guessing
- Marketing/spam-looking emails go to "Promotions/Junk" - these are NEVER auto-processed

### Step 4 - Present dry run summary

Present a table to the user showing:
- Count per category
- Sample emails per category (2-3 examples)
- Total "Unsorted" count
- Total "Promotions/Junk" count (flagged for manual review)
- Labels that will be created vs already exist

**Wait for explicit user confirmation ("go ahead") before proceeding to Phase 2.** Do not proceed without approval.

## Phase 2: Execute

### Step 1 - Create labels

```bash
cd ~/.claude/skills/gmail-organizer/scripts
python3 gmail_label.py --create-labels
```

This creates Gmail labels for all categories that don't already exist: Invoices, Receipts, Work, Personal, Newsletters, Finance, Travel, Shopping, Notifications, Unsorted.

### Step 2 - Apply labels and archive

```bash
python3 gmail_label.py --apply --input ~/.gmail-organizer/classified.json
```

This applies the category label to each email and removes it from the inbox (archives). Promotions/Junk emails are automatically skipped.

To label without archiving (if user requested):

```bash
python3 gmail_label.py --apply --input ~/.gmail-organizer/classified.json --no-archive
```

### Step 3 - Handle Promotions/Junk

List all promotional emails for user review:

```bash
python3 gmail_label.py --promotions --input ~/.gmail-organizer/classified.json
```

Present each promotional email to the user (sender, subject). Ask what to do:
- **Archive**: apply a "Promotions/Junk" label and archive
- **Skip**: leave untouched
- **Delete**: only if user explicitly says to delete

Process in small batches (10-20 at a time). Never auto-delete. Never proceed without user approval for each batch.

## Phase 3: Summary Report

After execution, print a full summary:

1. **Labels created**: list of new labels created in this run
2. **Emails per category**: count for each category (Invoices: 180, Receipts: 450, etc.)
3. **Archived**: total count of emails archived (removed from inbox)
4. **Unsorted**: count of emails that couldn't be classified - suggest user reviews these
5. **Promotions/Junk**: count processed with user approval, count skipped
6. **Errors**: any messages that failed to label (with IDs for re-running)

## Re-running the Skill

This skill is designed for repeat use. On subsequent runs:

1. Use `--query "newer_than:7d"` (or any period) to scan only new emails
2. The classification and labeling process is the same
3. Existing labels are reused (not duplicated)
4. Already-labeled emails are not re-processed by Gmail's batchModify

## Error Recovery

- If the fetch script fails midway, re-run it - the scan file is overwritten fresh
- If labeling fails on some messages, the error IDs are reported in the summary - re-run with just those IDs
- If OAuth token expires, delete `~/.gmail-organizer/token.json` and re-authenticate

## Additional Resources

### Reference Files

- **`references/setup-guide.md`** - One-time OAuth setup for GCP project, consent screen, credentials
- **`references/categories.md`** - Category definitions, keyword hints, and priority rules for classification

### Scripts

- **`scripts/gmail_auth.py`** - OAuth2 authentication, token caching, `--test` flag
- **`scripts/gmail_fetch.py`** - Paginated message metadata fetch with batch requests
- **`scripts/gmail_classify.py`** - Format email batches for inline classification, summary mode
- **`scripts/gmail_label.py`** - Create labels, apply labels, archive, promotions review
