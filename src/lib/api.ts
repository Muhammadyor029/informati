import { GameDef, GameEngine, GradeId, MiniAnimType } from '../data/types';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher' | 'admin';
  grade_level: number;
  curriculum_unlocked: boolean;
}

export interface ApiGrade {
  id: number;
  grade: GradeId;
  title: string;
  weekly_hours: number;
  total_hours: number;
  summary: string;
  focus_areas: string[];
  unit_count: number;
  lesson_count?: number;
}

export type LessonType = 'regular' | 'practical' | 'project' | 'assessment' | 'revision';

export interface ApiLessonSummary {
  id: number;
  slug: string;
  grade_num: GradeId;
  topic_slug: string;
  topic_title: string;
  lesson_number: number;
  order: number;
  dars: string;
  title: string;
  term: string;
  lesson_type: LessonType;
  hours: number;
  note: string;
  game_ids: number[];
  test_count?: number;
  practice_count?: number;
}

export interface ApiVisualDiagram {
  type: MiniAnimType | string;
  caption: string;
  nodes: string[];
}

export interface ApiLessonDetail extends ApiLessonSummary {
  content: {
    objectives: string[];
    explanation: string[];
    practical_examples: string[];
    key_terms: Array<{ term: string; meaning: string }>;
    summary_text: string;
    anim_type: MiniAnimType;
    anim_title: string;
    anim_subtitle: string;
    visual_diagram: ApiVisualDiagram;
  };
  practices: ApiPracticeTask[];
  prev_lesson?: { slug: string; dars: string; title: string } | null;
  next_lesson?: { slug: string; dars: string; title: string } | null;
}

export interface ApiCurriculumAudit {
  total_lessons: number;
  per_grade: Record<string, number>;
  lessons_with_5_tests: number;
  lessons_with_presentations: number;
  total_units: number;
  total_games: number;
  source_discrepancies: Array<{ grade: number | string; lesson: number | string; issue: string }>;
}

export interface ApiTopicSummary {
  id: number;
  slug: string;
  grade_num: GradeId;
  order: number;
  term: string;
  lesson_range: string;
  total_hours: number;
  title: string;
  short_desc: string;
  anim_type: MiniAnimType;
  game_ids: number[];
  lesson_count: number;
  test_count?: number;
  practice_count?: number;
}

export interface ApiLessonRow {
  id: number;
  order: number;
  dars: string;
  title: string;
  hours: number;
  note: string;
}

export interface ApiKeyConcept {
  id: number;
  term: string;
  meaning: string;
}

export interface ApiPracticeTask {
  id: number;
  code: string;
  order: number;
  title: string;
  instruction: string;
  placeholder: string;
  expected_keywords: string[];
  sample_answer: string;
  hint: string;
}

export interface ApiTopicDetail {
  id: number;
  slug: string;
  grade_num: GradeId;
  order: number;
  term: string;
  lesson_range: string;
  total_hours: number;
  title: string;
  short_desc: string;
  objectives: string[];
  detailed_explanation: string[];
  real_world_examples: string[];
  summary_text: string;
  anim_type: MiniAnimType;
  anim_title: string;
  anim_subtitle: string;
  game_ids: number[];
  lessons: ApiLessonRow[];
  key_concepts: ApiKeyConcept[];
  practices: ApiPracticeTask[];
}

export interface ApiMediaAsset {
  id: number;
  title: string;
  file: string;
  url: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface ApiSlide {
  id: number;
  order: number;
  layout: 'cover' | 'concepts' | 'diagram' | 'plan' | 'practice' | 'summary';
  title: string;
  subtitle: string;
  bullet_points: string[];
  image: number | null;
  image_asset: ApiMediaAsset | null;
  speaker_notes: string;
}

export interface ApiPresentation {
  id: number;
  topic_slug: string;
  title: string;
  description: string;
  updated_at: string;
  slides: ApiSlide[];
}

export interface ApiPublicTestQuestion {
  id: number;
  code: string;
  order: number;
  question: string;
  options: [string, string, string, string];
  correct_index?: number;
  explanation?: string;
}

export interface ApiTestResultItem {
  code: string;
  picked: number | null;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
}

export interface ApiTestSubmitResponse {
  lesson_slug?: string | null;
  topic_slug: string;
  score: number;
  total: number;
  results: ApiTestResultItem[];
}

export interface ApiTopicProgress {
  id: number;
  username: string;
  lesson_slug?: string | null;
  lesson_title?: string | null;
  topic_slug: string;
  topic_title: string;
  grade_num: GradeId;
  presentation_viewed: boolean;
  lesson_completed: boolean;
  best_test_score: number;
  tests_total: number;
  solved_practices: string[];
  updated_at: string;
}

export interface ApiMyProgressResponse {
  topics: ApiTopicProgress[];
  lessons?: ApiTopicProgress[];
  game_scores: Record<string, number>;
  total_units: number;
  total_lessons?: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function requestJson<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  if (init.headers) {
    Object.assign(headers, init.headers as Record<string, string>);
  }

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data && typeof data.detail === 'string' && data.detail) ||
      (data &&
        Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
          .join(' · ')) ||
      `Server xatosi (${res.status})`;
    throw new ApiError(msg, res.status);
  }

  return data as T;
}

export interface RawApiGame {
  id: number;
  external_id: number;
  grade_num: GradeId;
  topic_slug: string;
  title: string;
  idea: string;
  engine: GameEngine;
  duration_sec: number;
  config: Record<string, unknown>;
}

