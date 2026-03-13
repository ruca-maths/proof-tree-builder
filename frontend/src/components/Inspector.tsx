import React, { useState, useCallback, useMemo } from 'react';
import { FormulaDisplay } from './FormulaDisplay';
import { useProof } from '../context/ProofContext';
import { applyMP, applyGen } from '../logic/rules';
import { formulaToTeX } from '../logic/expression';
import type { Node } from '@xyflow/react';

export const Inspector: React.FC = () => {
  const {
    currentLevel, selectedNodeIds, proofTree, proofNodes,
    addProofNode, setRfNodes, rfNodes, setRfEdges,
    removeProofNode, checkVictory, isVictory, setIsTreeViewerOpen,
  } = useProof();

  const [genVar, setGenVar] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const selectedNodes = useMemo(() =>
    selectedNodeIds.map(id => proofTree.nodes.get(id)).filter(Boolean),
    [selectedNodeIds, proofTree, proofNodes]
  );

  const handleMP = useCallback(() => {
    if (selectedNodes.length !== 2) {
      setMessage({ text: '2つのノードを選択してください', type: 'error' });
      return;
    }
    const [a, b] = selectedNodes;
    const result = applyMP(a!.formula, b!.formula);
    if ('error' in result) {
      setMessage({ text: result.error, type: 'error' });
      return;
    }

    const conclusionNode = proofTree.addMP(result.result, a!.id, b!.id);
    addProofNode(conclusionNode);

    const x = (rfNodes.find(n => n.id === a!.id)?.position.x ?? 200);
    const y = Math.max(
      rfNodes.find(n => n.id === a!.id)?.position.y ?? 0,
      rfNodes.find(n => n.id === b!.id)?.position.y ?? 0,
    ) + 120;

    const newNode: Node = {
      id: conclusionNode.id,
      type: 'proofNode',
      position: { x, y },
      data: { formula: conclusionNode.formula, rule: 'MP', label: formulaToTeX(conclusionNode.formula) },
    };
    setRfNodes(prev => [...prev, newNode]);
    setRfEdges(prev => [
      ...prev,
      { id: `e-${a!.id}-${conclusionNode.id}`, source: a!.id, target: conclusionNode.id, animated: true, style: { stroke: 'var(--accent-green)' } },
      { id: `e-${b!.id}-${conclusionNode.id}`, source: b!.id, target: conclusionNode.id, animated: true, style: { stroke: 'var(--accent-green)' } },
    ]);
    setMessage({ text: 'MP 適用成功！', type: 'success' });

    setTimeout(() => checkVictory(), 100);
  }, [selectedNodes, proofTree, addProofNode, setRfNodes, setRfEdges, rfNodes, checkVictory]);

  const handleGen = useCallback(() => {
    if (selectedNodes.length !== 1) {
      setMessage({ text: '1つのノードを選択してください', type: 'error' });
      return;
    }
    if (!genVar.trim()) {
      setMessage({ text: '一般化する変数を入力してください', type: 'error' });
      return;
    }
    const node = selectedNodes[0]!;
    const assumptions = proofTree.getAssumptions(node.id);
    const result = applyGen(node.formula, genVar.trim(), assumptions);
    if ('error' in result) {
      setMessage({ text: result.error, type: 'error' });
      return;
    }

    const genNode = proofTree.addGen(result.result, node.id, genVar.trim());
    addProofNode(genNode);

    const baseNode = rfNodes.find(n => n.id === node.id);
    const newNode: Node = {
      id: genNode.id,
      type: 'proofNode',
      position: { x: (baseNode?.position.x ?? 200), y: (baseNode?.position.y ?? 0) + 120 },
      data: { formula: genNode.formula, rule: 'Gen', label: formulaToTeX(genNode.formula) },
    };
    setRfNodes(prev => [...prev, newNode]);
    setRfEdges(prev => [
      ...prev,
      { id: `e-${node.id}-${genNode.id}`, source: node.id, target: genNode.id, animated: true, style: { stroke: 'var(--accent-purple)' } },
    ]);
    setMessage({ text: 'Gen 適用成功！', type: 'success' });
    setGenVar('');
    setTimeout(() => checkVictory(), 100);
  }, [selectedNodes, genVar, proofTree, addProofNode, setRfNodes, setRfEdges, rfNodes, checkVictory]);

  const handleDelete = useCallback(() => {
    for (const id of selectedNodeIds) {
      removeProofNode(id);
    }
    setMessage({ text: '削除しました', type: 'info' });
  }, [selectedNodeIds, removeProofNode]);

  return (
    <div style={panelStyle}>
      <div className="panel-header">🔍 インスペクター / INSPECTOR</div>

      {/* Current level hint & solution */}
      {(currentLevel?.hint || currentLevel?.solution) && (
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
          {currentLevel.hint && (
            <details>
              <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent-yellow)' }}>💡 ヒント</summary>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                {currentLevel.hint}
              </p>
            </details>
          )}
          {currentLevel.solution && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent-blue)' }}>📖 解答例を見る</summary>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                {currentLevel.solution.map((step, idx) => (
                  <div key={idx} style={{ marginBottom: 4 }}>{step}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Selected node info */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>
          選択中: {selectedNodeIds.length} ノード
        </div>
        {selectedNodes.map(node => node && (
          <div key={node.id} style={{
            padding: '8px 10px', marginBottom: 6,
            background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className={`badge badge-${node.rule === 'MP' ? 'green' : node.rule === 'Gen' ? 'purple' : 'blue'}`}>
                {node.rule}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{node.id}</span>
            </div>
            <FormulaDisplay formula={node.formula} size="sm" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 8 }}>推論規則の適用</div>

        <button className="btn btn-primary" onClick={handleMP} style={{ width: '100%', marginBottom: 6, justifyContent: 'center' }}
          disabled={selectedNodeIds.length !== 2}>
          ⚡ MP 適用 (2ノード選択)
        </button>

        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input
            className="input"
            placeholder="変数 (例: x)"
            value={genVar}
            onChange={e => setGenVar(e.target.value)}
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button className="btn" onClick={handleGen} disabled={selectedNodeIds.length !== 1}
            style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', whiteSpace: 'nowrap' }}>
            Gen
          </button>
        </div>

        <button className="btn btn-danger" onClick={handleDelete} style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
          disabled={selectedNodeIds.length === 0}>
          🗑 選択ノードを削除
        </button>

        {/* Feedback */}
        {message && (
          <div className="animate-fadeIn" style={{
            marginTop: 10, padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            background: message.type === 'error' ? 'rgba(252,98,85,0.1)' :
                         message.type === 'success' ? 'rgba(131,193,103,0.1)' : 'rgba(88,196,221,0.1)',
            color: message.type === 'error' ? 'var(--accent-red)' :
                   message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)',
            border: `1px solid ${message.type === 'error' ? 'var(--accent-red)' :
                    message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)'}`,
          }}>
            {message.text}
          </div>
        )}
      </div>

      {/* Victory check button / Proof tree button */}
      {currentLevel && (
        <div style={{ padding: '0 14px 14px' }}>
          {!isVictory ? (
            <button className="btn btn-success" onClick={() => {
              const won = checkVictory();
              if (!won) setMessage({ text: '目標の定理がまだ証明されていません', type: 'info' });
            }} style={{ width: '100%', justifyContent: 'center' }}>
              ✓ 証明を検証
            </button>
          ) : (
            <button
              className="btn"
              onClick={() => setIsTreeViewerOpen(true)}
              style={{
                width: '100%', justifyContent: 'center',
                borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)',
                background: 'rgba(88, 196, 221, 0.1)',
                fontWeight: 600
              }}
            >
              📐 証明木全体を見る
            </button>
          )}
        </div>
      )}

      {/* Operation guide */}
      <div style={{
        margin: '0 14px 14px',
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <details>
          <summary style={{
            cursor: 'pointer', fontSize: '0.78rem',
            color: 'var(--text-dim)', fontWeight: 600,
          }}>⌨️ 操作ガイド</summary>
          <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>ノードを選択:</span><br />
              ノードをクリックすると選択（青枠）、再クリックで解除。複数選択はクリックを繰り返すだけ。
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>MP 適用:</span><br />
              φ と φ→ψ の2つのノードを選択 → 「⚡ MP 適用」をクリック → ψ が生成される。
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Gen 適用:</span><br />
              φ(x) のノードを1つ選択 → 変数欄に x を入力 → 「Gen」ボタン → ∀x φ(x) が生成される。
            </div>
            <div>
              <span style={{ color: 'var(--accent-yellow)', fontWeight: 600 }}>ノードを削除:</span><br />
              削除したいノードを選択 → 「🗑 選択ノードを削除」をクリック。
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  width: 300,
  height: '100%',
  background: 'var(--bg-panel)',
  borderLeft: '1px solid var(--border-color)',
  overflowY: 'auto',
  flexShrink: 0,
};
