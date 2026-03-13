import React, { useState, useEffect } from 'react';
import { TexString } from './FormulaDisplay';
import { useProof } from '../context/ProofContext';

export const TargetTheorem: React.FC = () => {
  const { currentLevel, isVictory } = useProof();
  const [showVictory, setShowVictory] = useState(false);

  useEffect(() => {
    if (isVictory) {
      setShowVictory(true);
      const t = setTimeout(() => setShowVictory(false), 3000);
      return () => clearTimeout(t);
    } else {
      setShowVictory(false);
    }
  }, [isVictory]);

  if (!currentLevel) {
    return (
      <div className="target-theorem-bar" style={barStyle}>
        <span style={{ color: 'var(--text-dim)' }}>レベルを選択してください</span>
      </div>
    );
  }

  return (
    <div className="target-theorem-bar" style={{
      ...barStyle,
      borderColor: showVictory ? 'var(--accent-green)' : 'var(--border-color)',
      boxShadow: showVictory ? '0 0 30px rgba(131, 193, 103, 0.2)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>TARGET</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
          {currentLevel.title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>証明せよ:</span>
        <TexString
          tex={currentLevel.premises && currentLevel.premises.length > 0
            ? `${currentLevel.premises.map(p => p.tex).join(', ')} \\vdash ${currentLevel.targetTeX}`
            : `\\vdash ${currentLevel.targetTeX}`
          }
          size="lg"
          style={{ color: showVictory ? 'var(--accent-green)' : 'var(--accent-yellow)' }}
        />
        {showVictory && (
          <span className="badge badge-green animate-fadeIn" style={{ marginLeft: 8 }}>
            ✓ 証明完了
          </span>
        )}
      </div>
    </div>
  );
};

const barStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
  borderBottom: '1px solid var(--border-color)',
  transition: 'all 0.5s ease',
};