export function mapApiGameToDef(g: RawApiGame): GameDef {
  return {
    id: g.external_id,
    grade: g.grade_num,
    topicId: g.topic_slug,
    title: g.title,
    idea: g.idea,
    engine: g.engine,
    durationSec: g.duration_sec,
    ...(g.config || {}),
  } as GameDef;
}

export const api = {
  getMe: () => requestJson<{ user: ApiUser | null; curriculum_unlocked: boolean }>('/auth/me'),

  register: (payload: {
    username: string;
    password: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    grade_level?: number;
  }) =>
    requestJson<{ user: ApiUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { username: string; password: string }) =>
    requestJson<{ user: ApiUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    requestJson<{ detail: string }>('/auth/logout', {
      method: 'POST',
    }),

  unlockCurriculum: (code: string) =>
    requestJson<{ unlocked: boolean }>('/auth/unlock-curriculum', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  lockCurriculum: () =>
    requestJson<{ unlocked: boolean }>('/auth/lock-curriculum', {
      method: 'POST',
    }),

  getGrades: () => requestJson<ApiGrade[]>('/grades'),

  createGrade: (payload: Partial<ApiGrade>) =>
    requestJson<ApiGrade>('/grades', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateGrade: (gradeNum: number, payload: Partial<ApiGrade>) =>
    requestJson<ApiGrade>(`/grades/${gradeNum}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getLessons: (params?: { grade?: GradeId; topic?: string; type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.grade) q.set('grade', String(params.grade));
    if (params?.topic) q.set('topic', params.topic);
    if (params?.type && params.type !== 'all') q.set('type', params.type);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return requestJson<ApiLessonSummary[]>(qs ? `/lessons?${qs}` : '/lessons');
  },

  getLessonDetail: (slug: string) =>
    requestJson<ApiLessonDetail>(`/lessons/${encodeURIComponent(slug)}`),

  getCurriculumAudit: () => requestJson<ApiCurriculumAudit>('/curriculum/audit'),

  getTopics: (grade?: GradeId) =>
    requestJson<ApiTopicSummary[]>(grade ? `/topics?grade=${grade}` : '/topics'),

  getTopicDetail: (slug: string) =>
    requestJson<ApiTopicDetail>(`/topics/${encodeURIComponent(slug)}`),

  createTopic: (payload: Record<string, unknown>) =>
    requestJson<ApiTopicDetail>('/topics', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTopic: (slug: string, payload: Record<string, unknown>) =>
    requestJson<ApiTopicDetail>(`/topics/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  checkPractice: (practice_code: string, answer: string) =>
    requestJson<{ correct: boolean; practice_code: string; detail?: string }>(
      '/topics/check-practice',
      {
        method: 'POST',
        body: JSON.stringify({ practice_code, answer }),
      }
    ),

  getPresentation: (slug: string) =>
    requestJson<ApiPresentation>(`/presentations/${encodeURIComponent(slug)}`),

  addSlide: (slug: string, payload: Record<string, unknown>) =>
    requestJson<ApiSlide>(`/presentations/${encodeURIComponent(slug)}/slides`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateSlide: (id: number, payload: Record<string, unknown>) =>
    requestJson<ApiSlide>(`/presentations/slides/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteSlide: (id: number) =>
    requestJson<void>(`/presentations/slides/${id}`, {
      method: 'DELETE',
    }),

  getTests: (slug: string, mode: 'lesson' | 'topic' = 'topic') =>
    requestJson<ApiPublicTestQuestion[]>(
      mode === 'lesson'
        ? `/tests?lesson=${encodeURIComponent(slug)}`
        : `/tests?topic=${encodeURIComponent(slug)}`
    ),

  submitTests: (
    slugOrPayload: string | { lesson_slug?: string; topic_slug?: string },
    answers: Record<string, number>
  ) => {
    const body =
      typeof slugOrPayload === 'string'
        ? { topic_slug: slugOrPayload, answers }
        : { ...slugOrPayload, answers };
    return requestJson<ApiTestSubmitResponse>('/tests/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getGames: async (grade?: GradeId | 'all'): Promise<GameDef[]> => {
    const q = grade && grade !== 'all' ? `/games?grade=${grade}` : '/games';
    const rows = await requestJson<RawApiGame[]>(q);
    return rows.map(mapApiGameToDef);
  },

  submitGameScore: (gameId: number, score: number) =>
    requestJson<{ game_id: number; best_score: number; attempts?: number }>(
      `/games/${gameId}/score`,
      {
        method: 'POST',
        body: JSON.stringify({ score }),
      }
    ),

  getMyProgress: () => requestJson<ApiMyProgressResponse>('/progress/me'),

  updateMyProgress: (payload: {
    lesson_slug?: string;
    topic_slug?: string;
    presentation_viewed?: boolean;
    lesson_completed?: boolean;
  }) =>
    requestJson<ApiTopicProgress>('/progress/me', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminProgressOverview: () =>
    requestJson<{
      records: ApiTopicProgress[];
      total_students: number;
      total_attempts: number;
    }>('/progress/overview'),

  getMediaList: () => requestJson<ApiMediaAsset[]>('/media'),

  uploadMedia: (file: File, title?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);
    return requestJson<ApiMediaAsset>('/media', {
      method: 'POST',
      body: fd,
    });
  },
};
