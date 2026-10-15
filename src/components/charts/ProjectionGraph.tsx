import React, { useMemo, useState, useCallback } from 'react';
import type { ProjectionResult } from '../../types/finance';
import { formatINR, formatINRWithWords, goalMonthLabel } from '../../engine/formatCurrency';

interface Props {
  baseline: ProjectionResult;
  scenario?: ProjectionResult;
  goalAmountINR: number;
  horizonYears: number;
  height?: number;
  showScenario?: boolean;
  scenarioLabel?: string;
}

const PADDING = { top: 32, right: 24, bottom: 48, left: 72 };

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

function valueToY(value: number, minV: number, maxV: number, height: number): number {
  if (maxV === minV) return height / 2;
  const t = (value - minV) / (maxV - minV);
  return height - lerp(PADDING.bottom, height - PADDING.top, t);
}

function monthToX(month: number, maxMonth: number, width: number): number {
  return PADDING.left + ((month / maxMonth) * (width - PADDING.left - PADDING.right));
}

export default function ProjectionGraph({
  baseline,
  scenario,
  goalAmountINR,
  horizonYears,
  height = 340,
  showScenario = false,
  scenarioLabel = 'Scenario',
}: Props) {
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);
  const [keyboardMonth, setKeyboardMonth] = useState<number | null>(null);

  // Responsive width via ref
  const [width, setWidth] = useState(600);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width || 600);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const totalMonths = horizonYears * 12;
  const snapshots = baseline.snapshots;

  // Sample every N months for performance
  const step = Math.max(1, Math.floor(totalMonths / 120));
  const sampledIndices = useMemo(() => {
    const indices: number[] = [];
    for (let i = 0; i <= totalMonths; i += step) {
      if (i < snapshots.length) indices.push(i);
    }
    if (snapshots.length > 0 && (snapshots.length - 1) % step !== 0) {
      indices.push(snapshots.length - 1);
    }
    return indices;
  }, [totalMonths, step, snapshots.length]);

  const scenarioSnaps = scenario?.snapshots ?? [];

  const allValues = useMemo(() => {
    const vals = sampledIndices.flatMap((i) => [
      snapshots[i]?.totalValueINR ?? 0,
      snapshots[i]?.contributedPrincipalINR ?? 0,
    ]);
    if (showScenario) {
      sampledIndices.forEach((i) => {
        vals.push(scenarioSnaps[i]?.totalValueINR ?? 0);
      });
    }
    vals.push(goalAmountINR);
    return vals;
  }, [sampledIndices, snapshots, scenarioSnaps, goalAmountINR, showScenario]);

  const minV = 0;
  const maxV = Math.max(...allValues) * 1.08;

  const buildPath = (values: Array<{ month: number; value: number }>) => {
    if (values.length === 0) return '';
    return values
      .map((pt, i) => {
        const x = monthToX(pt.month, totalMonths, width);
        const y = valueToY(pt.value, minV, maxV, height);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const baselinePoints = sampledIndices
    .map((i) => ({ month: i, value: snapshots[i]?.totalValueINR ?? 0 }));
  const principalPoints = sampledIndices
    .map((i) => ({ month: i, value: snapshots[i]?.contributedPrincipalINR ?? 0 }));
  const scenarioPoints = showScenario
    ? sampledIndices.map((i) => ({ month: i, value: scenarioSnaps[i]?.totalValueINR ?? 0 }))
    : [];

  const goalY = valueToY(goalAmountINR, minV, maxV, height);
  const goalX1 = PADDING.left;
  const goalX2 = width - PADDING.right;

  // First goal-crossing x
  const firstGoalMonth = baseline.firstGoalMonth;
  const goalCrossX = firstGoalMonth !== null
    ? monthToX(firstGoalMonth, totalMonths, width)
    : null;

  // Year tick marks
  const yearTicks = useMemo(() => {
    const ticks = [];
    const interval = horizonYears <= 10 ? 1 : horizonYears <= 20 ? 5 : 10;
    for (let y = 0; y <= horizonYears; y += interval) {
      ticks.push({ year: y, x: monthToX(y * 12, totalMonths, width) });
    }
    return ticks;
  }, [horizonYears, totalMonths, width]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const count = 5;
    return Array.from({ length: count + 1 }, (_, i) => {
      const value = (maxV * i) / count;
      return { value, y: valueToY(value, minV, maxV, height) };
    });
  }, [maxV, minV, height]);

  // Hover / keyboard probe
  const activeMonth = hoverMonth ?? keyboardMonth;
  const activeSnap = activeMonth !== null ? snapshots[Math.min(activeMonth, snapshots.length - 1)] : null;
  const activeScenSnap = activeMonth !== null && showScenario
    ? scenarioSnaps[Math.min(activeMonth, scenarioSnaps.length - 1)]
    : null;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = e.clientX - rect.left - PADDING.left;
      const chartWidth = width - PADDING.left - PADDING.right;
      const frac = Math.max(0, Math.min(1, relX / chartWidth));
      const month = Math.round(frac * totalMonths);
      setHoverMonth(Math.min(month, snapshots.length - 1));
    },
    [totalMonths, snapshots.length, width]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const cur = keyboardMonth ?? 0;
      if (e.key === 'ArrowRight') setKeyboardMonth(Math.min(cur + 6, snapshots.length - 1));
      if (e.key === 'ArrowLeft') setKeyboardMonth(Math.max(cur - 6, 0));
      if (e.key === 'Home') setKeyboardMonth(0);
      if (e.key === 'End') setKeyboardMonth(snapshots.length - 1);
    },
    [keyboardMonth, snapshots.length]
  );

  const probeX = activeMonth !== null
    ? monthToX(activeMonth, totalMonths, width)
    : null;
  const probeY = activeSnap
    ? valueToY(activeSnap.totalValueINR, minV, maxV, height)
    : null;

  return (
    <div className="w-full" ref={containerRef}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`Projection chart over ${horizonYears} years. ${
          firstGoalMonth !== null
            ? `Goal of ${formatINRWithWords(goalAmountINR)} reached in ${Math.round(firstGoalMonth / 12)} years.`
            : `Goal not reached in ${horizonYears} years.`
        }`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverMonth(null)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-describedby="chart-instructions"
        style={{ cursor: 'crosshair', outline: 'none' }}
      >
        <defs>
          <clipPath id="chart-clip">
            <rect
              x={PADDING.left}
              y={PADDING.top}
              width={width - PADDING.left - PADDING.right}
              height={height - PADDING.top - PADDING.bottom}
            />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <line
            key={i}
            x1={PADDING.left}
            y1={t.y}
            x2={width - PADDING.right}
            y2={t.y}
            stroke="var(--rule)"
            strokeWidth="1"
            opacity={0.6}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((t, i) => (
          <text
            key={i}
            x={PADDING.left - 8}
            y={t.y + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--muted-ink)"
            fontFamily="var(--font-ui)"
          >
            {formatINR(t.value, true)}
          </text>
        ))}

        {/* X-axis year ticks */}
        {yearTicks.map((t) => (
          <g key={t.year}>
            <line
              x1={t.x}
              y1={height - PADDING.bottom + 4}
              x2={t.x}
              y2={height - PADDING.bottom}
              stroke="var(--rule)"
              strokeWidth="1"
            />
            <text
              x={t.x}
              y={height - PADDING.bottom + 18}
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted-ink)"
              fontFamily="var(--font-ui)"
            >
              {t.year === 0 ? 'Now' : `Yr ${t.year}`}
            </text>
          </g>
        ))}

        {/* Goal line */}
        <line
          x1={goalX1}
          y1={goalY}
          x2={goalX2}
          y2={goalY}
          stroke="var(--forest)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity={0.7}
        />
        <text
          x={goalX2 + 4}
          y={goalY + 4}
          fontSize="10"
          fill="var(--forest)"
          fontFamily="var(--font-ui)"
          fontWeight={600}
        >
          Goal
        </text>

        {/* Principal line */}
        <path
          d={buildPath(principalPoints)}
          fill="none"
          stroke="var(--rule)"
          strokeWidth="1.5"
          clipPath="url(#chart-clip)"
        />

        {/* Scenario line */}
        {showScenario && scenarioPoints.length > 0 && (
          <path
            d={buildPath(scenarioPoints)}
            fill="none"
            stroke="var(--clay)"
            strokeWidth="2"
            clipPath="url(#chart-clip)"
          />
        )}

        {/* Baseline line */}
        <path
          d={buildPath(baselinePoints)}
          fill="none"
          stroke="var(--forest)"
          strokeWidth="2.5"
          clipPath="url(#chart-clip)"
        />

        {/* Goal cross marker */}
        {goalCrossX !== null && (
          <g>
            <circle
              cx={goalCrossX}
              cy={goalY}
              r={4}
              fill="var(--forest)"
            />
            <text
              x={goalCrossX}
              y={goalY - 10}
              textAnchor="middle"
              fontSize="10"
              fill="var(--forest)"
              fontFamily="var(--font-ui)"
              fontWeight={600}
            >
              {goalMonthLabel(firstGoalMonth, horizonYears)}
            </text>
          </g>
        )}

        {/* Hover/keyboard probe */}
        {probeX !== null && activeSnap && (
          <g>
            <line
              x1={probeX}
              y1={PADDING.top}
              x2={probeX}
              y2={height - PADDING.bottom}
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity={0.4}
            />
            <circle
              cx={probeX}
              cy={probeY!}
              r={4}
              fill="var(--forest)"
            />
          </g>
        )}
      </svg>

      {/* Accessible description */}
      <p id="chart-instructions" className="sr-only">
        Use arrow keys to navigate months. Left/Right to move 6 months. Home/End for start/end.
      </p>

      {/* Tooltip / ledger below chart */}
      {activeSnap && (
        <div
          className="mt-3 px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            fontFamily: 'var(--font-ui)',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            <span style={{ color: 'var(--muted-ink)' }}>
              <strong style={{ color: 'var(--ink)' }}>
                Year {Math.floor(activeSnap.month / 12)}, Month {activeSnap.month % 12 || 12}
              </strong>
            </span>
            <span>
              <span style={{ color: 'var(--muted-ink)' }}>Portfolio: </span>
              <strong className="tabular-nums">{formatINR(activeSnap.totalValueINR)}</strong>
            </span>
            <span>
              <span style={{ color: 'var(--muted-ink)' }}>Contributed: </span>
              <strong className="tabular-nums" style={{ color: 'var(--muted-ink)' }}>
                {formatINR(activeSnap.contributedPrincipalINR)}
              </strong>
            </span>
            <span>
              <span style={{ color: 'var(--muted-ink)' }}>Gain: </span>
              <strong
                className="tabular-nums"
                style={{
                  color:
                    activeSnap.totalValueINR >= activeSnap.contributedPrincipalINR
                      ? 'var(--forest)'
                      : 'var(--clay)',
                }}
              >
                {formatINR(activeSnap.totalValueINR - activeSnap.contributedPrincipalINR)}
              </strong>
            </span>
            {showScenario && activeScenSnap && (
              <span>
                <span style={{ color: 'var(--muted-ink)' }}>{scenarioLabel}: </span>
                <strong className="tabular-nums" style={{ color: 'var(--clay)' }}>
                  {formatINR(activeScenSnap.totalValueINR)}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs" style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-0.5" style={{ background: 'var(--forest)' }} />
          Illustrative portfolio value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-0.5" style={{ background: 'var(--rule)' }} />
          Contributed principal
        </span>
        {showScenario && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5" style={{ background: 'var(--clay)' }} />
            {scenarioLabel}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t border-dashed" style={{ borderColor: 'var(--forest)' }} />
          Goal
        </span>
      </div>

      {/* Accessible data table */}
      <details className="mt-4">
        <summary
          className="text-xs cursor-pointer"
          style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
        >
          Show values as table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs" style={{ fontFamily: 'var(--font-ui)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                <th className="text-left py-1 pr-4" style={{ color: 'var(--muted-ink)' }}>Year</th>
                <th className="text-right py-1 pr-4" style={{ color: 'var(--muted-ink)' }}>Portfolio</th>
                <th className="text-right py-1 pr-4" style={{ color: 'var(--muted-ink)' }}>Contributed</th>
                {showScenario && (
                  <th className="text-right py-1" style={{ color: 'var(--clay)' }}>{scenarioLabel}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: horizonYears + 1 }, (_, y) => {
                const m = y * 12;
                const s = snapshots[Math.min(m, snapshots.length - 1)];
                const sc = showScenario ? scenarioSnaps[Math.min(m, scenarioSnaps.length - 1)] : null;
                if (!s) return null;
                return (
                  <tr key={y} style={{ borderBottom: '1px solid var(--rule)', opacity: 0.8 }}>
                    <td className="py-1 pr-4">{y === 0 ? 'Now' : `Year ${y}`}</td>
                    <td className="text-right py-1 pr-4 tabular-nums">{formatINR(s.totalValueINR)}</td>
                    <td className="text-right py-1 pr-4 tabular-nums" style={{ color: 'var(--muted-ink)' }}>
                      {formatINR(s.contributedPrincipalINR)}
                    </td>
                    {showScenario && sc && (
                      <td className="text-right py-1 tabular-nums" style={{ color: 'var(--clay)' }}>
                        {formatINR(sc.totalValueINR)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
