# Gmail Organizer - One-Time OAuth Setup

## 1. Enable Gmail API

- Go to [GCP Console](https://console.cloud.google.com)
- Select project `lead-scraper-claude`
- Navigate to APIs & Services > Library
- Search "Gmail API" and enable it

Or use CLI:

```bash
gcloud services enable gmail.googleapis.com --project=lead-scraper-claude
```

## 2. Create OAuth Consent Screen

- Go to APIs & Services > OAuth consent screen
- User Type: External
- App name: "Gmail Organizer"
- User support email: pelegitto@gmail.com
- Scopes: add `https://www.googleapis.com/auth/gmail.modify`
- Test users: add `pelegitto@gmail.com`
- Save

## 3. Create OAuth Client ID

- Go to APIs & Services > Credentials
- Create Credentials > OAuth client ID
- Application type: Desktop app
- Name: "Gmail Organizer CLI"
- Download the JSON file
- Save as `~/.gmail-organizer/client_secret.json`

## 4. Authenticate

Run the auth script:

```bash
python3 ~/.claude/skills/gmail-organizer/scripts/gmail_auth.py
```

- Browser opens automatically - sign in with pelegitto@gmail.com
- Grant the requested permissions
- Token saved to `~/.gmail-organizer/token.json`

## 5. Verify

```bash
python3 ~/.claude/skills/gmail-organizer/scripts/gmail_auth.py --test
```

Expected output: `Authenticated as pelegitto@gmail.com`

## 6. Troubleshooting

- **"Access blocked"**: App is in test mode. Make sure pelegitto@gmail.com is listed in test users.
- **"Token expired"**: Delete `~/.gmail-organizer/token.json` and re-run the auth script.
- **"File not found"**: Ensure `client_secret.json` is at `~/.gmail-organizer/client_secret.json`.
