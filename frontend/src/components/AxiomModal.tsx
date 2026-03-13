import React, { useState, useMemo } from 'react';
import { AxiomName, AXIOM_LIST, instantiateAx1, instantiateAx2, instantiateAx3, instantiateAx4, instantiateAx5 } from '../logic/axioms';
import { FormulaDisplay, FormulaInput, TexString } from './FormulaDisplay';
import { parseFormula, parseTerm } from '../logic/parser';
import { formulaToTeX, Formula } from '../logic/expression';
import { useProof } from '../context/ProofContext';
import type { Node } from '@xyflow/react';

interface Props {
  axiomName: AxiomName;
  onClose: () => void;
}

export const AxiomInstantiationModal: React.FC<Props> = ({ axiomName, onClose }) => {
  const axiom = AXIOM_LIST.find(a => a.name === axiomName)!;
  const { addProofNode, proofTree, setRfNodes, rfNodes } = useProof();

  // Input state for each meta-variable
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');

  const setInput = (key: string, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
    setError('');
  };

  // Parse preview
  const parsed = useMemo(() => {
    const result: Record<string, { formula?: Formula; term?: any; error?: string }> = {};
    for (const mv of axiom.metaVars) {
      const raw = inputs[mv]?.trim();
      if (!raw) { result[mv] = {}; continue; }
      try {
        if ((axiomName === 'Ax4' && mv === 't') || (axiomName === 'Ax4' && mv === 'x') || (axiomName === 'Ax5' && mv === 'x')) {
          if (mv === 'x') {
            result[mv] = { formula: undefined };
          } else {
            result[mv] = { term: parseTerm(raw) };
          }
        } else {
          result[mv] = { formula: parseFormula(raw) };
        }
      } catch (e: any) {
        result[mv] = { error: e.message };
      }
    }
    return result;
  }, [inputs, axiom, axiomName]);

  // Preview of instantiated axiom
  const preview = useMemo((): { formula?: Formula; error?: string } => {
    try {
      const allFilled = axiom.metaVars.every(mv => inputs[mv]?.trim());
      if (!allFilled) return {};
      const hasErrors = axiom.metaVars.some(mv => parsed[mv]?.error);
      if (hasErrors) return {};

      switch (axiomName) {
        case 'Ax1': {
          const phi = parseFormula(inputs['φ']);
          const psi = parseFormula(inputs['ψ']);
          return { formula: instantiateAx1(phi, psi) };
        }
        case 'Ax2': {
          const phi = parseFormula(inputs['φ']);
          const psi = parseFormula(inputs['ψ']);
          const rho = parseFormula(inputs['ρ']);
          return { formula: instantiateAx2(phi, psi, rho) };
        }
        case 'Ax3': {
          const phi = parseFormula(inputs['φ']);
          const psi = parseFormula(inputs['ψ']);
          return { formula: instantiateAx3(phi, psi) };
        }
        case 'Ax4': {
          const phi = parseFormula(inputs['φ']);
          const x = inputs['x'].trim();
          const t = parseTerm(inputs['t']);
          const res = instantiateAx4(phi, x, t);
          if ('error' in res) return { error: res.error };
          return { formula: res.result };
        }
        case 'Ax5': {
          const phi = parseFormula(inputs['φ']);
          const psi = parseFormula(inputs['ψ']);
          const x = inputs['x'].trim();
          const res = instantiateAx5(phi, psi, x);
          if ('error' in res) return { error: res.error };
          return { formula: res.result };
        }
      }
    } catch (e: any) {
      return { error: e.message };
    }
    return {};
  }, [inputs, parsed, axiomName, axiom]);

  const handleAdd = () => {
    if (!preview.formula) {
      setError('すべてのフィールドを正しく入力してください');
      return;
    }
    const node = proofTree.addAxiom(preview.formula, axiomName);
    addProofNode(node);

    // Add React Flow node
    const x = 100 + Math.random() * 300;
    const y = 50 + rfNodes.length * 100;
    const newRfNode: Node = {
      id: node.id,
      type: 'proofNode',
      position: { x, y },
      data: {
        formula: node.formula,
        rule: node.rule,
        label: formulaToTeX(node.formula),
      },
    };
    setRfNodes(prev => [...prev, newRfNode]);
    onClose();
  };

  const getLabel = (mv: string): string => {
    if (axiomName === 'Ax4' || axiomName === 'Ax5') {
      if (mv === 'x') return '変数 x（小文字1文字）';
      if (mv === 't') return '項 t（変数または関数）';
    }
    const greekLabels: Record<string, string> = { 'φ': '式 φ', 'ψ': '式 ψ', 'ρ': '式 ρ' };
    return greekLabels[mv] || mv;
  };

  const getPlaceholder = (mv: string): string => {
    if (mv === 'x') return 'x';
    if (mv === 't') return 'f(a)';
    return 'P -> Q, \\neg P \\lor Q など';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
        <div className="modal-header">
          <h2>
            <span className="badge badge-blue" style={{ marginRight: 8 }}>{axiomName}</span>
            公理の具体化
          </h2>
          <button className="btn" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        <div className="modal-body">
          {/* Schema display */}
          <div style={{
            padding: '12px 16px', marginBottom: 16,
            background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)', textAlign: 'center',
          }}>
            <TexString tex={axiom.description} size="lg" />
          </div>

          {/* Meta-variable inputs */}
          {axiom.metaVars.map(mv => (
            <FormulaInput
              key={mv}
              label={getLabel(mv)}
              value={inputs[mv] || ''}
              onChange={v => setInput(mv, v)}
              placeholder={getPlaceholder(mv)}
              error={parsed[mv]?.error}
              previewFormula={parsed[mv]?.formula}
              helperText={mv !== 'x' && mv !== 't' ? 'LaTeXコマンド(\\neg, \\to, \\lor, \\land 等)も使えます' : undefined}
            />
          ))}

          {/* Preview */}
          {preview.formula && (
            <div style={{
              padding: '14px 16px', marginTop: 16,
              background: 'rgba(88, 196, 221, 0.05)',
              border: '1px solid var(--accent-blue)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginBottom: 6, fontWeight: 600 }}>
                具体化結果 PREVIEW
              </div>
              <FormulaDisplay formula={preview.formula} size="md" />
            </div>
          )}

          {(preview.error || error) && (
            <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: 8 }}>
              ⚠ {preview.error || error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>キャンセル</button>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={!preview.formula}
            style={{ opacity: preview.formula ? 1 : 0.4 }}
          >
            キャンバスに追加
          </button>
        </div>
      </div>
    </div>
  );
};
