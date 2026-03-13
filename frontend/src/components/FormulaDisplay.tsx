import React from 'react';
import katex from 'katex';
import { Formula, formulaToTeX } from '../logic/expression';

interface FormulaDisplayProps {
  formula: Formula;
  abbreviate?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP = { sm: '0.85em', md: '1.0em', lg: '1.3em', xl: '1.7em' };

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  formula, abbreviate = true, className = '', style, size = 'md'
}) => {
  const tex = formulaToTeX(formula, abbreviate);
  return <TexString tex={tex} className={className} style={style} size={size} />;
};

interface TexStringProps {
  tex: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  displayMode?: boolean;
}

export const TexString: React.FC<TexStringProps> = ({
  tex, className = '', style, size = 'md', displayMode = false,
}) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        displayMode,
        trust: true,
      });
    } catch {
      return `<span style="color:#fc6255">${tex}</span>`;
    }
  }, [tex, displayMode]);

  return (
    <span
      className={`formula-display ${className}`}
      style={{ fontSize: SIZE_MAP[size], ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface FormulaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  previewFormula?: Formula | null;
  helperText?: string;
}

const SYMBOLS = [
  { char: '→', insert: '->' },
  { char: '¬', insert: '~' },
  { char: '∀', insert: 'forall ' },
  { char: '∃', insert: 'exists ' },
  { char: '∨', insert: '|' },
  { char: '∧', insert: '&' },
  { char: '↔', insert: '<->' },
];

export const FormulaInput: React.FC<FormulaInputProps> = ({
  value, onChange, placeholder = 'P -> Q', label, error, previewFormula, helperText,
}) => {
  const insertSymbol = (text: string) => {
    onChange(value + text);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{
            fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500,
          }}>{label}</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {SYMBOLS.map(sym => (
              <button 
                key={sym.char}
                onClick={() => insertSymbol(sym.insert)}
                style={{
                  background: 'rgba(88,196,221,0.1)', border: '1px solid rgba(88,196,221,0.2)',
                  borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', color: 'var(--accent-blue)',
                  cursor: 'pointer', fontFamily: 'var(--font-math)'
                }}
                title={`Input: ${sym.insert}`}
              >
                {sym.char}
              </button>
            ))}
          </div>
        </div>
      )}
      <input
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ fontFamily: 'var(--font-mono)' }}
      />
      {helperText && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: 4 }}>
          {helperText}
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: 4 }}>
          ⚠ {error}
        </div>
      )}
      {previewFormula && (
        <div style={{
          marginTop: 6, padding: '6px 10px',
          background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}>
          <FormulaDisplay formula={previewFormula} size="md" />
        </div>
      )}
    </div>
  );
};

export default FormulaDisplay;
