import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { TexString } from './FormulaDisplay';

const RULE_COLORS: Record<string, string> = {
  'Ax1': 'var(--accent-blue)',
  'Ax2': 'var(--accent-blue)',
  'Ax3': 'var(--accent-blue)',
  'Ax4': 'var(--accent-teal)',
  'Ax5': 'var(--accent-teal)',
  'MP': 'var(--accent-green)',
  'Gen': 'var(--accent-purple)',
  'Premise': 'var(--accent-orange)',
};

// Whether a rule has premises (is not an axiom/leaf node)
const HAS_PREMISE = (rule: string) => rule === 'MP' || rule === 'Gen';

export const ProofNodeComponent: React.FC<NodeProps> = memo(({ data, selected }) => {
  const rule = (data as any).rule as string;
  const label = (data as any).label as string;
  const color = RULE_COLORS[rule] || 'var(--accent-blue)';
  const hasPremise = HAS_PREMISE(rule);

  return (
    <div
      className="animate-nodeAppear"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {/* Source handle: accepts incoming edges from premises above */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, top: 0 }}
      />

      {/* Inference bar row: line + rule name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 0,
        marginBottom: 4,
      }}>
        {/* The inference line (horizontal rule) */}
        <div style={{
          flex: 1,
          height: hasPremise ? 2 : 1,
          background: hasPremise
            ? color
            : `${color}55`,
          borderRadius: 1,
          boxShadow: hasPremise && selected
            ? `0 0 6px ${color}`
            : 'none',
          transition: 'box-shadow 0.2s',
          // Dashed for axioms (leaf nodes)
          backgroundImage: hasPremise ? 'none' : `repeating-linear-gradient(90deg, ${color}88 0, ${color}88 4px, transparent 4px, transparent 8px)`,
        }} />
        {/* Rule label to the right of the line */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          fontWeight: 700,
          color: color,
          marginLeft: 6,
          flexShrink: 0,
          letterSpacing: '0.02em',
          opacity: 0.9,
        }}>
          {rule}
        </span>
      </div>

      {/* Conclusion formula */}
      <div style={{
        padding: '4px 8px',
        borderRadius: 'var(--radius-sm)',
        background: selected
          ? `${color}14`
          : 'transparent',
        outline: selected
          ? `1.5px solid ${color}55`
          : '1.5px solid transparent',
        transition: 'all 0.2s ease',
        textAlign: 'center',
      }}>
        <TexString tex={label} size="md" />
      </div>

      {/* Target handle: this node connects downward */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, bottom: 0 }}
      />
    </div>
  );
});

ProofNodeComponent.displayName = 'ProofNodeComponent';
