import { it, expect } from 'vitest';
import { simulatePlan } from './simulatePlan';
import type { FinancialPlan, ScenarioSettings } from '../types/finance';

function makeBasePlan(overrides: Partial<FinancialPlan> = {}): FinancialPlan {
  return {
    profile: {
      goalAmountINR: 1_000_000,
      goalType: 'nominal',
      monthlyIncomeINR: 8000,
      monthlyCommittedSpendINR: 5500,
      monthlyReserveINR: 500,
      plannedContributionINR: 2000,
      initialBalanceINR: 0,
      horizonYears: 30,
      liquidityNeed: 'long',
      lossResponse: 'unsure',
      emergencyReserveStatus: 'building',
    },
    allocation: { cash: 1, fd: 0, index: 0, debt: 0, gold: 0 },
    assumptions: {
      cash: { id: 'cash', label: 'Cash', annualReturn: 0, annualFee: 0, modelNotes: '' },
      fd: { id: 'fd', label: 'FD', annualReturn: 0, annualFee: 0, modelNotes: '' },
      index: { id: 'index', label: 'Index', annualReturn: 0.08, annualFee: 0.002, modelNotes: '' },
      debt: { id: 'debt', label: 'Debt', annualReturn: 0, annualFee: 0, modelNotes: '' },
      gold: { id: 'gold', label: 'Gold', annualReturn: 0, annualFee: 0, modelNotes: '' },
    },
    inflationRateAnnual: 0.06,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    ...overrides,
  };
}

const baselineScenario: ScenarioSettings = { id: 'baseline', eventMonth: 0 };

// 1. Zero-return single asset, ₹1000/month → ₹12,000 after 12 months
it('single asset 0% return yields principal sum after 12 months', () => {
  const plan = makeBasePlan({
    profile: {
      goalAmountINR: 1_000_000,
      goalType: 'nominal',
      monthlyIncomeINR: 8000,
      monthlyCommittedSpendINR: 5500,
      monthlyReserveINR: 500,
      plannedContributionINR: 1000,
      initialBalanceINR: 0,
      horizonYears: 2,
      liquidityNeed: 'long',
      lossResponse: 'unsure',
      emergencyReserveStatus: 'building',
    },
    allocation: { cash: 1, fd: 0, index: 0, debt: 0, gold: 0 },
    assumptions: {
      cash: { id: 'cash', label: 'Cash', annualReturn: 0, annualFee: 0, modelNotes: '' },
      fd: { id: 'fd', label: 'FD', annualReturn: 0, annualFee: 0, modelNotes: '' },
      index: { id: 'index', label: 'Index', annualReturn: 0, annualFee: 0, modelNotes: '' },
      debt: { id: 'debt', label: 'Debt', annualReturn: 0, annualFee: 0, modelNotes: '' },
      gold: { id: 'gold', label: 'Gold', annualReturn: 0, annualFee: 0, modelNotes: '' },
    },
    inflationRateAnnual: 0,
  });
  const result = simulatePlan(plan, baselineScenario);
  expect(result.snapshots[12].totalValueINR).toBeCloseTo(12000, 0);
});

// 2. All zero contributions + zero initial → always zero
it('zero contributions and zero initial stay zero', () => {
  const plan = makeBasePlan({
    profile: { ...makeBasePlan().profile, plannedContributionINR: 0, initialBalanceINR: 0 },
  });
  const result = simulatePlan(plan, baselineScenario);
  result.snapshots.forEach((s) => {
    expect(s.totalValueINR).toBeCloseTo(0, 5);
  });
});

// 3. Initial balance ≥ target → goal reached at month 0
it('initial balance >= goal is reached at month 0', () => {
  const plan = makeBasePlan({
    profile: { ...makeBasePlan().profile, initialBalanceINR: 1_000_000, plannedContributionINR: 0 },
  });
  const result = simulatePlan(plan, baselineScenario);
  expect(result.firstGoalMonth).toBe(0);
  expect(result.snapshots[0].goalReached).toBe(true);
});

