import type { Bot } from '../types/chess';

export const BOTS: Bot[] = [
  {
    id: 'martin',
    name: 'Martin',
    elo: 250,
    avatar: '👨‍🌾',
    tagline: 'Principiante assoluto',
    depth: 1,
    skillLevel: 0,
    style: 'Cattura casualmente e spesso regala pezzi. Ideale per chi impara.',
    quotes: {
      start: {
        it: 'Ciao! Non sono molto bravo a scacchi, ma mi diverto tantissimo!',
        en: 'Hi! I am not very good at chess, but I have a lot of fun!',
      },
      check: {
        it: 'Ops... questo è scacco! Oppure no?',
        en: 'Oops... is that check? Or not?',
      },
      win: {
        it: 'Evviva! Ho vinto io! Nemmeno io ci credo!',
        en: 'Hooray! I won! I cannot believe it myself!',
      },
      lose: {
        it: 'Ottima partita! Imparerò dai miei errori.',
        en: 'Good game! I will learn from my mistakes.',
      },
    },
  },
  {
    id: 'wendy',
    name: 'Wendy',
    elo: 1100,
    avatar: '👩‍🦰',
    tagline: 'Attaccante Sacrificale',
    depth: 5,
    skillLevel: 7,
    style: 'Ama i sacrifici di pezzi spettacolari e gli attacchi aggressivi al Re.',
    quotes: {
      start: {
        it: 'Mi chiedo quanti pezzi potrei sacrificare prima di attaccare il tuo Re...',
        en: 'I wonder how many pieces I could sacrifice before attacking your King...',
      },
      check: {
        it: 'Scacco! La mia iniziativa sta crescendo!',
        en: 'Check! My attack is catching fire!',
      },
      win: {
        it: 'Scacco matto! Il sacrificio alla fine ha pagato!',
        en: 'Checkmate! The sacrifice paid off in the end!',
      },
      lose: {
        it: 'Che bella difesa! Forse ho sacrificato un pezzo di troppo...',
        en: 'What a defense! Maybe I sacrificed one piece too many...',
      },
    },
  },
  {
    id: 'nelson',
    name: 'Nelson',
    elo: 1300,
    avatar: '🧑‍🦱',
    tagline: 'Regina Aggressiva',
    depth: 6,
    skillLevel: 9,
    style: 'La leggenda di Chess.com: attacca subito con la Donna!',
    quotes: {
      start: {
        it: 'La mia Regina adora farsi un giro fuori fin dalle prime mosse!',
        en: 'My Queen loves to come out and play on move two!',
      },
      check: {
        it: 'Scacco con la Donna! Riesci a difenderti?',
        en: 'Check with my Queen! Can you defend it?',
      },
      win: {
        it: 'Scacco matto della Regina! Classico!',
        en: 'Queen checkmate! A classic!',
      },
      lose: {
        it: 'Impossibile... la mia Donna era inarrestabile!',
        en: 'Impossible... my Queen was supposed to be unstoppable!',
      },
    },
  },
  {
    id: 'antonio',
    name: 'Antonio',
    elo: 1500,
    avatar: '👨‍💼',
    tagline: 'Intermedio Posizionale',
    depth: 8,
    skillLevel: 12,
    style: 'Sviluppo classico, controllo centrale e attacchi metodici.',
    quotes: {
      start: {
        it: 'Controllare il centro è la chiave di una vittoria solida.',
        en: 'Controlling the center is the key to a solid victory.',
      },
      check: {
        it: 'Scacco. La pressione posizionale comincia a farsi sentire.',
        en: 'Check. The positional pressure is beginning to tell.',
      },
      win: {
        it: 'La strategia posizionale trionfa sempre.',
        en: 'Positional strategy always prevails.',
      },
      lose: {
        it: 'Ottima combinazione tattica, mi hai sorpreso.',
        en: 'Great tactical combination, you caught me off guard.',
      },
    },
  },
  {
    id: 'laura',
    name: 'Laura (WFM)',
    elo: 1800,
    avatar: '👩‍🏫',
    tagline: 'Candidata Maestra',
    depth: 10,
    skillLevel: 15,
    style: 'Aperture taglienti e punisce ogni imprecisione tattica.',
    quotes: {
      start: {
        it: 'Preparati, non perdonerò nemmeno una singola imprecisione.',
        en: 'Get ready, I will not let a single inaccuracy slip by.',
      },
      check: {
        it: 'Scacco! La coordinazione dei miei pezzi è letale.',
        en: 'Check! My piece coordination is deadly.',
      },
      win: {
        it: 'Partita da manuale. Bella prova!',
        en: 'Textbook game. Good effort!',
      },
      lose: {
        it: 'Prestazione da Maestro. Davvero complimenti!',
        en: 'Master level performance. Truly well played!',
      },
    },
  },
  {
    id: 'stockfish_max',
    name: 'Stockfish 19 NNUE',
    elo: 3200,
    avatar: '🤖',
    tagline: 'Motore Imbattibile',
    depth: 18,
    skillLevel: 20,
    style: 'La potenza totale della rete neurale Stockfish NNUE offline.',
    quotes: {
      start: {
        it: 'Rete neurale NNUE caricata. Valuto milioni di nodi al secondo.',
        en: 'NNUE neural network loaded. Evaluating millions of nodes per second.',
      },
      check: {
        it: 'Scacco. Calcolo forzato verso la vittoria.',
        en: 'Check. Calculating forced lines to victory.',
      },
      win: {
        it: 'Scacco matto calcolato a profondità 18.',
        en: 'Checkmate calculated at depth 18.',
      },
      lose: {
        it: 'Anomalia statistica riscontrata. Gioco eccellente, umano.',
        en: 'Statistical anomaly detected. Superb game, human.',
      },
    },
  },
];
