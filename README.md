# Waymark

**Make sense of the road ahead.**

Waymark is an educational financial planning experience for first-time
investors. It helps users understand their monthly capacity, compare investment
options, build an allocation, and explore how their plan responds to change.

> **Disclaimer:** Waymark is an illustrative simulation, not financial advice.
> It does not connect to financial institutions or execute transactions.

## Features

- Five-step onboarding for income, expenses, reserves, and goals
- Plain-English investment field guide
- Interactive allocation workbench and projection chart
- Scenarios for market downturns and contribution changes
- Saved plans and browser persistence with Zustand
- Demo profile for immediate exploration

## Tech stack

React, TypeScript, Vite, React Router, Zustand, Tailwind CSS, Framer Motion,
Vitest, and Oxlint.

## Getting started

Requires Node.js 20+ and npm 10+.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |
| `npx vitest run` | Run unit tests |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Introduction |
| `/begin` | Guided plan setup |
| `/field-guide` | Investment options and comparisons |
| `/workbench` | Allocation and projections |
| `/weather-room` | Scenario simulator |
| `/journal` | Saved plan overview |
| `/plan-summary` | Printable plan summary |
| `/login`, `/signup` | Mock authentication flows |

## Limitations

- Returns and inflation are educational assumptions, not forecasts or live data.
- Taxes, penalties, and account-specific rules are simplified or omitted.
- Scenarios are deterministic and make no probability claims.
- Plans and demo account data are stored only in browser `localStorage`.
- Authentication is a mock product flow and is not production-ready.
- No investments are bought or sold.

## Deployment

```bash
npm run build
```

Deploy the generated `dist/` directory to a static host configured to serve
`index.html` for client-side routes.

## Contributing

Create a focused branch, make the change, then run:

```bash
npm run lint
npx vitest run
npm run build
```

No license has been declared yet. Please do not assume the code may be
redistributed or reused.
