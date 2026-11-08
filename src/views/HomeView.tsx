import React from 'react';
import type { Language } from '../types/chess';
import { translations } from '../utils/i18n';
import { BOTS } from '../data/bots';
import {
  Flame,
  Diamond,
  Users,
  Bell,
  GraduationCap,
  Timer,
  Zap,
  Crosshair,
  Star,
  Swords,
  ChevronRight,
  Puzzle,
} from 'lucide-react';

interface HomeViewProps {
  language: Language;
  onPlayVsBot: (botId?: string) => void;
  onSolvePuzzles: () => void;
  onReviewGame: (pgn: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onPlayVsBot,
  onSolvePuzzles,
  onReviewGame,
}) => {
  const t = translations[language];

  // Sample recent games matching the Chess.com history screenshot
  const recentGames = [
    {
      id: 'g1',
      opponent: 'wunsell',
      elo: 750,
      avatar: '🧑‍💻',
      type: 'rapid',
      result: 'win',
      accuracy: 84.2,
      pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6 5. d3 d6 6. c3 O-O 7. Re1 a6 8. Bb3 Ba7 9. Nbd2 Be6 10. Nf1 Bxb3 11. Qxb3 Qd7 12. Ng3 Ne7 13. Bg5 Ng4 14. Re2 Ng6 15. h3 Nf6 16. Bxf6 gxf6 17. Nh5 Qe7 18. Nh4 Nxh4 19. Kh2 Kh8 20. f4 Rg8 21. Rf1 Rg6 22. f5 Rg5 23. g4 Rag8 24. Kg3 Rxh5 25. Rh2 Nxf5+ 26. exf5 Rhg5 27. Kf3 c6 28. Rg2 d5 29. Re1 e4+ 30. dxe4 dxe4+ 31. Rxe4 Qd6 32. Qxf7 Qd3+ 33. Kf4 Bb8+ 34. Re5 Bxe5# 0-1',
    },
    {
      id: 'g2',
      opponent: 'AxiomaticRealism',
      elo: 820,
      avatar: '♟️',
      type: 'rapid',
      result: 'win',
      accuracy: 77.4,
      pgn: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 Be7 6. e3 c6 7. Bd3 O-O 8. Qc2 Nbd7 9. Nge2 Re8 10. O-O Nf8 11. f3 Be6 12. Rad1 Rc8 13. e4 dxe4 14. fxe4 c5 15. d5 Bg4 16. Bb5 N6d7 17. Bxe7 Qxe7 18. h3 Bxe2 19. Qxe2 a6 20. d6 Qe6 21. Bc4 Qg6 22. Bxf7+ Qxf7 23. Rxf7 Kxf7 24. Nd5 Ne6 25. Rf1+ Kg8 26. Ne7+ Rxe7 27. dxe7 Re8 28. Qc4 Rxe7 29. Qd5 b5 30. Qa8+ Ndf8 31. Qxa6 b4 32. Qc4 g6 33. Rf6 Kg7 34. e5 h5 35. g4 hxg4 36. hxg4 Re8 37. g5 Re7 38. Qd5 Re8 39. Qd6 Kg8 40. Qc6 Re7 41. Qd6 Re8 42. Kf2 Kg7 43. Ke3 Kg8 44. Kd2 Kg7 45. Kc1 Kg8 46. a3 bxa3 47. bxa3 Kg7 48. a4 Kg8 49. a5 Kg7 50. a6 Kg8 51. a7 Kg7 52. Qb8 1-0',
    },
    {
      id: 'g3',
      opponent: 'Isagiwannabe',
      elo: 790,
      avatar: '⚽',
      type: 'blitz',
      result: 'win',
      accuracy: 73.9,
      pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 11. g4 b5 12. g5 b4 13. Ne2 Ne8 14. h4 a5 15. Kb1 a4 16. Nbc1 b3 17. cxb3 axb3 18. a3 Qb8 19. Nc3 Nc7 20. h5 d5 21. exd5 Bf5+ 22. Bd3 Bxd3+ 23. Nxd3 Nb5 24. Nxb5 Qxb5 25. g6 fxg6 26. hxg6 hxg6 27. Qh2 Bf6 28. Qh7+ Kf7 29. Rhg1 Rh8 30. Qxg6+ Ke7 31. Bg5 Kd6 32. Bxf6 gxf6 33. f4 Rh2 34. fxe5+ Kc7 35. d6+ Kb6 36. Qg3 Rah8 37. Qe3+ Kb7 38. e6 R8h3 39. Qe4+ Ka7 40. exd7 Qxd7 41. Qd4+ Kb8 42. Nc5 Qf5+ 43. Ka1 Rxb2 44. Rg8+ Ka7 45. Qa4+ Kb6 46. Qb4+ Kc6 47. Rc8+ Qxc8 48. Kxb2 Rh2+ 49. Kxb3 Qh3+ 50. Rd3 Qg2 51. Qb7+ Kxc5 52. Rc3+ Kxd6 53. Qc7+ Ke6 54. Re3+ Kf5 55. Qd7+ Kf4 56. Qd4+ Kf5 57. Qd3+ Kf4 58. Qd4+ Kf5 59. Qe4+ Qxe4 1-0',
    },
    {
      id: 'g4',
      opponent: 'alevgzl',
      elo: 810,
      avatar: '♟️',
      type: 'rapid',
      result: 'loss',
      accuracy: 68.5,
      pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 15. a4 c5 16. d5 c4 17. Bg5 h6 18. Be3 Nc5 19. Qd2 h5 20. Bg5 Be7 21. Nh4 Nh7 22. Bxe7 Qxe7 23. Nhf5 gxf5 24. Nxf5 Qf6 25. Re3 Kh8 26. Rf3 Rg8 27. Nh6 Qxf3 0-1',
    },
  ];

  const recommendedBot = BOTS[1]; // Wendy

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar px-3 pb-20 select-none">
      {/* Top Header matching Chess.com: League, Streak, Gems, Friends, Bell */}
      <div className="flex items-center justify-between py-2 shrink-0 border-b border-[#3d3b37]/60">
        <div className="flex items-center gap-2.5">
          {/* Wood League Icon */}
          <div className="flex items-center gap-1 bg-[#262522] border border-[#3d3b37] px-2 py-1 rounded-xl shadow-xs">
            <span className="text-base">🪵</span>
            <span className="text-xs font-black text-[#c3c1be]">{t.woodLeague}</span>
          </div>

          {/* Fire Streak */}
          <div className="flex items-center gap-1 bg-[#262522] border border-[#3d3b37] px-2 py-1 rounded-xl shadow-xs text-[#f08c38]">
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-xs font-black text-white">6</span>
          </div>
        </div>

        {/* Right Action Icons: Diamond, Friends, Bell */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1b82cf]/20 border border-[#1b82cf]/40 flex items-center justify-center text-[#2bb4f3] shadow-xs cursor-pointer">
            <Diamond className="w-4 h-4 fill-current" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#262522] border border-[#3d3b37] flex items-center justify-center text-[#c3c1be] hover:text-white cursor-pointer">
            <Users className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#262522] border border-[#3d3b37] flex items-center justify-center text-[#c3c1be] hover:text-white cursor-pointer relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ca3431]" />
          </div>
        </div>
      </div>

      {/* Learn Carousel Banner matching Chess.com Home */}
      <div className="mt-3 bg-linear-to-r from-[#262522] to-[#2b2a26] border border-[#3d3b37] rounded-2xl p-3.5 relative overflow-hidden shadow-md">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-[#3b9ae1] text-xs font-bold mb-0.5">
              <GraduationCap className="w-4 h-4" />
              <span>{t.learnTitle}</span>
            </div>
            <h3 className="text-sm font-extrabold text-white mb-2">{t.learnSubtitle}</h3>
            <button
              onClick={() => onPlayVsBot(recommendedBot.id)}
              className="bg-[#81b64c] hover:bg-[#96c95d] active:scale-95 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer border-b-2 border-[#5d8b32]"
            >
              {t.nextLesson}
            </button>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-3xl shadow-inner">
            ♟️
          </div>
        </div>
      </div>

      {/* Recommended Opponent Card matching Chess.com */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {t.recommendedOpponent}
          </span>
        </div>

        <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl p-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Chessboard patterned avatar */}
            <div className="w-12 h-12 rounded-xl bg-[#769656] border border-[#4d4b46] flex items-center justify-center text-2xl shadow-inner relative overflow-hidden">
              <span className="relative z-10">{recommendedBot.avatar}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm">{recommendedBot.name}</span>
                <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-1.5 py-0.5 rounded-md">
                  {recommendedBot.elo}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#81b64c] tracking-wider block mt-0.5">
                {t.recentOpponent}
              </span>
            </div>
          </div>

          <button
            onClick={() => onPlayVsBot(recommendedBot.id)}
            className="w-11 h-11 rounded-xl bg-[#81b64c] hover:bg-[#96c95d] active:scale-95 text-white flex items-center justify-center shadow-md transition-transform cursor-pointer border-b-2 border-[#5d8b32]"
            title={t.challenge}
          >
            <Swords className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rankings Grid matching Chess.com (Rapid, Blitz, Bullet, Puzzles) */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs font-bold text-white uppercase tracking-wider">{t.rankings}</span>
          <span className="text-xs font-semibold text-[#8b8987] hover:text-white cursor-pointer">
            {t.showAll}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Rapid */}
          <div className="bg-[#262522] border border-[#3d3b37] rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
            <Timer className="w-5 h-5 text-[#81b64c] mb-1" />
            <span className="text-sm font-black text-white">850</span>
            <span className="text-[10px] font-bold text-[#8b8987]">{t.rapid}</span>
          </div>

          {/* Blitz */}
          <div className="bg-[#262522] border border-[#3d3b37] rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
            <Zap className="w-5 h-5 text-[#f0c15c] mb-1" />
            <span className="text-sm font-black text-white">720</span>
            <span className="text-[10px] font-bold text-[#8b8987]">{t.blitz}</span>
          </div>

          {/* Bullet */}
          <div className="bg-[#262522] border border-[#3d3b37] rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
            <Crosshair className="w-5 h-5 text-[#e58f2a] mb-1" />
            <span className="text-sm font-black text-white">600</span>
            <span className="text-[10px] font-bold text-[#8b8987]">{t.bullet}</span>
          </div>

          {/* Puzzles */}
          <div
            onClick={onSolvePuzzles}
            className="bg-[#262522] hover:bg-[#302e2b] border border-[#3d3b37] rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs cursor-pointer transition-colors"
          >
            <Puzzle className="w-5 h-5 text-[#3b9ae1] mb-1" />
            <span className="text-sm font-black text-white">1200</span>
            <span className="text-[10px] font-bold text-[#8b8987]">{t.puzzles}</span>
          </div>
        </div>
      </div>

      {/* Game History List matching Chess.com with Green Star Review Button */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">{t.recentGames}</span>
            <span className="text-[10px] font-bold text-[#8b8987] bg-[#262522] px-1.5 py-0.2 rounded-full border border-[#3d3b37]">
              {recentGames.length}
            </span>
          </div>
          <span className="text-xs font-semibold text-[#8b8987]">{t.accuracy}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {recentGames.map((g) => (
            <div
              key={g.id}
              className="bg-[#262522] border border-[#3d3b37] rounded-xl px-3 py-2 flex items-center justify-between shadow-xs hover:border-[#81b64c]/50 transition-colors"
            >
              {/* Left: Mode icon + Opponent */}
              <div className="flex items-center gap-2.5">
                {g.type === 'rapid' ? (
                  <Timer className="w-4 h-4 text-[#81b64c] shrink-0" />
                ) : (
                  <Zap className="w-4 h-4 text-[#f0c15c] shrink-0" />
                )}
                <div className="w-7 h-7 rounded-lg bg-[#302e2b] border border-[#4d4b46] flex items-center justify-center text-sm">
                  {g.avatar}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-tight">
                    {g.opponent} <span className="text-[#8b8987] font-semibold">({g.elo})</span>
                  </span>
                </div>
              </div>

              {/* Right: Result symbol + Green Review Button */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${
                    g.result === 'win'
                      ? 'bg-[#81b64c]/20 text-[#81b64c]'
                      : 'bg-[#ca3431]/20 text-[#ca3431]'
                  }`}
                >
                  {g.result === 'win' ? '+' : '-'}
                </span>

                <button
                  onClick={() => onReviewGame(g.pgn)}
                  className="flex items-center gap-1 bg-[#81b64c] hover:bg-[#96c95d] active:scale-95 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg shadow-xs transition-transform cursor-pointer border-b-2 border-[#5d8b32]"
                  title={t.reviewGame}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{g.accuracy}%</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chess.com Style Big 3D Green "Gioca" Button */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-20 pointer-events-none">
        <button
          onClick={() => onPlayVsBot()}
          className="w-full bg-[#81b64c] hover:bg-[#96c95d] active:scale-[0.98] text-white font-black text-lg py-3 rounded-2xl shadow-2xl transition-all cursor-pointer pointer-events-auto border-b-4 border-[#5d8b32] flex items-center justify-center gap-2"
        >
          <span>{t.play}</span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
