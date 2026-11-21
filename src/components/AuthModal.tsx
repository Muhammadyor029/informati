import React, { useEffect, useState } from 'react';
import { Loader2, LogIn, UserPlus, X } from 'lucide-react';
import { api, ApiError, ApiUser } from '../lib/api';
import { SparkleButton } from './SparkleButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: ApiUser) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login({ username: username.trim(), password });
        onAuthSuccess(res.user);
      } else {
        const res = await api.register({
          username: username.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          grade_level: gradeLevel,
        });
        onAuthSuccess(res.user);
      }
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--grid)] px-5 py-3.5">
          <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-wider text-[var(--dim)]">
            {mode === 'login' ? (
              <LogIn className="h-3.5 w-3.5 text-[var(--accent)]" />
            ) : (
              <UserPlus className="h-3.5 w-3.5 text-[var(--accent)]" />
            )}
            <span>{mode === 'login' ? 'Hisobga kirish' : 'Ro‘yxatdan o‘tish'}</span>
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

        <div className="flex gap-2 border-b border-[var(--grid)] bg-[var(--bg)] p-2">
          <SparkleButton
            variant={mode === 'login' ? 'active' : 'secondary'}
            size="sm"
            fullWidth
            showSparkle={mode === 'login'}
            withParticles={false}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            <span className="uppercase">Kirish</span>
          </SparkleButton>
          <SparkleButton
            variant={mode === 'register' ? 'active' : 'secondary'}
            size="sm"
            fullWidth
            showSparkle={mode === 'register'}
            withParticles={false}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            <span className="uppercase">Yangi o‘quvchi</span>
          </SparkleButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 p-5 sm:p-6">
          <h3 id="auth-modal-title" className="text-lg font-medium tracking-tight">
            {mode === 'login'
              ? 'Natijalarni saqlash uchun tizimga kiring'
              : 'O‘quvchi profilini yarating'}
          </h3>

          <div>
            <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
              Foydalanuvchi nomi (login)
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="masalan: ali_7sinf"
              className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3.5 py-2 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Ism
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ali"
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
                />
              </div>
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Sinf
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
                >
                  {[5, 6, 7, 8, 9, 10, 11].map((g) => (
                    <option key={g} value={g}>
                      {g}-sinf
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Familiya (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Valiyev"
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
              Parol
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi"
              className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3.5 py-2 text-sm outline-none focus:border-[#2563eb]"
            />
          </div>

          {error && <p className="font-mono-tech text-xs text-rose-500">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <SparkleButton
              variant="secondary"
              size="sm"
              withParticles={false}
              onClick={onClose}
            >
              <span className="uppercase">Bekor qilish</span>
            </SparkleButton>
            <SparkleButton
              type="submit"
              variant="primary"
              size="sm"
              showSparkle
              withParticles
              disabled={loading}
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c4b5fd]" />}
              <span className="uppercase">{mode === 'login' ? 'Kirish' : 'Hisob ochish'}</span>
            </SparkleButton>
          </div>
        </form>
      </div>
    </div>
  );
};
