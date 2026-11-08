import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { BotSelectorModal } from '../components/BotSelectorModal';
import { GameOverModal } from '../components/GameOverModal';
import type { Bot, BoardTheme, Language } from '../types/chess';
import { BOTS } from '../data/bots';
import { stockfish } from '../utils/stockfishWorker';
import { soundManager } from '../utils/audio';
import { translations } from '../utils/i18n';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  List,
  Flag,
  Lightbulb,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Users,
  Bot as BotIcon,
  RefreshCw,
  LineChart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayViewProps {
  language: Language;
  onBack: () => void;
  onAnalyzeGame: (pgn: string) => void;
  boardTheme: BoardTheme;
  initialBotId?: string;
}

export const PlayView: React.FC<PlayViewProps> = ({
  language,
  onBack,
  onAnalyzeGame,
  boardTheme,
  initialBotId,
}) => {
  const t = translations[language];

  // Select initial bot (Wendy default if available, or Nelson)
  const defaultBot = BOTS.find((b) => b.id === initialBotId) || BOTS[1] || BOTS[0];
  const [currentBot, setCurrentBot] = useState<Bot>(defaultBot);
  const [game, setGame] = useState<Chess>(new Chess());
  const [isBotSelectorOpen, setIsBotSelectorOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [playMode, setPlayMode] = useState<'bot' | 'pass'>('bot');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [bestMoveArrow, setBestMoveArrow] = useState<{ from: string; to: string } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<string>(
    defaultBot.quotes?.start[language] ||
      (language === 'it'
        ? 'Mi chiedo quanti pezzi potrei sacrificare prima di attaccare il tuo Re...'
        : 'I wonder how many pieces I could sacrifice before attacking your King...')
  );

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

  // Update bot if initialBotId changes
  useEffect(() => {
    if (initialBotId) {
      const b = BOTS.find((bot) => bot.id === initialBotId);
      if (b) {
        setCurrentBot(b);
        setCurrentSpeech(b.quotes?.start[language] || '');
      }
    }
  }, [initialBotId, language]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stockfish.stop();
    };
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
          win =
            (winnerColor === 'Bianco' && orientation === 'white') ||
            (winnerColor === 'Nero' && orientation === 'black');

          msg = win
            ? language === 'it'
              ? 'Scacco matto! Complimenti, hai vinto!'
              : 'Checkmate! Congratulations, you won!'
            : language === 'it'
            ? `Scacco matto! Vince ${currentBot.name}.`
            : `Checkmate! ${currentBot.name} wins.`;

          if (win) {
            confetti({ particleCount: 75, spread: 65, origin: { y: 0.7 } });
            setCurrentSpeech(currentBot.quotes?.lose[language] || 'Ben giocato!');
          } else {
            setCurrentSpeech(currentBot.quotes?.win[language] || 'Scacco matto!');
          }
        } else if (chessInstance.isDraw()) {
          draw = true;
          if (chessInstance.isStalemate()) msg = t.stalemate;
          else msg = language === 'it' ? 'Partita patta.' : 'Game drawn.';
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
    [orientation, currentBot, language, t]
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
            else if (moveRes.flags.includes('k') || moveRes.flags.includes('q'))
              soundManager.playCastle();
            else soundManager.playMove();

            if (newGame.inCheck()) {
              soundManager.playCheck();
              setCurrentSpeech(
                currentBot.quotes?.check[language] ||
                  (language === 'it' ? 'Scacco! Fai attenzione!' : 'Check! Watch out!')
              );
            }

            setGame(newGame);
            setLastMove({ from, to });
            setBestMoveArrow(null);
            checkGameOver(newGame);
          }
        }
      } finally {
        if (isMounted.current) {
          setIsBotThinking(false);
        }
      }
    },
    [playMode, orientation, isBotThinking, currentBot, language, checkGameOver]
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
      else if (moveRes.flags.includes('k') || moveRes.flags.includes('q'))
        soundManager.playCastle();
      else soundManager.playMove();

      if (newGame.inCheck()) soundManager.playCheck();

      setGame(newGame);
      setLastMove({ from, to });
      setBestMoveArrow(null);

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
    if (window.confirm(t.resignConfirm)) {
      setGameOverState({
        isOpen: true,
        message: t.resignedYou,
        isWin: false,
        isDraw: false,
      });
      soundManager.playGameOver(false);
      setCurrentSpeech(
        currentBot.quotes?.win[language] ||
          (language === 'it' ? 'Grazie per la partita!' : 'Thanks for the game!')
      );
    }
  };

  const handleNewGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setLastMove(null);
    setBestMoveArrow(null);
    setGameOverState({ isOpen: false, message: '', isWin: false, isDraw: false });
    setCurrentSpeech(currentBot.quotes?.start[language] || '');
    setIsOptionsMenuOpen(false);

    if (orientation === 'black' && playMode === 'bot') {
      setTimeout(() => triggerBotMove(newGame), 300);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full select-none justify-between bg-[#302e2b] text-white">
      {/* Top Header matching Chess.com Bot Screen (Screenshot 234028): Back Arrow, Logo, Gear */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3d3b37]/50 shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#c3c1be] hover:text-white hover:bg-[#3d3b37]/50 active:scale-95 transition-all cursor-pointer"
          title={t.back}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Logo styled like Chess.com */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsBotSelectorOpen(true)}>
          <div className="w-5 h-5 rounded-md bg-[#81b64c] flex items-center justify-center text-xs font-black text-[#262522]">
            ♟
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            LocalMint<span className="text-[#81b64c]">.com</span>
          </span>
        </div>

        {/* Right Settings / Options Gear */}
        <button
          onClick={() => setIsOptionsMenuOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#c3c1be] hover:text-white hover:bg-[#3d3b37]/50 active:scale-95 transition-all cursor-pointer"
          title={t.options}
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Bot Portrait & Authentic Comic Speech Bubble (Screenshot 234028) */}
      <div className="px-3 pt-1 shrink-0">
        <div className="flex items-end gap-2.5">
          {/* Bot Avatar */}
          <div
            onClick={() => setIsBotSelectorOpen(true)}
            className="w-12 h-12 rounded-2xl bg-[#262522] border-2 border-[#81b64c]/60 flex items-center justify-center text-2xl shrink-0 shadow-md cursor-pointer relative overflow-hidden"
            title={`${currentBot.name} (${currentBot.elo})`}
          >
            <span>{currentBot.avatar}</span>
            {isBotThinking && (
              <span className="absolute inset-0 bg-[#81b64c]/30 animate-pulse flex items-center justify-center text-[9px] font-black">
                ...
              </span>
            )}
          </div>

          {/* Comic Speech Bubble with triangular pointer */}
          <div className="flex-1 relative bg-white text-[#21201d] rounded-2xl p-2.5 shadow-lg border border-black/10">
            {/* Bubble Tail pointing to avatar */}
            <div
              className="absolute -left-1.5 bottom-3 w-3 h-3 bg-white rotate-45 border-l border-b border-black/10"
              style={{ clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }}
            />
            <p className="text-xs font-semibold leading-snug line-clamp-2">
              {currentSpeech}
            </p>
          </div>
        </div>
      </div>

      {/* Main Board Area (Strict 1:1 Aspect Ratio) */}
      <div className="flex items-center justify-center w-full my-auto shrink-0 px-2">
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

      {/* Move History Navigation Ribbon with Chevrons (Screenshot 234028) */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#262522] border-y border-[#3d3b37] shrink-0 text-xs font-mono">
        <button
          onClick={handleTakeback}
          disabled={game.history().length === 0}
          className="p-1 text-[#8b8987] hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar px-2 justify-center">
          {game.history().length === 0 ? (
            <span className="text-[11px] text-[#8b8987] font-sans italic">
              {language === 'it' ? 'Partita iniziata' : 'Game started'}
            </span>
          ) : (
            game.history().map((m, idx) => (
              <span
                key={idx}
                className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  idx === game.history().length - 1
                    ? 'bg-[#3d3b37] text-white border border-[#81b64c]/40'
                    : 'text-[#8b8987]'
                }`}
              >
                {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                {m}
              </span>
            ))
          )}
        </div>

        <button
          disabled={true}
          className="p-1 text-[#8b8987] opacity-30 cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Action Bar matching Chess.com Screenshot 234028: Opzioni, Abbandona, Suggerimento, Annulla */}
      <div className="grid grid-cols-4 bg-[#262522] border-t border-[#3d3b37] shrink-0 pb-1">
        {/* 1. Opzioni (Options) */}
        <button
          onClick={() => setIsOptionsMenuOpen(true)}
          className="flex flex-col items-center justify-center py-2 text-[#8b8987] hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <List className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">{t.options}</span>
        </button>

        {/* 2. Abbandona (Resign) */}
        <button
          onClick={handleResign}
          disabled={game.isGameOver() || game.history().length === 0}
          className="flex flex-col items-center justify-center py-2 text-[#8b8987] hover:text-[#ca3431] disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
        >
          <Flag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">{t.resign}</span>
        </button>

        {/* 3. Suggerimento (Hint) */}
        <button
          onClick={handleHint}
          disabled={isBotThinking || game.isGameOver()}
          className="flex flex-col items-center justify-center py-2 text-[#8b8987] hover:text-[#f0c15c] disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
        >
          <Lightbulb className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">{t.hint}</span>
        </button>

        {/* 4. Annulla (Undo) */}
        <button
          onClick={handleTakeback}
          disabled={isBotThinking || game.history().length === 0}
          className="flex flex-col items-center justify-center py-2 text-[#8b8987] hover:text-white disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">{t.undo}</span>
        </button>
      </div>

      {/* Options Menu Modal */}
      {isOptionsMenuOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-3 backdrop-blur-xs">
          <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-4 shadow-2xl max-w-sm w-full animate-in slide-in-from-bottom-5 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d3b37] mb-3">
              <h3 className="text-sm font-bold text-white">{t.gameOptions}</h3>
              <button
                onClick={() => setIsOptionsMenuOpen(false)}
                className="text-[#8b8987] hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsOptionsMenuOpen(false);
                  setIsBotSelectorOpen(true);
                }}
                className="flex items-center justify-between p-3 bg-[#302e2b] hover:bg-[#3d3b37] rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BotIcon className="w-4 h-4 text-[#81b64c]" />
                  <div>
                    <span className="text-xs font-bold text-white block">{t.switchBot}</span>
                    <span className="text-[10px] text-[#8b8987]">
                      {currentBot.name} ({currentBot.elo})
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#81b64c] font-bold">›</span>
              </button>

              <button
                onClick={() => {
                  setPlayMode((prev) => (prev === 'bot' ? 'pass' : 'bot'));
                  setIsOptionsMenuOpen(false);
                }}
                className="flex items-center justify-between p-3 bg-[#302e2b] hover:bg-[#3d3b37] rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#5c8bb0]" />
                  <div>
                    <span className="text-xs font-bold text-white block">{t.passAndPlay}</span>
                    <span className="text-[10px] text-[#8b8987]">
                      {playMode === 'pass' ? 'Attivo' : 'Disattivato'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#8b8987]">
                  {playMode === 'pass' ? '✓' : ''}
                </span>
              </button>

              <button
                onClick={() => {
                  setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
                  setIsOptionsMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 bg-[#302e2b] hover:bg-[#3d3b37] rounded-xl text-left cursor-pointer transition-colors"
              >
                <Shuffle className="w-4 h-4 text-[#86a666]" />
                <span className="text-xs font-bold text-white">{t.flipBoard}</span>
              </button>

              <button
                onClick={() => {
                  setIsOptionsMenuOpen(false);
                  onAnalyzeGame(game.pgn());
                }}
                disabled={game.history().length === 0}
                className="flex items-center gap-2.5 p-3 bg-[#302e2b] hover:bg-[#3d3b37] disabled:opacity-40 rounded-xl text-left cursor-pointer transition-colors"
              >
                <LineChart className="w-4 h-4 text-[#3b9ae1]" />
                <span className="text-xs font-bold text-white">{t.gameReview}</span>
              </button>

              <button
                onClick={handleNewGame}
                className="flex items-center gap-2.5 p-3 bg-[#81b64c] hover:bg-[#96c95d] rounded-xl text-white font-bold cursor-pointer transition-transform active:scale-95 shadow-md mt-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs">{t.newGame}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
