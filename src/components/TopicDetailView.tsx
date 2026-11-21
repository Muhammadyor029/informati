import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Gamepad2,
  HelpCircle,
  Lightbulb,
  Loader2,
  Play,
  Presentation,
  RotateCcw,
  Sparkles,
  Target,
  Wrench,
  XCircle,
} from 'lucide-react';
import { GameDef } from '../data/types';
import {
  api,
  ApiError,
  ApiPublicTestQuestion,
  ApiTestResultItem,
  ApiTopicDetail,
  ApiUser,
} from '../lib/api';
import { MiniAnimation } from './MiniAnimation';
import { GameArena } from './GameArena';
import { PresentationSystem } from './PresentationSystem';
import { SparkleButton } from './SparkleButton';

interface TopicDetailViewProps {
  topicSlug: string;
  allGames: GameDef[];
  user: ApiUser | null;
  onBack: () => void;
  onOpenLessonSlug?: (slug: string) => void;
  completedGames: Record<number, number>;
  onGameComplete: (gameId: number, score: number) => void;
  onProgressUpdated?: () => void;
}

type SubTab = 'mavzu' | 'taqdimot' | 'animatsiya' | 'oyinlar' | 'testlar' | 'amaliyot';

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({
  topicSlug,
  allGames,
  user,
  onBack,
  onOpenLessonSlug,
  completedGames,
  onGameComplete,
  onProgressUpdated,
}) => {
  const [topic, setTopic] = useState<ApiTopicDetail | null>(null);
  const [tests, setTests] = useState<ApiPublicTestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<SubTab>('mavzu');
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  // 5-Question Test State (Server Graded)
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    score: number;
    total: number;
    results: ApiTestResultItem[];
  } | null>(null);

  // 5 Practice State
  const [practiceInputs, setPracticeInputs] = useState<Record<string, string>>({});
  const [practiceStatus, setPracticeStatus] = useState<Record<string, 'ok' | 'err'>>({});
  const [practiceBusy, setPracticeBusy] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [showSamples, setShowSamples] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setTab('mavzu');
    setTestAnswers({});
    setTestResult(null);
    setTestError(null);
    setPracticeInputs({});
    setPracticeStatus({});

    Promise.all([api.getTopicDetail(topicSlug), api.getTests(topicSlug)])
      .then(([detail, questions]) => {
        if (!active) return;
        setTopic(detail);
        setTests(questions);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : 'Bo‘lim ma’lumotlari yuklanmadi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [topicSlug]);

  // Sync saved progress for authenticated user
  useEffect(() => {
    if (!user) {
      setLessonCompleted(false);
      return;
    }
    api
      .getMyProgress()
      .then((res) => {
        const rec = res.topics.find((t) => !t.lesson_slug && t.topic_slug === topicSlug);
        if (rec) {
          setLessonCompleted(rec.lesson_completed);
          if (rec.solved_practices?.length) {
            const solvedMap: Record<string, 'ok'> = {};
            rec.solved_practices.forEach((code) => {
              solvedMap[code] = 'ok';
            });
            setPracticeStatus((prev) => ({ ...solvedMap, ...prev }));
          }
        } else {
          setLessonCompleted(false);
        }
      })
      .catch(() => {});
  }, [user, topicSlug]);

  const topicGames = useMemo(() => {
    if (!topic) return [];
    const byId = new Map(allGames.map((g) => [g.id, g]));
    const ids =
      topic.game_ids && topic.game_ids.length > 0
        ? topic.game_ids
        : allGames.filter((g) => g.topicId === topic.slug).map((g) => g.id);
    const list = ids.map((id) => byId.get(id)).filter((g): g is GameDef => Boolean(g));
    return list.sort((a, b) => (a.topicId === topic.slug ? -1 : b.topicId === topic.slug ? 1 : 0));
  }, [allGames, topic]);

  const handleMarkLessonComplete = async () => {
    if (!topic || !user) return;
    setMarkingComplete(true);
    try {
      const next = !lessonCompleted;
      await api.updateMyProgress({ topic_slug: topic.slug, lesson_completed: next });
      setLessonCompleted(next);
      onProgressUpdated?.();
    } catch {
      // Ignore silent failure
    } finally {
      setMarkingComplete(false);
    }
  };

  const handlePresentationViewed = useCallback(() => {
    if (!user || !topic) return;
    api
      .updateMyProgress({ topic_slug: topic.slug, presentation_viewed: true })
      .then(() => onProgressUpdated?.())
      .catch(() => {});
  }, [user, topic, onProgressUpdated]);

  const handleSubmitTests = async () => {
    if (!topic) return;
    setTestSubmitting(true);
    setTestError(null);
    try {
      const res = await api.submitTests(topic.slug, testAnswers);
      setTestResult({ score: res.score, total: res.total, results: res.results });
      onProgressUpdated?.();
    } catch (err) {
      setTestError(err instanceof ApiError ? err.message : 'Testni tekshirishda xatolik.');
    } finally {
      setTestSubmitting(false);
    }
  };

  const checkPractice = async (code: string) => {
    const val = (practiceInputs[code] || '').trim();
    if (!val) {
      setPracticeStatus((p) => ({ ...p, [code]: 'err' }));
      return;
    }
    setPracticeBusy((b) => ({ ...b, [code]: true }));
    try {
      const res = await api.checkPractice(code, val);
      setPracticeStatus((p) => ({ ...p, [code]: res.correct ? 'ok' : 'err' }));
      if (res.correct) {
        onProgressUpdated?.();
      }
    } catch {
      setPracticeStatus((p) => ({ ...p, [code]: 'err' }));
    } finally {
      setPracticeBusy((b) => ({ ...b, [code]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
        <p className="font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
          Bo‘lim tarkibi yuklanmoqda...
        </p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="space-y-4 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-6">
        <SparkleButton variant="secondary" size="sm" withParticles={false} onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="uppercase">Orqaga</span>
        </SparkleButton>
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-500">
          {error || 'Bo‘lim topilmadi.'}
        </div>
      </div>
    );
  }

  if (activeGame) {
    return (
      <GameArena
        key={activeGame.id}
        game={activeGame}
        onClose={() => setActiveGame(null)}
        onComplete={onGameComplete}
      />
    );
  }

  const solvedPracticesCount = Object.values(practiceStatus).filter((v) => v === 'ok').length;
  const resultByCode = new Map<string, ApiTestResultItem>(
    (testResult?.results || []).map((r) => [r.code, r])
  );

  const tabs: Array<{ id: SubTab; label: string; icon: React.ReactNode }> = [
    { id: 'mavzu', label: 'Mavzu va Darslar', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'taqdimot', label: 'Taqdimot (Slaydlar)', icon: <Presentation className="h-3.5 w-3.5" /> },
    { id: 'animatsiya', label: 'Kichik Animatsiya', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'oyinlar', label: `O‘yinlar (${topicGames.length})`, icon: <Gamepad2 className="h-3.5 w-3.5" /> },
    { id: 'testlar', label: `Test (${tests.length})`, icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
    { id: 'amaliyot', label: `Amaliyot (${topic.practices.length})`, icon: <Wrench className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)] text-[var(--ink)]">
      {/* Topic Banner Header */}
      <div className="border-b border-[var(--grid)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SparkleButton variant="secondary" size="sm" withParticles={false} onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">Sinflar ro‘yxatiga qaytish</span>
          </SparkleButton>

          <div className="flex flex-wrap items-center gap-3">
            <div className="font-mono-tech text-[11px] uppercase tracking-wider text-[var(--dim)]">
              {topic.grade_num}-SINF · {topic.term} · {topic.lesson_range} · {topic.total_hours} SOAT
            </div>
            {user && (
              <SparkleButton
                variant={lessonCompleted ? 'emerald' : 'secondary'}
                size="xs"
                showSparkle={lessonCompleted}
                withParticles={lessonCompleted}
                onClick={handleMarkLessonComplete}
                disabled={markingComplete}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="uppercase">
                  {lessonCompleted ? 'O‘zlashtirildi' : 'Tugatildi deb belgilash'}
                </span>
              </SparkleButton>
            )}
          </div>
        </div>

        <h2 className="mt-3 text-xl font-medium tracking-tight text-[var(--ink)] sm:text-2xl">
          {topic.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--dim)]">{topic.short_desc}</p>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-[var(--grid)] bg-[var(--bg)] px-4 py-3">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <SparkleButton
              key={t.id}
              variant={active ? 'active' : 'subtle'}
              size="sm"
              showSparkle={active}
              withParticles={false}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span className="uppercase tracking-wider">{t.label}</span>
            </SparkleButton>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6">
        {tab === 'mavzu' && (
          <div className="space-y-6">
            {/* Learning Objectives */}
            {topic.objectives.length > 0 && (
              <div className="rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4 sm:p-5">
                <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--accent)]">
                  <Target className="h-4 w-4" />
                  <span>O‘quv Maqsadlari</span>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {topic.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[var(--ink)]/90">
                      <span className="font-mono-tech mt-0.5 text-xs text-[var(--accent)]">
                        0{idx + 1}.
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clear Explanation */}
            <div className="space-y-3">
              <h3 className="font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                Batafsil Mavzu Tushuntirilishi
              </h3>
              {topic.detailed_explanation.map((para, idx) => (
                <p key={idx} className="text-[15px] leading-relaxed text-[var(--ink)]/90">
                  {para}
                </p>
              ))}
            </div>

            {/* Key Concepts */}
            {topic.key_concepts.length > 0 && (
              <div>
                <h3 className="mb-3 font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                  Asosiy Tushunchalar
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topic.key_concepts.map((kc) => (
                    <div
                      key={kc.id}
                      className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3.5"
                    >
                      <div className="font-mono-tech text-xs font-medium uppercase text-[var(--accent)]">
                        {kc.term}
                      </div>
                      <p className="mt-1 text-sm text-[var(--ink)]/85">{kc.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-World Examples */}
            {topic.real_world_examples.length > 0 && (
              <div className="rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4 sm:p-5">
                <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                  <Lightbulb className="h-4 w-4 text-[#0284c7]" />
                  <span>Amaliy va Hayotiy Misollar</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]/90">
                  {topic.real_world_examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--accent)]">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Curriculum Lesson Schedule */}
            <div>
              <h3 className="mb-3 font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                Yillik Ish Reja Bo‘yicha Darslar Jadvali (PDF)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-[var(--grid)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0f172a] font-mono-tech text-[11px] uppercase text-[#f8fafc]">
                    <tr>
                      <th className="px-3.5 py-2.5">Dars</th>
                      <th className="px-3.5 py-2.5">Mavzu nomi</th>
                      <th className="px-3.5 py-2.5">Soat</th>
                      <th className="px-3.5 py-2.5">Izoh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topic.lessons.map((row) => {
                      const rowWithSlug = row as typeof row & { slug?: string };
                      const inferredNum = Number((row.dars.match(/\d+/) || ['0'])[0]);
                      const lessonSlug =
                        rowWithSlug.slug ||
                        (inferredNum > 0
                          ? `g${topic.grade_num}-l${String(inferredNum).padStart(2, '0')}`
                          : '');
                      return (
                        <tr
                          key={row.id}
                          className="border-t border-[var(--grid)] bg-[var(--surface)] even:bg-[var(--bg)]"
                        >
                          <td className="whitespace-nowrap px-3.5 py-2.5 font-mono-tech text-xs font-medium">
                            {row.dars}
                          </td>
                          <td className="px-3.5 py-2.5">
                            {onOpenLessonSlug && lessonSlug ? (
                              <button
                                type="button"
                                onClick={() => onOpenLessonSlug(lessonSlug)}
                                className="text-left font-medium text-[var(--ink)] hover:text-[var(--accent)] hover:underline"
                              >
                                {row.title}
                              </button>
                            ) : (
                              row.title
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono-tech text-xs">{row.hours}</td>
                          <td className="px-3.5 py-2.5 text-xs text-[var(--dim)]">
                            <div className="flex items-center justify-between gap-2">
                              <span>{row.note}</span>
                              {onOpenLessonSlug && lessonSlug && (
                                <SparkleButton
                                  variant="secondary"
                                  size="xs"
                                  withParticles={false}
                                  onClick={() => onOpenLessonSlug(lessonSlug)}
                                >
                                  <span className="uppercase">Darsni ochish →</span>
                                </SparkleButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {topic.summary_text && (
              <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--dim)]">
                <strong className="text-[var(--ink)]">Xulosa:</strong> {topic.summary_text}
              </div>
            )}
          </div>
        )}

        {tab === 'taqdimot' && (
          <PresentationSystem
            topicSlug={topic.slug}
            animType={topic.anim_type}
            animTitle={topic.anim_title}
            animSubtitle={topic.anim_subtitle}
            onViewed={handlePresentationViewed}
          />
        )}

        {tab === 'animatsiya' && (
          <div className="space-y-4">
            <MiniAnimation
              type={topic.anim_type}
              title={topic.anim_title}
              subtitle={topic.anim_subtitle}
            />
            <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-4 text-sm text-[var(--dim)]">
              Ushbu kichik interaktiv animatsiya mavzuning asosiy mexanizmini vizual tarzda ko‘rsatadi.
              Pauza/Boshlash va 2x tezlik tugmalari yordamida jarayonni bosqichma-bosqich kuzating.
            </div>
          </div>
        )}

        {tab === 'oyinlar' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-[var(--dim)]">
                Ushbu bo‘lim uchun tanlangan mavzuga oid interaktiv o‘yinlar:
              </p>
              <span className="font-mono-tech text-xs uppercase text-[var(--dim)]">
                {allGames.length || 58} o‘yinlik katalogdan saralangan
              </span>
            </div>

            <div className="grid gap-3.5 md:grid-cols-2">
              {topicGames.map((g, i) => {
                const best = completedGames[g.id];
                return (
                  <div
                    key={g.id}
                    className="flex flex-col justify-between rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                        <span>
                          {i + 1}-O‘YIN · #{g.id} · {g.engine}
                        </span>
                        {best !== undefined && (
                          <span className="text-emerald-500">YETILDI ({best} BALL)</span>
                        )}
                      </div>
                      <h4 className="mt-1.5 text-base font-medium">{g.title}</h4>
                      <p className="mt-1 text-sm text-[var(--dim)]">{g.idea}</p>
                    </div>

                    <div className="mt-4">
                      <SparkleButton
                        variant="primary"
                        size="md"
                        fullWidth
                        showSparkle
                        withParticles
                        onClick={() => setActiveGame(g)}
                      >
                        <Play className="h-3.5 w-3.5 text-[#c4b5fd]" />
                        <span className="uppercase tracking-wider">O‘yinni boshlash</span>
                      </SparkleButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'testlar' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-4 py-3">
              <div className="text-sm font-medium">
                Mavzu bo‘yicha {tests.length} ta nazorat testi
              </div>
              <div className="font-mono-tech text-xs uppercase">
                {testResult
                  ? `Natija: ${testResult.score} / ${testResult.total} to‘g‘ri (${Math.round(
                      (testResult.score / Math.max(1, testResult.total)) * 100
                    )}%)`
                  : `Belgilandi: ${Object.keys(testAnswers).length} / ${tests.length}`}
              </div>
            </div>

            {tests.map((q, qIdx) => {
              const picked = testAnswers[q.code];
              const resItem = resultByCode.get(q.code);
              return (
                <div
                  key={q.code}
                  className="rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4 sm:p-5"
                >
                  <div className="font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                    {qIdx + 1}-SAVOL
                  </div>
                  <h4 className="mt-1 text-base font-medium">{q.question}</h4>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => {
                      const isSel = picked === oIdx;
                      const isRight = resItem ? resItem.correct_index === oIdx : false;
                      let styleCls = 'sparkle-option';
                      if (resItem) {
                        if (isRight) styleCls = 'sparkle-option border-emerald-500 bg-emerald-500/15 text-emerald-500';
                        else if (isSel && !isRight)
                          styleCls = 'sparkle-option border-rose-500 bg-rose-500/15 text-rose-500';
                      } else if (isSel) {
                        styleCls = 'sparkle-option sparkle-option-active';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={Boolean(testResult)}
                          onClick={() =>
                            setTestAnswers((prev) => ({ ...prev, [q.code]: oIdx }))
                          }
                          className={`px-4 py-2.5 text-left text-sm ${styleCls}`}
                        >
                          <span className="font-mono-tech mr-2 text-xs opacity-70">
                            {String.fromCharCode(65 + oIdx)})
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {resItem && (
                    <div className="mt-3 flex items-start gap-2 border-t border-[var(--grid)] pt-2.5 text-xs text-[var(--dim)]">
                      {resItem.is_correct ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <span>
                        <strong>Izoh:</strong> {resItem.explanation}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {testError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-500">
                {testError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {!testResult ? (
                <SparkleButton
                  variant="primary"
                  size="md"
                  showSparkle
                  withParticles
                  disabled={testSubmitting}
                  onClick={handleSubmitTests}
                >
                  {testSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c4b5fd]" />}
                  <span className="uppercase tracking-wider">
                    {testSubmitting ? 'Tekshirilmoqda...' : 'Test natijalarini tekshirish'}
                  </span>
                </SparkleButton>
              ) : (
                <SparkleButton
                  variant="secondary"
                  size="md"
                  showSparkle
                  withParticles
                  onClick={() => {
                    setTestAnswers({});
                    setTestResult(null);
                    setTestError(null);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="uppercase tracking-wider">Testni qayta yechish</span>
                </SparkleButton>
              )}
            </div>
          </div>
        )}

        {tab === 'amaliyot' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-4 py-3">
              <div className="text-sm font-medium">
                Mavzu bo‘yicha {topic.practices.length} ta amaliy topshiriq
              </div>
              <div className="font-mono-tech text-xs uppercase">
                Bajarildi: {solvedPracticesCount} / {topic.practices.length}
              </div>
            </div>

            {topic.practices.map((pr, idx) => {
              const st = practiceStatus[pr.code];
              const busy = Boolean(practiceBusy[pr.code]);
              return (
                <div
                  key={pr.code}
                  className="rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono-tech text-[11px] uppercase text-[var(--accent)]">
                      {idx + 1}-AMALIYOT · {pr.title}
                    </span>
                    {st === 'ok' && (
                      <span className="font-mono-tech text-xs text-emerald-500">
                        ✓ TO‘G‘RI BAJARILDI
                      </span>
                    )}
                    {st === 'err' && (
                      <span className="font-mono-tech text-xs text-rose-500">
                        QAYTA TEKSHIRING
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm text-[var(--ink)]/85">{pr.instruction}</p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={practiceInputs[pr.code] || ''}
                      onChange={(e) =>
                        setPracticeInputs((p) => ({ ...p, [pr.code]: e.target.value }))
                      }
                      placeholder={pr.placeholder}
                      className="flex-1 rounded-xl border border-[var(--grid)] bg-[var(--surface)] px-3.5 py-2 font-mono-tech text-xs text-[var(--ink)] outline-none focus:border-[#2563eb]"
                    />
                    <SparkleButton
                      variant="primary"
                      size="sm"
                      showSparkle
                      withParticles={false}
                      disabled={busy}
                      onClick={() => checkPractice(pr.code)}
                    >
                      <span className="uppercase">{busy ? 'Tekshirilmoqda...' : 'Tekshirish'}</span>
                    </SparkleButton>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <SparkleButton
                      variant="secondary"
                      size="xs"
                      withParticles={false}
                      onClick={() => setShowHints((h) => ({ ...h, [pr.code]: !h[pr.code] }))}
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>{showHints[pr.code] ? `Maslahat: ${pr.hint}` : 'Maslahat ko‘rish'}</span>
                    </SparkleButton>

                    <SparkleButton
                      variant="secondary"
                      size="xs"
                      withParticles={false}
                      onClick={() => setShowSamples((s) => ({ ...s, [pr.code]: !s[pr.code] }))}
                    >
                      <span>
                        {showSamples[pr.code]
                          ? `Namuna javob: ${pr.sample_answer}`
                          : 'Namuna javobni ko‘rish'}
                      </span>
                    </SparkleButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
