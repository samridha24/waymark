import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import EditorialShell from '../components/shell/EditorialShell';
import {
  ChapterEyebrow,
  EditorialHeading,
  LeadText,
  FineRule,
  AssumptionNote,
  MarginalNote,
  DemoIndicator,
} from '../components/editorial/EditorialComponents';
import GlossaryPopover from '../components/ui/GlossaryPopover';
import { investments, sipNote } from '../content/investments';
import type { InvestmentEntry } from '../types/content';
import { formatINR } from '../engine/formatCurrency';
import { usePlanStore } from '../store/usePlanStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ASSET_ICONS: Record<string, React.ReactNode> = {
  cash: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="28" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="18" cy="19" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="4" y1="15" x2="32" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="4" y1="23" x2="32" y2="23" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    </svg>
  ),
  fd: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="24" height="26" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="10" y1="13" x2="26" y2="13" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="10" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="10" y1="23" x2="19" y2="23" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="27" cy="27" r="4" fill="currentColor" opacity="0.15"/>
      <text x="27" y="30" textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold">%</text>
    </svg>
  ),
  index: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <polyline points="4,28 10,18 16,22 22,10 28,14 32,6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <circle cx="10" cy="18" r="2" fill="currentColor"/>
      <circle cx="22" cy="10" r="2" fill="currentColor"/>
      <circle cx="32" cy="6" r="2" fill="currentColor"/>
    </svg>
  ),
  debt: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="6" y="8" width="24" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="10" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="1"/>
      <line x1="10" y1="19" x2="26" y2="19" stroke="currentColor" strokeWidth="1"/>
      <line x1="10" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="1"/>
      <path d="M6 8 h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  gold: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="6" y="14" width="24" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="6" y1="19" x2="30" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <path d="M10 14 L8 8 h20 l-2 6" stroke="currentColor" strokeWidth="1" fill="none"/>
    </svg>
  ),
};

