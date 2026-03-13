import { Formula, formulasEqual } from './expression';
import type { AxiomName } from './axioms';

// ===== Rule Types =====
export type RuleType = AxiomName | 'MP' | 'Gen' | 'Premise';

// ===== Proof Node =====
export interface ProofNode {
  id: string;
  formula: Formula;
  rule: RuleType;
  /** IDs of premise nodes used to derive this */
  premiseIds: string[];
  /** For Gen: the variable that was generalized */
  genVariable?: string;
  /** Set of assumption formula IDs (non-axiomatic premises) in the derivation path */
  assumptionIds: Set<string>;
}

// ===== Proof Tree =====
export class ProofTree {
  nodes: Map<string, ProofNode> = new Map();
  private nextId = 1;

  generateId(): string {
    return `node_${this.nextId++}`;
  }

  addAxiom(formula: Formula, rule: AxiomName): ProofNode {
    const node: ProofNode = {
      id: this.generateId(),
      formula,
      rule,
      premiseIds: [],
      assumptionIds: new Set(),
    };
    this.nodes.set(node.id, node);
    return node;
  }

  addPremise(formula: Formula): ProofNode {
    const id = this.generateId();
    const node: ProofNode = {
      id,
      formula,
      rule: 'Premise',
      premiseIds: [],
      assumptionIds: new Set([id]),
    };
    this.nodes.set(node.id, node);
    return node;
  }

  addMP(conclusionFormula: Formula, premiseAId: string, premiseBId: string): ProofNode {
    const a = this.nodes.get(premiseAId);
    const b = this.nodes.get(premiseBId);
    if (!a || !b) throw new Error('Premise node not found');

    const combined = new Set<string>();
    for (const x of a.assumptionIds) combined.add(x);
    for (const x of b.assumptionIds) combined.add(x);

    const node: ProofNode = {
      id: this.generateId(),
      formula: conclusionFormula,
      rule: 'MP',
      premiseIds: [premiseAId, premiseBId],
      assumptionIds: combined,
    };
    this.nodes.set(node.id, node);
    return node;
  }

  addGen(conclusionFormula: Formula, premiseId: string, variable: string): ProofNode {
    const premise = this.nodes.get(premiseId);
    if (!premise) throw new Error('Premise node not found');

    const node: ProofNode = {
      id: this.generateId(),
      formula: conclusionFormula,
      rule: 'Gen',
      premiseIds: [premiseId],
      genVariable: variable,
      assumptionIds: new Set(premise.assumptionIds),
    };
    this.nodes.set(node.id, node);
    return node;
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
  }

  /** Check if target theorem is proven */
  isProven(target: Formula): ProofNode | undefined {
    for (const node of this.nodes.values()) {
      if (formulasEqual(node.formula, target)) {
        return node;
      }
    }
    return undefined;
  }

  /** Get all assumption formulas for a node */
  getAssumptions(nodeId: string): Formula[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];
    const result: Formula[] = [];
    for (const aId of node.assumptionIds) {
      const aNode = this.nodes.get(aId);
      if (aNode) result.push(aNode.formula);
    }
    return result;
  }

  clear(): void {
    this.nodes.clear();
    this.nextId = 1;
  }
}
