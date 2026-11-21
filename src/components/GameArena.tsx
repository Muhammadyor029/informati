import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Swords,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { GameDef, GameEngine, supportsPvpEngine } from '../data/types';
import { SparkleButton } from './SparkleButton';

interface GameArenaProps {
  game: GameDef;
  onClose: () => void;
  onComplete?: (gameId: number, score: number) => void;
}

type PlayMode = 'solo' | 'pvp';

const P1_KEYS = ['A', 'S', 'D', 'F'];
const P2_KEYS = ['1', '2', '3', '4'];

const GameSignalCanvas: React.FC<{
  active: boolean;
  progress: number;
  streak: number;
  engine: GameEngine;
}> = ({ active, progress, streak, engine }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let phase = 0;
    let lastDraw = 0;
    let hidden = typeof document !== 'undefined' ? document.hidden : false;
    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (hidden || !active || now - lastDraw < 42) return; // ~24fps cap for low-end devices
      lastDraw = now;
      phase += 0.14 + Math.min(0.25, streak * 0.04);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(37, 99, 235, 0.22)';
      ctx.lineWidth = 1;
      for (let x = 24; x < W; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      const barW = Math.max(8, Math.round(W * progress));
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fillRect(0, 0, barW, H);

      ctx.beginPath();
      const amp = 6 + Math.min(10, streak * 2);
      for (let x = 0; x <= W; x += 6) {
        const y =
          H / 2 +
          Math.sin(x * 0.04 + phase) * amp * Math.cos(x * 0.015 - phase * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = streak >= 2 ? '#059669' : '#2563eb';
      ctx.lineWidth = 2;
      ctx.stroke();

      const dotX = ((phase * 38) % (W - 16)) + 8;
      const dotY =
        H / 2 + Math.sin(dotX * 0.04 + phase) * amp * Math.cos(dotX * 0.015 - phase * 0.5);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active, progress, streak, engine]);

  return (
    <canvas
      ref={ref}
      width={560}
      height={44}
      className="mb-4 h-11 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)]"
      aria-hidden="true"
    />
  );
};

const TugOfWarStage: React.FC<{
  ropePos: number; // -100 (P1 wins) to +100 (P2 wins)
  lastPuller: 1 | 2 | null;
  p1Score: number;
  p2Score: number;
  botMode: boolean;
}> = ({ ropePos, lastPuller, p1Score, p2Score, botMode }) => {
  // Map -100..100 to SVG x offset (-130..+130 around center 280)
  const shiftX = (ropePos / 100) * 120;
  const flagX = 280 + shiftX;
  const p1Percent = Math.round(Math.max(0, Math.min(100, 50 - ropePos / 2)));
  const p2Percent = 100 - p1Percent;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 font-mono-tech text-[11px] uppercase">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#2563eb]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
          1-O‘yinchi (Ko‘k): {p1Score} ball · {p1Percent}%
        </span>
        <span className="hidden text-[var(--dim)] sm:inline">
          MARRA: ±100 · KUCH: {ropePos === 0 ? 'TENGLIK' : ropePos < 0 ? `KO‘K +${Math.abs(ropePos)}` : `QIZIL +${ropePos}`}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#f43f5e]">
          {botMode ? 'Bot (Qizil)' : '2-O‘yinchi (Qizil)'}: {p2Score} ball · {p2Percent}%
          <span className="h-2.5 w-2.5 rounded-full bg-[#f43f5e]" />
        </span>
      </div>

      {/* Tension Bar */}
      <div className="mb-2 flex h-2 w-full overflow-hidden rounded-full bg-[var(--surface)]">
        <motion.div
          className="h-full bg-[#2563eb]"
          animate={{ width: `${p1Percent}%` }}
          transition={{ type: 'spring', stiffness: 210, damping: 22 }}
        />
        <motion.div
          className="h-full bg-[#f43f5e]"
          animate={{ width: `${p2Percent}%` }}
          transition={{ type: 'spring', stiffness: 210, damping: 22 }}
        />
      </div>

      {/* SVG Rope & Teams Stage */}
      <svg
        viewBox="0 0 560 120"
        className="h-24 w-full select-none sm:h-28"
        aria-label="Arqon tortish maydoni"
      >
        {/* Left & Right Victory Zones */}
        <rect x="12" y="16" width="110" height="88" rx="10" fill="rgba(37, 99, 235, 0.10)" />
        <rect x="438" y="16" width="110" height="88" rx="10" fill="rgba(244, 63, 94, 0.10)" />

        {/* Victory Threshold Lines */}
        <line x1="160" y1="14" x2="160" y2="104" stroke="#2563eb" strokeDasharray="4 4" strokeOpacity="0.45" />
        <line x1="280" y1="10" x2="280" y2="108" stroke="var(--dim)" strokeDasharray="3 3" strokeOpacity="0.4" />
        <line x1="400" y1="14" x2="400" y2="104" stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity="0.45" />

        {/* Ground Track */}
        <line x1="20" y1="98" x2="540" y2="98" stroke="var(--grid)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Moving Rope + Teams */}
        <motion.g
          animate={{ x: shiftX * 0.45 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        >
          {/* Main Rope */}
          <line x1="78" y1="62" x2="482" y2="62" stroke="#d97706" strokeWidth="6" strokeLinecap="round" />
          <line
            x1="78"
            y1="62"
            x2="482"
            y2="62"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* Player 1 Team (Left Blue Pullers) */}
          <g transform={`translate(76, 30) rotate(${lastPuller === 1 ? -11 : -4}, 20, 65)`}>
            <circle cx="24" cy="14" r="10" fill="#2563eb" />
            <line x1="22" y1="24" x2="14" y2="48" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
            <line x1="14" y1="48" x2="6" y2="68" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            <line x1="14" y1="48" x2="24" y2="68" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            <line x1="20" y1="32" x2="42" y2="32" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <g transform={`translate(128, 32) rotate(${lastPuller === 1 ? -10 : -3}, 20, 64)`}>
            <circle cx="22" cy="14" r="9" fill="#3b82f6" />
            <line x1="20" y1="23" x2="14" y2="46" stroke="#3b82f6" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="14" y1="46" x2="7" y2="66" stroke="#1d4ed8" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="14" y1="46" x2="23" y2="66" stroke="#1d4ed8" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="18" y1="31" x2="38" y2="30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Player 2 Team (Right Red Pullers) */}
          <g transform={`translate(438, 30) rotate(${lastPuller === 2 ? 11 : 4}, 20, 65)`}>
            <circle cx="18" cy="14" r="10" fill="#f43f5e" />
            <line x1="20" y1="24" x2="28" y2="48" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            <line x1="28" y1="48" x2="36" y2="68" stroke="#be123c" strokeWidth="5" strokeLinecap="round" />
            <line x1="28" y1="48" x2="18" y2="68" stroke="#be123c" strokeWidth="5" strokeLinecap="round" />
            <line x1="22" y1="32" x2="0" y2="32" stroke="#fb7185" strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <g transform={`translate(388, 32) rotate(${lastPuller === 2 ? 10 : 3}, 20, 64)`}>
            <circle cx="18" cy="14" r="9" fill="#fb7185" />
            <line x1="20" y1="23" x2="26" y2="46" stroke="#fb7185" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="26" y1="46" x2="33" y2="66" stroke="#be123c" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="26" y1="46" x2="17" y2="66" stroke="#be123c" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="22" y1="31" x2="2" y2="30" stroke="#fda4af" strokeWidth="4" strokeLinecap="round" />
          </g>
        </motion.g>

        {/* Central Rope Knot & Marker Flag */}
        <motion.g
          animate={{ x: flagX - 280 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        >
          <line x1="280" y1="34" x2="280" y2="86" stroke="#ef4444" strokeWidth="2.5" />
          <polygon points="280,34 302,42 280,50" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          <circle cx="280" cy="62" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
        </motion.g>
      </svg>
    </div>
  );
};

const CONFETTI_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  angle: (i / 14) * Math.PI * 2,
  dist: 55 + (i % 3) * 28,
  color: ['#38bdf8', '#0284c7', '#2563eb', '#0ea5e9', '#10b981'][i % 5],
}));

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = (Math.abs(seed) || 1) + 1337;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionList<T extends { choices: string[]; answer: number }>(
  list: T[],
  seed: number,
  gameId: number
): T[] {
  return list.map((q, qIdx) => {
    const indexed = q.choices.map((text, idx) => ({ text, isCorrect: idx === q.answer }));
    const mixed = seededShuffle(indexed, seed + gameId * 31 + qIdx * 17);
    const nextAnswer = mixed.findIndex((item) => item.isCorrect);
    return {
      ...q,
      choices: mixed.map((item) => item.text),
      answer: nextAnswer >= 0 ? nextAnswer : 0,
    };
  });
}

