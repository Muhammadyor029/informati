import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Gamepad2,
  Layers,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Moon,
  Play,
  Search,
  Settings,
  Sun,
  Unlock,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { GameDef, GradeId, supportsPvpEngine } from './data/types';
import {
  api,
  ApiError,
  ApiGrade,
  ApiLessonSummary,
  ApiTopicSummary,
  ApiUser,
  LessonType,
  PermissionStatus,
} from './lib/api';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SparkleAnchor, SparkleButton } from './components/SparkleButton';
import { CornerButton } from './components/CornerButton';

const RobotCanvas = lazy(() =>
  import('./components/RobotCanvas').then((m) => ({ default: m.RobotCanvas }))
);
const LockModal = lazy(() =>
  import('./components/LockModal').then((m) => ({ default: m.LockModal }))
);
const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const LessonDetailView = lazy(() =>
  import('./components/LessonDetailView').then((m) => ({ default: m.LessonDetailView }))
);
const TopicDetailView = lazy(() =>
  import('./components/TopicDetailView').then((m) => ({ default: m.TopicDetailView }))
);
const GameArena = lazy(() =>
  import('./components/GameArena').then((m) => ({ default: m.GameArena }))
);
const ProgressDashboard = lazy(() =>
  import('./components/ProgressDashboard').then((m) => ({ default: m.ProgressDashboard }))
);
const AdminPanel = lazy(() =>
  import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);
const FortuneWheel = lazy(() =>
  import('./components/FortuneWheel').then((m) => ({ default: m.FortuneWheel }))
);

type MainSection = 'dashboard' | 'sinflar' | 'oyinlar' | 'natijalar' | 'reja' | 'admin';

const DASHBOARD_PROMPTS = [
  '5–11-SINF INFORMATIKA MAVZULARI, TESTLARI VA O‘YINLARINI OCHING.',
  'HAR BIR BO‘LIMDA 10 TA TEST, 6 TA AMALIYOT, ANIMATSIYA VA 5 TA O‘YIN.',
  '59 TA INTERAKTIV ANIMATSIYALI INFORMATIKA O‘YINLARI VA OMAD G‘ILDIRAGI.',
  '2026–2027 YILLIK TAQVIMIY REJA ASOSIDA TUZILGAN.',
];

const SectionSpinner: React.FC = () => (
  <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-8">
    <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
    <span className="font-mono-tech text-xs uppercase tracking-wider text-[var(--dim)]">
      Bo‘lim yuklanmoqda...
    </span>
  </div>
);