function AssetIllustration({ entry }: { entry: InvestmentEntry }) {
  const { sampleAnnualReturn, sampleFee, horizon, seedAmount, type } = entry.illustration;
  const months = horizon * 12;
  const netMonthly = Math.pow(1 + sampleAnnualReturn - sampleFee, 1 / 12) - 1;

  const points: { x: number; y: number }[] = [];
  let balance = seedAmount;
  for (let m = 0; m <= months; m++) {
    points.push({ x: m, y: balance });
    // Add some volatility for visual illustration only
    if (type === 'volatile') {
      const noise = (Math.sin(m * 0.8) * 0.015 + Math.cos(m * 1.3) * 0.01);
      balance = Math.max(0, balance * (1 + netMonthly + noise));
    } else if (type === 'lumpy') {
      const noise = (Math.sin(m * 0.4) * 0.02);
      balance = Math.max(0, balance * (1 + netMonthly + noise));
    } else {
      balance = balance * (1 + netMonthly);
    }
  }

  const maxY = Math.max(...points.map((p) => p.y));
  const minY = Math.min(...points.map((p) => p.y));
  const w = 200;
  const h = 80;
  const pad = 8;

  const toX = (m: number) => pad + (m / months) * (w - pad * 2);
  const toY = (v: number) => h - pad - ((v - minY) / (maxY - minY + 1)) * (h - pad * 2);

  const d = points
    .filter((_, i) => i % Math.max(1, Math.floor(months / 60)) === 0 || i === points.length - 1)
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(pt.x).toFixed(1)} ${toY(pt.y).toFixed(1)}`)
    .join(' ');

  const finalAmount = points[points.length - 1]?.y ?? seedAmount;

  return (
    <div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label={`Hypothetical growth of ₹${seedAmount} over ${horizon} years`}>
        <path d={d} stroke="var(--forest)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <text x={pad} y={h - 1} fontSize="8" fill="var(--muted-ink)" fontFamily="var(--font-ui)">Now</text>
        <text x={w - pad} y={h - 1} fontSize="8" fill="var(--muted-ink)" fontFamily="var(--font-ui)" textAnchor="end">
          Yr {horizon}
        </text>
      </svg>
      <p className="text-xs mt-1" style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}>
        ₹{seedAmount.toLocaleString('en-IN')} → {formatINR(finalAmount)} (hypothetical, {((sampleAnnualReturn - sampleFee) * 100).toFixed(1)}% net/yr)
      </p>
    </div>
  );
}

function TraitBar({ label, value, max = 4 }: { label: string; value: number; max?: number }) {
  return (
    <div className="space-y-1">
      <span className="text-xs" style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}>{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-sm"
            style={{
              background: i < value ? 'var(--forest)' : 'var(--rule)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function volatilityScore(v: string): number {
  return { none: 0, low: 1, moderate: 2, high: 3, variable: 2 }[v] ?? 1;
}
function accessScore(v: string): number {
  return { immediate: 4, days: 3, weeks: 2, months: 1, locked: 0 }[v] ?? 2;
}
function costScore(v: string): number {
  return { free: 0, 'very-low': 1, low: 2, moderate: 3 }[v] ?? 1;
}
function lockScore(v: string): number {
  return { none: 4, flexible: 3, short: 2, medium: 1, long: 0 }[v] ?? 2;
}

export default function FieldGuidePage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const isDemo = usePlanStore((s) => s.plan.isDemo);
  const [selectedId, setSelectedId] = useState<string>('index');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showSip, setShowSip] = useState(false);

  const selected = investments.find((i) => i.id === selectedId)!;

  function toggleCompare(id: string) {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((c) => c !== id));
    } else if (compareIds.length < 2) {
      setCompareIds([...compareIds, id]);
    } else {
      // Replace second
      setCompareIds([compareIds[0], id]);
    }
  }

  const compareEntries = compareIds.map((id) => investments.find((i) => i.id === id)!).filter(Boolean);

  return (
    <EditorialShell>
      <div className="max-w-content mx-auto px-6">
        <div className="pt-12 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <ChapterEyebrow chapter="02 / THE CHOICES" />
            <EditorialHeading as="h1" className="text-chapter mt-3">
              Every choice has a character.
            </EditorialHeading>
            <LeadText className="mt-3 max-w-xl">
              Here are the main financial instruments available to a first-time saver in India.
              None are perfect. Each involves trade-offs worth understanding before deciding.
            </LeadText>
          </div>
          {isDemo && <DemoIndicator />}
        </div>

        {/* SIP note */}
        <div
          className="mb-8 px-4 py-3 rounded-lg flex flex-wrap items-start gap-3"
          style={{ background: 'var(--forest-wash)', border: '1px solid var(--forest)' }}
        >
          <div className="flex-1 min-w-0">
            <button
              className="text-sm font-semibold text-left"
              style={{ color: 'var(--forest)' }}
              onClick={() => setShowSip(!showSip)}
              aria-expanded={showSip}
              type="button"
            >
              What is a SIP? {showSip ? '↑' : '↓'}
            </button>
            {showSip && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
                {sipNote.content}
              </p>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-12 gap-8 pb-24">
          {/* Index sidebar */}
          <nav className="lg:col-span-3 space-y-1" aria-label="Investment options">
            {investments.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                type="button"
                className="w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors"
                style={{
                  background: selectedId === inv.id ? 'var(--forest-wash)' : 'transparent',
                  border: `1px solid ${selectedId === inv.id ? 'var(--forest)' : 'transparent'}`,
                  color: selectedId === inv.id ? 'var(--forest)' : 'var(--ink)',
                }}
                aria-selected={selectedId === inv.id}
                aria-current={selectedId === inv.id ? 'true' : undefined}
              >
                <span style={{ color: selectedId === inv.id ? 'var(--forest)' : 'var(--muted-ink)', flexShrink: 0 }}>
                  {ASSET_ICONS[inv.id]}
                </span>
                <div>
                  <p className="text-sm font-medium leading-tight">{inv.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>{inv.tagline}</p>
                </div>
              </button>
            ))}

            <FineRule className="my-3" />

            {/* Compare selector */}
            <div className="space-y-1">
              <p className="text-xs px-3" style={{ color: 'var(--muted-ink)' }}>
                Select up to 2 to compare:
              </p>
              {investments.map((inv) => (
                <button
                  key={`cmp-${inv.id}`}
                  onClick={() => toggleCompare(inv.id)}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-xs transition-colors"
                  style={{
                    background: compareIds.includes(inv.id) ? 'var(--clay-wash)' : 'transparent',
                    color: compareIds.includes(inv.id) ? 'var(--clay)' : 'var(--muted-ink)',
                    border: `1px solid ${compareIds.includes(inv.id) ? 'var(--clay)' : 'transparent'}`,
                  }}
                  aria-pressed={compareIds.includes(inv.id)}
                >
                  <span
                    className="w-4 h-4 flex items-center justify-center rounded border text-xs flex-shrink-0"
                    style={{
                      borderColor: compareIds.includes(inv.id) ? 'var(--clay)' : 'var(--rule)',
                      background: compareIds.includes(inv.id) ? 'var(--clay)' : 'transparent',
                      color: 'var(--paper)',
                    }}
                    aria-hidden="true"
                  >
                    {compareIds.includes(inv.id) ? '✓' : ''}
                  </span>
                  {inv.title}
                </button>
              ))}
              {compareIds.length === 2 && (
                <button
                  onClick={() => setShowCompare(true)}
                  type="button"
                  className="w-full mt-2 px-3 py-2 rounded-md text-xs font-medium"
                  style={{ background: 'var(--forest)', color: 'var(--paper)' }}
                >
                  Compare these two →
                </button>
              )}
            </div>
          </nav>

          {/* Detail panel */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedId}
                initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <InstrumentFieldNote entry={selected} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Continue */}
        <div
          className="sticky bottom-0 py-4 flex justify-end gap-3"
          style={{ background: 'var(--canvas)', borderTop: '1px solid var(--rule)' }}
        >
          <button
            onClick={() => navigate('/workbench')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium"
            style={{ background: 'var(--forest)', color: 'var(--paper)', fontFamily: 'var(--font-ui)' }}
            type="button"
          >
            Make a draft <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Compare modal */}
      {showCompare && compareEntries.length === 2 && (
        <CompareModal
          entries={compareEntries}
          onClose={() => setShowCompare(false)}
        />
      )}
    </EditorialShell>
  );
}

function InstrumentFieldNote({ entry }: { entry: InvestmentEntry }) {
  const [showFormula, setShowFormula] = useState(false);

  return (
    <div
      className="rounded-xl p-6 md:p-8 space-y-6"
      style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="flex items-start gap-4">
          <div style={{ color: 'var(--forest)' }}>{ASSET_ICONS[entry.id]}</div>
          <div>
            <h2
              className="text-2xl font-medium"
              style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)' }}
            >
              {entry.title}
            </h2>
            <p className="text-base mt-1" style={{ color: 'var(--muted-ink)', fontStyle: 'italic', fontFamily: 'var(--font-editorial)' }}>
              {entry.tagline}
            </p>
          </div>
        </div>
        <AssetIllustration entry={entry} />
      </div>

      <FineRule />

      {/* How it works */}
      <div>
        <p className="chapter-eyebrow mb-2">HOW IT WORKS</p>
        <p className="text-base leading-relaxed" style={{ color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}>
          {entry.howItWorks}
        </p>
      </div>

      {/* Two columns: right/wrong */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div
          className="p-4 rounded-lg"
          style={{ background: 'var(--forest-wash)', border: '1px solid var(--forest)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--forest)' }}>
            WHAT CAN GO RIGHT
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            {entry.whatCanGoRight}
          </p>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ background: 'var(--clay-wash)', border: '1px solid var(--clay)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--clay)' }}>
            WHAT CAN GO WRONG
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
            {entry.whatCanGoWrong}
          </p>
        </div>
      </div>

      {/* Trait bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TraitBar label="Accessibility" value={accessScore(entry.traits.accessSpeed)} max={4} />
        <TraitBar label="Fluctuation" value={volatilityScore(entry.traits.volatility)} max={3} />
        <TraitBar label="Flexibility" value={lockScore(entry.traits.lockInTerms)} max={4} />
        <TraitBar label="Cost" value={costScore(entry.traits.potentialCost)} max={3} />
      </div>

      {/* Detail rows */}
      <div className="space-y-4 text-sm">
        {[
          { label: 'Liquidity / access', content: entry.liquidity },
          { label: 'Lock-in', content: entry.lockIn },
          { label: 'Costs & fees', content: entry.costsAndFees },
          { label: 'Tax considerations', content: entry.taxConsiderations },
          { label: 'Uncertainty', content: entry.uncertainty },
        ].map(({ label, content }) => (
          <div key={label} className="flex gap-4">
            <span
              className="flex-shrink-0 w-36 text-xs pt-0.5"
              style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
            >
              {label}
            </span>
            <p style={{ color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}>{content}</p>
          </div>
        ))}
      </div>

      <FineRule />

      <MarginalNote>{entry.relationToPlan}</MarginalNote>

      {/* Model assumption */}
      <button
        onClick={() => setShowFormula(!showFormula)}
        type="button"
        className="text-xs underline"
        style={{ color: 'var(--gold-ink)', textDecorationStyle: 'dotted' }}
        aria-expanded={showFormula}
      >
        {showFormula ? '↑ Hide' : '↓ How we modeled this'}
      </button>
      {showFormula && (
        <div
          className="p-4 rounded-lg text-sm space-y-2"
          style={{ background: 'var(--canvas)', border: '1px solid var(--rule)' }}
        >
          <p className="font-semibold text-xs" style={{ color: 'var(--gold-ink)' }}>
            MODEL ASSUMPTIONS (ILLUSTRATIVE ONLY)
          </p>
          <p style={{ color: 'var(--muted-ink)' }}>{entry.simulatorSimplification}</p>
          <AssumptionNote>
            These are invented educational inputs, not current market rates, historical forecasts, or recommendations.
          </AssumptionNote>
        </div>
      )}

      {/* Glossary links */}
      <div className="flex flex-wrap gap-2 pt-2">
        {['liquidity', 'compounding', 'volatility', 'expense ratio', 'inflation'].map((term) => (
          <GlossaryPopover key={term} term={term}>
            <span
              className="text-xs px-2 py-1 rounded-md"
              style={{ background: 'var(--canvas)', border: '1px solid var(--rule)', color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
            >
              {term}
            </span>
          </GlossaryPopover>
        ))}
      </div>
    </div>
  );
}

function CompareModal({
  entries,
  onClose,
}: {
  entries: InvestmentEntry[];
  onClose: () => void;
}) {
  const [a, b] = entries;

  const axes = [
    { label: 'Accessibility', scoreA: accessScore(a.traits.accessSpeed), scoreB: accessScore(b.traits.accessSpeed), max: 4 },
    { label: 'Price volatility', scoreA: 3 - volatilityScore(a.traits.volatility), scoreB: 3 - volatilityScore(b.traits.volatility), max: 3 },
    { label: 'Flexibility', scoreA: lockScore(a.traits.lockInTerms), scoreB: lockScore(b.traits.lockInTerms), max: 4 },
    { label: 'Low cost', scoreA: 3 - costScore(a.traits.potentialCost), scoreB: 3 - costScore(b.traits.potentialCost), max: 3 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(29,39,36,0.5)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Compare instruments"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden"
        style={{ background: 'var(--paper)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)' }}>
            Side-by-side comparison
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded"
            style={{ color: 'var(--muted-ink)' }}
            aria-label="Close comparison"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Headers */}
          <div className="grid grid-cols-3 gap-4">
            <div />
            {entries.map((e) => (
              <div key={e.id} className="text-center">
                <div className="flex justify-center mb-2" style={{ color: 'var(--forest)' }}>
                  {ASSET_ICONS[e.id]}
                </div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{e.title}</h3>
              </div>
            ))}
          </div>

          <FineRule />

          {/* Trait comparison */}
          {axes.map((ax) => (
            <div key={ax.label} className="grid grid-cols-3 gap-4 items-center">
              <span className="text-xs" style={{ color: 'var(--muted-ink)' }}>{ax.label}</span>
              {[ax.scoreA, ax.scoreB].map((score, i) => (
                <div key={i} className="flex gap-1">
                  {Array.from({ length: ax.max }, (_, j) => (
                    <div
                      key={j}
                      className="h-2 flex-1 rounded-sm"
                      style={{ background: j < score ? 'var(--forest)' : 'var(--rule)' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}

          <FineRule />

          {/* Text rows */}
          {[
            { label: 'Liquidity', a: a.liquidity, b: b.liquidity },
            { label: 'Lock-in', a: a.lockIn, b: b.lockIn },
            { label: 'Costs', a: a.costsAndFees, b: b.costsAndFees },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-3 gap-4">
              <span className="text-xs pt-1" style={{ color: 'var(--muted-ink)' }}>{row.label}</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>{row.a}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>{row.b}</p>
            </div>
          ))}

          <AssumptionNote>
            Potential return is described as uncertain. If percentages are shown in the individual field notes, they are sample model assumptions, not real rate quotes.
          </AssumptionNote>
        </div>
      </div>
    </div>
  );
}
