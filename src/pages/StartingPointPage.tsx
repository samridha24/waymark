import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EditorialShell from '../components/shell/EditorialShell';
import {
  ChapterEyebrow,
  EditorialHeading,
  AssumptionNote,
  FineRule,
  DemoIndicator,
} from '../components/editorial/EditorialComponents';
import { usePlanStore } from '../store/usePlanStore';
import { useShallow } from 'zustand/shallow';
import { availableSurplus } from '../engine/validatePlan';
import { formatINR } from '../engine/formatCurrency';
import { useReducedMotion } from '../hooks/useReducedMotion';

const GOAL_PRESETS = [
  { label: '₹5 lakh', value: 500_000 },
  { label: '₹10 lakh', value: 1_000_000 },
  { label: '₹25 lakh', value: 2_500_000 },
  { label: '₹1 crore', value: 10_000_000 },
];

const TOTAL_STEPS = 5;

export default function StartingPointPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { plan, updateProfile, setOnboardingStep, completeOnboarding, onboardingStep } = usePlanStore(
    useShallow((s) => ({
      plan: s.plan,
      updateProfile: s.updateProfile,
      setOnboardingStep: s.setOnboardingStep,
      completeOnboarding: s.completeOnboarding,
      onboardingStep: s.onboardingStep,
    }))
  );

  const [step, setStep] = useState(onboardingStep || 0);
  const profile = plan.profile;

  function next() {
    const nextStep = step + 1;
    if (nextStep >= TOTAL_STEPS) {
      completeOnboarding();
      setOnboardingStep(TOTAL_STEPS);
      navigate('/field-guide');
    } else {
      setStep(nextStep);
      setOnboardingStep(nextStep);
    }
  }

  function back() {
    if (step === 0) {
      navigate('/');
    } else {
      setStep(step - 1);
      setOnboardingStep(step - 1);
    }
  }

  const surplus = availableSurplus(profile);

  const slideVariants = {
    initial: reducedMotion ? {} : { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: reducedMotion ? {} : { opacity: 0, x: -20 },
  };

  return (
    <EditorialShell>
      <div className="max-w-content mx-auto px-6">
        {/* Header */}
        <div className="pt-12 pb-4 flex items-start justify-between gap-4">
          <div>
            <ChapterEyebrow chapter="01 / THE STARTING POINT" />
            <p className="text-sm mt-1" style={{ color: 'var(--muted-ink)' }}>
              Step {step + 1} of {TOTAL_STEPS}
            </p>
          </div>
          {plan.isDemo && <DemoIndicator />}
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-0.5 mb-12 rounded-full overflow-hidden"
          style={{ background: 'var(--rule)' }}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'var(--forest)',
              width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              transition: reducedMotion ? 'none' : 'width 300ms ease',
            }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-16 pb-24">
          {/* Left — question */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {step === 0 && (
                  <StepDestination
                    goalAmount={profile.goalAmountINR}
                    onChange={(v) => updateProfile({ goalAmountINR: v })}
                  />
                )}
                {step === 1 && (
                  <StepMonthlyReality
                    income={profile.monthlyIncomeINR}
                    committed={profile.monthlyCommittedSpendINR}
                    reserve={profile.monthlyReserveINR}
                    contribution={profile.plannedContributionINR}
                    surplus={surplus}
                    onChangeIncome={(v) => updateProfile({ monthlyIncomeINR: v })}
                    onChangeCommitted={(v) => updateProfile({ monthlyCommittedSpendINR: v })}
                    onChangeReserve={(v) => updateProfile({ monthlyReserveINR: v })}
                    onChangeContribution={(v) => updateProfile({ plannedContributionINR: Math.min(v, surplus) })}
                  />
                )}
                {step === 2 && (
                  <StepCushion
                    status={profile.emergencyReserveStatus}
                    onChange={(v) => updateProfile({ emergencyReserveStatus: v })}
                  />
                )}
                {step === 3 && (
                  <StepHorizon
                    horizonYears={profile.horizonYears}
                    liquidityNeed={profile.liquidityNeed}
                    onChangeHorizon={(v) => updateProfile({ horizonYears: v })}
                    onChangeLiquidity={(v) => updateProfile({ liquidityNeed: v })}
                  />
                )}
                {step === 4 && (
                  <StepLossFeel
                    lossResponse={profile.lossResponse}
                    onChange={(v) => updateProfile({ lossResponse: v })}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — living summary */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`summary-${step}`}
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <StartingPageSummary profile={profile} surplus={surplus} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div
          className="sticky bottom-0 py-4 flex justify-between items-center gap-4"
          style={{ background: 'var(--canvas)', borderTop: '1px solid var(--rule)' }}
        >
          <button
            onClick={back}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm"
            style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
            type="button"
          >
            <ChevronLeft size={16} />
            {step === 0 ? 'Back to prologue' : 'Back'}
          </button>

          <div className="flex gap-2">
            {step < TOTAL_STEPS - 1 && (
              <button
                onClick={() => {
                  completeOnboarding();
                  navigate('/workbench');
                }}
                className="px-4 py-2.5 rounded-md text-sm"
                style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
                type="button"
              >
                Skip to draft
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium"
              style={{ background: 'var(--forest)', color: 'var(--paper)', fontFamily: 'var(--font-ui)' }}
              type="button"
            >
              {step === TOTAL_STEPS - 1 ? 'Explore the choices' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}

// --- Step components ---

function CurrencyInput({
  label,
  value,
  onChange,
  helpText,
  id,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  helpText?: string;
  id: string;
}) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}>
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-base"
          style={{ color: 'var(--muted-ink)' }}
          aria-hidden="true"
        >
          ₹
        </span>
        <input
          id={id}
          type="number"
          min={0}
          inputMode="numeric"
          value={focused ? raw : (value || '')}
          onChange={(e) => {
            setRaw(e.target.value);
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= 0) onChange(v);
          }}
          onFocus={() => {
            setFocused(true);
            setRaw(value ? String(value) : '');
          }}
          onBlur={() => {
            setFocused(false);
          }}
          className="w-full pl-8 pr-4 py-3 rounded-md text-base tabular-nums"
          style={{
            border: '1px solid var(--rule)',
            background: 'var(--paper)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-ui)',
            fontSize: 18,
          }}
          aria-describedby={helpText ? `${id}-help` : undefined}
        />
      </div>
      {helpText && (
        <p id={`${id}-help`} className="text-xs" style={{ color: 'var(--muted-ink)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}

function StepDestination({
  goalAmount,
  onChange,
}: {
  goalAmount: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <EditorialHeading as="h2" className="text-chapter">
          What are you walking toward?
        </EditorialHeading>
        <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
          Start with a number. You can change it at any time. This is a draft, not a commitment.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {GOAL_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            type="button"
            className="px-4 py-2 rounded-md text-sm transition-colors"
            style={{
              border: `1px solid ${goalAmount === p.value ? 'var(--forest)' : 'var(--rule)'}`,
              background: goalAmount === p.value ? 'var(--forest-wash)' : 'var(--paper)',
              color: goalAmount === p.value ? 'var(--forest)' : 'var(--ink)',
              fontFamily: 'var(--font-ui)',
              fontWeight: goalAmount === p.value ? 600 : 400,
            }}
            aria-pressed={goalAmount === p.value}
          >
            {p.label}
          </button>
        ))}
      </div>

      <CurrencyInput
        id="goal-amount"
        label="Or enter a custom amount"
        value={goalAmount}
        onChange={onChange}
        helpText="One million rupees is ₹10 lakh (₹10,00,000). One crore is ₹100 lakh."
      />

      <AssumptionNote>
        One million rupees = ₹10,00,000 = Ten lakh rupees. Not ₹1 crore, which is ten million.
      </AssumptionNote>
    </div>
  );
}

function StepMonthlyReality({
  income,
  committed,
  reserve,
  contribution,
  surplus,
  onChangeIncome,
  onChangeCommitted,
  onChangeReserve,
  onChangeContribution,
}: {
  income: number;
  committed: number;
  reserve: number;
  contribution: number;
  surplus: number;
  onChangeIncome: (v: number) => void;
  onChangeCommitted: (v: number) => void;
  onChangeReserve: (v: number) => void;
  onChangeContribution: (v: number) => void;
}) {
  const overBudget = income > 0 && committed + reserve > income;

  return (
    <div className="space-y-6">
      <div>
        <EditorialHeading as="h2" className="text-chapter">
          What can you comfortably set aside?
        </EditorialHeading>
        <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
          Start with your honest monthly numbers. ₹2,000 is a possibility, not an obligation.
        </p>
      </div>

      <CurrencyInput
        id="income"
        label="Monthly income (all sources)"
        value={income}
        onChange={onChangeIncome}
        helpText="Allowance, part-time earnings, any regular income."
      />
      <CurrencyInput
        id="committed"
        label="Monthly essential spend"
        value={committed}
        onChange={onChangeCommitted}
        helpText="Rent, food, transport, utilities — what you genuinely need."
      />
      <CurrencyInput
        id="reserve"
        label="Optional monthly buffer"
        value={reserve}
        onChange={onChangeReserve}
        helpText="Extra cushion you'd like to keep unallocated. Not required."
      />

      {overBudget ? (
        <div
          className="p-4 rounded-md text-sm"
          style={{
            background: 'var(--clay-wash)',
            border: '1px solid var(--clay)',
            color: 'var(--clay)',
          }}
          role="alert"
        >
          Your committed spending exceeds your income. There is no available surplus at these numbers.
          Please revise before setting a contribution.
        </div>
      ) : (
        <div
          className="p-4 rounded-md"
          style={{ background: 'var(--forest-wash)', border: '1px solid var(--forest)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--forest)' }}>
            Available each month: <strong>{formatINR(surplus)}</strong>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>
            That's income minus essential spend minus your buffer.
          </p>
        </div>
      )}

      {!overBudget && surplus > 0 && (
        <div className="space-y-2">
          <label
            htmlFor="contribution"
            className="block text-sm font-medium"
            style={{ color: 'var(--ink)' }}
          >
            Planned monthly contribution
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="contribution"
              type="range"
              min={0}
              max={surplus}
              step={100}
              value={Math.min(contribution, surplus)}
              onChange={(e) => onChangeContribution(parseFloat(e.target.value))}
              className="flex-1"
              style={{ accentColor: 'var(--forest)' }}
              aria-label="Monthly contribution amount"
            />
            <span
              className="tabular-nums font-semibold text-base w-24 text-right"
              style={{ color: 'var(--forest)', fontFamily: 'var(--font-ui)' }}
            >
              {formatINR(Math.min(contribution, surplus))}
            </span>
          </div>
          <AssumptionNote>
            Maximum: {formatINR(surplus)} available. Contribution is up to you — your goal adjusts.
          </AssumptionNote>
        </div>
      )}
    </div>
  );
}

function StepCushion({
  status,
  onChange,
}: {
  status: string;
  onChange: (v: 'none' | 'building' | 'available' | 'unsure') => void;
}) {
  const options = [
    {
      value: 'none' as const,
      label: 'I don\'t have one yet',
      desc: 'No emergency fund set aside.',
    },
    {
      value: 'building' as const,
      label: 'I\'m building one',
      desc: 'Some savings, not yet enough for 3–6 months of expenses.',
    },
    {
      value: 'available' as const,
      label: 'I have a cushion',
      desc: 'A separate emergency fund that I won\'t touch for investing.',
    },
    {
      value: 'unsure' as const,
      label: 'Rather not say',
      desc: '',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <EditorialHeading as="h2" className="text-chapter">
          A cushion for surprises
        </EditorialHeading>
        <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
          Before investing, most people benefit from keeping 3–6 months of expenses accessible.
          An emergency fund means you're less likely to need to sell investments at a bad time.
          This is your call — we don't lock you out based on your answer.
        </p>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label="Emergency reserve status">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={status === opt.value}
            className="w-full text-left px-4 py-3 rounded-md transition-colors"
            style={{
              border: `1px solid ${status === opt.value ? 'var(--forest)' : 'var(--rule)'}`,
              background: status === opt.value ? 'var(--forest-wash)' : 'var(--paper)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            <strong className="text-sm">{opt.label}</strong>
            {opt.desc && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>
                {opt.desc}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepHorizon({
  horizonYears,
  liquidityNeed,
  onChangeHorizon,
  onChangeLiquidity,
}: {
  horizonYears: number;
  liquidityNeed: string;
  onChangeHorizon: (v: number) => void;
  onChangeLiquidity: (v: 'soon' | 'medium' | 'long' | 'unsure') => void;
}) {
  const horizonOptions = [
    { value: 'soon' as const, label: 'Under 3 years', note: 'Short horizon — large market drops are harder to wait out.' },
    { value: 'medium' as const, label: '3–7 years', note: 'Medium horizon — some room for growth, some risk of poor timing.' },
    { value: 'long' as const, label: '7+ years', note: 'Longer horizons historically allow more recovery time after downturns.' },
    { value: 'unsure' as const, label: 'Unsure', note: '' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <EditorialHeading as="h2" className="text-chapter">
          When might you need this money?
        </EditorialHeading>
        <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
          A short horizon means a market fall can be harder to recover from before you need the money.
          Longer horizons have historically allowed more time for recovery — but this is not a guarantee.
        </p>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label="Time horizon preference">
        {horizonOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChangeLiquidity(opt.value)}
            role="radio"
            aria-checked={liquidityNeed === opt.value}
            className="w-full text-left px-4 py-3 rounded-md transition-colors"
            style={{
              border: `1px solid ${liquidityNeed === opt.value ? 'var(--forest)' : 'var(--rule)'}`,
              background: liquidityNeed === opt.value ? 'var(--forest-wash)' : 'var(--paper)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            <strong className="text-sm">{opt.label}</strong>
            {opt.note && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>
                {opt.note}
              </p>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="horizon-years" className="block text-sm font-medium" style={{ color: 'var(--ink)' }}>
          Or specify years (1–50)
        </label>
        <input
          id="horizon-years"
          type="number"
          min={1}
          max={50}
          value={horizonYears}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 1 && v <= 50) onChangeHorizon(v);
          }}
          className="w-28 px-3 py-2 rounded-md text-base tabular-nums"
          style={{
            border: '1px solid var(--rule)',
            background: 'var(--paper)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-ui)',
          }}
        />
      </div>
    </div>
  );
}

function StepLossFeel({
  lossResponse,
  onChange,
}: {
  lossResponse: string;
  onChange: (v: 'need-access' | 'review-wait' | 'might-add' | 'unsure') => void;
}) {
  const options = [
    {
      value: 'need-access' as const,
      label: 'I might need the money and would likely sell',
      desc: 'Liquidity needs are real — this matters more than tolerating volatility.',
    },
    {
      value: 'review-wait' as const,
      label: 'I\'d wait and review the situation',
      desc: 'Comfortable watching and revisiting the plan.',
    },
    {
      value: 'might-add' as const,
      label: 'I\'d consider adding more at that point',
      desc: 'A lower price might feel like an opportunity.',
    },
    {
      value: 'unsure' as const,
      label: 'Honestly unsure',
      desc: 'That\'s a valid answer — it\'s worth thinking about before committing to volatile instruments.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <EditorialHeading as="h2" className="text-chapter">
          How would a loss feel?
        </EditorialHeading>
        <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--muted-ink)' }}>
          If ₹10,000 became ₹8,000 during a difficult year, what would you likely do?
          This captures your comfort level — not a formal risk score. We don't assign you a label.
        </p>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label="Loss response preference">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={lossResponse === opt.value}
            className="w-full text-left px-4 py-3 rounded-md transition-colors"
            style={{
              border: `1px solid ${lossResponse === opt.value ? 'var(--forest)' : 'var(--rule)'}`,
              background: lossResponse === opt.value ? 'var(--forest-wash)' : 'var(--paper)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            <strong className="text-sm">{opt.label}</strong>
            {opt.desc && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-ink)' }}>
                {opt.desc}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StartingPageSummary({
  profile,
  surplus,
}: {
  profile: ReturnType<typeof usePlanStore.getState>['plan']['profile'];
  surplus: number;
}) {
  return (
    <div
      className="rounded-xl p-6 space-y-5 sticky top-24"
      style={{ background: 'var(--paper)', border: '1px solid var(--rule)' }}
    >
      <p className="chapter-eyebrow" style={{ color: 'var(--muted-ink)' }}>
        YOUR STARTING PAGE
      </p>

      <div
        className="text-2xl font-semibold tabular-nums"
        style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)', fontStyle: 'italic' }}
      >
        {formatINR(profile.goalAmountINR)}
      </div>
      <p className="text-sm" style={{ color: 'var(--muted-ink)' }}>
        Your current goal
      </p>

      <FineRule />

      <div className="space-y-3 text-sm">
        {profile.monthlyIncomeINR > 0 && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-ink)' }}>Monthly income</span>
            <span className="tabular-nums">{formatINR(profile.monthlyIncomeINR)}</span>
          </div>
        )}
        {profile.monthlyCommittedSpendINR > 0 && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-ink)' }}>Essential spend</span>
            <span className="tabular-nums" style={{ color: 'var(--clay)' }}>
              − {formatINR(profile.monthlyCommittedSpendINR)}
            </span>
          </div>
        )}
        {profile.monthlyReserveINR > 0 && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-ink)' }}>Buffer</span>
            <span className="tabular-nums" style={{ color: 'var(--clay)' }}>
              − {formatINR(profile.monthlyReserveINR)}
            </span>
          </div>
        )}
        <FineRule />
        <div className="flex justify-between font-semibold">
          <span>Available</span>
          <span className="tabular-nums" style={{ color: surplus > 0 ? 'var(--forest)' : 'var(--clay)' }}>
            {formatINR(surplus)}
          </span>
        </div>
        {profile.plannedContributionINR > 0 && surplus > 0 && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-ink)' }}>Planned contribution</span>
            <span className="tabular-nums" style={{ color: 'var(--forest)' }}>
              {formatINR(profile.plannedContributionINR)}
            </span>
          </div>
        )}
      </div>

      {profile.plannedContributionINR > 0 && (
        <p
          className="text-sm leading-relaxed pt-2"
          style={{
            borderTop: '1px solid var(--rule)',
            paddingTop: '0.75rem',
            color: 'var(--ink)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-editorial)',
          }}
        >
          "You're working toward {formatINR(profile.goalAmountINR)}, and you've tentatively
          set aside {formatINR(profile.plannedContributionINR)} a month."
        </p>
      )}

      {surplus <= 0 && profile.monthlyIncomeINR > 0 && (
        <p className="text-sm" style={{ color: 'var(--clay)' }}>
          Your spending leaves no available surplus right now.
          Try adjusting your committed spend or reserve amount.
        </p>
      )}
    </div>
  );
}
