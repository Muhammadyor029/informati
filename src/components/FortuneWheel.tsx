import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dices, Lock, Play, RotateCw, Sparkles, Users, X } from 'lucide-react';
import { GameDef, GradeId, supportsPvpEngine } from '../data/types';
import { SparkleButton } from './SparkleButton';

interface FortuneWheelProps {
  games: GameDef[];
  isUnlocked: boolean;
  onSelectGame: (game: GameDef) => void;
}

const WHEEL_GRADES: GradeId[] = [5, 6, 7, 8, 9, 10, 11];

const SLICE_PALETTE = [
  { bg: '#f43f5e', text: '#ffffff' },
  { bg: '#38bdf8', text: '#0f172a' },
  { bg: '#a3e635', text: '#0f172a' },
  { bg: '#fbbf24', text: '#0f172a' },
  { bg: '#fb7185', text: '#0f172a' },
  { bg: '#2563eb', text: '#ffffff' },
  { bg: '#10b981', text: '#0f172a' },
  { bg: '#f59e0b', text: '#0f172a' },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildSlicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

function shortWheelLabel(title: string, id: number): string {
  const clean = title.split(':')[0].trim();
  if (clean.length <= 16) return clean;
  if (clean.length <= 19) return clean;
  return `${clean.slice(0, 15).trim()}… #${id}`;
}

function pickRandomWheelGames(pool: GameDef[], includeFeaturedId?: number): GameDef[] {
  if (pool.length === 0) return [];
  const count = Math.min(8, pool.length);
  const copy = [...pool];
  // Fisher-Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  const picked = copy.slice(0, count);
  if (
    includeFeaturedId !== undefined &&
    !picked.some((g) => g.id === includeFeaturedId)
  ) {
    const featured = pool.find((g) => g.id === includeFeaturedId);
    if (featured && picked.length > 0) {
      picked[0] = featured;
    }
  }
  return picked;
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  games,
  isUnlocked,
  onSelectGame,
}) => {
  const [wheelGrade, setWheelGrade] = useState<'all' | GradeId>('all');

  const poolGames = useMemo(
    () => (wheelGrade === 'all' ? games : games.filter((g) => g.grade === wheelGrade)),
    [games, wheelGrade]
  );

  const [slices, setSlices] = useState<GameDef[]>(() => pickRandomWheelGames(games, 59));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<GameDef | null>(null);
  const [autoOpenPending, setAutoOpenPending] = useState(false);
  const [tickPulse, setTickPulse] = useState(false);

  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const lastSliceBoundaryRef = useRef<number>(-1);

  const clearTimers = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Keep slices synchronized when active grade pool changes
  useEffect(() => {
    if (spinning) return;
    setSlices(pickRandomWheelGames(poolGames, wheelGrade === 'all' ? 59 : undefined));
    setWinner(null);
    setAutoOpenPending(false);
  }, [poolGames, wheelGrade]); // eslint-disable-line react-hooks/exhaustive-deps

  const sliceCount = Math.max(1, slices.length);
  const sliceDeg = 360 / sliceCount;

  const wheelPaths = useMemo(
    () =>
      slices.map((g, idx) => {
        const startDeg = idx * sliceDeg;
        const endDeg = (idx + 1) * sliceDeg;
        const midDeg = startDeg + sliceDeg / 2;
        const palette = SLICE_PALETTE[idx % SLICE_PALETTE.length];
        return {
          game: g,
          idx,
          startDeg,
          endDeg,
          midDeg,
          path: sliceCount === 1
            ? 'M 0 -196 A 196 196 0 1 1 -0.01 -196 Z'
            : buildSlicePath(0, 0, 196, startDeg, endDeg),
          palette,
          label: isUnlocked ? shortWheelLabel(g.title, g.id) : `O‘yin #${g.id}`,
        };
      }),
    [slices, sliceDeg, sliceCount, isUnlocked]
  );

  const handleSelectWheelGrade = (nextGrade: 'all' | GradeId) => {
    if (spinning) return;
    clearTimers();
    setWinner(null);
    setAutoOpenPending(false);
    setWheelGrade(nextGrade);
  };

  const handleShuffle = () => {
    if (spinning || poolGames.length === 0) return;
    clearTimers();
    setWinner(null);
    setAutoOpenPending(false);
    setSlices(pickRandomWheelGames(poolGames));
  };

  const handleCancelAutoOpen = () => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    setAutoOpenPending(false);
  };

  const handleSpin = () => {
    if (spinning || poolGames.length === 0) return;
    clearTimers();
    setWinner(null);
    setAutoOpenPending(false);

    // Every spin freshly draws up to 8 random games from the active grade pool
    const freshSlices = pickRandomWheelGames(poolGames);
    setSlices(freshSlices);

    const freshCount = Math.max(1, freshSlices.length);
    const freshSliceDeg = 360 / freshCount;
    const chosenIdx = Math.floor(Math.random() * freshCount);

    // Land comfortably inside [18%, 82%] of chosen slice under 0 deg right pointer
    const targetSvgAngle =
      chosenIdx * freshSliceDeg + (0.18 + Math.random() * 0.64) * freshSliceDeg;
    const desiredMod = ((360 - (targetSvgAngle % 360)) + 360) % 360;

    const startRot = rotationRef.current;
    const currentMod = ((startRot % 360) + 360) % 360;
    const deltaMod = ((desiredMod - currentMod) + 360) % 360;
    const extraTurns = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetRot = startRot + extraTurns + deltaMod;

    setSpinning(true);
    const duration = 3800;
    const startTime = performance.now();
    lastSliceBoundaryRef.current = Math.floor(startRot / freshSliceDeg);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic-quartic deceleration curve
      const eased = 1 - Math.pow(1 - t, 3.5);
      const nextRot = startRot + (targetRot - startRot) * eased;

      rotationRef.current = nextRot;
      setRotation(nextRot);

      const boundary = Math.floor(nextRot / freshSliceDeg);
      if (boundary !== lastSliceBoundaryRef.current) {
        lastSliceBoundaryRef.current = boundary;
        setTickPulse(true);
      } else {
        setTickPulse(false);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      rafRef.current = null;
      setSpinning(false);
      setTickPulse(false);

      // Compute final slice under 0 deg (3 o'clock pointer)
      const finalMod = ((nextRot % 360) + 360) % 360;
      const pointerAngle = (360 - finalMod) % 360;
      const landedIdx = Math.min(
        freshCount - 1,
        Math.floor(pointerAngle / freshSliceDeg)
      );
      const landedGame = freshSlices[landedIdx] || freshSlices[chosenIdx];
      setWinner(landedGame);
      setAutoOpenPending(true);

      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        setAutoOpenPending(false);
        onSelectGame(landedGame);
      }, 1150);
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm">
      <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
        {/* Left: Interactive Fortune Wheel matching reference design + site theme */}
        <div className="relative mx-auto flex items-center justify-center">
          <div className="relative h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]">
            {/* Outer subtle glow bezel */}
            <div className="pointer-events-none absolute inset-1 rounded-full border border-[var(--grid)] shadow-[0_12px_36px_-12px_rgba(37,99,235,0.28)]" />

            <svg
              viewBox="-222 -222 444 444"
              className="h-full w-full select-none overflow-visible"
              role="img"
              aria-label="Omad g‘ildiragi — tasodifiy o‘yin tanlash"
            >
              <defs>
                <filter id="wheelShadow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.22" />
                </filter>
                <filter id="pointerShadow" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Outer ring */}
              <circle
                cx="0"
                cy="0"
                r="204"
                fill="var(--bg)"
                stroke="var(--grid)"
                strokeWidth="3"
                filter="url(#wheelShadow)"
              />

              {/* Rotating Wheel Group */}
              <g transform={`rotate(${rotation})`}>
                {wheelPaths.map((s) => {
                  const isWinnerSlice = winner?.id === s.game.id && !spinning;
                  return (
                    <g key={`${s.game.id}-${s.idx}`}>
                      <path
                        d={s.path}
                        fill={s.palette.bg}
                        stroke={isWinnerSlice ? '#ffffff' : 'rgba(15, 23, 42, 0.18)'}
                        strokeWidth={isWinnerSlice ? 2.5 : 1}
                      />
                      <g transform={`rotate(${s.midDeg})`}>
                        <text
                          x="122"
                          y="0"
                          fill={s.palette.text}
                          fontSize="12.5"
                          fontWeight="600"
                          fontFamily="Inter, system-ui, sans-serif"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{ letterSpacing: '-0.01em' }}
                        >
                          {s.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Rim ticks */}
                {wheelPaths.map((s) => {
                  const pt = polarToCartesian(0, 0, 196, s.startDeg);
                  return (
                    <circle
                      key={`peg-${s.idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill="#ffffff"
                      stroke="rgba(15, 23, 42, 0.35)"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>

              {/* Center Hub Circle (white/surface matching reference) */}
              <circle
                cx="0"
                cy="0"
                r="42"
                fill="#ffffff"
                stroke="rgba(15, 23, 42, 0.14)"
                strokeWidth="3"
                filter="url(#pointerShadow)"
              />
              <circle cx="0" cy="0" r="34" fill="var(--surface)" stroke="var(--grid)" strokeWidth="1" />
              <text
                x="0"
                y="-5"
                textAnchor="middle"
                fill="var(--accent)"
                fontSize="10"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
                style={{ letterSpacing: '0.08em' }}
              >
                NOVA
              </text>
              <text
                x="0"
                y="9"
                textAnchor="middle"
                fill="var(--dim)"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                {slices.length} O‘YIN
              </text>

              {/* Fixed Right-Edge Pointer Arrow (3 o'clock = 0 deg, matching reference image) */}
              <g
                transform={`translate(186, 0) rotate(${tickPulse ? -12 : 0})`}
                filter="url(#pointerShadow)"
              >
                <polygon
                  points="-18,0 16,-14 11,0 16,14"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Controls, Spin Status & Winning Game Reveal */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-2.5 py-1 font-mono-tech text-[11px] uppercase tracking-wider text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Omad G‘ildiragi · Tasodifiy O‘yin
            </span>
            <span className="font-mono-tech text-[11px] uppercase text-[var(--dim)]">
              {wheelGrade === 'all' ? 'Barcha sinflar' : `${wheelGrade}-sinf`} · {poolGames.length} ta o‘yin
            </span>
          </div>

          <div>
            <h3 className="text-xl font-medium tracking-tight text-[var(--ink)] sm:text-2xl">
              G‘ildirakni aylantiring va tasodifiy o‘yinga kiring!
            </h3>
            <p className="mt-1.5 text-sm text-[var(--dim)]">
              Sinfni tanlang — har bir aylantirishda{' '}
              {wheelGrade === 'all' ? 'barcha sinflardan' : `${wheelGrade}-sinf o‘yinlaridan`}{' '}
              {Math.min(8, poolGames.length)} ta o‘yin g‘ildirakka tushadi va tanlangan o‘yin avtomatik ochiladi.
            </p>
          </div>

          {/* Per-grade selector inside Fortune Wheel */}
          <div className="space-y-2">
            <div className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--dim)]">
              Sinf bo‘yicha o‘yin topish:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <SparkleButton
                variant={wheelGrade === 'all' ? 'active' : 'secondary'}
                size="xs"
                withParticles={false}
                disabled={spinning}
                onClick={() => handleSelectWheelGrade('all')}
              >
                <span>Barchasi ({games.length})</span>
              </SparkleButton>
              {WHEEL_GRADES.map((g) => {
                const count = games.filter((item) => item.grade === g).length;
                if (count === 0) return null;
                return (
                  <SparkleButton
                    key={g}
                    variant={wheelGrade === g ? 'active' : 'secondary'}
                    size="xs"
                    withParticles={false}
                    disabled={spinning}
                    onClick={() => handleSelectWheelGrade(g)}
                  >
                    <span>
                      {g}-sinf ({count})
                    </span>
                  </SparkleButton>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SparkleButton
              variant="primary"
              size="md"
              showSparkle
              withParticles={!spinning}
              disabled={spinning || poolGames.length === 0}
              onClick={handleSpin}
            >
              <RotateCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
              <span>{spinning ? 'Aylanmoqda...' : 'Aylantirish'}</span>
            </SparkleButton>

            <SparkleButton
              variant="secondary"
              size="md"
              withParticles={false}
              disabled={spinning || poolGames.length === 0}
              onClick={handleShuffle}
            >
              <Dices className="h-4 w-4" />
              <span>Aralashtirish</span>
            </SparkleButton>
          </div>

          <AnimatePresence mode="wait">
            {winner ? (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-[var(--accent)]/40 bg-[var(--bg)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-tech text-[11px] uppercase tracking-wider text-emerald-500">
                    G‘OLIB O‘YIN TANLANDI · #{winner.id} · {winner.grade}-SINF
                  </span>
                  {supportsPvpEngine(winner.engine) && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#2563eb]/15 px-2 py-0.5 font-mono-tech text-[10px] font-semibold uppercase text-[#2563eb]">
                      <Users className="h-3 w-3" />
                      2 Kishi PvP mavjud
                    </span>
                  )}
                </div>

                <div className="mt-1.5 text-base font-medium text-[var(--ink)]">
                  {isUnlocked ? winner.title : `O‘yin #${winner.id} (${winner.grade}-sinf)`}
                </div>
                <p className="mt-1 text-xs text-[var(--dim)]">
                  {isUnlocked
                    ? winner.idea
                    : 'O‘yinni ochish uchun maxfiy kirish kodini tasdiqlang.'}
                </p>

                {autoOpenPending && (
                  <div className="mt-3 space-y-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--grid)]">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.1, ease: 'linear' }}
                        className="h-full bg-[var(--accent)]"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <SparkleButton
                        variant="emerald"
                        size="sm"
                        withParticles={false}
                        onClick={() => {
                          handleCancelAutoOpen();
                          onSelectGame(winner);
                        }}
                      >
                        {isUnlocked ? <Play className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        <span>Hozir ochish</span>
                      </SparkleButton>
                      <SparkleButton
                        variant="subtle"
                        size="xs"
                        withParticles={false}
                        onClick={handleCancelAutoOpen}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Bekor qilish</span>
                      </SparkleButton>
                    </div>
                  </div>
                )}

                {!autoOpenPending && (
                  <div className="mt-3">
                    <SparkleButton
                      variant="primary"
                      size="sm"
                      showSparkle
                      onClick={() => onSelectGame(winner)}
                    >
                      {isUnlocked ? <Play className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      <span>O‘yinni ochish</span>
                    </SparkleButton>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="slices-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3.5"
              >
                <div className="mb-2 font-mono-tech text-[10px] uppercase tracking-wider text-[var(--dim)]">
                  G‘ildirakdagi joriy {slices.length} ta o‘yin:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {slices.map((g, idx) => (
                    <span
                      key={`${g.id}-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--grid)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--ink)]"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: SLICE_PALETTE[idx % SLICE_PALETTE.length].bg }}
                      />
                      <span className="truncate max-w-[140px]">
                        {isUnlocked ? g.title.split(':')[0] : `O‘yin #${g.id}`}
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
