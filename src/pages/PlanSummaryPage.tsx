import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import EditorialShell from '../components/shell/EditorialShell';
import {
  ChapterEyebrow,
  EditorialHeading,
  FineRule,
  AssumptionNote,
} from '../components/editorial/EditorialComponents';
import { usePlanStore } from '../store/usePlanStore';
import { simulatePlan } from '../engine/simulatePlan';
import { formatINR, formatINRWithWords, goalMonthLabel } from '../engine/formatCurrency';
import { availableSurplus } from '../engine/validatePlan';

const assetLabels: Record<string, string> = {
  cash: 'Accessible cash',
  fd: 'Fixed deposit',
  index: 'Equity index fund',
  debt: 'Debt fund',
  gold: 'Gold exposure',
};

export default function PlanSummaryPage() {
  const navigate = useNavigate();
  const plan = usePlanStore((s) => s.plan);
  const profile = plan.profile;
  const surplus = availableSurplus(profile);

  const projection = useMemo(
    () => simulatePlan(plan, { id: 'baseline', eventMonth: 0 }),
    [plan]
  );

  const crashScenario = useMemo(
    () => simulatePlan(plan, { id: 'equity-crash', eventMonth: 5 * 12, equityShockFraction: -0.25 }),
    [plan]
  );

  const finalSnap = projection.snapshots[projection.snapshots.length - 1];

  return (
    <EditorialShell>
      <div className="max-w-reading mx-auto px-6 py-12 space-y-10 print-content">
        <div className="no-print flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/journal')}
            className="text-sm"
            style={{ color: 'var(--muted-ink)' }}
            type="button"
          >
            ← Back to journal
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm"
            style={{ border: '1px solid var(--rule)', color: 'var(--muted-ink)' }}
            type="button"
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
        </div>

        {/* Title */}
        <div>
          <ChapterEyebrow chapter="YOUR PLAN IN PLAIN ENGLISH" />
          <EditorialHeading as="h1" className="text-chapter mt-2">
            A plain summary of your draft
          </EditorialHeading>
          <p className="text-xs mt-2" style={{ color: 'var(--muted-ink)' }}>
            Generated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            {plan.isDemo && ' · Illustrative demo profile'}
          </p>
        </div>

        <FineRule />

        {/* Goal */}
        <section className="space-y-3">
          <p className="chapter-eyebrow">GOAL</p>
          <p className="text-3xl font-semibold tabular-nums" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)' }}>
            {formatINR(profile.goalAmountINR)}
          </p>
          <p style={{ color: 'var(--muted-ink)' }}>{formatINRWithWords(profile.goalAmountINR)}</p>
          <p className="text-sm" style={{ color: 'var(--muted-ink)' }}>
            Goal type: <strong>{profile.goalType === 'nominal' ? 'Nominal (future ₹)' : 'Today\'s purchasing power'}</strong>
          </p>
        </section>

        <FineRule />

        {/* Affordability */}
        <section className="space-y-3">
          <p className="chapter-eyebrow">STARTING ASSUMPTIONS</p>
          <table className="w-full text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            <tbody>
              {[
                { label: 'Monthly income', value: formatINR(profile.monthlyIncomeINR) },
                { label: 'Essential spend', value: formatINR(profile.monthlyCommittedSpendINR) },
                { label: 'Monthly buffer', value: formatINR(profile.monthlyReserveINR) },
                { label: 'Available surplus', value: formatINR(surplus), highlight: true },
                { label: 'Planned contribution', value: formatINR(profile.plannedContributionINR) },
                { label: 'Initial balance', value: formatINR(profile.initialBalanceINR) },
                { label: 'Time horizon', value: `${profile.horizonYears} years` },
              ].map(({ label, value, highlight }) => (
                <tr key={label} style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td className="py-2 pr-4" style={{ color: 'var(--muted-ink)' }}>{label}</td>
                  <td className="py-2 text-right tabular-nums font-medium" style={{ color: highlight ? 'var(--forest)' : 'var(--ink)' }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <FineRule />

        {/* Allocation */}
        <section className="space-y-3">
          <p className="chapter-eyebrow">ALLOCATION & MONTHLY AMOUNTS</p>
          <table className="w-full text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                <th className="text-left py-1 pr-4" style={{ color: 'var(--muted-ink)' }}>Instrument</th>
                <th className="text-right py-1 pr-4" style={{ color: 'var(--muted-ink)' }}>Allocation</th>
                <th className="text-right py-1 pr-4" style={{ color: 'var(--muted-ink)' }}>Monthly</th>
                <th className="text-right py-1" style={{ color: 'var(--muted-ink)' }}>Net return (illus.)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(plan.allocation)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([id, frac]) => {
                  const assumption = plan.assumptions[id as keyof typeof plan.assumptions];
                  const netReturn = ((assumption.annualReturn - assumption.annualFee) * 100).toFixed(1);
                  return (
                    <tr key={id} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td className="py-2 pr-4">{assetLabels[id] ?? id}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{(frac * 100).toFixed(0)}%</td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {formatINR(profile.plannedContributionINR * frac)}
                      </td>
                      <td className="py-2 text-right tabular-nums" style={{ color: 'var(--muted-ink)' }}>
                        {netReturn}%
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <AssumptionNote>
            Net returns are illustrative educational figures, not current rates or financial advice. Fees, taxes, and product terms differ.
          </AssumptionNote>
        </section>

        <FineRule />

        {/* Projection */}
        <section className="space-y-3">
          <p className="chapter-eyebrow">ILLUSTRATIVE PROJECTION</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p style={{ color: 'var(--muted-ink)' }}>First goal-reaching month</p>
              <p className="font-semibold" style={{ color: projection.firstGoalMonth !== null ? 'var(--forest)' : 'var(--clay)' }}>
                {goalMonthLabel(projection.firstGoalMonth, profile.horizonYears)}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--muted-ink)' }}>Portfolio at horizon ({profile.horizonYears} yr)</p>
              <p className="font-semibold tabular-nums">{formatINR(finalSnap?.totalValueINR ?? 0)}</p>
            </div>
          </div>
          {projection.warnings.length > 0 && (
            <div className="p-3 rounded-md text-sm" style={{ background: 'var(--clay-wash)', color: 'var(--clay)' }}>
              {projection.warnings.map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}
        </section>

        <FineRule />

        {/* Bad year scenario */}
        <section className="space-y-3">
          <p className="chapter-eyebrow">DOWNSIDE SCENARIO: 25% EQUITY DROP AT YEAR 5</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p style={{ color: 'var(--muted-ink)' }}>Goal-reaching month</p>
              <p className="font-semibold" style={{ color: crashScenario.firstGoalMonth !== null ? 'var(--ink)' : 'var(--clay)' }}>
                {goalMonthLabel(crashScenario.firstGoalMonth, profile.horizonYears)}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--muted-ink)' }}>Impact on goal timing</p>
              <p className="font-semibold" style={{ color: 'var(--clay)' }}>
                {crashScenario.firstGoalMonth !== null && projection.firstGoalMonth !== null
                  ? crashScenario.firstGoalMonth > projection.firstGoalMonth
                    ? `${Math.round((crashScenario.firstGoalMonth - projection.firstGoalMonth) / 12)} years later`
                    : 'Unchanged'
                  : crashScenario.firstGoalMonth === null
                  ? 'Not reached in horizon'
                  : '—'}
              </p>
            </div>
          </div>
          <AssumptionNote>
            Only the equity (index) portion was reduced by 25%. This is one hypothetical scenario, not a prediction.
          </AssumptionNote>
        </section>

        <FineRule />

        {/* Risks and disclaimers */}
        <section className="space-y-3">
          <p className="chapter-eyebrow">RISKS AND OMISSIONS</p>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}>
            {[
              'Returns are illustrative and do not reflect real market performance, current rates, or guaranteed outcomes.',
              'Taxes on capital gains, dividends, and interest are not included in this simulation.',
              'Exit loads, premature withdrawal penalties, and product-specific terms are not modelled.',
              'Inflation shown as an illustrative rate. Real purchasing power erosion will differ.',
              'This plan does not constitute personalized financial advice. Consult a SEBI-registered advisor.',
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: 'var(--clay)', flexShrink: 0 }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <FineRule />

        {/* Three questions worth revisiting */}
        <section className="space-y-3">
          <p className="chapter-eyebrow">THREE QUESTIONS WORTH REVISITING</p>
          <ol className="space-y-3 text-sm" style={{ color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}>
            <li>
              <strong>1.</strong> Has your income or essential spending changed significantly since you created this plan?
            </li>
            <li>
              <strong>2.</strong> Are you comfortable with the equity exposure if markets fall 25–40% in a single year?
            </li>
            <li>
              <strong>3.</strong> Is your emergency fund separate from and adequate before this plan?
            </li>
          </ol>
        </section>

        <FineRule />

        <p className="text-xs" style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}>
          Educational simulation only. Not personalised investment advice. No financial transactions occur.
          Data stored on this device only. Waymark · {new Date().getFullYear()}
        </p>
      </div>
    </EditorialShell>
  );
}
