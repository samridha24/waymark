import { useState } from 'react';
import type { AssetId } from '../../types/finance';
import { formatINR } from '../../engine/formatCurrency';

interface AssetConfig {
  id: AssetId;
  label: string;
  color: string;
  pattern?: string;
}

const ASSET_CONFIGS: AssetConfig[] = [
  { id: 'cash', label: 'Cash', color: '#B8C4BE' },
  { id: 'fd', label: 'FD', color: '#8C6B34' },
  { id: 'index', label: 'Index', color: '#315F51' },
  { id: 'debt', label: 'Debt', color: '#59635E' },
  { id: 'gold', label: 'Gold', color: '#AD6450' },
];

interface Props {
  allocation: Record<AssetId, number>;
  monthlyContribution: number;
  onChange: (asset: AssetId, newFraction: number) => void;
  onNormalize: () => void;
}

export default function AllocationRibbon({ allocation, monthlyContribution, onChange, onNormalize }: Props) {
  const [editing, setEditing] = useState<AssetId | null>(null);
  const [inputVal, setInputVal] = useState('');

  const totalPct = ASSET_CONFIGS.reduce((s, a) => s + (allocation[a.id] ?? 0), 0);
  const isValid = Math.abs(totalPct - 1) <= 1e-4;

  function startEdit(id: AssetId) {
    setEditing(id);
    setInputVal(((allocation[id] ?? 0) * 100).toFixed(1));
  }

  function commitEdit(id: AssetId) {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onChange(id, val / 100);
    }
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      {/* Visual ribbon */}
      <div
        className="flex w-full rounded-md overflow-hidden"
        style={{ height: 28 }}
        role="img"
        aria-label={`Allocation ribbon: ${ASSET_CONFIGS.map(
          (a) => `${a.label} ${((allocation[a.id] ?? 0) * 100).toFixed(0)}%`
        ).join(', ')}`}
      >
        {ASSET_CONFIGS.map((a) => {
          const pct = (allocation[a.id] ?? 0) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={a.id}
              style={{
                width: `${pct}%`,
                background: a.color,
                transition: 'width 300ms ease',
              }}
              className="flex items-center justify-center"
            >
              {pct > 8 && (
                <span className="text-xs font-medium text-white truncate px-1">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-asset rows */}
      <div className="space-y-2" role="group" aria-label="Allocation inputs">
        {ASSET_CONFIGS.map((a) => {
          const pct = (allocation[a.id] ?? 0) * 100;
          const monthly = monthlyContribution * (allocation[a.id] ?? 0);

          return (
            <div key={a.id} className="flex items-center gap-3">
              {/* Color swatch */}
              <div
                className="flex-shrink-0 w-3 h-3 rounded-sm"
                style={{ background: a.color }}
                aria-hidden="true"
              />

              {/* Label */}
              <span
                className="flex-shrink-0 w-24 text-sm"
                style={{ color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}
              >
                {a.label}
              </span>

              {/* Slider */}
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={pct}
                onChange={(e) => onChange(a.id, parseFloat(e.target.value) / 100)}
                className="flex-1 accent-forest"
                aria-label={`${a.label} allocation percentage`}
                style={{ accentColor: a.color }}
              />

              {/* Percent input */}
              {editing === a.id ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onBlur={() => commitEdit(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit(a.id);
                    if (e.key === 'Escape') setEditing(null);
                  }}
                  autoFocus
                  className="w-16 text-right text-sm px-2 py-1 rounded"
                  style={{
                    border: '1px solid var(--forest)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-ui)',
                  }}
                  aria-label={`${a.label} percentage input`}
                />
              ) : (
                <button
                  onClick={() => startEdit(a.id)}
                  className="w-16 text-right text-sm px-2 py-1 rounded tabular-nums"
                  style={{
                    border: '1px solid var(--rule)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-ui)',
                  }}
                  aria-label={`${a.label} ${pct.toFixed(1)}%, click to edit`}
                  type="button"
                >
                  {pct.toFixed(1)}%
                </button>
              )}

              {/* Monthly ₹ */}
              <span
                className="w-24 text-right text-xs tabular-nums"
                style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
              >
                {formatINR(monthly)}/mo
              </span>
            </div>
          );
        })}
      </div>

      {/* Total indicator */}
      <div
        className="flex items-center justify-between text-sm"
        style={{ borderTop: '1px solid var(--rule)', paddingTop: '0.5rem' }}
      >
        <span style={{ color: 'var(--muted-ink)' }}>Total allocated</span>
        <span
          className="tabular-nums font-semibold"
          style={{ color: isValid ? 'var(--forest)' : 'var(--clay)' }}
        >
          {(totalPct * 100).toFixed(1)}%
        </span>
        {!isValid && (
          <button
            onClick={onNormalize}
            className="ml-3 text-xs px-2 py-1 rounded"
            style={{
              background: 'var(--forest)',
              color: 'var(--paper)',
              fontFamily: 'var(--font-ui)',
            }}
            type="button"
          >
            Normalize to 100%
          </button>
        )}
      </div>
    </div>
  );
}