// 4. Contributed principal = initial + deposits (no growth, no withdrawal)
it('contributed principal matches initial + monthly deposits', () => {
  const plan = makeBasePlan({
    profile: { ...makeBasePlan().profile, plannedContributionINR: 500, initialBalanceINR: 1000 },
    allocation: { cash: 1, fd: 0, index: 0, debt: 0, gold: 0 },
    assumptions: {
      cash: { id: 'cash', label: 'Cash', annualReturn: 0, annualFee: 0, modelNotes: '' },
      fd: { id: 'fd', label: 'FD', annualReturn: 0, annualFee: 0, modelNotes: '' },
      index: { id: 'index', label: 'Index', annualReturn: 0, annualFee: 0, modelNotes: '' },
      debt: { id: 'debt', label: 'Debt', annualReturn: 0, annualFee: 0, modelNotes: '' },
      gold: { id: 'gold', label: 'Gold', annualReturn: 0, annualFee: 0, modelNotes: '' },
    },
    inflationRateAnnual: 0,
  });
  const result = simulatePlan(plan, baselineScenario);
  const snap = result.snapshots[12];
  expect(snap.contributedPrincipalINR).toBeCloseTo(1000 + 500 * 12, 0);
  expect(snap.totalValueINR).toBeCloseTo(1000 + 500 * 12, 0);
});

// 5. 50/50 equity+cash, -20% equity shock → portfolio drops ~10%
it('equity-only shock on 50-50 portfolio drops total by ~10%', () => {
  const plan = makeBasePlan({
    profile: { ...makeBasePlan().profile, plannedContributionINR: 0, initialBalanceINR: 10000 },
    allocation: { cash: 0.5, fd: 0, index: 0.5, debt: 0, gold: 0 },
    assumptions: {
      cash: { id: 'cash', label: 'Cash', annualReturn: 0, annualFee: 0, modelNotes: '' },
      fd: { id: 'fd', label: 'FD', annualReturn: 0, annualFee: 0, modelNotes: '' },
      index: { id: 'index', label: 'Index', annualReturn: 0, annualFee: 0, modelNotes: '' },
      debt: { id: 'debt', label: 'Debt', annualReturn: 0, annualFee: 0, modelNotes: '' },
      gold: { id: 'gold', label: 'Gold', annualReturn: 0, annualFee: 0, modelNotes: '' },
    },
    inflationRateAnnual: 0,
  });
  const scenario: ScenarioSettings = {
    id: 'equity-crash',
    eventMonth: 1,
    equityShockFraction: -0.2,
  };
  // Month before shock
  const result = simulatePlan(plan, scenario);
  const before = result.snapshots[0].totalValueINR; // 10000
  const after = result.snapshots[1].totalValueINR; // cash=5000, index=4000 => 9000
  const drop = (before - after) / before;
  expect(drop).toBeCloseTo(0.1, 2);
});

// 6. Six-month pause skips exactly 6 deposits
it('6-month contribution pause skips exactly 6 deposits', () => {
  const plan = makeBasePlan({
    profile: { ...makeBasePlan().profile, plannedContributionINR: 1000, initialBalanceINR: 0 },
    allocation: { cash: 1, fd: 0, index: 0, debt: 0, gold: 0 },
    assumptions: {
      cash: { id: 'cash', label: 'Cash', annualReturn: 0, annualFee: 0, modelNotes: '' },
      fd: { id: 'fd', label: 'FD', annualReturn: 0, annualFee: 0, modelNotes: '' },
      index: { id: 'index', label: 'Index', annualReturn: 0, annualFee: 0, modelNotes: '' },
      debt: { id: 'debt', label: 'Debt', annualReturn: 0, annualFee: 0, modelNotes: '' },
      gold: { id: 'gold', label: 'Gold', annualReturn: 0, annualFee: 0, modelNotes: '' },
    },
    inflationRateAnnual: 0,
  });
  const scenario: ScenarioSettings = {
    id: 'contribution-pause',
    eventMonth: 3,
    pauseMonths: 6,
  };
  const result = simulatePlan(plan, scenario);
  // Months 1,2 = 2 deposits before pause; pause months 3–8; months 9–12 = 4 more
  // After 12 months: 2 + 4 = 6 deposits × 1000 = 6000
  expect(result.snapshots[12].totalValueINR).toBeCloseTo(6000, 0);
});

