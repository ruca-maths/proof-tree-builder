import React, { useState } from 'react';
import { TexString } from './FormulaDisplay';

interface Genre {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  available: boolean;
  exampleTeX: string;
  levelCount: number;
}

const GENRES: Genre[] = [
  {
    id: 'logic',
    title: '命題・述語論理',
    subtitle: 'Propositional & Predicate Logic',
    description: 'ヒルベルト流の公理系を用いて、同一律・三段論法・対偶などの基本定理を証明します。',
    icon: '∀',
    available: true,
    exampleTeX: 'P \\to P',
    levelCount: 4,
  },
  {
    id: 'group',
    title: '群論',
    subtitle: 'Group Theory',
    description: '群の公理から出発し、単位元の一意性や逆元の性質などを形式的に導きます。',
    icon: '∘',
    available: false,
    exampleTeX: 'e \\cdot a = a',
    levelCount: 0,
  },
  {
    id: 'set',
    title: '集合論',
    subtitle: 'Set Theory',
    description: 'ZF公理系をベースに、冪集合・和集合・選択公理などに関する定理を扱います。',
    icon: '∈',
    available: false,
    exampleTeX: 'A \\subseteq B \\to A \\cup B = B',
    levelCount: 0,
  },
];

interface HomeProps {
  onSelectGenre: (genreId: string) => void;
}

type Tab = 'genres' | 'howto' | 'reference';

export const Home: React.FC<HomeProps> = ({ onSelectGenre }) => {
  const [activeTab, setActiveTab] = useState<Tab>('genres');

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Compact Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid lines decorative */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(88,196,221,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(88,196,221,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        {/* Logo mark */}
        <div style={{
          width: 48, height: 48, flexShrink: 0,
          background: 'rgba(88,196,221,0.1)',
          border: '1.5px solid rgba(88,196,221,0.35)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          📐
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
            color: 'var(--accent-blue)', letterSpacing: '0.12em',
            opacity: 0.8, marginBottom: 2,
          }}>
            PROOF TREE BUILDER
          </div>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--accent-blue))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            形式的証明パズル
          </h1>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0',
          }}>
            公理と推論規則を使い、数学の定理をゼロから証明しよう
          </p>
        </div>

        <div style={{
          padding: '8px 18px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          fontSize: '1rem',
        }}>
          <TexString tex="\varphi \to (\psi \to \varphi)" size="md" />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
        padding: '0 40px',
      }}>
        {([
          { id: 'genres', label: '🎮 ジャンル選択' },
          { id: 'howto', label: '📖 遊び方' },
          { id: 'reference', label: '🔣 記号コマンド' },
        ] as { id: Tab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.id
                ? '2px solid var(--accent-blue)'
                : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-dim)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px' }}>
        {activeTab === 'genres' && (
          <GenresTab onSelectGenre={onSelectGenre} />
        )}
        {activeTab === 'howto' && <HowToPlay />}
        {activeTab === 'reference' && <SymbolReference />}
      </div>
    </div>
  );
};

/* ── Genre Tab ─────────────────────────────────── */
const GenresTab: React.FC<{ onSelectGenre: (id: string) => void }> = ({ onSelectGenre }) => (
  <div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 0, marginBottom: 20 }}>
      挑戦するジャンルを選んでください。
    </p>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 16,
    }}>
      {GENRES.map(genre => (
        <GenreCard key={genre.id} genre={genre} onSelect={() => genre.available && onSelectGenre(genre.id)} />
      ))}
    </div>
  </div>
);

