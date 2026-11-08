import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { AdvantageGraph } from '../components/AdvantageGraph';
import { MoveHistory, getBadgeDetails } from '../components/MoveHistory';
import { ChessComImportModal } from '../components/ChessComImportModal';
import { analyzeGame } from '../utils/analysis';
import { stockfish } from '../utils/stockfishWorker';
import type { GameReview, BoardTheme, Evaluation } from '../types/chess';
import {
  Globe,
  FileText,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface AnalysisViewProps {
  initialPgn?: string;
  boardTheme: BoardTheme;
}

const SAMPLE_PGN = `1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

export const AnalysisView: React.FC<AnalysisViewProps> = ({ initialPgn, boardTheme }) => {
  const [currentPgn, setCurrentPgn] = useState<string>(initialPgn || SAMPLE_PGN);
  const [game, setGame] = useState<Chess>(new Chess());
  const [currentPly, setCurrentPly] = useState<number>(0);
  const [totalPlies, setTotalPlies] = useState<number>(0);
  const [movesHistory, setMovesHistory] = useState<string[]>([]);
  const [review, setReview] = useState<GameReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number; msg: string }>({
    current: 0,
    total: 0,
    msg: '',
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isPgnModalOpen, setIsPgnModalOpen] = useState<boolean>(false);
  const [customPgnInput, setCustomPgnInput] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [liveEval, setLiveEval] = useState<Evaluation | null>(null);

  const isMounted = useRef(true);

  // Load PGN into board and initialize history
  const loadPgnIntoBoard = useCallback((pgnStr: string) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgnStr);
      const history = chess.history();
      setMovesHistory(history);
      setTotalPlies(history.length);
      setCurrentPly(history.length); // Start at final position

      // Display final position
      setGame(chess);
      setReview(null);
    } catch {
      // Handle error
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadPgnIntoBoard(currentPgn);
    return () => {
      isMounted.current = false;
      stockfish.stop();
    };
  }, [currentPgn, loadPgnIntoBoard]);

  // Navigate to specific ply
  const goToPly = useCallback(
    async (targetPly: number) => {
      const clampedPly = Math.max(0, Math.min(totalPlies, targetPly));
      setCurrentPly(clampedPly);

      const replay = new Chess();
      for (let i = 0; i < clampedPly; i++) {
        replay.move(movesHistory[i]);
      }
      setGame(replay);

      // Evaluate position
      const ev = await stockfish.evaluatePosition(replay.fen(), 12);
      if (isMounted.current) {
        setLiveEval(ev);
      }
    },
    [movesHistory, totalPlies]
  );

  // Autoplay
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying) {
      if (currentPly < totalPlies) {
        timer = setTimeout(() => {
          goToPly(currentPly + 1);
        }, 1200);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentPly, totalPlies, goToPly]);

  // Run full game analysis
  const runFullAnalysis = async () => {
    if (isAnalyzing || totalPlies === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeGame(currentPgn, (cur, tot, msg) => {
        if (isMounted.current) {
          setAnalysisProgress({ current: cur, total: tot, msg });
        }
      });
      if (isMounted.current) {
        setReview(result);
      }
    } catch {
      // Error in analysis
    } finally {
      if (isMounted.current) {
        setIsAnalyzing(false);
      }
    }
  };

  // Get current move details
  const currentClassifiedMove =
    review && currentPly > 0 ? review.classifiedMoves[currentPly - 1] : null;

  // Best move arrow
  const bestMoveArrow = currentClassifiedMove?.bestMove
    ? {
        from: currentClassifiedMove.bestMove.slice(0, 2),
        to: currentClassifiedMove.bestMove.slice(2, 4),
      }
    : null;

  // Last move
  const lastMove = currentClassifiedMove
    ? {
        from: currentClassifiedMove.from,
        to: currentClassifiedMove.to,
      }
    : null;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full px-2 py-2">
      {/* Top Header / Import buttons */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex-1 bg-[#262522] hover:bg-[#302e2b] border border-[#3d3b37] rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4 text-[#81b64c]" />
          <span>Chess.com API</span>
        </button>

        <button
          onClick={() => {
            setCustomPgnInput(currentPgn);
            setIsPgnModalOpen(true);
          }}
          className="flex-1 bg-[#262522] hover:bg-[#302e2b] border border-[#3d3b37] rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#5c8bb0]" />
          <span>Incolla PGN</span>
        </button>

        <button
          onClick={runFullAnalysis}
          disabled={isAnalyzing}
          className="bg-[#81b64c] hover:bg-[#96c95d] disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md shrink-0"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{review ? 'Rianalizza' : 'Game Review'}</span>
        </button>
      </div>

      {/* Analysis Progress Banner */}
      {isAnalyzing && (
        <div className="mb-2 p-3 bg-[#262522] border border-[#81b64c]/40 rounded-xl">
          <div className="flex items-center justify-between text-xs text-white mb-1.5 font-semibold">
            <span>{analysisProgress.msg}</span>
            <span>
              {Math.round((analysisProgress.current / (analysisProgress.total || 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#302e2b] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#81b64c] h-full transition-all duration-150"
              style={{
                width: `${(analysisProgress.current / (analysisProgress.total || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Game Review Accuracy Header (When Review is ready) */}
      {review && !isAnalyzing && (
        <div className="bg-[#262522] border border-[#3d3b37] rounded-xl p-3 mb-2 flex items-center justify-between shadow-sm">
          {/* White Accuracy */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#21201d] font-black text-sm flex items-center justify-center shadow-md">
              {review.whiteAccuracy}%
            </div>
            <div>
              <span className="text-[10px] text-[#8b8987] block font-bold uppercase">Precisione Bianco</span>
              <span className="text-xs font-semibold text-white">
                {review.whiteAccuracy > 80 ? 'Partita Magistrale' : 'Partita Solida'}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-[#3d3b37]" />

          {/* Black Accuracy */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[#8b8987] block font-bold uppercase">Precisione Nero</span>
              <span className="text-xs font-semibold text-white">
                {review.blackAccuracy > 80 ? 'Partita Magistrale' : 'Partita Solida'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#302e2b] border border-white/30 text-white font-black text-sm flex items-center justify-center shadow-md">
              {review.blackAccuracy}%
            </div>
          </div>
        </div>
      )}

      {/* Main Board Area with Evaluation Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#262522] rounded-t-xl border border-b-0 border-[#3d3b37] shrink-0">
        <span className="text-[11px] font-bold text-[#8b8987] uppercase">Valutazione Motore</span>
        <div className="flex items-center gap-1.5 bg-[#302e2b] px-2 py-0.5 rounded border border-[#3d3b37]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] animate-pulse" />
          <span className="text-xs font-mono font-bold text-white">
            {liveEval?.isMate && liveEval?.mateIn !== undefined
              ? (liveEval.mateIn > 0 ? `M${liveEval.mateIn}` : `-M${Math.abs(liveEval.mateIn)}`)
              : liveEval?.score !== undefined
              ? (liveEval.score > 0 ? `+${(liveEval.score / 100).toFixed(1)}` : (liveEval.score / 100).toFixed(1))
              : '0.0'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center w-full my-auto shrink-0 mb-1.5">
        <ChessBoard
          game={game}
          theme={boardTheme}
          interactive={false}
          lastMove={lastMove}
          bestMoveArrow={bestMoveArrow}
          moveBadge={
            currentClassifiedMove && lastMove
              ? {
                  square: lastMove.to,
                  symbol: getBadgeDetails(currentClassifiedMove.classification).icon,
                  color: getBadgeDetails(currentClassifiedMove.classification).color,
                }
              : null
          }
          onMove={() => false}
        />
      </div>

      {/* Current Move Classification Explanation Box */}
      {currentClassifiedMove && (
        <div className="bg-[#262522] border border-[#3d3b37] rounded-xl p-2.5 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {getBadgeDetails(currentClassifiedMove.classification).icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">
                  {currentPly}. {currentClassifiedMove.san}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                  style={{
                    backgroundColor: getBadgeDetails(currentClassifiedMove.classification).bg,
                    color: getBadgeDetails(currentClassifiedMove.classification).color,
                  }}
                >
                  {getBadgeDetails(currentClassifiedMove.classification).label}
                </span>
              </div>
              <p className="text-[11px] text-[#c3c1be] mt-0.5">
                {currentClassifiedMove.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advantage Graph */}
      <div className="mb-2">
        <AdvantageGraph
          data={review?.advantageCurve || []}
          currentMoveIndex={currentPly > 0 ? currentPly - 1 : 0}
          onSelectMove={(idx) => goToPly(idx + 1)}
          height={75}
        />
      </div>

      {/* Move Stepper Controls */}
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        <button
          onClick={() => goToPly(0)}
          disabled={currentPly === 0}
          className="flex items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-30 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => goToPly(currentPly - 1)}
          disabled={currentPly === 0}
          className="flex items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-30 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center justify-center py-2 bg-[#81b64c] hover:bg-[#96c95d] text-white rounded-xl transition-colors cursor-pointer shadow-md"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={() => goToPly(currentPly + 1)}
          disabled={currentPly >= totalPlies}
          className="flex items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-30 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => goToPly(totalPlies)}
          disabled={currentPly >= totalPlies}
          className="flex items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-30 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Move History Table */}
      <MoveHistory
        moves={movesHistory}
        classifiedMoves={review?.classifiedMoves}
        currentMoveIndex={currentPly > 0 ? currentPly - 1 : -1}
        onSelectMove={(idx) => goToPly(idx + 1)}
      />

      {/* Chess.com Import Modal */}
      <ChessComImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSelectGame={(pgn) => {
          setCurrentPgn(pgn);
          loadPgnIntoBoard(pgn);
        }}
      />

      {/* Paste PGN Modal */}
      {isPgnModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-white font-bold text-base mb-2">Incolla PGN</h3>
            <p className="text-xs text-[#8b8987] mb-3">
              Incolla la notazione PGN completa di qualsiasi partita per caricarla nell'analizzatore.
            </p>
            <textarea
              rows={6}
              value={customPgnInput}
              onChange={(e) => setCustomPgnInput(e.target.value)}
              placeholder="1. e4 e5 2. Nf3 Nc6..."
              className="w-full bg-[#302e2b] border border-[#3d3b37] rounded-xl p-3 text-xs text-white font-mono placeholder-[#8b8987] focus:outline-hidden focus:border-[#81b64c] resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsPgnModalOpen(false)}
                className="flex-1 bg-[#302e2b] hover:bg-[#3d3b37] text-white py-2.5 rounded-xl text-xs font-semibold border border-[#4d4b46] cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  setCurrentPgn(customPgnInput);
                  loadPgnIntoBoard(customPgnInput);
                  setIsPgnModalOpen(false);
                }}
                className="flex-1 bg-[#81b64c] hover:bg-[#96c95d] text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Carica Partita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
