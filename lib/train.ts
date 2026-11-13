import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { STOCKFISH_CONFIG, getDepthForElo, getEffectiveEngineElo, getThinkingTimeForElo } from './constants';
import { Chess } from 'chess.js';

// Node-friendly simulated training using a local stockfish binary when available.
// Usage: node ./lib/train.js [targetElo] [steps]

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RunParams = {
  fen: string;
  depth?: number;
  movetime?: number;
  elo?: number;
  threads?: number;
  hash?: number;
};

function runStockfishNode(params: RunParams): Promise<{ move: string; ponder?: string; raw?: string }> {
  return new Promise((resolve, reject) => {
    const { fen, depth = 20, movetime = 2000, elo, threads = 1, hash = 32 } = params;
    let resolved = false;
    let buffer = '';

    const engine = spawn('stockfish');

    const cleanup = () => {
      try {
        engine.kill();
      } catch (e) {
        // ignore
      }
    };

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('Engine timeout'));
      }
    }, 30000);

    engine.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      buffer += text;

      if (/uciok/.test(buffer)) {
        if (typeof elo === 'number') {
          engine.stdin.write('setoption name UCI_LimitStrength value true\n');
          engine.stdin.write(`setoption name UCI_Elo value ${getEffectiveEngineElo(elo)}\n`);
        } else {
          engine.stdin.write('setoption name UCI_LimitStrength value false\n');
        }

        engine.stdin.write(`setoption name Threads value ${threads}\n`);
        engine.stdin.write(`setoption name Hash value ${hash}\n`);
        engine.stdin.write('isready\n');
      }

      if (/readyok/.test(buffer)) {
        engine.stdin.write('ucinewgame\n');
        engine.stdin.write(`position fen ${fen}\n`);
        if (typeof depth === 'number') {
          engine.stdin.write(`go depth ${depth}\n`);
        } else {
          engine.stdin.write(`go movetime ${movetime}\n`);
        }
      }

      const m = text.match(/bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/);
      if (m && m[1]) {
        const move = m[1];
        const ponder = m[2];
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup();
          resolve({ move, ponder, raw: buffer });
        }
      }
    });

    engine.stderr.on('data', (chunk) => {
      // keep quiet to avoid noisy logs
    });

    engine.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });

    engine.on('exit', (code, sig) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Stockfish exited early (code=${code}, signal=${sig})`));
      }
    });

    // start
    try {
      engine.stdin.write('uci\n');
    } catch (e) {
      clearTimeout(timeout);
      cleanup();
      reject(e);
    }
  });
}

async function simulateGame(elo: number) {
  const depth = getDepthForElo(elo);
  const movetime = getThinkingTimeForElo(elo);
  const chess = new Chess();

  let moves = 0;

  for (let i = 0; i < 200; i++) {
    if (chess.isGameOver()) break;
    const fen = chess.fen();

    let best;
    try {
      best = await runStockfishNode({ fen, depth, movetime, elo, threads: 1, hash: 32 });
    } catch (e) {
      // If stockfish isn't available, fallback to random move
      const legal = chess.moves({ verbose: true });
      if (legal.length === 0) break;
      const mv = legal[Math.floor(Math.random() * legal.length)];
      chess.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
      moves++;
      continue;
    }

    if (!best || !best.move) break;

    const uci = best.move;
    const from = uci.substring(0, 2);
    const to = uci.substring(2, 4);
    const promo = uci.length === 5 ? uci[4] : undefined;

    const moveObj: any = { from, to };
    if (promo) moveObj.promotion = promo;

    const res = chess.move(moveObj);
    if (!res) break;

    moves++;
  }

  return Math.min(1, moves / 40);
}

export async function runSimulatedTraining(targetElo = 5000, steps = 200) {
  let current: number = STOCKFISH_CONFIG.DEFAULT_ELO;
  const history: Array<{ step: number; elo: number; score: number }> = [];

  for (let step = 1; step <= steps; step++) {
    const target = Math.round(current + (targetElo - current) / (steps - step + 1));
    console.log(`Training step ${step}/${steps}: setting ELO to ${target}`);

    const score = await simulateGame(target);
    history.push({ step, elo: target, score });

    if (score > 0.6) {
      current = Math.min(targetElo, target + Math.round((targetElo - target) * 0.2));
    } else if (score < 0.4) {
      current = Math.max(STOCKFISH_CONFIG.MIN_ELO, target - 50);
    } else {
      current = target;
    }

    fs.writeFileSync(path.join(process.cwd(), 'training_history.json'), JSON.stringify(history, null, 2));

    await sleep(200);
  }

  console.log('Simulated training complete.');
}

// CLI
const argv = process.argv.slice(2);
const targetEloArg = parseInt(argv[0] || '', 10) || 5000;
const stepsArg = parseInt(argv[1] || '', 10) || 200;

if (require.main === module) {
  runSimulatedTraining(targetEloArg, stepsArg).catch((e) => {
    console.error('Training failed:', e);
    process.exit(1);
  });
}
