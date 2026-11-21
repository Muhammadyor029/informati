import React, { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Loader2,
  LogIn,
  Plus,
  Presentation,
  ShieldAlert,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { GradeId } from '../data/types';
import {
  api,
  ApiError,
  ApiGrade,
  ApiMediaAsset,
  ApiRegisteredUser,
  ApiSlide,
  ApiTopicPermission,
  ApiTopicProgress,
  ApiTopicSummary,
  ApiUser,
} from '../lib/api';
import { SparkleButton, SparkleLabel } from './SparkleButton';

interface AdminPanelProps {
  user: ApiUser | null;
  grades: ApiGrade[];
  topics: ApiTopicSummary[];
  onOpenAuth: () => void;
  onDataUpdated: () => void;
}

type AdminTab = 'topics' | 'slides' | 'media' | 'requests' | 'users' | 'students';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  user,
  grades,
  topics,
  onOpenAuth,
  onDataUpdated,
}) => {
  const isEducator = Boolean(user && (user.role === 'admin' || user.role === 'teacher'));
  const [tab, setTab] = useState<AdminTab>('topics');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // New Topic form
  const [topicGrade, setTopicGrade] = useState<GradeId>(5);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicTerm, setTopicTerm] = useState('I chorak');
  const [topicRange, setTopicRange] = useState('1–4-dars');
  const [topicHours, setTopicHours] = useState(4);
  const [topicDesc, setTopicDesc] = useState('');
  const [savingTopic, setSavingTopic] = useState(false);

  // Slide Manager
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [slides, setSlides] = useState<ApiSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [slideLayout, setSlideLayout] = useState<ApiSlide['layout']>('concepts');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideBullets, setSlideBullets] = useState('');
  const [slideImageId, setSlideImageId] = useState<number | ''>('');
  const [savingSlide, setSavingSlide] = useState(false);

  // Original-quality Media Store
  const [mediaList, setMediaList] = useState<ApiMediaAsset[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Student Progress Overview
  const [studentRecords, setStudentRecords] = useState<ApiTopicProgress[]>([]);
  const [overviewMeta, setOverviewMeta] = useState({ total_students: 0, total_attempts: 0 });
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [permissionRequests, setPermissionRequests] = useState<ApiTopicPermission[]>([]);
  const [permissionTotal, setPermissionTotal] = useState(0);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [registeredUsers, setRegisteredUsers] = useState<ApiRegisteredUser[]>([]);
  const [registeredTotal, setRegisteredTotal] = useState(0);
  const [loadingRegisteredUsers, setLoadingRegisteredUsers] = useState(false);

  useEffect(() => {
    if (!selectedSlug && topics.length > 0) {
      setSelectedSlug(topics[0].slug);
    }
  }, [topics, selectedSlug]);

  useEffect(() => {
    if (!isEducator) return;
    api
      .getMediaList()
      .then(setMediaList)
      .catch(() => {});
  }, [isEducator]);

  useEffect(() => {
    if (!isEducator || !selectedSlug || tab !== 'slides') return;
    setLoadingSlides(true);
    api
      .getPresentation(selectedSlug)
      .then((p) => setSlides(p.slides))
      .catch(() => setSlides([]))
      .finally(() => setLoadingSlides(false));
  }, [isEducator, selectedSlug, tab]);

  useEffect(() => {
    if (!isEducator || tab !== 'students') return;
    setLoadingStudents(true);
    api
      .getAdminProgressOverview()
      .then((res) => {
        setStudentRecords(res.records);
        setOverviewMeta({
          total_students: res.total_students,
          total_attempts: res.total_attempts,
        });
      })
      .catch((err) => setErrMsg(err instanceof ApiError ? err.message : 'Xatolik.'))
      .finally(() => setLoadingStudents(false));
  }, [isEducator, tab]);

  useEffect(() => {
    if (!isEducator) return;
    setLoadingPermissions(tab === 'requests');
    api
      .getTopicPermissionRequests()
      .then((res) => {
        setPermissionRequests(res.records);
        setPermissionTotal(res.total_count);
      })
      .catch((err) => {
        if (tab === 'requests') {
          setErrMsg(err instanceof ApiError ? err.message : 'So‘rovlarni yuklashda xatolik.');
        }
      })
      .finally(() => setLoadingPermissions(false));
  }, [isEducator, tab]);

  useEffect(() => {
    if (!isEducator || tab !== 'users') return;
    setLoadingRegisteredUsers(true);
    api
      .getRegisteredUsers()
      .then((res) => {
        setRegisteredUsers(res.users);
        setRegisteredTotal(res.total);
      })
      .catch((err) => setErrMsg(err instanceof ApiError ? err.message : 'Foydalanuvchilarni yuklashda xatolik.'))
      .finally(() => setLoadingRegisteredUsers(false));
  }, [isEducator, tab]);

  if (!isEducator) {
    return (
      <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-8 text-center">
        <ShieldAlert className="mx-auto h-9 w-9 text-[var(--accent)]" />
        <h2 className="mt-3 text-xl font-medium">O‘qituvchi / Administrator Paneli</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--dim)]">
          Dars bo‘limlarini tahrirlash, taqdimot slaydlarini qo‘shish, original sifatdagi rasmlarni yuklash va o‘quvchilar natijalarini kuzatish uchun o‘qituvchi yoki admin hisobi bilan tizimga kiring.
        </p>
        {!user && (
          <div className="mt-5">
            <SparkleButton
              variant="primary"
              size="md"
              showSparkle
              withParticles
              onClick={onOpenAuth}
            >
              <LogIn className="h-4 w-4 text-[#c4b5fd]" />
              <span className="uppercase">Tizimga kirish</span>
            </SparkleButton>
          </div>
        )}
      </div>
    );
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;
    setSavingTopic(true);
    setErrMsg(null);
    setStatusMsg(null);
    try {
      await api.createTopic({
        grade_num: topicGrade,
        title: topicTitle.trim(),
        term: topicTerm.trim(),
        lesson_range: topicRange.trim(),
        total_hours: topicHours,
        short_desc: topicDesc.trim() || topicTitle.trim(),
      });
      setTopicTitle('');
      setTopicDesc('');
      setStatusMsg('Yangi o‘quv bo‘limi va boshlang‘ich taqdimot muvaffaqiyatli yaratildi.');
      onDataUpdated();
    } catch (err) {
      setErrMsg(err instanceof ApiError ? err.message : 'Saqlashda xatolik.');
    } finally {
      setSavingTopic(false);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug || !slideTitle.trim()) return;
    setSavingSlide(true);
    setErrMsg(null);
    setStatusMsg(null);
    try {
      const created = await api.addSlide(selectedSlug, {
        layout: slideLayout,
        title: slideTitle.trim(),
        subtitle: slideSubtitle.trim(),
        bullet_points: slideBullets
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        image: slideImageId === '' ? null : Number(slideImageId),
      });
      setSlides((prev) => [...prev, created]);
      setSlideTitle('');
      setSlideSubtitle('');
      setSlideBullets('');
      setSlideImageId('');
      setStatusMsg('Taqdimot slaydi qo‘shildi.');
    } catch (err) {
      setErrMsg(err instanceof ApiError ? err.message : 'Slayd qo‘shishda xatolik.');
    } finally {
      setSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (id: number) => {
    setErrMsg(null);
    try {
      await api.deleteSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      setStatusMsg('Slayd o‘chirildi.');
    } catch (err) {
      setErrMsg(err instanceof ApiError ? err.message : 'O‘chirishda xatolik.');
    }
  };

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrMsg(null);
    setStatusMsg(null);
    try {
      const asset = await api.uploadMedia(file, uploadTitle.trim() || file.name);
      setMediaList((prev) => [asset, ...prev]);
      setUploadTitle('');
      setStatusMsg(
        `Original rasm yuklandi (${(asset.file_size / 1024).toFixed(1)} KB, siqilmasdan saqlandi).`
      );
    } catch (err) {
      setErrMsg(err instanceof ApiError ? err.message : 'Rasm yuklashda xatolik.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleApprovePermission = async (id: number) => {
    setApprovingId(id);
    setErrMsg(null);
    setStatusMsg(null);
    try {
      const updated = await api.approveTopicPermission(id);
      setPermissionRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setStatusMsg(`${updated.username} uchun “${updated.topic_title}” mavzusi ochildi.`);
      onDataUpdated();
    } catch (err) {
      setErrMsg(err instanceof ApiError ? err.message : 'Tasdiqlashda xatolik.');
    } finally {
      setApprovingId(null);
    }
  };

  const pendingPermissionCount = permissionRequests.filter((r) => r.status === 'pending').length;

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'topics', label: 'Sinf va Mavzular', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'slides', label: 'Taqdimot Slaydlari', icon: <Presentation className="h-3.5 w-3.5" /> },
    { id: 'media', label: 'Original Rasmlar', icon: <ImageIcon className="h-3.5 w-3.5" /> },
    {
      id: 'requests',
      label: `Ruxsat so‘rovlari${pendingPermissionCount ? ` · ${pendingPermissionCount}` : ''}`,
      icon: <Bell className="h-3.5 w-3.5" />,
    },
    { id: 'users', label: 'Foydalanuvchilar', icon: <Users className="h-3.5 w-3.5" /> },
    { id: 'students', label: 'O‘quvchi Natijalari', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
        <div>
          <div className="font-mono-tech text-[11px] uppercase tracking-wider text-[var(--accent)]">
            BOSHQARUV TIZIMI · {user?.role.toUpperCase()}
          </div>
          <h2 className="mt-1 text-2xl font-medium">Ta’lim Kontenti va Media Boshqaruvi</h2>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Sinflar, dars bo‘limlari, interaktiv slaydlar va siqilmagan original rasmlarni boshqaring.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <SparkleButton
                key={t.id}
                variant={active ? 'active' : 'secondary'}
                size="sm"
                showSparkle={active}
                withParticles={false}
                onClick={() => {
                  setTab(t.id);
                  setStatusMsg(null);
                  setErrMsg(null);
                }}
              >
                {t.icon}
                <span className="uppercase">{t.label}</span>
              </SparkleButton>
            );
          })}
        </div>
      </div>

      {statusMsg && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
          {statusMsg}
        </div>
      )}
      {errMsg && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {errMsg}
        </div>
      )}

      {tab === 'topics' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleCreateTopic}
            className="space-y-3.5 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5 lg:col-span-5"
          >
            <div className="flex items-center gap-2 font-mono-tech text-xs uppercase text-[var(--accent)]">
              <Plus className="h-4 w-4" />
              <span>Yangi O‘quv Bo‘limi Qo‘shish</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Sinf
                </label>
                <select
                  value={topicGrade}
                  onChange={(e) => setTopicGrade(Number(e.target.value) as GradeId)}
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
                >
                  {grades.map((g) => (
                    <option key={g.grade} value={g.grade}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Chorak
                </label>
                <input
                  type="text"
                  value={topicTerm}
                  onChange={(e) => setTopicTerm(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                Bo‘lim nomi
              </label>
              <input
                type="text"
                required
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="Masalan: Sun’iy intellekt asoslari"
                className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Dars oralig‘i
                </label>
                <input
                  type="text"
                  value={topicRange}
                  onChange={(e) => setTopicRange(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Soatlar soni
                </label>
                <input
                  type="number"
                  min={1}
                  max={68}
                  value={topicHours}
                  onChange={(e) => setTopicHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                Qisqa tavsif
              </label>
              <textarea
                rows={3}
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>

            <SparkleButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              showSparkle
              withParticles
              disabled={savingTopic}
            >
              {savingTopic && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span className="uppercase">Bo‘limni saqlash</span>
            </SparkleButton>
          </form>

          <div className="overflow-hidden rounded-2xl border border-[var(--grid)] bg-[var(--surface)] lg:col-span-7">
            <div className="border-b border-[var(--grid)] px-5 py-3.5 font-mono-tech text-xs uppercase text-[var(--dim)]">
              Mavjud bo‘limlar ({topics.length} ta)
            </div>
            <div className="max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[var(--bg)] font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                  <tr>
                    <th className="px-4 py-2.5">Sinf</th>
                    <th className="px-4 py-2.5">Bo‘lim</th>
                    <th className="px-4 py-2.5">Darslar</th>
                    <th className="px-4 py-2.5">Soat</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((t) => (
                    <tr key={t.slug} className="border-t border-[var(--grid)]">
                      <td className="px-4 py-2.5 font-mono-tech text-xs">{t.grade_num}-sinf</td>
                      <td className="px-4 py-2.5 font-medium">{t.title}</td>
                      <td className="px-4 py-2.5 font-mono-tech text-xs">{t.lesson_count} ta</td>
                      <td className="px-4 py-2.5 font-mono-tech text-xs">{t.total_hours} s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'slides' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleAddSlide}
            className="space-y-3.5 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5 lg:col-span-5"
          >
            <div className="font-mono-tech text-xs uppercase text-[var(--accent)]">
              Taqdimotga Slayd Qo‘shish
            </div>

            <div>
              <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                Bo‘limni tanlang
              </label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
              >
                {topics.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.grade_num}-sinf · {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Maket turi
                </label>
                <select
                  value={slideLayout}
                  onChange={(e) => setSlideLayout(e.target.value as ApiSlide['layout'])}
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
                >
                  <option value="cover">Cover</option>
                  <option value="concepts">Concepts</option>
                  <option value="diagram">Diagram / Rasm</option>
                  <option value="plan">Dars rejasi</option>
                  <option value="practice">Amaliy misol</option>
                  <option value="summary">Xulosa</option>
                </select>
              </div>
              <div>
                <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                  Rasm (ixtiyoriy)
                </label>
                <select
                  value={slideImageId}
                  onChange={(e) =>
                    setSlideImageId(e.target.value ? Number(e.target.value) : '')
                  }
                  className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
                >
                  <option value="">Rasmsiz</option>
                  {mediaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.id} · {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                Slayd sarlavhasi
              </label>
              <input
                type="text"
                required
                value={slideTitle}
                onChange={(e) => setSlideTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                Qisqa taglavha
              </label>
              <input
                type="text"
                value={slideSubtitle}
                onChange={(e) => setSlideSubtitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                Bandlar (har bir qatorda 1 ta)
              </label>
              <textarea
                rows={4}
                value={slideBullets}
                onChange={(e) => setSlideBullets(e.target.value)}
                placeholder="1-band&#10;2-band&#10;3-band"
                className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </div>

            <SparkleButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              showSparkle
              withParticles
              disabled={savingSlide}
            >
              {savingSlide && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span className="uppercase">Slaydni qo‘shish</span>
            </SparkleButton>
          </form>

          <div className="space-y-3 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5 lg:col-span-7">
            <div className="font-mono-tech text-xs uppercase text-[var(--dim)]">
              Bo‘lim slaydlari ({slides.length} ta)
            </div>
            {loadingSlides ? (
              <div className="flex items-center gap-2 py-8 text-sm text-[var(--dim)]">
                <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...
              </div>
            ) : (
              <div className="space-y-2.5">
                {slides.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-3.5"
                  >
                    <div>
                      <div className="font-mono-tech text-[10px] uppercase text-[var(--accent)]">
                        #{s.order} · {s.layout}
                      </div>
                      <div className="mt-0.5 font-medium">{s.title}</div>
                      {s.subtitle && <div className="text-xs text-[var(--dim)]">{s.subtitle}</div>}
                    </div>
                    <SparkleButton
                      variant="secondary"
                      size="xs"
                      withParticles={false}
                      onClick={() => handleDeleteSlide(s.id)}
                      className="sparkle-icon-only"
                      title="Slaydni o‘chirish"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </SparkleButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'media' && (
        <div className="space-y-5 rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[240px] flex-1">
              <label className="font-mono-tech block text-[11px] uppercase text-[var(--dim)]">
                Rasm nomi (ixtiyoriy)
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Masalan: Tarmoq topologiyasi sxemasi"
                className="mt-1 w-full rounded-xl border border-[var(--grid)] bg-[var(--bg)] px-3.5 py-2 text-sm"
              />
            </div>

            <SparkleLabel
              variant="primary"
              size="md"
              showSparkle
              withParticles
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#c4b5fd]" />
              ) : (
                <Upload className="h-4 w-4 text-[#c4b5fd]" />
              )}
              <span className="uppercase">
                {uploading ? 'Yuklanmoqda...' : 'Original rasm yuklash (PNG/JPG/WEBP)'}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleUploadMedia}
                disabled={uploading}
                className="hidden"
              />
            </SparkleLabel>
          </div>

          <p className="font-mono-tech text-[11px] text-[var(--dim)]">
            Yuklangan fayllar serverda qayta kodlanmasdan va siqilmasdan asl o‘lchamida saqlanadi (15 MB gacha).
          </p>

          {mediaList.length === 0 ? (
            <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-8 text-center text-sm text-[var(--dim)]">
              Hali yuklangan rasmlar yo‘q. Yuqoridagi tugma orqali slaydlar uchun diagramma yoki surat yuklang.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  className="overflow-hidden rounded-xl border border-[var(--grid)] bg-[var(--bg)]"
                >
                  <img
                    src={m.url}
                    alt={m.title}
                    className="h-44 w-full bg-[var(--surface)] object-contain p-2"
                  />
                  <div className="border-t border-[var(--grid)] p-3">
                    <div className="truncate text-sm font-medium">{m.title}</div>
                    <div className="font-mono-tech mt-1 text-[11px] text-[var(--dim)]">
                      #{m.id} · {(m.file_size / 1024).toFixed(1)} KB
                      {m.width && m.height ? ` · ${m.width}×${m.height}px` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'requests' && (
        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono-tech text-xs uppercase text-[var(--dim)]">
              Kutilayotgan: {pendingPermissionCount} · Jami so‘rovlar: {permissionTotal}
            </div>
            <SparkleButton
              variant="secondary"
              size="xs"
              withParticles={false}
              onClick={() => {
                setLoadingPermissions(true);
                api
                  .getTopicPermissionRequests()
                  .then((res) => {
                    setPermissionRequests(res.records);
                    setPermissionTotal(res.total_count);
                  })
                  .catch((err) =>
                    setErrMsg(err instanceof ApiError ? err.message : 'Yangilashda xatolik.')
                  )
                  .finally(() => setLoadingPermissions(false));
              }}
            >
              Yangilash
            </SparkleButton>
          </div>

          {loadingPermissions ? (
            <div className="flex items-center gap-2 py-8 text-sm text-[var(--dim)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...
            </div>
          ) : permissionRequests.length === 0 ? (
            <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-8 text-center text-sm text-[var(--dim)]">
              Hali ruxsat so‘rovi yo‘q.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--grid)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg)] font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                  <tr>
                    <th className="px-4 py-2.5">O‘quvchi</th>
                    <th className="px-4 py-2.5">Mavzu</th>
                    <th className="px-4 py-2.5">Vaqt</th>
                    <th className="px-4 py-2.5">Holat</th>
                    <th className="px-4 py-2.5">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionRequests.map((r) => (
                    <tr key={r.id} className="border-t border-[var(--grid)]">
                      <td className="px-4 py-2.5">
                        <div className="font-medium">{r.full_name || r.username}</div>
                        <div className="font-mono-tech text-[11px] text-[var(--dim)]">
                          @{r.username} · {r.grade_num}-sinf
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div>{r.topic_title}</div>
                        <div className="font-mono-tech text-[11px] text-[var(--dim)]">
                          {r.topic_slug}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono-tech text-[11px] text-[var(--dim)]">
                        {new Date(r.created_at).toLocaleString('uz-UZ')}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-1 font-mono-tech text-[11px] uppercase text-amber-500">
                            <Clock className="h-3 w-3" /> Kutilmoqda
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-1 font-mono-tech text-[11px] uppercase text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" /> Tasdiqlangan
                            {r.reviewed_by ? ` · ${r.reviewed_by}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.status === 'pending' ? (
                          <SparkleButton
                            variant="emerald"
                            size="xs"
                            showSparkle
                            withParticles={false}
                            disabled={approvingId === r.id}
                            onClick={() => handleApprovePermission(r.id)}
                          >
                            {approvingId === r.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            <span className="uppercase">Tasdiqlash</span>
                          </SparkleButton>
                        ) : (
                          <span className="font-mono-tech text-[11px] text-[var(--dim)]">
                            {new Date(r.updated_at).toLocaleString('uz-UZ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
          <div className="mb-4 font-mono-tech text-xs uppercase text-[var(--dim)]">
            Jami ro‘yxatdan o‘tganlar: {registeredTotal}
          </div>
          {loadingRegisteredUsers ? (
            <div className="flex items-center gap-2 py-8 text-sm text-[var(--dim)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...
            </div>
          ) : registeredUsers.length === 0 ? (
            <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-8 text-center text-sm text-[var(--dim)]">
              Hali foydalanuvchilar yo‘q.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--grid)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg)] font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                  <tr>
                    <th className="px-4 py-2.5">Foydalanuvchi</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Sinf</th>
                    <th className="px-4 py-2.5">Rol</th>
                    <th className="px-4 py-2.5">Ochilgan mavzular</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-[var(--grid)]">
                      <td className="px-4 py-2.5">
                        <div className="font-medium">
                          {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username}
                        </div>
                        <div className="font-mono-tech text-[11px] text-[var(--dim)]">@{u.username}</div>
                      </td>
                      <td className="px-4 py-2.5 font-mono-tech text-[11px] text-[var(--dim)]">
                        {u.email || '—'}
                      </td>
                      <td className="px-4 py-2.5">{u.grade_level}-sinf</td>
                      <td className="px-4 py-2.5 font-mono-tech text-[11px] uppercase">
                        {u.role}
                        {u.curriculum_unlocked ? ' · ochilgan' : ''}
                      </td>
                      <td className="px-4 py-2.5 font-mono-tech text-xs">{u.approved_topics} ta</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'students' && (
        <div className="rounded-2xl border border-[var(--grid)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono-tech text-xs uppercase text-[var(--dim)]">
              Ro‘yxatdan o‘tgan o‘quvchilar: {overviewMeta.total_students} · Test urinishlari:{' '}
              {overviewMeta.total_attempts}
            </div>
          </div>

          {loadingStudents ? (
            <div className="flex items-center gap-2 py-8 text-sm text-[var(--dim)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...
            </div>
          ) : studentRecords.length === 0 ? (
            <div className="rounded-xl border border-[var(--grid)] bg-[var(--bg)] p-8 text-center text-sm text-[var(--dim)]">
              Hali o‘quvchi natijalari qayd etilmagan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--grid)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg)] font-mono-tech text-[11px] uppercase text-[var(--dim)]">
                  <tr>
                    <th className="px-4 py-2.5">O‘quvchi</th>
                    <th className="px-4 py-2.5">Sinf · Bo‘lim</th>
                    <th className="px-4 py-2.5">Taqdimot</th>
                    <th className="px-4 py-2.5">Test</th>
                    <th className="px-4 py-2.5">Amaliyot</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecords.map((r) => (
                    <tr key={r.id} className="border-t border-[var(--grid)]">
                      <td className="px-4 py-2.5 font-mono-tech text-xs font-medium">
                        {r.username}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.grade_num}-sinf · {r.topic_title}
                      </td>
                      <td className="px-4 py-2.5 font-mono-tech text-xs">
                        {r.presentation_viewed ? 'Ko‘rilgan' : '—'}
                      </td>
                      <td className="px-4 py-2.5 font-mono-tech text-xs">
                        {r.best_test_score} / {r.tests_total}
                      </td>
                      <td className="px-4 py-2.5 font-mono-tech text-xs">
                        {r.solved_practices?.length || 0} / {r.lesson_slug ? 3 : 6}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
