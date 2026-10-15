import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import EditorialShell from '../components/shell/EditorialShell';
import {
  ChapterEyebrow,
  EditorialHeading,
  AssumptionNote,
  FineRule,
  DemoIndicator,
  MarginalNote,
} from '../components/editorial/EditorialComponents';
import ProjectionGraph from '../components/charts/ProjectionGraph';
import { usePlanStore } from '../store/usePlanStore';
import { simulatePlan } from '../engine/simulatePlan';
import { formatINR, goalMonthLabel, monthsToYearsLabel } from '../engine/formatCurrency';
import type { ScenarioId } from '../types/finance';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SHOCK_PRESETS = [-0.1, -0.25, -0.4];

const SCENARIO_OPTIONS = [
  {
    id: 'baseline' as ScenarioId,
    label: 'Baseline',
    desc: 'Simplified smooth growth using your current assumptions.',
  },
  {
    id: 'equity-crash' as ScenarioId,
    label: 'Equity downturn',
    desc: 'A one-time market drop applied only to the equity portion at a chosen year.',
  },
  {
    id: 'contribution-pause' as ScenarioId,
    label: 'Pause contributions',
    desc: 'Stop new deposits for a set number of months, then resume.',
  },
  {
    id: 'increase-contribution' as ScenarioId,
    label: 'Increase contributions',
    desc: 'Add a monthly amount starting at a future point, subject to your affordability reminder.',
  },
];

