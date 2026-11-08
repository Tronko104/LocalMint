import React from 'react';
import { Trophy, RotateCcw, LineChart, X } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultMessage: string;
  isWin: boolean;
  isDraw: boolean;
  onRematch: () => void;
  onAnalyze: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  resultMessage,
  isWin,
  isDraw,
  onRematch,
  onAnalyze,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b8987] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg ${
            isWin
              ? 'bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/40'
              : isDraw
              ? 'bg-[#f0c15c]/20 text-[#f0c15c] border border-[#f0c15c]/40'
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}
        >
          {isWin ? <Trophy className="w-8 h-8 text-[#81b64c]" /> : isDraw ? '🤝' : '⚔️'}
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          {isWin ? 'Vittoria!' : isDraw ? 'Patta' : 'Sconfitta'}
        </h3>
        <p className="text-sm text-[#c3c1be] mb-6">{resultMessage}</p>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onAnalyze();
              onClose();
            }}
            className="w-full bg-[#81b64c] hover:bg-[#96c95d] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer text-sm"
          >
            <LineChart className="w-4 h-4" />
            Revisione Partita (Game Review)
          </button>

          <button
            onClick={() => {
              onRematch();
              onClose();
            }}
            className="w-full bg-[#302e2b] hover:bg-[#3d3b37] text-white font-semibold py-3 rounded-xl border border-[#4d4b46] flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Nuova Partita
          </button>
        </div>
      </div>
    </div>
  );
};
