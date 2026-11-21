import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export const LoadingOverlay: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setVisible(false);
      return;
    }

    const start = performance.now();
    const duration = 320;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setVisible(false), 90);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nova-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)]"
        >
          {/* Thin architectural guides */}
          <div className="pointer-events-none absolute inset-y-0 left-[17%] hidden w-px bg-[var(--grid-faint)] md:block" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-[var(--grid-faint)] md:block" />
          <div className="pointer-events-none absolute inset-y-0 left-[83%] hidden w-px bg-[var(--grid-faint)] md:block" />

          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative flex flex-col items-center gap-5"
          >
            {/* Animated Cobalt/Cyan Robot Emblem */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-3xl p-[3px]"
                style={{
                  background:
                    'conic-gradient(from 200deg, #1d4ed8, #2563eb 24%, #0284c7 48%, #38bdf8 66%, #059669 84%, #1d4ed8)',
                }}
              >
                <div className="h-full w-full rounded-[21px] bg-[var(--bg)]" />
              </motion.div>

              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f172a]">
                <motion.div
                  animate={{ scaleY: [1, 1, 0.14, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, times: [0, 0.82, 0.9, 1] }}
                  className="flex items-center gap-2.5"
                >
                  <span className="h-4 w-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.85)]" />
                  <span className="h-4 w-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.85)]" />
                </motion.div>
              </div>
            </div>

            {/* Label & Progress Bar */}
            <div className="w-60 space-y-2 text-center">
              <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase tracking-widest text-[var(--dim)]">
                <span>NOVA INFORMATIKA</span>
                <span className="text-[#2563eb] dark:text-[#38bdf8]">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--grid)]">
                <div
                  className="h-full rounded-full transition-[width] duration-75"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #1d4ed8, #0284c7, #38bdf8)',
                  }}
                />
              </div>
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[var(--dim)]">
                3D TIZIM VA O‘YINLAR YUKLANMOQDA...
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
