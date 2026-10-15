import type { UserProfile, AssetId } from '../types/finance';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

export function validateProfile(profile: UserProfile): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!isFinite(profile.goalAmountINR) || profile.goalAmountINR <= 0) {
    errors.goalAmountINR = 'Goal amount must be a positive number.';
  }
  if (!isFinite(profile.monthlyIncomeINR) || profile.monthlyIncomeINR < 0) {
    errors.monthlyIncomeINR = 'Income must be zero or positive.';
  }
  if (!isFinite(profile.monthlyCommittedSpendINR) || profile.monthlyCommittedSpendINR < 0) {
    errors.monthlyCommittedSpendINR = 'Committed spend must be zero or positive.';
  }
  if (!isFinite(profile.monthlyReserveINR) || profile.monthlyReserveINR < 0) {
    errors.monthlyReserveINR = 'Reserve must be zero or positive.';
  }

  const available = Math.max(
    0,
    profile.monthlyIncomeINR -
      profile.monthlyCommittedSpendINR -
      profile.monthlyReserveINR
  );

  if (profile.plannedContributionINR > available) {
    warnings.push(
      `That would exceed the amount you marked as available each month (${available > 0 ? `₹${available.toLocaleString('en-IN')}` : '₹0'}).`
    );
  }

  if (profile.plannedContributionINR < 0) {
    errors.plannedContributionINR = 'Contribution cannot be negative.';
  }

  if (!isFinite(profile.horizonYears) || profile.horizonYears < 1 || profile.horizonYears > 50) {
    errors.horizonYears = 'Time horizon must be between 1 and 50 years.';
  }

  return { valid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateAllocation(allocation: Record<AssetId, number>): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];
  const ids: AssetId[] = ['cash', 'fd', 'index', 'debt', 'gold'];

  let sum = 0;
  for (const id of ids) {
    const v = allocation[id] ?? 0;
    if (v < 0) errors[id] = `Allocation for ${id} cannot be negative.`;
    sum += v;
  }

  if (Math.abs(sum - 1) > 1e-6) {
    warnings.push(`Allocation sums to ${(sum * 100).toFixed(1)}%, not 100%. Please adjust.`);
  }

  return { valid: Object.keys(errors).length === 0, errors, warnings };
}

export function availableSurplus(profile: UserProfile): number {
  return Math.max(
    0,
    profile.monthlyIncomeINR -
      profile.monthlyCommittedSpendINR -
      profile.monthlyReserveINR
  );
}
