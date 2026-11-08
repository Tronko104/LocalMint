import { Chess } from 'chess.js';
import { stockfish } from './stockfishWorker';
import type { ClassifiedMove, GameReview, MoveClassification } from '../types/chess';

// Chess.com win percentage formula based on centipawn score
function winPercentage(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

export async function analyzeGame(
  pgn: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<GameReview> {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    throw new Error('PGN non valido');
  }

  const history = chess.history({ verbose: true });
  const totalMoves = history.length;
  if (totalMoves === 0) {
    throw new Error('La partita non contiene mosse');
  }

  const classifiedMoves: ClassifiedMove[] = [];
  const advantageCurve: { moveIndex: number; score: number; color: 'w' | 'b'; san: string }[] = [];

  const summary = {
    w: {
      brilliant: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      miss: 0,
      book: 0,
    },
    b: {
      brilliant: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      miss: 0,
      book: 0,
    },
  };

  const whiteWinDeltas: number[] = [];
  const blackWinDeltas: number[] = [];

  // Replay from beginning
  const replayChess = new Chess();

  for (let i = 0; i < totalMoves; i++) {
    const move = history[i];
    const color = move.color;
    const fenBefore = replayChess.fen();

    if (onProgress) {
      onProgress(i + 1, totalMoves, `Analisi mossa ${i + 1}/${totalMoves} (${move.san})`);
    }

    // Evaluate position before move to get best engine move and theoretical score
    const evalBefore = await stockfish.evaluatePosition(fenBefore, 10);
    const bestMoveUci = evalBefore.bestMove || '';
    const scoreBeforeWhite = evalBefore.score; // Stockfish gives score relative to side to move or white

    // Normalize score relative to current mover
    const sideMultiplier = color === 'w' ? 1 : -1;
    const scoreBeforeSide = scoreBeforeWhite * sideMultiplier;

    // Apply actual move
    replayChess.move(move);
    const fenAfter = replayChess.fen();

    // Evaluate position after move
    const evalAfter = await stockfish.evaluatePosition(fenAfter, 10);
    // After black moves, side to move is white, etc.
    const scoreAfterSide = evalAfter.score * -1; // relative to previous player

    // Calculate centipawn loss
    const cpLoss = Math.max(0, scoreBeforeSide - scoreAfterSide);

    // Win percentage before and after
    const winBefore = winPercentage(scoreBeforeSide);
    const winAfter = winPercentage(scoreAfterSide);
    const winDelta = Math.max(0, winBefore - winAfter);

    if (color === 'w') {
      whiteWinDeltas.push(winDelta);
    } else {
      blackWinDeltas.push(winDelta);
    }

    // Move classification
    let classification: MoveClassification = 'good';
    let explanation = '';

    // Check if it's opening book (first 4 moves)
    if (i < 8 && cpLoss <= 25) {
      classification = 'book';
      explanation = 'Mossa teorica di apertura';
    } else if (bestMoveUci === `${move.from}${move.to}`) {
      // Check for brilliant sacrifice: piece sacrificed with positive evaluation
      const captured = move.captured;
      const isPieceSacrifice =
        (move.piece === 'q' && (!captured || captured !== 'q')) ||
        (move.piece === 'r' && (!captured || (captured !== 'q' && captured !== 'r'))) ||
        ((move.piece === 'b' || move.piece === 'n') && (!captured || captured === 'p'));

      if (isPieceSacrifice && scoreAfterSide > 150) {
        classification = 'brilliant';
        explanation = 'Brillante sacrificio di pezzo che mantiene il vantaggio decisivo!';
      } else {
        classification = 'best';
        explanation = 'La mossa migliore secondo Stockfish';
      }
    } else if (cpLoss <= 25) {
      classification = 'excellent';
      explanation = 'Mossa eccellente, quasi alla pari della migliore';
    } else if (cpLoss <= 70) {
      classification = 'good';
      explanation = 'Buona mossa, mantiene la posizione solida';
    } else if (cpLoss <= 160) {
      classification = 'inaccuracy';
      explanation = 'Imprecisione: concede una leggera iniziativa';
    } else if (cpLoss <= 320) {
      classification = 'mistake';
      explanation = 'Errore: compromette significativamente la posizione';
    } else {
      // Check if missed win/mate
      if (evalBefore.isMate && evalBefore.mateIn && evalBefore.mateIn > 0 && (!evalAfter.isMate || (evalAfter.mateIn || 0) < 0)) {
        classification = 'miss';
        explanation = 'Occasione persa: c’era uno scacco matto forzato';
      } else {
        classification = 'blunder';
        explanation = 'Grave errore (Blunder): regala materiale o ribalta la partita';
      }
    }

    summary[color][classification]++;

    const scoreForWhiteAdvantage = color === 'w' ? scoreAfterSide : -scoreAfterSide;
    advantageCurve.push({
      moveIndex: i,
      score: Math.max(-1000, Math.min(1000, scoreForWhiteAdvantage)),
      color,
      san: move.san,
    });

    classifiedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      color,
      san: move.san,
      from: move.from,
      to: move.to,
      fenBefore,
      fenAfter,
      evalBefore: scoreBeforeWhite,
      evalAfter: scoreForWhiteAdvantage,
      bestMove: bestMoveUci,
      classification,
      explanation,
    });
  }

  // Calculate accuracies
  const calcAccuracy = (deltas: number[]) => {
    if (deltas.length === 0) return 85;
    const avgLoss = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    // Precision scale: 0 loss = 100%, 20 loss = 70%, 50 loss = 45%
    const acc = Math.max(10, Math.min(99.8, 100 - avgLoss * 1.6));
    return Math.round(acc * 10) / 10;
  };

  const whiteAccuracy = calcAccuracy(whiteWinDeltas);
  const blackAccuracy = calcAccuracy(blackWinDeltas);

  return {
    whiteAccuracy,
    blackAccuracy,
    classifiedMoves,
    advantageCurve,
    summary,
  };
}
