import { Formula, Forall, formulasEqual, freeVars } from './expression';

/**
 * Modus Ponens: φ と φ→ψ から ψ を導出
 * どちらの引数がどちらの役割かを自動判定する
 */
export function applyMP(
  a: Formula,
  b: Formula
): { result: Formula; major: 'a' | 'b' } | { error: string } {
  // Try a = φ→ψ, b = φ
  if (a.kind === 'implies' && formulasEqual(a.left, b)) {
    return { result: a.right, major: 'a' };
  }
  // Try b = φ→ψ, a = φ
  if (b.kind === 'implies' && formulasEqual(b.left, a)) {
    return { result: b.right, major: 'b' };
  }
  return { error: 'MP を適用できません。一方が φ、他方が φ→ψ の形である必要があります。' };
}

/**
 * Generalization: φ(x) から ∀x φ(x) を導出
 * 固有変数条件: x は前提集合Γのどの式にも自由変数として現れてはならない
 *
 * @param phi - 一般化する式
 * @param x - 束縛する変数
 * @param assumptions - この式を導出するのに使った前提（公理を除く）の式の配列
 */
export function applyGen(
  phi: Formula,
  x: string,
  assumptions: Formula[]
): { result: Formula } | { error: string } {
  // Check x is free in phi (otherwise Gen is vacuous but still valid)
  // Actually, Gen is valid even if x is not free in phi (it would create ∀x φ where x doesn't appear)
  // But we can warn the user

  // Check eigenvariable condition
  for (const gamma of assumptions) {
    if (freeVars(gamma).has(x)) {
      return {
        error: `固有変数条件に違反: 変数 ${x} は前提に自由変数として現れています。Gen を適用できません。`
      };
    }
  }

  return { result: Forall(x, phi) };
}
