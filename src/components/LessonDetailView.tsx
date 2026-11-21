import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
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
  ApiLessonDetail,
  ApiPublicTestQuestion,
  ApiTestResultItem,
  ApiUser,
  LessonType,
} from '../lib/api';
import { MiniAnimation } from './MiniAnimation';
import { GameArena } from './GameArena';
import { PresentationSystem } from './PresentationSystem';
import { SparkleButton } from './SparkleButton';

interface LessonDetailViewProps {
  lessonSlug: string;
  allGames: GameDef[];
  user: ApiUser | null;
  onBack: () => void;
  onSelectLesson: (slug: string) => void;
  onOpenTopicSlug?: (slug: string) => void;
  completedGames: Record<number, number>;
  onGameComplete: (gameId: number, score: number) => void;
  onProgressUpdated?: () => void;
}

type LessonTab = 'dars' | 'taqdimot' | 'testlar' | 'amaliyot' | 'oyinlar';

const LESSON_TYPE_LABELS: Record<LessonType, { label: string; cls: string }> = {
  regular: { label: 'Asosiy dars', cls: 'border-[var(--grid)] text-[var(--dim)]' },
  practical: { label: 'Amaliy mashg‘ulot', cls: 'border-sky-500/40 bg-sky-500/10 text-sky-500' },
  project: { label: 'Loyiha ishi', cls: 'border-amber-500/40 bg-amber-500/10 text-amber-500' },
  assessment: { label: 'Nazorat ishi', cls: 'border-[#2563eb]/50 bg-[#2563eb]/15 text-[var(--accent)]' },
  revision: { label: 'Takrorlash', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500' },
};

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({
  lessonSlug,
  allGames,
  user,
  onBack,
  onSelectLesson,
  onOpenTopicSlug,
  completedGames,
  onGameComplete,
  onProgressUpdated,
}) => {
  const [lesson, setLesson] = useState<ApiLessonDetail | null>(null);
  const [tests, setTests] = useState<ApiPublicTestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<LessonTab>('dars');
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    score: number;
    total: number;
    results: ApiTestResultItem[];
  } | null>(null);

  const [practiceInputs, setPracticeInputs] = useState<Record<string, string>>({});
  const [practiceStatus, setPracticeStatus] = useState<Record<string, 'ok' | 'err'>>({});
  const [practiceBusy, setPracticeBusy] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [showSamples, setShowSamples] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setTab('dars');
    setActiveGame(null);
    setTestAnswers({});
    setTestResult(null);
    setTestError(null);
    setPracticeInputs({});
    setPracticeStatus({});

    Promise.all([api.getLessonDetail(lessonSlug), api.getTests(lessonSlug, 'lesson')])
      .then(([detail, questions]) => {
        if (!active) return;
        setLesson(detail);
        setTests(questions);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : 'Dars ma’lumotlari yuklanmadi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lessonSlug]);

  useEffect(() => {
    if (!user) {
      setLessonCompleted(false);
      return;
    }
    api
      .getMyProgress()
      .then((res) => {
        const rec = res.topics.find((t) => t.lesson_slug === lessonSlug);
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
  }, [user, lessonSlug]);

  const lessonGames = useMemo(() => {
    if (!lesson) return [];
    const byId = new Map(allGames.map((g) => [g.id, g]));
    const ids =
      lesson.game_ids && lesson.game_ids.length > 0
        ? lesson.game_ids
        : allGames.filter((g) => g.topicId === lesson.topic_slug).map((g) => g.id);
    const list = ids.map((id) => byId.get(id)).filter((g): g is GameDef => Boolean(g));
    return list.sort((a, b) => (a.topicId === lesson.topic_slug ? -1 : b.topicId === lesson.topic_slug ? 1 : 0));
  }, [allGames, lesson]);

  const handleMarkLessonComplete = async () => {
    if (!lesson || !user) return;
    setMarkingComplete(true);
    try {
      const next = !lessonCompleted;
      await api.updateMyProgress({ lesson_slug: lesson.slug, lesson_completed: next });
      setLessonCompleted(next);
      onProgressUpdated?.();
    } catch {
      // Ignore silent failure
    } finally {
      setMarkingComplete(false);
    }
  };

  const handlePresentationViewed = useCallback(() => {
    if (!user || !lesson) return;
    api
      .updateMyProgress({ lesson_slug: lesson.slug, presentation_viewed: true })
      .then(() => onProgressUpdated?.())
      .catch(() => {});
  }, [user, lesson, onProgressUpdated]);

  const handleSubmitTests = async () => {
    if (!lesson) return;
    setTestSubmitting(true);
    setTestError(null);
    try {
      const res = await api.submitTests({ lesson_slug: lesson.slug }, testAnswers);
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
          Dars sahifasi yuklanmoqda...
        </p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-4 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-6">
        <SparkleButton variant="secondary" size="sm" withParticles={false} onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="uppercase">Darslar ro‘yxatiga qaytish</span>
        </SparkleButton>
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-500">
          {error || 'Dars topilmadi.'}
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

  const typeMeta = LESSON_TYPE_LABELS[lesson.lesson_type] || LESSON_TYPE_LABELS.regular;
  const diagramNodes = lesson.content?.visual_diagram?.nodes || [];
  const resultByCode = new Map<string, ApiTestResultItem>(
    (testResult?.results || []).map((r) => [r.code, r])
  );

  const solvedPracticesCount = Object.values(practiceStatus).filter((v) => v === 'ok').length;
  const tabs: Array<{ id: LessonTab; label: string; icon: React.ReactNode }> = [
    { id: 'dars', label: 'Dars va Diagramma', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'taqdimot', label: 'Taqdimot (Slaydlar)', icon: <Presentation className="h-3.5 w-3.5" /> },
    { id: 'testlar', label: `Test (${tests.length})`, icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
    { id: 'amaliyot', label: `Amaliyot (${lesson.practices.length})`, icon: <Wrench className="h-3.5 w-3.5" /> },
    { id: 'oyinlar', label: `O‘yinlar (${lessonGames.length})`, icon: <Gamepad2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)] text-[var(--ink)]">
      {/* Header & Sequential Lesson Navigation */}
      <div className="border-b border-[var(--grid)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <SparkleButton variant="secondary" size="sm" withParticles={false} onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">{lesson.grade_num}-sinf darslari</span>
          </SparkleButton>

          <div className="flex flex-wrap items-center gap-2.5">
            {lesson.prev_lesson && (
              <SparkleButton
                variant="secondary"
                size="xs"
                withParticles={false}
                onClick={() => onSelectLesson(lesson.prev_lesson!.slug)}
                title={lesson.prev_lesson.title}
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="uppercase">{lesson.prev_lesson.dars}</span>
              </SparkleButton>
            )}
            {lesson.next_lesson && (
              <SparkleButton
                variant="secondary"
                size="xs"
                withParticles={false}
                onClick={() => onSelectLesson(lesson.next_lesson!.slug)}
                title={lesson.next_lesson.title}
              >
                <span className="uppercase">{lesson.next_lesson.dars}</span>
                <ArrowRight className="h-3 w-3" />
              </SparkleButton>
            )}
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
                <span className="uppercase">{lessonCompleted ? 'O‘zlashtirildi' : 'Tugatildi'}</span>
              </SparkleButton>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono-tech text-[11px] uppercase">
          <span className="text-[var(--accent)]">
            {lesson.grade_num}-SINF · {lesson.dars} · {lesson.term} · {lesson.hours} SOAT
          </span>
          <span className={`rounded-lg border px-2 py-0.5 ${typeMeta.cls}`}>{typeMeta.label}</span>
          {lesson.topic_title &&
            (onOpenTopicSlug && lesson.topic_slug ? (
              <button
                type="button"
                onClick={() => onOpenTopicSlug(lesson.topic_slug)}
                className="text-[var(--dim)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
              >
                Bo‘lim: {lesson.topic_title}
              </button>
            ) : (
              <span className="text-[var(--dim)]">Bo‘lim: {lesson.topic_title}</span>
            ))}
        </div>

        <h2 className="mt-2 text-xl font-medium tracking-tight text-[var(--ink)] sm:text-2xl">
          {lesson.title}
        </h2>
        {lesson.note && (
          <p className="mt-1 font-mono-tech text-xs text-amber-500">Eslatma: {lesson.note}</p>
        )}
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

      {/* Content */}
      <div className="p-5 sm:p-6">
        {tab === 'dars' && (
          <div className="space-y-6">
            {/* Objectives */}
            {lesson.content.objectives.length > 0 && (
              <div className="rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4 sm:p-5">
                <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--accent)]">
                  <Target className="h-4 w-4" />
                  <span>Dars Maqsadlari</span>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {lesson.content.objectives.map((obj, idx) => (
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

            {/* Full Explanation */}
            <div className="space-y-3">
              <h3 className="font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                To‘liq Nazariy Tushuntirish ({lesson.grade_num}-sinf darajasi)
              </h3>
              {lesson.content.explanation.map((para, idx) => (
                <p key={idx} className="text-[15px] leading-relaxed text-[var(--ink)]/90">
                  {para}
                </p>
              ))}
            </div>

            {/* Visual Diagram & Interactive Mini Animation */}
            <div className="space-y-4 rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4 sm:p-5">
              <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--accent)]">
                <Sparkles className="h-4 w-4" />
                <span>Vizual Sxema va Interaktiv Animatsiya</span>
              </div>

              {diagramNodes.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-4">
                  {diagramNodes.map((node, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl border border-[var(--grid)] bg-[var(--surface)] p-3.5"
                    >
                      <div className="font-mono-tech text-[10px] uppercase text-[var(--accent)]">
                        {i + 1}-BOSQICH
                      </div>
                      <div className="mt-1 text-sm font-medium">{node}</div>
                    </div>
                  ))}
                </div>
              )}

              <MiniAnimation
                type={lesson.content.anim_type}
                title={lesson.content.anim_title}
                subtitle={lesson.content.anim_subtitle}
              />
            </div>

            {/* Key Terms */}
            {lesson.content.key_terms.length > 0 && (
              <div>
                <h3 className="mb-3 font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                  Muhim Atamalar
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {lesson.content.key_terms.map((kc, idx) => (
                    <div
                      key={idx}
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

            {/* Practical Examples */}
            {lesson.content.practical_examples.length > 0 && (
              <div className="rounded-2xl border border-[var(--grid)] bg-[var(--bg)] p-4 sm:p-5">
                <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                  <Lightbulb className="h-4 w-4 text-[#0284c7]" />
                  <span>Amaliy Misollar</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]/90">
                  {lesson.content.practical_examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--accent)]">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.content.summary_text && (
              <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--dim)]">
                <strong className="text-[var(--ink)]">Dars xulosasi:</strong>{' '}
                {lesson.content.summary_text}
              </div>
            )}
          </div>
        )}

        {tab === 'taqdimot' && (
          <PresentationSystem
            topicSlug={lesson.slug}
            animType={lesson.content.anim_type}
            animTitle={lesson.content.anim_title}
            animSubtitle={lesson.content.anim_subtitle}
            onViewed={handlePresentationViewed}
          />
        )}

        {tab === 'testlar' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-4 py-3">
              <div className="text-sm font-medium">
                {lesson.dars} bo‘yicha {tests.length} ta nazorat testi
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
                {lesson.dars} bo‘yicha {lesson.practices.length} ta interaktiv amaliy topshiriq
              </div>
              <div className="font-mono-tech text-xs uppercase">
                Bajarildi: {solvedPracticesCount} / {lesson.practices.length}
              </div>
            </div>

            {lesson.practices.map((pr, idx) => {
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

        {tab === 'oyinlar' && (
          <div className="space-y-5">
            <MiniAnimation
              type={lesson.content.anim_type}
              title={lesson.content.anim_title}
              subtitle={lesson.content.anim_subtitle}
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
                <span className="inline-flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-[var(--accent)]" />
                  <span>Dars va Bo‘limga Mos Interaktiv Animatsiyali O‘yinlar</span>
                </span>
                <span>{lessonGames.length} ta o‘yin</span>
              </div>

              <div className="grid gap-3.5 md:grid-cols-2">
                {lessonGames.map((g, i) => {
                  const best = completedGames[g.id];
                  const isDirectTopicMatch = g.topicId === lesson.topic_slug;
                  return (
                    <div
                      key={g.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4 ${
                        isDirectTopicMatch
                          ? 'border-[#2563eb]/50 bg-[#2563eb]/5'
                          : 'border-[var(--grid)] bg-[var(--bg)]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase text-[var(--dim)]">
                          <span>
                            {i + 1}-O‘YIN · #{g.id} · {g.engine}
                            {isDirectTopicMatch ? ' · MAVZUGA MAXSUS' : ''}
                          </span>
                          {best !== undefined && (
                            <span className="text-emerald-500">{best} BALL</span>
                          )}
                        </div>
                        <h4 className="mt-1.5 text-sm font-medium">{g.title}</h4>
                        <p className="mt-1 text-xs text-[var(--dim)]">{g.idea}</p>
                      </div>

                      <div className="mt-4">
                        <SparkleButton
                          variant="primary"
                          size="sm"
                          fullWidth
                          showSparkle
                          withParticles
                          onClick={() => setActiveGame(g)}
                        >
                          <Play className="h-3.5 w-3.5 text-[#c4b5fd]" />
                          <span className="uppercase tracking-wider">Animatsiyali o‘yinni boshlash</span>
                        </SparkleButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
