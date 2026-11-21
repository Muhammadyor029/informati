import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  Presentation,
  StickyNote,
} from 'lucide-react';
import { MiniAnimType } from '../data/types';
import { api, ApiError, ApiPresentation } from '../lib/api';
import { MiniAnimation } from './MiniAnimation';
import { SparkleButton } from './SparkleButton';

interface PresentationSystemProps {
  topicSlug: string;
  animType: MiniAnimType;
  animTitle: string;
  animSubtitle: string;
  onViewed?: () => void;
}

export const PresentationSystem: React.FC<PresentationSystemProps> = ({
  topicSlug,
  animType,
  animTitle,
  animSubtitle,
  onViewed,
}) => {
  const [presentation, setPresentation] = useState<ApiPresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const viewedNotifiedRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setIndex(0);
    viewedNotifiedRef.current = false;

    api
      .getPresentation(topicSlug)
      .then((data) => {
        if (!active) return;
        setPresentation(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : 'Taqdimot yuklanmadi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [topicSlug]);

  const slides = presentation?.slides || [];
  const current = slides[index];

  useEffect(() => {
    if (slides.length > 0 && index === slides.length - 1 && !viewedNotifiedRef.current) {
      viewedNotifiedRef.current = true;
      onViewed?.();
    }
  }, [index, slides.length, onViewed]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(Math.max(0, slides.length - 1), i + 1));
  }, [slides.length]);

  const toggleFullscreen = useCallback(async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen denial in restricted iframes
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, toggleFullscreen]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
        <p className="font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
          Taqdimot slaydlari yuklanmoqda...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-500">
        {error}
      </div>
    );
  }

  if (!presentation || slides.length === 0 || !current) {
    return (
      <div className="rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-8 text-center">
        <Presentation className="mx-auto h-7 w-7 text-[var(--dim)]" />
        <p className="mt-2 text-sm text-[var(--dim)]">
          Ushbu mavzu uchun hali slaydlar qo‘shilmagan.
        </p>
      </div>
    );
  }

  const progressPct = Math.round(((index + 1) / slides.length) * 100);

  return (
    <div ref={stageRef} className={`space-y-4 ${isFullscreen ? 'bg-[var(--bg)] p-6 sm:p-10' : ''}`}>
      {/* Slide Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono-tech text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
            Slayd {index + 1} / {slides.length}
          </span>
          <span className="hidden font-mono-tech text-[11px] uppercase text-[var(--dim)] sm:inline">
            · {current.layout}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SparkleButton
            variant={showNotes ? 'active' : 'secondary'}
            size="xs"
            withParticles={false}
            onClick={() => setShowNotes((v) => !v)}
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span className="hidden uppercase sm:inline">Izoh</span>
          </SparkleButton>
          <SparkleButton
            variant="secondary"
            size="xs"
            withParticles={false}
            onClick={toggleFullscreen}
            title="To‘liq ekran (F)"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span className="hidden uppercase sm:inline">
              {isFullscreen ? 'Chiqish' : 'To‘liq ekran'}
            </span>
          </SparkleButton>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-alt)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#2563eb] to-[#059669] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Visual Slide Canvas */}
      <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-6 sm:p-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-tech text-[11px] uppercase tracking-widest text-[var(--accent)]">
              NOVA TAQDIMOT · {presentation.title}
            </span>
            <span className="font-mono-tech text-[11px] text-[var(--dim)]">
              ← / → tugmalari bilan boshqaring
            </span>
          </div>

          <h3 className="mt-3 text-2xl font-medium tracking-tight text-[var(--ink)] sm:text-3xl">
            {current.title}
          </h3>
          {current.subtitle && (
            <p className="mt-1.5 text-sm text-[var(--dim)] sm:text-base">{current.subtitle}</p>
          )}
        </div>

        {/* Slide Body by Layout */}
        <div className="my-6 grid gap-5 lg:grid-cols-12 lg:items-center">
          <div
            className={
              current.image_asset || current.layout === 'diagram'
                ? 'lg:col-span-6'
                : 'lg:col-span-12'
            }
          >
            {current.bullet_points.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {current.bullet_points.map((bp, bIdx) => (
                  <li
                    key={bIdx}
                    className="flex items-start gap-3 rounded-xl border border-[var(--grid)] bg-[var(--surface)] px-4 py-3 text-sm leading-relaxed"
                  >
                    <span className="font-mono-tech mt-0.5 text-xs font-medium text-[var(--accent)]">
                      0{bIdx + 1}
                    </span>
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {current.image_asset ? (
            <div className="overflow-hidden rounded-xl border border-[var(--grid)] bg-[var(--surface)] p-2 lg:col-span-6">
              <img
                src={current.image_asset.url}
                alt={current.image_asset.title || current.title}
                className="max-h-[340px] w-full rounded-lg object-contain"
              />
              <div className="mt-2 flex items-center justify-between px-1 font-mono-tech text-[10px] uppercase text-[var(--dim)]">
                <span>{current.image_asset.title}</span>
                {current.image_asset.width && current.image_asset.height && (
                  <span>
                    {current.image_asset.width}×{current.image_asset.height}px
                  </span>
                )}
              </div>
            </div>
          ) : current.layout === 'diagram' ? (
            <div className="lg:col-span-6">
              <MiniAnimation type={animType} title={animTitle} subtitle={animSubtitle} />
            </div>
          ) : null}
        </div>

        {/* Slide Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--grid)] pt-4">
          <SparkleButton
            variant="secondary"
            size="sm"
            withParticles={false}
            onClick={goPrev}
            disabled={index === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="uppercase tracking-wider">Oldingi</span>
          </SparkleButton>

          <div className="flex items-center gap-1.5">
            {slides.map((s, sIdx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(sIdx)}
                aria-label={`${sIdx + 1}-slayd`}
                className={`h-2.5 rounded-full transition-all ${
                  sIdx === index
                    ? 'w-7 bg-[#6366f1]'
                    : 'w-2.5 bg-[var(--grid)] hover:bg-[var(--dim)]'
                }`}
              />
            ))}
          </div>

          <SparkleButton
            variant="primary"
            size="sm"
            showSparkle
            withParticles
            onClick={goNext}
            disabled={index === slides.length - 1}
          >
            <span className="uppercase tracking-wider">Keyingi</span>
            <ChevronRight className="h-4 w-4 text-[#c4b5fd]" />
          </SparkleButton>
        </div>
      </div>

      {showNotes && current.speaker_notes && (
        <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-4 py-3 text-xs leading-relaxed text-[var(--dim)]">
          <span className="font-mono-tech mr-2 uppercase text-[var(--accent)]">O‘qituvchi eslatmasi:</span>
          {current.speaker_notes}
        </div>
      )}
    </div>
  );
};
