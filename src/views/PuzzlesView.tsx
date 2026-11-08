import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import rawPuzzles from '../data/puzzles.json';
import type { BoardTheme } from '../types/chess';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Lightbulb, ChevronRight, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface PuzzleItem {
  id: string;
  fen: string;
  solution: string[];
  themes: string[];
  rating: number;
  side_to_move: string;
}

interface PuzzlesViewProps {
  boardTheme: BoardTheme;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({ boardTheme }) => {
  const puzzles: PuzzleItem[] = rawPuzzles as PuzzleItem[];

  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(1200);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [game, setGame] = useState<Chess>(new Chess());
  const [solutionStep, setSolutionStep] = useState<number>(0);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [hintArrow, setHintArrow] = useState<{ from: string; to: string } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Trova la mossa migliore!');

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const currentPuzzle = puzzles[puzzleIndex] || puzzles[0];
  const isPlayerWhite = currentPuzzle.side_to_move === 'white';

  const loadPuzzle = useCallback((idx: number) => {
    const pz = puzzles[idx];
    if (!pz) return;

    const chess = new Chess(pz.fen);
    setGame(chess);
    setSolutionStep(0);
    setStatus('playing');
    setHintArrow(null);
    setLastMove(null);
    setStatusMessage(
      pz.side_to_move === 'white' ? 'Tocca al Bianco. Trova la mossa vincente!' : 'Tocca al Nero. Trova la mossa vincente!'
    );
  }, [puzzles]);

  useEffect(() => {
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex, loadPuzzle]);

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % puzzles.length);
  };

  const handleRetry = () => {
    loadPuzzle(puzzleIndex);
  };

  const handleHint = () => {
    if (status !== 'playing') return;
    const targetMove = currentPuzzle.solution[solutionStep];
    if (targetMove && targetMove.length >= 4) {
      setHintArrow({
        from: targetMove.slice(0, 2),
        to: targetMove.slice(2, 4),
      });
    }
  };

  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    if (status !== 'playing') return false;

    const userUci = `${from}${to}${promotion || ''}`;
    const expectedUci = currentPuzzle.solution[solutionStep];

    // Check if move matches solution
    if (userUci.startsWith(expectedUci.slice(0, 4))) {
      // Correct Move!
      const newGame = new Chess(game.fen());
      const res = newGame.move({ from, to, promotion: promotion || 'q' });

      if (res) {
        if (res.captured) soundManager.playCapture();
        else soundManager.playMove();

        setGame(newGame);
        setLastMove({ from, to });
        setHintArrow(null);

        const nextStep = solutionStep + 1;
        setSolutionStep(nextStep);

        // Check if puzzle is finished
        if (nextStep >= currentPuzzle.solution.length) {
          // Solved!
          setStatus('solved');
          setStatusMessage('Risolto! Ottima mossa!');
          soundManager.playSuccess();
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });

          // Update stats
          setUserRating((prev) => prev + 12);
          setStreak((prev) => {
            const nextStreak = prev + 1;
            setBestStreak((b) => Math.max(b, nextStreak));
            return nextStreak;
          });
        } else {
          // Play opponent response from solution
          setStatusMessage('Ben fatto! Continua...');
          setTimeout(() => {
            if (!isMounted.current) return;
            const oppMoveUci = currentPuzzle.solution[nextStep];
            if (oppMoveUci && oppMoveUci.length >= 4) {
              const oppFrom = oppMoveUci.slice(0, 2);
              const oppTo = oppMoveUci.slice(2, 4);
              const oppProm = oppMoveUci.length > 4 ? oppMoveUci[4] : undefined;

              const oppGame = new Chess(newGame.fen());
              const oppRes = oppGame.move({ from: oppFrom, to: oppTo, promotion: oppProm });
              if (oppRes) {
                if (oppRes.captured) soundManager.playCapture();
                else soundManager.playMove();

                setGame(oppGame);
                setLastMove({ from: oppFrom, to: oppTo });
                setSolutionStep(nextStep + 1);
                setStatusMessage('Tocca a te! Concludi la combinazione!');
              }
            }
          }, 350);
        }

        return true;
      }
    } else {
      // Wrong move
      setStatus('failed');
      setStatusMessage('Non è la mossa migliore. Riprova!');
      soundManager.playError();
      setStreak(0);
      setUserRating((prev) => Math.max(400, prev - 8));
      return false;
    }

    return false;
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full px-2 py-2">
      {/* Top Stats Banner */}
      <div className="flex items-center justify-between bg-[#262522] border border-[#3d3b37] rounded-xl px-4 py-2.5 mb-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-[#8b8987] uppercase font-bold tracking-wider">Rating Puzzle</span>
            <div className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>{userRating}</span>
              <span className="text-[11px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1 rounded">
                +12
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#3d3b37]" />

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#f0c15c]">
            <Flame className="w-4 h-4 fill-current" />
            <span>Serie: {streak}</span>
            <span className="text-[10px] text-[#8b8987] font-medium">(Record: {bestStreak})</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#8b8987] block font-semibold">Difficoltà</span>
          <span className="text-xs font-bold text-[#c3c1be]">
            {currentPuzzle.rating} Elo
          </span>
        </div>
      </div>

      {/* Main Board */}
      <div className="flex items-center justify-center w-full my-auto shrink-0">
        <ChessBoard
          game={game}
          orientation={isPlayerWhite ? 'white' : 'black'}
          theme={boardTheme}
          interactive={status === 'playing'}
          lastMove={lastMove}
          bestMoveArrow={hintArrow}
          onMove={handleMove}
        />
      </div>

      {/* Status Box & Move Instructions */}
      <div
        className={`mt-2 p-3 rounded-xl border flex items-center justify-between transition-all ${
          status === 'solved'
            ? 'bg-[#81b64c]/20 border-[#81b64c] text-white'
            : status === 'failed'
            ? 'bg-red-950/40 border-red-800 text-red-200'
            : 'bg-[#262522] border-[#3d3b37] text-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {status === 'solved' ? (
            <CheckCircle2 className="w-5 h-5 text-[#81b64c] shrink-0" />
          ) : status === 'failed' ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <span className="text-lg">🎯</span>
          )}
          <div>
            <div className="font-bold text-xs">{statusMessage}</div>
            <div className="text-[10px] text-[#c3c1be] flex items-center gap-1.5 mt-0.5">
              <span>Temi:</span>
              {currentPuzzle.themes.slice(0, 3).map((t, idx) => (
                <span key={idx} className="bg-[#302e2b] px-1.5 py-0.2 rounded text-[10px] text-[#81b64c]">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {status === 'solved' ? (
          <button
            onClick={handleNextPuzzle}
            className="bg-[#81b64c] hover:bg-[#96c95d] text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Prossimo <ChevronRight className="w-4 h-4" />
          </button>
        ) : status === 'failed' ? (
          <button
            onClick={handleRetry}
            className="bg-[#302e2b] hover:bg-[#3d3b37] text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-[#4d4b46] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Riprova
          </button>
        ) : (
          <button
            onClick={handleHint}
            className="bg-[#302e2b] hover:bg-[#3d3b37] text-[#f0c15c] font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-[#4d4b46] transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Aiuto
          </button>
        )}
      </div>
    </div>
  );
};
