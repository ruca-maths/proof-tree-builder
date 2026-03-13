/**
 * ProofTreeViewer - bussproofs スタイルで証明木を再帰的にレンダリングする
 *
 * 表示の仕組み:
 *   - 各ノードを再帰的に描画
 *   - 前提（premiseIds）が上段に横並びで配置される
 *   - 前提の下に推論横線（inference line）を引く
 *   - 横線の下に結論、右横にルール名を表示
 *
 * 画像参照のイメージ:
 *   A       E   F
 *  ---  C  ---
 *   B      G
 *  ------- ---
 *     D     H
 *  ---------
 *       J
 */
import React, { useMemo, useState } from 'react';
import { TexString } from './FormulaDisplay';
import { formulaToTeX } from '../logic/expression';
import type { ProofNode } from '../logic/proof';

interface ProofTreeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Map<string, ProofNode>;
  rootNodeId: string | null;
}

const RULE_COLORS: Record<string, string> = {
  'Ax1': '#58c4dd', 'Ax2': '#58c4dd', 'Ax3': '#58c4dd',
  'Ax4': '#3ecaca', 'Ax5': '#3ecaca',
  'MP': '#83c167', 'Gen': '#b48ead', 'Premise': '#ff8c00',
};

// Find the root of the proof tree (the node that proves the target and is not used as premise of any other)
function findRoots(nodes: Map<string, ProofNode>): string[] {
  const usedAsPremise = new Set<string>();
  for (const node of nodes.values()) {
    for (const pid of node.premiseIds) usedAsPremise.add(pid);
  }
  return [...nodes.keys()].filter(id => !usedAsPremise.has(id));
}

// Recursively render a node in bussproofs style
function BussproofsNode({
  nodeId,
  nodes,
  depth = 0,
}: {
  nodeId: string;
  nodes: Map<string, ProofNode>;
  depth?: number;
}) {
  const node = nodes.get(nodeId);
  if (!node) return null;

  const color = RULE_COLORS[node.rule] || '#58c4dd';
  const premises = node.premiseIds.map(id => nodes.get(id)).filter(Boolean) as ProofNode[];
  const isAxiom = premises.length === 0;

  const formulaTeX = formulaToTeX(node.formula);

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '0 6px',
      verticalAlign: 'bottom',
    }}>
      {/* Premises row */}
      {premises.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 0,
          marginBottom: 6,
        }}>
          {premises.map((pNode, i) => (
            <BussproofsNode
              key={pNode.id}
              nodeId={pNode.id}
              nodes={nodes}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Inference line + rule name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 0,
      }}>
        <div style={{
          flex: 1,
          height: isAxiom ? 1 : 2,
          backgroundImage: isAxiom
            ? `repeating-linear-gradient(90deg, ${color}66 0, ${color}66 5px, transparent 5px, transparent 10px)`
            : 'none',
          background: isAxiom ? 'none' : color,
          borderRadius: 1,
          minWidth: 40,
          boxShadow: isAxiom ? 'none' : `0 0 4px ${color}55`,
        }} />
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.62rem',
          fontWeight: 700,
          color,
          marginLeft: 5,
          flexShrink: 0,
          opacity: 0.9,
          whiteSpace: 'nowrap',
        }}>
          {node.rule}
          {node.genVariable ? `(${node.genVariable})` : ''}
        </span>
      </div>

      {/* Conclusion formula */}
      <div style={{
        marginTop: 5,
        padding: '3px 10px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        <TexString tex={formulaTeX} size="md" />
      </div>
    </div>
  );
}

export const ProofTreeViewer: React.FC<ProofTreeViewerProps> = ({
  isOpen,
  onClose,
  nodes,
  rootNodeId,
}) => {
  const [zoom, setZoom] = useState(1.0);

  const displayRootId = useMemo(() => {
    if (rootNodeId && nodes.has(rootNodeId)) return rootNodeId;
    const roots = findRoots(nodes);
    return roots[0] ?? null;
  }, [rootNodeId, nodes]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 40px',
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 28,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-green)' }}>
              📐 証明木
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              bussproofs スタイル — 横線が推論ステップ、上が前提・下が結論
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Zoom controls */}
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', borderRadius: 6, padding: '4px 10px',
                cursor: 'pointer', fontFamily: 'monospace', fontSize: '1rem',
              }}
            >−</button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', minWidth: 36, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', borderRadius: 6, padding: '4px 10px',
                cursor: 'pointer', fontFamily: 'monospace', fontSize: '1rem',
              }}
            >+</button>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', borderRadius: 6, padding: '4px 12px',
                cursor: 'pointer', marginLeft: 8,
              }}
            >✕ 閉じる</button>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: 20, marginBottom: 24,
          fontSize: '0.72rem', color: 'var(--text-dim)',
        }}>
          <span>
            <span style={{ display: 'inline-block', width: 28, height: 2, background: '#58c4dd', marginRight: 5, verticalAlign: 'middle' }} />
            公理 (実線)
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 28, height: 1, borderTop: '1px dashed #58c4dd66', marginRight: 5, verticalAlign: 'middle' }} />
            公理・前提（点線）
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 28, height: 2, background: '#83c167', marginRight: 5, verticalAlign: 'middle' }} />
            MP
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 28, height: 2, background: '#b48ead', marginRight: 5, verticalAlign: 'middle' }} />
            Gen
          </span>
        </div>

        {/* Tree */}
        {displayRootId ? (
          <div style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
            padding: '12px 0',
          }}>
            <BussproofsNode
              nodeId={displayRootId}
              nodes={nodes}
            />
          </div>
        ) : (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 40 }}>
            証明木のデータがありません
          </p>
        )}
      </div>
    </div>
  );
};
