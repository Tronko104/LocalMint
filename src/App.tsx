import React, { useState } from 'react';
import type { ActiveTab, BoardTheme, Language } from './types/chess';
import { getInitialLanguage, translations } from './utils/i18n';
import { HomeView } from './views/HomeView';
import { PlayView } from './views/PlayView';
import { PuzzlesView } from './views/PuzzlesView';
import { AnalysisView } from './views/AnalysisView';
import { SettingsView } from './views/SettingsView';
import { Home, Puzzle, LineChart, Settings } from 'lucide-react';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('green');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [analysisPgn, setAnalysisPgn] = useState<string | undefined>(undefined);
  const [selectedBotId, setSelectedBotId] = useState<string | undefined>(undefined);

  const t = translations[language];

  const handleStartGame = (botId?: string) => {
    setSelectedBotId(botId);
    setActiveTab('play');
  };

  const handleBackToHome = () => {
    setActiveTab('home');
  };

  const handleAnalyzeFromGame = (pgn: string) => {
    setAnalysisPgn(pgn);
    setActiveTab('analysis');
  };

  const navItems = [
    { id: 'home' as ActiveTab, label: t.home, icon: Home },
    { id: 'puzzles' as ActiveTab, label: t.puzzles, icon: Puzzle },
    { id: 'analysis' as ActiveTab, label: t.analysis, icon: LineChart },
    { id: 'settings' as ActiveTab, label: t.settings, icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#302e2b] text-white overflow-hidden select-none font-sans">
      {/* Top Mobile App Bar (Shown on Home, Puzzles, Analysis, Settings - PlayView has its own dedicated in-game header) */}
      {activeTab !== 'play' && (
        <header
          className="bg-[#262522] border-b border-[#3d3b37] px-4 pb-2.5 flex items-center justify-between shrink-0 shadow-xs z-30"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 36px)' }}
        >
          <div className="flex items-center gap-2">
            {/* Chess icon badge */}
            <div className="w-7 h-7 rounded-lg bg-[#81b64c] flex items-center justify-center text-base font-black shadow-sm text-[#262522]">
              ♟
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight leading-none text-white">
                LocalMint <span className="text-[#81b64c]">Chess</span>
              </h1>
              <span className="text-[9px] text-[#8b8987] font-semibold tracking-wider uppercase">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Engine status pill */}
          <div className="flex items-center gap-1.5 bg-[#302e2b] px-2.5 py-1 rounded-full border border-[#3d3b37]">
            <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-pulse"></span>
            <span className="text-[10px] font-bold text-[#c3c1be]">{t.engineStatus}</span>
          </div>
        </header>
      )}

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'home' && (
          <HomeView
            language={language}
            onPlayVsBot={handleStartGame}
            onSolvePuzzles={() => setActiveTab('puzzles')}
            onReviewGame={handleAnalyzeFromGame}
          />
        )}
        {activeTab === 'play' && (
          <div
            className="h-full w-full"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 32px)' }}
          >
            <PlayView
              language={language}
              onBack={handleBackToHome}
              onAnalyzeGame={handleAnalyzeFromGame}
              boardTheme={boardTheme}
              initialBotId={selectedBotId}
            />
          </div>
        )}
        {activeTab === 'puzzles' && (
          <PuzzlesView language={language} boardTheme={boardTheme} />
        )}
        {activeTab === 'analysis' && (
          <AnalysisView language={language} initialPgn={analysisPgn} boardTheme={boardTheme} />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            language={language}
            onLanguageChange={setLanguage}
            boardTheme={boardTheme}
            onThemeChange={setBoardTheme}
            soundEnabled={soundEnabled}
            onSoundChange={setSoundEnabled}
          />
        )}
      </main>

      {/* Bottom Navigation Bar (Shown on Home, Puzzles, Analysis, Settings - PlayView uses its in-game action buttons) */}
      {activeTab !== 'play' && (
        <nav
          className="bg-[#21201d] border-t border-[#3d3b37] px-2 pt-1 flex items-center justify-around shrink-0 z-30"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 14px)' }}
        >
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
      )}
    </div>
  );
};

export default App;
