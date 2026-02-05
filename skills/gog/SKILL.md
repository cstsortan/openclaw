---
name: gog
description: Google Workspace CLI for Gmail, Calendar, Drive, Contacts, Sheets, and Docs.
homepage: https://gogcli.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🎮",
        "requires": { "bins": ["gog"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/gogcli",
              "bins": ["gog"],
              "label": "Install gog (brew)",
            },
          ],
      },
  }
---

# gog

Use `gog` for Gmail/Calendar/Drive/Contacts/Sheets/Docs. OAuth credentials are pre-configured.

## Setup (once)

**Note**: OAuth client credentials are already configured via environment variables. You only need to authorize your Google account.

### Check Existing Authorization

```bash
# Check if you already have tokens for your account
gog auth list
```

If your email is already listed, you're done. Skip to [Common commands](#common-commands).

### Authorize Your Google Account (Manual Mode)

**Important**: Always use `--manual` mode. The local callback server does not work in this environment.

```bash
gog auth add you@gmail.com --services gmail,calendar,drive,contacts,docs,sheets --manual
```

**Manual authorization flow:**

1. Run the command above
2. You'll receive a Google consent URL
3. Open the URL in your browser (any device)
4. Approve the consent
5. Google redirects to `http://localhost:1/` (the page won't load - this is expected)
6. Copy the full redirected URL from your browser's address bar (it will look like `http://localhost:1/?code=...&state=...`)
7. Paste it back into the CLI prompt
8. `gog` extracts the authorization code and stores your refresh token

### Verify

```bash
gog auth list
```

You should see your email with the authorized services listed.

Common commands

- Gmail search: `gog gmail search 'newer_than:7d' --max 10`
- Gmail messages search (per email, ignores threading): `gog gmail messages search "in:inbox from:ryanair.com" --max 20 --account you@example.com`
- Gmail send (plain): `gog gmail send --to a@b.com --subject "Hi" --body "Hello"`
- Gmail send (multi-line): `gog gmail send --to a@b.com --subject "Hi" --body-file ./message.txt`
- Gmail send (stdin): `gog gmail send --to a@b.com --subject "Hi" --body-file -`
- Gmail send (HTML): `gog gmail send --to a@b.com --subject "Hi" --body-html "<p>Hello</p>"`
- Gmail draft: `gog gmail drafts create --to a@b.com --subject "Hi" --body-file ./message.txt`
- Gmail send draft: `gog gmail drafts send <draftId>`
- Gmail reply: `gog gmail send --to a@b.com --subject "Re: Hi" --body "Reply" --reply-to-message-id <msgId>`
- Calendar list events: `gog calendar events <calendarId> --from <iso> --to <iso>`
- Calendar create event: `gog calendar create <calendarId> --summary "Title" --from <iso> --to <iso>`
- Calendar create with color: `gog calendar create <calendarId> --summary "Title" --from <iso> --to <iso> --event-color 7`
- Calendar update event: `gog calendar update <calendarId> <eventId> --summary "New Title" --event-color 4`
- Calendar show colors: `gog calendar colors`
- Drive search: `gog drive search "query" --max 10`
- Contacts: `gog contacts list --max 20`
- Sheets get: `gog sheets get <sheetId> "Tab!A1:D10" --json`
- Sheets update: `gog sheets update <sheetId> "Tab!A1:B2" --values-json '[["A","B"],["1","2"]]' --input USER_ENTERED`
- Sheets append: `gog sheets append <sheetId> "Tab!A:C" --values-json '[["x","y","z"]]' --insert INSERT_ROWS`
- Sheets clear: `gog sheets clear <sheetId> "Tab!A2:Z"`
- Sheets metadata: `gog sheets metadata <sheetId> --json`
- Docs export: `gog docs export <docId> --format txt --out /tmp/doc.txt`
- Docs cat: `gog docs cat <docId>`

Calendar Colors

- Use `gog calendar colors` to see all available event colors (IDs 1-11)
- Add colors to events with `--event-color <id>` flag
- Event color IDs (from `gog calendar colors` output):
  - 1: #a4bdfc
  - 2: #7ae7bf
  - 3: #dbadff
  - 4: #ff887c
  - 5: #fbd75b
  - 6: #ffb878
  - 7: #46d6db
  - 8: #e1e1e1
  - 9: #5484ed
  - 10: #51b749
  - 11: #dc2127

Email Formatting

- Prefer plain text. Use `--body-file` for multi-paragraph messages (or `--body-file -` for stdin).
- Same `--body-file` pattern works for drafts and replies.
- `--body` does not unescape `\n`. If you need inline newlines, use a heredoc or `$'Line 1\n\nLine 2'`.
- Use `--body-html` only when you need rich formatting.
- HTML tags: `<p>` for paragraphs, `<br>` for line breaks, `<strong>` for bold, `<em>` for italic, `<a href="url">` for links, `<ul>`/`<li>` for lists.
- Example (plain text via stdin):

  ```bash
  gog gmail send --to recipient@example.com \
    --subject "Meeting Follow-up" \
    --body-file - <<'EOF'
  Hi Name,

  Thanks for meeting today. Next steps:
  - Item one
  - Item two

  Best regards,
  Your Name
  EOF
  ```

- Example (HTML list):
  ```bash
  gog gmail send --to recipient@example.com \
    --subject "Meeting Follow-up" \
    --body-html "<p>Hi Name,</p><p>Thanks for meeting today. Here are the next steps:</p><ul><li>Item one</li><li>Item two</li></ul><p>Best regards,<br>Your Name</p>"
  ```

## Why Manual Mode?

This environment runs in a container where:

- Local callback servers (`127.0.0.1:<port>`) are not accessible from your browser
- The process might be restarted during authorization
- OAuth client credentials are pre-configured via `GOG_CREDENTIALS_JSON` environment variable

**Manual mode (`--manual`) is required** because:

- It doesn't rely on a local callback server
- You can authorize from any device (desktop, phone, etc.)
- The authorization can complete even if the process restarts
- You manually copy/paste the redirect URL, so there's no timing dependency

## Credentials vs Authorization

- **OAuth Credentials** (`gog auth credentials`): Client ID and secret - **already configured** via environment variables
- **Account Authorization** (`gog auth add`): User consent and refresh token - **you must run this** for each Google account

## Troubleshooting

### No tokens after running `gog auth add`

**Cause**: Authorization flow didn't complete successfully.
**Solution**: Run `gog auth add you@gmail.com --services gmail,calendar,drive,contacts,docs,sheets --manual` again and carefully copy the full redirect URL.

### "Could not find credentials"

**Cause**: The `GOG_CREDENTIALS_JSON` environment variable is not set.
**Solution**: Credentials should be configured automatically. Contact support if this error appears.

### Redirect URL doesn't have a code parameter

**Cause**: Authorization was denied or an error occurred during consent.
**Solution**: Check the URL for `error=` parameter. Retry authorization and approve all requested permissions.

## Notes

- **Always use `--manual` mode** for `gog auth add` in this environment.
- OAuth credentials are pre-configured - never run `gog auth credentials`.
- Set `GOG_ACCOUNT=you@gmail.com` to avoid repeating `--account`.
- For scripting, prefer `--json` plus `--no-input`.
- Sheets values can be passed via `--values-json` (recommended) or as inline rows.
- Docs supports export/cat/copy. In-place edits require a Docs API client (not in gog).
- Confirm before sending mail or creating events.
- `gog gmail search` returns one row per thread; use `gog gmail messages search` when you need every individual email returned separately.
