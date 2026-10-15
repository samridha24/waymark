import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EditorialShell from '../components/shell/EditorialShell';
import { ChapterEyebrow, LeadText, FineRule, DisclaimerLine } from '../components/editorial/EditorialComponents';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ANNOTATIONS = [
  {
    id: 'start',
    label: 'A starting point',
    desc: 'Where you are now — income, expenses, what you can genuinely set aside each month.',
    cx: '14%',
    cy: '72%',
  },
  {
    id: 'middle',
    label: 'An uncertain stretch',
    desc: 'Markets move. Life changes. A good plan accounts for both, not just the optimistic line.',
    cx: '50%',
    cy: '35%',
  },
  {
    id: 'end',
    label: 'A destination',
    desc: 'Your goal — whether ₹10 lakh or more — as a clear, honest milestone, not a guaranteed promise.',
    cx: '85%',
    cy: '55%',
  },
];

export default function ProloguePage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  function handleStartFresh() {
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
                  className="px-7 py-3.5 rounded-md text-base font-medium transition-opacity hover:opacity-90 focus:opacity-90"
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
                hoveredAnnotation={hoveredAnnotation}
                onHover={setHoveredAnnotation}
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
interface AnnotationPt {
  id: string;
  label: string;
  desc: string;
  cx: string;
  cy: string;
}

function PathIllustration({
  annotations,
  hoveredAnnotation,
  onHover,
}: {
  annotations: AnnotationPt[];
  hoveredAnnotation: string | null;
  onHover: (id: string | null) => void;
}) {
  const hovered = hoveredAnnotation ? annotations.find((a) => a.id === hoveredAnnotation) : null;

  return (
    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Faint grid */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h${i}`}
            x1="20"
            y1={50 + i * 50}
            x2="380"
            y2={50 + i * 50}
            stroke="var(--rule)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}

        {/* The path — a gently imperfect curve */}
        <path
          d="M 40 240 C 80 230, 100 200, 130 180 S 180 140, 200 120 S 240 80, 260 90 S 310 110, 340 80 S 360 60, 370 55"
          stroke="var(--forest)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* Annotation dots */}
        {annotations.map((a) => {
          const isActive = hoveredAnnotation === a.id;
          // Map % to viewBox coords
          const x = (parseFloat(a.cx) / 100) * 400;
          const y = (parseFloat(a.cy) / 100) * 300;
          return (
            <g key={a.id}>
              <circle
                cx={x}
                cy={y}
                r={isActive ? 7 : 5}
                fill={isActive ? 'var(--forest)' : 'var(--paper)'}
                stroke="var(--forest)"
                strokeWidth="1.5"
                style={{ cursor: 'pointer', transition: 'r 150ms' }}
                onMouseEnter={() => onHover(a.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(a.id)}
                onBlur={() => onHover(null)}
                tabIndex={0}
                role="button"
                aria-label={a.label}
              />
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fontSize="9"
                fill="var(--muted-ink)"
                fontFamily="var(--font-ui)"
                style={{ pointerEvents: 'none' }}
              >
                {a.label}
              </text>
            </g>
          );
        })}

        {/* Waymark motif — destination */}
        <g transform="translate(365, 48)">
          <circle cx="0" cy="0" r="5" fill="var(--forest)" opacity="0.9" />
          <circle cx="0" cy="0" r="9" stroke="var(--forest)" strokeWidth="1" fill="none" opacity="0.5" />
          <line x1="0" y1="-14" x2="0" y2="-9" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* Hover description */}
      {hovered && (
        <div
          className="absolute bottom-0 left-0 right-0 p-4 rounded-b-lg text-sm leading-relaxed"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            color: 'var(--muted-ink)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <strong style={{ color: 'var(--ink)' }}>{hovered.label}.</strong> {hovered.desc}
        </div>
      )}
    </div>
  );
}
