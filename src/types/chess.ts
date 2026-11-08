export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export type Square = string;

export type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'miss'
  | 'book';

export interface Evaluation {
  score: number; // centipawns (+ for white advantage, - for black)
  isMate: boolean;
  mateIn?: number;
  depth: number;
  nodes?: number;
  bestMove?: string;
  pv?: string;
}

export interface ClassifiedMove {
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
  from: string;
  to: string;
  fenBefore: string;
  fenAfter: string;
  evalBefore: number;
  evalAfter: number;
  bestMove: string;
  classification: MoveClassification;
  explanation: string;
}

export interface GameReview {
  whiteAccuracy: number;
  blackAccuracy: number;
  classifiedMoves: ClassifiedMove[];
  advantageCurve: { moveIndex: number; score: number; color: 'w' | 'b'; san: string }[];
  summary: {
    w: Record<MoveClassification, number>;
    b: Record<MoveClassification, number>;
  };
}

export interface Bot {
  id: string;
  name: string;
  elo: number;
  avatar: string;
  tagline: string;
  depth: number;
  skillLevel: number; // 0-20 UCI Skill Level
  style: string;
  quotes?: {
    start: { it: string; en: string };
    check: { it: string; en: string };
    win: { it: string; en: string };
    lose: { it: string; en: string };
  };
}

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[]; // UCI format e.g. ["e2e4", "e7e5"]
  rating: number;
  theme: string;
  description: string;
  turn: 'w' | 'b';
}

export type ActiveTab = 'home' | 'play' | 'puzzles' | 'analysis' | 'settings';
export type BoardTheme = 'green' | 'wood' | 'ice' | 'classic';
export type PieceStyle = 'neo' | 'staunton' | 'minimal';
export type Language = 'it' | 'en';
