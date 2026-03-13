// ===== Term (項) =====
export type Term =
  | { kind: 'var'; name: string }
  | { kind: 'func'; name: string; args: Term[] };

// ===== Formula (論理式) =====
export type Formula =
  | { kind: 'pred'; name: string; args: Term[] }
  | { kind: 'not'; sub: Formula }
  | { kind: 'implies'; left: Formula; right: Formula }
  | { kind: 'or'; left: Formula; right: Formula }
  | { kind: 'and'; left: Formula; right: Formula }
  | { kind: 'iff'; left: Formula; right: Formula }
  | { kind: 'forall'; variable: string; sub: Formula }
  | { kind: 'exists'; variable: string; sub: Formula }
  | { kind: 'meta'; name: string };

// ===== Constructors =====
export const Var = (name: string): Term => ({ kind: 'var', name });
export const Func = (name: string, args: Term[]): Term => ({ kind: 'func', name, args });
export const Pred = (name: string, args: Term[]): Formula => ({ kind: 'pred', name, args });
export const Not = (sub: Formula): Formula => ({ kind: 'not', sub });
export const Implies = (left: Formula, right: Formula): Formula => ({ kind: 'implies', left, right });
export const Or = (left: Formula, right: Formula): Formula => ({ kind: 'or', left, right });
export const And = (left: Formula, right: Formula): Formula => ({ kind: 'and', left, right });
export const Iff = (left: Formula, right: Formula): Formula => ({ kind: 'iff', left, right });
export const Forall = (variable: string, sub: Formula): Formula => ({ kind: 'forall', variable, sub });
export const Exists = (variable: string, sub: Formula): Formula => ({ kind: 'exists', variable, sub });
export const Meta = (name: string): Formula => ({ kind: 'meta', name });

// ===== Free Variables =====
export function freeVarsInTerm(t: Term): Set<string> {
  if (t.kind === 'var') return new Set([t.name]);
  const result = new Set<string>();
  for (const arg of t.args) for (const v of freeVarsInTerm(arg)) result.add(v);
  return result;
}

export function freeVars(f: Formula): Set<string> {
  switch (f.kind) {
    case 'pred': {
      const result = new Set<string>();
      for (const arg of f.args) for (const v of freeVarsInTerm(arg)) result.add(v);
      return result;
    }
    case 'not': return freeVars(f.sub);
    case 'implies':
    case 'or':
    case 'and':
    case 'iff': {
      const s = freeVars(f.left);
      for (const v of freeVars(f.right)) s.add(v);
      return s;
    }
    case 'forall':
    case 'exists': {
      const s = freeVars(f.sub);
      s.delete(f.variable);
      return s;
    }
    case 'meta': return new Set();
  }
}

// ===== Substitution (項の代入) =====
export function substituteTerm(t: Term, varName: string, replacement: Term): Term {
  if (t.kind === 'var') return t.name === varName ? replacement : t;
  return Func(t.name, t.args.map(a => substituteTerm(a, varName, replacement)));
}

function freshVar(base: string, ...sets: Set<string>[]): string {
  const all = new Set<string>();
  for (const s of sets) for (const v of s) all.add(v);
  let c = base + "'";
  while (all.has(c)) c += "'";
  return c;
}

export function substitute(f: Formula, varName: string, replacement: Term): Formula {
  switch (f.kind) {
    case 'pred': return Pred(f.name, f.args.map(a => substituteTerm(a, varName, replacement)));
    case 'not': return Not(substitute(f.sub, varName, replacement));
    case 'implies': return Implies(substitute(f.left, varName, replacement), substitute(f.right, varName, replacement));
    case 'or': return Or(substitute(f.left, varName, replacement), substitute(f.right, varName, replacement));
    case 'and': return And(substitute(f.left, varName, replacement), substitute(f.right, varName, replacement));
    case 'iff': return Iff(substitute(f.left, varName, replacement), substitute(f.right, varName, replacement));
    case 'forall': {
      if (f.variable === varName) return f;
      if (freeVarsInTerm(replacement).has(f.variable)) {
        const nv = freshVar(f.variable, freeVars(f.sub), freeVarsInTerm(replacement));
        return Forall(nv, substitute(substitute(f.sub, f.variable, Var(nv)), varName, replacement));
      }
      return Forall(f.variable, substitute(f.sub, varName, replacement));
    }
    case 'exists': {
      if (f.variable === varName) return f;
      if (freeVarsInTerm(replacement).has(f.variable)) {
        const nv = freshVar(f.variable, freeVars(f.sub), freeVarsInTerm(replacement));
        return Exists(nv, substitute(substitute(f.sub, f.variable, Var(nv)), varName, replacement));
      }
      return Exists(f.variable, substitute(f.sub, varName, replacement));
    }
    case 'meta': return f;
  }
}

