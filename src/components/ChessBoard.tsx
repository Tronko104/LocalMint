import React, { useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { ChessPiece } from './ChessPieces';
import type { PieceType, PieceColor, BoardTheme } from '../types/chess';

interface ChessBoardProps {
  game: Chess;
  orientation?: 'white' | 'black';
  theme?: BoardTheme;
  interactive?: boolean;
  lastMove?: { from: string; to: string } | null;
  bestMoveArrow?: { from: string; to: string } | null;
  moveBadge?: { square: string; symbol: string; color: string } | null;
  onMove: (from: string, to: string, promotion?: string) => boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  orientation = 'white',
  theme = 'green',
  interactive = true,
  lastMove = null,
  bestMoveArrow = null,
  moveBadge = null,
  onMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const isFlipped = orientation === 'black';
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = isFlipped ? [...files].reverse() : files;
  const displayRanks = isFlipped ? [...ranks].reverse() : ranks;

  // Authentic board colors (matching open-chess and Chess.com standards)
  const getThemeColors = () => {
    switch (theme) {
      case 'wood':
        return { dark: '#b58863', light: '#f0d9b5' };
      case 'ice':
        return { dark: '#86a666', light: '#d0e0e3' };
      case 'classic':
        return { dark: '#4b7399', light: '#eae9d2' };
      case 'green':
      default:
        return { dark: '#769656', light: '#eeeed2' };
    }
  };

  const themeColors = getThemeColors();

  // Find if king is in check
  const inCheck = game.inCheck();
  let checkSquare: string | null = null;
  if (inCheck) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const f = files[c];
          const rank = 8 - r;
          checkSquare = `${f}${rank}`;
        }
      }
    }
  }

  const handleSquareClick = (square: string) => {
    if (!interactive) return;

    // If already selected and clicking another square
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (legalMoves.includes(square)) {
        // Check for promotion
        const piece = game.get(selectedSquare as Square);
        const targetRank = square[1];
        if (piece && piece.type === 'p' && (targetRank === '8' || targetRank === '1')) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        // Execute move
        const success = onMove(selectedSquare, square);
        if (success) {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
        return;
      }
    }

    // Select piece
    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as Square, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handlePromotionChoice = (promPiece: PieceType) => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, promPiece);
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Calculate coordinates for SVG arrow
  const getSquareCoordinates = (sq: string) => {
    const fileIdx = displayFiles.indexOf(sq[0]);
    const rankIdx = displayRanks.indexOf(sq[1]);
    const x = fileIdx * 12.5 + 6.25;
    const y = rankIdx * 12.5 + 6.25;
    return { x, y };
  };

  return (
    <div
      className="relative select-none rounded-xl overflow-hidden shadow-2xl border-2 sm:border-4 border-[#21201d] shrink-0"
      style={{
        width: '100%',
        maxWidth: 'min(96vw, calc(100dvh - 310px), 430px)',
        aspectRatio: '1 / 1',
        margin: '0 auto',
      }}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rankIndex) =>
          displayFiles.map((file, fileIndex) => {
            const square = `${file}${rank}`;
            const piece = game.get(square as Square);
            const isDark = (rankIndex + fileIndex) % 2 === 1;
            const isSelected = selectedSquare === square;
            const isLegal = legalMoves.includes(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isKingInCheck = checkSquare === square;

            // Background color (authentic Chess.com)
            let bg = isDark ? themeColors.dark : themeColors.light;
            if (isSelected) {
              bg = '#baca2b'; // Selected highlight
            } else if (isLastMoveFrom || isLastMoveTo) {
              bg = isDark ? '#baca44' : '#f7f769'; // Last move highlight
            }

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className="relative aspect-square flex items-center justify-center cursor-pointer select-none transition-colors duration-75 overflow-hidden"
                style={{ backgroundColor: bg }}
              >
                {/* King in check red radial gradient */}
                {isKingInCheck && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(235, 60, 60, 0.9) 0%, rgba(200, 20, 20, 0) 72%)',
                    }}
                  />
                )}

                {/* Rank coordinates (left edge) */}
                {fileIndex === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-bold leading-none pointer-events-none select-none ${
                      isDark ? 'text-[#eeeed2]' : 'text-[#769656]'
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* File coordinates (bottom edge) */}
                {rankIndex === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-bold leading-none pointer-events-none select-none ${
                      isDark ? 'text-[#eeeed2]' : 'text-[#769656]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Piece */}
                {piece && (
                  <div className="w-[88%] h-[88%] relative z-10 transition-transform active:scale-95 pointer-events-none flex items-center justify-center">
                    <ChessPiece type={piece.type as PieceType} color={piece.color as PieceColor} />
                  </div>
                )}

                {/* Move hints (dot for empty square, ring for capture) */}
                {isLegal && !piece && (
                  <div className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/25 pointer-events-none" />
                )}
                {isLegal && piece && (
                  <div className="absolute inset-1 rounded-full border-[3.5px] border-black/30 pointer-events-none" />
                )}

                {/* Move quality badge overlay (Analysis Game Review) */}
                {moveBadge && moveBadge.square === square && (
                  <div
                    className="absolute -top-1 -right-1 z-30 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md border border-black/20"
                    style={{ backgroundColor: moveBadge.color }}
                  >
                    {moveBadge.symbol}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Best move arrow overlay */}
      {bestMoveArrow && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 100 100"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill="#81b64c" />
            </marker>
          </defs>
          {(() => {
            const start = getSquareCoordinates(bestMoveArrow.from);
            const end = getSquareCoordinates(bestMoveArrow.to);
            return (
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#81b64c"
                strokeWidth="2.8"
                strokeLinecap="round"
                opacity="0.9"
                markerEnd="url(#arrowhead)"
              />
            );
          })()}
        </svg>
      )}

      {/* Pawn Promotion Dialog */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-[#262522] border border-[#3d3b37] rounded-xl p-4 shadow-2xl text-center max-w-[280px] w-full animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-white font-bold text-sm mb-3">Promuovi il pedone</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePromotionChoice(p)}
                  className="bg-[#302e2b] hover:bg-[#81b64c]/20 border border-[#3d3b37] hover:border-[#81b64c] p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer h-14"
                >
                  <ChessPiece type={p} color={game.turn() as PieceColor} size={40} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
