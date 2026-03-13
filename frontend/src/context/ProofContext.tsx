import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Formula } from '../logic/expression';
import { ProofTree, ProofNode } from '../logic/proof';
import type { Node, Edge } from '@xyflow/react';

export interface LevelData {
  id: string;
  title: string;
  targetFormula: Formula;
  targetTeX: string;
  hint?: string;
  solution?: string[];
  premises?: { formula: Formula; tex: string }[];
  isCustom?: boolean;
}

interface ProofContextType {
  // Level
  currentLevel: LevelData | null;
  setCurrentLevel: (level: LevelData | null) => void;
  completedLevels: Set<string>;
  markLevelComplete: (id: string) => void;

  // Proof tree
  proofTree: ProofTree;
  proofNodes: ProofNode[];
  addProofNode: (node: ProofNode) => void;
  removeProofNode: (id: string) => void;
  clearProof: () => void;

  // React Flow state
  rfNodes: Node[];
  rfEdges: Edge[];
  setRfNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setRfEdges: React.Dispatch<React.SetStateAction<Edge[]>>;

  // Selection
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;

  // Victory
  isVictory: boolean;
  checkVictory: () => boolean;
  isTreeViewerOpen: boolean;
  setIsTreeViewerOpen: (open: boolean) => void;
}

const ProofContext = createContext<ProofContextType | null>(null);

export const useProof = () => {
  const ctx = useContext(ProofContext);
  if (!ctx) throw new Error('useProof must be used within ProofProvider');
  return ctx;
};

const COMPLETED_KEY = 'hilbert_proof_completed';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
}

export const ProofProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const proofTreeRef = useRef(new ProofTree());
  const [proofNodes, setProofNodes] = useState<ProofNode[]>([]);
  const [currentLevel, setCurrentLevel] = useState<LevelData | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(loadCompleted);
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [isVictory, setIsVictory] = useState(false);

  const addProofNode = useCallback((node: ProofNode) => {
    proofTreeRef.current.nodes.set(node.id, node);
    setProofNodes([...proofTreeRef.current.nodes.values()]);
  }, []);

  const removeProofNode = useCallback((id: string) => {
    proofTreeRef.current.removeNode(id);
    setProofNodes([...proofTreeRef.current.nodes.values()]);
    setRfNodes(prev => prev.filter(n => n.id !== id));
    setRfEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
  }, []);

  const clearProof = useCallback(() => {
    proofTreeRef.current.clear();
    setProofNodes([]);
    setRfNodes([]);
    setRfEdges([]);
    setSelectedNodeIds([]);
    setIsVictory(false);
  }, []);

  const markLevelComplete = useCallback((id: string) => {
    setCompletedLevels(prev => {
      const next = new Set(prev);
      next.add(id);
      saveCompleted(next);
      return next;
    });
  }, []);

  const checkVictory = useCallback((): boolean => {
    if (!currentLevel) return false;
    const found = proofTreeRef.current.isProven(currentLevel.targetFormula);
    if (found) {
      setIsVictory(true);
      markLevelComplete(currentLevel.id);
      return true;
    }
    return false;
  }, [currentLevel, markLevelComplete]);

  const [isTreeViewerOpen, setIsTreeViewerOpen] = useState(false);

  return (
    <ProofContext.Provider value={{
      currentLevel, setCurrentLevel, completedLevels, markLevelComplete,
      proofTree: proofTreeRef.current, proofNodes, addProofNode, removeProofNode, clearProof,
      rfNodes, rfEdges, setRfNodes, setRfEdges,
      selectedNodeIds, setSelectedNodeIds,
      isVictory, checkVictory,
      isTreeViewerOpen, setIsTreeViewerOpen,
    }}>
      {children}
    </ProofContext.Provider>
  );
};