// ===== Meta-variable Instantiation =====
export function instantiate(f: Formula, bindings: Map<string, Formula>): Formula {
  switch (f.kind) {
    case 'pred': return f;
    case 'not': return Not(instantiate(f.sub, bindings));
    case 'implies': return Implies(instantiate(f.left, bindings), instantiate(f.right, bindings));
    case 'or': return Or(instantiate(f.left, bindings), instantiate(f.right, bindings));
    case 'and': return And(instantiate(f.left, bindings), instantiate(f.right, bindings));
    case 'iff': return Iff(instantiate(f.left, bindings), instantiate(f.right, bindings));
    case 'forall': return Forall(f.variable, instantiate(f.sub, bindings));
    case 'exists': return Exists(f.variable, instantiate(f.sub, bindings));
    case 'meta': return bindings.get(f.name) ?? f;
  }
}

// ===== Structural Equality =====
export function termsEqual(a: Term, b: Term): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'var' && b.kind === 'var') return a.name === b.name;
  if (a.kind === 'func' && b.kind === 'func')
    return a.name === b.name && a.args.length === b.args.length && a.args.every((x, i) => termsEqual(x, b.args[i]));
  return false;
}

export function formulasEqual(a: Formula, b: Formula): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'pred': return b.kind === 'pred' && a.name === b.name && a.args.length === b.args.length && a.args.every((x, i) => termsEqual(x, (b as typeof a).args[i]));
    case 'not': return b.kind === 'not' && formulasEqual(a.sub, b.sub);
    case 'implies': return b.kind === 'implies' && formulasEqual(a.left, b.left) && formulasEqual(a.right, b.right);
    case 'or': return b.kind === 'or' && formulasEqual(a.left, b.left) && formulasEqual(a.right, b.right);
    case 'and': return b.kind === 'and' && formulasEqual(a.left, b.left) && formulasEqual(a.right, b.right);
    case 'iff': return b.kind === 'iff' && formulasEqual(a.left, b.left) && formulasEqual(a.right, b.right);
    case 'forall': return b.kind === 'forall' && a.variable === b.variable && formulasEqual(a.sub, b.sub);
    case 'exists': return b.kind === 'exists' && a.variable === b.variable && formulasEqual(a.sub, b.sub);
    case 'meta': return b.kind === 'meta' && a.name === b.name;
  }
}

// ===== TeX Conversion =====
export function termToTeX(t: Term): string {
  if (t.kind === 'var') return t.name;
  if (t.args.length === 0) return t.name;
  return `${t.name}(${t.args.map(termToTeX).join(', ')})`;
}

const GREEK: Record<string, string> = {
  'φ': '\\varphi', 'ψ': '\\psi', 'ρ': '\\rho', 'χ': '\\chi',
  'σ': '\\sigma', 'τ': '\\tau', 'α': '\\alpha', 'β': '\\beta',
};

function texName(s: string): string { return GREEK[s] ?? s; }

function needsParens(f: Formula, parentKind: 'implies-left' | 'implies-right' | 'not' | 'or' | 'and' | 'iff' | 'none'): boolean {
  if (f.kind === 'implies' || f.kind === 'or' || f.kind === 'and' || f.kind === 'iff') {
    return parentKind !== 'none';
  }
  return false;
}

function wrap(f: Formula, ctx: 'implies-left' | 'implies-right' | 'not' | 'or' | 'and' | 'iff' | 'none'): string {
  const s = formulaToTeX(f);
  return needsParens(f, ctx) ? `(${s})` : s;
}

export function formulaToTeX(f: Formula, _abbreviate: boolean = true): string {
  switch (f.kind) {
    case 'pred': {
      if (f.name === '=' && f.args.length === 2) return `${termToTeX(f.args[0])} = ${termToTeX(f.args[1])}`;
      if (f.name === '∈' && f.args.length === 2) return `${termToTeX(f.args[0])} \\in ${termToTeX(f.args[1])}`;
      if (f.args.length === 0) return texName(f.name);
      return `${texName(f.name)}(${f.args.map(termToTeX).join(', ')})`;
    }
    case 'not': return `\\neg ${wrap(f.sub, 'not')}`;
    case 'implies': return `${wrap(f.left, 'implies-left')} \\to ${wrap(f.right, 'implies-right')}`;
    case 'or': return `${wrap(f.left, 'or')} \\lor ${wrap(f.right, 'or')}`;
    case 'and': return `${wrap(f.left, 'and')} \\land ${wrap(f.right, 'and')}`;
    case 'iff': return `${wrap(f.left, 'iff')} \\leftrightarrow ${wrap(f.right, 'iff')}`;
    case 'forall': return `\\forall ${f.variable} \\, ${formulaToTeX(f.sub)}`;
    case 'exists': return `\\exists ${f.variable} \\, ${formulaToTeX(f.sub)}`;
    case 'meta': return texName(f.name);
  }
}
