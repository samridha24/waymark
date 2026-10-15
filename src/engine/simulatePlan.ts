import type {
  FinancialPlan,
  ScenarioSettings,
  MonthSnapshot,
  ProjectionResult,
  AssetId,
} from '../types/finance';

const ASSET_IDS: AssetId[] = ['cash', 'fd', 'index', 'debt', 'gold'];
const MAX_HORIZON_MONTHS = 600; // 50 years

function effectiveMonthlyRate(annualReturn: number, annualFee: number): number {
  const net = annualReturn - annualFee;
  if (net <= -1) return -1; // floor to avoid NaN
  return Math.pow(1 + net, 1 / 12) - 1;
}

function sumByAsset(byAsset: Record<AssetId, number>): number {
  return ASSET_IDS.reduce((sum, id) => sum + (byAsset[id] ?? 0), 0);
}

function cloneByAsset(src: Record<AssetId, number>): Record<AssetId, number> {
  return { ...src } as Record<AssetId, number>;
}

export function simulatePlan(
  plan: FinancialPlan,
  scenario: ScenarioSettings
): ProjectionResult {
  const warnings: string[] = [];
  const assumptionsDescription: string[] = [];

  // --- Validate allocation ---
  const allocSum = ASSET_IDS.reduce(
    (s, id) => s + (plan.allocation[id] ?? 0),
    0
  );
  if (Math.abs(allocSum - 1) > 1e-6) {
    warnings.push(
      `Allocation sums to ${(allocSum * 100).toFixed(2)}%, not 100%. Simulation may be inaccurate.`
    );
  }

  // --- Validate horizon ---
  const horizonMonths = Math.min(
    plan.profile.horizonYears * 12,
    MAX_HORIZON_MONTHS
  );

  // --- Build asset monthly rates ---
  const monthlyRates: Record<AssetId, number> = {} as Record<AssetId, number>;
  for (const id of ASSET_IDS) {
    const assumption = plan.assumptions[id];
    monthlyRates[id] = effectiveMonthlyRate(
      assumption.annualReturn,
      assumption.annualFee
    );
    assumptionsDescription.push(
      `${assumption.label}: illustrative ${((assumption.annualReturn - assumption.annualFee) * 100).toFixed(1)}% net annual return`
    );
  }

  // --- Initial balances ---
  const initialTotal = plan.profile.initialBalanceINR;
  let byAsset: Record<AssetId, number> = {} as Record<AssetId, number>;
  for (const id of ASSET_IDS) {
    byAsset[id] = initialTotal * (plan.allocation[id] ?? 0);
  }

  let contributedPrincipal = initialTotal;
  let cumulativeWithdrawals = 0;
  const snapshots: MonthSnapshot[] = [];
  let firstGoalMonth: number | null = null;

  const inflationRate = plan.inflationRateAnnual > -1 ? plan.inflationRateAnnual : 0;
  const contribution = plan.profile.plannedContributionINR;

  // Month 0 snapshot
  const totalMonth0 = sumByAsset(byAsset);
  const goalNominal0 = plan.profile.goalAmountINR;
  const todayValue0 = totalMonth0; // no inflation at month 0
  const goalReached0 =
    plan.profile.goalType === 'nominal'
      ? totalMonth0 >= goalNominal0
      : todayValue0 >= goalNominal0;

  if (goalReached0) firstGoalMonth = 0;

  snapshots.push({
    month: 0,
    byAssetINR: cloneByAsset(byAsset),
    contributedPrincipalINR: contributedPrincipal,
    cumulativeWithdrawalsINR: 0,
    totalValueINR: totalMonth0,
    todayValueINR: todayValue0,
    nominalGoalThresholdINR: goalNominal0,
    goalReached: goalReached0,
  });

  // --- Month-by-month simulation ---
  for (let m = 1; m <= horizonMonths; m++) {
    // Step 1: determine this month's contribution
    let thisContribution = contribution;
    if (scenario.id === 'contribution-pause') {
      const pauseStart = scenario.eventMonth;
      const pauseEnd = pauseStart + (scenario.pauseMonths ?? 6) - 1;
      if (m >= pauseStart && m <= pauseEnd) {
        thisContribution = 0;
      }
    }
    if (scenario.id === 'increase-contribution') {
      if (m >= scenario.eventMonth) {
        thisContribution = contribution + (scenario.monthlyIncreaseINR ?? 0);
      }
    }

    // Step 2: apply monthly return for each asset
    const nextByAsset: Record<AssetId, number> = {} as Record<AssetId, number>;
    for (const id of ASSET_IDS) {
      const rate = monthlyRates[id];
      // Apply shock to equity (index) asset only
      let shock = 1;
      if (
        scenario.id === 'equity-crash' &&
        id === 'index' &&
        m === scenario.eventMonth
      ) {
        const fraction = scenario.equityShockFraction ?? -0.25;
        shock = Math.max(0, 1 + fraction); // clamp to 0 (no negative asset)
      }
      nextByAsset[id] = Math.max(0, byAsset[id] * (1 + rate) * shock);
    }

    // Step 3: optional withdrawal (baseline only in this simplified model)
    if (
      scenario.id === 'withdrawal' &&
      m === scenario.eventMonth &&
      scenario.withdrawalINR
    ) {
      let remaining = scenario.withdrawalINR;
      cumulativeWithdrawals += scenario.withdrawalINR;
      // Withdraw proportionally across assets
      const total = sumByAsset(nextByAsset);
      if (total > 0 && remaining > 0) {
        const factor = Math.max(0, 1 - remaining / total);
        for (const id of ASSET_IDS) {
          nextByAsset[id] = Math.max(0, nextByAsset[id] * factor);
        }
        remaining = 0;
      }
    }

    // Step 4: deposit end-of-month contributions
    if (thisContribution > 0) {
      for (const id of ASSET_IDS) {
        const alloc = plan.allocation[id] ?? 0;
        nextByAsset[id] = (nextByAsset[id] ?? 0) + thisContribution * alloc;
      }
      contributedPrincipal += thisContribution;
    }

    byAsset = nextByAsset;

    // Step 5: compute totals
    const totalNominal = sumByAsset(byAsset);
    const inflationFactor = Math.pow(1 + inflationRate, m / 12);
    const todayValue = totalNominal / inflationFactor;
    const nominalGoalThreshold = plan.profile.goalAmountINR;

    const goalReached =
      plan.profile.goalType === 'nominal'
        ? totalNominal >= nominalGoalThreshold
        : todayValue >= nominalGoalThreshold;

    if (goalReached && firstGoalMonth === null) {
      firstGoalMonth = m;
    }

    snapshots.push({
      month: m,
      byAssetINR: cloneByAsset(byAsset),
      contributedPrincipalINR: contributedPrincipal,
      cumulativeWithdrawalsINR: cumulativeWithdrawals,
      totalValueINR: totalNominal,
      todayValueINR: todayValue,
      nominalGoalThresholdINR: nominalGoalThreshold,
      goalReached,
    });
  }

  if (firstGoalMonth === null) {
    warnings.push(
      'This path does not reach the goal within the selected period.'
    );
  }

  return { snapshots, firstGoalMonth, warnings, assumptionsDescription };
}