// 7. Increase starting month 13 does not alter months 1-12
it('increased contribution from month 13 does not change months 1-12', () => {
  const plan = makeBasePlan({
    profile: { ...makeBasePlan().profile, plannedContributionINR: 1000, initialBalanceINR: 0 },
    allocation: { cash: 1, fd: 0, index: 0, debt: 0, gold: 0 },
    assumptions: {
      cash: { id: 'cash', label: 'Cash', annualReturn: 0, annualFee: 0, modelNotes: '' },
      fd: { id: 'fd', label: 'FD', annualReturn: 0, annualFee: 0, modelNotes: '' },
      index: { id: 'index', label: 'Index', annualReturn: 0, annualFee: 0, modelNotes: '' },
      debt: { id: 'debt', label: 'Debt', annualReturn: 0, annualFee: 0, modelNotes: '' },
      gold: { id: 'gold', label: 'Gold', annualReturn: 0, annualFee: 0, modelNotes: '' },
    },
    inflationRateAnnual: 0,
  });
  const baseline = simulatePlan(plan, baselineScenario);
  const increased = simulatePlan(plan, {
    id: 'increase-contribution',
    eventMonth: 13,
    monthlyIncreaseINR: 500,
  });
  for (let m = 1; m <= 12; m++) {
    expect(increased.snapshots[m].totalValueINR).toBeCloseTo(
      baseline.snapshots[m].totalValueINR,
      5
    );
  }
});

// 8. Inflation 0% → today value equals nominal
it('inflation 0 means today-value equals nominal', () => {
  const plan = makeBasePlan({ inflationRateAnnual: 0 });
  const result = simulatePlan(plan, baselineScenario);
  result.snapshots.forEach((s) => {
    expect(s.todayValueINR).toBeCloseTo(s.totalValueINR, 2);
  });
});

// 9. Goal not reached → firstGoalMonth === null
it('goal not reached returns firstGoalMonth null', () => {
  const plan = makeBasePlan({
    profile: {
      ...makeBasePlan().profile,
      goalAmountINR: 1e12, // unreachable
      plannedContributionINR: 100,
      horizonYears: 1,
    },
  });
  const result = simulatePlan(plan, baselineScenario);
  expect(result.firstGoalMonth).toBeNull();
  expect(result.warnings.some((w) => w.includes('does not reach'))).toBe(true);
});

// 10. Invalid allocation produces warning
it('invalid allocation sum produces a warning', () => {
  const plan = makeBasePlan({
    allocation: { cash: 0.4, fd: 0.3, index: 0.1, debt: 0.1, gold: 0.0 }, // sums to 0.9
  });
  const result = simulatePlan(plan, baselineScenario);
  expect(result.warnings.some((w) => w.includes('Allocation sums to'))).toBe(true);
});

// 11. Negative annual return > -100% does not produce NaN
it('negative model return does not produce NaN', () => {
  const plan = makeBasePlan({
    assumptions: {
      ...makeBasePlan().assumptions,
      index: { id: 'index', label: 'Index', annualReturn: -0.3, annualFee: 0, modelNotes: '' },
    },
    allocation: { cash: 0, fd: 0, index: 1, debt: 0, gold: 0 },
    profile: { ...makeBasePlan().profile, initialBalanceINR: 10000 },
  });
  const result = simulatePlan(plan, baselineScenario);
  result.snapshots.forEach((s) => {
    expect(isNaN(s.totalValueINR)).toBe(false);
    expect(isFinite(s.totalValueINR)).toBe(true);
  });
});

// 12. Scenario simulation does not mutate baseline plan
it('scenario simulation does not mutate plan object', () => {
  const plan = makeBasePlan();
  const original = JSON.stringify(plan);
  simulatePlan(plan, { id: 'equity-crash', eventMonth: 12, equityShockFraction: -0.25 });
  expect(JSON.stringify(plan)).toBe(original);
});

// 14. Same inputs → same results regardless of edit sequence
it('same final inputs produce identical results', () => {
  const planA = makeBasePlan({
    profile: { ...makeBasePlan().profile, plannedContributionINR: 2500 },
  });
  // Then "edit" to 2500 by making a new plan:
  const planBEdited = makeBasePlan({
    profile: { ...makeBasePlan().profile, plannedContributionINR: 2500 },
  });
  const rA = simulatePlan(planA, baselineScenario);
  const rB = simulatePlan(planBEdited, baselineScenario);
  expect(rA.snapshots[24].totalValueINR).toBeCloseTo(rB.snapshots[24].totalValueINR, 2);
});
