# My Money

A personal net-worth, projection and retirement-planning app. Track every asset class — real estate, mutual funds, NPS, EPF, PPF, stocks, bonds, gold, FDs, crypto, cash — plus liabilities, project future value, and find your earliest realistic retirement age.

Built with **React 18 + TypeScript + Vite + Tailwind + Recharts**. 100% client-side: your data never leaves your browser.

## Features

- **Dashboard** — Net worth, allocation by category and group, top holdings, projected future value, retirement readiness at a glance.
- **Assets** — Add / edit / delete holdings across 12 categories with per-asset growth rates, monthly SIP contributions, and notes.
- **Liabilities** — Track loans, EMIs and outstanding balances; net worth = assets − liabilities.
- **Projections** — Stacked future-value chart over 1–40 years with live scenario sliders (extra SIP, return adjustment, horizon).
- **Retirement** — Power-Money style crossover view: projected corpus vs. inflation-adjusted required corpus. Computes the earliest age you can retire and the monthly SIP needed to close any shortfall.
- **Backup & restore** — Export / import your full dataset as JSON. Sample portfolio included for first-time exploration.

## Asset categories supported

Real Estate · Mutual Funds (Equity & Debt) · NPS · EPF · PPF · Stocks · Bonds · Gold · Fixed Deposits · Crypto · Cash & Savings

## Running locally

```bash
npm install
npm run dev       # http://localhost:5180 — full React HMR
npm run build     # writes the production bundle to ./docs/
npm run preview   # serves ./docs locally on http://localhost:4173/
npm run icons     # regenerates PWA icons from public/favicon.svg
```

The repo root holds **source** (`index.html`, `src/`, `public/`). The Vite build outputs to `./docs/` so GitHub Pages can serve it directly from `main` / `/docs`.

## Deployment

One command builds, copies into both repos, commits, and pushes:

```bash
npm run deploy                       # default commit message
npm run deploy -- "fix: tweak chart" # custom commit message

# Flags:
npm run deploy -- --no-build         # reuse the existing docs/ output
npm run deploy -- --no-push          # build + commit, stay local
npm run deploy -- --no-claude1       # only push the Mymoney repo
npm run deploy -- --no-mymoney       # only push the Claude1 mirror
```

The script (`scripts/deploy.mjs`) does the following:

1. `npm run build` → `docs/`
2. Adds `404.html` (SPA fallback) and `.nojekyll` inside `docs/`
3. Commits `docs/` on this repo (`ravi9386/Mymoney`) and pushes — serves at `https://ravi9386.github.io/Mymoney/`
4. Mirrors `docs/*` into the sibling `Claude1/mymoney/` working tree, commits, and pushes — serves at `https://vermawisdom.com/mymoney/`

Commit identity is set per-command (`git -c user.name=… -c user.email=…`) so global git config is never touched.

### One-time GitHub Pages setup

- **Mymoney repo:** Settings → Pages → Source = `Deploy from a branch`, Branch = `main`, Folder = `/docs`.
- **Claude1 repo:** Pages is enabled from `main` / root with `vermawisdom.com` as the custom domain — already configured.

## How the math works

- **Future value of an asset** = lump sum compounded annually + monthly SIP compounded monthly at `expectedReturn / 12`.
- **Corpus required at retirement** = inflation-adjusted annual expense × annuity factor at the *real* post-retirement return (`(1+r)/(1+i) − 1`).
- **Earliest retirement age** = first age where projected corpus ≥ corpus required for that age.
- **SIP needed to close the gap** = shortfall ÷ future-value-of-annuity factor at the blended weighted return of your portfolio.

All amounts are in INR (₹) and formatted in lakh / crore for readability.

## Data privacy

Nothing leaves your browser. State is persisted to `localStorage` under the key `mymoney.state.v1`. Use **Settings → Export to JSON** to take a portable backup.

---

Made for [ravi9386/Mymoney](https://github.com/ravi9386/Mymoney).
