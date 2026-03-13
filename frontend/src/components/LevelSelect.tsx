import React from 'react';
import { getAllLevels } from '../data/levels';
import { useProof, LevelData } from '../context/ProofContext';
import { TexString } from './FormulaDisplay';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LevelSelect: React.FC<Omit<Props, 'onOpenAdmin'>> = ({ isOpen, onClose }) => {
  const { setCurrentLevel, clearProof, completedLevels } = useProof();
  const levels = getAllLevels();

  if (!isOpen) return null;

  const handleSelect = (level: LevelData) => {
    clearProof();
    setCurrentLevel(level);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <h2>🧩 レベル選択</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gap: 10 }}>
            {levels.map((level, i) => {
              const completed = completedLevels.has(level.id);
              return (
                <div
                  key={level.id}
                  className="animate-fadeInUp"
                  style={{
                    ...cardStyle,
                    animationDelay: `${i * 0.05}s`,
                    borderColor: completed ? 'var(--accent-green)' : 'var(--border-color)',
                  }}
                  onClick={() => handleSelect(level)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{level.title}</span>
                      {level.isCustom && <span className="badge badge-purple">CUSTOM</span>}
                      {completed && <span className="badge badge-green">✓ CLEAR</span>}
                    </div>
                  </div>
                  <div style={{ paddingLeft: 2 }}>
                    <TexString tex={level.targetTeX} size="md" />
                  </div>
                </div>
              );
            })}
          </div>

          {levels.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
              レベルがありません。管理パネルから問題を追加してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const cardStyle: React.CSSProperties = {
  padding: '14px 16px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
