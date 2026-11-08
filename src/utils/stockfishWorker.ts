import type { Evaluation, Bot } from '../types/chess';

export class StockfishService {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private readyCallbacks: (() => void)[] = [];
  private currentBestMoveCallback: ((bestMove: string, evalData?: Evaluation) => void) | null = null;
  private currentEvalCallback: ((evalData: Evaluation) => void) | null = null;
  private latestEval: Evaluation = {
    score: 0,
    isMate: false,
    depth: 0,
    nodes: 0,
  };
  private isEvaluating: boolean = false;
  private pendingCommands: string[] = [];

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined') return;

    try {
      // First attempt: Stockfish 19 WASM worker
      this.worker = new Worker('/stockfish/stockfish.js');
      this.setupWorkerListeners();
    } catch {
      try {
        // Fallback: Stockfish ASM.js (pure JS fallback)
        this.worker = new Worker('/stockfish/stockfish-asm.js');
        this.setupWorkerListeners();
      } catch {
        // Fallback handled gracefully
      }
    }
  }

  private setupWorkerListeners() {
    if (!this.worker) return;

    this.worker.onmessage = (event: MessageEvent) => {
      const line: string = typeof event.data === 'string' ? event.data : (event.data?.data || '');
      this.handleEngineOutput(line);
    };

    this.worker.onerror = () => {
      // Error in worker handled
    };

    // Initialize UCI
    this.sendCommand('uci');
    this.sendCommand('isready');
  }

  private sendCommand(cmd: string) {
    if (this.worker) {
      this.worker.postMessage(cmd);
    } else {
      this.pendingCommands.push(cmd);
    }
  }

  private handleEngineOutput(line: string) {
    if (line === 'readyok') {
      this.isReady = true;
      this.readyCallbacks.forEach((cb) => cb());
      this.readyCallbacks = [];
      return;
    }

    // Parse evaluation line:
    // info depth 12 seldepth 16 multipv 1 score cp 35 nodes 8421 nps 410780 time 20 pv e2e4 e7e5 g1f3
    // or: info depth 10 score mate -2 ...
    if (line.startsWith('info') && line.includes('score')) {
      const depthMatch = line.match(/depth\s+(\d+)/);
      const scoreCpMatch = line.match(/score\s+cp\s+(-?\d+)/);
      const scoreMateMatch = line.match(/score\s+mate\s+(-?\d+)/);
      const nodesMatch = line.match(/nodes\s+(\d+)/);
      const pvMatch = line.match(/pv\s+([a-h1-8qrbn\s]+)/);

      const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;
      const nodes = nodesMatch ? parseInt(nodesMatch[1], 10) : 0;
      const pv = pvMatch ? pvMatch[1].trim() : undefined;
      const bestMoveFromPv = pv ? pv.split(' ')[0] : undefined;

      let score = 0;
      let isMate = false;
      let mateIn: number | undefined;

      if (scoreMateMatch) {
        isMate = true;
        mateIn = parseInt(scoreMateMatch[1], 10);
        score = mateIn > 0 ? 100000 - mateIn * 100 : -100000 - mateIn * 100;
      } else if (scoreCpMatch) {
        score = parseInt(scoreCpMatch[1], 10);
      }

      this.latestEval = {
        score,
        isMate,
        mateIn,
        depth,
        nodes,
        bestMove: bestMoveFromPv,
        pv,
      };

      if (this.currentEvalCallback) {
        this.currentEvalCallback(this.latestEval);
      }
    }

    // Parse bestmove line:
    // bestmove e2e4 ponder e7e5
    if (line.startsWith('bestmove')) {
      this.isEvaluating = false;
      const parts = line.split(' ');
      const bestMove = parts[1] || '';

      if (this.currentBestMoveCallback) {
        const cb = this.currentBestMoveCallback;
        this.currentBestMoveCallback = null;
        cb(bestMove, this.latestEval);
      }
    }
  }

  public whenReady(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    return new Promise((resolve) => {
      this.readyCallbacks.push(resolve);
    });
  }

  public isBusy(): boolean {
    return this.isEvaluating;
  }

  public stop() {
    this.sendCommand('stop');
    this.isEvaluating = false;
    this.currentBestMoveCallback = null;
    this.currentEvalCallback = null;
  }

  public setElo(elo: number) {
    this.sendCommand('setoption name UCI_LimitStrength value true');
    const clampedElo = Math.max(250, Math.min(3200, elo));
    this.sendCommand(`setoption name UCI_Elo value ${clampedElo}`);
    // Adjust skill level proportionately (0 to 20)
    const skill = Math.round(((clampedElo - 250) / (3200 - 250)) * 20);
    this.sendCommand(`setoption name Skill Level value ${skill}`);
  }

  public evaluatePosition(
    fen: string,
    depth: number = 14,
    onProgress?: (evaluation: Evaluation) => void
  ): Promise<Evaluation> {
    return new Promise((resolve) => {
      this.stop();
      this.currentEvalCallback = onProgress || null;
      this.latestEval = { score: 0, isMate: false, depth: 0 };

      this.currentBestMoveCallback = (_bestMove, finalEval) => {
        resolve(finalEval || this.latestEval);
      };

      this.sendCommand('ucinewgame');
      this.sendCommand(`position fen ${fen}`);
      this.isEvaluating = true;
      this.sendCommand(`go depth ${depth}`);
    });
  }

  public getBotMove(fen: string, bot: Bot): Promise<{ bestMove: string; evalData?: Evaluation }> {
    return new Promise((resolve) => {
      this.stop();
      this.setElo(bot.elo);

      this.currentBestMoveCallback = (bestMove, evalData) => {
        resolve({ bestMove, evalData });
      };

      this.sendCommand(`position fen ${fen}`);
      this.isEvaluating = true;

      // Scale think time and depth according to bot Elo
      const movetime = Math.min(1200, Math.max(150, bot.elo / 2));
      const depth = Math.max(1, bot.depth);

      this.sendCommand(`go depth ${depth} movetime ${movetime}`);
    });
  }
}

export const stockfish = new StockfishService();