export default function WeatherRoomPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const plan = usePlanStore((s) => s.plan);

  const [scenarioId, setScenarioId] = useState<ScenarioId>('baseline');
  const [eventYear, setEventYear] = useState(5);
  const [shockFraction, setShockFraction] = useState(-0.25);
  const [pauseMonths, setPauseMonths] = useState(6);
  const [monthlyIncrease, setMonthlyIncrease] = useState(500);
  const [showArithmetic, setShowArithmetic] = useState(false);
  const [compareToBaseline, setCompareToBaseline] = useState(true);

  const eventMonth = eventYear * 12;

  const scenarioSettings = useMemo(() => {
    switch (scenarioId) {
      case 'equity-crash':
        return { id: scenarioId, eventMonth, equityShockFraction: shockFraction };
      case 'contribution-pause':
        return { id: scenarioId, eventMonth, pauseMonths };
      case 'increase-contribution':
        return { id: scenarioId, eventMonth, monthlyIncreaseINR: monthlyIncrease };
      default:
        return { id: 'baseline' as ScenarioId, eventMonth: 0 };
    }
  }, [scenarioId, eventMonth, shockFraction, pauseMonths, monthlyIncrease]);

  const baselineResult = useMemo(
    () => simulatePlan(plan, { id: 'baseline', eventMonth: 0 }),
    [plan]
  );

  const scenarioResult = useMemo(
    () => simulatePlan(plan, scenarioSettings),
    [plan, scenarioSettings]
  );

  const activeResult = scenarioId === 'baseline' ? baselineResult : scenarioResult;
  const showComparison = scenarioId !== 'baseline' && compareToBaseline;

  // Arithmetic breakdown at event month
  const arithmeticSnap = activeResult.snapshots[Math.min(eventMonth, activeResult.snapshots.length - 1)];
  const baselineSnap = baselineResult.snapshots[Math.min(eventMonth, baselineResult.snapshots.length - 1)];
  const equityId = 'index' as const;
  const equityBeforeShock = baselineSnap?.byAssetINR[equityId] ?? 0;
  const equityAfterShock = arithmeticSnap?.byAssetINR[equityId] ?? 0;
  const equityAllocation = plan.allocation[equityId] * 100;

  const impactAtEventMonth = baselineSnap && arithmeticSnap
    ? arithmeticSnap.totalValueINR - baselineSnap.totalValueINR
    : 0;

  const goalDiff =
    activeResult.firstGoalMonth !== null && baselineResult.firstGoalMonth !== null
      ? activeResult.firstGoalMonth - baselineResult.firstGoalMonth
      : null;

  return (
    <EditorialShell>
      <div className="max-w-content mx-auto px-6">
        <div className="pt-12 pb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <ChapterEyebrow chapter="04 / THE WEATHER" />
            <EditorialHeading as="h1" className="text-chapter mt-3">
              Not every year moves upward.
            </EditorialHeading>
            <p
              className="mt-3 text-base max-w-xl leading-relaxed"
              style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}
            >
              A difficult year changes the calculation. It doesn't mean we can predict what comes next.
            </p>
          </div>
          {plan.isDemo && <DemoIndicator />}
        </div>

        <div className="grid lg:grid-cols-5 gap-10 pb-24">
          {/* Left controls */}
          <div className="lg:col-span-2 space-y-7">
            {/* Scenario selector */}
            <section className="space-y-3">
              <p className="chapter-eyebrow">SELECT A SCENARIO</p>
              <div className="space-y-2" role="radiogroup" aria-label="Scenario options">
                {SCENARIO_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setScenarioId(opt.id)}
                    type="button"
                    role="radio"
                    aria-checked={scenarioId === opt.id}
                    className="w-full text-left px-4 py-3 rounded-lg transition-colors"
                    style={{
                      border: `1px solid ${scenarioId === opt.id ? 'var(--forest)' : 'var(--rule)'}`,
                      background: scenarioId === opt.id ? 'var(--forest-wash)' : 'var(--paper)',
                      color: 'var(--ink)',
                    }}
                  >
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            <FineRule />

            {/* Event year */}
            {scenarioId !== 'baseline' && (
              <section className="space-y-3">
                <label className="chapter-eyebrow block" htmlFor="event-year">
                  {scenarioId === 'increase-contribution' ? 'STARTING YEAR' : 'YEAR OF EVENT'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="event-year"
                    type="range"
                    min={1}
                    max={Math.max(1, plan.profile.horizonYears - 1)}
                    step={1}
                    value={eventYear}
                    onChange={(e) => setEventYear(parseInt(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: 'var(--forest)' }}
                    aria-label="Year of event"
                  />
                  <span
                    className="text-lg font-semibold tabular-nums w-16 text-center"
                    style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)' }}
                  >
                    Yr {eventYear}
                  </span>
                </div>
              </section>
            )}

            {/* Scenario-specific controls */}
            {scenarioId === 'equity-crash' && (
              <section className="space-y-3">
                <p className="chapter-eyebrow">SEVERITY OF DROP</p>
                <div className="flex gap-2">
                  {SHOCK_PRESETS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setShockFraction(s)}
                      type="button"
                      className="flex-1 px-3 py-2 rounded-md text-sm transition-colors"
                      style={{
                        border: `1px solid ${shockFraction === s ? 'var(--clay)' : 'var(--rule)'}`,
                        background: shockFraction === s ? 'var(--clay-wash)' : 'var(--paper)',
                        color: shockFraction === s ? 'var(--clay)' : 'var(--muted-ink)',
                      }}
                      aria-pressed={shockFraction === s}
                    >
                      {Math.abs(s * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
                  This drop applies <strong>only to the equity (index) portion</strong> of your allocation.
                  Your equity allocation is currently {equityAllocation.toFixed(0)}%.
                </p>
                <AssumptionNote>
                  These are hypothetical examples, not predictions or historical claims.
                </AssumptionNote>
              </section>
            )}

            {scenarioId === 'contribution-pause' && (
              <section className="space-y-3">
                <label className="chapter-eyebrow block" htmlFor="pause-months">
                  MONTHS TO PAUSE
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="pause-months"
                    type="range"
                    min={1}
                    max={24}
                    step={1}
                    value={pauseMonths}
                    onChange={(e) => setPauseMonths(parseInt(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: 'var(--forest)' }}
                  />
                  <span className="tabular-nums font-semibold w-16 text-center" style={{ color: 'var(--ink)' }}>
                    {pauseMonths} mo
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
                  Invested assets continue to change in value during the pause. Past contributions are not affected.
                </p>
              </section>
            )}

            {scenarioId === 'increase-contribution' && (
              <section className="space-y-3">
                <p className="chapter-eyebrow">MONTHLY INCREASE</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-ink)' }}>₹</span>
                    <input
                      type="number"
                      min={0}
                      value={monthlyIncrease}
                      onChange={(e) => setMonthlyIncrease(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 rounded-md text-sm tabular-nums"
                      style={{
                        border: '1px solid var(--rule)',
                        background: 'var(--paper)',
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-ui)',
                      }}
                      aria-label="Monthly increase amount"
                    />
                  </div>
                </div>
                <AssumptionNote>
                  This is an illustrative increase. Ensure it fits within your actual available income before planning on it.
                </AssumptionNote>
              </section>
            )}

            {scenarioId !== 'baseline' && (
              <>
                <FineRule />

                {/* Compare toggle */}
                <section className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer text-sm" style={{ color: 'var(--ink)' }}>
                    <input
                      type="checkbox"
                      checked={compareToBaseline}
                      onChange={(e) => setCompareToBaseline(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--forest)' }}
                      aria-label="Compare to baseline"
                    />
                    Compare to baseline
                  </label>
                </section>
              </>
            )}

            {/* Three calm options during a decline */}
            {scenarioId === 'equity-crash' && (
              <section
                className="p-4 rounded-xl space-y-3"
                style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
              >
                <p className="text-xs font-semibold" style={{ color: 'var(--muted-ink)' }}>
                  IF THIS HAPPENED, YOU COULD:
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowArithmetic(!showArithmetic)}
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                    style={{ background: 'var(--canvas)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
                  >
                    → Understand the drop (see arithmetic)
                  </button>
                  <button
                    onClick={() => navigate('/workbench')}
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                    style={{ background: 'var(--canvas)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
                  >
                    → Review my monthly plan
                  </button>
                  <button
                    onClick={() => setScenarioId('contribution-pause')}
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                    style={{ background: 'var(--canvas)', border: '1px solid var(--rule)', color: 'var(--ink)' }}
                  >
                    → Explore another scenario
                  </button>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}>
                  No advice implied. These are ways to engage with the information.
                </p>
              </section>
            )}
          </div>

          {/* Right — visualization */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary comparison */}
            {scenarioId !== 'baseline' && (
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-lg px-4 py-3"
                  style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-ink)' }}>Baseline goal date</p>
                  <p className="text-base font-semibold" style={{ color: 'var(--forest)' }}>
                    {goalMonthLabel(baselineResult.firstGoalMonth, plan.profile.horizonYears)}
                  </p>
                </div>
                <div
                  className="rounded-lg px-4 py-3"
                  style={{
                    background: 'var(--paper)',
                    border: `1px solid ${activeResult.firstGoalMonth === null ? 'var(--clay)' : 'var(--rule)'}`,
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-ink)' }}>Scenario goal date</p>
                  <p
                    className="text-base font-semibold"
                    style={{
                      color: activeResult.firstGoalMonth === null
                        ? 'var(--clay)'
                        : activeResult.firstGoalMonth === baselineResult.firstGoalMonth
                        ? 'var(--forest)'
                        : 'var(--clay)',
                    }}
                  >
                    {goalMonthLabel(activeResult.firstGoalMonth, plan.profile.horizonYears)}
                  </p>
                  {goalDiff !== null && goalDiff > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--clay)' }}>
                      +{monthsToYearsLabel(goalDiff)} later
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Chart */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  {scenarioId === 'baseline' ? 'Baseline illustration' : `Scenario: ${SCENARIO_OPTIONS.find((o) => o.id === scenarioId)?.label}`}
                </p>
                {scenarioId === 'equity-crash' && (
                  <span
                    className="text-xs px-2 py-1 rounded-md"
                    style={{ background: 'var(--clay-wash)', color: 'var(--clay)' }}
                  >
                    {Math.abs(shockFraction * 100).toFixed(0)}% equity drop at Year {eventYear}
                  </span>
                )}
              </div>
              <ProjectionGraph
                baseline={showComparison ? baselineResult : activeResult}
                scenario={showComparison ? activeResult : undefined}
                goalAmountINR={plan.profile.goalAmountINR}
                horizonYears={plan.profile.horizonYears}
                height={300}
                showScenario={showComparison}
                scenarioLabel={SCENARIO_OPTIONS.find((o) => o.id === scenarioId)?.label ?? 'Scenario'}
              />
            </div>

            {/* Warnings */}
            {activeResult.warnings.length > 0 && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ background: 'var(--clay-wash)', border: '1px solid var(--clay)' }}
                role="alert"
              >
                {activeResult.warnings.map((w, i) => (
                  <p key={i} style={{ color: 'var(--clay)' }}>{w}</p>
                ))}
              </div>
            )}

            {/* Arithmetic disclosure */}
            <div>
              <button
                onClick={() => setShowArithmetic(!showArithmetic)}
                type="button"
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--gold-ink)', fontFamily: 'var(--font-ui)' }}
                aria-expanded={showArithmetic}
              >
                {showArithmetic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Show the arithmetic
              </button>

              <AnimatePresence>
                {showArithmetic && (
                  <motion.div
                    initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArithmeticPanel
                      scenarioId={scenarioId}
                      equityBeforeShock={equityBeforeShock}
                      equityAfterShock={equityAfterShock}
                      equityAllocation={equityAllocation}
                      shockFraction={shockFraction}
                      eventYear={eventYear}
                      pauseMonths={pauseMonths}
                      monthlyIncrease={monthlyIncrease}
                      impactAtEventMonth={impactAtEventMonth}
                      baselineSnap={baselineSnap}
                      scenarioSnap={arithmeticSnap}
                      contribution={plan.profile.plannedContributionINR}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <MarginalNote>
              The line moved. {activeResult.firstGoalMonth !== null ? 'Your goal didn\'t disappear.' : 'This path doesn\'t reach the goal in this horizon.'}
              {' '}Never a prediction of what actually happens next.
            </MarginalNote>

            <button
              onClick={() => navigate('/journal')}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: 'var(--forest)' }}
              type="button"
            >
              Return to my plan <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}

function ArithmeticPanel({
  scenarioId,
  equityBeforeShock,
  equityAfterShock,
  equityAllocation,
  shockFraction,
  eventYear,
  pauseMonths,
  monthlyIncrease,
  impactAtEventMonth,
  baselineSnap,
  scenarioSnap,
  contribution,
}: {
  scenarioId: ScenarioId;
  equityBeforeShock: number;
  equityAfterShock: number;
  equityAllocation: number;
  shockFraction: number;
  eventYear: number;
  pauseMonths: number;
  monthlyIncrease: number;
  impactAtEventMonth: number;
  baselineSnap: any;
  scenarioSnap: any;
  contribution: number;
}) {
  return (
    <div
      className="mt-3 p-5 rounded-xl space-y-4 text-sm"
      style={{ background: 'var(--canvas)', border: '1px solid var(--rule)' }}
    >
      <p className="font-semibold text-xs" style={{ color: 'var(--muted-ink)' }}>
        THE ARITHMETIC AT YEAR {eventYear}
      </p>

      {scenarioId === 'equity-crash' && (
        <div className="space-y-3">
          <Row
            label="Equity allocation"
            value={`${equityAllocation.toFixed(0)}% of portfolio`}
          />
          <Row
            label="Equity value before shock"
            value={formatINR(equityBeforeShock)}
          />
          <Row
            label={`After ${Math.abs(shockFraction * 100).toFixed(0)}% equity drop`}
            value={formatINR(equityAfterShock)}
            highlight="clay"
          />
          <Row
            label="Non-equity assets"
            value="Unchanged by this shock"
            note="Only the index (equity) allocation was reduced."
          />
          <FineRule />
          <Row
            label="Baseline total portfolio"
            value={formatINR(baselineSnap?.totalValueINR ?? 0)}
          />
          <Row
            label="After-shock total portfolio"
            value={formatINR(scenarioSnap?.totalValueINR ?? 0)}
            highlight="clay"
          />
          <Row
            label="Impact"
            value={`${formatINR(Math.abs(impactAtEventMonth))} ${impactAtEventMonth < 0 ? 'lower' : 'higher'}`}
            highlight={impactAtEventMonth < 0 ? 'clay' : 'forest'}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}
          >
            Context: a {Math.abs(shockFraction * 100).toFixed(0)}% drop on {equityAllocation.toFixed(0)}% equity allocation means the total portfolio fell by approximately {(Math.abs(shockFraction) * equityAllocation / 100 * 100).toFixed(1)}% — not {Math.abs(shockFraction * 100).toFixed(0)}%.
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}
          >
            This is a one-time shock. The model does not guarantee recovery or further decline — later returns follow the same illustrative assumption as baseline.
          </p>
        </div>
      )}

      {scenarioId === 'contribution-pause' && (
        <div className="space-y-3">
          <Row label="Pause starts" value={`Year ${eventYear}, Month ${eventYear * 12}`} />
          <Row label="Duration" value={`${pauseMonths} months`} />
          <Row label="Deposits skipped" value={`${pauseMonths} × ${formatINR(contribution)} = ${formatINR(pauseMonths * contribution)}`} highlight="clay" />
          <p className="text-xs" style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}>
            Past contributions and their growth are not removed. Assets continue to change in value during the pause.
          </p>
        </div>
      )}

      {scenarioId === 'increase-contribution' && (
        <div className="space-y-3">
          <Row label="Increase starts" value={`Year ${eventYear}`} />
          <Row label="Additional per month" value={formatINR(monthlyIncrease)} highlight="forest" />
          <p className="text-xs" style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}>
            Months 1–{eventYear * 12} remain unchanged. The increase applies from Month {eventYear * 12 + 1} onwards.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string;
  note?: string;
  highlight?: 'clay' | 'forest';
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span style={{ color: 'var(--muted-ink)' }}>{label}</span>
      <div className="text-right">
        <span
          className="tabular-nums font-medium"
          style={{
            color: highlight === 'clay'
              ? 'var(--clay)'
              : highlight === 'forest'
              ? 'var(--forest)'
              : 'var(--ink)',
          }}
        >
          {value}
        </span>
        {note && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>{note}</p>}
      </div>
    </div>
  );
}
