# Soccer Coaching Hours Tracker — Setup Guide

The public form writes to a private Google Sheet. It creates three tabs:

- **Submissions:** every individual entry.
- **Coach Summary:** total approved hours and session count by coach.
- **Location Summary:** total approved hours and session count by location.

## 1. Create the Google Sheet

1. Create a blank Google Sheet named **Soccer Coaching Hours**.
2. Open **Extensions → Apps Script**.
3. Delete the sample code and paste in all of `google-apps-script/Code.gs`.
4. Save. Select `setupSpreadsheet` in the function menu and click **Run**.
5. Approve Google's prompts. Confirm the three tabs listed above now exist.

> Run `setupSpreadsheet` only during initial setup. Running it again clears Submissions.

## 2. Publish the spreadsheet endpoint

1. In Apps Script, click **Deploy → New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
4. Deploy, authorize if asked, and copy the Web app URL ending in `/exec`.

“Anyone” lets the public form send data; it does not make the spreadsheet public. Keep the Sheet restricted to coordinators.

## 3. Connect and customize the website

1. Copy `.env.example` to `.env.local`.
2. Replace the sample URL with your Apps Script `/exec` URL.
3. Edit the `LOCATIONS` list near the top of `app/page.tsx`.

## 4. Test locally

Install Node.js 22, then run:

```bash
npm install
npm run dev
```

Open the displayed local address, submit a test, and verify all three sheet tabs.

## 5. Add it to GitHub

Create an empty GitHub repository, then from this project folder run:

```bash
git init
git add .
git commit -m "Add soccer coaching hours tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Do not commit `.env.local`; it is excluded by `.gitignore`.

## 6. Publish and share

Connect the GitHub repository to Cloudflare Pages, Vercel, or Netlify. In the host settings add:

- Variable: `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`
- Value: your Apps Script `/exec` URL
- Build command: `npm run build`
- Node version: `22`

Deploy, then share the resulting public form link.

## Administration

- Change a row's **Status** to `Rejected` to remove it from both summaries.
- Keep `Approved` to include it.
- Filter Submissions by coach, location, or date.
- Manual changes to hours or status are picked up by the summary formulas.

## Trust limitation

Anyone with the public link can submit under any name. For formal payroll or certification, require sign-in or have a coordinator review entries before approval.
