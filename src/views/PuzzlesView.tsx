import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import rawPuzzles from '../data/puzzles.json';
import type { BoardTheme, Language } from '../types/chess';
import { soundManager } from '../utils/audio';
import { translations } from '../utils/i18n';
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
  language: Language;
  boardTheme: BoardTheme;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({ language, boardTheme }) => {
  const t = translations[language];
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
  const [statusMessage, setStatusMessage] = useState<string>('');

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const currentPuzzle = puzzles[puzzleIndex] || puzzles[0];
  const isPlayerWhite = currentPuzzle.side_to_move === 'white';

  const loadPuzzle = useCallback(
    (idx: number) => {
      const pz = puzzles[idx];
      if (!pz) return;

      const chess = new Chess(pz.fen);
      setGame(chess);
      setSolutionStep(0);
      setStatus('playing');
      setHintArrow(null);
      setLastMove(null);
      setStatusMessage(
        `${t.puzzlePlaying} ${pz.side_to_move === 'white' ? t.white : t.black}`
      );
    },
    [puzzles, t]
  );

  useEffect(() => {
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex, loadPuzzle]);

  const handleNextPuzzle = () => {
    const nextIdx = (puzzleIndex + 1) % puzzles.length;
    setPuzzleIndex(nextIdx);
  };

  const handleRetry = () => {
    loadPuzzle(puzzleIndex);
  };

  const handleHint = () => {
    if (status !== 'playing') return;
    const expectedMoveUci = currentPuzzle.solution[solutionStep];
    if (expectedMoveUci && expectedMoveUci.length >= 4) {
      setHintArrow({
        from: expectedMoveUci.slice(0, 2),
        to: expectedMoveUci.slice(2, 4),
      });
    }
  };

  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    if (status !== 'playing') return false;

    const userUci = `${from}${to}${promotion || ''}`;
    const expectedMoveUci = currentPuzzle.solution[solutionStep];

    const isMatch =
      userUci === expectedMoveUci ||
      (expectedMoveUci &&
        userUci.startsWith(expectedMoveUci.slice(0, 4)) &&
        !expectedMoveUci.slice(4));

    if (!isMatch) {
      // Wrong move
      setStatus('failed');
      setStatusMessage(t.puzzleFailed);
      soundManager.playError();
      setStreak(0);
      setUserRating((prev) => Math.max(400, prev - 8));
      return false;
    }

    try {
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

        if (nextStep >= currentPuzzle.solution.length) {
          // Solved!
          setStatus('solved');
          setStatusMessage(t.puzzleSolved);
          soundManager.playSuccess();
          confetti({ particleCount: 65, spread: 60, origin: { y: 0.7 } });

          setUserRating((prev) => prev + 12);
          setStreak((prev) => {
            const nextStreak = prev + 1;
            setBestStreak((b) => Math.max(b, nextStreak));
            return nextStreak;
          });
        } else {
          // Opponent response
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
              }
            }
          }, 350);
        }

        return true;
      }
    } catch {
      return false;
    }

    return false;
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-2 py-1 select-none justify-between">
      {/* Header with Rating, Streak, Difficulty */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#262522] rounded-xl border border-[#3d3b37] shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-[#8b8987] uppercase font-bold tracking-wider">
              {t.puzzleRating}
            </span>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5 leading-tight">
              <span>{userRating}</span>
              <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1 rounded">
                +12
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#3d3b37]" />

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#f08c38]">
            <Flame className="w-4 h-4 fill-current" />
            <span>{t.puzzleStreak}: {streak}</span>
            <span className="text-[10px] text-[#8b8987] font-medium">({t.bestRecord}: {bestStreak})</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#8b8987] block font-semibold">{t.difficulty}</span>
          <span className="text-xs font-bold text-[#c3c1be]">{currentPuzzle.rating} Elo</span>
        </div>
      </div>

      {/* Cat Mascot Speech Bubble (Screenshot 234005) */}
      <div className="flex items-center gap-2.5 bg-[#262522] border border-[#3d3b37] rounded-xl px-3 py-1.5 shrink-0 my-0.5 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-[#f0c15c]/20 border border-[#f0c15c]/40 flex items-center justify-center text-lg shrink-0">
          🐱
        </div>
        <p className="text-[11px] font-semibold text-[#c3c1be] leading-tight">
          {t.catSpeech}
        </p>
      </div>

      {/* Main Board (Strict 1:1 Aspect Ratio) */}
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

      {/* Status Box */}
      <div
        className={`px-3 py-2 rounded-xl border flex items-center justify-between shrink-0 my-1 transition-all ${
          status === 'solved'
            ? 'bg-[#81b64c]/20 border-[#81b64c] text-white'
            : status === 'failed'
            ? 'bg-red-950/40 border-red-800 text-red-200'
            : 'bg-[#262522] border-[#3d3b37] text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          {status === 'solved' && <CheckCircle2 className="w-4 h-4 text-[#81b64c] shrink-0" />}
          {status === 'failed' && <AlertTriangle className="w-4 h-4 text-[#ca3431] shrink-0" />}
          <span className="text-xs font-bold">{statusMessage}</span>
        </div>

        {status === 'playing' && (
          <button
            onClick={handleHint}
            className="flex items-center gap-1 text-[11px] font-bold text-[#f0c15c] hover:text-[#f8d78a] bg-[#302e2b] px-2 py-1 rounded-lg border border-[#4d4b46] cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{t.hint}</span>
          </button>
        )}
      </div>

      {/* Big 3D Green Bottom Button matching Chess.com: Risolvi problemi / Prossimo problema */}
      <div className="shrink-0 mb-1">
        {status === 'playing' ? (
          <button
            onClick={handleHint}
            className="w-full bg-[#81b64c] hover:bg-[#96c95d] active:scale-[0.98] text-white font-black text-sm py-2.5 rounded-xl shadow-md transition-all cursor-pointer border-b-2 border-[#5d8b32] flex items-center justify-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{t.solvePuzzles}</span>
          </button>
        ) : status === 'solved' ? (
          <button
            onClick={handleNextPuzzle}
            className="w-full bg-[#81b64c] hover:bg-[#96c95d] active:scale-[0.98] text-white font-black text-sm py-2.5 rounded-xl shadow-md transition-all cursor-pointer border-b-2 border-[#5d8b32] flex items-center justify-center gap-2"
          >
            <span>{t.nextPuzzle}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="w-full bg-[#ca3431] hover:bg-[#e04542] active:scale-[0.98] text-white font-black text-sm py-2.5 rounded-xl shadow-md transition-all cursor-pointer border-b-2 border-[#94201e] flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.cancel} / Riprova</span>
          </button>
        )}
      </div>
    </div>
  );
};
