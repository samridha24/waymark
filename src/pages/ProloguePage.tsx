import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EditorialShell from '../components/shell/EditorialShell';
import { ChapterEyebrow, LeadText, FineRule, DisclaimerLine } from '../components/editorial/EditorialComponents';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { usePlanStore } from '../store/usePlanStore';

export interface AnnotationPt {
  id: string;
  stepNum: string;
  label: string;
  subtitle: string;
  desc: string;
  x: number;
  y: number;
}

const ANNOTATIONS: AnnotationPt[] = [
  {
    id: 'start',
    stepNum: '01',
    label: 'A starting point',
    subtitle: 'Where you begin · Current capacity',
    desc: 'Where you are now — income, expenses, and what you can genuinely set aside each month without strain.',
    x: 60,
    y: 210,
  },
  {
    id: 'middle',
    stepNum: '02',
    label: 'An uncertain stretch',
    subtitle: 'Market shifts & life changes',
    desc: 'Markets move and life changes. A resilient plan accounts for fluctuations rather than assuming a straight line.',
    x: 230,
    y: 150,
  },
  {
    id: 'end',
    stepNum: '03',
    label: 'A destination',
    subtitle: 'Your long-term destination',
    desc: 'Your personal milestone reached through disciplined compounding and patience, not unrealistic promises.',
    x: 390,
    y: 45,
  },
];

