export function formatINR(amount: number, compact = false): string {
  if (!isFinite(amount)) return '₹—';

  if (compact) {
    if (Math.abs(amount) >= 10_000_000) {
      return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100_000) {
      return `₹${(amount / 100_000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatINRWithWords(amount: number): string {
  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    return `₹${crore.toFixed(crore % 1 === 0 ? 0 : 2)} crore`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `₹${lakh.toFixed(lakh % 1 === 0 ? 0 : 2)} lakh`;
  }
  return formatINR(amount);
}

export function monthsToYearsLabel(months: number): string {
  if (months === null || months === undefined) return '—';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} month${rem !== 1 ? 's' : ''}`;
  if (rem === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} yr ${rem} mo`;
}

export function goalMonthLabel(month: number | null, horizonYears: number): string {
  if (month === null) {
    return `Not reached in this ${horizonYears}-year illustration`;
  }
  if (month === 0) return 'Already reached';
  return `In ${monthsToYearsLabel(month)}`;
}