export const GameArena: React.FC<GameArenaProps> = ({ game, onClose, onComplete }) => {
  const canPvp = supportsPvpEngine(game.engine);
  const isTugOfWar = game.engine === GameEngine.TUG_OF_WAR;

  const [playMode, setPlayMode] = useState<PlayMode>(isTugOfWar ? 'pvp' : 'solo');
  const [botMode, setBotMode] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Math.floor(Date.now() % 100000) + game.id);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Streak, setP1Streak] = useState(0);
  const [p2Streak, setP2Streak] = useState(0);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  const [scoreBurst, setScoreBurst] = useState<{ id: number; pts: number; player?: 1 | 2 } | null>(
    null
  );
  const [shakeKey, setShakeKey] = useState(0);

  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(game.durationSec);

  // Quiz Blitz (Solo & PvP)
  const [qIdx, setQIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [p1RoundWrong, setP1RoundWrong] = useState(false);
  const [p2RoundWrong, setP2RoundWrong] = useState(false);
  const [roundSolvedBy, setRoundSolvedBy] = useState<1 | 2 | 'none' | null>(null);

  // Shuffled Blitz & Tug of War questions (prevents predictable A/1 answer positions)
  const shuffledBlitz = useMemo(
    () => (game.blitz ? shuffleQuestionList(game.blitz, shuffleSeed, game.id) : []),
    [game.blitz, game.id, shuffleSeed]
  );

  const tugQuestions = useMemo(() => {
    const raw =
      game.tug && game.tug.length > 0
        ? game.tug
        : game.blitz && game.blitz.length > 0
        ? game.blitz
        : [];
    return shuffleQuestionList(raw, shuffleSeed + 97, game.id);
  }, [game.tug, game.blitz, game.id, shuffleSeed]);

  const [ropePos, setRopePos] = useState(0); // -100 P1 wins .. +100 P2 wins
  const [lastPuller, setLastPuller] = useState<1 | 2 | null>(null);
  const [p1TugIdx, setP1TugIdx] = useState(0);
  const [p2TugIdx, setP2TugIdx] = useState(() =>
    tugQuestions.length > 1 ? Math.floor(tugQuestions.length / 2) : 0
  );
  const [p1TugFeedback, setP1TugFeedback] = useState<string>('');
  const [p2TugFeedback, setP2TugFeedback] = useState<string>('');
  const [p1Stunned, setP1Stunned] = useState(false);
  const [p2Stunned, setP2Stunned] = useState(false);

  // Sort (shuffled so categories never strictly alternate)
  const [sortIdx, setSortIdx] = useState(0);
  const [sortBinCounts, setSortBinCounts] = useState<[number, number]>([0, 0]);
  const shuffledSortItems = useMemo(
    () => (game.sort ? seededShuffle(game.sort.items, shuffleSeed + game.id * 13) : []),
    [game.sort, game.id, shuffleSeed]
  );

  // Formula / Cipher
  const [fIdx, setFIdx] = useState(0);
  const [formulaInput, setFormulaInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const shuffledCipher = useMemo(() => {
    if (!game.cipher) return [];
    return game.cipher.map((item, idx) => ({
      ...item,
      options: item.options
        ? seededShuffle(item.options, shuffleSeed + game.id * 23 + idx * 11)
        : undefined,
    }));
  }, [game.cipher, game.id, shuffleSeed]);

  // Memory (both columns shuffled independently)
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [matchedLefts, setMatchedLefts] = useState<number[]>([]);
  const shuffledLefts = useMemo(() => {
    if (!game.memory) return [];
    return seededShuffle(
      game.memory.map((item, idx) => ({ text: item.left, origIdx: idx })),
      shuffleSeed + game.id * 7
    );
  }, [game.memory, game.id, shuffleSeed]);
  const shuffledRights = useMemo(() => {
    if (!game.memory) return [];
    return seededShuffle(
      game.memory.map((item, idx) => ({ text: item.right, origIdx: idx })),
      shuffleSeed + game.id * 19 + 41
    );
  }, [game.memory, game.id, shuffleSeed]);

  // Robot Maze
  const [commands, setCommands] = useState<Array<'FWD' | 'LEFT' | 'RIGHT'>>([]);
  const [botPos, setBotPos] = useState<{ r: number; c: number; dir: number }>({ r: 0, c: 0, dir: 0 });
  const [visitedCells, setVisitedCells] = useState<string[]>([]);
  const [runningMaze, setRunningMaze] = useState(false);

  // CodeLab / DB / Pixel / Chart
  const [codeText, setCodeText] = useState(game.codeLab?.[0]?.starter ?? '');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [dbScanning, setDbScanning] = useState(false);
  const [userPixels, setUserPixels] = useState<number[]>(() =>
    game.pixel ? new Array(game.pixel.size * game.pixel.size).fill(0) : []
  );
  const [chartVals, setChartVals] = useState<number[]>(() =>
    game.chart ? game.chart.labels.map(() => 2) : []
  );

  // Timer / Interval Refs for clean teardown
  const timeoutIdsRef = useRef<number[]>([]);
  const mazeIntervalRef = useRef<number | null>(null);

  const registerTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  const clearAllPendingTimers = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
    if (mazeIntervalRef.current !== null) {
      window.clearInterval(mazeIntervalRef.current);
      mazeIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAllPendingTimers();
  }, [clearAllPendingTimers]);

  useEffect(() => {
    if (game.maze) {
      let sr = 0,
        sc = 0;
      game.maze.grid.forEach((row, r) =>
        row.forEach((val, c) => {
          if (val === 2) {
            sr = r;
            sc = c;
          }
        })
      );
      setBotPos({ r: sr, c: sc, dir: game.maze.startDir });
      setVisitedCells([`${sr}-${sc}`]);
    }
  }, [game]);

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [finished]);

  const finishPvpGame = useCallback(
    (finalP1: number, finalP2: number, customMsg?: string) => {
      clearAllPendingTimers();
      setP1Score(finalP1);
      setP2Score(finalP2);
      const top = Math.max(finalP1, finalP2);
      setScore(top);
      let msg = customMsg;
      if (!msg) {
        if (finalP1 > finalP2) msg = '1-O‘yinchi (Ko‘k Jamoa) g‘olib bo‘ldi!';
        else if (finalP2 > finalP1)
          msg = botMode
            ? 'Bot (Qizil Jamoa) g‘olib bo‘ldi!'
            : '2-O‘yinchi (Qizil Jamoa) g‘olib bo‘ldi!';
        else msg = 'Durrang! Ikkala o‘yinchi ham teng natija ko‘rsatdi!';
      }
      setFeedback(msg);
      setFinished(true);
      onComplete?.(game.id, top);
    },
    [botMode, clearAllPendingTimers, game.id, onComplete]
  );

  const finishGame = useCallback(
    (finalScore: number, msg: string) => {
      clearAllPendingTimers();
      setScore(finalScore);
      setFeedback(msg);
      setFinished(true);
      onComplete?.(game.id, finalScore);
    },
    [clearAllPendingTimers, game.id, onComplete]
  );

  // Auto-finish Tug of War when 90s timer hits 0
  useEffect(() => {
    if (!finished && isTugOfWar && timeLeft === 0) {
      let msg = 'Vaqt tugadi — Durrang!';
      if (ropePos < 0) msg = 'Vaqt tugadi — 1-O‘yinchi (Ko‘k Jamoa) arqonni tortib g‘olib chiqdi!';
      else if (ropePos > 0)
        msg = botMode
          ? 'Vaqt tugadi — Bot (Qizil Jamoa) arqonni tortib g‘olib chiqdi!'
          : 'Vaqt tugadi — 2-O‘yinchi (Qizil Jamoa) arqonni tortib g‘olib chiqdi!';
      else if (p1Score > p2Score) msg = 'Vaqt tugadi — Ballar bo‘yicha 1-O‘yinchi g‘olib!';
      else if (p2Score > p1Score)
        msg = `Vaqt tugadi — Ballar bo‘yicha ${botMode ? 'Bot' : '2-O‘yinchi'} g‘olib!`;

      finishPvpGame(p1Score, p2Score, msg);
    }
  }, [finished, isTugOfWar, timeLeft, ropePos, p1Score, p2Score, botMode, finishPvpGame]);

  const awardPoints = useCallback((pts: number, player?: 1 | 2) => {
    if (player === 1) {
      setP1Streak((s) => s + 1);
    } else if (player === 2) {
      setP2Streak((s) => s + 1);
    } else {
      setStreak((s) => s + 1);
    }
    setScoreBurst({ id: Date.now() + Math.random(), pts, player });
  }, []);

  const triggerShake = useCallback((player?: 1 | 2) => {
    if (player === 1) setP1Streak(0);
    else if (player === 2) setP2Streak(0);
    else setStreak(0);
    setShakeKey((k) => k + 1);
  }, []);

  const resetGame = (overrideMode?: PlayMode, overrideBot?: boolean) => {
    clearAllPendingTimers();
    if (overrideMode !== undefined) setPlayMode(overrideMode);
    if (overrideBot !== undefined) setBotMode(overrideBot);
    setShuffleSeed((s) => s + 13);

    setScore(0);
    setStreak(0);
    setP1Score(0);
    setP2Score(0);
    setP1Streak(0);
    setP2Streak(0);
    setActivePlayer(1);
    setScoreBurst(null);
    setFinished(false);
    setFeedback('');
    setTimeLeft(game.durationSec);

    setQIdx(0);
    setSelectedChoice(null);
    setP1RoundWrong(false);
    setP2RoundWrong(false);
    setRoundSolvedBy(null);

    setRopePos(0);
    setLastPuller(null);
    setP1TugIdx(0);
    setP2TugIdx(tugQuestions.length > 1 ? Math.floor(tugQuestions.length / 2) : 0);
    setP1TugFeedback('');
    setP2TugFeedback('');
    setP1Stunned(false);
    setP2Stunned(false);

    setSortIdx(0);
    setSortBinCounts([0, 0]);
    setFIdx(0);
    setFormulaInput('');
    setShowHint(false);
    setSelLeft(null);
    setMatchedLefts([]);
    setCommands([]);
    setRunningMaze(false);
    setCodeText(game.codeLab?.[0]?.starter ?? '');
    setSelectedRows([]);
    setDbScanning(false);
    if (game.pixel) setUserPixels(new Array(game.pixel.size * game.pixel.size).fill(0));
    if (game.chart) setChartVals(game.chart.labels.map(() => 2));
    if (game.maze) {
      let sr = 0,
        sc = 0;
      game.maze.grid.forEach((row, r) =>
        row.forEach((val, c) => {
          if (val === 2) {
            sr = r;
            sc = c;
          }
        })
      );
      setBotPos({ r: sr, c: sc, dir: game.maze.startDir });
      setVisitedCells([`${sr}-${sc}`]);
    }
  };

  // ==================== TUG OF WAR HANDLERS ====================
  const handleTugAnswer = useCallback(
    (player: 1 | 2, choiceIdx: number) => {
      if (finished || tugQuestions.length === 0) return;
      if (player === 1 && p1Stunned) return;
      if (player === 2 && p2Stunned) return;

      const idx = player === 1 ? p1TugIdx : p2TugIdx;
      const q = tugQuestions[idx % tugQuestions.length];
      const ok = choiceIdx === q.answer;

      if (ok) {
        const pullPower =
          (player === 1 ? p1Streak : p2Streak) >= 2 ? 22 : 18;
        const nextRope =
          player === 1
            ? Math.max(-100, ropePos - pullPower)
            : Math.min(100, ropePos + pullPower);

        const nextP1 = player === 1 ? p1Score + 25 : p1Score;
        const nextP2 = player === 2 ? p2Score + 25 : p2Score;

        if (player === 1) {
          setP1Score(nextP1);
          setP1TugFeedback(`To‘g‘ri! Arqon -${pullPower} tortildi!`);
          setP1TugIdx((i) => (i + 1) % tugQuestions.length);
        } else {
          setP2Score(nextP2);
          setP2TugFeedback(`To‘g‘ri! Arqon +${pullPower} tortildi!`);
          setP2TugIdx((i) => (i + 1) % tugQuestions.length);
        }

        setRopePos(nextRope);
        setLastPuller(player);
        awardPoints(25, player);

        if (nextRope <= -100) {
          finishPvpGame(nextP1, nextP2, '1-O‘yinchi (Ko‘k Jamoa) arqonni to‘liq tortib g‘olib bo‘ldi!');
          return;
        }
        if (nextRope >= 100) {
          finishPvpGame(
            nextP1,
            nextP2,
            botMode
              ? 'Bot (Qizil Jamoa) arqonni to‘liq tortib g‘olib bo‘ldi!'
              : '2-O‘yinchi (Qizil Jamoa) arqonni to‘liq tortib g‘olib bo‘ldi!'
          );
          return;
        }
      } else {
        const slip = 6;
        const nextRope =
          player === 1
            ? Math.min(95, ropePos + slip)
            : Math.max(-95, ropePos - slip);
        setRopePos(nextRope);
        triggerShake(player);

        if (player === 1) {
          setP1Stunned(true);
          setP1TugFeedback('Noto‘g‘ri! 1s tanaffus...');
          registerTimeout(() => {
            setP1Stunned(false);
            setP1TugIdx((i) => (i + 1) % tugQuestions.length);
          }, 950);
        } else {
          setP2Stunned(true);
          setP2TugFeedback('Noto‘g‘ri! 1s tanaffus...');
          registerTimeout(() => {
            setP2Stunned(false);
            setP2TugIdx((i) => (i + 1) % tugQuestions.length);
          }, 950);
        }
      }
    },
    [
      awardPoints,
      botMode,
      finished,
      finishPvpGame,
      p1Score,
      p1Streak,
      p1Stunned,
      p1TugIdx,
      p2Score,
      p2Streak,
      p2Stunned,
      p2TugIdx,
      registerTimeout,
      ropePos,
      triggerShake,
      tugQuestions,
    ]
  );

  // Bot AI opponent in Tug of War solo mode
  useEffect(() => {
    if (!isTugOfWar || !botMode || finished || tugQuestions.length === 0) return;
    const delay = 2400 + Math.floor(Math.random() * 1100);
    const id = window.setTimeout(() => {
      const q = tugQuestions[p2TugIdx % tugQuestions.length];
      const willWin = Math.random() < 0.74;
      const choice = willWin
        ? q.answer
        : (q.answer + 1 + Math.floor(Math.random() * (q.choices.length - 1))) % q.choices.length;
      handleTugAnswer(2, choice);
    }, delay);
    return () => window.clearTimeout(id);
  }, [isTugOfWar, botMode, finished, tugQuestions, p2TugIdx, p2Stunned, handleTugAnswer]);

  // ==================== QUIZ BLITZ (SOLO + PVP) ====================
  const handleBlitzAnswer = useCallback(
    (choiceIdx: number) => {
      if (shuffledBlitz.length === 0 || selectedChoice !== null) return;
      setSelectedChoice(choiceIdx);
      const q = shuffledBlitz[qIdx];
      const ok = choiceIdx === q.answer;
      const nextScore = ok ? score + 25 : score;
      setScore(nextScore);
      if (ok) awardPoints(25);
      else triggerShake();
      setFeedback(ok ? `To‘g‘ri! ${q.tip}` : `Noto‘g‘ri. ${q.tip}`);

      registerTimeout(() => {
        if (qIdx + 1 < shuffledBlitz.length) {
          setQIdx((i) => i + 1);
          setSelectedChoice(null);
          setFeedback('');
        } else {
          finishGame(nextScore, 'Blits o‘yin yakunlandi!');
        }
      }, 900);
    },
    [awardPoints, finishGame, qIdx, registerTimeout, score, selectedChoice, shuffledBlitz, triggerShake]
  );

  const handlePvpBlitzAnswer = useCallback(
    (player: 1 | 2, choiceIdx: number) => {
      if (shuffledBlitz.length === 0 || finished || roundSolvedBy !== null) return;
      if (player === 1 && p1RoundWrong) return;
      if (player === 2 && p2RoundWrong) return;

      const q = shuffledBlitz[qIdx];
      const ok = choiceIdx === q.answer;

      if (ok) {
        const nextP1 = player === 1 ? p1Score + 25 : p1Score;
        const nextP2 = player === 2 ? p2Score + 25 : p2Score;
        if (player === 1) setP1Score(nextP1);
        else setP2Score(nextP2);
        awardPoints(25, player);
        setRoundSolvedBy(player);
        setFeedback(`${player}-O‘yinchi tez va to‘g‘ri javob berdi! ${q.tip}`);

        registerTimeout(() => {
          if (qIdx + 1 < shuffledBlitz.length) {
            setQIdx((i) => i + 1);
            setP1RoundWrong(false);
            setP2RoundWrong(false);
            setRoundSolvedBy(null);
            setFeedback('');
          } else {
            finishPvpGame(nextP1, nextP2);
          }
        }, 850);
      } else {
        triggerShake(player);
        const nextP1 = player === 1 ? Math.max(0, p1Score - 5) : p1Score;
        const nextP2 = player === 2 ? Math.max(0, p2Score - 5) : p2Score;
        if (player === 1) {
          setP1Score(nextP1);
          setP1RoundWrong(true);
        } else {
          setP2Score(nextP2);
          setP2RoundWrong(true);
        }

        const bothWrong = (player === 1 && p2RoundWrong) || (player === 2 && p1RoundWrong);
        if (bothWrong) {
          setRoundSolvedBy('none');
          setFeedback(`Ikkala o‘yinchi ham xato qildi. ${q.tip}`);
          registerTimeout(() => {
            if (qIdx + 1 < shuffledBlitz.length) {
              setQIdx((i) => i + 1);
              setP1RoundWrong(false);
              setP2RoundWrong(false);
              setRoundSolvedBy(null);
              setFeedback('');
            } else {
              finishPvpGame(nextP1, nextP2);
            }
          }, 1050);
        } else {
          setFeedback(`${player}-O‘yinchi xato qildi (-5 ball). Ikkinchi o‘yinchi javob berishi mumkin!`);
        }
      }
    },
    [
      awardPoints,
      finished,
      finishPvpGame,
      p1RoundWrong,
      p1Score,
      p2RoundWrong,
      p2Score,
      qIdx,
      registerTimeout,
      roundSolvedBy,
      shuffledBlitz,
      triggerShake,
    ]
  );

  // Keyboard shortcuts for simultaneous PvP (TUG_OF_WAR and QUIZ_BLITZ PvP)
  useEffect(() => {
    if (finished) return;
    const activeSimPvp =
      isTugOfWar || (playMode === 'pvp' && game.engine === GameEngine.QUIZ_BLITZ);
    if (!activeSimPvp) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toUpperCase();
      const p1Idx = P1_KEYS.indexOf(key);
      if (p1Idx !== -1) {
        e.preventDefault();
        if (isTugOfWar) handleTugAnswer(1, p1Idx);
        else handlePvpBlitzAnswer(1, p1Idx);
        return;
      }
      if (!botMode) {
        const p2Idx = P2_KEYS.indexOf(key);
        if (p2Idx !== -1) {
          e.preventDefault();
          if (isTugOfWar) handleTugAnswer(2, p2Idx);
          else handlePvpBlitzAnswer(2, p2Idx);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [botMode, finished, game.engine, handlePvpBlitzAnswer, handleTugAnswer, isTugOfWar, playMode]);

  // ==================== TURN-BASED & SOLO HANDLERS ====================
  const handleSortPick = (catIdx: 0 | 1) => {
    if (shuffledSortItems.length === 0) return;
    const item = shuffledSortItems[sortIdx];
    const ok = item.categoryIndex === catIdx;
    setSortBinCounts(([a, b]) => (catIdx === 0 ? [a + 1, b] : [a, b + 1]));

    if (playMode === 'pvp') {
      const nextP1 = ok && activePlayer === 1 ? p1Score + 20 : p1Score;
      const nextP2 = ok && activePlayer === 2 ? p2Score + 20 : p2Score;
      if (activePlayer === 1) setP1Score(nextP1);
      else setP2Score(nextP2);

      if (ok) awardPoints(20, activePlayer);
      else triggerShake(activePlayer);

      setFeedback(
        ok
          ? `${activePlayer}-O‘yinchi to‘g‘ri joylashtirdi (+20)!`
          : `${activePlayer}-O‘yinchi xato qildi. Navbat o‘zgardi.`
      );
      if (sortIdx + 1 < shuffledSortItems.length) {
        setSortIdx((i) => i + 1);
        setActivePlayer((p) => (p === 1 ? 2 : 1));
      } else {
        finishPvpGame(nextP1, nextP2);
      }
      return;
    }

    const nextScore = ok ? score + 20 : score;
    setScore(nextScore);
    if (ok) awardPoints(20);
    else triggerShake();
    setFeedback(ok ? 'To‘g‘ri joylashtirildi!' : 'Boshqa toifaga tegishli edi.');
    if (sortIdx + 1 < shuffledSortItems.length) {
      setSortIdx((i) => i + 1);
    } else {
      finishGame(nextScore, 'Barcha elementlar saralandi!');
    }
  };

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!game.formula) return;
    const ch = game.formula[fIdx];
    const norm = (s: string) => s.replace(/\s+/g, '').toUpperCase();
    const ok = ch.accepted.some((a) => norm(a) === norm(formulaInput));

    if (playMode === 'pvp') {
      if (ok) {
        const nextP1 = activePlayer === 1 ? p1Score + 35 : p1Score;
        const nextP2 = activePlayer === 2 ? p2Score + 35 : p2Score;
        if (activePlayer === 1) setP1Score(nextP1);
        else setP2Score(nextP2);
        awardPoints(35, activePlayer);
        setFeedback(`${activePlayer}-O‘yinchi formulani to‘g‘ri tuzdi (+35)!`);
        if (fIdx + 1 < game.formula.length) {
          registerTimeout(() => {
            setFIdx((i) => i + 1);
            setFormulaInput('');
            setFeedback('');
            setShowHint(false);
            setActivePlayer((p) => (p === 1 ? 2 : 1));
          }, 700);
        } else {
          finishPvpGame(nextP1, nextP2);
        }
      } else {
        triggerShake(activePlayer);
        const nextPlayer = activePlayer === 1 ? 2 : 1;
        setActivePlayer(nextPlayer);
        setFeedback(`Xato! Navbat ${nextPlayer}-O‘yinchiga o‘tdi.`);
      }
      return;
    }

    if (ok) {
      const nextScore = score + 35;
      setScore(nextScore);
      awardPoints(35);
      setFeedback('Ajoyib! Formula to‘g‘ri tuzildi.');
      if (fIdx + 1 < game.formula.length) {
        registerTimeout(() => {
          setFIdx((i) => i + 1);
          setFormulaInput('');
          setFeedback('');
          setShowHint(false);
        }, 700);
      } else {
        finishGame(nextScore, 'Barcha formulalar muvaffaqiyatli yechildi!');
      }
    } else {
      triggerShake();
      setFeedback('Formula noto‘g‘ri. "=" belgisi, funksiya nomi va katak manzilini tekshiring.');
    }
  };

  const handleCipherAnswer = (val: string) => {
    if (shuffledCipher.length === 0) return;
    const ch = shuffledCipher[fIdx];
    const ok = val.trim().toLowerCase() === ch.answer.trim().toLowerCase();

    if (playMode === 'pvp') {
      if (ok) {
        const nextP1 = activePlayer === 1 ? p1Score + 35 : p1Score;
        const nextP2 = activePlayer === 2 ? p2Score + 35 : p2Score;
        if (activePlayer === 1) setP1Score(nextP1);
        else setP2Score(nextP2);
        awardPoints(35, activePlayer);
        setFeedback(`${activePlayer}-O‘yinchi to‘g‘ri topdi (+35)!`);
        if (fIdx + 1 < shuffledCipher.length) {
          registerTimeout(() => {
            setFIdx((i) => i + 1);
            setFormulaInput('');
            setFeedback('');
            setShowHint(false);
            setActivePlayer((p) => (p === 1 ? 2 : 1));
          }, 650);
        } else {
          finishPvpGame(nextP1, nextP2);
        }
      } else {
        triggerShake(activePlayer);
        const nextPlayer = activePlayer === 1 ? 2 : 1;
        setActivePlayer(nextPlayer);
        setFeedback(`Mos kelmadi! Navbat ${nextPlayer}-O‘yinchiga o‘tdi.`);
      }
      return;
    }

    if (ok) {
      const nextScore = score + 35;
      setScore(nextScore);
      awardPoints(35);
      setFeedback('To‘g‘ri javob!');
      if (fIdx + 1 < shuffledCipher.length) {
        registerTimeout(() => {
          setFIdx((i) => i + 1);
          setFormulaInput('');
          setFeedback('');
          setShowHint(false);
        }, 650);
      } else {
        finishGame(nextScore, 'Barcha hisob-kitob va shifrlar yechildi!');
      }
    } else {
      triggerShake();
      setScore((s) => Math.max(0, s - 5));
      setFeedback('Javob mos kelmadi (-5 ball), qayta tekshiring.');
    }
  };

  const handleRightMatch = (origIdx: number) => {
    if (selLeft === null) return;
    if (selLeft === origIdx) {
      const updated = [...matchedLefts, origIdx];
      setMatchedLefts(updated);
      setSelLeft(null);

      if (playMode === 'pvp') {
        const nextP1 = activePlayer === 1 ? p1Score + 20 : p1Score;
        const nextP2 = activePlayer === 2 ? p2Score + 20 : p2Score;
        if (activePlayer === 1) setP1Score(nextP1);
        else setP2Score(nextP2);
        awardPoints(20, activePlayer);
        setFeedback(`${activePlayer}-O‘yinchi juftlik topdi (+20)! Navbat saqlandi.`);
        if (game.memory && updated.length === game.memory.length) {
          finishPvpGame(nextP1, nextP2);
        }
        return;
      }

      const nextScore = score + 20;
      setScore(nextScore);
      awardPoints(20);
      setFeedback('Juftlik topildi!');
      if (game.memory && updated.length === game.memory.length) {
        finishGame(nextScore, 'Barcha terminlar juftlandi!');
      }
    } else {
      if (playMode === 'pvp') {
        triggerShake(activePlayer);
        const nextPlayer = activePlayer === 1 ? 2 : 1;
        setActivePlayer(nextPlayer);
        setFeedback(`Mos kelmadi. Navbat ${nextPlayer}-O‘yinchiga o‘tdi.`);
        setSelLeft(null);
        return;
      }
      triggerShake();
      setScore((s) => Math.max(0, s - 5));
      setFeedback('Mos kelmadi (-5 ball), boshqa ta’rifni sinang.');
      setSelLeft(null);
    }
  };

  const runMaze = () => {
    if (!game.maze || runningMaze || commands.length === 0) return;
    const grid = game.maze.grid;
    let sr = 0,
      sc = 0;
    grid.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v === 2) {
          sr = r;
          sc = c;
        }
      })
    );
    let r = sr,
      c = sc,
      dir: number = game.maze.startDir;
    setBotPos({ r, c, dir });
    setVisitedCells([`${r}-${c}`]);
    setRunningMaze(true);
    setFeedback('Robot harakatlanmoqda...');

    let step = 0;
    if (mazeIntervalRef.current !== null) clearInterval(mazeIntervalRef.current);
    const timer = window.setInterval(() => {
      if (step >= commands.length) {
        clearInterval(timer);
        mazeIntervalRef.current = null;
        setRunningMaze(false);
        if (grid[r][c] === 3) {
          awardPoints(100);
          finishGame(100, 'Tabriklaymiz! Robot marraga yetdi!');
        } else {
          triggerShake();
          setFeedback('Buyruqlar tugadi, lekin marra (bayroqcha) ga yetmadi.');
        }
        return;
      }

      const cmd = commands[step++];
      if (cmd === 'LEFT') {
        dir = (dir + 3) % 4;
      } else if (cmd === 'RIGHT') {
        dir = (dir + 1) % 4;
      } else {
        const dr = [0, 1, 0, -1][dir];
        const dc = [1, 0, -1, 0][dir];
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length || grid[nr][nc] === 1) {
          clearInterval(timer);
          mazeIntervalRef.current = null;
          setRunningMaze(false);
          triggerShake();
          setFeedback('To‘siqqa (devorga) urildi! Qayta urinib ko‘ring.');
          return;
        }
        r = nr;
        c = nc;
        setVisitedCells((prev) => (prev.includes(`${r}-${c}`) ? prev : [...prev, `${r}-${c}`]));
      }
      setBotPos({ r, c, dir });
      if (grid[r][c] === 3) {
        clearInterval(timer);
        mazeIntervalRef.current = null;
        setRunningMaze(false);
        awardPoints(100);
        finishGame(100, 'Tabriklaymiz! Robot marraga yetdi!');
      }
    }, 280);
    mazeIntervalRef.current = timer;
  };

  const handleCodeCheck = () => {
    if (!game.codeLab) return;
    const ch = game.codeLab[0];
    if (codeText.trim() === ch.starter.trim()) {
      triggerShake();
      setFeedback('Avval topshiriq shartiga mos kod yozing, boshlang‘ich izoh o‘zgartirilmagan.');
      return;
    }
    // Strip HTML and JS comments so comment text never passes token validation
    const stripped = codeText
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .toLowerCase();
    const missing = ch.requiredTokens.filter((tok) => !stripped.includes(tok.toLowerCase()));
    if (missing.length === 0) {
      awardPoints(100);
      finishGame(100, 'Kod barcha talablarga javob beradi!');
    } else {
      triggerShake();
      setFeedback(`Kodingizda quyidagi qismlar yetishmayapti: ${missing.join(', ')}`);
    }
  };

  const handleDbSubmit = () => {
    if (!game.db) return;
    const ch = game.db[0];
    setDbScanning(true);
    registerTimeout(() => {
      setDbScanning(false);
      const a = [...selectedRows].sort().join(',');
      const b = [...ch.matchRowIndices].sort().join(',');
      if (a === b) {
        awardPoints(100);
        finishGame(100, 'Query so‘rovi bo‘yicha aniq qatorlar tanlandi!');
      } else {
        triggerShake();
        setFeedback('Tanlangan qatorlar Query shartiga to‘liq mos kelmadi. Qayta tekshiring.');
      }
    }, 320);
  };

  const handlePixelToggle = (idx: number) => {
    if (!game.pixel || finished) return;
    const next = [...userPixels];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setUserPixels(next);
    const match = next.every((v, i) => v === game.pixel!.target[i]);
    if (match) {
      awardPoints(100);
      finishGame(100, 'Piksel shakli 100% aniq chizildi!');
    }
  };

  const handleChartCheck = () => {
    if (!game.chart) return;
    const ok = chartVals.every((v, i) => v === game.chart!.targets[i]);
    if (ok) {
      awardPoints(100);
      finishGame(100, 'Barcha ustun qiymatlari diagrammaga aniq joylandi!');
    } else {
      triggerShake();
      setFeedback('Hali hamma ustunlar maqsadli qiymatga teng emas.');
    }
  };

  const progressRatio = useMemo(() => {
    if (finished) return 1;
    if (isTugOfWar) return Math.min(1, Math.abs(ropePos) / 100);
    if (game.engine === GameEngine.QUIZ_BLITZ && game.blitz) return qIdx / game.blitz.length;
    if (game.engine === GameEngine.CLASSIFY_SORT && game.sort) return sortIdx / game.sort.items.length;
    if (game.engine === GameEngine.FORMULA_BUILDER && game.formula) return fIdx / game.formula.length;
    if (game.engine === GameEngine.CIPHER_NET && game.cipher) return fIdx / game.cipher.length;
    if (game.engine === GameEngine.MEMORY_PAIR && game.memory)
      return matchedLefts.length / game.memory.length;
    if (game.engine === GameEngine.PIXEL_GRID && game.pixel) {
      const matched = userPixels.filter((v, i) => v === game.pixel!.target[i]).length;
      return matched / game.pixel.target.length;
    }
    return 0.15;
  }, [finished, isTugOfWar, ropePos, game, qIdx, sortIdx, fIdx, matchedLefts.length, userPixels]);

  const activeStreak = playMode === 'pvp' ? Math.max(p1Streak, p2Streak) : streak;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)] text-[var(--ink)] shadow-sm"
    >
      {/* Animated Top Progress Strip */}
      <div className="h-1 w-full bg-[var(--grid)]">
        <motion.div
          className="h-full"
          animate={{ width: `${Math.max(4, Math.round(progressRatio * 100))}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          style={{ background: 'linear-gradient(90deg, #38bdf8, #2563eb, #059669)' }}
        />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--grid)] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <SparkleButton
            variant="secondary"
            size="sm"
            withParticles={false}
            onClick={onClose}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Orqaga</span>
          </SparkleButton>
          <div>
            <div className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--dim)]">
              O‘YIN #{game.id} · {game.grade}-SINF · {game.engine}
              {canPvp ? ' · 2 KISHI PvP' : ''}
            </div>
            <h3 className="text-base font-medium sm:text-lg">{game.title}</h3>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-2.5 font-mono-tech text-xs uppercase">
          {/* PvP Mode Switcher ONLY for compatible engines */}
          {canPvp && !finished && (
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-1">
              {isTugOfWar ? (
                <>
                  <SparkleButton
                    variant={!botMode ? 'active' : 'subtle'}
                    size="xs"
                    withParticles={false}
                    onClick={() => resetGame('pvp', false)}
                  >
                    <Users className="h-3 w-3" />
                    <span>2 Kishi PvP</span>
                  </SparkleButton>
                  <SparkleButton
                    variant={botMode ? 'active' : 'subtle'}
                    size="xs"
                    withParticles={false}
                    onClick={() => resetGame('pvp', true)}
                  >
                    <Bot className="h-3 w-3" />
                    <span>vs Bot</span>
                  </SparkleButton>
                </>
              ) : (
                <>
                  <SparkleButton
                    variant={playMode === 'solo' ? 'active' : 'subtle'}
                    size="xs"
                    withParticles={false}
                    onClick={() => resetGame('solo', false)}
                  >
                    <User className="h-3 w-3" />
                    <span>1 Kishi</span>
                  </SparkleButton>
                  <SparkleButton
                    variant={playMode === 'pvp' ? 'active' : 'subtle'}
                    size="xs"
                    withParticles={false}
                    onClick={() => resetGame('pvp', false)}
                  >
                    <Users className="h-3 w-3" />
                    <span>2 Kishi (PvP)</span>
                  </SparkleButton>
                </>
              )}
            </div>
          )}

          {activeStreak > 1 && (
            <motion.span
              key={activeStreak}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 rounded-xl bg-[#0284c7]/15 px-2.5 py-1 text-[#0284c7]"
            >
              <Flame className="h-3.5 w-3.5" />
              {activeStreak}x
            </motion.span>
          )}
          <span>Vaqt: {timeLeft}s</span>
          <div className="relative">
            {playMode === 'pvp' ? (
              <span className="inline-flex items-center gap-2 font-semibold">
                <span className="text-[#2563eb]">1P:{p1Score}</span>
                <span className="text-[var(--dim)]">vs</span>
                <span className="text-[#f43f5e]">2P:{p2Score}</span>
              </span>
            ) : (
              <motion.span
                key={score}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                className="inline-block font-semibold text-[var(--accent)]"
              >
                Ball: {score}
              </motion.span>
            )}
            <AnimatePresence>
              {scoreBurst && (
                <motion.span
                  key={scoreBurst.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -22, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="pointer-events-none absolute -top-2 right-0 whitespace-nowrap text-[11px] font-bold text-emerald-500"
                >
                  +{scoreBurst.pts}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <SparkleButton
            variant="secondary"
            size="xs"
            withParticles={false}
            onClick={() => resetGame()}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Qayta</span>
          </SparkleButton>
        </div>
      </div>

      {/* Body with Wrong-Answer Shake */}
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [0, -7, 7, -5, 5, 0] } : undefined}
        transition={{ duration: 0.34 }}
        className="p-5 sm:p-6"
      >
        <p className="mb-4 text-sm text-[var(--dim)]">{game.idea}</p>

        {finished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="relative overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-6 text-center"
          >
            <div className="pointer-events-none absolute left-1/2 top-12">
              {CONFETTI_PARTICLES.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos(p.angle) * p.dist,
                    y: Math.sin(p.angle) * p.dist,
                    scale: 0.2,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.95, ease: 'easeOut' }}
                  className="absolute h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>

            <motion.div
              initial={{ rotate: -18, scale: 0.5 }}
              animate={{ rotate: [0, 8, -6, 0], scale: 1 }}
              transition={{ duration: 0.55 }}
            >
              <Trophy className="mx-auto h-11 w-11 text-[var(--accent)]" />
            </motion.div>
            <h4 className="mt-3 text-xl font-medium">{feedback || 'O‘yin yakunlandi!'}</h4>

            {playMode === 'pvp' ? (
              <div className="mx-auto mt-4 grid max-w-md grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border p-3 ${
                    p1Score >= p2Score
                      ? 'border-[#2563eb] bg-[#2563eb]/10'
                      : 'border-[var(--grid)] bg-[var(--surface)]'
                  }`}
                >
                  <div className="font-mono-tech text-[10px] uppercase text-[#2563eb]">
                    1-O‘yinchi (Ko‘k)
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{p1Score}</div>
                </div>
                <div
                  className={`rounded-xl border p-3 ${
                    p2Score >= p1Score
                      ? 'border-[#f43f5e] bg-[#f43f5e]/10'
                      : 'border-[var(--grid)] bg-[var(--surface)]'
                  }`}
                >
                  <div className="font-mono-tech text-[10px] uppercase text-[#f43f5e]">
                    {botMode ? 'Bot (Qizil)' : '2-O‘yinchi (Qizil)'}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">{p2Score}</div>
                </div>
              </div>
            ) : (
              <p className="mt-1 inline-flex items-center gap-1.5 font-mono-tech text-sm text-[var(--dim)]">
                <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
                Jami ball: {score}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <SparkleButton
                variant="secondary"
                size="md"
                withParticles
                onClick={() => resetGame()}
              >
                Yana o‘ynash
              </SparkleButton>
              <SparkleButton
                variant="primary"
                size="md"
                showSparkle
                withParticles
                onClick={onClose}
              >
                O‘yinlarga qaytish
              </SparkleButton>
            </div>
          </motion.div>
        ) : (
          <div>
            {!isTugOfWar && (
              <GameSignalCanvas
                active={!finished}
                progress={progressRatio}
                streak={activeStreak}
                engine={game.engine}
              />
            )}

            {/* Shared PvP Turn & Scoreboard Banner for non-TugOfWar PvP games */}
            {playMode === 'pvp' && !isTugOfWar && (
              <div className="mb-4 grid grid-cols-3 items-center gap-2 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-2.5 font-mono-tech text-xs">
                <div
                  className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                    game.engine !== GameEngine.QUIZ_BLITZ && activePlayer === 1
                      ? 'border border-[#2563eb] bg-[#2563eb]/15 font-semibold text-[#2563eb]'
                      : 'text-[#2563eb]'
                  }`}
                >
                  1-O‘yinchi: {p1Score}
                </div>
                <div className="text-center text-[10px] uppercase text-[var(--dim)]">
                  <span className="inline-flex items-center gap-1">
                    <Swords className="h-3 w-3 text-[var(--accent)]" />
                    {game.engine === GameEngine.QUIZ_BLITZ
                      ? 'Bir vaqtda duel'
                      : `Navbat: ${activePlayer}-O‘yinchi`}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-2.5 py-1.5 text-right transition-colors ${
                    game.engine !== GameEngine.QUIZ_BLITZ && activePlayer === 2
                      ? 'border border-[#f43f5e] bg-[#f43f5e]/15 font-semibold text-[#f43f5e]'
                      : 'text-[#f43f5e]'
                  }`}
                >
                  2-O‘yinchi: {p2Score}
                </div>
              </div>
            )}

            {/* ==================== ENGINE: TUG_OF_WAR (ARQON TORTISH PvP) ==================== */}
            {isTugOfWar && tugQuestions.length > 0 && (
              <div className="space-y-4">
                <TugOfWarStage
                  ropePos={ropePos}
                  lastPuller={lastPuller}
                  p1Score={p1Score}
                  p2Score={p2Score}
                  botMode={botMode}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Player 1 Panel */}
                  <div
                    className={`rounded-2xl border-2 p-4 transition-colors ${
                      p1Stunned
                        ? 'border-rose-500/50 bg-rose-500/5 opacity-80'
                        : 'border-[#2563eb]/45 bg-[var(--bg)]'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between font-mono-tech text-[11px] uppercase">
                      <span className="font-semibold text-[#2563eb]">
                        1-O‘YINCHI (KO‘K) · KLAVIATURA: A S D F
                      </span>
                      {p1Streak > 1 && (
                        <span className="rounded bg-[#2563eb]/15 px-1.5 py-0.5 text-[#2563eb]">
                          {p1Streak}x KUCH
                        </span>
                      )}
                    </div>
                    <div className="mb-3 min-h-[54px] rounded-xl border border-[var(--grid)] bg-[var(--surface)] p-3 text-sm font-medium">
                      {tugQuestions[p1TugIdx % tugQuestions.length].prompt}
                    </div>
                    <div className="grid gap-2">
                      {tugQuestions[p1TugIdx % tugQuestions.length].choices.map((ch, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={p1Stunned}
                          onClick={() => handleTugAnswer(1, idx)}
                          className="sparkle-option flex items-center gap-2.5 p-2.5 text-left text-xs sm:text-sm"
                        >
                          <span className="font-mono-tech inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#2563eb]/15 text-[11px] font-bold text-[#2563eb]">
                            {P1_KEYS[idx]}
                          </span>
                          <span>{ch}</span>
                        </button>
                      ))}
                    </div>
                    {p1TugFeedback && (
                      <div className="mt-2 font-mono-tech text-[11px] text-[#2563eb]">
                        {p1TugFeedback}
                      </div>
                    )}
                  </div>

                  {/* Player 2 / Bot Panel */}
                  <div
                    className={`rounded-2xl border-2 p-4 transition-colors ${
                      p2Stunned
                        ? 'border-rose-500/50 bg-rose-500/5 opacity-80'
                        : 'border-[#f43f5e]/45 bg-[var(--bg)]'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between font-mono-tech text-[11px] uppercase">
                      <span className="font-semibold text-[#f43f5e]">
                        {botMode ? 'BOT RAQIB (QIZIL)' : '2-O‘YINCHI (QIZIL) · KLAVIATURA: 1 2 3 4'}
                      </span>
                      {p2Streak > 1 && (
                        <span className="rounded bg-[#f43f5e]/15 px-1.5 py-0.5 text-[#f43f5e]">
                          {p2Streak}x KUCH
                        </span>
                      )}
                    </div>
                    <div className="mb-3 min-h-[54px] rounded-xl border border-[var(--grid)] bg-[var(--surface)] p-3 text-sm font-medium">
                      {tugQuestions[p2TugIdx % tugQuestions.length].prompt}
                    </div>
                    <div className="grid gap-2">
                      {tugQuestions[p2TugIdx % tugQuestions.length].choices.map((ch, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={p2Stunned || botMode}
                          onClick={() => handleTugAnswer(2, idx)}
                          className="sparkle-option flex items-center gap-2.5 p-2.5 text-left text-xs sm:text-sm"
                        >
                          <span className="font-mono-tech inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f43f5e]/15 text-[11px] font-bold text-[#f43f5e]">
                            {P2_KEYS[idx]}
                          </span>
                          <span>{ch}</span>
                        </button>
                      ))}
                    </div>
                    {p2TugFeedback && (
                      <div className="mt-2 font-mono-tech text-[11px] text-[#f43f5e]">
                        {p2TugFeedback}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ENGINE: QUIZ_BLITZ (SOLO OR SPLIT-SCREEN PvP) ==================== */}
            {game.engine === GameEngine.QUIZ_BLITZ && shuffledBlitz.length > 0 && playMode === 'solo' && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={qIdx}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.24 }}
                  className="space-y-4"
                >
                  <div className="font-mono-tech text-xs uppercase text-[var(--dim)]">
                    Savol {qIdx + 1} / {shuffledBlitz.length}
                  </div>
                  <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-4 text-base font-medium">
                    {shuffledBlitz[qIdx].prompt}
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {shuffledBlitz[qIdx].choices.map((ch, idx) => {
                      const chosen = selectedChoice === idx;
                      const isAns = idx === shuffledBlitz[qIdx].answer;
                      let cls = 'sparkle-option';
                      if (selectedChoice !== null) {
                        if (isAns) cls = 'sparkle-option border-emerald-500 bg-emerald-500/15 text-emerald-500';
                        else if (chosen) cls = 'sparkle-option border-rose-500 bg-rose-500/15 text-rose-500';
                      }
                      return (
                        <motion.button
                          whileHover={selectedChoice === null ? { scale: 1.02, y: -1 } : undefined}
                          whileTap={selectedChoice === null ? { scale: 0.97 } : undefined}
                          key={idx}
                          type="button"
                          onClick={() => handleBlitzAnswer(idx)}
                          className={`p-3.5 text-left text-sm ${cls}`}
                        >
                          <span className="font-mono-tech mr-2 text-xs opacity-60">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {ch}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {game.engine === GameEngine.QUIZ_BLITZ && shuffledBlitz.length > 0 && playMode === 'pvp' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono-tech text-xs uppercase text-[var(--dim)]">
                  <span>
                    Savol {qIdx + 1} / {shuffledBlitz.length}
                  </span>
                  <span>Kim tezroq to‘g‘ri topsa, +25 ball oladi!</span>
                </div>
                <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-4 text-center text-base font-medium sm:text-lg">
                  {shuffledBlitz[qIdx].prompt}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* P1 Side */}
                  <div
                    className={`rounded-xl border-2 p-3.5 ${
                      p1RoundWrong
                        ? 'border-rose-500/40 bg-rose-500/5 opacity-60'
                        : roundSolvedBy === 1
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-[#2563eb]/45 bg-[var(--bg)]'
                    }`}
                  >
                    <div className="mb-2 font-mono-tech text-[11px] font-semibold uppercase text-[#2563eb]">
                      1-O‘yinchi (Ko‘k) · Tugmalar: A S D F
                    </div>
                    <div className="grid gap-2">
                      {shuffledBlitz[qIdx].choices.map((ch, idx) => {
                        const isAns = roundSolvedBy !== null && idx === shuffledBlitz[qIdx].answer;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={p1RoundWrong || roundSolvedBy !== null}
                            onClick={() => handlePvpBlitzAnswer(1, idx)}
                            className={`sparkle-option flex items-center gap-2 p-2.5 text-left text-xs sm:text-sm ${
                              isAns ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500' : ''
                            }`}
                          >
                            <span className="font-mono-tech inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#2563eb]/15 text-[10px] font-bold text-[#2563eb]">
                              {P1_KEYS[idx]}
                            </span>
                            <span>{ch}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* P2 Side */}
                  <div
                    className={`rounded-xl border-2 p-3.5 ${
                      p2RoundWrong
                        ? 'border-rose-500/40 bg-rose-500/5 opacity-60'
                        : roundSolvedBy === 2
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-[#f43f5e]/45 bg-[var(--bg)]'
                    }`}
                  >
                    <div className="mb-2 font-mono-tech text-[11px] font-semibold uppercase text-[#f43f5e]">
                      2-O‘yinchi (Qizil) · Tugmalar: 1 2 3 4
                    </div>
                    <div className="grid gap-2">
                      {shuffledBlitz[qIdx].choices.map((ch, idx) => {
                        const isAns = roundSolvedBy !== null && idx === shuffledBlitz[qIdx].answer;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={p2RoundWrong || roundSolvedBy !== null}
                            onClick={() => handlePvpBlitzAnswer(2, idx)}
                            className={`sparkle-option flex items-center gap-2 p-2.5 text-left text-xs sm:text-sm ${
                              isAns ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500' : ''
                            }`}
                          >
                            <span className="font-mono-tech inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#f43f5e]/15 text-[10px] font-bold text-[#f43f5e]">
                              {P2_KEYS[idx]}
                            </span>
                            <span>{ch}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ENGINE: CLASSIFY_SORT ==================== */}
            {game.engine === GameEngine.CLASSIFY_SORT && game.sort && shuffledSortItems.length > 0 && (
              <div className="space-y-4">
                <div className="font-mono-tech text-xs uppercase text-[var(--dim)]">
                  Element {sortIdx + 1} / {shuffledSortItems.length}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sortIdx}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.96 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-5 text-center text-base font-medium"
                  >
                    {shuffledSortItems[sortIdx].label}
                  </motion.div>
                </AnimatePresence>
                <div className="grid gap-3 sm:grid-cols-2">
                  {game.sort.categories.map((cat, idx) => (
                    <SparkleButton
                      key={cat}
                      variant="secondary"
                      size="md"
                      fullWidth
                      withParticles={false}
                      className="sparkle-between"
                      onClick={() => handleSortPick(idx as 0 | 1)}
                    >
                      <span>{cat}</span>
                      <motion.span
                        key={sortBinCounts[idx]}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="rounded-lg border border-current/25 px-2 py-0.5 text-[10px]"
                      >
                        {sortBinCounts[idx]}
                      </motion.span>
                    </SparkleButton>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== ENGINE: FORMULA_BUILDER ==================== */}
            {game.engine === GameEngine.FORMULA_BUILDER && game.formula && (
              <AnimatePresence mode="wait">
                <motion.form
                  key={fIdx}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  onSubmit={handleFormulaSubmit}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-4">
                    <div className="font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                      Jadval ma’lumoti ({fIdx + 1}/{game.formula.length}): {game.formula[fIdx].tableHint}
                    </div>
                    <div className="mt-1.5 text-base font-medium">{game.formula[fIdx].prompt}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['=', '(', ')', ':', ',', 'SUM(', 'AVERAGE(', 'IF(', 'MAX(', 'SUMIF(', 'COUNTIF(', '$'].map((tok) => (
                      <SparkleButton
                        key={tok}
                        variant="secondary"
                        size="xs"
                        withParticles={false}
                        onClick={() => setFormulaInput((v) => v + tok)}
                      >
                        {tok}
                      </SparkleButton>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formulaInput}
                      onChange={(e) => setFormulaInput(e.target.value)}
                      placeholder="Formulani yozing (= bilan boshlang)"
                      className="flex-1 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3.5 py-2.5 font-mono-tech text-sm text-[var(--ink)] outline-none focus:border-[#2563eb]"
                    />
                    <SparkleButton
                      type="submit"
                      variant="primary"
                      size="md"
                      showSparkle
                    >
                      Tekshirish
                    </SparkleButton>
                  </div>
                </motion.form>
              </AnimatePresence>
            )}

            {/* ==================== ENGINE: CIPHER_NET ==================== */}
            {game.engine === GameEngine.CIPHER_NET && shuffledCipher.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={fIdx}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-4">
                    <div className="font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                      Topshiriq {fIdx + 1} / {shuffledCipher.length} · {shuffledCipher[fIdx].detail}
                    </div>
                    <div className="mt-1.5 text-base font-medium">{shuffledCipher[fIdx].prompt}</div>
                  </div>

                  {shuffledCipher[fIdx].options ? (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {shuffledCipher[fIdx].options!.map((opt) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          key={opt}
                          type="button"
                          onClick={() => handleCipherAnswer(opt)}
                          className="sparkle-option px-4 py-3 text-left font-mono-tech text-xs"
                        >
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formulaInput}
                        onChange={(e) => setFormulaInput(e.target.value)}
                        className="flex-1 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3.5 py-2 font-mono-tech text-sm"
                      />
                      <SparkleButton
                        variant="primary"
                        size="sm"
                        showSparkle
                        onClick={() => handleCipherAnswer(formulaInput)}
                      >
                        Yuborish
                      </SparkleButton>
                    </div>
                  )}

                  <SparkleButton
                    variant="subtle"
                    size="xs"
                    withParticles={false}
                    onClick={() => setShowHint((h) => !h)}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{showHint ? shuffledCipher[fIdx].hint : 'Yordam ko‘rish'}</span>
                  </SparkleButton>
                </motion.div>
              </AnimatePresence>
            )}

            {/* ==================== ENGINE: MEMORY_PAIR ==================== */}
            {game.engine === GameEngine.MEMORY_PAIR && game.memory && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                    1-ustun: Termin / Uskuna
                  </div>
                  {shuffledLefts.map((m) => {
                    const done = matchedLefts.includes(m.origIdx);
                    const active = selLeft === m.origIdx;
                    return (
                      <motion.button
                        whileHover={!done ? { scale: 1.02 } : undefined}
                        whileTap={!done ? { scale: 0.97 } : undefined}
                        animate={done ? { scale: [1, 1.04, 1] } : undefined}
                        key={m.text}
                        type="button"
                        disabled={done}
                        onClick={() => setSelLeft(m.origIdx)}
                        className={`w-full px-3.5 py-2.5 text-left text-sm ${
                          done
                            ? 'sparkle-option border-emerald-500/40 bg-emerald-500/15 text-emerald-500 opacity-75'
                            : active
                            ? 'sparkle-option sparkle-option-active'
                            : 'sparkle-option'
                        }`}
                      >
                        {m.text}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <div className="font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                    2-ustun: Ta’rifni tanlang
                  </div>
                  {shuffledRights.map((r) => {
                    const done = matchedLefts.includes(r.origIdx);
                    return (
                      <motion.button
                        whileHover={!done ? { scale: 1.02 } : undefined}
                        whileTap={!done ? { scale: 0.97 } : undefined}
                        animate={done ? { scale: [1, 1.04, 1] } : undefined}
                        key={r.text}
                        type="button"
                        disabled={done}
                        onClick={() => handleRightMatch(r.origIdx)}
                        className={`w-full px-3.5 py-2.5 text-left text-sm ${
                          done
                            ? 'sparkle-option border-emerald-500/40 bg-emerald-500/15 text-emerald-500 opacity-75'
                            : 'sparkle-option'
                        }`}
                      >
                        {r.text}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================== SOLO-ONLY ENGINES (NO PvP) ==================== */}
            {game.engine === GameEngine.ROBOT_MAZE && game.maze && (
              <div className="grid gap-5 md:grid-cols-[auto_1fr]">
                <div>
                  <div className="mb-2 font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                    {game.maze.objective}
                  </div>
                  <div className="inline-grid grid-cols-5 gap-1 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-2">
                    {game.maze.grid.map((row, r) =>
                      row.map((cell, c) => {
                        const isBot = botPos.r === r && botPos.c === c;
                        const wasVisited = visitedCells.includes(`${r}-${c}`);
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`flex h-11 w-11 items-center justify-center rounded-lg font-mono-tech text-base transition-colors ${
                              cell === 1
                                ? 'bg-[#0f172a] text-white'
                                : cell === 3
                                ? 'bg-emerald-400 text-[#0f172a]'
                                : wasVisited
                                ? 'bg-[#38bdf8]/20'
                                : 'bg-[var(--surface)]'
                            }`}
                          >
                            {isBot ? (
                              <motion.span
                                layoutId="maze-bot-token"
                                animate={{ rotate: botPos.dir * 90, scale: [1, 1.08, 1] }}
                                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] font-bold text-white shadow-sm"
                              >
                                →
                              </motion.span>
                            ) : cell === 3 ? (
                              <motion.span
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 1.4, repeat: Infinity }}
                              >
                                ⚑
                              </motion.span>
                            ) : (
                              ''
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                    Buyruqlar qo‘shing ({commands.length} / {game.maze.maxSteps}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SparkleButton
                      variant="secondary"
                      size="xs"
                      withParticles={false}
                      disabled={runningMaze || commands.length >= game.maze.maxSteps}
                      onClick={() => setCommands((c) => [...c, 'FWD'])}
                    >
                      + Oldinga
                    </SparkleButton>
                    <SparkleButton
                      variant="secondary"
                      size="xs"
                      withParticles={false}
                      disabled={runningMaze || commands.length >= game.maze.maxSteps}
                      onClick={() => setCommands((c) => [...c, 'LEFT'])}
                    >
                      + Chapga 90°
                    </SparkleButton>
                    <SparkleButton
                      variant="secondary"
                      size="xs"
                      withParticles={false}
                      disabled={runningMaze || commands.length >= game.maze.maxSteps}
                      onClick={() => setCommands((c) => [...c, 'RIGHT'])}
                    >
                      + O‘ngga 90°
                    </SparkleButton>
                    <SparkleButton
                      variant="danger"
                      size="xs"
                      withParticles={false}
                      disabled={runningMaze || commands.length === 0}
                      onClick={() => setCommands((c) => c.slice(0, -1))}
                    >
                      O‘chirish
                    </SparkleButton>
                  </div>

                  <div className="flex min-h-[58px] flex-wrap items-center gap-1.5 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3 font-mono-tech text-xs">
                    {commands.length === 0 ? (
                      <span className="text-[var(--dim)]">Buyruqlar ro‘yxati bo‘sh...</span>
                    ) : (
                      commands.map((cmd, idx) => (
                        <motion.span
                          key={`${idx}-${cmd}`}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-lg border border-[var(--grid)] bg-[var(--surface)] px-2 py-0.5 text-[11px]"
                        >
                          {idx + 1}.{cmd === 'FWD' ? 'OLDINGA' : cmd === 'LEFT' ? 'CHAP' : 'O‘NG'}
                        </motion.span>
                      ))
                    )}
                  </div>

                  <SparkleButton
                    variant="primary"
                    size="md"
                    showSparkle
                    disabled={runningMaze || commands.length === 0}
                    onClick={runMaze}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Dasturni ishga tushirish</span>
                  </SparkleButton>
                </div>
              </div>
            )}

            {game.engine === GameEngine.HTML_CSS_LAB && game.codeLab && (
              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3.5 text-sm font-medium">
                  {game.codeLab[0].prompt}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <textarea
                    rows={6}
                    value={codeText}
                    onChange={(e) => setCodeText(e.target.value)}
                    className="w-full rounded-xl border border-[var(--grid)] bg-[#0f172a] p-3 font-mono-tech text-xs text-[#f8fafc] outline-none"
                  />
                  <div className="rounded-xl border border-[var(--grid)] bg-white p-3 text-sm text-[#0f172a]">
                    <div className="mb-1.5 font-mono-tech text-[10px] uppercase text-[#0f172a]/50">
                      Jonli ko‘rinish / Natija
                    </div>
                    <iframe
                      title="Code Preview"
                      sandbox=""
                      srcDoc={codeText}
                      className="h-28 w-full rounded-lg border border-[#0f172a]/10"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <SparkleButton
                    variant="subtle"
                    size="xs"
                    withParticles={false}
                    onClick={() => setShowHint((h) => !h)}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{showHint ? game.codeLab[0].hint : 'Yordam ko‘rish'}</span>
                  </SparkleButton>
                  <SparkleButton
                    variant="primary"
                    size="md"
                    showSparkle
                    onClick={handleCodeCheck}
                  >
                    Kodni tekshirish
                  </SparkleButton>
                </div>
              </div>
            )}

            {game.engine === GameEngine.DB_QUERY && game.db && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3.5 text-sm font-medium">
                  Jadval: <span className="font-mono-tech">{game.db[0].tableName}</span> — {game.db[0].prompt}
                </div>
                <div className="overflow-x-auto rounded-xl border border-[var(--grid)]">
                  <table className={`w-full text-left text-sm transition-opacity ${dbScanning ? 'opacity-65' : 'opacity-100'}`}>
                    <thead className="bg-[#0f172a] font-mono-tech text-xs uppercase text-[#f8fafc]">
                      <tr>
                        <th className="px-3 py-2">Tanlash</th>
                        {game.db[0].columns.map((col) => (
                          <th key={col} className="px-3 py-2">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {game.db[0].rows.map((row, rIdx) => {
                        const checked = selectedRows.includes(rIdx);
                        return (
                          <motion.tr
                            key={rIdx}
                            whileTap={{ scale: 0.99 }}
                            onClick={() =>
                              setSelectedRows((prev) =>
                                prev.includes(rIdx) ? prev.filter((x) => x !== rIdx) : [...prev, rIdx]
                              )
                            }
                            className={`cursor-pointer border-t border-[var(--grid)] transition-colors ${
                              checked ? 'bg-[#2563eb]/20' : 'bg-[var(--surface)] hover:bg-[var(--bg)]'
                            }`}
                          >
                            <td className="px-3 py-2 font-mono-tech text-xs">
                              {checked ? '[✓]' : '[ ]'}
                            </td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-2">
                                {cell}
                              </td>
                            ))}
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <SparkleButton
                  variant="primary"
                  size="md"
                  showSparkle
                  disabled={dbScanning}
                  onClick={handleDbSubmit}
                >
                  {dbScanning ? 'Query tekshirilmoqda...' : 'Query natijasini tekshirish'}
                </SparkleButton>
              </div>
            )}

            {game.engine === GameEngine.PIXEL_GRID && game.pixel && (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-2 font-mono-tech text-xs uppercase text-[var(--dim)]">
                    Namuna ({game.pixel.modeLabel}):
                  </div>
                  <div
                    className="inline-grid gap-1 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-2.5"
                    style={{ gridTemplateColumns: `repeat(${game.pixel.size}, minmax(0, 1fr))` }}
                  >
                    {game.pixel.target.map((v, i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 rounded-md border border-[#0f172a]/15 ${
                          v === 1 ? 'bg-[#0f172a]' : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-mono-tech text-xs uppercase text-[var(--dim)]">
                    Sizning rasmingiz (katakni bosing):
                  </div>
                  <div
                    className="inline-grid gap-1 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-2.5"
                    style={{ gridTemplateColumns: `repeat(${game.pixel.size}, minmax(0, 1fr))` }}
                  >
                    {userPixels.map((v, i) => (
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.85 }}
                        animate={{ scale: v === 1 ? [0.85, 1.12, 1] : 1 }}
                        transition={{ duration: 0.2 }}
                        key={i}
                        type="button"
                        onClick={() => handlePixelToggle(i)}
                        className={`h-8 w-8 rounded-md border border-[#0f172a]/20 transition-colors ${
                          v === 1 ? 'bg-[#2563eb] shadow-sm' : 'bg-white hover:bg-[#38bdf8]/40'
                        }`}
                        aria-label={`Piksel ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {game.engine === GameEngine.CHART_GANTT && game.chart && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3.5 text-sm font-medium">
                  {game.chart.title} — Maqsadli qiymatlar:{' '}
                  <span className="font-mono-tech">
                    {game.chart.labels
                      .map((l, i) => `${l}: ${game.chart!.targets[i]} ${game.chart!.unit}`)
                      .join(' · ')}
                  </span>
                </div>

                <div className="flex h-32 items-end gap-3 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-4">
                  {game.chart.labels.map((lbl, idx) => {
                    const matched = chartVals[idx] === game.chart!.targets[idx];
                    const targetH = Math.min(100, game.chart!.targets[idx] * 10);
                    return (
                      <div key={lbl} className="flex flex-1 flex-col items-center gap-1.5">
                        <div className="relative flex h-20 w-full items-end justify-center rounded-lg bg-[var(--surface)] px-1.5 pt-1">
                          <div
                            className="pointer-events-none absolute inset-x-1 border-t border-dashed border-[#0f172a]/35"
                            style={{ bottom: `${targetH}%` }}
                            title={`Maqsad: ${game.chart!.targets[idx]}`}
                          />
                          <motion.div
                            animate={{ height: `${Math.min(100, chartVals[idx] * 10)}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`w-full rounded-t-md ${
                              matched
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-t from-[#2563eb] to-[#38bdf8]'
                            }`}
                          />
                        </div>
                        <span className="truncate font-mono-tech text-[10px] text-[var(--dim)]">
                          {lbl}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {game.chart.labels.map((lbl, idx) => (
                    <div key={lbl} className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3.5">
                      <div className="flex items-center justify-between font-mono-tech text-xs">
                        <span>{lbl}</span>
                        <span>
                          {chartVals[idx]} {game.chart!.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={chartVals[idx]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setChartVals((prev) => prev.map((x, i) => (i === idx ? val : x)));
                        }}
                        className="mt-2 w-full accent-[#2563eb]"
                      />
                    </div>
                  ))}
                </div>
                <SparkleButton
                  variant="primary"
                  size="md"
                  showSparkle
                  onClick={handleChartCheck}
                >
                  Diagrammani tekshirish
                </SparkleButton>
              </div>
            )}

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3.5 py-2.5 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  <span>{feedback}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
