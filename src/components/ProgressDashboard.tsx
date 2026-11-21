import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Gamepad2,
  Loader2,
  LogIn,
  Wrench,
} from 'lucide-react';
import { api, ApiError, ApiGrade, ApiMyProgressResponse, ApiUser } from '../lib/api';
import { SparkleButton } from './SparkleButton';

interface ProgressDashboardProps {
  user: ApiUser | null;
  grades: ApiGrade[];
  localCompletedGames: Record<number, number>;
  totalGames?: number;
  onOpenAuth: () => void;
  onOpenTopicSlug: (slug: string, grade: number) => void;
  onOpenLessonSlug?: (slug: string, grade: number) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  user,
  grades,
  localCompletedGames,
  totalGames = 58,
  onOpenAuth,
  onOpenTopicSlug,
  onOpenLessonSlug,
}) => {
  const [data, setData] = useState<ApiMyProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    api
      .getMyProgress()
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : 'Natijalarni yuklashda xatolik.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    const topics = data?.topics || [];
    const completedLessons = topics.filter((t) => t.lesson_completed).length;
    const totalTestScore = topics.reduce((sum, t) => sum + t.best_test_score, 0);
    const totalTestMax = topics.reduce((sum, t) => sum + (t.tests_total || 5), 0);
    const totalPractices = topics.reduce((sum, t) => sum + (t.solved_practices?.length || 0), 0);

    const gameMap = data ? { ...localCompletedGames, ...data.game_scores } : localCompletedGames;
    const gamesPlayed = Object.keys(gameMap).length;
    const gamePoints = Object.values(gameMap).reduce((a, b) => a + Number(b || 0), 0);

    return {
      completedLessons,
      totalLessons: data?.total_lessons || 340,
      totalUnits: data?.total_units || 56,
      totalTestScore,
      totalTestMax,
      totalPractices,
      gamesPlayed,
      gamePoints,
    };
  }, [data, localCompletedGames]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
        <div>
          <div className="font-mono-tech text-[11px] uppercase tracking-wider text-[var(--accent)]">
            O‘QUVCHI MONITORINGI · SHAXSIY NATIJALAR
          </div>
          <h2 className="mt-1 text-2xl font-medium">
            {user
              ? `${user.first_name || user.username} (${user.grade_level}-sinf)`
              : 'O‘zlashtirish Ko‘rsatkichlari'}
          </h2>
          <p className="mt-1 text-sm text-[var(--dim)]">
            {stats.totalUnits} ta bo‘lim, {stats.totalLessons} ta dars, 10 talik bo‘lim va 5 talik dars testlari, amaliy topshiriqlar hamda {totalGames} ta interaktiv animatsiyali o‘yin bo‘yicha natijalar.
          </p>
        </div>

        {!user && (
          <SparkleButton
            variant="primary"
            size="md"
            showSparkle
            withParticles
            onClick={onOpenAuth}
          >
            <LogIn className="h-3.5 w-3.5 text-[#c4b5fd]" />
            <span className="uppercase">Saqlash uchun tizimga kiring</span>
          </SparkleButton>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase text-[var(--dim)]">
            <span>O‘zlashtirilgan darslar</span>
            <BookOpen className="h-4 w-4 text-[#2563eb]" />
          </div>
          <div className="font-mono-tech mt-2 text-2xl font-medium">
            {stats.completedLessons} / {stats.totalLessons}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase text-[var(--dim)]">
            <span>Test natijalari</span>
            <Award className="h-4 w-4 text-[#0284c7]" />
          </div>
          <div className="font-mono-tech mt-2 text-2xl font-medium">
            {stats.totalTestScore} / {stats.totalTestMax || 0}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase text-[var(--dim)]">
            <span>Amaliyotlar</span>
            <Wrench className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="font-mono-tech mt-2 text-2xl font-medium">
            {stats.totalPractices} ta yechilgan
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase text-[var(--dim)]">
            <span>O‘yinlar rekordi</span>
            <Gamepad2 className="h-4 w-4 text-[#38bdf8]" />
          </div>
          <div className="font-mono-tech mt-2 text-2xl font-medium">
            {stats.gamesPlayed} / {totalGames} · {stats.gamePoints} ball
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563eb]" />
          <span className="font-mono-tech text-xs uppercase text-[var(--dim)]">
            Natijalar yuklanmoqda...
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-500">
          {error}
        </div>
      )}

      {user && !loading && !error && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Grade Summary */}
          <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5 lg:col-span-4">
            <div className="flex items-center gap-2 font-mono-tech text-xs uppercase text-[var(--dim)]">
              <BarChart3 className="h-4 w-4 text-[#2563eb]" />
              <span>Sinflar kesimida faollik</span>
            </div>
            <div className="mt-4 space-y-3">
              {grades.map((g) => {
                const gradeAll = (data?.topics || []).filter((t) => t.grade_num === g.grade);
                const gradeLessons = gradeAll.filter((t) => Boolean(t.lesson_slug));
                const targetRecs = gradeLessons.length > 0 ? gradeLessons : gradeAll;
                const doneCount = targetRecs.filter(
                  (t) =>
                    t.lesson_completed ||
                    t.best_test_score > 0 ||
                    (t.solved_practices?.length || 0) > 0
                ).length;
                const total = Math.max(
                  1,
                  gradeLessons.length > 0 || gradeAll.length === 0
                    ? g.lesson_count || 34
                    : g.unit_count || 8
                );
                const pct = Math.min(100, Math.round((doneCount / total) * 100));
                return (
                  <div key={g.grade}>
                    <div className="flex justify-between font-mono-tech text-xs">
                      <span>{g.title}</span>
                      <span className="text-[var(--dim)]">
                        {doneCount}/{total} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
                      <div
                        className="h-full rounded-full bg-[#2563eb] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-topic table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)] lg:col-span-8">
            <div className="border-b border-[var(--grid)] px-5 py-3.5 font-mono-tech text-xs uppercase text-[var(--dim)]">
              Bo‘limlar bo‘yicha o‘zlashtirish tarixi
            </div>
            {data && data.topics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg)] font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                    <tr>
                      <th className="px-4 py-2.5">Sinf · Bo‘lim</th>
                      <th className="px-4 py-2.5">Taqdimot</th>
                      <th className="px-4 py-2.5">Dars</th>
                      <th className="px-4 py-2.5">Test</th>
                      <th className="px-4 py-2.5">Amaliyot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topics.map((tp) => (
                      <tr key={tp.id} className="border-t border-[var(--grid)]">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (tp.lesson_slug && onOpenLessonSlug) {
                                onOpenLessonSlug(tp.lesson_slug, tp.grade_num);
                              } else {
                                onOpenTopicSlug(tp.topic_slug, tp.grade_num);
                              }
                            }}
                            className="text-left font-medium hover:text-[#2563eb] hover:underline"
                          >
                            {tp.grade_num}-sinf · {tp.lesson_title || tp.topic_title}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-mono-tech text-xs">
                          {tp.presentation_viewed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-500">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Ko‘rilgan
                            </span>
                          ) : (
                            <span className="text-[var(--dim)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono-tech text-xs">
                          {tp.lesson_completed ? (
                            <span className="text-emerald-500">Tugatilgan</span>
                          ) : (
                            <span className="text-[var(--dim)]">Jarayonda</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono-tech text-xs font-medium">
                          {tp.best_test_score} / {tp.tests_total}
                        </td>
                        <td className="px-4 py-3 font-mono-tech text-xs">
                          {tp.solved_practices?.length || 0} / {tp.lesson_slug ? 3 : 6}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-[var(--dim)]">
                Hali saqlangan bo‘lim natijalari yo‘q. Sinflar bo‘limidan test yeching yoki taqdimotni ko‘ring.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
