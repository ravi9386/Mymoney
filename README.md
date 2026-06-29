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
npm run dev      # http://localhost:5180
npm run build    # production build
npm run preview  # serve the production build
```

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
