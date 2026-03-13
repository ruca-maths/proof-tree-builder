import { Formula, Implies, Not, Forall, Meta, freeVars, substitute, instantiate, Pred } from './expression';
import type { Term } from './expression';

// ===== Axiom Schema Definitions =====

/** Ax1: φ → (ψ → φ) */
export function ax1Schema(): Formula {
  return Implies(Meta('φ'), Implies(Meta('ψ'), Meta('φ')));
}

/** Ax2: (φ → (ψ → ρ)) → ((φ → ψ) → (φ → ρ)) */
export function ax2Schema(): Formula {
  return Implies(
    Implies(Meta('φ'), Implies(Meta('ψ'), Meta('ρ'))),
    Implies(Implies(Meta('φ'), Meta('ψ')), Implies(Meta('φ'), Meta('ρ')))
  );
}

/** Ax3: (¬φ → ¬ψ) → (ψ → φ) */
export function ax3Schema(): Formula {
  return Implies(Implies(Not(Meta('φ')), Not(Meta('ψ'))), Implies(Meta('ψ'), Meta('φ')));
}

/** Ax4: ∀x φ(x) → φ(t) */
export function ax4Schema(): Formula {
  // This is a schema template for display only
  return Implies(
    Forall('x', Pred('φ', [{ kind: 'var', name: 'x' }])),
    Pred('φ', [{ kind: 'var', name: 't' }])
  );
}

/** Ax5: ∀x(φ → ψ(x)) → (φ → ∀x ψ(x)) */
export function ax5Schema(): Formula {
  return Implies(
    Forall('x', Implies(Meta('φ'), Pred('ψ', [{ kind: 'var', name: 'x' }]))),
    Implies(Meta('φ'), Forall('x', Pred('ψ', [{ kind: 'var', name: 'x' }])))
  );
}

// ===== Axiom Instantiation =====

export function instantiateAx1(phi: Formula, psi: Formula): Formula {
  const bindings = new Map<string, Formula>([['φ', phi], ['ψ', psi]]);
  return instantiate(ax1Schema(), bindings);
}

export function instantiateAx2(phi: Formula, psi: Formula, rho: Formula): Formula {
  const bindings = new Map<string, Formula>([['φ', phi], ['ψ', psi], ['ρ', rho]]);
  return instantiate(ax2Schema(), bindings);
}

export function instantiateAx3(phi: Formula, psi: Formula): Formula {
  const bindings = new Map<string, Formula>([['φ', phi], ['ψ', psi]]);
  return instantiate(ax3Schema(), bindings);
}

/** Ax4: ∀x φ(x) → φ(t)
 *  phi: formula containing x as free variable
 *  x: the variable
 *  t: the term to substitute
 */
export function instantiateAx4(phi: Formula, x: string, t: Term): { result: Formula } | { error: string } {
  if (!freeVars(phi).has(x)) {
    return { error: `変数 ${x} は式 φ に自由変数として含まれていません` };
  }
  const phiT = substitute(phi, x, t);
  return { result: Implies(Forall(x, phi), phiT) };
}

/** Ax5: ∀x(φ → ψ(x)) → (φ → ∀x ψ(x))
 *  phi: formula NOT containing x as free variable
 *  psi: formula containing x as free variable
 *  x: the variable
 */
export function instantiateAx5(phi: Formula, psi: Formula, x: string): { result: Formula } | { error: string } {
  if (freeVars(phi).has(x)) {
    return { error: `Ax5: φ は変数 ${x} を自由変数として含んではいけません` };
  }
  if (!freeVars(psi).has(x)) {
    return { error: `Ax5: ψ は変数 ${x} を自由変数として含む必要があります` };
  }
  return {
    result: Implies(
      Forall(x, Implies(phi, psi)),
      Implies(phi, Forall(x, psi))
    )
  };
}

// ===== Axiom Descriptions =====
export type AxiomName = 'Ax1' | 'Ax2' | 'Ax3' | 'Ax4' | 'Ax5';

export interface AxiomInfo {
  name: AxiomName;
  label: string;
  schema: Formula;
  metaVars: string[];
  description: string;
}

export const AXIOM_LIST: AxiomInfo[] = [
  { name: 'Ax1', label: 'Ax1', schema: ax1Schema(), metaVars: ['φ', 'ψ'],
    description: 'φ → (ψ → φ)' },
  { name: 'Ax2', label: 'Ax2', schema: ax2Schema(), metaVars: ['φ', 'ψ', 'ρ'],
    description: '(φ → (ψ → ρ)) → ((φ → ψ) → (φ → ρ))' },
  { name: 'Ax3', label: 'Ax3', schema: ax3Schema(), metaVars: ['φ', 'ψ'],
    description: '(¬φ → ¬ψ) → (ψ → φ)' },
  { name: 'Ax4', label: 'Ax4', schema: ax4Schema(), metaVars: ['φ', 'x', 't'],
    description: '∀x φ(x) → φ(t)' },
  { name: 'Ax5', label: 'Ax5', schema: ax5Schema(), metaVars: ['φ', 'ψ', 'x'],
    description: '∀x(φ → ψ(x)) → (φ → ∀x ψ(x))' },
];
