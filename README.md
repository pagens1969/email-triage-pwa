# Pigeonhole (email triage PWA)

Live: https://pagens-email-triage.netlify.app — auto-deploys from `main` on GitHub.

A phone-first app for working through the **Pending** queue in the Email Triage v2 Airtable base (`appxjiuh85jwY8bKO`). No build step: Netlify serves these files as they are.

## Files

- `index.html` — the whole app (HTML, CSS, plain JavaScript). Its only outside dependency is two Google Fonts (DM Sans, Source Serif 4), which the service worker caches for offline; it falls back to system fonts if they can't load
- `sw.js` — service worker (network-first, so new deploys appear on next open; cached copy used offline)
- `manifest.webmanifest`, `icons/` — home-screen install
- `netlify.toml` — publish settings and headers
- `netlify/functions/run-now.mjs` — `POST /api/run-now`: starts the Email Triage routine on demand (needs the `ROUTINE_TOKEN` environment variable in Netlify; only callers with a working Airtable token for the base can use it)

## How a decision flows

1. In the app, **File** (pick a category) or **Delete** (pick a reason, confirm).
2. The app writes to the Pending row: `Status = Reviewing`, `Decided Category`, `Decided Action` (the category's Disposition, or Delete), `Decided Reason`, `Decided At`. If offline, the decision waits in the phone's IndexedDB and syncs on reconnect.
3. The scheduled triage task (5am / 11am / 3pm / 9pm UK) applies Reviewing rows in Gmail, updates the Senders learning table, and sets `Status = Filed`.

The app only ever writes to rows that are still `Pending`, so it can't overwrite something already filed from the Sorting Desk.

## Run sweep now

The **Run sweep now** button (home screen and the end of a triage session) calls `/api/run-now`, which fires the routine **Pigeonhole – Run sweep now** (`trig_01UZUnQjiLDzB5khTm65zdSi`) via its API trigger. That routine is a copy of the scheduled Cowork task's instructions — Cowork scheduled tasks (the ones under "Scheduled" in the Claude sidebar) can't have API triggers, only Claude Code routines can. **Keep the two sets of instructions in step whenever either changes.** The run applies Reviewing decisions in Gmail and sweeps new mail into Pending, taking about 10 minutes. The app blocks it for 15 minutes after a start and around the scheduled 5am/11am/3pm/9pm runs, to avoid overlapping runs. On-demand runs count towards the account's daily routine-run allowance.

One-time setup: claude.ai/code/routines → Pigeonhole – Run sweep now → edit → API trigger → Generate token (shown once). Netlify → Site configuration → Environment variables → add `ROUTINE_TOKEN` = that token → Deploys → Trigger deploy. `ROUTINE_ID` can be set to override the routine.

## Airtable field IDs (Pending table `tbl6xMBhSmwZG1VFp`)

The display names of the first three fields in Airtable don't match their contents; always go by ID.

| Field ID | Contains | Airtable name |
|---|---|---|
| fldVRJfEjaWLP5DUu | Sender email | "Email ID" |
| fldwyRw1UVY2gZZSM | Subject | "Sender" |
| fldrfeaUQIxQRHsFG | Gmail thread ID | "Subject" |
| fld4E1i0TO2Z3MeFg | Snippet | Snippet |
| fldDahr5RSiYnA5Aa | Suggested category | Suggested Category |
| fldTSxLRrIcQhxZlS | Confidence tier | Suggested Confidence |
| fldbTCyj1DH7w46j2 | Pending / Reviewing / Filed | Status |
| fldbx9FK8V7WclHZs | Queued at | Date Added |
| fldAjTquVn7Vwafqg | Decided category | Decided Category |
| fldH57N0MmYYYPJu0 | Archive / Keep / Delete | Decided Action |
| fld9jypIy53VnpH5H | Delete reason | Decided Reason |
| fldKZH0X2jDoEMNuJ | Decision time | Decided At |

## Setup on a new device

Open the site, then paste an Airtable personal access token with `data.records:read` and `data.records:write` on the Email Triage v2 base. The token stays on that device only. On iPhone: Share → Add to Home Screen.
