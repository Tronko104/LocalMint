import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { BotSelectorModal } from '../components/BotSelectorModal';
import { GameOverModal } from '../components/GameOverModal';
import type { Bot, Evaluation, BoardTheme, PieceType } from '../types/chess';
import { BOTS } from '../data/bots';
import { stockfish } from '../utils/stockfishWorker';
import { soundManager } from '../utils/audio';
import { Lightbulb, RotateCcw, Flag, Shuffle, RefreshCw, Bot as BotIcon, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayViewProps {
  onAnalyzeGame: (pgn: string) => void;
  boardTheme: BoardTheme;
}

export const PlayView: React.FC<PlayViewProps> = ({ onAnalyzeGame, boardTheme }) => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [currentBot, setCurrentBot] = useState<Bot>(BOTS[3]); // Nelson default
  const [isBotSelectorOpen, setIsBotSelectorOpen] = useState(false);
  const [playMode, setPlayMode] = useState<'bot' | 'pass'>('bot');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [bestMoveArrow, setBestMoveArrow] = useState<{ from: string; to: string } | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameOverState, setGameOverState] = useState<{
    isOpen: boolean;
    message: string;
    isWin: boolean;
    isDraw: boolean;
  }>({
    isOpen: false,
    message: '',
    isWin: false,
    isDraw: false,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stockfish.stop();
    };
  }, []);

  // Update evaluation
  const updateEval = useCallback(async (currentFen: string) => {
    const ev = await stockfish.evaluatePosition(currentFen, 10);
    if (isMounted.current) {
      setEvaluation(ev);
    }
  }, []);

  // Check game over
  const checkGameOver = useCallback(
    (chessInstance: Chess) => {
      if (chessInstance.isGameOver()) {
        let msg = '';
        let win = false;
        let draw = false;

        if (chessInstance.isCheckmate()) {
          const winnerColor = chessInstance.turn() === 'w' ? 'Nero' : 'Bianco';
          win = (winnerColor === 'Bianco' && orientation === 'white') || (winnerColor === 'Nero' && orientation === 'black');
          msg = `Scacco matto! Vince il ${winnerColor}.`;
          if (win) {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          }
        } else if (chessInstance.isDraw()) {
          draw = true;
          if (chessInstance.isStalemate()) msg = 'Patta per stallo (nessuna mossa legale).';
          else if (chessInstance.isThreefoldRepetition()) msg = 'Patta per tripla ripetizione.';
          else if (chessInstance.isInsufficientMaterial()) msg = 'Patta per materiale insufficiente.';
          else msg = 'Patta per regola delle 50 mosse.';
        }

        soundManager.playGameOver(win);
        setGameOverState({
          isOpen: true,
          message: msg,
          isWin: win,
          isDraw: draw,
        });
      }
    },
    [orientation]
  );

  // Trigger bot move
  const triggerBotMove = useCallback(
    async (chessInstance: Chess) => {
      if (playMode !== 'bot' || chessInstance.isGameOver() || isBotThinking) return;

      const botColor = orientation === 'white' ? 'b' : 'w';
      if (chessInstance.turn() !== botColor) return;

      setIsBotThinking(true);
      try {
        const { bestMove } = await stockfish.getBotMove(chessInstance.fen(), currentBot);
        if (!isMounted.current) return;

        if (bestMove && bestMove.length >= 4) {
          const from = bestMove.slice(0, 2);
          const to = bestMove.slice(2, 4);
          const promotion = bestMove.length > 4 ? bestMove[4] : undefined;

          const newGame = new Chess(chessInstance.fen());
          const moveRes = newGame.move({ from, to, promotion });

          if (moveRes) {
            if (moveRes.captured) soundManager.playCapture();
            else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) soundManager.playCastle();
            else soundManager.playMove();

            if (newGame.inCheck()) soundManager.playCheck();

            setGame(newGame);
            setLastMove({ from, to });
            setBestMoveArrow(null);
            updateEval(newGame.fen());
            checkGameOver(newGame);
          }
        }
      } finally {
        if (isMounted.current) {
          setIsBotThinking(false);
        }
      }
    },
    [playMode, orientation, isBotThinking, currentBot, updateEval, checkGameOver]
  );

  // Handle user move
  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    if (isBotThinking || game.isGameOver()) return false;

    // Check turn
    if (playMode === 'bot') {
      const userColor = orientation === 'white' ? 'w' : 'b';
      if (game.turn() !== userColor) return false;
    }

    try {
      const newGame = new Chess(game.fen());
      const moveRes = newGame.move({ from, to, promotion: promotion || 'q' });

      if (!moveRes) return false;

      // Sound
      if (moveRes.captured) soundManager.playCapture();
      else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) soundManager.playCastle();
      else soundManager.playMove();

      if (newGame.inCheck()) soundManager.playCheck();

      setGame(newGame);
      setLastMove({ from, to });
      setBestMoveArrow(null);
      updateEval(newGame.fen());

      if (newGame.isGameOver()) {
        checkGameOver(newGame);
      } else {
        setTimeout(() => triggerBotMove(newGame), 250);
      }

      return true;
    } catch {
      soundManager.playError();
      return false;
    }
  };

  // Actions
  const handleTakeback = () => {
    if (isBotThinking) return;
    const newGame = new Chess(game.fen());
    // In bot mode, undo bot move and user move (2 plies)
    if (playMode === 'bot') {
      newGame.undo();
      newGame.undo();
    } else {
      newGame.undo();
    }
    setGame(newGame);
    setLastMove(null);
    setBestMoveArrow(null);
    updateEval(newGame.fen());
  };

  const handleHint = async () => {
    const ev = await stockfish.evaluatePosition(game.fen(), 12);
    if (ev.bestMove && ev.bestMove.length >= 4) {
      setBestMoveArrow({
        from: ev.bestMove.slice(0, 2),
        to: ev.bestMove.slice(2, 4),
      });
    }
  };

  const handleResign = () => {
    const winnerColor = orientation === 'white' ? 'Nero' : 'Bianco';
    setGameOverState({
      isOpen: true,
      message: `Hai abbandonato la partita. Vince il ${winnerColor}.`,
      isWin: false,
      isDraw: false,
    });
    soundManager.playGameOver(false);
  };

  const handleNewGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setLastMove(null);
    setBestMoveArrow(null);
    setEvaluation(null);
    setGameOverState({ isOpen: false, message: '', isWin: false, isDraw: false });

    if (orientation === 'black' && playMode === 'bot') {
      setTimeout(() => triggerBotMove(newGame), 300);
    }
  };

  // Captured pieces & material calculation
  const captured = React.useMemo(() => {
    const history = game.history({ verbose: true });
    const whiteCaptured: PieceType[] = [];
    const blackCaptured: PieceType[] = [];

    for (const move of history) {
      if (move.captured) {
        if (move.color === 'w') {
          whiteCaptured.push(move.captured as PieceType);
        } else {
          blackCaptured.push(move.captured as PieceType);
        }
      }
    }

    const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const sortVal = (a: PieceType, b: PieceType) => (pieceValues[b] || 0) - (pieceValues[a] || 0);
    whiteCaptured.sort(sortVal);
    blackCaptured.sort(sortVal);

    const whiteScore = whiteCaptured.reduce((sum, p) => sum + (pieceValues[p] || 0), 0);
    const blackScore = blackCaptured.reduce((sum, p) => sum + (pieceValues[p] || 0), 0);
    const diff = whiteScore - blackScore;

    return {
      whiteCaptured,
      blackCaptured,
      whiteAdvantage: diff > 0 ? `+${diff}` : null,
      blackAdvantage: diff < 0 ? `+${Math.abs(diff)}` : null,
    };
  }, [game]);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-2 py-1 justify-between select-none">
      {/* Top Bar Mode & Bot Selector */}
      <div className="flex items-center justify-between px-1 py-0.5 shrink-0">
        <div className="flex bg-[#21201d] rounded-lg p-0.5 border border-[#3d3b37]">
          <button
            onClick={() => setPlayMode('bot')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              playMode === 'bot' ? 'bg-[#81b64c] text-white shadow-xs' : 'text-[#8b8987] hover:text-white'
            }`}
          >
            <BotIcon className="w-3.5 h-3.5" />
            Contro Bot
          </button>
          <button
            onClick={() => setPlayMode('pass')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              playMode === 'pass' ? 'bg-[#81b64c] text-white shadow-xs' : 'text-[#8b8987] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            2 Giocatori
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {evaluation && (
            <div className="flex items-center gap-1 bg-[#21201d] px-2 py-1 rounded-lg border border-[#3d3b37] text-[10px] font-mono font-bold text-[#c3c1be]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] animate-pulse" />
              <span>
                {evaluation.isMate && evaluation.mateIn !== undefined
                  ? (evaluation.mateIn > 0 ? `M${evaluation.mateIn}` : `-M${Math.abs(evaluation.mateIn)}`)
                  : evaluation.score !== undefined
                  ? (evaluation.score > 0 ? `+${(evaluation.score / 100).toFixed(1)}` : (evaluation.score / 100).toFixed(1))
                  : '0.0'}
              </span>
            </div>
          )}

          {playMode === 'bot' && (
            <button
              onClick={() => setIsBotSelectorOpen(true)}
              className="flex items-center gap-1.5 bg-[#262522] hover:bg-[#302e2b] border border-[#3d3b37] px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span>{currentBot.avatar}</span>
              <span className="font-bold">{currentBot.name}</span>
              <span className="text-[10px] text-[#81b64c] font-black bg-[#81b64c]/15 px-1 py-0.2 rounded">
                {currentBot.elo}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Opponent Card (Top) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#262522] rounded-xl border border-[#3d3b37] shrink-0 my-0.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#302e2b] border border-[#4d4b46] flex items-center justify-center text-lg shrink-0 shadow-inner">
            {playMode === 'bot' ? currentBot.avatar : '♟️'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs truncate max-w-[130px]">
                {playMode === 'bot' ? currentBot.name : 'Giocatore 2 (Nero)'}
              </span>
              {playMode === 'bot' && (
                <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1 rounded">
                  {currentBot.elo}
                </span>
              )}
            </div>
            {/* Captured Pieces by Opponent */}
            <div className="flex items-center gap-1 mt-0.5 h-3.5">
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {(orientation === 'white' ? captured.blackCaptured : captured.whiteCaptured).map((p, idx) => (
                  <span key={idx} className="text-[11px] leading-none select-none text-[#edeed1]">
                    {p === 'q' ? '♕' : p === 'r' ? '♖' : p === 'b' ? '♗' : p === 'n' ? '♘' : '♙'}
                  </span>
                ))}
              </div>
              {(orientation === 'white' ? captured.blackAdvantage : captured.whiteAdvantage) && (
                <span className="text-[10px] font-black text-[#c3c1be]">
                  {orientation === 'white' ? captured.blackAdvantage : captured.whiteAdvantage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side thinking status */}
        <div className="flex items-center gap-2 shrink-0">
          {isBotThinking ? (
            <div className="flex items-center gap-1 bg-[#81b64c]/20 border border-[#81b64c]/40 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] animate-ping" />
              <span className="text-[10px] font-bold text-[#81b64c]">Calcolo...</span>
            </div>
          ) : (
            <div className="text-[10px] font-semibold text-[#8b8987] bg-[#302e2b] px-2 py-0.5 rounded-md border border-[#3d3b37]">
              {game.turn() === (orientation === 'white' ? 'b' : 'w') ? 'Mossa in corso' : 'In attesa'}
            </div>
          )}
        </div>
      </div>

      {/* Main Board Area (Strict 1:1 Aspect Ratio) */}
      <div className="flex items-center justify-center w-full my-auto shrink-0">
        <ChessBoard
          game={game}
          orientation={orientation}
          theme={boardTheme}
          interactive={!isBotThinking && !game.isGameOver()}
          lastMove={lastMove}
          bestMoveArrow={bestMoveArrow}
          onMove={handleMove}
        />
      </div>

      {/* User Card (Bottom) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#262522] rounded-xl border border-[#3d3b37] shrink-0 my-0.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#81b64c]/20 border border-[#81b64c]/50 flex items-center justify-center text-xs font-black text-[#81b64c] shrink-0 shadow-inner">
            Tu
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs">Tu ({orientation === 'white' ? 'Bianco' : 'Nero'})</span>
              <span className="text-[10px] font-semibold text-[#8b8987]">1200</span>
            </div>
            {/* Captured Pieces by User */}
            <div className="flex items-center gap-1 mt-0.5 h-3.5">
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {(orientation === 'white' ? captured.whiteCaptured : captured.blackCaptured).map((p, idx) => (
                  <span key={idx} className="text-[11px] leading-none select-none text-[#8b8987]">
                    {p === 'q' ? '♛' : p === 'r' ? '♜' : p === 'b' ? '♝' : p === 'n' ? '♞' : '♟'}
                  </span>
                ))}
              </div>
              {(orientation === 'white' ? captured.whiteAdvantage : captured.blackAdvantage) && (
                <span className="text-[10px] font-black text-[#81b64c]">
                  {orientation === 'white' ? captured.whiteAdvantage : captured.blackAdvantage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Turn Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          {game.turn() === (orientation === 'white' ? 'w' : 'b') && !game.isGameOver() && (
            <div className="flex items-center gap-1 bg-[#81b64c]/20 border border-[#81b64c]/40 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#81b64c] animate-pulse" />
              <span className="text-[10px] font-bold text-[#81b64c]">Tocca a te</span>
            </div>
          )}
        </div>
      </div>

      {/* Move History Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-2 py-1 bg-[#262522] rounded-lg border border-[#3d3b37] text-xs font-mono shrink-0 custom-scrollbar">
        {game.history().length === 0 ? (
          <span className="text-[10px] text-[#8b8987] italic">In attesa della prima mossa...</span>
        ) : (
          game.history().map((m, idx) => (
            <span
              key={idx}
              className={`shrink-0 px-1 py-0.5 rounded text-[10px] font-bold ${
                idx === game.history().length - 1
                  ? 'bg-[#81b64c] text-white'
                  : 'text-[#c3c1be] bg-[#302e2b]'
              }`}
            >
              {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
              {m}
            </span>
          ))
        )}
      </div>

      {/* Action Controls Bar */}
      <div className="grid grid-cols-5 gap-1 shrink-0 mt-0.5">
        <button
          onClick={handleHint}
          disabled={isBotThinking || game.isGameOver()}
          className="flex flex-col items-center justify-center py-1.5 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-40 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Suggerimento Stockfish"
        >
          <Lightbulb className="w-4 h-4 text-[#f0c15c] mb-0.5" />
          <span className="text-[9px] font-bold text-[#c3c1be]">Aiuto</span>
        </button>

        <button
          onClick={handleTakeback}
          disabled={isBotThinking || game.history().length === 0}
          className="flex flex-col items-center justify-center py-1.5 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-40 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Ritira mossa"
        >
          <RotateCcw className="w-4 h-4 text-[#5c8bb0] mb-0.5" />
          <span className="text-[9px] font-bold text-[#c3c1be]">Ritira</span>
        </button>

        <button
          onClick={() => setOrientation((prev) => (prev === 'white' ? 'black' : 'white'))}
          className="flex flex-col items-center justify-center py-1.5 bg-[#262522] hover:bg-[#302e2b] border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Capovolgi scacchiera"
        >
          <Shuffle className="w-4 h-4 text-[#86a666] mb-0.5" />
          <span className="text-[9px] font-bold text-[#c3c1be]">Ruota</span>
        </button>

        <button
          onClick={handleResign}
          disabled={game.isGameOver() || game.history().length === 0}
          className="flex flex-col items-center justify-center py-1.5 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-40 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Abbandona la partita"
        >
          <Flag className="w-4 h-4 text-[#ca3431] mb-0.5" />
          <span className="text-[9px] font-bold text-[#c3c1be]">Resa</span>
        </button>

        <button
          onClick={handleNewGame}
          className="flex flex-col items-center justify-center py-1.5 bg-[#81b64c] hover:bg-[#96c95d] rounded-xl text-white font-bold transition-transform active:scale-95 cursor-pointer shadow-md"
          title="Nuova Partita"
        >
          <RefreshCw className="w-4 h-4 mb-0.5" />
          <span className="text-[9px]">Nuova</span>
        </button>
      </div>

      {/* Bot Selector Modal */}
      <BotSelectorModal
        currentBot={currentBot}
        isOpen={isBotSelectorOpen}
        onClose={() => setIsBotSelectorOpen(false)}
        onSelectBot={(bot) => {
          setCurrentBot(bot);
          handleNewGame();
        }}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameOverState.isOpen}
        onClose={() => setGameOverState((prev) => ({ ...prev, isOpen: false }))}
        resultMessage={gameOverState.message}
        isWin={gameOverState.isWin}
        isDraw={gameOverState.isDraw}
        onRematch={handleNewGame}
        onAnalyze={() => onAnalyzeGame(game.pgn())}
      />
    </div>
  );
};
