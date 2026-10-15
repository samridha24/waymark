import { formatINR, monthsToYearsLabel } from './formatCurrency';

export function describeChange(
  field: string,
  before: unknown,
  after: unknown,
  prevGoalMonth: number | null,
  nextGoalMonth: number | null
): string {
  const parts: string[] = [];

  if (field === 'plannedContributionINR' && typeof before === 'number' && typeof after === 'number') {
    parts.push(`Monthly contribution changed from ${formatINR(before)} to ${formatINR(after)}.`);
  } else if (field === 'goalAmountINR' && typeof before === 'number' && typeof after === 'number') {
    parts.push(`Goal changed from ${formatINR(before)} to ${formatINR(after)}.`);
  } else if (field === 'horizonYears' && typeof before === 'number' && typeof after === 'number') {
    parts.push(`Time horizon changed from ${before} years to ${after} years.`);
  } else if (field === 'allocation') {
    parts.push('Allocation updated.');
  } else {
    parts.push(`${field} was updated.`);
  }

  if (prevGoalMonth !== nextGoalMonth) {
    const prevLabel =
      prevGoalMonth === null ? 'not reached in this horizon' : monthsToYearsLabel(prevGoalMonth);
    const nextLabel =
      nextGoalMonth === null ? 'not reached in this horizon' : monthsToYearsLabel(nextGoalMonth);
    parts.push(`Under this illustration, the first goal-reaching point moved from ${prevLabel} to ${nextLabel}.`);
  }

  return parts.join(' ');
}
