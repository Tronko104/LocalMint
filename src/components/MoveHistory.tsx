import React from 'react';
import type { ClassifiedMove, MoveClassification } from '../types/chess';

interface MoveHistoryProps {
  moves: string[]; // array of SAN moves
  classifiedMoves?: ClassifiedMove[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
}

export const getBadgeDetails = (type: MoveClassification) => {
  switch (type) {
    case 'brilliant':
      return { icon: '💎', label: 'Brillante', color: '#1ba099', bg: '#1ba09920' };
    case 'best':
      return { icon: '⭐', label: 'Migliore', color: '#7fa650', bg: '#7fa65020' };
    case 'excellent':
      return { icon: '🟢', label: 'Eccellente', color: '#86a666', bg: '#86a66620' };
    case 'good':
      return { icon: '🔵', label: 'Buona', color: '#5c8bb0', bg: '#5c8bb020' };
    case 'inaccuracy':
      return { icon: '🟡', label: 'Imprecisione', color: '#f0c15c', bg: '#f0c15c20' };
    case 'mistake':
      return { icon: '🟠', label: 'Errore', color: '#e58f2a', bg: '#e58f2a20' };
    case 'blunder':
      return { icon: '🔴', label: 'Blunder', color: '#ca3431', bg: '#ca343120' };
    case 'miss':
      return { icon: '❌', label: 'Occasione Persa', color: '#e05b5b', bg: '#e05b5b20' };
    case 'book':
      return { icon: '📖', label: 'Libro', color: '#d5a47e', bg: '#d5a47e20' };
  }
};

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  classifiedMoves = [],
  currentMoveIndex,
  onSelectMove,
}) => {
  // Group moves into pairs (White, Black)
  const movePairs: { num: number; wIdx: number; wSan: string; bIdx?: number; bSan?: string }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      wIdx: i,
      wSan: moves[i],
      bIdx: i + 1 < moves.length ? i + 1 : undefined,
      bSan: i + 1 < moves.length ? moves[i + 1] : undefined,
    });
  }

  return (
    <div className="w-full bg-[#262522] border border-[#3d3b37] rounded-lg p-2 max-h-48 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-0.5 text-xs">
        {movePairs.map((pair) => {
          const wClass = classifiedMoves[pair.wIdx]?.classification;
          const bClass = pair.bIdx !== undefined ? classifiedMoves[pair.bIdx]?.classification : undefined;

          const isWhiteActive = currentMoveIndex === pair.wIdx;
          const isBlackActive = pair.bIdx !== undefined && currentMoveIndex === pair.bIdx;

          return (
            <div
              key={pair.num}
              className={`flex items-center py-1 px-2 rounded hover:bg-[#302e2b] transition-colors ${
                pair.num % 2 === 1 ? 'bg-[#2a2926]/40' : ''
              }`}
            >
              {/* Move number */}
              <span className="w-9 font-semibold text-[#8b8987]">{pair.num}.</span>

              {/* White move */}
              <button
                onClick={() => onSelectMove(pair.wIdx)}
                className={`flex-1 flex items-center justify-between px-2 py-0.5 rounded cursor-pointer text-left font-medium transition-all ${
                  isWhiteActive
                    ? 'bg-[#81b64c] text-white shadow-xs'
                    : 'text-[#e0dedb] hover:bg-[#3d3b37]'
                }`}
              >
                <span>{pair.wSan}</span>
                {wClass && (
                  <span
                    className="text-[10px] ml-1 px-1 rounded flex items-center gap-0.5"
                    style={{ backgroundColor: isWhiteActive ? 'transparent' : getBadgeDetails(wClass).bg }}
                    title={getBadgeDetails(wClass).label}
                  >
                    {getBadgeDetails(wClass).icon}
                  </span>
                )}
              </button>

              {/* Black move */}
              {pair.bSan && pair.bIdx !== undefined && (
                <button
                  onClick={() => onSelectMove(pair.bIdx!)}
                  className={`flex-1 flex items-center justify-between px-2 py-0.5 rounded cursor-pointer text-left font-medium transition-all ml-1 ${
                    isBlackActive
                      ? 'bg-[#81b64c] text-white shadow-xs'
                      : 'text-[#e0dedb] hover:bg-[#3d3b37]'
                  }`}
                >
                  <span>{pair.bSan}</span>
                  {bClass && (
                    <span
                      className="text-[10px] ml-1 px-1 rounded flex items-center gap-0.5"
                      style={{ backgroundColor: isBlackActive ? 'transparent' : getBadgeDetails(bClass).bg }}
                      title={getBadgeDetails(bClass).label}
                    >
                      {getBadgeDetails(bClass).icon}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
