import React from 'react';
import type { BoardTheme } from '../types/chess';
import { soundManager } from '../utils/audio';
import { Volume2, Palette, Cpu, ShieldCheck, Heart } from 'lucide-react';

interface SettingsViewProps {
  boardTheme: BoardTheme;
  onThemeChange: (theme: BoardTheme) => void;
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  boardTheme,
  onThemeChange,
  soundEnabled,
  onSoundChange,
}) => {
  const themes: { id: BoardTheme; label: string; dark: string; light: string }[] = [
    { id: 'green', label: 'Chess.com Verde', dark: '#779952', light: '#edeed1' },
    { id: 'wood', label: 'Legno Scuro', dark: '#b58863', light: '#f0d9b5' },
    { id: 'ice', label: 'Ghiaccio Polare', dark: '#86a666', light: '#d0e0e3' },
    { id: 'classic', label: 'Blu Torneo', dark: '#4b7399', light: '#eae9d2' },
  ];

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full px-3 py-3 overflow-y-auto custom-scrollbar space-y-4">
      {/* Sound Settings */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-5 h-5 text-[#81b64c]" />
          <h3 className="font-bold text-white text-sm">Effetti Sonori</h3>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#302e2b] rounded-xl border border-[#3d3b37]">
          <div>
            <span className="font-semibold text-white text-xs block">Suoni di gioco</span>
            <span className="text-[11px] text-[#8b8987]">
              Sintetizzati in locale tramite Web Audio API (zero latenza)
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
              Test Mossa
            </button>
            <button
              onClick={() => soundManager.playCapture()}
              className="flex-1 py-1.5 bg-[#302e2b] hover:bg-[#3d3b37] text-xs text-[#c3c1be] rounded-lg border border-[#3d3b37] transition-colors cursor-pointer"
            >
              Test Cattura
            </button>
            <button
              onClick={() => soundManager.playCheck()}
              className="flex-1 py-1.5 bg-[#302e2b] hover:bg-[#3d3b37] text-xs text-[#c3c1be] rounded-lg border border-[#3d3b37] transition-colors cursor-pointer"
            >
              Test Scacco
            </button>
          </div>
        )}
      </div>

      {/* Board Themes */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-[#f0c15c]" />
          <h3 className="font-bold text-white text-sm">Tema Scacchiera</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {themes.map((t) => {
            const isSelected = boardTheme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#81b64c]/15 border-[#81b64c]'
                    : 'bg-[#302e2b] border-[#3d3b37] hover:border-[#4d4b46]'
                }`}
              >
                {/* 2x2 board swatch */}
                <div className="w-9 h-9 rounded-md grid grid-cols-2 grid-rows-2 overflow-hidden shrink-0 border border-black/30 shadow-xs">
                  <div style={{ backgroundColor: t.light }} />
                  <div style={{ backgroundColor: t.dark }} />
                  <div style={{ backgroundColor: t.dark }} />
                  <div style={{ backgroundColor: t.light }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white text-xs block truncate">{t.label}</span>
                  {isSelected && (
                    <span className="text-[10px] text-[#81b64c] font-semibold">Attivo</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engine Status */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-[#86a666]" />
          <h3 className="font-bold text-white text-sm">Motore di Calcolo Locale</h3>
        </div>

        <div className="p-3 bg-[#302e2b] rounded-xl border border-[#3d3b37] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b8987]">Motore</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#81b64c] animate-pulse"></span>
              Stockfish 19 NNUE (WASM)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b8987]">Esecuzione</span>
            <span className="text-[#81b64c] font-semibold">100% Offline sul Dispositivo</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b8987]">Protocollo</span>
            <span className="text-[#c3c1be] font-mono">UCI nativo via Web Worker</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b8987]">Rete Neurale NNUE</span>
            <span className="text-[#c3c1be]">Abilitata (Valutazione integrata)</span>
          </div>
        </div>
      </div>

      {/* About & Open Source */}
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#81b64c]/20 border border-[#81b64c]/40 text-2xl mx-auto flex items-center justify-center mb-2">
          🌱
        </div>
        <h4 className="font-bold text-white text-sm">LocalMint Chess</h4>
        <p className="text-xs text-[#8b8987] mt-0.5">
          Scacchi open-source con analisi e bot illimitati eseguiti in locale.
        </p>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#3d3b37] text-[11px] text-[#8b8987]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#81b64c]" /> Nessun Tracker
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-400" /> Gratuito per sempre
          </span>
        </div>
      </div>
    </div>
  );
};
