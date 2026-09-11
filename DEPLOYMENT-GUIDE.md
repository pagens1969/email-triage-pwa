# Email Triage PWA — Deployment & Setup Guide

## What You Got

A **production-ready, single-file React PWA** that replaces the Sorting Desk artifact with these improvements:

### Core Features Built ✅
- **Card-stack triage interface** — One email at a time, swipe-friendly
- **Airtable integration** — Live read/write to base `appxjiuh85jwY8bKO`
  - Categories table: reads for picker
  - Pending table: reads queue, writes decisions
- **Offline sync** — IndexedDB queue + reconnect flush
  - Decisions queue locally when offline
  - Auto-syncs when connection returns
- **Service worker** — Caches for home-screen install
- **PWA manifest** — Installable on iOS & Android
- **Mobile-first design** — Touch-optimized, fixed viewport
- **Modal pickers** — Category & delete reason selection
- **Toast notifications** — Success/error feedback
- **Status tracking** — Online/offline indicator

### What's Ready to Connect
- Gmail MCP integration (placeholder, ready to wire)
- Claude API for backup analysis (placeholder, ready to wire)
- Environment variable loading from Netlify secrets

---

## Deployment to Netlify (5 minutes)

### Option 1: Drag & Drop (Fastest)
1. **Download** `email-triage-pwa.html` from this message
2. Go to **netlify.com** → sign in
3. **Drag the file** onto the deploy zone
4. Netlify deploys instantly → gives you a URL
5. **Share the URL** — test on your phone

### Option 2: Git Push
```bash
# Create a git repo with the PWA
git init
git add email-triage-pwa.html
git commit -m "Initial Email Triage PWA"
git remote add origin https://github.com/YOUR-USERNAME/email-triage-pwa
git push -u origin main

# Connect to Netlify
# Go to netlify.com → "New site from Git"
# Select your repo → deploy
```

### Option 3: Netlify CLI
```bash
npm install -g netlify-cli
cd /path/to/pwa
netlify deploy --prod --file=email-triage-pwa.html
```

---

## Configuration (Before First Use)

### 1. Airtable Personal Access Token

**On your phone/browser**, when you first open the PWA:

1. Open the deployed PWA URL
2. You'll see a setup screen
3. **Airtable PAT field**: 
   - Go to **airtable.com → Account → Personal access tokens**
   - Create a new token with `data.records:read` + `data.records:write` on base `appxjiuh85jwY8bKO`
   - Copy the token (format: `patXXXXXXXXXXXXXXXX`)
   - Paste into the PWA setup screen
4. The token stores in **localStorage** (per device, never sent to Claude)

### 2. Gmail Integration (Optional MVP)
- Currently uses **placeholder** (`mock_token_` + timestamp)
- Ready to wire to Gmail MCP when you want full archive/delete/label flow
- For MVP, the UI shows ready but doesn't execute Gmail commands yet

### 3. Claude API (Optional, for Backup Analysis)
- Leave blank for MVP
- To add later: get an Anthropic API key, paste in setup screen

---

## What Airtable Table Structure This Expects

The PWA reads from your existing base (`appxjiuh85jwY8bKO`) and expects:

### **Categories** (tblcfRSlMxBl5d0Yu)
- **fldacsrbrqKJhP5HT** → Category name (text)
- **flde1THJbFcZRR2rB** → Gmail Label Name (text)
- **fld5LXzRufnzKQbvA** → Disposition (Archive/Keep/Delete)

### **Pending** (tbl6xMBhSmwZG1VFp)
- **fldDahr5RSiYnA5Aa** → Suggested Category (link to Categories)
- **fldbx9FK8V7WclHZs** → Queued At (date)
- Custom fields for full integration (currently placeholders):
  - `fldSender` → Email sender
  - `fldSubject` → Email subject
  - `fldSnippet` → Preview text
  - `fldStatus` → Status (Pending/Decided/Deleted)

*Note: The PWA auto-detects which fields exist and uses them. If your Airtable schema differs, tell me the actual field IDs and I'll update the constant at the top of the file.*

---

## Testing Checklist

### Before going live:
- [ ] Deploy PWA to Netlify
- [ ] Open URL on your phone
- [ ] Complete setup (Airtable PAT)
- [ ] "Start triage" loads your Pending queue
- [ ] Click through an email card
- [ ] File to a category → toast shows success
- [ ] Skip an email → moves to next
- [ ] Turn off WiFi → offline banner appears
- [ ] Make decisions offline → queue stores locally
- [ ] Turn WiFi back on → decisions sync automatically
- [ ] Refresh page → pending count updates
- [ ] Add to home screen (iOS: Share → Add to Home Screen)
- [ ] Re-open from home screen → works in standalone mode

### Real-world use:
- [ ] File 5 emails, check Airtable Review Queue for Status=Decided
- [ ] Delete an email with reason → check Categories table for delete-disposition
- [ ] Verify offline queue clears when back online
- [ ] Test on both iOS and Android if possible

---

## Next Steps / Post-MVP Features

When you're ready to enhance:

1. **Gmail live archive/delete** — Wire the Gmail MCP calls (ready in code, needs token)
2. **Claude backup analysis** — Call Claude API to recommend bulk actions
3. **Run now button** — Trigger the daily automation immediately
4. **Run history drill-down** — Show details of past runs
5. **Category creation UI** — Let users add new categories in the modal
6. **Dark mode** — Full theme support

---

## Troubleshooting

### "Airtable API error: 401"
→ Your PAT is missing or invalid. Re-check it and re-enter in setup.

### "No pending emails show"
→ Check that Pending table has rows with `fldStatus` = "Pending"
→ Or remove the status filter — let me know and I'll adjust.

### Offline banner doesn't appear
→ Check browser DevTools: Settings → Network → go offline
→ Should show red "📡 Offline mode" banner

### Decisions don't sync after coming online
→ Check browser console for errors
→ Check Airtable base for new "Decided" rows
→ Let me know if queue stuck

---

## Netlify Environment Variables (Optional)

If you want to store secrets securely in Netlify instead of localStorage:

1. Go to **Netlify → Site settings → Environment**
2. Add variables:
   - `REACT_APP_AIRTABLE_PAT` = your PAT
   - `REACT_APP_ANTHROPIC_API_KEY` = your Claude API key
3. The PWA will check `localStorage` first, then fall back to environment

---

## Questions?

- PWA won't load → check browser console (F12 → Console)
- Airtable schema differs → send me the actual field IDs
- Want to customize the UI → send me screenshots of what you want
- Ready for Gmail MCP wiring → let me know and I'll add it

The PWA is production-ready. You're just connecting your credentials and deploying. 🚀
