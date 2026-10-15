# Waymark — Make sense of the road ahead

**THE HONEST MILLION** — A financial field guide and living plan for first-time investors.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Run tests

```bash
npm test
# or
npx vitest run
```

## Build for production

```bash
npm run build
```

Output is in `dist/`. For SPA routing, the `public/_redirects` file handles Netlify. For Vercel, add a `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## What was built

### Routes
| Route | Chapter |
|-------|---------|
| `/` | Prologue — editorial hero, dual CTA |
| `/begin` | 01 · The Starting Point — 5-step onboarding |
| `/field-guide` | 02 · The Choices — investment field guide with comparison |
| `/workbench` | 03 · The Draft — live allocation + projection workbench |
| `/weather-room` | 04 · The Weather — downturn & scenario simulator |
| `/journal` | 05 · The Journal — saved plan summary |
| `/plan-summary` | Plain-English printable plan |

### What truly works
- **Financial engine:** `simulatePlan()` is a pure, tested function with 13 unit tests covering all required edge cases
- **Simulation:** baseline, equity crash, contribution pause, contribution increase scenarios
- **Allocation:** interactive ribbon with sliders + typed inputs that sum to 100%
- **Projection chart:** SVG with keyboard navigation (arrow keys), accessible data table, goal-crossing marker
- **Onboarding:** 5-step flow deriving investible surplus correctly from income − expenses − buffer
- **Persistence:** Zustand + localStorage; plan survives refresh
- **Demo profile:** Aarav's data loaded by default; clearly marked "DEMO"; reset available
- **Decision receipt:** "what changed" text after every meaningful edit

### What is intentionally illustrative / limited
- **Returns are invented educational figures** — not current market rates, historical data, or forecasts
- **Taxes** (capital gains, TDS, dividend tax) are **not modelled**
- **Exit loads**, premature withdrawal penalties, and FD maturity calculations are simplified
- **Inflation** uses a fixed illustrative rate; real inflation varies
- **No real account integration** — all data lives in browser localStorage only
- **No probability / confidence interval claims** — three assumption sets are deterministic multipliers

### Demo click path (3-minute walkthrough)
1. **`/`** → "Meet Aarav / Explore demo" → opens workbench with demo data
2. **`/begin`** → Review ₹8,000 income → ₹5,500 spend → ₹500 buffer → ₹2,000 available → shows "₹2,000 set aside"
3. **`/field-guide`** → Select "Index fund" → Read field note → Check compare FD vs Index
4. **`/workbench`** → Move contribution slider to ₹2,500 → Watch goal date update + decision receipt
5. **`/weather-room`** → Select "Equity downturn" → Year 5 → −25% → "Show the arithmetic" → see only equity portion affected
6. **`/journal`** → Read status sentence → Save draft → "Your plan, in perspective"

### Known issues / deferred
- `recharts` was installed but not used — chart is custom accessible SVG (better for the editorial aesthetic)
- No emergency withdrawal scenario (P1)
- No inflation perspective toggle (P1, structure is ready in `profile.goalType`)  
- No Playwright end-to-end tests (time constraint; unit tests cover all engine logic)
- Font loading from Google Fonts requires internet; would use self-hosted fonts for production

---

*Educational simulation only. Not personalised investment advice. No financial transactions occur.*