export default function App() {
  const [section, setSection] = useState<MainSection>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<GradeId>(5);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isNight, setIsNight] = useState(false);

  const [user, setUser] = useState<ApiUser | null>(null);
  const [grades, setGrades] = useState<ApiGrade[]>([]);
  const [topics, setTopics] = useState<ApiTopicSummary[]>([]);
  const [lessons, setLessons] = useState<ApiLessonSummary[]>([]);
  const [games, setGames] = useState<GameDef[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(60);
  const [promptIndex, setPromptIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h > 0) setHeaderHeight(h);
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const [activeLessonSlug, setActiveLessonSlug] = useState<string | null>(null);
  const [activeTopicSlug, setActiveTopicSlug] = useState<string | null>(null);
  const [gradeViewMode, setGradeViewMode] = useState<'lessons' | 'units'>('lessons');
  const [lessonTypeFilter, setLessonTypeFilter] = useState<'all' | LessonType>('all');
  const [lessonSearch, setLessonSearch] = useState('');
  const [activeCatalogGame, setActiveCatalogGame] = useState<GameDef | null>(null);
  const [gamesGradeFilter, setGamesGradeFilter] = useState<GradeId | 'all'>('all');
  const [pvpOnlyFilter, setPvpOnlyFilter] = useState(false);
  const [completedGames, setCompletedGames] = useState<Record<number, number>>({});

  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingLesson, setPendingLesson] = useState<ApiLessonSummary | null>(null);
  const [pendingTopic, setPendingTopic] = useState<ApiTopicSummary | null>(null);
  const [pendingGame, setPendingGame] = useState<GameDef | null>(null);
  const [topicPermissions, setTopicPermissions] = useState<Record<string, PermissionStatus>>({});
  const [permissionBusy, setPermissionBusy] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  useEffect(() => {
    document.documentElement.classList.toggle('theme-night', isNight);
  }, [isNight]);

  const loadCurriculumData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [meRes, gradesRes, topicsRes, lessonsRes, gamesRes] = await Promise.all([
        api.getMe(),
        api.getGrades(),
        api.getTopics(),
        api.getLessons(),
        api.getGames(),
      ]);
      setUser(meRes.user);
      setIsUnlocked(
        Boolean(
          meRes.curriculum_unlocked ||
            meRes.user?.role === 'teacher' ||
            meRes.user?.role === 'admin'
        )
      );
      const perms: Record<string, PermissionStatus> = {};
      for (const p of meRes.topic_permissions || []) perms[p.topic_slug] = p.status;
      setTopicPermissions(perms);
      setGrades(gradesRes);
      setTopics(topicsRes);
      setLessons(lessonsRes);
      setGames(gamesRes);

      if (meRes.user && (meRes.user.role === 'teacher' || meRes.user.role === 'admin')) {
        api
          .getTopicPermissionRequests()
          .then((res) => setPendingCount(res.pending_count))
          .catch(() => {});
      } else {
        setPendingCount(0);
      }

      if (meRes.user) {
        api
          .getMyProgress()
          .then((prog) => {
            const mapped: Record<number, number> = {};
            for (const [gid, score] of Object.entries(prog.game_scores || {})) {
              mapped[Number(gid)] = Number(score);
            }
            setCompletedGames((prev) => ({ ...prev, ...mapped }));
          })
          .catch(() => {});
      }
    } catch (err) {
      setDataError(
        err instanceof ApiError
          ? err.message
          : 'Ma’lumotlarni serverdan yuklashda xatolik yuz berdi.'
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurriculumData();
  }, [loadCurriculumData]);

  // Smooth scroll progress for Dashboard Intro -> Close-up transition & auto-camera trigger
  useEffect(() => {
    if (section !== 'dashboard') {
      setScrollProgress(0);
      return;
    }
    const onScroll = () => {
      const maxRange = Math.max(window.innerHeight * 0.72, 360);
      const p = Math.max(0, Math.min(1, window.scrollY / maxRange));
      setScrollProgress(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [section]);

  // Typing animation for dashboard left prompt box
  useEffect(() => {
    if (section !== 'dashboard') return;
    const full = DASHBOARD_PROMPTS[promptIndex % DASHBOARD_PROMPTS.length];
    let charIdx = 0;
    setTypedText('');

    const typeTimer = window.setInterval(() => {
      charIdx++;
      setTypedText(full.slice(0, charIdx));
      if (charIdx >= full.length) {
        window.clearInterval(typeTimer);
      }
    }, 36);

    const nextTimer = window.setTimeout(() => {
      setPromptIndex((i) => (i + 1) % DASHBOARD_PROMPTS.length);
    }, 4800);

    return () => {
      window.clearInterval(typeTimer);
      window.clearTimeout(nextTimer);
    };
  }, [promptIndex, section]);

  const gradeTopics = useMemo(
    () => topics.filter((t) => t.grade_num === selectedGrade),
    [topics, selectedGrade]
  );

  const filteredGradeTopics = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase();
    if (!q) return gradeTopics;
    return gradeTopics.filter((t) => {
      if (isUnlocked) {
        return `${t.title} ${t.short_desc} ${t.term} ${t.lesson_range}`.toLowerCase().includes(q);
      }
      return `${t.order}-bo‘lim ${t.term} ${t.lesson_range}`.toLowerCase().includes(q);
    });
  }, [gradeTopics, lessonSearch, isUnlocked]);

  const gradeLessons = useMemo(
    () =>
      lessons
        .filter((l) => l.grade_num === selectedGrade)
        .sort((a, b) => a.lesson_number - b.lesson_number),
    [lessons, selectedGrade]
  );

  const filteredGradeLessons = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase();
    return gradeLessons.filter((l) => {
      if (lessonTypeFilter !== 'all') {
        if (lessonTypeFilter === 'practical') {
          if (l.lesson_type !== 'practical' && l.lesson_type !== 'project') return false;
        } else if (l.lesson_type !== lessonTypeFilter) {
          return false;
        }
      }
      if (q && isUnlocked) {
        return `${l.dars} ${l.title} ${l.term} ${l.topic_title}`.toLowerCase().includes(q);
      }
      if (q && !isUnlocked) {
        return `${l.dars} ${l.term}`.toLowerCase().includes(q);
      }
      return true;
    });
  }, [gradeLessons, lessonTypeFilter, lessonSearch, isUnlocked]);

  const gradeInfo = useMemo(
    () => grades.find((g) => g.grade === selectedGrade) || grades[0],
    [grades, selectedGrade]
  );

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (gamesGradeFilter !== 'all' && g.grade !== gamesGradeFilter) return false;
      if (pvpOnlyFilter && !supportsPvpEngine(g.engine)) return false;
      return true;
    });
  }, [games, gamesGradeFilter, pvpOnlyFilter]);

  const handleOpenLesson = (lesson: ApiLessonSummary) => {
    if (!hasTopicAccess(lesson.topic_slug)) {
      setPendingLesson(lesson);
      setPendingTopic(null);
      setPendingGame(null);
      setLockModalOpen(true);
      return;
    }
    setActiveTopicSlug(null);
    setActiveLessonSlug(lesson.slug);
    setActiveCatalogGame(null);
    setSection('sinflar');
  };

  const handleOpenTopic = (topic: ApiTopicSummary) => {
    if (!hasTopicAccess(topic.slug)) {
      setPendingTopic(topic);
      setPendingLesson(null);
      setPendingGame(null);
      setLockModalOpen(true);
      return;
    }
    setActiveLessonSlug(null);
    setActiveTopicSlug(topic.slug);
    setActiveCatalogGame(null);
    setSection('sinflar');
  };

  const handleOpenCatalogGame = (game: GameDef) => {
    if (!hasTopicAccess(game.topicId)) {
      setPendingGame(game);
      setPendingLesson(null);
      setPendingTopic(null);
      setLockModalOpen(true);
      return;
    }
    setActiveCatalogGame(game);
    setSection('oyinlar');
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setLockModalOpen(false);
    if (pendingLesson) {
      setSelectedGrade(pendingLesson.grade_num);
      setActiveLessonSlug(pendingLesson.slug);
      setActiveTopicSlug(null);
      setSection('sinflar');
      setPendingLesson(null);
    } else if (pendingTopic) {
      setSelectedGrade(pendingTopic.grade_num);
      setActiveTopicSlug(pendingTopic.slug);
      setActiveLessonSlug(null);
      setSection('sinflar');
      setPendingTopic(null);
    } else if (pendingGame) {
      setActiveCatalogGame(pendingGame);
      setSection('oyinlar');
      setPendingGame(null);
    }
  };

  const handleRelock = async () => {
    try {
      await api.lockCurriculum();
    } catch {
      // Ignore network hiccup on lock
    }
    setIsUnlocked(false);
    setActiveLessonSlug(null);
    setActiveTopicSlug(null);
    setActiveCatalogGame(null);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    setUser(null);
    if (section === 'admin') {
      setSection('dashboard');
    }
  };

  const handleGameComplete = (gameId: number, score: number) => {
    setCompletedGames((prev) => ({
      ...prev,
      [gameId]: Math.max(prev[gameId] || 0, score),
    }));
    api.submitGameScore(gameId, score).catch(() => {});
  };

  const isEducator = Boolean(user && (user.role === 'admin' || user.role === 'teacher'));

  const activeLesson = useMemo(
    () => lessons.find((l) => l.slug === activeLessonSlug) || null,
    [lessons, activeLessonSlug]
  );
  const activeTopic = useMemo(
    () => topics.find((t) => t.slug === activeTopicSlug) || null,
    [topics, activeTopicSlug]
  );

  const hasTopicAccess = useCallback(
    (topicSlug?: string | null) => {
      if (!topicSlug) return false;
      if (isUnlocked) return true;
      return topicPermissions[topicSlug] === 'approved';
    },
    [isUnlocked, topicPermissions]
  );

  const handleRequestPermission = useCallback(
    async (topicSlug: string) => {
      setPermissionError(null);
      if (!user) {
        setAuthMode('register');
        setAuthModalOpen(true);
        return;
      }
      setPermissionBusy(true);
      try {
        const res = await api.requestTopicPermission(topicSlug);
        setTopicPermissions((prev) => ({ ...prev, [topicSlug]: res.status }));
        setTopics((prev) =>
          prev.map((t) =>
            t.slug === topicSlug
              ? { ...t, permission_status: res.status, locked: res.status !== 'approved' }
              : t
          )
        );
        setLessons((prev) =>
          prev.map((l) =>
            l.topic_slug === topicSlug
              ? { ...l, permission_status: res.status, locked: res.status !== 'approved' }
              : l
          )
        );
      } catch (err) {
        setPermissionError(err instanceof ApiError ? err.message : 'So‘rov yuborilmadi.');
      } finally {
        setPermissionBusy(false);
      }
    },
    [user]
  );

  const navItems: Array<{ id: MainSection; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layers className="h-3.5 w-3.5" /> },
    { id: 'sinflar', label: 'Sinflar (5–11)', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'oyinlar', label: `${games.length || 59} ta O‘yin`, icon: <Gamepad2 className="h-3.5 w-3.5" /> },
    { id: 'natijalar', label: 'Natijalar', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'reja', label: 'Yillik Reja', icon: <FileText className="h-3.5 w-3.5" /> },
    ...(isEducator
      ? [
          {
            id: 'admin' as MainSection,
            label: pendingCount > 0 ? `Admin · ${pendingCount} so‘rov` : 'Admin',
            icon: pendingCount > 0 ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <Settings className="h-3.5 w-3.5" />
            ),
          },
        ]
      : []),
  ];

  const nextPromptPreview = DASHBOARD_PROMPTS[(promptIndex + 1) % DASHBOARD_PROMPTS.length];

  return (
    <div
      className={`min-h-screen bg-[var(--bg)] text-[var(--ink)] transition-colors duration-300 ${
        isNight ? 'theme-night' : ''
      }`}
    >
      <LoadingOverlay />

      {/* Top Sticky 3-Zone Header */}
      <header ref={headerRef} className="sticky top-0 z-30 border-b border-[var(--grid)] bg-[var(--bg)]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2.5 px-4 py-3 sm:px-6 lg:px-8">
          {/* Zone 1: Brand */}
          <button
            type="button"
            onClick={() => {
              setSection('dashboard');
              setActiveLessonSlug(null);
              setActiveTopicSlug(null);
              setActiveCatalogGame(null);
            }}
            className="flex shrink-0 items-center gap-2.5 text-left"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="novaGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="52%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
              <rect x="2.5" y="2.5" width="23" height="23" rx="7" stroke="url(#novaGrad)" strokeWidth="2.5" />
              <circle cx="10.5" cy="14" r="1.9" fill="currentColor" />
              <circle cx="17.5" cy="14" r="1.9" fill="currentColor" />
            </svg>
            <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
              NOVA INFORMATIKA
            </span>
          </button>

          {/* Zone 2: Primary Navigation (Spread Across Center) */}
          <nav
            className="order-3 flex w-full items-center justify-start gap-3 overflow-x-auto px-1.5 py-1.5 sm:justify-center sm:gap-3.5 xl:order-2 xl:w-auto xl:flex-1 xl:justify-center xl:gap-4 xl:overflow-visible xl:py-0"
            aria-label="Asosiy bo‘limlar"
          >
            {navItems.map((item) => {
              const active = section === item.id;
              return (
                <SparkleButton
                  key={item.id}
                  variant={active ? 'active' : 'subtle'}
                  size="sm"
                  showSparkle={active}
                  withParticles={false}
                  onClick={() => {
                    setSection(item.id);
                    if (item.id !== 'sinflar') {
                      setActiveLessonSlug(null);
                      setActiveTopicSlug(null);
                    }
                    if (item.id !== 'oyinlar') setActiveCatalogGame(null);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SparkleButton>
              );
            })}
          </nav>

          {/* Zone 3: Theme, Auth & Curriculum Lock */}
          <div className="order-2 flex shrink-0 items-center gap-2.5 sm:gap-3 xl:order-3">
            <SparkleButton
              variant="secondary"
              size="sm"
              withParticles={false}
              onClick={() => setIsNight((n) => !n)}
              title="Kungi / Tungi rejimni almashtirish"
            >
              {isNight ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span className="hidden sm:inline">Kungi</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-[#6366f1]" />
                  <span className="hidden sm:inline">Tungi</span>
                </>
              )}
            </SparkleButton>

            {user ? (
              <div className="flex shrink-0 items-center gap-2.5">
                <SparkleButton
                  variant="secondary"
                  size="sm"
                  withParticles={false}
                  onClick={() => setSection('natijalar')}
                  title="Shaxsiy natijalar"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#6366f1]" />
                  <span className="max-w-[90px] truncate">{user.username}</span>
                </SparkleButton>
                <SparkleButton
                  variant="secondary"
                  size="sm"
                  withParticles={false}
                  onClick={handleLogout}
                  className="sparkle-icon-only"
                  title="Chiqish"
                  aria-label="Hisobdan chiqish"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </SparkleButton>
              </div>
            ) : (
              <SparkleButton
                variant="secondary"
                size="sm"
                withParticles={false}
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
              >
                <LogIn className="h-3.5 w-3.5 text-[#6366f1]" />
                <span className="hidden sm:inline">Kirish</span>
              </SparkleButton>
            )}

            {isUnlocked ? (
              <SparkleButton
                variant="emerald"
                size="sm"
                showSparkle
                withParticles={false}
                onClick={handleRelock}
              >
                <Unlock className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Ochiq · Qulflash</span>
              </SparkleButton>
            ) : (
              <SparkleButton
                variant="primary"
                size="sm"
                showSparkle
                withParticles={false}
                onClick={() => {
                  setPendingTopic(null);
                  setPendingGame(null);
                  setLockModalOpen(true);
                }}
              >
                <Lock className="h-3.5 w-3.5 text-[#c4b5fd]" />
                <span>Qulfni ochish</span>
              </SparkleButton>
            )}
          </div>
        </div>
      </header>

      {/* ==================== 1. TWO-STAGE SCROLL ROBOT DASHBOARD ==================== */}
      {section === 'dashboard' && (
        <div className="relative w-full">
          {/* Fixed Full-Viewport 3D Robot Stage & Architectural Guide Lines */}
          <div
            style={{ top: `${headerHeight}px` }}
            className="fixed inset-x-0 bottom-0 z-0 overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-y-0 left-[17%] z-[2] hidden w-px bg-[var(--grid-faint)] md:block" />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[2] hidden w-px bg-[var(--grid-faint)] md:block" />
            <div className="pointer-events-none absolute inset-y-0 left-[83%] z-[2] hidden w-px bg-[var(--grid-faint)] md:block" />

            <Suspense fallback={null}>
              <RobotCanvas isNight={isNight} scrollProgress={scrollProgress} />
            </Suspense>
          </div>

          {/* Right Edge Scroll Indicator Rail */}
          <div className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-2.5 lg:flex">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`font-mono-tech text-[10px] uppercase tracking-wider transition-colors ${
                scrollProgress < 0.4 ? 'text-[var(--ink)]' : 'text-[var(--dim)] opacity-60 hover:opacity-100'
              }`}
            >
              {scrollProgress < 0.4 ? '◉ INTRO' : '○ INTRO'}
            </button>
            <div className="h-14 w-px bg-[var(--grid)]" />
            <button
              type="button"
              onClick={() =>
                window.scrollTo({ top: Math.round(window.innerHeight * 0.78), behavior: 'smooth' })
              }
              className={`font-mono-tech text-[10px] uppercase tracking-wider transition-colors ${
                scrollProgress >= 0.4 ? 'text-[var(--accent)]' : 'text-[var(--dim)] opacity-60 hover:opacity-100'
              }`}
            >
              {scrollProgress >= 0.4 ? '◉ KAMERA' : '○ KAMERA'}
            </button>
          </div>

          {/* Scrollable Editorial Layer Over Fixed Robot Stage */}
          <div className="pointer-events-none relative z-10">
            {/* STAGE 1: INTRO VIEW */}
            <section className="relative h-[calc(100vh-53px)] min-h-[540px] w-full">
              <div className="hidden h-full w-full md:block">
                {/* Left Typing Prompt Box */}
                <div className="absolute left-[17%] top-[22%] w-[27%] max-w-[390px]">
                  <div className="inline-flex h-7 items-center gap-1.5 rounded-t-lg border border-b-0 border-[var(--grid)] bg-[var(--surface)] px-2.5 font-mono-tech text-[10px] uppercase tracking-wider text-[var(--accent)]">
                    <span>SYS://INFO</span>
                  </div>
                  <div className="relative rounded-r-xl rounded-bl-xl border border-[var(--grid)] bg-[var(--surface)]/95 px-4 py-3 shadow-sm">
                    <p className="min-h-[34px] font-mono-tech text-[11px] uppercase leading-relaxed tracking-wider text-[var(--ink)]">
                      {typedText}
                      <span className="ml-0.5 inline-block h-3 w-1.5 bg-[var(--accent)] align-middle" />
                    </p>
                  </div>
                  <p className="mt-1.5 truncate font-mono-tech text-[10px] uppercase tracking-wider text-[var(--dim)] opacity-65">
                    {nextPromptPreview}
                  </p>
                </div>

                {/* Bottom-Left Outlined Hero Display Headline */}
                <div className="absolute bottom-[9%] left-[17%] flex flex-col items-start gap-2">
                  <div className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[var(--dim)]">
                    2026–2027 TA’LIM PLATFORMASI · {topics.length || 56} BO‘LIM · {lessons.length || 340} DARS
                  </div>
                  <div className="grad-border rounded-xl bg-[var(--surface)]/92 px-5 py-1.5">
                    <h1 className="text-[clamp(2.1rem,3.6vw,3.4rem)] font-medium leading-[1.08] tracking-tight">
                      Informatika
                    </h1>
                  </div>
                  <div className="grad-border rounded-xl bg-[var(--surface)]/92 px-5 py-1.5">
                    <div className="text-[clamp(2.1rem,3.6vw,3.4rem)] font-medium leading-[1.08] tracking-tight">
                      5–11-Sinflar
                    </div>
                  </div>
                </div>

                {/* Right-Beside-Robot Corner-Reticle Action Stack */}
                <div className="pointer-events-auto absolute left-[57%] right-[17%] top-[24%] flex flex-col gap-5">
                  <CornerButton
                    variant="primary"
                    size="md"
                    fullWidth
                    compactCorners
                    label="SINFLAR (5–11)"
                    accentSuffix={`${topics.length || 56} BO‘LIM`}
                    icon={<BookOpen className="h-4 w-4" />}
                    onClick={() => setSection('sinflar')}
                  />

                  <CornerButton
                    variant="default"
                    size="sm"
                    fullWidth
                    compactCorners
                    label={`${games.length || 59} TA O‘YIN`}
                    icon={<Gamepad2 className="h-4 w-4" />}
                    onClick={() => setSection('oyinlar')}
                  />

                  <CornerButton
                    variant="default"
                    size="sm"
                    fullWidth
                    compactCorners
                    label="NATIJALAR"
                    icon={<BarChart3 className="h-4 w-4" />}
                    onClick={() => setSection('natijalar')}
                  />

                  <CornerButton
                    variant="default"
                    size="sm"
                    fullWidth
                    compactCorners
                    label="YILLIK REJA"
                    accentSuffix="PDF"
                    icon={<FileText className="h-4 w-4" />}
                    onClick={() => setSection('reja')}
                  />

                  <CornerButton
                    variant={isUnlocked ? 'emerald' : 'default'}
                    size="sm"
                    fullWidth
                    compactCorners
                    label={isUnlocked ? 'OCHIQ' : 'QULFNI OCHISH'}
                    accentSuffix={isUnlocked ? 'QULFLASH' : undefined}
                    icon={isUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    onClick={() => (isUnlocked ? handleRelock() : setLockModalOpen(true))}
                  />
                </div>

                {/* Bottom-Right Editorial Caption + Scroll Cue */}
                <div className="pointer-events-auto absolute bottom-[9%] left-[60%] right-[17%] space-y-4">
                  <p className="text-xs leading-relaxed text-[var(--dim)]">
                    Yillik ish reja asosida 5–11-sinflar uchun {topics.length || 56} ta bo‘lim, {lessons.length || 340} ta dars,
                    taqdimotlar, interaktiv animatsiya, {games.length || 59} ta o‘yin, test va amaliyotlar.
                  </p>
                  <CornerButton
                    variant="default"
                    size="sm"
                    compactCorners
                    label="Pastga tushiring"
                    accentSuffix="Kamera ↓"
                    onClick={() =>
                      window.scrollTo({
                        top: Math.round(window.innerHeight * 0.78),
                        behavior: 'smooth',
                      })
                    }
                  />
                </div>
              </div>

              {/* Mobile / Small Screen Structured Layout (Leaves Top HUD & Center Clear For 3D Robot) */}
              <div className="flex h-full flex-col justify-between px-3 pb-3 pt-[104px] md:hidden">
                <div className="pointer-events-auto rounded-2xl border border-[var(--grid)] bg-[var(--surface)]/95 p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--accent)]">
                      2026–2027 INFORMATIKA
                    </span>
                    <span className="font-mono-tech text-[10px] uppercase text-[var(--dim)]">
                      {topics.length || 56} bo‘lim · {lessons.length || 340} dars · {games.length || 59} o‘yin
                    </span>
                  </div>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--ink)]">
                    5–11-sinf Ta’lim Platformasi
                  </h1>
                  <p className="mt-0.5 truncate font-mono-tech text-[10px] uppercase text-[var(--dim)]">
                    {typedText || DASHBOARD_PROMPTS[0]}
                  </p>
                </div>

                <div className="pointer-events-auto px-1 pb-1">
                  <div className="grid grid-cols-2 gap-4">
                    <CornerButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      compactCorners
                      label="Sinflar"
                      accentSuffix="5–11"
                      icon={<BookOpen className="h-3.5 w-3.5" />}
                      onClick={() => setSection('sinflar')}
                    />
                    <CornerButton
                      variant="default"
                      size="sm"
                      fullWidth
                      compactCorners
                      label={`${games.length || 59} ta O‘yin`}
                      icon={<Gamepad2 className="h-3.5 w-3.5" />}
                      onClick={() => setSection('oyinlar')}
                    />
                    <CornerButton
                      variant="default"
                      size="sm"
                      fullWidth
                      compactCorners
                      label="Natijalar"
                      icon={<BarChart3 className="h-3.5 w-3.5" />}
                      onClick={() => setSection('natijalar')}
                    />
                    <CornerButton
                      variant="default"
                      size="sm"
                      fullWidth
                      compactCorners
                      label="Yillik Reja"
                      icon={<FileText className="h-3.5 w-3.5" />}
                      onClick={() => setSection('reja')}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* STAGE 2: CLOSE-UP & AUTO CAMERA TARGETING */}
            <section className="relative h-[85vh] min-h-[500px] w-full">
              <div className="hidden h-full w-full md:block">
                <div className="absolute left-[17%] top-[36%] max-w-[260px] space-y-2">
                  <div className="font-mono-tech text-[10px] uppercase tracking-widest text-[var(--accent)]">
                    AQLLI KUZATUV
                  </div>
                  <div className="rounded-xl border border-[var(--grid)] bg-[var(--surface)]/95 px-4 py-2.5">
                    <div className="text-2xl font-medium leading-tight tracking-tight">
                      Jonli Nigoh
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--dim)]">
                    Pastga tushirilganda kamera avtomatik yonadi, odamlarni ko‘radi va tanlangan
                    shaxs tomonga qaraydi.
                  </p>
                </div>

                <div className="pointer-events-auto absolute right-[17%] top-[42%] flex flex-col items-end gap-7">
                  <CornerButton
                    variant="primary"
                    size="md"
                    label="Sinflarga o‘tish"
                    accentSuffix="→"
                    onClick={() => setSection('sinflar')}
                  />
                  <CornerButton
                    variant="default"
                    size="sm"
                    label={`${games.length || 59} ta O‘yin`}
                    accentSuffix="→"
                    onClick={() => setSection('oyinlar')}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ==================== NON-DASHBOARD SECTIONS ==================== */}
      {section !== 'dashboard' && (
        <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
          {dataLoading ? (
            <SectionSpinner />
          ) : dataError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-500/40 bg-[var(--surface)] p-8 text-center">
              <AlertCircle className="h-7 w-7 text-rose-500" />
              <p className="text-sm text-rose-500">{dataError}</p>
              <SparkleButton
                variant="primary"
                size="md"
                showSparkle
                withParticles
                onClick={loadCurriculumData}
              >
                <span className="uppercase">Qayta urinish</span>
              </SparkleButton>
            </div>
          ) : (
            <Suspense fallback={<SectionSpinner />}>
              {/* ==================== 2. SINFLAR (5–11) BO'LIMI (340 TO'LIQ DARSLAR) ==================== */}
              {section === 'sinflar' && (
                <div className="space-y-6">
                  {activeLessonSlug && hasTopicAccess(activeLesson?.topic_slug) ? (
                    <LessonDetailView
                      lessonSlug={activeLessonSlug}
                      allGames={games}
                      user={user}
                      onBack={() => setActiveLessonSlug(null)}
                      onSelectLesson={(slug) => setActiveLessonSlug(slug)}
                      onOpenTopicSlug={(slug) => {
                        setActiveLessonSlug(null);
                        setActiveTopicSlug(slug);
                      }}
                      completedGames={completedGames}
                      onGameComplete={handleGameComplete}
                    />
                  ) : activeTopicSlug && hasTopicAccess(activeTopic?.slug) ? (
                    <TopicDetailView
                      topicSlug={activeTopicSlug}
                      allGames={games}
                      user={user}
                      onBack={() => setActiveTopicSlug(null)}
                      onOpenLessonSlug={(slug) => {
                        setActiveTopicSlug(null);
                        setActiveLessonSlug(slug);
                      }}
                      completedGames={completedGames}
                      onGameComplete={handleGameComplete}
                    />
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
                        <div>
                          <div className="font-mono-tech text-[11px] uppercase tracking-wider text-[var(--accent)]">
                            TO‘LIQ YILLIK DARS RO‘YXATI · {gradeLessons.length} TA DARS · {gradeTopics.length} BO‘LIM ({gradeInfo?.total_hours || gradeLessons.length} SOAT)
                          </div>
                          <h2 className="mt-1 text-2xl font-medium">
                            {gradeInfo?.title || `${selectedGrade}-sinf Informatika`}
                          </h2>
                          <p className="mt-1 max-w-2xl text-sm text-[var(--dim)]">
                            {isUnlocked
                              ? gradeInfo?.summary
                              : 'Sinf darslari, tushuntirishlar, taqdimotlar, 10 talik bo‘lim va 5 talik dars testlari maxfiy kod bilan himoyalangan.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {grades.map((g) => {
                            const active = selectedGrade === g.grade;
                            return (
                              <SparkleButton
                                key={g.grade}
                                variant={active ? 'active' : 'secondary'}
                                size="sm"
                                showSparkle={active}
                                withParticles={active}
                                onClick={() => {
                                  setSelectedGrade(g.grade);
                                  setLessonSearch('');
                                  setLessonTypeFilter('all');
                                }}
                              >
                                <span className="uppercase">
                                  {g.grade}-sinf ({g.lesson_count || (g.grade >= 9 ? 68 : 34)})
                                </span>
                              </SparkleButton>
                            );
                          })}
                        </div>
                      </div>

                      {/* View Mode & Filters Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <SparkleButton
                            variant={gradeViewMode === 'lessons' ? 'active' : 'secondary'}
                            size="sm"
                            showSparkle={gradeViewMode === 'lessons'}
                            withParticles={false}
                            onClick={() => setGradeViewMode('lessons')}
                          >
                            <span className="uppercase">Barcha darslar ({gradeLessons.length})</span>
                          </SparkleButton>
                          <SparkleButton
                            variant={gradeViewMode === 'units' ? 'active' : 'secondary'}
                            size="sm"
                            showSparkle={gradeViewMode === 'units'}
                            withParticles={false}
                            onClick={() => setGradeViewMode('units')}
                          >
                            <span className="uppercase">Bo‘limlar ({gradeTopics.length})</span>
                          </SparkleButton>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dim)]" />
                            <input
                              type="text"
                              value={lessonSearch}
                              onChange={(e) => setLessonSearch(e.target.value)}
                              placeholder={
                                gradeViewMode === 'units' ? 'Bo‘lim qidirish...' : 'Dars qidirish...'
                              }
                              className="w-48 rounded-full border border-[var(--grid)] bg-[var(--bg)] py-1.5 pl-8 pr-3 font-mono-tech text-xs outline-none focus:border-[#6366f1]"
                            />
                          </div>

                          {gradeViewMode === 'lessons' &&
                            (
                              [
                                ['all', 'Hammasi'],
                                ['regular', 'Asosiy'],
                                ['practical', 'Amaliy/Loyiha'],
                                ['assessment', 'Nazorat'],
                                ['revision', 'Takrorlash'],
                              ] as Array<['all' | LessonType, string]>
                            ).map(([id, label]) => (
                              <SparkleButton
                                key={id}
                                variant={lessonTypeFilter === id ? 'active' : 'secondary'}
                                size="xs"
                                withParticles={false}
                                onClick={() => setLessonTypeFilter(id)}
                              >
                                <span className="uppercase">{label}</span>
                              </SparkleButton>
                            ))}
                        </div>
                      </div>

                      {gradeViewMode === 'lessons' ? (
                        filteredGradeLessons.length === 0 ? (
                          <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--dim)]">
                            Tanlangan filtr bo‘yicha darslar topilmadi.
                          </div>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            {filteredGradeLessons.map((lesson) => {
                              const typeBadge =
                                lesson.lesson_type === 'assessment'
                                  ? 'Nazorat ishi'
                                  : lesson.lesson_type === 'revision'
                                  ? 'Takrorlash'
                                  : lesson.lesson_type === 'project'
                                  ? 'Loyiha'
                                  : lesson.lesson_type === 'practical'
                                  ? 'Amaliyot'
                                  : 'Asosiy dars';
                              return (
                                <div
                                  key={lesson.slug}
                                  className="perf-card flex items-center justify-between gap-3 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4 transition-colors hover:border-[#2563eb]/70"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 font-mono-tech text-[10px] uppercase text-[var(--dim)]">
                                      <span className="font-medium text-[var(--accent)]">
                                        {lesson.dars}
                                      </span>
                                      <span>· {lesson.term}</span>
                                      <span>· {typeBadge}</span>
                                      <span>· {lesson.hours} soat</span>
                                      {lesson.locked && <Lock className="h-3 w-3 text-[var(--accent)]" />}
                                    </div>
                                    <h3 className="mt-1 truncate text-[15px] font-medium">
                                      {lesson.locked
                                        ? `${selectedGrade}-sinf · ${lesson.dars} (Qulflangan)`
                                        : lesson.title}
                                    </h3>
                                    <div className="mt-1 font-mono-tech text-[10px] text-[var(--dim)]">
                                      {lesson.locked
                                        ? 'Bu darsni ochish uchun mavzu ruxsati kerak.'
                                        : `${lesson.topic_title} · taqdimot · ${lesson.test_count || 5} test · ${lesson.practice_count || 3} amaliyot · animatsiyali o‘yin`}
                                    </div>
                                  </div>

                                  {lesson.locked ? (
                                    <SparkleButton
                                      variant="secondary"
                                      size="xs"
                                      showSparkle={lesson.permission_status !== 'pending'}
                                      withParticles={false}
                                      disabled={lesson.permission_status === 'pending' || permissionBusy}
                                      onClick={() => handleRequestPermission(lesson.topic_slug)}
                                    >
                                      {lesson.permission_status === 'pending' ? (
                                        <Clock className="h-3.5 w-3.5" />
                                      ) : (
                                        <Lock className="h-3.5 w-3.5 text-[#c4b5fd]" />
                                      )}
                                      <span className="uppercase">
                                        {lesson.permission_status === 'pending'
                                          ? 'So‘rov yuborilgan'
                                          : 'Ruxsat so‘rash'}
                                      </span>
                                    </SparkleButton>
                                  ) : (
                                    <SparkleButton
                                      variant="primary"
                                      size="xs"
                                      showSparkle
                                      withParticles={false}
                                      onClick={() => handleOpenLesson(lesson)}
                                    >
                                      <BookOpen className="h-3.5 w-3.5" />
                                      <span className="uppercase">Darsga kirish</span>
                                    </SparkleButton>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )
                      ) : filteredGradeTopics.length === 0 ? (
                        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--dim)]">
                          Tanlangan so‘rov bo‘yicha bo‘limlar topilmadi.
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {filteredGradeTopics.map((topic) => (
                            <div
                              key={topic.slug}
                              className="perf-card flex flex-col justify-between rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5 transition-colors hover:border-[#2563eb]/70"
                            >
                              <div>
                                <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                                  <span>
                                    {topic.order}-BO‘LIM · {topic.term} · {topic.lesson_range} · {topic.total_hours} soat
                                  </span>
                                  {topic.locked && <Lock className="h-3.5 w-3.5 text-[var(--accent)]" />}
                                </div>
                                <h3 className="mt-2 text-lg font-medium">
                                  {topic.locked
                                    ? `${selectedGrade}-sinf · ${topic.order}-bo‘lim (Qulflangan)`
                                    : topic.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-[var(--dim)]">
                                  {topic.locked
                                    ? topic.permission_status === 'pending'
                                      ? 'Ruxsat so‘rovi domlaga yuborildi. Tasdiqlangach mavzu ochiladi.'
                                      : 'Bu mavzuni ochish uchun domladan ruxsat so‘rang.'
                                    : topic.short_desc}
                                </p>
                              </div>

                              <div className="mt-5 flex items-center justify-between border-t border-[var(--grid)] pt-3.5">
                                <span className="font-mono-tech text-[11px] text-[var(--dim)]">
                                  {topic.lesson_count} dars · taqdimot · {topic.test_count || 10} test ·{' '}
                                  {topic.practice_count || 6} amaliyot · {(topic.game_ids || []).length || 5} o‘yin
                                </span>
                                {topic.locked ? (
                                  <div className="flex flex-wrap justify-end gap-2">
                                    <SparkleButton
                                      variant="secondary"
                                      size="sm"
                                      showSparkle={topic.permission_status !== 'pending'}
                                      withParticles={false}
                                      disabled={topic.permission_status === 'pending' || permissionBusy}
                                      onClick={() => handleRequestPermission(topic.slug)}
                                    >
                                      {topic.permission_status === 'pending' ? (
                                        <Clock className="h-3.5 w-3.5" />
                                      ) : (
                                        <Lock className="h-3.5 w-3.5 text-[#c4b5fd]" />
                                      )}
                                      <span className="uppercase">
                                        {topic.permission_status === 'pending'
                                          ? 'So‘rov yuborilgan'
                                          : 'Ruxsat so‘rash'}
                                      </span>
                                    </SparkleButton>
                                    <SparkleButton
                                      variant="subtle"
                                      size="sm"
                                      withParticles={false}
                                      onClick={() => {
                                        setPendingTopic(topic);
                                        setPendingLesson(null);
                                        setPendingGame(null);
                                        setPermissionError(null);
                                        setLockModalOpen(true);
                                      }}
                                    >
                                      <span className="uppercase">Kod kiritish</span>
                                    </SparkleButton>
                                  </div>
                                ) : (
                                  <SparkleButton
                                    variant="primary"
                                    size="sm"
                                    showSparkle
                                    withParticles
                                    onClick={() => handleOpenTopic(topic)}
                                  >
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span className="uppercase">Ochish</span>
                                  </SparkleButton>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ==================== 3. O'YINLAR VA OMAD G'ILDIRAGI BO'LIMI ==================== */}
              {section === 'oyinlar' && (
                <div className="space-y-6">
                  {activeCatalogGame && hasTopicAccess(activeCatalogGame.topicId) ? (
                    <GameArena
                      key={activeCatalogGame.id}
                      game={activeCatalogGame}
                      onClose={() => setActiveCatalogGame(null)}
                      onComplete={handleGameComplete}
                    />
                  ) : (
                    <>
                      <Suspense fallback={<SectionSpinner />}>
                        <FortuneWheel
                          games={games}
                          isUnlocked={
                            isUnlocked || Object.values(topicPermissions).includes('approved')
                          }
                          onSelectGame={handleOpenCatalogGame}
                        />
                      </Suspense>

                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
                        <div>
                          <div className="font-mono-tech text-[11px] uppercase tracking-wider text-[var(--accent)]">
                            INTERAKTIV O‘YINLAR KATALOGI
                          </div>
                          <h2 className="mt-1 text-2xl font-medium">
                            5–11-sinf Mavzulariga Mos {games.length} ta O‘yin
                          </h2>
                          <p className="mt-1 text-sm text-[var(--dim)]">
                            Har bir o‘yin yillik rejadagi aniq mavzular (arqon tortish PvP, labirint, piksel,
                            Excel formula, Query, shifrlash, tarmoq, HTML/JS, Gantt) asosida ishlab chiqilgan.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          <SparkleButton
                            variant={gamesGradeFilter === 'all' && !pvpOnlyFilter ? 'active' : 'secondary'}
                            size="sm"
                            showSparkle={gamesGradeFilter === 'all' && !pvpOnlyFilter}
                            withParticles={gamesGradeFilter === 'all' && !pvpOnlyFilter}
                            onClick={() => {
                              setGamesGradeFilter('all');
                              setPvpOnlyFilter(false);
                            }}
                          >
                            <span className="uppercase">Barchasi ({games.length})</span>
                          </SparkleButton>
                          <SparkleButton
                            variant={pvpOnlyFilter ? 'emerald' : 'secondary'}
                            size="sm"
                            showSparkle={pvpOnlyFilter}
                            withParticles={pvpOnlyFilter}
                            onClick={() => setPvpOnlyFilter((v) => !v)}
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span className="uppercase">
                              2 Kishi PvP ({games.filter((g) => supportsPvpEngine(g.engine)).length})
                            </span>
                          </SparkleButton>
                          {grades.map((g) => {
                            const active = gamesGradeFilter === g.grade;
                            return (
                              <SparkleButton
                                key={g.grade}
                                variant={active ? 'active' : 'secondary'}
                                size="sm"
                                showSparkle={active}
                                withParticles={active}
                                onClick={() => setGamesGradeFilter(g.grade)}
                              >
                                <span className="uppercase">{g.grade}-sinf</span>
                              </SparkleButton>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredGames.map((g) => {
                          const best = completedGames[g.id];
                          const hasPvp = supportsPvpEngine(g.engine);
                          const gameOpen = hasTopicAccess(g.topicId);
                          return (
                            <div
                              key={g.id}
                              className="perf-card flex flex-col justify-between rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-4 transition-colors hover:border-[#6366f1]/60"
                            >
                              <div>
                                <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono-tech text-[10px] uppercase tracking-wider text-[var(--dim)]">
                                  <span>
                                    #{g.id} · {g.grade}-SINF · {g.engine}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {hasPvp && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-[#2563eb]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#2563eb]">
                                        <Users className="h-2.5 w-2.5" />
                                        2 KISHI PvP
                                      </span>
                                    )}
                                    {best !== undefined ? (
                                      <span className="text-emerald-500">{best} BALL</span>
                                    ) : !gameOpen ? (
                                      <Lock className="h-3 w-3 text-[var(--accent)]" />
                                    ) : null}
                                  </div>
                                </div>
                                <h3 className="mt-1.5 text-base font-medium">
                                  {gameOpen ? g.title : `O‘yin #${g.id} (${g.grade}-sinf · Qulflangan)`}
                                </h3>
                                <p className="mt-1 text-sm text-[var(--dim)]">
                                  {gameOpen
                                    ? g.idea
                                    : 'Bu o‘yinni ochish uchun tegishli mavzu ruxsati kerak.'}
                                </p>
                              </div>

                              <div className="mt-4">
                                {gameOpen ? (
                                  <SparkleButton
                                    variant="primary"
                                    size="sm"
                                    fullWidth
                                    showSparkle
                                    withParticles={false}
                                    onClick={() => handleOpenCatalogGame(g)}
                                  >
                                    <Play className="h-3.5 w-3.5" />
                                    <span className="uppercase">O‘ynash</span>
                                  </SparkleButton>
                                ) : (
                                  <SparkleButton
                                    variant="secondary"
                                    size="sm"
                                    fullWidth
                                    showSparkle={topicPermissions[g.topicId] !== 'pending'}
                                    withParticles={false}
                                    disabled={topicPermissions[g.topicId] === 'pending' || permissionBusy}
                                    onClick={() => handleRequestPermission(g.topicId)}
                                  >
                                    {topicPermissions[g.topicId] === 'pending' ? (
                                      <Clock className="h-3.5 w-3.5" />
                                    ) : (
                                      <Lock className="h-3.5 w-3.5" />
                                    )}
                                    <span className="uppercase">
                                      {topicPermissions[g.topicId] === 'pending'
                                        ? 'So‘rov yuborilgan'
                                        : 'Ruxsat so‘rash'}
                                    </span>
                                  </SparkleButton>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ==================== 4. NATIJALAR (PROGRESS DASHBOARD) ==================== */}
              {section === 'natijalar' && (
                <ProgressDashboard
                  user={user}
                  grades={grades}
                  localCompletedGames={completedGames}
                  totalGames={games.length || 59}
                  onOpenAuth={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  onOpenTopicSlug={(slug, grade) => {
                    setSelectedGrade(grade as GradeId);
                    if (!hasTopicAccess(slug)) {
                      const target = topics.find((t) => t.slug === slug) || null;
                      setPendingTopic(target);
                      setLockModalOpen(true);
                      return;
                    }
                    setActiveLessonSlug(null);
                    setActiveTopicSlug(slug);
                    setSection('sinflar');
                  }}
                  onOpenLessonSlug={(slug, grade) => {
                    setSelectedGrade(grade as GradeId);
                    const target = lessons.find((l) => l.slug === slug) || null;
                    if (!hasTopicAccess(target?.topic_slug)) {
                      setPendingLesson(target);
                      setLockModalOpen(true);
                      return;
                    }
                    setActiveTopicSlug(null);
                    setActiveLessonSlug(slug);
                    setSection('sinflar');
                  }}
                />
              )}

              {/* ==================== 5. YILLIK REJA (PDF) ==================== */}
              {section === 'reja' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
                    <div>
                      <div className="font-mono-tech text-[11px] uppercase tracking-wider text-[var(--accent)]">
                        2026–2027 O‘QUV YILI · RASMIY ISH REJA XULOSASI
                      </div>
                      <h2 className="mt-1 text-2xl font-medium">
                        Informatika 5–11-sinflar Yillik Taqvimiy Rejasi
                      </h2>
                      <p className="mt-1 text-sm text-[var(--dim)]">
                        Yuklangan PDF hujjat asosida tuzilgan {topics.length || 56} ta bo‘lim, {lessons.length || 340} ta dars va soatlar taqsimoti.
                      </p>
                    </div>
                    <SparkleAnchor
                      href="/assets/aistudio/Informatika_5-11-sinf_yillik_reja_2026-2027_0364fcd5.pdf"
                      target="_blank"
                      rel="noreferrer"
                      variant="primary"
                      size="md"
                      showSparkle
                      withParticles
                    >
                      <span className="uppercase">PDF Hujjatni Ochish ↗</span>
                    </SparkleAnchor>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[var(--grid)] bg-[var(--surface)]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#0f172a] font-mono-tech text-xs uppercase text-[#f8fafc]">
                        <tr>
                          <th className="px-4 py-3">Sinf</th>
                          <th className="px-4 py-3">Haftalik / Yillik soat</th>
                          <th className="px-4 py-3">Dars va Bo‘limlar</th>
                          <th className="px-4 py-3">Asosiy yo‘nalishlar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g) => (
                          <tr key={g.grade} className="border-t border-[var(--grid)] even:bg-[var(--bg)]">
                            <td className="whitespace-nowrap px-4 py-3 font-medium">{g.title}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono-tech text-xs">
                              {g.weekly_hours} soat/hafta · {g.total_hours} soat
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono-tech text-xs">
                              {g.lesson_count || g.total_hours} ta dars · {g.unit_count} bo‘lim
                            </td>
                            <td className="px-4 py-3 text-[var(--dim)]">
                              {isUnlocked
                                ? g.focus_areas.join(' · ')
                                : 'Mavzular tafsilotini ko‘rish uchun qulfni oching'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== 6. ADMIN PANEL ==================== */}
              {section === 'admin' && (
                <AdminPanel
                  user={user}
                  grades={grades}
                  topics={topics}
                  onOpenAuth={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  onDataUpdated={loadCurriculumData}
                />
              )}
            </Suspense>
          )}
        </main>
      )}

      {/* Lock Modal */}
      {lockModalOpen && (
        <Suspense fallback={null}>
          <LockModal
            isOpen={lockModalOpen}
            onClose={() => {
              setLockModalOpen(false);
              setPendingLesson(null);
              setPendingTopic(null);
              setPendingGame(null);
              setPermissionError(null);
            }}
            onUnlockSuccess={handleUnlockSuccess}
            targetTitle={
              pendingLesson
                ? `${pendingLesson.grade_num}-sinf · ${pendingLesson.dars}`
                : pendingTopic
                ? `${pendingTopic.grade_num}-sinf · ${pendingTopic.order}-bo‘lim`
                : pendingGame
                ? `${pendingGame.grade}-sinf · O‘yin #${pendingGame.id}`
                : undefined
            }
            topicSlug={
              pendingTopic?.slug || pendingLesson?.topic_slug || pendingGame?.topicId || null
            }
            permissionStatus={
              (pendingTopic?.slug || pendingLesson?.topic_slug || pendingGame?.topicId
                ? topicPermissions[
                    (pendingTopic?.slug || pendingLesson?.topic_slug || pendingGame?.topicId) as string
                  ]
                : null) ||
              pendingTopic?.permission_status ||
              pendingLesson?.permission_status ||
              null
            }
            isLoggedIn={Boolean(user)}
            requesting={permissionBusy}
            permissionError={permissionError}
            onRequestPermission={handleRequestPermission}
            onRequireLogin={() => {
              setAuthMode('register');
              setLockModalOpen(false);
              setAuthModalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={authModalOpen}
            initialMode={authMode}
            onClose={() => setAuthModalOpen(false)}
            onAuthSuccess={(u) => {
              setUser(u);
              if (u.curriculum_unlocked) setIsUnlocked(true);
              loadCurriculumData();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