const GenreCard: React.FC<{ genre: Genre; onSelect: () => void }> = ({ genre, onSelect }) => (
  <div
    onClick={onSelect}
    style={{
      background: 'var(--bg-card)',
      border: `1.5px solid ${genre.available ? 'var(--border-color)' : 'rgba(255,255,255,0.05)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '22px 22px 18px',
      cursor: genre.available ? 'pointer' : 'default',
      opacity: genre.available ? 1 : 0.45,
      transition: 'all 0.25s ease',
      position: 'relative',
    }}
    onMouseEnter={e => {
      if (!genre.available) return;
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = 'translateY(-3px)';
      el.style.borderColor = 'var(--accent-blue)';
      el.style.boxShadow = '0 8px 28px rgba(88,196,221,0.12)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform = '';
      el.style.borderColor = genre.available ? 'var(--border-color)' : 'rgba(255,255,255,0.05)';
      el.style.boxShadow = '';
    }}
  >
    {!genre.available && (
      <div style={{
        position: 'absolute', top: 12, right: 12,
        padding: '2px 7px', background: 'rgba(255,255,255,0.07)',
        borderRadius: 8, fontSize: '0.6rem',
        color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
      }}>COMING SOON</div>
    )}
    {genre.available && (
      <div style={{
        position: 'absolute', top: 12, right: 12,
        padding: '2px 7px',
        background: 'rgba(131,193,103,0.12)',
        border: '1px solid rgba(131,193,103,0.3)',
        borderRadius: 8, fontSize: '0.6rem',
        color: 'var(--accent-green)', fontFamily: 'var(--font-mono)',
      }}>{genre.levelCount} LEVELS</div>
    )}

    <div style={{
      width: 44, height: 44,
      background: 'rgba(88,196,221,0.08)',
      border: '1px solid rgba(88,196,221,0.2)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem', marginBottom: 12,
      color: 'var(--accent-blue)',
    }}>{genre.icon}</div>

    <h3 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 700 }}>{genre.title}</h3>
    <div style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
      {genre.subtitle}
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, margin: '0 0 14px' }}>
      {genre.description}
    </p>
    <div style={{
      padding: '6px 12px', background: 'rgba(0,0,0,0.2)',
      borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)',
      display: 'inline-block',
    }}>
      <TexString tex={`\\text{例: }${genre.exampleTeX}`} size="sm" />
    </div>
  </div>
);

/* ── How to Play Tab ─────────────────────────────── */
const HowToPlay: React.FC = () => {
  const steps = [
    {
      title: '公理を具体化する',
      detail: '左ツールボックスの Ax1 〜 Ax5 をクリックするとモーダルが開きます。式 φ・ψ などのメタ変数に具体的な論理式を入力して「追加」すると、キャンバスにノードが現れます。',
      tex: '\\varphi \\to (\\psi \\to \\varphi)',
    },
    {
      title: 'ノードを選択する',
      detail: 'ノードを1回クリックすると選択（青枠）、再クリックで解除。複数ノードを選ぶにはクリックを繰り返すだけ。Shift + ドラッグで矩形選択も可能。',
      tex: null,
    },
    {
      title: 'MP（Modus Ponens）を適用する',
      detail: 'φ のノードと φ→ψ のノードを両方選択した状態で「⚡ MP 適用」ボタンを押すと、結論 ψ の新ノードが生成されます。',
      tex: '\\dfrac{\\varphi \\quad \\varphi \\to \\psi}{\\psi} \\text{ MP}',
    },
    {
      title: 'Gen（一般化）を適用する',
      detail: 'φ(x) のノードを1つ選択し、変数欄に x を入力して「Gen」ボタンを押すと ∀x φ(x) が得られます。固有変数条件を自動チェックします。',
      tex: '\\dfrac{\\varphi(x)}{\\forall x\\,\\varphi(x)} \\text{ Gen}',
    },
    {
      title: '証明を完成させる',
      detail: '目標定理と一致するノードが完成したら「✓ 証明を検証」を押してください。成功すると証明木全体をbussproofs形式で確認できます。',
      tex: null,
    },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 20px', color: 'var(--accent-blue)' }}>
        遊び方 / How to Play
      </h2>

      {/* Proof definition */}
      <div style={{
        padding: '16px 20px', background: 'var(--bg-card)',
        border: '1px solid rgba(88,196,221,0.2)', borderRadius: 'var(--radius-md)',
        marginBottom: 24, fontSize: '0.85rem', lineHeight: 1.7,
        color: 'var(--text-secondary)',
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>【証明とは？】</strong><br />
        ヒルベルト流の形式的証明では、公理から始めてModus Ponens（MP）およびGeneralization（Gen）という2つの推論規則のみを使って新しい式を導きます。
        「証明木」とは、結論（定理）を根に持ち、前提（公理など）を葉に持つ木構造です。<br /><br />
        <strong style={{ color: 'var(--text-primary)' }}>【公理（Ax1〜Ax5）】</strong><br />
        どんな論理式でも成り立つ真実の型（スキーマ）。φ・ψ・ρなどのメタ変数に任意の式を代入して使います。
      </div>

      {/* Axiom list */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 8, marginBottom: 28,
      }}>
        {[
          { name: 'Ax1', tex: '\\varphi \\to (\\psi \\to \\varphi)' },
          { name: 'Ax2', tex: '(\\varphi \\to (\\psi \\to \\rho)) \\to ((\\varphi \\to \\psi) \\to (\\varphi \\to \\rho))' },
          { name: 'Ax3', tex: '(\\neg\\varphi \\to \\neg\\psi) \\to (\\psi \\to \\varphi)' },
          { name: 'Ax4', tex: '\\forall x\\,\\varphi(x) \\to \\varphi(t)' },
          { name: 'Ax5', tex: '\\forall x(\\varphi \\to \\psi(x)) \\to (\\varphi \\to \\forall x\\,\\psi(x))' },
        ].map(ax => (
          <div key={ax.name} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '8px 12px', background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-sm)', border: '1px solid rgba(88,196,221,0.1)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
              color: 'var(--accent-blue)', background: 'rgba(88,196,221,0.1)',
              padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 2,
            }}>{ax.name}</span>
            <TexString tex={ax.tex} size="sm" />
          </div>
        ))}
      </div>

      {/* Steps */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 14px', color: 'var(--text-secondary)' }}>
        手順
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{
            display: 'flex', gap: 16,
            padding: '16px 0',
            borderBottom: idx < steps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{
              width: 30, height: 30, flexShrink: 0,
              background: 'rgba(88,196,221,0.1)', border: '1px solid rgba(88,196,221,0.25)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-blue)',
            }}>{idx + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>{step.title}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.65, margin: 0 }}>
                {step.detail}
              </p>
              {step.tex && (
                <div style={{
                  marginTop: 10, padding: '8px 16px',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)', display: 'inline-block',
                }}>
                  <TexString tex={step.tex} size="sm" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Symbol Reference Tab ─────────────────────── */
const SymbolReference: React.FC = () => {
  const symbols = [
    { symbol: '→', name: '含意（ならば）', cmd: '-> または →', tex: 'P \\to Q', desc: 'PならばQ。入力: -> または →' },
    { symbol: '¬', name: '否定（でない）', cmd: '~ または ¬', tex: '\\neg P', desc: 'Pでない。入力: ~ または ¬' },
    { symbol: '∀', name: '全称量化子', cmd: 'forall または ∀', tex: '\\forall x\\, P(x)', desc: 'すべてのxについてP。入力: forall x P(x)' },
    { symbol: '∨', name: '論理和（または）', cmd: '|', tex: 'P \\lor Q', desc: 'PまたはQ（略記: ¬P→Q）。入力: |' },
    { symbol: '∧', name: '論理積（かつ）', cmd: '&', tex: 'P \\land Q', desc: 'PかつQ（略記: ¬(¬P→¬Q)）。入力: &' },
    { symbol: '↔', name: '双条件（同値）', cmd: '<->', tex: 'P \\leftrightarrow Q', desc: 'PとQは同値。入力: <->' },
    { symbol: '∃', name: '存在量化子', cmd: 'exists または ∃', tex: '\\exists x\\, P(x)', desc: 'あるxについてP（略記: ¬∀x¬P）。入力: exists x P(x)' },
  ];

  const metaVars = [
    { name: 'φ (phi)', cmd: 'phi または φ', tex: '\\varphi', desc: '論理式を表すメタ変数' },
    { name: 'ψ (psi)', cmd: 'psi または ψ', tex: '\\psi', desc: '論理式を表すメタ変数' },
    { name: 'ρ (rho)', cmd: 'rho または ρ', tex: '\\rho', desc: '論理式を表すメタ変数' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 20px', color: 'var(--accent-blue)' }}>
        論理記号 入力コマンド
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginTop: 0, marginBottom: 20, lineHeight: 1.6 }}>
        公理具体化モーダルの入力欄では、以下のコマンドで数式を入力できます。<br />
        括弧 <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>(  )</code> を使って優先順位を明示すると解析エラーを防げます。
      </p>

      <h3 style={{ fontSize: '0.85rem', margin: '0 0 10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
        論理記号
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 28 }}>
        {symbols.map(s => (
          <div key={s.symbol} style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 140px 1fr',
            gap: '0 16px',
            padding: '10px 14px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            alignItems: 'center',
            fontSize: '0.82rem',
          }}>
            <div style={{ fontSize: '1.1rem', textAlign: 'center', color: 'var(--accent-yellow)' }}>
              {s.symbol}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 1 }}>{s.name}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{s.desc}</div>
            </div>
            <div>
              <code style={{
                background: 'rgba(88,196,221,0.1)',
                border: '1px solid rgba(88,196,221,0.2)',
                padding: '2px 8px', borderRadius: 4,
                fontSize: '0.78rem',
                color: 'var(--accent-blue)',
                fontFamily: 'var(--font-mono)',
              }}>{s.cmd}</code>
            </div>
            <div>
              <TexString tex={s.tex} size="sm" />
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '0.85rem', margin: '0 0 10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
        メタ変数
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 28 }}>
        {metaVars.map(v => (
          <div key={v.name} style={{
            display: 'grid',
            gridTemplateColumns: '80px 120px 80px',
            gap: '0 16px',
            padding: '10px 14px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            alignItems: 'center',
            fontSize: '0.82rem',
          }}>
            <div style={{ fontWeight: 600 }}>{v.name}</div>
            <code style={{
              background: 'rgba(88,196,221,0.1)',
              border: '1px solid rgba(88,196,221,0.2)',
              padding: '2px 8px', borderRadius: 4,
              fontSize: '0.78rem', color: 'var(--accent-blue)',
              fontFamily: 'var(--font-mono)',
            }}>{v.cmd}</code>
            <TexString tex={v.tex} size="sm" />
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '0.85rem', margin: '0 0 10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
        入力例
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { input: 'P -> Q', result: 'P \\to Q' },
          { input: '(P -> Q) -> P', result: '(P \\to Q) \\to P' },
          { input: '~P -> ~~P', result: '\\neg P \\to \\neg\\neg P' },
          { input: 'forall x P(x) -> P(t)', result: '\\forall x\\, P(x) \\to P(t)' },
          { input: 'P | Q', result: 'P \\lor Q' },
          { input: 'P & Q', result: 'P \\land Q' },
        ].map(ex => (
          <div key={ex.input} style={{
            display: 'flex', gap: 16, alignItems: 'center',
            padding: '8px 14px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <code style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              color: 'var(--accent-yellow)', minWidth: 180,
            }}>{ex.input}</code>
            <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>→</span>
            <TexString tex={ex.result} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
};
