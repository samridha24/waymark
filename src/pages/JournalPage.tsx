import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EditorialShell from '../components/shell/EditorialShell';
import {
  ChapterEyebrow,
  EditorialHeading,
  FineRule,
  AssumptionNote,
  DemoIndicator,
} from '../components/editorial/EditorialComponents';
import { usePlanStore } from '../store/usePlanStore';
import { useShallow } from 'zustand/shallow';
import { simulatePlan } from '../engine/simulatePlan';
import { formatINR, formatINRWithWords, goalMonthLabel } from '../engine/formatCurrency';

export default function JournalPage() {
  const navigate = useNavigate();
  const {
    plan,
    savedPlans,
    onboardingComplete,
    saveCurrentPlan,
    clearAllLocalData,
  } = usePlanStore(useShallow((s) => ({
    plan: s.plan,
    savedPlans: s.savedPlans,
    onboardingComplete: s.onboardingComplete,
    saveCurrentPlan: s.saveCurrentPlan,
    clearAllLocalData: s.clearAllLocalData,
  })));

  const profile = plan.profile;

  const projection = useMemo(
    () => simulatePlan(plan, { id: 'baseline', eventMonth: 0 }),
    [plan]
  );

  const finalSnap = projection.snapshots[projection.snapshots.length - 1];
  const goalMonth = projection.firstGoalMonth;

  // Status sentence
  const statusSentence = (() => {
    if (profile.plannedContributionINR > 0) {
      return `Your first draft sets aside ${formatINR(profile.plannedContributionINR)} each month toward ${formatINRWithWords(profile.goalAmountINR)}.`;
    }
    return `Your plan targets ${formatINRWithWords(profile.goalAmountINR)} with no monthly contribution set yet.`;
  })();

  // Next action
  const nextAction = (() => {
    if (!onboardingComplete) {
      return { label: 'Finish your starting point', path: '/begin' };
    }
    if (profile.plannedContributionINR === 0) {
      return { label: 'Set a monthly contribution', path: '/workbench' };
    }
    if (goalMonth === null) {
      return { label: 'Adjust your plan — goal isn\'t reached in this horizon', path: '/workbench' };
    }
    return { label: 'Test a difficult year', path: '/weather-room' };
  })();

  const allocationEntries = Object.entries(plan.allocation)
    .filter(([_, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const assetLabels: Record<string, string> = {
    cash: 'Accessible cash',
    fd: 'Fixed deposit',
    index: 'Index fund',
    debt: 'Debt fund',
    gold: 'Gold',
  };

  return (
    <EditorialShell>
      <div className="max-w-content mx-auto px-6">
        <div className="pt-12 pb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <ChapterEyebrow chapter="05 / THE JOURNAL" />
            <EditorialHeading as="h1" className="text-chapter mt-3">
              Your plan, in perspective.
            </EditorialHeading>
          </div>
          {plan.isDemo && <DemoIndicator />}
        </div>

        {!onboardingComplete && (
          <div
            className="mb-8 p-5 rounded-xl"
            style={{ background: 'var(--forest-wash)', border: '1px solid var(--forest)' }}
          >
            <p className="text-base font-medium" style={{ color: 'var(--forest)', fontFamily: 'var(--font-editorial)' }}>
              Every plan begins somewhere.
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted-ink)' }}>
              You haven't completed the starting point yet. Your plan uses the demo profile — all values are editable.
            </p>
            <button
              onClick={() => navigate('/begin')}
              className="mt-3 px-4 py-2 rounded-md text-sm font-medium"
              style={{ background: 'var(--forest)', color: 'var(--paper)' }}
              type="button"
            >
              Complete your starting point →
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10 pb-24">
          {/* Left — editorial statement */}
          <div className="lg:col-span-1 space-y-8">
            {/* Status */}
            <div
              className="p-6 rounded-xl"
              style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
            >
              <p
                className="text-xl leading-snug"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                }}
              >
                "{statusSentence}"
              </p>
            </div>

            {/* Next action */}
            <div
              className="p-5 rounded-xl space-y-3"
              style={{ background: 'var(--forest-wash)', border: '1px solid var(--forest)' }}
            >
              <p className="chapter-eyebrow" style={{ color: 'var(--forest)' }}>ONE NEXT STEP</p>
              <p className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-editorial)' }}>
                {nextAction.label}
              </p>
              <button
                onClick={() => navigate(nextAction.path)}
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: 'var(--forest)' }}
                type="button"
              >
                Go there →
              </button>
            </div>

            {/* Quick links */}
            <nav className="space-y-2" aria-label="Quick navigation">
              <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>EXPLORE</p>
              {[
                { label: 'Edit my draft', path: '/workbench' },
                { label: 'Review the choices', path: '/field-guide' },
                { label: 'Test a bad year', path: '/weather-room' },
                { label: 'Read my plan summary', path: '/plan-summary' },
              ].map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className="block text-sm py-2 px-3 rounded-md transition-colors"
                  style={{ color: 'var(--muted-ink)', background: 'var(--paper)', border: '1px solid var(--rule)' }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right — plan at a glance + history */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary visual: mini timeline */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Plan preview</p>
                <span
                  className="text-xs px-2 py-1 rounded-md"
                  style={{ background: 'var(--canvas)', color: 'var(--muted-ink)', border: '1px solid var(--rule)' }}
                >
                  Not real portfolio balance
                </span>
              </div>

              <PlanTimeline
                goalAmountINR={profile.goalAmountINR}
                finalValue={finalSnap?.totalValueINR ?? 0}
                goalMonth={goalMonth}
                horizonYears={profile.horizonYears}
              />
            </div>

            {/* Draft at a glance */}
            <div
              className="rounded-xl p-5 space-y-4"
              style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
            >
              <p className="chapter-eyebrow">YOUR DRAFT AT A GLANCE</p>

              <div className="space-y-3 text-sm">
                <Row label="Goal" value={formatINR(profile.goalAmountINR)} />
                <Row label="Monthly contribution" value={formatINR(profile.plannedContributionINR)} />
                <Row
                  label="First goal date (illustration)"
                  value={goalMonthLabel(goalMonth, profile.horizonYears)}
                  highlight={goalMonth === null ? 'clay' : undefined}
                />
                <Row
                  label="At end of horizon"
                  value={formatINR(finalSnap?.totalValueINR ?? 0)}
                  sub={`After ${profile.horizonYears} years`}
                />
              </div>

              <FineRule />

              <div className="space-y-2">
                <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>ALLOCATION</p>
                {allocationEntries.map(([id, frac]) => (
                  <div key={id} className="flex items-center gap-3 text-sm">
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ background: 'var(--forest)' }}
                      aria-hidden="true"
                    />
                    <span style={{ color: 'var(--ink)' }}>{assetLabels[id] ?? id}</span>
                    <span className="ml-auto tabular-nums" style={{ color: 'var(--muted-ink)' }}>
                      {(frac * 100).toFixed(0)}% — {formatINR(profile.plannedContributionINR * frac)}/mo
                    </span>
                  </div>
                ))}
              </div>

              <FineRule />

              <AssumptionNote>
                Based on illustrative return assumptions — not a real portfolio. Actual returns, fees, and taxes differ. This is a planning tool, not an investment account.
              </AssumptionNote>
            </div>

            {/* Saved history */}
            {savedPlans.length > 0 && (
              <div
                className="rounded-xl p-5 space-y-4"
                style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
              >
                <p className="chapter-eyebrow">YOUR NOTES / CHANGES</p>
                <div className="space-y-2">
                  {savedPlans.slice(0, 5).map((sp) => (
                    <div
                      key={sp.id}
                      className="flex items-center justify-between py-2 text-sm"
                      style={{ borderBottom: '1px solid var(--rule)' }}
                    >
                      <div>
                        <p style={{ color: 'var(--ink)' }}>{sp.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>
                          Goal: {formatINR(sp.plan.profile.goalAmountINR)} · Contribution: {formatINR(sp.plan.profile.plannedContributionINR)}/mo
                          {sp.plan.isDemo && (
                            <span className="ml-2 text-xs" style={{ color: 'var(--gold-ink)' }}>demo</span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--muted-ink)' }}>
                        {new Date(sp.savedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { saveCurrentPlan(); }}
                className="px-4 py-2.5 rounded-md text-sm font-medium"
                style={{ background: 'var(--forest)', color: 'var(--paper)' }}
                type="button"
              >
                Save draft
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Clear all local data? This cannot be undone.')) {
                    clearAllLocalData();
                  }
                }}
                className="px-4 py-2.5 rounded-md text-sm"
                style={{ border: '1px solid var(--rule)', color: 'var(--clay)' }}
                type="button"
              >
                Clear all data
              </button>
            </div>

            <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
              Data stored on this device only. No account required, no data sent anywhere.
            </p>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}

function Row({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: 'clay' | 'forest';
}) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span style={{ color: 'var(--muted-ink)' }}>{label}</span>
      <div className="text-right">
        <span
          className="tabular-nums font-medium"
          style={{
            color: highlight === 'clay' ? 'var(--clay)' : highlight === 'forest' ? 'var(--forest)' : 'var(--ink)',
          }}
        >
          {value}
        </span>
        {sub && (
          <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function PlanTimeline({
  goalAmountINR,
  finalValue,
  goalMonth,
  horizonYears,
}: {
  goalAmountINR: number;
  finalValue: number;
  goalMonth: number | null;
  horizonYears: number;
}) {
  const maxValue = Math.max(goalAmountINR, finalValue) * 1.1;
  const finalPct = Math.min(100, (finalValue / maxValue) * 100);
  const goalPct = Math.min(100, (goalAmountINR / maxValue) * 100);

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height: 12, background: 'var(--rule)' }}
        role="img"
        aria-label={`Progress toward ${formatINR(goalAmountINR)}. Illustrative value at horizon: ${formatINR(finalValue)}.`}
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${finalPct}%`,
            background: finalValue >= goalAmountINR ? 'var(--forest)' : 'var(--gold-ink)',
            transition: 'width 400ms ease',
          }}
        />
        {/* Goal marker */}
        <div
          className="absolute top-0 h-full w-0.5"
          style={{ left: `${goalPct}%`, background: 'var(--forest)', opacity: 0.7 }}
          aria-hidden="true"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs" style={{ color: 'var(--muted-ink)' }}>
        <span>Now</span>
        <span>
          {goalMonth !== null
            ? `Goal reached: ${goalMonthLabel(goalMonth, horizonYears)}`
            : 'Goal not reached in this horizon'}
        </span>
        <span>
          Year {horizonYears}: {formatINR(finalValue, true)}
        </span>
      </div>

      <p className="text-xs" style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}>
        Plan preview — illustrative projection only. Not a real account balance.
      </p>
    </div>
  );
}
