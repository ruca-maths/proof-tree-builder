import React, { useState } from 'react';
import { AXIOM_LIST, AxiomName } from '../logic/axioms';
import { TexString } from './FormulaDisplay';
import { useProof } from '../context/ProofContext';
import { AxiomInstantiationModal } from './AxiomModal';
import { Formula } from '../logic/expression';
import type { Node } from '@xyflow/react';

export const Toolbox: React.FC = () => {
  const { currentLevel, addProofNode, rfNodes, setRfNodes, proofTree } = useProof();
  const [showAxiomList, setShowAxiomList] = useState(false);
  const [selectedAxiom, setSelectedAxiom] = useState<AxiomName | null>(null);

  const handleAddPremise = (formula: Formula, tex: string) => {
    const node = proofTree.addPremise(formula);
    addProofNode(node);
    
    // Add React Flow node
    const x = 100 + Math.random() * 200;
    const y = 50 + rfNodes.length * 80;
    const newRfNode: Node = {
      id: node.id,
      type: 'proofNode',
      position: { x, y },
      data: {
        formula: node.formula,
        rule: node.rule,
        label: tex,
      },
    };
    setRfNodes(prev => [...prev, newRfNode]);
  };

  return (
    <div className="toolbox" style={panelStyle}>
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>📋 公理 / AXIOMS</span>
      </div>

      <div style={{ padding: '16px 12px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAxiomList(true)}
          disabled={!currentLevel}
          style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
        >
          📚 公理一覧を開く
        </button>
      </div>

      {currentLevel?.premises && currentLevel.premises.length > 0 && (
        <>
          <div className="panel-header" style={{ marginTop: 8 }}>
            <span>📝 前提 / PREMISES</span>
          </div>
          <div style={{ padding: '8px 12px' }}>
            {currentLevel.premises.map((p, i) => (
              <div
                key={i}
                className="animate-fadeInUp"
                style={{
                  ...axiomCardStyle,
                  borderLeftColor: 'var(--accent-purple)',
                }}
                onClick={() => handleAddPremise(p.formula, p.tex)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="badge" style={{ background: 'rgba(180,142,173,0.2)', color: 'var(--accent-purple)' }}>
                    前提
                  </span>
                </div>
                <div style={{ paddingLeft: 4 }}>
                  <TexString tex={p.tex} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAxiomList && (
        <AxiomSelectModal 
          onSelect={(name) => { setShowAxiomList(false); setSelectedAxiom(name); }}
          onClose={() => setShowAxiomList(false)}
        />
      )}

      {selectedAxiom && (
        <AxiomInstantiationModal
          axiomName={selectedAxiom}
          onClose={() => setSelectedAxiom(null)}
        />
      )}
    </div>
  );
};

const AxiomSelectModal: React.FC<{ onSelect: (n: AxiomName) => void; onClose: () => void }> = ({ onSelect, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>📚 公理を選択</h2>
          <button className="btn" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>
        <div className="modal-body">
          {AXIOM_LIST.map((ax) => (
            <div
              key={ax.name}
              style={{
                ...axiomCardStyle,
                marginBottom: 8,
              }}
              onClick={() => onSelect(ax.name)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="badge badge-blue">{ax.name}</span>
              </div>
              <div style={{ paddingLeft: 4 }}>
                <TexString tex={ax.description} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  width: 280,
  height: '100%',
  background: 'var(--bg-panel)',
  borderRight: '1px solid var(--border-color)',
  overflowY: 'auto',
  flexShrink: 0,
};

const axiomCardStyle: React.CSSProperties = {
  padding: '10px 12px',
  marginBottom: 6,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderLeft: '3px solid var(--accent-blue)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