export default function ProloguePage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const setOnboardingStep = usePlanStore((s) => s.setOnboardingStep);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string>('start');

  function handleStartFresh() {
    setOnboardingStep(0);
    navigate('/begin');
  }

  const fadeUp = {
    initial: reducedMotion ? {} : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <EditorialShell>
      <div className="max-w-content mx-auto px-6">
        {/* Hero */}
        <div className="pt-16 md:pt-24 pb-20 md:pb-32">
          <div className="grid md:grid-cols-9 gap-12 md:gap-8 items-start">

            {/* Left editorial column */}
            <div className="md:col-span-5 space-y-7">
              <motion.div
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <ChapterEyebrow chapter="THE HONEST MILLION · WAYMARK" />
              </motion.div>

              <motion.div
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ duration: 0.5, delay: 0.12 }}
              >
                <h1
                    className="text-hero leading-none"
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      color: 'var(--ink)',
                      lineHeight: 1.12,
                    }}
                  >
                  A million isn't<br />
                  <span style={{ fontStyle: 'normal', fontWeight: 500 }}>a plan.</span>
                  <span style={{ color: 'var(--forest)' }}> Yet.</span>
                </h1>
              </motion.div>

              <motion.div
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <LeadText className="max-w-lg">
                  Understand your options, draft your route, and learn what changes when life does.
                </LeadText>
              </motion.div>

              <motion.div
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ duration: 0.5, delay: 0.28 }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <button
                  onClick={handleStartFresh}
                  className="px-7 py-3.5 rounded-md text-base font-medium transition-opacity hover:opacity-90 focus:opacity-90 cursor-pointer"
                  style={{
                    background: 'var(--forest)',
                    color: 'var(--paper)',
                    fontFamily: 'var(--font-ui)',
                    minWidth: 180,
                  }}
                >
                  Start my path
                </button>
              </motion.div>

              <motion.div
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ duration: 0.5, delay: 0.34 }}
              >
                <DisclaimerLine>
                  Illustrative planning experience. No investments are bought or sold.
                  All projections are hypothetical.
                </DisclaimerLine>
              </motion.div>
            </div>

            {/* Right — path illustration */}
            <motion.div
              className="md:col-span-4"
              initial={reducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <PathIllustration
                annotations={ANNOTATIONS}
                activeId={activeAnnotationId}
                onSelect={setActiveAnnotationId}
              />
            </motion.div>
          </div>
        </div>

        <FineRule />

        {/* Three-step editorial sequence */}
        <div className="py-20">
          <p className="chapter-eyebrow mb-10">HOW WAYMARK WORKS</p>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: '01',
                title: 'Understand',
                body: 'Start with what you actually have — not an aspirational number. Know your real monthly capacity before choosing any instrument.',
              },
              {
                num: '02',
                title: 'Choose',
                body: 'Compare savings accounts, FDs, index funds, debt, and gold — their actual trade-offs, access restrictions, fees, and meaningful risks.',
              },
              {
                num: '03',
                title: 'Revisit',
                body: 'Save your draft. Return when income changes, markets move, or plans evolve. A plan is only useful if it can be honestly updated.',
              },
            ].map((step) => (
              <div key={step.num} className="space-y-3">
                <span
                  className="chapter-eyebrow"
                  style={{ color: 'var(--forest)', fontSize: 13 }}
                >
                  {step.num}
                </span>
                <h3
                  className="text-xl font-medium"
                  style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}

// SVG Path Illustration
function PathIllustration({
  annotations,
  activeId,
  onSelect,
}: {
  annotations: AnnotationPt[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const activeAnnotation = annotations.find((a) => a.id === activeId) ?? annotations[1];

  return (
    <div
      className="p-5 sm:p-6 rounded-xl space-y-4"
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        boxShadow: '0 4px 20px -2px rgba(29, 39, 36, 0.05)',
      }}
    >
      {/* Editorial Header */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--rule)' }}>
        <div>
          <span className="chapter-eyebrow text-xs tracking-wider" style={{ color: 'var(--forest)' }}>
            FIG. 1.0 · TRAJECTORY MODEL
          </span>
          <p className="text-xs text-[var(--muted-ink)] mt-0.5">Illustrative trajectory over time</p>
        </div>
        <span
          className="text-[11px] px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'var(--forest-wash)', color: 'var(--forest)' }}
        >
          Interactive
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full select-none" style={{ aspectRatio: '460/260' }}>
        <svg
          viewBox="0 0 460 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Illustration showing financial trajectory from start to destination milestone"
        >
          <defs>
            {/* Area gradient under trajectory curve */}
            <linearGradient id="trajectoryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--forest)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--forest)" stopOpacity="0.01" />
            </linearGradient>

            {/* Uncertainty band gradient */}
            <linearGradient id="uncertaintyGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.04" />
              <stop offset="60%" stopColor="var(--clay)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--forest)" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Faint Grid lines (without cost or rupee values) */}
          {[45, 100, 155, 210].map((gridY, idx) => (
            <line
              key={gridY}
              x1="60"
              y1={gridY}
              x2="420"
              y2={gridY}
              stroke="var(--rule)"
              strokeWidth={idx === 0 ? '1' : '0.75'}
              strokeDasharray={idx === 0 ? '4 3' : undefined}
              opacity={0.5}
            />
          ))}

          {/* X Axis time progression labels */}
          <g>
            <text x="60" y="228" textAnchor="middle" fontSize="10" fill="var(--muted-ink)" fontFamily="var(--font-ui)">
              Start
            </text>
            <text x="230" y="228" textAnchor="middle" fontSize="10" fill="var(--muted-ink)" fontFamily="var(--font-ui)">
              Midway
            </text>
            <text x="390" y="228" textAnchor="middle" fontSize="10" fill="var(--forest)" fontWeight="600" fontFamily="var(--font-ui)">
              Destination
            </text>
          </g>

          {/* Linear Baseline (regular contributions without compounding) */}
          <path
            d="M 60 210 L 390 145"
            stroke="var(--rule)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.8"
          />
          <text
            x="395"
            y="148"
            fontSize="8.5"
            fill="var(--muted-ink)"
            fontFamily="var(--font-ui)"
            opacity="0.8"
          >
            Linear progress
          </text>

          {/* Uncertainty Range Band (Market Fluctuations) */}
          <path
            d="M 60 210 C 120 200, 170 145, 220 115 C 270 85, 330 55, 390 32 L 390 70 C 330 100, 270 140, 220 165 C 170 185, 120 215, 60 210 Z"
            fill="url(#uncertaintyGrad)"
          />

          {/* Uncertainty upper/lower boundary traces */}
          <path
            d="M 60 210 C 120 200, 170 145, 220 115 C 270 85, 330 55, 390 32"
            stroke="var(--forest)"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.35"
            fill="none"
          />
          <path
            d="M 60 210 C 120 215, 170 185, 220 165 C 270 140, 330 100, 390 70"
            stroke="var(--clay)"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.35"
            fill="none"
          />

          {/* Area fill under trajectory */}
          <path
            d="M 60 210 C 110 208, 150 185, 190 162 C 220 145, 240 152, 270 128 C 310 95, 350 68, 390 45 L 390 210 L 60 210 Z"
            fill="url(#trajectoryGrad)"
          />

          {/* Main Trajectory Curve */}
          <path
            d="M 60 210 C 110 208, 150 185, 190 162 C 220 145, 240 152, 270 128 C 310 95, 350 68, 390 45"
            stroke="var(--forest)"
            strokeWidth="2.75"
            strokeLinecap="round"
            fill="none"
          />

          {/* Active Probe Vertical Line */}
          {activeAnnotation && (
            <line
              x1={activeAnnotation.x}
              y1={35}
              x2={activeAnnotation.x}
              y2={210}
              stroke="var(--forest)"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          )}

          {/* Waymark Destination Pin / Flag at Goal */}
          <g transform="translate(390, 45)">
            <circle cx="0" cy="0" r="14" fill="var(--forest)" opacity="0.12" />
            <circle cx="0" cy="0" r="8" fill="var(--paper)" stroke="var(--forest)" strokeWidth="2" />
            <circle cx="0" cy="0" r="3.5" fill="var(--forest)" />
          </g>

          {/* Annotation points */}
          {annotations.map((a) => {
            const isActive = activeId === a.id;
            const textX = a.id === 'start' ? a.x + 8 : a.id === 'end' ? a.x - 12 : a.x;
            const textAnchor = a.id === 'start' ? 'start' : a.id === 'end' ? 'end' : 'middle';
            const textY = a.y - (a.id === 'end' ? 16 : 12);

            return (
              <g
                key={a.id}
                className="cursor-pointer"
                onClick={() => onSelect(a.id)}
                onMouseEnter={() => onSelect(a.id)}
                role="button"
                tabIndex={0}
                aria-label={`Step ${a.stepNum}: ${a.label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(a.id);
                  }
                }}
              >
                {/* Active halo */}
                {isActive && (
                  <circle
                    cx={a.x}
                    cy={a.y}
                    r={12}
                    fill="var(--forest)"
                    opacity="0.18"
                  />
                )}

                {/* Dot */}
                <circle
                  cx={a.x}
                  cy={a.y}
                  r={isActive ? 6 : 4.5}
                  fill={isActive ? 'var(--forest)' : 'var(--paper)'}
                  stroke="var(--forest)"
                  strokeWidth={isActive ? '2.5' : '1.8'}
                  style={{ transition: 'all 200ms ease' }}
                />

                {/* Step badge & label text */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor={textAnchor}
                  fontSize="10"
                  fontWeight={isActive ? '600' : '500'}
                  fill={isActive ? 'var(--ink)' : 'var(--muted-ink)'}
                  fontFamily="var(--font-ui)"
                  style={{ pointerEvents: 'none' }}
                >
                  {`${a.stepNum} · ${a.label}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Milestone Selector Chips */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t" style={{ borderColor: 'var(--rule)' }}>
        {annotations.map((a) => {
          const isActive = activeId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              className="px-2 py-1.5 rounded text-left transition-all cursor-pointer text-xs"
              style={{
                background: isActive ? 'var(--forest-wash)' : 'var(--canvas)',
                border: `1px solid ${isActive ? 'var(--forest)' : 'transparent'}`,
                color: isActive ? 'var(--forest)' : 'var(--muted-ink)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              <div className="font-semibold text-[11px]" style={{ color: isActive ? 'var(--forest)' : 'var(--muted-ink)' }}>
                Step {a.stepNum}
              </div>
              <div className="font-medium truncate">{a.label}</div>
            </button>
          );
        })}
      </div>

      {/* Active Milestone Card / Explanation */}
      <div
        className="p-3.5 rounded-lg text-sm transition-all"
        style={{
          background: 'var(--canvas)',
          border: '1px solid var(--rule)',
          color: 'var(--muted-ink)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--forest-wash)', color: 'var(--forest)' }}>
              Step {activeAnnotation.stepNum}
            </span>
            <strong style={{ color: 'var(--ink)' }}>{activeAnnotation.label}</strong>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--muted-ink)' }}>
            {activeAnnotation.subtitle}
          </span>
        </div>
        <p className="text-xs leading-relaxed">{activeAnnotation.desc}</p>
      </div>
    </div>
  );
}
