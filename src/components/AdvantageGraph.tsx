import React from 'react';

interface AdvantagePoint {
  moveIndex: number;
  score: number; // centipawns
  color: 'w' | 'b';
  san: string;
}

interface AdvantageGraphProps {
  data: AdvantagePoint[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  height?: number;
}

export const AdvantageGraph: React.FC<AdvantageGraphProps> = ({
  data,
  currentMoveIndex,
  onSelectMove,
  height = 80,
}) => {
  if (data.length === 0) {
    return (
      <div
        className="w-full bg-[#262522] rounded-lg border border-[#3d3b37] flex items-center justify-center text-xs text-[#8b8987]"
        style={{ height }}
      >
        Esegui l'analisi per generare il grafico del vantaggio
      </div>
    );
  }

  const width = 400;
  const paddingY = 8;
  const graphH = height - paddingY * 2;
  const midY = height / 2;

  // Max clamp score for display (+500 / -500 cp)
  const maxScore = 500;

  // Generate SVG path points
  const points = data.map((pt, idx) => {
    const x = (idx / (data.length - 1 || 1)) * width;
    const clampedScore = Math.max(-maxScore, Math.min(maxScore, pt.score));
    // Score > 0 (White advantage) goes UP (-y), Score < 0 goes DOWN (+y)
    const y = midY - (clampedScore / maxScore) * (graphH / 2);
    return { x, y, score: pt.score, san: pt.san, idx };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

  // Fill area between curve and midY
  const areaD = `${pathD} L ${width} ${midY} L 0 ${midY} Z`;

  // Current move position
  const currentPt = points[currentMoveIndex] || points[points.length - 1];

  return (
    <div className="w-full bg-[#262522] rounded-lg border border-[#3d3b37] p-2 select-none">
      <div className="flex justify-between items-center text-[11px] text-[#8b8987] mb-1 px-1">
        <span className="flex items-center gap-1 font-semibold text-[#c3c1be]">
          <span className="w-2 h-2 rounded-full bg-white inline-block"></span> Vantaggio Bianco
        </span>
        <span className="flex items-center gap-1 font-semibold text-[#8b8987]">
          Vantaggio Nero <span className="w-2 h-2 rounded-full bg-[#3d3b37] inline-block border border-white/20"></span>
        </span>
      </div>

      <div className="relative w-full overflow-hidden cursor-crosshair">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height }}
          preserveAspectRatio="none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            const targetIdx = Math.round(ratio * (data.length - 1));
            onSelectMove(Math.max(0, Math.min(data.length - 1, targetIdx)));
          }}
        >
          <defs>
            <linearGradient id="advantageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
              <stop offset="50%" stop-color="#81b64c" stop-opacity="0.1" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0.4" />
            </linearGradient>
          </defs>

          {/* Neutral center line (0.0) */}
          <line
            x1="0"
            y1={midY}
            x2={width}
            y2={midY}
            stroke="#4d4b46"
            strokeWidth="1"
            strokeDasharray="4 2"
          />

          {/* Shaded Area */}
          <path d={areaD} fill="url(#advantageGrad)" />

          {/* Advantage line */}
          <path
            d={pathD}
            fill="none"
            stroke="#81b64c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current move vertical scrubber line */}
          {currentPt && (
            <>
              <line
                x1={currentPt.x}
                y1="0"
                x2={currentPt.x}
                y2={height}
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <circle
                cx={currentPt.x}
                cy={currentPt.y}
                r="3.5"
                fill="#81b64c"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
