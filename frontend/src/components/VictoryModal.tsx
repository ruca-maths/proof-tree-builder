import React, { useEffect, useState } from 'react';
import { useProof } from '../context/ProofContext';
import { ProofTreeViewer } from './ProofTreeViewer';

export const VictoryModal: React.FC = () => {
  const { isVictory, currentLevel, proofTree, isTreeViewerOpen, setIsTreeViewerOpen } = useProof();
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; y: number; color: string; size: number;
    vx: number; vy: number; rotation: number;
  }>>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isVictory) { setParticles([]); setVisible(false); return; }
    const colors = ['#58c4dd', '#ffff00', '#83c167', '#fc6255', '#ff8c00', '#b48ead', '#ff6b9d'];
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random() * 3,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
    setIsTreeViewerOpen(false);
    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
    }, 1500); // Wait 1.5 seconds then hide modal
    return () => clearTimeout(t);
  }, [isVictory, setIsTreeViewerOpen]);

  // If not victory at all, don't render anything
  if (!isVictory) return null;

  // Find the root node
  const usedAsPremise = new Set<string>();
  for (const node of proofTree.nodes.values()) {
    for (const pid of node.premiseIds) usedAsPremise.add(pid);
  }
  const rootNodes = [...proofTree.nodes.keys()].filter(id => !usedAsPremise.has(id));
  const rootNodeId = rootNodes[0] ?? null;

  return (
    <>
      {/* Victory message popup & particles - only shown for a short time */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: visible ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${3 + Math.random() * 3}s linear ${Math.random() * 1}s forwards`,
            opacity: 0.9,
          }} />
        ))}

        {/* Victory message */}
        <div className="animate-fadeInUp" style={{
          textAlign: 'center',
          padding: '40px 60px',
          background: 'rgba(17, 17, 17, 0.95)',
          border: '2px solid var(--accent-green)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 0 60px rgba(131, 193, 103, 0.3)',
          pointerEvents: 'auto',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
          <h2 style={{ color: 'var(--accent-green)', fontSize: '1.5rem', marginBottom: 8 }}>
            証明完了！
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {currentLevel?.title}
          </p>
          <div style={{
            marginTop: 16, padding: '8px 16px',
            background: 'rgba(131, 193, 103, 0.1)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem', color: 'var(--accent-green)',
            marginBottom: 20,
          }}>
            定理が正しく証明されました ∎
          </div>

          <button
            onClick={() => setIsTreeViewerOpen(true)}
            style={treeButtonStyle}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(88,196,221,0.22)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(88,196,221,0.12)';
            }}
          >
            📐 証明木全体を見る
          </button>
        </div>

        <style>{`
          @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Proof Tree Viewer - stays even if visible is false */}
      <ProofTreeViewer
        isOpen={isTreeViewerOpen}
        onClose={() => setIsTreeViewerOpen(false)}
        nodes={proofTree.nodes}
        rootNodeId={rootNodeId}
      />
    </>
  );
};

const treeButtonStyle: React.CSSProperties = {
  display: 'block', width: '100%',
  padding: '10px 20px',
  background: 'rgba(88,196,221,0.12)',
  border: '1.5px solid var(--accent-blue)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--accent-blue)',
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.2s',
};
