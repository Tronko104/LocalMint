import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { EvaluationBar } from '../components/EvaluationBar';
import { BotSelectorModal } from '../components/BotSelectorModal';
import { GameOverModal } from '../components/GameOverModal';
import type { Bot, Evaluation, BoardTheme } from '../types/chess';
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

  // Material advantage calculation
  const getMaterialAdvantage = () => {
    const board = game.board();
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let whiteScore = 0;
    let blackScore = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === 'w') whiteScore += values[piece.type];
          else blackScore += values[piece.type];
        }
      }
    }

    const diff = whiteScore - blackScore;
    return {
      whiteAdv: diff > 0 ? `+${diff}` : null,
      blackAdv: diff < 0 ? `+${Math.abs(diff)}` : null,
    };
  };

  const material = getMaterialAdvantage();

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto w-full px-2 py-2">
      {/* Top Bar Mode Selector */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex bg-[#21201d] rounded-lg p-0.5 border border-[#3d3b37]">
          <button
            onClick={() => setPlayMode('bot')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              playMode === 'bot' ? 'bg-[#81b64c] text-white shadow-xs' : 'text-[#8b8987] hover:text-white'
            }`}
          >
            <BotIcon className="w-3.5 h-3.5" />
            Contro Bot
          </button>
          <button
            onClick={() => setPlayMode('pass')}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              playMode === 'pass' ? 'bg-[#81b64c] text-white shadow-xs' : 'text-[#8b8987] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            2 Giocatori
          </button>
        </div>

        {playMode === 'bot' && (
          <button
            onClick={() => setIsBotSelectorOpen(true)}
            className="flex items-center gap-1.5 bg-[#262522] hover:bg-[#302e2b] border border-[#3d3b37] px-2.5 py-1 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <span>{currentBot.avatar}</span>
            <span className="font-semibold">{currentBot.name}</span>
            <span className="text-[10px] text-[#81b64c] font-bold bg-[#81b64c]/15 px-1 rounded">
              {currentBot.elo}
            </span>
          </button>
        )}
      </div>

      {/* Opponent Card (Top) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#262522] rounded-t-lg border border-b-0 border-[#3d3b37]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#302e2b] border border-[#4d4b46] flex items-center justify-center text-lg">
            {playMode === 'bot' ? currentBot.avatar : '♟️'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs">
                {playMode === 'bot' ? currentBot.name : 'Giocatore 2 (Nero)'}
              </span>
              {playMode === 'bot' && (
                <span className="text-[10px] font-bold text-[#81b64c]">({currentBot.elo})</span>
              )}
            </div>
            {isBotThinking && (
              <span className="text-[10px] text-[#81b64c] font-semibold animate-pulse">
                Sto pensando alla mossa...
              </span>
            )}
          </div>
        </div>
        {material.blackAdv && (
          <span className="text-[11px] font-bold text-[#c3c1be] bg-[#302e2b] px-1.5 py-0.5 rounded border border-[#4d4b46]">
            {material.blackAdv}
          </span>
        )}
      </div>

      {/* Main Board Area with Vertical Eval Bar */}
      <div className="flex gap-2 items-stretch justify-center w-full">
        {/* Evaluation Bar */}
        <div className="hidden sm:block">
          <EvaluationBar evaluation={evaluation} orientation={orientation} />
        </div>

        {/* Board */}
        <div className="flex-1 max-w-[480px]">
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
      </div>

      {/* User Card (Bottom) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#262522] rounded-b-lg border border-t-0 border-[#3d3b37]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-sm font-bold text-[#81b64c]">
            Tu
          </div>
          <div>
            <span className="font-bold text-white text-xs">Tu (Bianco)</span>
            <div className="text-[10px] text-[#8b8987]">Motore Stockfish 19 NNUE Attivo</div>
          </div>
        </div>
        {material.whiteAdv && (
          <span className="text-[11px] font-bold text-[#c3c1be] bg-[#302e2b] px-1.5 py-0.5 rounded border border-[#4d4b46]">
            {material.whiteAdv}
          </span>
        )}
      </div>

      {/* Action Controls Bar */}
      <div className="grid grid-cols-5 gap-1.5 mt-2.5">
        <button
          onClick={handleHint}
          disabled={isBotThinking || game.isGameOver()}
          className="flex flex-col items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-40 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Suggerimento Stockfish"
        >
          <Lightbulb className="w-4 h-4 text-[#f0c15c] mb-0.5" />
          <span className="text-[10px] font-medium text-[#c3c1be]">Aiuto</span>
        </button>

        <button
          onClick={handleTakeback}
          disabled={isBotThinking || game.history().length === 0}
          className="flex flex-col items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-40 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Ritira mossa"
        >
          <RotateCcw className="w-4 h-4 text-[#5c8bb0] mb-0.5" />
          <span className="text-[10px] font-medium text-[#c3c1be]">Ritira</span>
        </button>

        <button
          onClick={() => setOrientation((prev) => (prev === 'white' ? 'black' : 'white'))}
          className="flex flex-col items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Capovolgi scacchiera"
        >
          <Shuffle className="w-4 h-4 text-[#86a666] mb-0.5" />
          <span className="text-[10px] font-medium text-[#c3c1be]">Ruota</span>
        </button>

        <button
          onClick={handleResign}
          disabled={game.isGameOver() || game.history().length === 0}
          className="flex flex-col items-center justify-center py-2 bg-[#262522] hover:bg-[#302e2b] disabled:opacity-40 border border-[#3d3b37] rounded-xl text-white transition-colors cursor-pointer"
          title="Abbandona la partita"
        >
          <Flag className="w-4 h-4 text-[#ca3431] mb-0.5" />
          <span className="text-[10px] font-medium text-[#c3c1be]">Resa</span>
        </button>

        <button
          onClick={handleNewGame}
          className="flex flex-col items-center justify-center py-2 bg-[#81b64c] hover:bg-[#96c95d] rounded-xl text-white font-bold transition-transform active:scale-95 cursor-pointer shadow-md"
          title="Nuova Partita"
        >
          <RefreshCw className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Nuova</span>
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
