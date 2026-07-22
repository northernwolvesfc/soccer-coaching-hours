# Soccer Coaching Hours Tracker

A mobile-friendly coaching-hours form connected to Google Sheets.

See [SETUP-GUIDE.md](SETUP-GUIDE.md) for Google Sheets setup, GitHub publishing, deployment, and administration.

## Main files

- `app/page.tsx` — public form and validation
- `app/globals.css` — responsive visual design
- `google-apps-script/Code.gs` — spreadsheet backend and live summaries
- `.env.example` — endpoint configuration

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```
