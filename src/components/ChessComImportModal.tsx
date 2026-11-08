import React, { useState } from 'react';
import { fetchUserGames, type ChessComGameSummary } from '../utils/chessApi';
import { X, Search, Globe, Loader2, Play } from 'lucide-react';

interface ChessComImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (pgn: string, opponentName: string) => void;
}

export const ChessComImportModal: React.FC<ChessComImportModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<ChessComGameSummary[]>([]);

  if (!isOpen) return null;

  const handleSearch = async (userToSearch: string) => {
    const target = userToSearch.trim();
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const results = await fetchUserGames(target);
      if (results.length === 0) {
        setError(`Nessuna partita recente trovata per ${target}`);
      } else {
        setGames(results);
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante la ricerca');
    } finally {
      setLoading(false);
    }
  };

  const presets = ['hikaru', 'magnuscarlsen', 'gothamchess', 'erik'];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-[#262522] border border-[#3d3b37] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3d3b37]">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#81b64c]" />
            <h3 className="font-bold text-white text-base">Importa Partite da Chess.com</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b8987] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#3d3b37] bg-[#302e2b]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(username);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8b8987] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Inserisci username Chess.com (es. il tuo handle)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#262522] border border-[#3d3b37] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#8b8987] focus:outline-hidden focus:border-[#81b64c]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="bg-[#81b64c] hover:bg-[#96c95d] disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cerca'}
            </button>
          </form>

          {/* Quick presets */}
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto text-[11px]">
            <span className="text-[#8b8987] shrink-0 font-medium">Account famosi:</span>
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setUsername(p);
                  handleSearch(p);
                }}
                className="bg-[#262522] hover:bg-[#3d3b37] text-[#c3c1be] px-2 py-0.5 rounded-md border border-[#3d3b37] transition-colors cursor-pointer shrink-0"
              >
                @{p}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#8b8987] gap-3">
              <Loader2 className="w-8 h-8 text-[#81b64c] animate-spin" />
              <span className="text-sm">Scaricamento partite da Chess.com...</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {!loading && !error && games.length === 0 && (
            <div className="text-center py-10 text-[#8b8987] text-sm">
              Cerca un account Chess.com per importare le ultime partite giocate e avviare l'analisi locale con Stockfish.
            </div>
          )}

          {!loading && games.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#8b8987] mb-2">
                Ultime partite disponibili ({games.length}):
              </p>
              {games.map((g, idx) => {
                const isWhiteWin = g.white.result === 'win';
                const isBlackWin = g.black.result === 'win';

                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#302e2b] border border-[#3d3b37] hover:border-[#81b64c] rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <span className="w-2 h-2 rounded-full bg-white shrink-0"></span>
                        <span className="truncate">{g.white.username} ({g.white.rating})</span>
                        {isWhiteWin && <span className="text-xs text-[#81b64c] font-bold">1</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#c3c1be] mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#3d3b37] border border-white/30 shrink-0"></span>
                        <span className="truncate">{g.black.username} ({g.black.rating})</span>
                        {isBlackWin && <span className="text-xs text-[#81b64c] font-bold">1</span>}
                      </div>
                      <div className="text-[11px] text-[#8b8987] mt-1 flex items-center gap-2">
                        <span>Tempo: {g.timeControl}</span>
                        <span>•</span>
                        <span>{g.rated ? 'Classificata' : 'Amichevole'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectGame(g.pgn, `${g.white.username} vs ${g.black.username}`);
                        onClose();
                      }}
                      className="bg-[#81b64c] hover:bg-[#96c95d] text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Analizza
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
