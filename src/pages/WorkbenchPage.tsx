import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Save, Info } from 'lucide-react';
import EditorialShell from '../components/shell/EditorialShell';
import {
  ChapterEyebrow,
  EditorialHeading,
  AssumptionNote,
  FineRule,
  DemoIndicator,
  MarginalNote,
} from '../components/editorial/EditorialComponents';
import AllocationRibbon from '../components/workbench/AllocationRibbon';
import ProjectionGraph from '../components/charts/ProjectionGraph';
import { usePlanStore } from '../store/usePlanStore';
import { useShallow } from 'zustand/shallow';
import { simulatePlan } from '../engine/simulatePlan';
import { describeChange } from '../engine/describeChange';
import { availableSurplus } from '../engine/validatePlan';
import { formatINR, formatINRWithWords, goalMonthLabel } from '../engine/formatCurrency';
import type { AssetId } from '../types/finance';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ASSUMPTION_LABELS = {
  cautious: 'Cautious scenario',
  baseline: 'Illustrative baseline',
  optimistic: 'Optimistic hypothetical',
};

const ASSUMPTION_MULTIPLIERS: Record<string, number> = {
  cautious: 0.6,
  baseline: 1,
  optimistic: 1.4,
};

export default function WorkbenchPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const {
    plan,
    updateProfile,
    updateAllocation,
    normalizeAllocation,
    saveCurrentPlan,
    resetToDemo,
    lastEdit,
    recordEdit,
  } = usePlanStore(useShallow((s) => ({
    plan: s.plan,
    updateProfile: s.updateProfile,
    updateAllocation: s.updateAllocation,
    normalizeAllocation: s.normalizeAllocation,
    saveCurrentPlan: s.saveCurrentPlan,
    resetToDemo: s.resetToDemo,
    lastEdit: s.lastEdit,
    recordEdit: s.recordEdit,
  })));

  const [assumptionSet, setAssumptionSet] = useState<'cautious' | 'baseline' | 'optimistic'>('baseline');
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prevGoalMonth, setPrevGoalMonth] = useState<number | null>(null);

  const profile = plan.profile;
  const surplus = availableSurplus(profile);

  // Build assumptions with multiplier
  const adjustedAssumptions = useMemo(() => {
    const mult = ASSUMPTION_MULTIPLIERS[assumptionSet];
    const result = { ...plan.assumptions };
    for (const id of Object.keys(result) as AssetId[]) {
      result[id] = {
        ...result[id],
        annualReturn: Math.max(-0.5, result[id].annualReturn * mult),
      };
    }
    return result;
  }, [plan.assumptions, assumptionSet]);

  // Weighted effective (net) return across current allocation
  const weightedNetReturn = useMemo(() => {
    const ids: AssetId[] = ['cash', 'fd', 'index', 'debt', 'gold'];
    return ids.reduce((sum, id) => {
      const alloc = plan.allocation[id] ?? 0;
      const a = adjustedAssumptions[id];
      return sum + alloc * (a.annualReturn - a.annualFee);
    }, 0);
  }, [plan.allocation, adjustedAssumptions]);

  const adjustedPlan = useMemo(
    () => ({ ...plan, assumptions: adjustedAssumptions }),
    [plan, adjustedAssumptions]
  );

  const baselineResult = useMemo(
    () => simulatePlan(adjustedPlan, { id: 'baseline', eventMonth: 0 }),
    [adjustedPlan]
  );

  const firstGoalMonth = baselineResult.firstGoalMonth;

  function handleContributionChange(v: number) {
    const clamped = Math.max(0, Math.min(v, surplus > 0 ? surplus : v));
    const prev = profile.plannedContributionINR;
    recordEdit('plannedContributionINR', prev, clamped);
    setPrevGoalMonth(firstGoalMonth);
    updateProfile({ plannedContributionINR: clamped });
  }

  function handleAllocationChange(asset: AssetId, fraction: number) {
    setPrevGoalMonth(firstGoalMonth);
    recordEdit('allocation', weightedNetReturn, null); // before; after computed post-update
    updateAllocation(asset, fraction);
  }

  function handleSave() {
    saveCurrentPlan();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const changeReceipt = useMemo(() => {
    if (!lastEdit) return null;
    if (lastEdit.field === 'allocation') {
      const prevReturn = typeof lastEdit.before === 'number' ? lastEdit.before : null;
      const parts: string[] = [];
      if (prevReturn !== null) {
        parts.push(`Allocation updated. Blended return moved from ${(prevReturn * 100).toFixed(1)}% to ${(weightedNetReturn * 100).toFixed(1)}% per year.`);
      } else {
        parts.push(`Allocation updated. Blended return: ${(weightedNetReturn * 100).toFixed(1)}% per year.`);
      }
      if (prevGoalMonth !== firstGoalMonth) {
        const prev = prevGoalMonth === null ? 'not reached in this horizon' : `Year ${Math.floor(prevGoalMonth / 12)}`;
        const next = firstGoalMonth === null ? 'not reached in this horizon' : `Year ${Math.floor(firstGoalMonth / 12)}`;
        parts.push(`Goal timing moved from ${prev} to ${next}.`);
      }
      return parts.join(' ');
    }
    return describeChange(
      lastEdit.field as string,
      lastEdit.before,
      lastEdit.after,
      prevGoalMonth,
      firstGoalMonth
    );
  }, [lastEdit, prevGoalMonth, firstGoalMonth, weightedNetReturn]);

  return (
    <EditorialShell>
      <div className="max-w-content mx-auto px-6">
        {/* Header */}
        <div className="pt-12 pb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <ChapterEyebrow chapter="03 / THE DRAFT" />
            <EditorialHeading as="h1" className="text-chapter mt-3">
              Make a draft. See what it changes.
            </EditorialHeading>
            <p className="mt-2 text-base" style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}>
              A plan is a set of decisions you can revisit.
            </p>
          </div>
          {plan.isDemo && <DemoIndicator />}
        </div>

        <div className="grid lg:grid-cols-5 gap-10 pb-24">
          {/* Left — controls */}
          <div className="lg:col-span-2 space-y-8">

            {/* Goal */}
            <section className="space-y-3">
              <p className="chapter-eyebrow">GOAL</p>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-semibold tabular-nums"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)' }}
                >
                  {formatINR(profile.goalAmountINR)}
                </span>
                <button
                  onClick={() => navigate('/begin')}
                  className="text-xs underline"
                  style={{ color: 'var(--forest)', textDecorationStyle: 'dotted' }}
                  type="button"
                >
                  Change
                </button>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
                {formatINRWithWords(profile.goalAmountINR)}
              </p>
            </section>

            <FineRule />

            {/* Initial balance */}
            <section className="space-y-3">
              <label className="chapter-eyebrow block" htmlFor="initial-balance">
                INITIAL SAVINGS
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-ink)' }}>₹</span>
                <input
                  id="initial-balance"
                  type="number"
                  min={0}
                  value={profile.initialBalanceINR || ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    updateProfile({ initialBalanceINR: v });
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-md text-sm tabular-nums"
                  style={{
                    border: '1px solid var(--rule)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-ui)',
                  }}
                  aria-label="Initial savings amount"
                  placeholder="0"
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
                Any existing savings to start from.
              </p>
            </section>

            <FineRule />

            {/* Monthly contribution */}
            <section className="space-y-3">
              <label className="chapter-eyebrow block" htmlFor="contribution-slider">
                MONTHLY CONTRIBUTION
              </label>
              <div
                className="text-3xl font-semibold tabular-nums"
                style={{ fontFamily: 'var(--font-editorial)', color: 'var(--forest)' }}
              >
                {formatINR(profile.plannedContributionINR)}
              </div>
              {surplus > 0 ? (
                <>
                  <input
                    id="contribution-slider"
                    type="range"
                    min={0}
                    max={surplus}
                    step={100}
                    value={Math.min(profile.plannedContributionINR, surplus)}
                    onChange={(e) => handleContributionChange(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: 'var(--forest)' }}
                    aria-label={`Monthly contribution: ${formatINR(profile.plannedContributionINR)}`}
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-ink)' }}>₹</span>
                      <input
                        type="number"
                        min={0}
                        max={surplus}
                        value={profile.plannedContributionINR || ''}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value) || 0;
                          handleContributionChange(v);
                        }}
                        className="w-full pl-8 pr-3 py-2 rounded-md text-sm tabular-nums"
                        style={{
                          border: '1px solid var(--rule)',
                          background: 'var(--paper)',
                          color: 'var(--ink)',
                          fontFamily: 'var(--font-ui)',
                        }}
                        aria-label="Monthly contribution exact amount"
                      />
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
                    Max available: {formatINR(surplus)}/month
                  </p>
                  {profile.plannedContributionINR > surplus && (
                    <p className="text-xs" style={{ color: 'var(--clay)' }}>
                      That would exceed the amount you marked as available each month.
                    </p>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-sm" style={{ color: 'var(--clay)' }}>
                    No available surplus. <button onClick={() => navigate('/begin')} className="underline" style={{ color: 'var(--clay)' }} type="button">Revise your budget</button>.
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-ink)' }}>
                    You can still model any amount here for illustration.
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={profile.plannedContributionINR || ''}
                    onChange={(e) => updateProfile({ plannedContributionINR: parseFloat(e.target.value) || 0 })}
                    className="mt-2 w-full px-3 py-2 rounded-md text-sm"
                    style={{
                      border: '1px solid var(--clay)',
                      background: 'var(--clay-wash)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-ui)',
                    }}
                    aria-label="Monthly contribution (override)"
                  />
                </div>
              )}
            </section>

            <FineRule />

            {/* Time horizon */}
            <section className="space-y-3">
              <label className="chapter-eyebrow block" htmlFor="horizon">
                TIME HORIZON
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {[5, 10, 20, 30].map((y) => (
                  <button
                    key={y}
                    onClick={() => updateProfile({ horizonYears: y })}
                    type="button"
                    className="px-3 py-1.5 rounded-md text-sm transition-colors"
                    style={{
                      border: `1px solid ${profile.horizonYears === y ? 'var(--forest)' : 'var(--rule)'}`,
                      background: profile.horizonYears === y ? 'var(--forest-wash)' : 'var(--paper)',
                      color: profile.horizonYears === y ? 'var(--forest)' : 'var(--ink)',
                    }}
                    aria-pressed={profile.horizonYears === y}
                  >
                    {y} yr
                  </button>
                ))}
                <input
                  id="horizon"
                  type="number"
                  min={1}
                  max={50}
                  value={profile.horizonYears}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 1 && v <= 50) updateProfile({ horizonYears: v });
                  }}
                  className="w-20 px-3 py-1.5 rounded-md text-sm tabular-nums"
                  style={{
                    border: '1px solid var(--rule)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-ui)',
                  }}
                  aria-label="Custom time horizon in years"
                />
              </div>
            </section>

            <FineRule />

            {/* Allocation */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="chapter-eyebrow">ALLOCATION</p>
                <button
                  onClick={normalizeAllocation}
                  className="text-xs"
                  style={{ color: 'var(--muted-ink)' }}
                  type="button"
                  title="Normalize to 100%"
                >
                  <RotateCcw size={12} className="inline mr-1" />
                  Normalize
                </button>
              </div>
              <AllocationRibbon
                allocation={plan.allocation}
                monthlyContribution={profile.plannedContributionINR}
                onChange={handleAllocationChange}
                onNormalize={normalizeAllocation}
              />

              {/* Blended return indicator */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm"
                style={{ background: 'var(--forest-wash)', border: '1px solid var(--forest)' }}
              >
                <span style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}>
                  Blended return (weighted avg)
                </span>
                <span
                  className="tabular-nums font-semibold"
                  style={{ color: 'var(--forest)', fontFamily: 'var(--font-ui)' }}
                >
                  ~{(weightedNetReturn * 100).toFixed(1)}% / yr
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}>
                Higher equity allocation → higher blended return → earlier goal date. More equity also means larger possible swings.
              </p>
            </section>

            <FineRule />

            {/* Assumption set */}
            <section className="space-y-3">
              <p className="chapter-eyebrow">RETURN ASSUMPTION</p>
              <div className="flex gap-2 flex-wrap">
                {(['cautious', 'baseline', 'optimistic'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAssumptionSet(a)}
                    type="button"
                    className="px-3 py-1.5 rounded-md text-xs transition-colors capitalize"
                    style={{
                      border: `1px solid ${assumptionSet === a ? 'var(--forest)' : 'var(--rule)'}`,
                      background: assumptionSet === a ? 'var(--forest-wash)' : 'var(--paper)',
                      color: assumptionSet === a ? 'var(--forest)' : 'var(--muted-ink)',
                    }}
                    aria-pressed={assumptionSet === a}
                  >
                    {ASSUMPTION_LABELS[a]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAssumptions(!showAssumptions)}
                type="button"
                className="text-xs underline flex items-center gap-1"
                style={{ color: 'var(--gold-ink)', textDecorationStyle: 'dotted' }}
                aria-expanded={showAssumptions}
              >
                <Info size={11} />
                {showAssumptions ? 'Hide' : 'Show'} assumptions
              </button>
              {showAssumptions && (
                <div
                  className="p-4 rounded-lg text-xs space-y-2"
                  style={{ background: 'var(--canvas)', border: '1px solid var(--rule)' }}
                >
                  <p className="font-semibold" style={{ color: 'var(--gold-ink)' }}>
                    ILLUSTRATIVE ANNUAL RETURNS (before fees)
                  </p>
                  {Object.values(plan.assumptions).map((a) => (
                    <div key={a.id} className="flex justify-between gap-2">
                      <span style={{ color: 'var(--muted-ink)' }}>{a.label}</span>
                      <span className="tabular-nums font-medium">
                        {(a.annualReturn * ASSUMPTION_MULTIPLIERS[assumptionSet] * 100).toFixed(1)}%
                        {a.annualFee > 0 && (
                          <span style={{ color: 'var(--muted-ink)' }}> – {(a.annualFee * 100).toFixed(1)}% fee</span>
                        )}
                      </span>
                    </div>
                  ))}
                  <AssumptionNote>
                    These are invented educational figures, not current market rates or financial advice.
                    {assumptionSet !== 'baseline' && ` (${ASSUMPTION_MULTIPLIERS[assumptionSet]}× of baseline)`}
                  </AssumptionNote>
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium"
                style={{ background: 'var(--forest)', color: 'var(--paper)', fontFamily: 'var(--font-ui)' }}
                type="button"
              >
                <Save size={14} />
                {saved ? 'Draft saved on this device.' : 'Save draft'}
              </button>
              <button
                onClick={resetToDemo}
                className="px-4 py-2.5 rounded-md text-sm"
                style={{ border: '1px solid var(--rule)', color: 'var(--muted-ink)' }}
                type="button"
              >
                Reset to demo
              </button>
            </div>
          </div>

          {/* Right — visualization */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="First goal date"
                value={goalMonthLabel(firstGoalMonth, profile.horizonYears)}
                sub={firstGoalMonth !== null ? `Month ${firstGoalMonth}` : ''}
                highlight={firstGoalMonth === null}
              />
              <StatCard
                label="At horizon"
                value={formatINR(
                  baselineResult.snapshots[baselineResult.snapshots.length - 1]?.totalValueINR ?? 0,
                  true
                )}
                sub={`After ${profile.horizonYears} yr`}
              />
              <StatCard
                label="Blended return"
                value={`~${(weightedNetReturn * 100).toFixed(1)}% / yr`}
                sub="Weighted net avg"
              />
            </div>

            {/* Chart */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  Illustrative projection
                </p>
                <span className="text-xs" style={{ color: 'var(--gold-ink)', fontStyle: 'italic' }}>
                  An illustration, not a promise.
                </span>
              </div>
              <ProjectionGraph
                baseline={baselineResult}
                goalAmountINR={profile.goalAmountINR}
                horizonYears={profile.horizonYears}
                height={320}
              />
            </div>

            {/* Warnings */}
            {baselineResult.warnings.length > 0 && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ background: 'var(--clay-wash)', border: '1px solid var(--clay)' }}
                role="alert"
              >
                {baselineResult.warnings.map((w, i) => (
                  <p key={i} style={{ color: 'var(--clay)' }}>
                    {w}
                  </p>
                ))}
              </div>
            )}

            {/* Decision receipt */}
            <AnimatePresence>
              {changeReceipt && (
                <motion.div
                  initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{ background: 'var(--forest-wash)', border: '1px solid var(--forest)' }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--forest)' }}>
                    WHAT CHANGED
                  </p>
                  <p style={{ color: 'var(--ink)' }}>{changeReceipt}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Marginal note */}
            <MarginalNote>
              This is one possible path, not a forecast. Returns are illustrative assumptions — actual markets fluctuate and can lose value.
            </MarginalNote>

            {/* Next step */}
            <button
              onClick={() => navigate('/weather-room')}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--forest)', fontFamily: 'var(--font-ui)' }}
              type="button"
            >
              Test a difficult year <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3 space-y-1"
      style={{
        background: 'var(--paper)',
        border: `1px solid ${highlight ? 'var(--clay)' : 'var(--rule)'}`,
      }}
    >
      <p className="text-xs" style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}>
        {label}
      </p>
      <p
        className="text-base font-semibold tabular-nums leading-tight"
        style={{ color: highlight ? 'var(--clay)' : 'var(--ink)', fontFamily: 'var(--font-ui)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
