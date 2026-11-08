import React, { useState } from 'react';
import type { ActiveTab, BoardTheme } from './types/chess';
import { PlayView } from './views/PlayView';
import { PuzzlesView } from './views/PuzzlesView';
import { AnalysisView } from './views/AnalysisView';
import { SettingsView } from './views/SettingsView';
import { Gamepad2, Puzzle, LineChart, Settings } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('play');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('green');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [analysisPgn, setAnalysisPgn] = useState<string | undefined>(undefined);

  const handleAnalyzeFromGame = (pgn: string) => {
    setAnalysisPgn(pgn);
    setActiveTab('analysis');
  };

  const navItems = [
    { id: 'play' as ActiveTab, label: 'Gioca', icon: Gamepad2 },
    { id: 'puzzles' as ActiveTab, label: 'Problemi', icon: Puzzle },
    { id: 'analysis' as ActiveTab, label: 'Analisi', icon: LineChart },
    { id: 'settings' as ActiveTab, label: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#302e2b] text-white overflow-hidden select-none font-sans">
      {/* Top Mobile App Bar */}
      <header className="h-12 bg-[#262522] border-b border-[#3d3b37] px-4 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="w-7 h-7 rounded-lg bg-[#81b64c] flex items-center justify-center text-base font-black shadow-sm text-[#262522]">
            ♟
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight leading-none text-white">
              LocalMint <span className="text-[#81b64c]">Chess</span>
            </h1>
            <span className="text-[9px] text-[#8b8987] font-semibold tracking-wider uppercase">
              Stockfish NNUE Offline
            </span>
          </div>
        </div>

        {/* Engine status pill */}
        <div className="flex items-center gap-1.5 bg-[#302e2b] px-2.5 py-1 rounded-full border border-[#3d3b37]">
          <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#c3c1be]">Locale 100%</span>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'play' && (
          <PlayView onAnalyzeGame={handleAnalyzeFromGame} boardTheme={boardTheme} />
        )}
        {activeTab === 'puzzles' && <PuzzlesView boardTheme={boardTheme} />}
        {activeTab === 'analysis' && (
          <AnalysisView initialPgn={analysisPgn} boardTheme={boardTheme} />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            boardTheme={boardTheme}
            onThemeChange={setBoardTheme}
            soundEnabled={soundEnabled}
            onSoundChange={setSoundEnabled}
          />
        )}
      </main>

      {/* Bottom Navigation Bar (Authentic Chess.com Mobile Style) */}
      <nav className="h-14 bg-[#21201d] border-t border-[#3d3b37] px-2 flex items-center justify-around shrink-0 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer relative ${
                isActive ? 'text-[#81b64c]' : 'text-[#8b8987] hover:text-[#c3c1be]'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-[#81b64c] rounded-full shadow-xs" />
              )}
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
