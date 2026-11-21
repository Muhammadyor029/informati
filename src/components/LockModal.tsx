import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { SparkleButton } from './SparkleButton';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  targetTitle?: string;
}

export const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  targetTitle,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Iltimos, ruxsat kodini kiriting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.unlockCurriculum(code);
      if (res.unlocked) {
        setCode('');
        onUnlockSuccess();
      } else {
        setError('Maxfiy kod noto‘g‘ri.');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Server bilan bog‘lanishda xatolik yuz berdi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--grid)] px-5 py-3.5">
          <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-wider text-[var(--dim)]">
            <Lock className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Mavzular Qulfi</span>
          </div>
          <SparkleButton
            variant="secondary"
            size="xs"
            withParticles={false}
            onClick={onClose}
            className="sparkle-icon-only"
            aria-label="Yopish"
          >
            <X className="h-3.5 w-3.5" />
          </SparkleButton>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <h3 id="lock-modal-title" className="text-lg font-medium tracking-tight">
            {targetTitle ? `“${targetTitle}” bo‘limini ochish` : 'Barcha mavzu va o‘yinlarni ochish'}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--dim)]">
            Ushbu o‘quv mavzulari, taqdimotlar, amaliy mashg‘ulotlar, testlar va o‘yinlar server tomondan himoyalangan. Davom etish uchun ruxsat kodini kiriting.
          </p>

          <div className="mt-4">
            <label
              htmlFor="unlock-code-input"
              className="font-mono-tech block text-[11px] uppercase tracking-wider text-[var(--dim)]"
            >
              Maxfiy kod
            </label>
            <input
              ref={inputRef}
              id="unlock-code-input"
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="Kodni kiriting..."
              autoComplete="off"
              disabled={submitting}
              className="mt-1.5 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3.5 py-2.5 font-mono-tech text-sm text-[var(--ink)] outline-none focus:border-[#2563eb]"
            />
            {error && (
              <p className="mt-2 font-mono-tech text-xs text-rose-500">{error}</p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <SparkleButton
              variant="secondary"
              size="sm"
              withParticles={false}
              onClick={onClose}
              disabled={submitting}
            >
              <span className="uppercase tracking-wider">Bekor qilish</span>
            </SparkleButton>
            <SparkleButton
              type="submit"
              variant="primary"
              size="sm"
              showSparkle
              withParticles
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c4b5fd]" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-[#c4b5fd]" />
              )}
              <span className="uppercase tracking-wider">
                {submitting ? 'Tekshirilmoqda...' : 'Qulfni ochish'}
              </span>
            </SparkleButton>
          </div>
        </form>
      </div>
    </div>
  );
};
