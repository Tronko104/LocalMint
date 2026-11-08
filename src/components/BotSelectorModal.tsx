import React, { useState } from 'react';
import type { Bot } from '../types/chess';
import { BOTS } from '../data/bots';
import { X, Bot as BotIcon, Zap } from 'lucide-react';

interface BotSelectorModalProps {
  currentBot: Bot;
  isOpen: boolean;
  onClose: () => void;
  onSelectBot: (bot: Bot) => void;
}

export const BotSelectorModal: React.FC<BotSelectorModalProps> = ({
  currentBot,
  isOpen,
  onClose,
  onSelectBot,
}) => {
  const [selected, setSelected] = useState<Bot>(currentBot);
  const [customElo, setCustomElo] = useState<number>(1500);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isCustom) {
      const customBot: Bot = {
        id: `custom_${customElo}`,
        name: `Bot Personalizzato (${customElo})`,
        elo: customElo,
        avatar: '🤖',
        tagline: 'Difficoltà calibrata',
        depth: Math.max(1, Math.round(customElo / 180)),
        skillLevel: Math.round(((customElo - 250) / 2950) * 20),
        style: `Motore Stockfish regolato a ${customElo} Elo`,
      };
      onSelectBot(customBot);
    } else {
      onSelectBot(selected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3d3b37]">
          <div className="flex items-center gap-2">
            <BotIcon className="w-5 h-5 text-[#81b64c]" />
            <h3 className="font-bold text-white text-base">Scegli il tuo Avversario</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b8987] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 custom-scrollbar">
          {/* Preset Bots */}
          {BOTS.map((bot) => {
            const isChosen = !isCustom && selected.id === bot.id;
            return (
              <div
                key={bot.id}
                onClick={() => {
                  setSelected(bot);
                  setIsCustom(false);
                }}
                className={`p-3 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                  isChosen
                    ? 'bg-[#81b64c]/15 border-[#81b64c]'
                    : 'bg-[#302e2b] border-[#3d3b37] hover:border-[#4d4b46]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#262522] border border-[#4d4b46] flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {bot.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{bot.name}</span>
                    <span className="bg-[#21201d] text-[#81b64c] text-[11px] font-bold px-1.5 py-0.5 rounded border border-[#81b64c]/30">
                      {bot.elo} Elo
                    </span>
                  </div>
                  <p className="text-xs text-[#c3c1be] line-clamp-1">{bot.tagline}</p>
                  <p className="text-[11px] text-[#8b8987] line-clamp-1 mt-0.5">{bot.style}</p>
                </div>
              </div>
            );
          })}

          {/* Custom Elo Card */}
          <div
            onClick={() => setIsCustom(true)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              isCustom
                ? 'bg-[#81b64c]/15 border-[#81b64c]'
                : 'bg-[#302e2b] border-[#3d3b37] hover:border-[#4d4b46]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f0c15c]" />
                <span className="font-bold text-white text-sm">Elo Personalizzato</span>
              </div>
              <span className="bg-[#81b64c] text-white text-xs font-bold px-2 py-0.5 rounded">
                {customElo} Elo
              </span>
            </div>

            <input
              type="range"
              min="250"
              max="3200"
              step="50"
              value={customElo}
              onChange={(e) => {
                setCustomElo(parseInt(e.target.value, 10));
                setIsCustom(true);
              }}
              className="w-full accent-[#81b64c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8b8987] mt-1 font-semibold">
              <span>250 (Principiante)</span>
              <span>1500 (Club)</span>
              <span>3200 (Gran Maestro)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3d3b37] bg-[#21201d]">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#81b64c] hover:bg-[#96c95d] text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer text-sm"
          >
            Sfida {isCustom ? `Bot a ${customElo} Elo` : selected.name}
          </button>
        </div>
      </div>
    </div>
  );
};
