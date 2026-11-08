import React from 'react';
import type { BoardTheme, Language } from '../types/chess';
import { soundManager } from '../utils/audio';
import { translations, setStoredLanguage } from '../utils/i18n';
import { Volume2, Palette, Cpu, ShieldCheck, Heart, Languages } from 'lucide-react';

interface SettingsViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  boardTheme: BoardTheme;
  onThemeChange: (theme: BoardTheme) => void;
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  boardTheme,
  onThemeChange,
  soundEnabled,
  onSoundChange,
}) => {
  const t = translations[language];

  const handleLangChange = (lang: Language) => {
    onLanguageChange(lang);
    setStoredLanguage(lang);
  };

  const themes: { id: BoardTheme; label: string; dark: string; light: string }[] = [
    { id: 'green', label: language === 'it' ? 'Chess.com Verde' : 'Chess.com Green', dark: '#769656', light: '#eeeed2' },
    { id: 'wood', label: language === 'it' ? 'Legno Scuro' : 'Dark Wood', dark: '#b58863', light: '#f0d9b5' },
    { id: 'ice', label: language === 'it' ? 'Ghiaccio Polare' : 'Polar Ice', dark: '#86a666', light: '#d0e0e3' },
    { id: 'classic', label: language === 'it' ? 'Blu Torneo' : 'Tournament Blue', dark: '#4b7399', light: '#eae9d2' },
  ];

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-3 py-3 overflow-y-auto custom-scrollbar space-y-3.5 pb-20 select-none">
      {/* Language Selector */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Languages className="w-5 h-5 text-[#81b64c]" />
          <h3 className="font-bold text-white text-sm">{t.language}</h3>
        </div>
        <p className="text-[11px] text-[#8b8987] mb-3">{t.languageDesc}</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleLangChange('it')}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              language === 'it'
                ? 'bg-[#81b64c]/20 border-[#81b64c] text-white shadow-xs'
                : 'bg-[#302e2b] border-[#3d3b37] text-[#c3c1be] hover:text-white'
            }`}
          >
            <span className="text-base">🇮🇹</span>
            <span>Italiano</span>
          </button>

          <button
            onClick={() => handleLangChange('en')}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#81b64c]/20 border-[#81b64c] text-white shadow-xs'
                : 'bg-[#302e2b] border-[#3d3b37] text-[#c3c1be] hover:text-white'
            }`}
          >
            <span className="text-base">🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-5 h-5 text-[#3b9ae1]" />
          <h3 className="font-bold text-white text-sm">{t.soundEffects}</h3>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#302e2b] rounded-xl border border-[#3d3b37]">
          <div>
            <span className="font-semibold text-white text-xs block">{t.soundEffects}</span>
            <span className="text-[11px] text-[#8b8987]">
              {t.soundEffectsDesc}
            </span>
          </div>

          <button
            onClick={() => {
              const next = !soundEnabled;
              onSoundChange(next);
              soundManager.setEnabled(next);
              if (next) soundManager.playSuccess();
            }}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
              soundEnabled ? 'bg-[#81b64c]' : 'bg-[#4d4b46]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {soundEnabled && (
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => soundManager.playMove()}
              className="flex-1 py-1.5 bg-[#302e2b] hover:bg-[#3d3b37] text-xs text-[#c3c1be] rounded-lg border border-[#3d3b37] transition-colors cursor-pointer"
            >
              Move
            </button>
            <button
              onClick={() => soundManager.playCapture()}
              className="flex-1 py-1.5 bg-[#302e2b] hover:bg-[#3d3b37] text-xs text-[#c3c1be] rounded-lg border border-[#3d3b37] transition-colors cursor-pointer"
            >
              Capture
            </button>
            <button
              onClick={() => soundManager.playCheck()}
              className="flex-1 py-1.5 bg-[#302e2b] hover:bg-[#3d3b37] text-xs text-[#c3c1be] rounded-lg border border-[#3d3b37] transition-colors cursor-pointer"
            >
              Check
            </button>
          </div>
        )}
      </div>

      {/* Board Themes */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-[#f0c15c]" />
          <h3 className="font-bold text-white text-sm">{t.boardTheme}</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {themes.map((th) => {
            const isSelected = boardTheme === th.id;
            return (
              <div
                key={th.id}
                onClick={() => onThemeChange(th.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#81b64c] bg-[#81b64c]/10 shadow-xs'
                    : 'border-[#3d3b37] bg-[#302e2b] hover:border-[#4d4b46]'
                }`}
              >
                {/* 2x2 Mini Board Preview */}
                <div className="w-8 h-8 rounded-md grid grid-cols-2 grid-rows-2 overflow-hidden shrink-0 border border-black/40">
                  <div style={{ backgroundColor: th.light }} />
                  <div style={{ backgroundColor: th.dark }} />
                  <div style={{ backgroundColor: th.dark }} />
                  <div style={{ backgroundColor: th.light }} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate">{th.label}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[#81b64c]">✓ Attivo</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engine Info */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-[#ca3431]" />
          <h3 className="font-bold text-white text-sm">{t.engineInfo}</h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-[#3d3b37]/50">
            <span className="text-[#8b8987]">Engine</span>
            <span className="font-bold text-white">Stockfish 19 Lite WASM</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#3d3b37]/50">
            <span className="text-[#8b8987]">Neural Network (NNUE)</span>
            <span className="font-bold text-[#81b64c]">Attivo (Embedded 100%)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#3d3b37]/50">
            <span className="text-[#8b8987]">Thread Worker</span>
            <span className="font-bold text-white">Dedicated Web Worker</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[#8b8987]">Modalità Offline</span>
            <span className="font-bold text-[#81b64c]">100% Funzionante Senza Internet</span>
          </div>
        </div>
      </div>

      {/* About LocalMint */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm text-center">
        <div className="w-10 h-10 rounded-xl bg-[#81b64c] text-[#262522] font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-md">
          ♟
        </div>
        <h4 className="font-black text-white text-sm">LocalMint Chess</h4>
        <p className="text-[11px] text-[#8b8987] mt-1 mb-3">
          {t.aboutText}
        </p>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#8b8987]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#81b64c]" /> GPLv3 Open Source
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#ca3431] fill-current" /> No Ads & Free
          </span>
        </div>
      </div>
    </div>
  );
};
