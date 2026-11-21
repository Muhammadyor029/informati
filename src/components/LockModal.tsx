import React, { useEffect, useRef, useState } from 'react';
import { Bell, Clock, Loader2, Lock, LogIn, ShieldCheck, X } from 'lucide-react';
import { api, ApiError, PermissionStatus } from '../lib/api';
import { SparkleButton } from './SparkleButton';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  targetTitle?: string;
  topicSlug?: string | null;
  permissionStatus?: PermissionStatus | null;
  isLoggedIn?: boolean;
  requesting?: boolean;
  permissionError?: string | null;
  onRequestPermission?: (topicSlug: string) => void;
  onRequireLogin?: () => void;
}

export const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  targetTitle,
  topicSlug,
  permissionStatus,
  isLoggedIn = false,
  requesting = false,
  permissionError,
  onRequestPermission,
  onRequireLogin,
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
            Ushbu o‘quv mavzulari, taqdimotlar, amaliy mashg‘ulotlar, testlar va o‘yinlar server tomondan himoyalangan. Davom etish uchun domladan ruxsat so‘rang yoki ruxsat kodini kiriting.
          </p>

          {topicSlug && (
            <div className="mt-4 rounded-xl border border-[#2563eb]/30 bg-[#2563eb]/5 p-3.5">
              <div className="flex items-start gap-2.5">
                {permissionStatus === 'pending' ? (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb]" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {permissionStatus === 'pending'
                      ? 'Ruxsat so‘rovi yuborildi'
                      : 'Domladan ruxsat so‘rang'}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--dim)]">
                    {permissionStatus === 'pending'
                      ? 'Ustoz panelida so‘rovingiz ko‘rinadi. Tasdiqlangach faqat shu mavzu ochiladi.'
                      : 'So‘rov ustozga bildirishnoma sifatida tushadi va faqat shu mavzuga ruxsat beriladi.'}
                  </p>
                </div>
              </div>
              {permissionStatus !== 'pending' && (
                <SparkleButton
                  type="button"
                  variant="primary"
                  size="sm"
                  fullWidth
                  showSparkle={!requesting}
                  withParticles={false}
                  disabled={requesting}
                  onClick={() => {
                    if (!isLoggedIn) onRequireLogin?.();
                    else if (onRequestPermission) onRequestPermission(topicSlug);
                  }}
                  className="mt-3"
                >
                  {requesting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : !isLoggedIn ? (
                    <LogIn className="h-3.5 w-3.5" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  <span className="uppercase tracking-wider">
                    {requesting
                      ? 'Yuborilmoqda...'
                      : !isLoggedIn
                      ? 'Avval ro‘yxatdan o‘tish'
                      : 'Ruxsat so‘rash'}
                  </span>
                </SparkleButton>
              )}
              {permissionError && (
                <p className="mt-2 font-mono-tech text-xs text-rose-500">{permissionError}</p>
              )}
            </div>
          )}

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
