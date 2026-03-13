import { Implies, Not, Pred } from '../logic/expression';
import type { LevelData } from '../context/ProofContext';

const P = Pred('P', []);
const Q = Pred('Q', []);
const R = Pred('R', []);

/**
 * 【問題の追加方法】
 * 以下の BUILTIN_LEVELS 配列に新しいオブジェクトを追加してください。
 * 
 * 形式:
 * {
 *   id: 'unique-id',
 *   title: '問題のタイトル',
 *   targetFormula: 論理式オブジェクト,
 *   targetTeX: '表示用TeX文字列',
 *   premises: [] // （オプション）前提がある場合
 * }
 * 
 * 例: P -> (Q -> P) を追加する場合
 * Implies(P, Implies(Q, P))
 */
export const BUILTIN_LEVELS: LevelData[] = [
  {
    id: 'prop-1',
    title: 'Identity',
    targetFormula: Implies(P, P),
    targetTeX: 'P \\to P',
  },
  {
    id: 'prop-2',
    title: 'Syllogism',
    targetFormula: Implies(Implies(P, Q), Implies(Implies(Q, R), Implies(P, R))),
    targetTeX: '(P \\to Q) \\to ((Q \\to R) \\to (P \\to R))',
  },
];

// 管理パネル廃止に伴い、カスタムレベル（LocalStorage）の読み込みは最小限に留めるか、
// 将来的に完全に廃止することも検討してください。
export function getAllLevels(): LevelData[] {
  return [...BUILTIN_LEVELS];
}

