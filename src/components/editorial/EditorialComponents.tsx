import React from 'react';

interface Props {
  chapter: string; // e.g. "01 / THE STARTING POINT"
  className?: string;
}

export function ChapterEyebrow({ chapter, className = '' }: Props) {
  return (
    <p
      className={`chapter-eyebrow ${className}`}
      style={{ color: 'var(--muted-ink)', letterSpacing: '0.1em' }}
    >
      {chapter}
    </p>
  );
}

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export function EditorialHeading({ children, className = '', as: Tag = 'h1' }: HeadingProps) {
  return (
    <Tag
      className={className}
      style={{
        fontFamily: 'var(--font-editorial)',
        color: 'var(--ink)',
        fontWeight: 400,
        lineHeight: 1.12,
      }}
    >
      {children}
    </Tag>
  );
}

interface LeadProps {
  children: React.ReactNode;
  className?: string;
}

export function LeadText({ children, className = '' }: LeadProps) {
  return (
    <p
      className={`text-lg leading-relaxed ${className}`}
      style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
    >
      {children}
    </p>
  );
}

interface MarginalProps {
  children: React.ReactNode;
  className?: string;
}

export function MarginalNote({ children, className = '' }: MarginalProps) {
  return (
    <aside
      className={`text-sm leading-relaxed pl-4 ${className}`}
      style={{
        borderLeft: '2px solid var(--forest)',
        color: 'var(--muted-ink)',
        fontFamily: 'var(--font-ui)',
        fontStyle: 'italic',
      }}
    >
      {children}
    </aside>
  );
}

interface AssumptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AssumptionNote({ children, className = '' }: AssumptionProps) {
  return (
    <p
      className={`text-xs leading-relaxed ${className}`}
      style={{
        color: 'var(--gold-ink)',
        fontFamily: 'var(--font-ui)',
        fontStyle: 'italic',
      }}
    >
      {children}
    </p>
  );
}

interface DisclaimerProps {
  children: React.ReactNode;
  className?: string;
}

export function DisclaimerLine({ children, className = '' }: DisclaimerProps) {
  return (
    <p
      className={`text-xs leading-relaxed ${className}`}
      style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
    >
      {children}
    </p>
  );
}

interface FineRuleProps {
  className?: string;
}

export function FineRule({ className = '' }: FineRuleProps) {
  return (
    <hr
      className={`fine-rule ${className}`}
      style={{ borderColor: 'var(--rule)' }}
    />
  );
}

interface CurrencyAmountProps {
  amount: number;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

import { formatINR } from '../../engine/formatCurrency';

export function CurrencyAmount({ amount, compact = false, className = '', style }: CurrencyAmountProps) {
  const formatted = compact ? formatINR(amount, true) : formatINR(amount);
  return (
    <span
      className={`tabular-nums ${className}`}
      style={{ fontFamily: 'var(--font-ui)', ...style }}
    >
      {formatted}
    </span>
  );
}

interface DemoIndicatorProps {
  className?: string;
}

export function DemoIndicator({ className = '' }: DemoIndicatorProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${className}`}
      style={{
        background: 'var(--gold-ink)',
        color: 'var(--paper)',
        fontFamily: 'var(--font-ui)',
        letterSpacing: '0.05em',
      }}
    >
      <span>◈</span>
      <span>Illustrative demo profile — edit any value</span>
    </div>
  );
}
