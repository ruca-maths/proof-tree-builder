import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { ProofProvider } from './context/ProofContext';
import { TargetTheorem } from './components/TargetTheorem';
import { Toolbox } from './components/Toolbox';
import { ProofCanvas } from './components/ProofCanvas';
import { Inspector } from './components/Inspector';
import { LevelSelect } from './components/LevelSelect';
import { VictoryModal } from './components/VictoryModal';
import { Home } from './components/Home';
import './index.css';

type Screen = 'home' | 'game';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const handleSelectGenre = (genreId: string) => {
    if (genreId === 'logic') {
      setScreen('game');
      setShowLevelSelect(true);
    }
  };

  return (
    <ProofProvider>
      <ReactFlowProvider>
        {screen === 'home' ? (
          <Home onSelectGenre={handleSelectGenre} />
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column',
            width: '100vw', height: '100vh',
            overflow: 'hidden',
          }}>
            {/* Top bar: Target + controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <TargetTheorem />
              </div>
              <div style={{
                padding: '0 16px',
                display: 'flex', gap: 8,
                background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                borderBottom: '1px solid var(--border-color)',
                height: '100%', alignItems: 'center',
              }}>
                <button className="btn" onClick={() => setScreen('home')}
                  style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', borderColor: 'rgba(255,255,255,0.15)' }}>
                  🏠 ホーム
                </button>
                <button className="btn" onClick={() => setShowLevelSelect(true)}
                  style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  🧩 レベル選択
                </button>
              </div>
            </div>

            {/* Main 3-pane layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <Toolbox />
              <ProofCanvas />
              <Inspector />
            </div>
          </div>
        )}

        {/* Modals */}
        <LevelSelect
          isOpen={showLevelSelect}
          onClose={() => setShowLevelSelect(false)}
        />
        <VictoryModal />
      </ReactFlowProvider>
    </ProofProvider>
  );
};

export default App;
