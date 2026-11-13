const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Chess } = require('chess.js');
// Local fallback constants and helpers (avoid requiring TypeScript module)
const STOCKFISH_CONFIG = { DEFAULT_ELO: 1600, MIN_ELO: 100, MAX_ELO: 5000, MAX_TIME: 8000 };
const ENGINE_STRENGTH_CONFIG = { UCI_MIN_ELO: 1320, UCI_MAX_ELO: 3190, MIN_TIME: 120 };
function getDifficultyRatio(elo) {
  const min = STOCKFISH_CONFIG.MIN_ELO;
  const max = STOCKFISH_CONFIG.MAX_ELO;
  return Math.min(Math.max((elo - min) / (max - min), 0), 1);
}
function getEffectiveEngineElo(elo) {
  const ratio = getDifficultyRatio(elo);
  const scaled = ENGINE_STRENGTH_CONFIG.UCI_MIN_ELO +
    Math.pow(ratio, 0.72) *
      (ENGINE_STRENGTH_CONFIG.UCI_MAX_ELO - ENGINE_STRENGTH_CONFIG.UCI_MIN_ELO);

  return Math.round(
    Math.min(
      ENGINE_STRENGTH_CONFIG.UCI_MAX_ELO,
      Math.max(ENGINE_STRENGTH_CONFIG.UCI_MIN_ELO, scaled)
    )
  );
}
function getDepthForElo(elo) {
  const minDepth = 1;
  const maxDepth = 30;
  const ratio = getDifficultyRatio(elo);
  return Math.max(1, Math.round(minDepth + ratio * (maxDepth - minDepth)));
}
function getThinkingTimeForElo(elo) {
  const minTime = ENGINE_STRENGTH_CONFIG.MIN_TIME;
  const maxTime = STOCKFISH_CONFIG.MAX_TIME || 8000;
  const ratio = getDifficultyRatio(elo);
  return Math.round(minTime + ratio * (maxTime - minTime));
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function runStockfishNode(params) {
  const { fen, depth = 20, movetime = 2000, elo, threads = 1, hash = 32 } = params;
  return new Promise((resolve, reject) => {
    let resolved = false;
    let buffer = '';
    let engine;
    try {
      engine = spawn('stockfish');
    } catch (e) {
      return reject(e);
    }

    const cleanup = () => {
      try { engine.kill(); } catch (e) {}
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
        if (typeof depth === 'number') engine.stdin.write(`go depth ${depth}\n`);
        else engine.stdin.write(`go movetime ${movetime}\n`);
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

    engine.stderr.on('data', () => {});

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

    try { engine.stdin.write('uci\n'); } catch (e) { clearTimeout(timeout); cleanup(); reject(e); }
  });
}

async function simulateGame(elo) {
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
      // fallback to random move
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
    const moveObj = { from, to };
    if (promo) moveObj.promotion = promo;
    const res = chess.move(moveObj);
    if (!res) break;
    moves++;
  }

  return Math.min(1, moves / 40);
}

async function runSimulatedTraining(targetElo = 5000, steps = 100, maxRunMs = 0) {
  const history = [];
  let current = STOCKFISH_CONFIG.DEFAULT_ELO || 1600;
  const startTime = Date.now();

  for (let step = 1; step <= steps; step++) {
    const elapsed = Date.now() - startTime;
    if (maxRunMs > 0 && elapsed >= maxRunMs) {
      console.log(`[train] Max run time reached (${Math.round(elapsed / 1000)}s). Stopping.`);
      break;
    }

    const target = Math.round(current + (targetElo - current) / (steps - step + 1));
    console.log(`[train] step ${step}/${steps} -> testing ELO ${target} (elapsed ${Math.round(elapsed / 1000)}s)`);
    const score = await simulateGame(target);
    history.push({ step, elo: target, score, elapsed });

    if (score > 0.6) current = Math.min(targetElo, target + Math.round((targetElo - target) * 0.2));
    else if (score < 0.4) current = Math.max(STOCKFISH_CONFIG.MIN_ELO, target - 50);
    else current = target;

    fs.writeFileSync(path.join(process.cwd(), 'training_history.json'), JSON.stringify(history, null, 2));
    await sleep(100);
  }

  console.log('Simulated training complete.');
}

const argv = process.argv.slice(2);
const targetEloArg = parseInt(argv[0], 10) || 5000;
const stepsArg = parseInt(argv[1], 10) || 100;
const maxRunMsArg = parseInt(argv[2], 10) || 0;

runSimulatedTraining(targetEloArg, stepsArg, maxRunMsArg).catch((e) => {
  console.error('Training failed:', e);
  process.exit(1);
});
