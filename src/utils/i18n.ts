export type Language = 'it' | 'en';

export const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('localmint_lang');
    if (saved === 'it' || saved === 'en') return saved;
    const navLang = (navigator.language || navigator.languages?.[0] || '').toLowerCase();
    return navLang.startsWith('it') ? 'it' : 'en';
  } catch {
    return 'en';
  }
};

export const setStoredLanguage = (lang: Language) => {
  try {
    localStorage.setItem('localmint_lang', lang);
  } catch {
    // Ignore storage errors
  }
};

export const translations = {
  it: {
    // Common & App
    appName: 'LocalMint Chess',
    tagline: 'Stockfish NNUE Offline',
    engineStatus: 'Locale 100%',
    back: 'Indietro',
    close: 'Chiudi',
    cancel: 'Annulla',
    save: 'Salva',
    play: 'Gioca',
    puzzles: 'Problemi',
    analysis: 'Analisi',
    settings: 'Impostazioni',
    home: 'Home',
    learn: 'Impara',
    watch: 'Guarda',
    more: 'Altro',

    // Home Screen
    woodLeague: 'Lega Legno',
    streakDays: 'Giorni di fila',
    learnTitle: 'Impara',
    learnSubtitle: 'Catturare i pezzi',
    nextLesson: 'Prossima lezione',
    recommendedOpponent: 'Avversario consigliato',
    recentOpponent: 'AVVERSARIO RECENTE',
    challenge: 'Sfida',
    rankings: 'Classifica',
    showAll: 'Mostra tutto',
    rapid: 'Rapid',
    blitz: 'Blitz',
    bullet: 'Bullet',
    daily: 'Giornaliero',
    friends: 'Amici',
    findFriends: 'Trova amici',
    recentGames: 'Cronologia partite',
    accuracy: 'Precisione',
    reviewGame: 'Revisione',

    // Game View (Play vs Bot)
    options: 'Opzioni',
    resign: 'Abbandona',
    hint: 'Suggerimento',
    undo: 'Annulla',
    thinking: 'Calcolo...',
    yourTurn: 'Tocca a te',
    botTurn: 'Mossa avversario',
    resignConfirm: 'Vuoi davvero abbandonare la partita?',
    gameOptions: 'Opzioni Partita',
    switchBot: 'Cambia Bot',
    passAndPlay: 'Pass & Play (2 Giocatori)',
    flipBoard: 'Ruota Scacchiera',
    newGame: 'Nuova Partita',
    checkmateWhite: 'Scacco matto! Vince il Bianco.',
    checkmateBlack: 'Scacco matto! Vince il Nero.',
    stalemate: 'Patta per stallo.',
    resignedYou: 'Hai abbandonato la partita.',
    resignedOpponent: "L'avversario ha abbandonato.",

    // Puzzles View
    puzzlesTitle: 'Problemi',
    solvePuzzles: 'Risolvi problemi',
    nextPuzzle: 'Prossimo problema',
    puzzleRating: 'Rating Puzzle',
    puzzleStreak: 'Serie',
    bestRecord: 'Record',
    difficulty: 'Difficoltà',
    puzzleSolved: 'Risolto! Ottima mossa!',
    puzzleFailed: 'Mossa errata. Riprova!',
    puzzlePlaying: 'Trova la mossa migliore per',
    white: 'Bianco',
    black: 'Nero',
    catSpeech: "Si dice che gli scacchi siano per il 99% tattica... È un'ottima notizia! I problemi servono proprio per questo.",

    // Analysis View
    gameReview: 'Game Review',
    reanalyze: 'Rianalizza',
    whiteAccuracy: 'Precisione Bianco',
    blackAccuracy: 'Precisione Nero',
    masterGame: 'Partita Magistrale',
    solidGame: 'Partita Solida',
    importPgn: 'Importa PGN',
    importChessCom: 'Importa da Chess.com',
    engineEval: 'Valutazione Motore',
    evalTitle: 'Valutazione',
    bestMoveArrow: 'Mossa Migliore',
    noMovesYet: 'Nessuna mossa effettuata',
    
    // Move Classifications
    brilliant: 'Brillante',
    best: 'Migliore',
    excellent: 'Eccellente',
    good: 'Buona',
    inaccuracy: 'Imprecisione',
    mistake: 'Errore',
    blunder: 'Blunder',
    miss: 'Occasione Persa',
    book: 'Libro',

    // Settings
    settingsTitle: 'Impostazioni',
    language: 'Lingua',
    languageDesc: 'Scegli la lingua dell’applicazione',
    italian: 'Italiano',
    english: 'Inglese',
    boardTheme: 'Tema Scacchiera',
    boardThemeDesc: 'Personalizza l’aspetto delle caselle',
    soundEffects: 'Effetti Sonori',
    soundEffectsDesc: 'Suoni realistici di movimento e cattura',
    engineInfo: 'Motore di Scacchi',
    engineInfoDesc: 'Stockfish 19 NNUE integrato (offline 100%)',
    aboutTitle: 'Informazioni su LocalMint Chess',
    aboutText: 'App mobile di scacchi open-source gratuita con motore Stockfish 19 NNUE locale senza limitazioni.',
  },
  en: {
    // Common & App
    appName: 'LocalMint Chess',
    tagline: 'Stockfish NNUE Offline',
    engineStatus: '100% Local',
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    play: 'Play',
    puzzles: 'Puzzles',
    analysis: 'Analysis',
    settings: 'Settings',
    home: 'Home',
    learn: 'Learn',
    watch: 'Watch',
    more: 'More',

    // Home Screen
    woodLeague: 'Wood League',
    streakDays: 'Day streak',
    learnTitle: 'Learn',
    learnSubtitle: 'Capturing Pieces',
    nextLesson: 'Next lesson',
    recommendedOpponent: 'Recommended Opponent',
    recentOpponent: 'RECENT OPPONENT',
    challenge: 'Challenge',
    rankings: 'Rankings',
    showAll: 'Show all',
    rapid: 'Rapid',
    blitz: 'Blitz',
    bullet: 'Bullet',
    daily: 'Daily',
    friends: 'Friends',
    findFriends: 'Find Friends',
    recentGames: 'Game History',
    accuracy: 'Accuracy',
    reviewGame: 'Review',

    // Game View (Play vs Bot)
    options: 'Options',
    resign: 'Resign',
    hint: 'Hint',
    undo: 'Undo',
    thinking: 'Thinking...',
    yourTurn: 'Your turn',
    botTurn: 'Opponent turn',
    resignConfirm: 'Do you really want to resign?',
    gameOptions: 'Game Options',
    switchBot: 'Switch Bot',
    passAndPlay: 'Pass & Play (2 Players)',
    flipBoard: 'Flip Board',
    newGame: 'New Game',
    checkmateWhite: 'Checkmate! White wins.',
    checkmateBlack: 'Checkmate! Black wins.',
    stalemate: 'Draw by stalemate.',
    resignedYou: 'You resigned the game.',
    resignedOpponent: 'Opponent resigned.',

    // Puzzles View
    puzzlesTitle: 'Puzzles',
    solvePuzzles: 'Solve puzzles',
    nextPuzzle: 'Next puzzle',
    puzzleRating: 'Puzzle Rating',
    puzzleStreak: 'Streak',
    bestRecord: 'Best',
    difficulty: 'Difficulty',
    puzzleSolved: 'Solved! Great move!',
    puzzleFailed: 'Incorrect move. Try again!',
    puzzlePlaying: 'Find the best move for',
    white: 'White',
    black: 'Black',
    catSpeech: 'They say chess is 99% tactics... That is great news! Puzzles are designed just for that.',

    // Analysis View
    gameReview: 'Game Review',
    reanalyze: 'Reanalyze',
    whiteAccuracy: 'White Accuracy',
    blackAccuracy: 'Black Accuracy',
    masterGame: 'Master Game',
    solidGame: 'Solid Game',
    importPgn: 'Import PGN',
    importChessCom: 'Import from Chess.com',
    engineEval: 'Engine Evaluation',
    evalTitle: 'Evaluation',
    bestMoveArrow: 'Best Move',
    noMovesYet: 'No moves yet',

    // Move Classifications
    brilliant: 'Brilliant',
    best: 'Best',
    excellent: 'Excellent',
    good: 'Good',
    inaccuracy: 'Inaccuracy',
    mistake: 'Mistake',
    blunder: 'Blunder',
    miss: 'Miss',
    book: 'Book',

    // Settings
    settingsTitle: 'Settings',
    language: 'Language',
    languageDesc: 'Choose application language',
    italian: 'Italian',
    english: 'English',
    boardTheme: 'Board Theme',
    boardThemeDesc: 'Customize squares appearance',
    soundEffects: 'Sound Effects',
    soundEffectsDesc: 'Realistic piece move and capture sounds',
    engineInfo: 'Chess Engine',
    engineInfoDesc: 'Stockfish 19 NNUE built-in (100% offline)',
    aboutTitle: 'About LocalMint Chess',
    aboutText: 'Free open-source chess mobile app featuring 100% local Stockfish 19 NNUE engine with unlimited analysis.',
  },
};
