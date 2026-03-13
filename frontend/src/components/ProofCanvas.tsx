import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls,
  type NodeTypes, type Node, type Edge, type OnSelectionChangeParams,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProof } from '../context/ProofContext';
import { ProofNodeComponent } from './ProofNodeComponent';
import { formulasEqual, formulaToTeX } from '../logic/expression';

const nodeTypes: NodeTypes = {
  proofNode: ProofNodeComponent,
};

export const ProofCanvas: React.FC = () => {
  const {
    rfNodes, rfEdges, setRfNodes, setRfEdges,
    selectedNodeIds, setSelectedNodeIds, currentLevel,
    proofTree, addProofNode
  } = useProof();

const onNodesChange = useCallback((changes: any) => {
    setRfNodes((nds: Node[]) => {
      const next = [...nds];
      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          const idx = next.findIndex(n => n.id === change.id);
          if (idx !== -1) next[idx] = { ...next[idx], position: change.position };
        }
        // Selection is handled manually via onNodeClick and onPaneClick
        // to allow multi-select by just clicking nodes
      }
      return next;
    });
  }, [setRfNodes]);

  const onEdgesChange = useCallback((changes: any) => {
    setRfEdges((eds: Edge[]) => {
      const next = [...eds];
      for (const change of changes) {
        if (change.type === 'select') {
          const idx = next.findIndex(e => e.id === change.id);
          if (idx !== -1) next[idx] = { ...next[idx], selected: change.selected };
        }
      }
      return next;
    });
  }, [setRfEdges]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeIds(params.nodes.map(n => n.id));
  }, [setSelectedNodeIds]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Intercept click to toggle selection manually
    setRfNodes((nds) => {
      return nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, selected: !n.selected };
        }
        return n; // Keep others as they are
      });
    });
  }, [setRfNodes]);

  const onPaneClick = useCallback(() => {
    setRfNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
  }, [setRfNodes]);

  const mpSuggestion = useMemo(() => {
    if (selectedNodeIds.length !== 2) return null;
    const a = proofTree.nodes.get(selectedNodeIds[0]);
    const b = proofTree.nodes.get(selectedNodeIds[1]);
    if (!a || !b) return null;

    if (b.formula.kind === 'implies' && formulasEqual(b.formula.left, a.formula)) {
      return { premiseA: a.id, premiseB: b.id, conclusion: b.formula.right };
    }
    if (a.formula.kind === 'implies' && formulasEqual(a.formula.left, b.formula)) {
      return { premiseA: b.id, premiseB: a.id, conclusion: a.formula.right };
    }
    return null;
  }, [selectedNodeIds, proofTree.nodes]);

  const handleApplyMP = () => {
    if (!mpSuggestion) return;
    const { premiseA, premiseB, conclusion } = mpSuggestion;
    const node = proofTree.addMP(conclusion, premiseA, premiseB);
    addProofNode(node);

    const nA = rfNodes.find(n => n.id === premiseA);
    const nB = rfNodes.find(n => n.id === premiseB);
    const x = ((nA?.position?.x || 0) + (nB?.position?.x || 0)) / 2;
    const y = Math.max(nA?.position?.y || 0, nB?.position?.y || 0) + 120;

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
    const newEdges: Edge[] = [
      { id: `e-${premiseA}-${node.id}`, source: premiseA, target: node.id },
      { id: `e-${premiseB}-${node.id}`, source: premiseB, target: node.id },
    ];
    setRfNodes(prev => [...prev, newRfNode]);
    setRfEdges(prev => [...prev, ...newEdges]);
    setSelectedNodeIds([]);
  };

  return (
    <div style={{ flex: 1, height: '100%', position: 'relative' }}>
      {!currentLevel && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10,
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center', padding: '40px 60px',
            background: 'rgba(17, 17, 17, 0.9)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🧩</div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Hilbert Proof Game
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              左上のレベル選択からゲームを開始してください
            </div>
          </div>
        </div>
      )}

      {mpSuggestion && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'var(--bg-card)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--accent-green)',
          boxShadow: '0 8px 32px rgba(131, 193, 103, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>条件を満たしています</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-green)' }}>Modus Ponens (MP) が適用可能です</div>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#111' }}
            onClick={handleApplyMP}
          >
            ⚡ MPを適用
          </button>
        </div>
      )}

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        multiSelectionKeyCode={null}
        deleteKeyCode={null}
        style={{ background: 'var(--bg-primary)' }}
        defaultEdgeOptions={{
          type: 'step',
          animated: false,
          style: { stroke: 'rgba(88,196,221,0.35)', strokeWidth: 1.5 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(88, 196, 221, 0.08)"
        />
        <Controls
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
      </ReactFlow>
    </div>
  );
};
