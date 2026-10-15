import type { InvestmentEntry } from '../types/content';

export const investments: InvestmentEntry[] = [
  {
    id: 'cash',
    title: 'Savings account / accessible cash',
    tagline: 'Your money, reachable any time.',
    howItWorks:
      'A savings account holds your money at a bank, which pays a small amount of interest — typically calculated daily but credited monthly or quarterly. You can usually withdraw or transfer whenever you need. Interest rates vary by institution and can change over time.',
    whatCanGoRight:
      'Your money is accessible immediately, and the nominal amount does not decrease (subject to bank solvency and deposit insurance limits). Useful for an emergency buffer.',
    whatCanGoWrong:
      'The interest rate often falls below the rate of inflation, meaning your purchasing power — what you can actually buy with that money — quietly erodes over time.',
    liquidity: 'Immediately accessible; transfers typically within the same business day.',
    lockIn: 'None. No fixed term or penalty for withdrawals.',
    costsAndFees: 'Usually no direct fee. Opportunity cost if large sums sit here long-term.',
    taxConsiderations:
      'Interest earned is taxable as income in India. Tax-deductible savings account interest has a limit (Section 80TTA). Consult a tax professional for your situation.',
    uncertainty:
      'Interest rates are not guaranteed and change with monetary policy. Deposits above insurance limits carry counterparty risk.',
    relationToPlan:
      'Useful for your emergency fund and for money you may need within 1–2 years. Parking all long-term savings here means inflation may outpace your growth.',
    simulatorSimplification:
      'We model this as a fixed 3% illustrative annual return. Real rates are variable and taxable.',
    traits: {
      accessSpeed: 'immediate',
      volatility: 'none',
      lockInTerms: 'none',
      potentialCost: 'free',
    },
    illustration: {
      type: 'stable',
      sampleAnnualReturn: 0.03,
      sampleFee: 0,
      horizon: 10,
      seedAmount: 1000,
    },
  },
  {
    id: 'fd',
    title: 'Fixed deposit (FD)',
    tagline: 'A agreed rate, for an agreed term.',
    howItWorks:
      'A fixed deposit is an agreement with a bank to keep a sum locked for a set period — often 7 days to 10 years — at a pre-agreed interest rate. The bank pays interest (usually compounded quarterly or half-yearly) and returns principal at maturity. Rates are fixed at the time of deposit.',
    whatCanGoRight:
      'The rate agreed at opening is locked in for the term, so you know your illustrative growth. FD rates often exceed savings account rates. Principal is protected within deposit insurance limits.',
    whatCanGoWrong:
      'Premature withdrawal (breaking the FD before maturity) usually incurs a penalty — you may receive a lower effective rate than agreed. Rates at renewal may be different. Inflation may still exceed your rate.',
    liquidity:
      'Moderate. Generally accessible by breaking the FD early, but with a cost. Some FDs offer a sweep-in feature for partial liquidity.',
    lockIn:
      'Term-dependent: 7 days to 10 years. Premature closure usually reduces effective return.',
    costsAndFees:
      'No explicit upfront fee. Premature withdrawal penalties reduce the effective yield.',
    taxConsiderations:
      'Interest is taxed as income. TDS (Tax Deducted at Source) applies at 10% if interest exceeds ₹40,000/year (threshold varies). Senior citizens have a higher limit.',
    uncertainty:
      'The rate is fixed for the term, but real return depends on inflation and what rates are when you re-invest at maturity.',
    relationToPlan:
      'Suitable for medium-term goals where you can commit the money for a defined period. Not ideal if you may need emergency access without penalty.',
    simulatorSimplification:
      'We model this as a fixed 6% illustrative annual return. Real rates, compounding conventions, and premature closure costs differ by institution.',
    traits: {
      accessSpeed: 'weeks',
      volatility: 'low',
      lockInTerms: 'medium',
      potentialCost: 'very-low',
    },
    illustration: {
      type: 'stepped',
      sampleAnnualReturn: 0.06,
      sampleFee: 0,
      horizon: 10,
      seedAmount: 1000,
    },
  },
  {
    id: 'index',
    title: 'Equity index fund',
    tagline: 'Ownership in many companies, following a market index.',
    howItWorks:
      'An index fund holds shares in many companies to track a market index (e.g. Nifty 50 or Sensex). When you invest via a mutual fund route, you own units. The fund\'s value rises and falls with the index. A SIP (Systematic Investment Plan) is a method of contributing a fixed amount monthly — it is not an asset class itself.',
    whatCanGoRight:
      'Diversification across many companies reduces single-company risk. Historically, broad equity indices have grown over long horizons — but past performance does not guarantee future results. Low expense ratios are common.',
    whatCanGoWrong:
      'The entire fund can lose significant value in a market downturn — 30–50% drops have occurred and can persist for years. There is no guarantee of recovery or positive returns.',
    liquidity:
      'Generally redeemable in 1–3 business days (open-ended funds). Exit loads may apply for short holding periods.',
    lockIn:
      'None for open-ended funds. ELSS (tax-saving) funds have a 3-year lock-in. Exit load typically applies for redemptions before 1 year.',
    costsAndFees:
      'Annual expense ratio (0.1%–0.5% for direct plans; higher for regular plans). No transaction fee for direct plans.',
    taxConsiderations:
      'Long-term capital gains (holding > 1 year) taxed at 10% above ₹1 lakh. Short-term gains taxed at 15%. Dividends taxable as income. Consult a tax advisor.',
    uncertainty:
      'High. Annual returns vary enormously year-to-year. A single smooth average is a significant simplification of real market experience.',
    relationToPlan:
      'Potentially suitable for long-horizon goals (7+ years) where you can tolerate significant short-term losses. Allocation should reflect your actual liquidity needs and risk comfort.',
    simulatorSimplification:
      'We model this as 8% gross annual return minus 0.2% fee. This is an illustrative single number; actual returns fluctuate widely and may be negative for extended periods.',
    traits: {
      accessSpeed: 'days',
      volatility: 'high',
      lockInTerms: 'flexible',
      potentialCost: 'very-low',
    },
    illustration: {
      type: 'volatile',
      sampleAnnualReturn: 0.08,
      sampleFee: 0.002,
      horizon: 10,
      seedAmount: 1000,
    },
  },
  {
    id: 'debt',
    title: 'Debt fund exposure',
    tagline: 'Fixed-income securities in a pooled fund.',
    howItWorks:
      'A debt mutual fund invests in government or corporate bonds, money market instruments, and other fixed-income securities. Returns come from interest payments and bond price changes. There are many categories — liquid funds, short-duration, gilt, credit risk — each with different risk profiles.',
    whatCanGoRight:
      'Generally lower volatility than equity. Can offer better returns than a savings account for medium-term goals. Liquid debt funds offer quick redemption.',
    whatCanGoWrong:
      'Interest rate changes can reduce the value of existing bonds (rate risk). Credit default by a bond issuer can cause sharp losses (credit risk). "Low risk" debt funds can still lose value.',
    liquidity:
      'Liquid funds: same-day or next-day. Other debt funds: typically 1–3 business days. Some may have side-pocketing or redemption restrictions in stress events.',
    lockIn:
      'Most are open-ended with no lock-in. Exit loads apply for early redemption in some categories.',
    costsAndFees:
      'Annual expense ratio varies by category (0.1%–1%+). Direct plans have lower costs.',
    taxConsiderations:
      'Post-April 2023, debt fund gains are taxed at income tax slab rates (holding period no longer determines rate). Consult a tax advisor.',
    uncertainty:
      'Less than equity, but not zero. Credit events and interest rate movements can cause unexpected losses.',
    relationToPlan:
      'May be suitable for medium-term goals (2–5 years) or as a stable component in a diversified plan. Not a substitute for an emergency fund.',
    simulatorSimplification:
      'We model this as 5% gross annual return minus 0.2% fee. Real debt fund returns depend on interest rate environment and credit quality.',
    traits: {
      accessSpeed: 'days',
      volatility: 'low',
      lockInTerms: 'flexible',
      potentialCost: 'very-low',
    },
    illustration: {
      type: 'rising',
      sampleAnnualReturn: 0.05,
      sampleFee: 0.002,
      horizon: 10,
      seedAmount: 1000,
    },
  },
  {
    id: 'gold',
    title: 'Gold exposure',
    tagline: 'A traditional store of value, available in multiple forms.',
    howItWorks:
      'Gold can be held as physical (coins/bars), jewellery, Sovereign Gold Bonds (SGBs), Gold ETFs, or gold mutual funds. Each form has different costs, liquidity, and practical considerations. SGBs offer a fixed interest component; physical gold has making charges and storage concerns.',
    whatCanGoRight:
      'Gold prices often move independently of equity markets, providing some diversification. It can preserve purchasing power during periods of high inflation or uncertainty.',
    whatCanGoWrong:
      'Gold pays no income (unless SGBs). Physical gold has making charges and storage risk. Gold can be volatile and can decline significantly relative to other assets over long periods.',
    liquidity:
      'Gold ETFs and mutual funds: redeemable like other funds. SGBs: 5-year lock-in with early redemption after year 5. Physical gold: depends on buyer availability.',
    lockIn:
      'SGBs: 8-year maturity (premature redemption allowed after 5 years). Gold funds/ETFs: generally no lock-in.',
    costsAndFees:
      'Gold ETF/fund: expense ratio (0.3%–0.5%). Physical gold: making charges (8–25% for jewellery), potentially recurring storage cost.',
    taxConsiderations:
      'Physical gold and gold ETFs/MFs: long-term capital gains (3+ years) at 20% with indexation, or 10% without, depending on structure. SGBs: special tax treatment applies. Consult a tax advisor.',
    uncertainty:
      'Gold price is driven by global sentiment, USD exchange rates, and central bank purchases — not fundamentally predictable.',
    relationToPlan:
      'A small allocation may provide diversification. Not suitable as the primary long-term growth engine for an ambitious goal.',
    simulatorSimplification:
      'We model this as 5% gross annual return minus 0.3% fee. This is highly illustrative — gold\'s actual return profile is lumpy and unpredictable.',
    traits: {
      accessSpeed: 'days',
      volatility: 'moderate',
      lockInTerms: 'flexible',
      potentialCost: 'low',
    },
    illustration: {
      type: 'lumpy',
      sampleAnnualReturn: 0.05,
      sampleFee: 0.003,
      horizon: 10,
      seedAmount: 1000,
    },
  },
];

export const sipNote = {
  title: 'What is a SIP?',
  content:
    'A Systematic Investment Plan (SIP) is a contribution method, not a financial product. It lets you invest a fixed amount regularly — weekly, monthly, or quarterly — into an eligible mutual fund (equity, debt, gold fund, etc.). SIPs do not change the nature or risk of the underlying fund. The instrument you choose still determines potential return and risk; the SIP just structures when you invest.',
};
