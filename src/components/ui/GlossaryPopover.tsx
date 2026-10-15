import React, { useState, useRef, useEffect } from 'react';
import { glossary } from '../../content/glossary';

interface Props {
  term: string;
  children?: React.ReactNode;
}

export default function GlossaryPopover({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = glossary.find((g) => g.term.toLowerCase() === term.toLowerCase());

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  if (!entry) return <>{children ?? term}</>;

  return (
    <span ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="inline underline decoration-dotted cursor-help"
        style={{ color: 'var(--forest)', textDecorationColor: 'var(--forest)' }}
        aria-expanded={open}
        aria-label={`Definition of ${term}`}
        type="button"
      >
        {children ?? term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 left-0 top-full mt-2 w-72 rounded-lg p-4 text-sm shadow-lg"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <strong className="block mb-1" style={{ color: 'var(--forest)' }}>
            {entry.term}
          </strong>
          <span className="leading-relaxed">{entry.definition}</span>
          {entry.example && (
            <span
              className="block mt-2 text-xs"
              style={{ color: 'var(--muted-ink)', fontStyle: 'italic' }}
            >
              e.g. {entry.example}
            </span>
          )}
          <button
            onClick={() => setOpen(false)}
            className="mt-3 text-xs underline block"
            style={{ color: 'var(--muted-ink)' }}
            type="button"
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}
