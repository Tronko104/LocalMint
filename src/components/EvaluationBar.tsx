import React from 'react';
import type { Evaluation } from '../types/chess';

interface EvaluationBarProps {
  evaluation: Evaluation | null;
  orientation?: 'white' | 'black';
  height?: number | string;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  orientation = 'white',
  height = '100%',
}) => {
  const isFlipped = orientation === 'black';

  // Calculate white advantage percentage (0% to 100%, 50% = equal)
  let whitePercent = 50;
  let label = '0.0';

  if (evaluation) {
    if (evaluation.isMate) {
      const mateIn = evaluation.mateIn || 1;
      label = `M${Math.abs(mateIn)}`;
      whitePercent = mateIn > 0 ? 100 : 0;
    } else {
      const cp = evaluation.score;
      // Convert centipawns to decimal (+250 -> +2.5)
      const pawns = cp / 100;
      label = pawns > 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);

      // Sigmoid curve mapping -1000 to +1000 cp to 5% - 95%
      const winChance = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
      whitePercent = Math.max(5, Math.min(95, winChance));
    }
  }

  // If board is flipped for Black, Black is at the bottom
  const bottomPercent = isFlipped ? 100 - whitePercent : whitePercent;
  const isWhiteBottom = !isFlipped;

  return (
    <div
      className="relative w-7 bg-[#21201d] rounded-md overflow-hidden flex flex-col justify-end select-none shadow-md border border-[#3d3b37]"
      style={{ height }}
    >
      {/* Top Section */}
      <div
        className="w-full transition-all duration-300 ease-out"
        style={{
          height: `${100 - bottomPercent}%`,
          backgroundColor: isWhiteBottom ? '#302e2b' : '#ffffff',
        }}
      />

      {/* Bottom Section */}
      <div
        className="w-full transition-all duration-300 ease-out relative"
        style={{
          height: `${bottomPercent}%`,
          backgroundColor: isWhiteBottom ? '#ffffff' : '#302e2b',
        }}
      >
        {/* Score indicator badge */}
        <div
          className="absolute left-0 right-0 text-center font-bold text-[10px] tracking-tight py-0.5"
          style={{
            top: bottomPercent > 50 ? '4px' : 'auto',
            bottom: bottomPercent <= 50 ? '4px' : 'auto',
            color: bottomPercent > 50 ? (isWhiteBottom ? '#21201d' : '#ffffff') : (isWhiteBottom ? '#ffffff' : '#21201d'),
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
