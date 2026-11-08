export interface ChessComGameSummary {
  url: string;
  pgn: string;
  timeControl: string;
  endTime: number;
  rated: boolean;
  white: {
    username: string;
    rating: number;
    result: string;
  };
  black: {
    username: string;
    rating: number;
    result: string;
  };
}

export async function fetchUserGames(username: string): Promise<ChessComGameSummary[]> {
  const cleanUser = username.trim().toLowerCase();
  if (!cleanUser) return [];

  try {
    // 1. Get archives list
    const archivesRes = await fetch(`https://api.chess.com/pub/player/${cleanUser}/games/archives`);
    if (!archivesRes.ok) {
      throw new Error(`Utente "${username}" non trovato su Chess.com (HTTP ${archivesRes.status})`);
    }

    const archivesData = await archivesRes.json();
    const archives: string[] = archivesData.archives || [];
    if (archives.length === 0) {
      return [];
    }

    // 2. Fetch the most recent month archive
    const latestArchiveUrl = archives[archives.length - 1];
    const gamesRes = await fetch(latestArchiveUrl);
    if (!gamesRes.ok) {
      throw new Error(`Impossibile scaricare le partite del mese`);
    }

    const gamesData = await gamesRes.json();
    const rawGames = gamesData.games || [];

    // Map and return the last 20 games in descending chronological order
    const mapped: ChessComGameSummary[] = rawGames
      .map((g: any) => ({
        url: g.url || '',
        pgn: g.pgn || '',
        timeControl: g.time_control || '10+0',
        endTime: g.end_time || 0,
        rated: g.rated ?? true,
        white: {
          username: g.white?.username || 'White',
          rating: g.white?.rating || 1200,
          result: g.white?.result || 'win',
        },
        black: {
          username: g.black?.username || 'Black',
          rating: g.black?.rating || 1200,
          result: g.black?.result || 'loss',
        },
      }))
      .filter((g: ChessComGameSummary) => !!g.pgn)
      .reverse()
      .slice(0, 25);

    return mapped;
  } catch (err: any) {
    throw new Error(err.message || 'Errore durante la connessione alle API di Chess.com');
  }
}
