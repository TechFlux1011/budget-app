# BudgetFlow

A React budgeting app that breaks down your budget across multiple time scales (monthly, bi-weekly, weekly, daily).

## Features

- **Time-scale switching** -- view your entire budget normalized to monthly, bi-weekly, weekly, or daily
- **Pay frequency awareness** -- set how you get paid and when your next check arrives
- **Automatic conversion** -- a monthly expense is automatically shown as its weekly equivalent (and vice versa)
- **Pay cycle countdown** -- see days until next paycheck and your safe daily spending allowance
- **Color-coded status** -- green (on track), amber (tight), red (over budget)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localStorage for persistence
