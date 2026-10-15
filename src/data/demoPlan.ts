import type { FinancialPlan } from '../types/finance';

export const defaultAssumptions: FinancialPlan['assumptions'] = {
  cash: {
    id: 'cash',
    label: 'Accessible cash',
    annualReturn: 0.03,
    annualFee: 0,
    modelNotes:
      'Illustrative 3% — actual savings account rates vary by bank and change over time. Taxes and inflation not modelled.',
  },
  fd: {
    id: 'fd',
    label: 'Fixed deposit',
    annualReturn: 0.06,
    annualFee: 0,
    modelNotes:
      'Illustrative 6% nominal — real FDs have specific terms, compounding conventions, and premature closure costs.',
  },
  index: {
    id: 'index',
    label: 'Index fund exposure',
    annualReturn: 0.08,
    annualFee: 0.002,
    modelNotes:
      'Illustrative 8% gross / 0.2% fee applied — actual returns can be sharply negative; smooth rate is a significant simplification.',
  },
  debt: {
    id: 'debt',
    label: 'Debt fund exposure',
    annualReturn: 0.05,
    annualFee: 0.002,
    modelNotes:
      'Illustrative 5% gross / 0.2% fee — credit, rate, and liquidity risk not fully simulated.',
  },
  gold: {
    id: 'gold',
    label: 'Gold exposure',
    annualReturn: 0.05,
    annualFee: 0.003,
    modelNotes:
      'Illustrative 5% gross / 0.3% fee — price volatility, spreads, and holding method not fully simulated.',
  },
};

export const demoPlan: FinancialPlan = {
  profile: {
    goalAmountINR: 1_000_000,
    goalType: 'nominal',
    monthlyIncomeINR: 8_000,
    monthlyCommittedSpendINR: 5_500,
    monthlyReserveINR: 500,
    plannedContributionINR: 2_000,
    initialBalanceINR: 0,
    horizonYears: 30,
    liquidityNeed: 'long',
    lossResponse: 'unsure',
    emergencyReserveStatus: 'building',
  },
  allocation: {
    cash: 0.20,
    fd: 0.20,
    index: 0.45,
    debt: 0.10,
    gold: 0.05,
  },
  assumptions: defaultAssumptions,
  inflationRateAnnual: 0.06,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDemo: true,
};
