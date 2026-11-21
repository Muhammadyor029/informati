import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const DATA_DIR = path.resolve(__dirname, '.data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const MEDIA_DIR = path.join(UPLOADS_DIR, 'media');
const SEED_PATH = path.resolve(__dirname, 'backend', 'fixtures', 'seed_curriculum.json');

const SESSION_COOKIE = 'nova_session';
const UNLOCK_COOKIE = 'nova_unlock';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TEACHER_USERNAME = (process.env.TEACHER_USERNAME || 'SamandarTurdaliyev').trim();
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'Samandar123';
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

type UserRole = 'student' | 'teacher' | 'admin';

interface StoredUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  grade_level: number;
  curriculum_unlocked: boolean;
  password_hash: string;
  created_at: string;
}

interface StoredGrade {
  id: number;
  grade: number;
  title: string;
  weekly_hours: number;
  total_hours: number;
  summary: string;
  focus_areas: string[];
}

interface StoredLesson {
  id: number;
  order: number;
  dars: string;
  title: string;
  hours: number;
  note: string;
}

interface StoredKeyConcept {
  id: number;
  term: string;
  meaning: string;
}

interface StoredPractice {
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

interface StoredTestQuestion {
  id: number;
  topic_slug: string;
  lesson_slug: string | null;
  code: string;
  order: number;
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
}

interface StoredVisualDiagram {
  type: string;
  caption: string;
  nodes: string[];
}

interface StoredLessonItem {
  id: number;
  slug: string;
  grade_num: number;
  topic_slug: string;
  topic_title: string;
  lesson_number: number;
  order: number;
  dars: string;
  title: string;
  term: string;
  lesson_type: 'regular' | 'practical' | 'project' | 'assessment' | 'revision';
  hours: number;
  note: string;
  game_ids: number[];
  content: {
    objectives: string[];
    explanation: string[];
    practical_examples: string[];
    key_terms: Array<{ term: string; meaning: string }>;
    summary_text: string;
    anim_type: string;
    anim_title: string;
    anim_subtitle: string;
    visual_diagram: StoredVisualDiagram;
  };
  practices: StoredPractice[];
}

interface StoredTopic {
  id: number;
  slug: string;
  grade_num: number;
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
  anim_type: string;
  anim_title: string;
  anim_subtitle: string;
  game_ids: number[];
  lessons: StoredLesson[];
  key_concepts: StoredKeyConcept[];
  practices: StoredPractice[];
}

interface StoredSlide {
  id: number;
  order: number;
  layout: 'cover' | 'concepts' | 'diagram' | 'plan' | 'practice' | 'summary';
  title: string;
  subtitle: string;
  bullet_points: string[];
  image: number | null;
  speaker_notes: string;
}

interface StoredPresentation {
  id: number;
  topic_slug: string | null;
  lesson_slug: string | null;
  title: string;
  description: string;
  updated_at: string;
  slides: StoredSlide[];
}

interface StoredMediaAsset {
  id: number;
  title: string;
  file: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  uploaded_by: number | null;
  created_at: string;
}

interface StoredGame {
  id: number;
  external_id: number;
  grade_num: number;
  topic_slug: string;
  title: string;
  idea: string;
  engine: string;
  duration_sec: number;
  config: Record<string, unknown>;
}

interface StoredProgress {
  id: number;
  user_id: number;
  topic_slug: string | null;
  lesson_slug: string | null;
  presentation_viewed: boolean;
  lesson_completed: boolean;
  best_test_score: number;
  tests_total: number;
  solved_practices: string[];
  updated_at: string;
}

interface StoredTopicPermission {
  id: number;
  user_id: number;
  topic_slug: string;
  status: 'pending' | 'approved';
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
}

interface StoredGameScore {
  id: number;
  user_id: number;
  game_id: number;
  best_score: number;
  attempts: number;
  updated_at: string;
}

interface StoredAttempt {
  id: number;
  user_id: number | null;
  topic_slug: string | null;
  lesson_slug: string | null;
  answers: Record<string, number>;
  score: number;
  total: number;
  created_at: string;
}

interface SourceDiscrepancy {
  grade: number | string;
  lesson: number | string;
  issue: string;
}

interface DatabaseSchema {
  schemaVersion?: number;
  nextIds: Record<string, number>;
  subject: {
    slug: string;
    name: string;
    description: string;
  };
  source_discrepancies: SourceDiscrepancy[];
  users: StoredUser[];
  tokens: Record<string, number>;
  grades: StoredGrade[];
  topics: StoredTopic[];
  lessons: StoredLessonItem[];
  tests: StoredTestQuestion[];
  presentations: StoredPresentation[];
  games: StoredGame[];
  media: StoredMediaAsset[];
  progress: StoredProgress[];
  topicPermissions: StoredTopicPermission[];
  gameScores: StoredGameScore[];
  testAttempts: StoredAttempt[];
}

interface AuthedRequest extends Request {
  currentUser?: StoredUser | null;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

function safeCompareSecret(input: string, expected: string): boolean {
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function signPayload(payload: string): string {
  const mac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

function verifySignedPayload(token: string): string | null {
  const idx = token.lastIndexOf('.');
  if (idx <= 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? payload : null;
}

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq > 0) {
      const k = part.slice(0, eq).trim();
      const v = part.slice(eq + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}

function ensureDirs(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

function detectImageDimensions(
  buf: Buffer,
  mimeType: string
): { width: number | null; height: number | null } {
  try {
    if (mimeType === 'image/png' && buf.length >= 24) {
      return {
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20),
      };
    }
    if (mimeType === 'image/gif' && buf.length >= 10) {
      return {
        width: buf.readUInt16LE(6),
        height: buf.readUInt16LE(8),
      };
    }
    if (mimeType === 'image/jpeg' && buf.length >= 4) {
      let offset = 2;
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buf[offset + 1];
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          return {
            height: buf.readUInt16BE(offset + 5),
            width: buf.readUInt16BE(offset + 7),
          };
        }
        const segLen = buf.readUInt16BE(offset + 2);
        if (segLen < 2) break;
        offset += 2 + segLen;
      }
    }
    if (mimeType === 'image/webp' && buf.length >= 30) {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X') {
        const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        return { width: w, height: h };
      }
      if (chunk === 'VP8 ' && buf.length >= 30) {
        return {
          width: buf.readUInt16LE(26) & 0x3fff,
          height: buf.readUInt16LE(28) & 0x3fff,
        };
      }
      if (chunk === 'VP8L' && buf.length >= 25) {
        const bits = buf.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
    }
  } catch {
    return { width: null, height: null };
  }
  return { width: null, height: null };
}

function validateImageMagicBytes(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  const head6 = buf.toString('ascii', 0, 6);
  if (head6 === 'GIF87a' || head6 === 'GIF89a') {
    return 'image/gif';
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

interface RawSeed {
  subject: { slug: string; name: string; description: string };
  grades: Array<{
    grade: number;
    title: string;
    weeklyHours: number;
    totalHours: number;
    summary: string;
    focusAreas: string[];
  }>;
  topics: Array<{
    id: string;
    grade: number;
    order: number;
    term: string;
    lessonRange: string;
    totalHours: number;
    title: string;
    shortDesc: string;
    detailedExplanation: string[];
    keyConcepts: Array<{ term: string; meaning: string }>;
    lessons: Array<{ dars: string; title: string; hours: number; note: string }>;
    animType: string;
    animTitle: string;
    animSubtitle: string;
    gameIds: number[];
    tests: Array<{
      id: string;
      question: string;
      options: [string, string, string, string];
      correctIndex: number;
      explanation: string;
    }>;
    practices: Array<{
      id: string;
      title: string;
      instruction: string;
      placeholder: string;
      expectedKeywords: string[];
      sampleAnswer: string;
      hint: string;
    }>;
  }>;
  lessons?: Array<{
    slug: string;
    grade: number;
    topic_slug: string;
    lesson_number: number;
    dars: string;
    title: string;
    term: string;
    hours: number;
    lesson_type: 'regular' | 'practical' | 'project' | 'assessment' | 'revision';
    note: string;
    game_ids: number[];
    content: StoredLessonItem['content'];
    slides: Array<{
      order: number;
      layout: StoredSlide['layout'];
      title: string;
      subtitle: string;
      bullet_points: string[];
      image: number | null;
      speaker_notes: string;
    }>;
    practices: Array<{
      code: string;
      order: number;
      title: string;
      instruction: string;
      placeholder: string;
      expected_keywords: string[];
      sample_answer: string;
      hint: string;
    }>;
    tests: Array<{
      code: string;
      order: number;
      question: string;
      options: [string, string, string, string];
      correct_index: number;
      explanation: string;
    }>;
  }>;
  source_discrepancies?: SourceDiscrepancy[];
  games: Array<Record<string, unknown>>;
}

function buildInitialDb(): DatabaseSchema {
  const raw: RawSeed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));

  let lessonId = 1;
  let conceptId = 1;
  let practiceId = 1;
  let testId = 1;
  let presId = 1;
  let slideId = 1;

  const grades: StoredGrade[] = raw.grades.map((g, i) => ({
    id: i + 1,
    grade: g.grade,
    title: g.title,
    weekly_hours: g.weeklyHours,
    total_hours: g.totalHours,
    summary: g.summary,
    focus_areas: g.focusAreas,
  }));

  const topics: StoredTopic[] = [];
  const lessons: StoredLessonItem[] = [];
  const tests: StoredTestQuestion[] = [];
  const presentations: StoredPresentation[] = [];
  const topicTitleMap = new Map<string, string>();

  raw.topics.forEach((u, tIdx) => {
    topicTitleMap.set(u.id, u.title);
    const objectives = u.lessons.slice(0, 4).map((row) => `${row.dars}: ${row.title}`);
    const realWorldExamples = u.keyConcepts.slice(0, 3).map((kc) => `${kc.term} — ${kc.meaning}`);
    const summaryText = `${u.title} bo‘limi ${u.lessonRange} darslarini (${u.totalHours} soat) qamrab oladi.`;

    topics.push({
      id: tIdx + 1,
      slug: u.id,
      grade_num: u.grade,
      order: u.order,
      term: u.term,
      lesson_range: u.lessonRange,
      total_hours: u.totalHours,
      title: u.title,
      short_desc: u.shortDesc,
      objectives,
      detailed_explanation: u.detailedExplanation,
      real_world_examples: realWorldExamples,
      summary_text: summaryText,
      anim_type: u.animType,
      anim_title: u.animTitle,
      anim_subtitle: u.animSubtitle,
      game_ids: u.gameIds || [],
      lessons: u.lessons.map((l, idx) => ({
        id: lessonId++,
        order: idx + 1,
        dars: l.dars,
        title: l.title,
        hours: l.hours,
        note: l.note || '',
      })),
      key_concepts: u.keyConcepts.map((kc) => ({
        id: conceptId++,
        term: kc.term,
        meaning: kc.meaning,
      })),
      practices: u.practices.map((pr, idx) => ({
        id: practiceId++,
        code: pr.id,
        order: idx + 1,
        title: pr.title,
        instruction: pr.instruction,
        placeholder: pr.placeholder,
        expected_keywords: pr.expectedKeywords,
        sample_answer: pr.sampleAnswer,
        hint: pr.hint,
      })),
    });

    u.tests.forEach((t, idx) => {
      tests.push({
        id: testId++,
        topic_slug: u.id,
        lesson_slug: null,
        code: t.id,
        order: idx + 1,
        question: t.question,
        options: t.options,
        correct_index: t.correctIndex,
        explanation: t.explanation,
      });
    });

    const slides: StoredSlide[] = [
      {
        id: slideId++,
        order: 1,
        layout: 'cover',
        title: u.title,
        subtitle: `${u.grade}-sinf · ${u.term} · ${u.lessonRange} · ${u.totalHours} soat`,
        bullet_points: objectives,
        image: null,
        speaker_notes: `O‘quvchilarga ${u.title} bo‘limining asosiy maqsadlarini tanishtiring.`,
      },
      {
        id: slideId++,
        order: 2,
        layout: 'concepts',
        title: 'Asosiy tushunchalar va atamalar',
        subtitle: u.shortDesc,
        bullet_points: u.keyConcepts.slice(0, 4).map((kc) => `${kc.term}: ${kc.meaning}`),
        image: null,
        speaker_notes: 'Har bir tushunchani sinf doskasida misollar bilan mustahkamlang.',
      },
      {
        id: slideId++,
        order: 3,
        layout: 'diagram',
        title: u.animTitle,
        subtitle: u.animSubtitle,
        bullet_points: u.detailedExplanation.slice(0, 2),
        image: null,
        speaker_notes: 'Interaktiv diagramma va jonli sxema yordamida jarayonni ko‘rsating.',
      },
      {
        id: slideId++,
        order: 4,
        layout: 'plan',
        title: 'Yillik reja bo‘yicha darslar',
        subtitle: `Jami ${u.totalHours} soat · ${u.lessons.length} ta dars bloki`,
        bullet_points: u.lessons.slice(0, 6).map((l) => `${l.dars} — ${l.title} (${l.hours} soat)`),
        image: null,
        speaker_notes: 'Rejadagi ketma-ketlik asosida dars soatlarini taqsimlang.',
      },
      {
        id: slideId++,
        order: 5,
        layout: 'practice',
        title: 'Kundalik hayot va amaliyot misollari',
        subtitle: 'Nazariy bilimni amaliy vazifalarga bog‘lash',
        bullet_points: realWorldExamples,
        image: null,
        speaker_notes: 'O‘quvchilardan o‘z hayotiy misollarini keltirishni so‘rang.',
      },
      {
        id: slideId++,
        order: 6,
        layout: 'summary',
        title: 'Xulosa va nazoratga tayyorgarlik',
        subtitle: `${u.tests.length} ta test · ${u.practices.length} ta amaliyot · ${(u.gameIds || []).length} ta o‘yin`,
        bullet_points: [
          summaryText,
          'Barcha nazorat savollarini yeching va tushuntirishlarni o‘qing.',
          'Amaliy topshiriqlar va mavzuga oid o‘yinlarda ball to‘plang.',
        ],
        image: null,
        speaker_notes: 'Yakuniy baholash va uy vazifasi ko‘rsatmalarini bering.',
      },
    ];

    presentations.push({
      id: presId++,
      topic_slug: u.id,
      lesson_slug: null,
      title: u.title,
      description: u.shortDesc,
      updated_at: new Date().toISOString(),
      slides,
    });
  });

  // Load all 340 individual lessons with content, presentations, practices, and 5 tests each
  (raw.lessons || []).forEach((row, lIdx) => {
    const practices: StoredPractice[] = (row.practices || []).map((pr, idx) => ({
      id: practiceId++,
      code: pr.code,
      order: pr.order || idx + 1,
      title: pr.title,
      instruction: pr.instruction,
      placeholder: pr.placeholder,
      expected_keywords: pr.expected_keywords,
      sample_answer: pr.sample_answer,
      hint: pr.hint,
    }));

    lessons.push({
      id: lIdx + 1,
      slug: row.slug,
      grade_num: row.grade,
      topic_slug: row.topic_slug,
      topic_title: topicTitleMap.get(row.topic_slug) || '',
      lesson_number: row.lesson_number,
      order: row.lesson_number,
      dars: row.dars,
      title: row.title,
      term: row.term,
      lesson_type: row.lesson_type || 'regular',
      hours: row.hours || 1,
      note: row.note || '',
      game_ids: row.game_ids || [],
      content: row.content,
      practices,
    });

    (row.tests || []).slice(0, 5).forEach((q, idx) => {
      tests.push({
        id: testId++,
        topic_slug: row.topic_slug,
        lesson_slug: row.slug,
        code: q.code,
        order: q.order || idx + 1,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
      });
    });

    presentations.push({
      id: presId++,
      topic_slug: null,
      lesson_slug: row.slug,
      title: `${row.dars}: ${row.title}`,
      description: row.content?.summary_text || row.title,
      updated_at: new Date().toISOString(),
      slides: (row.slides || []).map((s, idx) => ({
        id: slideId++,
        order: s.order || idx + 1,
        layout: s.layout,
        title: s.title,
        subtitle: s.subtitle || '',
        bullet_points: s.bullet_points || [],
        image: s.image ?? null,
        speaker_notes: s.speaker_notes || '',
      })),
    });
  });

  const games: StoredGame[] = raw.games.map((g, idx) => {
    const config: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(g)) {
      if (!['id', 'grade', 'topicId', 'title', 'idea', 'engine', 'durationSec'].includes(k)) {
        config[k] = v;
      }
    }
    return {
      id: idx + 1,
      external_id: Number(g.id),
      grade_num: Number(g.grade),
      topic_slug: String(g.topicId),
      title: String(g.title),
      idea: String(g.idea),
      engine: String(g.engine),
      duration_sec: Number(g.durationSec),
      config,
    };
  });

  const db: DatabaseSchema = {
    schemaVersion: 5,
    nextIds: {
      user: 1,
      grade: grades.length + 1,
      topic: topics.length + 1,
      lessonItem: lessons.length + 1,
      lesson: lessonId,
      concept: conceptId,
      practice: practiceId,
      test: testId,
      presentation: presId,
      slide: slideId,
      media: 1,
      game: games.length + 1,
      progress: 1,
      topicPermission: 1,
      gameScore: 1,
      attempt: 1,
    },
    subject: raw.subject,
    source_discrepancies: raw.source_discrepancies || [],
    users: [],
    tokens: {},
    grades,
    topics,
    lessons,
    tests,
    presentations,
    games,
    media: [],
    progress: [],
    topicPermissions: [],
    gameScores: [],
    testAttempts: [],
  };

  return db;
}

function loadDatabase(): DatabaseSchema {
  ensureDirs();
  let db: DatabaseSchema;
  if (fs.existsSync(DB_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DatabaseSchema;
      if (!Array.isArray(parsed.lessons) || parsed.lessons.length < 340 || (parsed.topics?.length || 0) < 56 || (parsed.games?.length || 0) < 59 || parsed.schemaVersion !== 5) {
        const fresh = buildInitialDb();
        fresh.users = parsed.users || [];
        fresh.tokens = parsed.tokens || {};
        fresh.media = parsed.media || [];
        fresh.progress = parsed.progress || [];
        fresh.topicPermissions = parsed.topicPermissions || [];
        fresh.gameScores = parsed.gameScores || [];
        fresh.testAttempts = parsed.testAttempts || [];
        fresh.nextIds.user = Math.max(fresh.nextIds.user || 1, parsed.nextIds?.user || 1);
        fresh.nextIds.media = Math.max(fresh.nextIds.media || 1, parsed.nextIds?.media || 1);
        fresh.nextIds.progress = Math.max(fresh.nextIds.progress || 1, parsed.nextIds?.progress || 1);
        fresh.nextIds.topicPermission = Math.max(fresh.nextIds.topicPermission || 1, parsed.nextIds?.topicPermission || 1);
        fresh.nextIds.gameScore = Math.max(fresh.nextIds.gameScore || 1, parsed.nextIds?.gameScore || 1);
        fresh.nextIds.attempt = Math.max(fresh.nextIds.attempt || 1, parsed.nextIds?.attempt || 1);
        db = fresh;
      } else {
        db = parsed;
      }
    } catch {
      db = buildInitialDb();
    }
  } else {
    db = buildInitialDb();
  }

  if (!Array.isArray(db.topicPermissions)) db.topicPermissions = [];
  if (!db.nextIds.topicPermission) {
    db.nextIds.topicPermission = db.topicPermissions.reduce(
      (max, p) => Math.max(max, Number(p.id) + 1),
      1
    );
  }

  // Optional educator account bootstrap strictly via server environment variables
  const adminUser = (process.env.ADMIN_USERNAME || '').trim();
  const adminPass = process.env.ADMIN_PASSWORD || '';
  if (adminUser && adminPass && !db.users.some((u) => u.username === adminUser)) {
    const id = db.nextIds.user++;
    db.users.push({
      id,
      username: adminUser,
      email: `${adminUser}@novainformatika.uz`,
      first_name: 'O‘qituvchi',
      last_name: 'Admin',
      role: 'admin',
      grade_level: 7,
      curriculum_unlocked: true,
      password_hash: hashPassword(adminPass),
      created_at: new Date().toISOString(),
    });
  }

  if (TEACHER_USERNAME && TEACHER_PASSWORD) {
    const existingTeacher = db.users.find((u) => u.username === TEACHER_USERNAME);
    if (existingTeacher) {
      existingTeacher.role = 'teacher';
      existingTeacher.email = `${TEACHER_USERNAME}@novainformatika.uz`;
      existingTeacher.first_name = 'Samandar';
      existingTeacher.last_name = 'Turdaliyev';
      existingTeacher.grade_level = 7;
      existingTeacher.curriculum_unlocked = true;
      existingTeacher.password_hash = hashPassword(TEACHER_PASSWORD);
    } else {
      db.users.push({
        id: db.nextIds.user++,
        username: TEACHER_USERNAME,
        email: `${TEACHER_USERNAME}@novainformatika.uz`,
        first_name: 'Samandar',
        last_name: 'Turdaliyev',
        role: 'teacher',
        grade_level: 7,
        curriculum_unlocked: true,
        password_hash: hashPassword(TEACHER_PASSWORD),
        created_at: new Date().toISOString(),
      });
    }
  }

  saveDatabase(db);
  return db;
}

function saveDatabase(db: DatabaseSchema): void {
  ensureDirs();
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_PATH);
}

function nextId(db: DatabaseSchema, key: string): number {
  const val = db.nextIds[key] || 1;
  db.nextIds[key] = val + 1;
  return val;
}

function sanitizeUser(u: StoredUser) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    role: u.role,
    grade_level: u.grade_level,
    curriculum_unlocked: u.curriculum_unlocked,
  };
}

function serializeMedia(asset: StoredMediaAsset) {
  return {
    id: asset.id,
    title: asset.title,
    file: asset.file,
    url: `/media/${asset.file}`,
    mime_type: asset.mime_type,
    file_size: asset.file_size,
    width: asset.width,
    height: asset.height,
    created_at: asset.created_at,
  };
}

function serializeSlide(slide: StoredSlide, db: DatabaseSchema) {
  const asset = slide.image ? db.media.find((m) => m.id === slide.image) || null : null;
  return {
    ...slide,
    image_asset: asset ? serializeMedia(asset) : null,
  };
}

function isEducator(user?: StoredUser | null): boolean {
  return Boolean(user && (user.role === 'teacher' || user.role === 'admin'));
}

function topicPermissionStatus(
  db: DatabaseSchema,
  user: StoredUser | null | undefined,
  topicSlug: string
): 'pending' | 'approved' | null {
  if (!user) return null;
  const records = db.topicPermissions.filter(
    (p) => p.user_id === user.id && p.topic_slug === topicSlug
  );
  if (records.some((p) => p.status === 'approved')) return 'approved';
  return records.some((p) => p.status === 'pending') ? 'pending' : null;
}

function canAccessTopic(db: DatabaseSchema, req: Request, topicSlug: string): boolean {
  const user = (req as AuthedRequest).currentUser;
  if (isEducator(user) || user?.curriculum_unlocked) return true;
  const cookies = parseCookies(req.headers.cookie);
  if (verifySignedPayload(cookies[UNLOCK_COOKIE] || '') === 'unlocked') return true;
  return topicPermissionStatus(db, user, topicSlug) === 'approved';
}

function serializeTopicPermission(db: DatabaseSchema, p: StoredTopicPermission) {
  const topic = db.topics.find((t) => t.slug === p.topic_slug);
  const user = db.users.find((u) => u.id === p.user_id);
  return {
    id: p.id,
    user_id: p.user_id,
    username: user?.username || 'noma’lum',
    full_name: user ? `${user.first_name} ${user.last_name}`.trim() : '',
    grade_num: user?.grade_level || topic?.grade_num || 5,
    topic_slug: p.topic_slug,
    topic_title: topic?.title || p.topic_slug,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
    reviewed_by: p.reviewed_by,
  };
}

function parseBearerOrCookieToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth) {
    if (auth.startsWith('Token ')) return auth.slice(6).trim();
    if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;
  return verifySignedPayload(raw);
}

function setCookie(res: Response, name: string, value: string, maxAgeSec: number): void {
  res.append(
    'Set-Cookie',
    `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`
  );
}

function clearCookie(res: Response, name: string): void {
  res.append('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

async function startServer() {
  const db = loadDatabase();
  const app = express();

  app.use(express.json({ limit: '5mb' }));
  app.use('/media', express.static(MEDIA_DIR, { maxAge: '1d' }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES },
  });

  // Attach authenticated user if session token is valid
  app.use((req: AuthedRequest, _res: Response, next: NextFunction) => {
    const token = parseBearerOrCookieToken(req);
    if (token && db.tokens[token]) {
      const uid = db.tokens[token];
      req.currentUser = db.users.find((u) => u.id === uid) || null;
    } else {
      req.currentUser = null;
    }
    next();
  });

  const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      res.status(401).json({ detail: 'Avval tizimga kiring.' });
      return;
    }
    next();
  };

  const requireEducator = (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      res.status(401).json({ detail: 'Avval tizimga kiring.' });
      return;
    }
    if (!isEducator(req.currentUser)) {
      res.status(403).json({ detail: 'Faqat o‘qituvchi yoki administrator uchun ruxsat etilgan.' });
      return;
    }
    next();
  };

  // ==================== HEALTH & CURRICULUM AUDIT ====================
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'nova-informatika-express',
      grades_count: db.grades.length,
      topics_count: db.topics.length,
      lessons_count: db.lessons.length,
      tests_count: db.tests.length,
      games_count: db.games.length,
    });
  });

  app.get('/api/v1/curriculum/audit', (_req, res) => {
    const perGrade: Record<number, number> = {};
    for (const g of [5, 6, 7, 8, 9, 10, 11]) {
      perGrade[g] = db.lessons.filter((l) => l.grade_num === g).length;
    }
    const lessonsWith5Tests = db.lessons.filter(
      (l) => db.tests.filter((q) => q.lesson_slug === l.slug).length === 5
    ).length;
    const lessonsWithSlides = db.lessons.filter((l) =>
      db.presentations.some((p) => p.lesson_slug === l.slug && p.slides.length > 0)
    ).length;
    res.json({
      total_lessons: db.lessons.length,
      per_grade: perGrade,
      lessons_with_5_tests: lessonsWith5Tests,
      lessons_with_presentations: lessonsWithSlides,
      total_units: db.topics.length,
      total_games: db.games.length,
      source_discrepancies: db.source_discrepancies || [],
    });
  });

  // ==================== AUTH & UNLOCK ====================
  app.post('/api/v1/auth/register', (req: AuthedRequest, res: Response) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const email = String(req.body?.email || '').trim();
    const firstName = String(req.body?.first_name || '').trim();
    const lastName = String(req.body?.last_name || '').trim();
    const gradeLevel = Math.min(11, Math.max(5, Number(req.body?.grade_level) || 5));

    if (username.length < 3) {
      res.status(400).json({ detail: 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo‘lishi kerak.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ detail: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.' });
      return;
    }
    if (TEACHER_USERNAME && username.toLowerCase() === TEACHER_USERNAME.toLowerCase()) {
      res.status(403).json({ detail: 'Bu login o‘qituvchi hisobi uchun ajratilgan.' });
      return;
    }
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      res.status(400).json({ detail: 'Bu foydalanuvchi nomi allaqachon band.' });
      return;
    }

    const cookies = parseCookies(req.headers.cookie);
    const unlockCookieValid = verifySignedPayload(cookies[UNLOCK_COOKIE] || '') === 'unlocked';

    const user: StoredUser = {
      id: nextId(db, 'user'),
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'student',
      grade_level: gradeLevel,
      curriculum_unlocked: unlockCookieValid,
      password_hash: hashPassword(password),
      created_at: new Date().toISOString(),
    };
    db.users.push(user);

    const token = crypto.randomBytes(24).toString('hex');
    db.tokens[token] = user.id;
    saveDatabase(db);

    setCookie(res, SESSION_COOKIE, signPayload(token), 60 * 60 * 24 * 7);
    res.status(201).json({ user: sanitizeUser(user), token });
  });

  app.post('/api/v1/auth/login', (req: AuthedRequest, res: Response) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const user = db.users.find((u) => u.username === username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      res.status(401).json({ detail: 'Login yoki parol noto‘g‘ri.' });
      return;
    }

    const cookies = parseCookies(req.headers.cookie);
    if (verifySignedPayload(cookies[UNLOCK_COOKIE] || '') === 'unlocked' && !user.curriculum_unlocked) {
      user.curriculum_unlocked = true;
    }

    const token = crypto.randomBytes(24).toString('hex');
    db.tokens[token] = user.id;
    saveDatabase(db);

    setCookie(res, SESSION_COOKIE, signPayload(token), 60 * 60 * 24 * 7);
    res.json({ user: sanitizeUser(user), token });
  });

  app.post('/api/v1/auth/logout', (req: AuthedRequest, res: Response) => {
    const token = parseBearerOrCookieToken(req);
    if (token && db.tokens[token]) {
      delete db.tokens[token];
      saveDatabase(db);
    }
    clearCookie(res, SESSION_COOKIE);
    res.json({ detail: 'Chiqildi.' });
  });

  app.get('/api/v1/auth/me', (req: AuthedRequest, res: Response) => {
    const cookies = parseCookies(req.headers.cookie);
    const cookieUnlocked = verifySignedPayload(cookies[UNLOCK_COOKIE] || '') === 'unlocked';
    if (!req.currentUser) {
      res.json({ user: null, curriculum_unlocked: cookieUnlocked, topic_permissions: [] });
      return;
    }
    const topicPermissions = db.topicPermissions
      .filter((p) => p.user_id === req.currentUser!.id)
      .map((p) => ({ topic_slug: p.topic_slug, status: p.status, created_at: p.created_at }));
    res.json({
      user: sanitizeUser(req.currentUser),
      curriculum_unlocked: Boolean(req.currentUser.curriculum_unlocked || cookieUnlocked),
      topic_permissions: topicPermissions,
    });
  });

  app.post('/api/v1/auth/unlock-curriculum', (req: AuthedRequest, res: Response) => {
    const code = String(req.body?.code || '');
    const expected = process.env.CURRICULUM_UNLOCK_CODE || 'Samandar123';
    if (!safeCompareSecret(code, expected)) {
      res.status(403).json({ unlocked: false, detail: 'Maxfiy kod noto‘g‘ri.' });
      return;
    }
    setCookie(res, UNLOCK_COOKIE, signPayload('unlocked'), 60 * 60 * 24 * 30);
    if (req.currentUser) {
      req.currentUser.curriculum_unlocked = true;
      saveDatabase(db);
    }
    res.json({ unlocked: true });
  });

  app.post('/api/v1/auth/lock-curriculum', (req: AuthedRequest, res: Response) => {
    clearCookie(res, UNLOCK_COOKIE);
    if (req.currentUser) {
      req.currentUser.curriculum_unlocked = false;
      saveDatabase(db);
    }
    res.json({ unlocked: false });
  });

  // ==================== GRADES & SUBJECTS ====================
  app.get('/api/v1/subjects', (_req, res) => {
    res.json([db.subject]);
  });

  app.get('/api/v1/grades', (_req, res) => {
    const list = [...db.grades]
      .sort((a, b) => a.grade - b.grade)
      .map((g) => ({
        ...g,
        unit_count: db.topics.filter((t) => t.grade_num === g.grade).length,
        lesson_count: db.lessons.filter((l) => l.grade_num === g.grade).length,
      }));
    res.json(list);
  });

  app.post('/api/v1/grades', requireEducator, (req: AuthedRequest, res: Response) => {
    const gradeNum = Number(req.body?.grade);
    if (!Number.isInteger(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      res.status(400).json({ detail: 'Sinf raqami noto‘g‘ri.' });
      return;
    }
    if (db.grades.some((g) => g.grade === gradeNum)) {
      res.status(400).json({ detail: 'Bu sinf allaqachon mavjud.' });
      return;
    }
    const created: StoredGrade = {
      id: nextId(db, 'grade'),
      grade: gradeNum,
      title: String(req.body?.title || `${gradeNum}-sinf Informatika`).trim(),
      weekly_hours: Number(req.body?.weekly_hours) || 1,
      total_hours: Number(req.body?.total_hours) || 34,
      summary: String(req.body?.summary || '').trim(),
      focus_areas: Array.isArray(req.body?.focus_areas) ? req.body.focus_areas.map(String) : [],
    };
    db.grades.push(created);
    saveDatabase(db);
    res.status(201).json({ ...created, unit_count: 0 });
  });

  app.patch('/api/v1/grades/:grade', requireEducator, (req: AuthedRequest, res: Response) => {
    const gradeNum = Number(req.params.grade);
    const gradeObj = db.grades.find((g) => g.grade === gradeNum);
    if (!gradeObj) {
      res.status(404).json({ detail: 'Sinf topilmadi.' });
      return;
    }
    if (req.body?.title !== undefined) gradeObj.title = String(req.body.title).trim();
    if (req.body?.weekly_hours !== undefined) gradeObj.weekly_hours = Number(req.body.weekly_hours);
    if (req.body?.total_hours !== undefined) gradeObj.total_hours = Number(req.body.total_hours);
    if (req.body?.summary !== undefined) gradeObj.summary = String(req.body.summary).trim();
    if (Array.isArray(req.body?.focus_areas)) gradeObj.focus_areas = req.body.focus_areas.map(String);
    saveDatabase(db);
    res.json({
      ...gradeObj,
      unit_count: db.topics.filter((t) => t.grade_num === gradeObj.grade).length,
    });
  });

  // ==================== INDIVIDUAL LESSONS (340 LESSONS) ====================
  app.get('/api/v1/lessons', (req: AuthedRequest, res: Response) => {
    const gradeFilter = req.query.grade ? Number(req.query.grade) : null;
    const topicFilter = req.query.topic ? String(req.query.topic).trim() : null;
    const typeFilter = req.query.type ? String(req.query.type).trim() : null;
    const searchFilter = req.query.search ? String(req.query.search).trim().toLowerCase() : null;

    const list = db.lessons
      .filter((l) => {
        if (gradeFilter && l.grade_num !== gradeFilter) return false;
        if (topicFilter && l.topic_slug !== topicFilter) return false;
        if (typeFilter && typeFilter !== 'all' && l.lesson_type !== typeFilter) return false;
        if (searchFilter) {
          const allowed = canAccessTopic(db, req, l.topic_slug);
          const text = allowed
            ? `${l.dars} ${l.title} ${l.term} ${l.topic_title}`
            : `${l.dars} Qulflangan dars`;
          if (!text.toLowerCase().includes(searchFilter)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.grade_num !== b.grade_num ? a.grade_num - b.grade_num : a.lesson_number - b.lesson_number))
      .map((l) => {
        const allowed = canAccessTopic(db, req, l.topic_slug);
        return {
          id: l.id,
          slug: l.slug,
          grade_num: l.grade_num,
          topic_slug: l.topic_slug,
          topic_title: allowed ? l.topic_title : `${l.grade_num}-sinf`,
          lesson_number: l.lesson_number,
          order: l.order,
          dars: l.dars,
          title: allowed ? l.title : `${l.dars} · Qulflangan dars`,
          term: allowed ? l.term : '',
          lesson_type: l.lesson_type,
          hours: l.hours,
          note: allowed ? l.note : '',
          game_ids: l.game_ids,
          test_count: db.tests.filter((q) => q.lesson_slug === l.slug).length,
          practice_count: l.practices.length,
          locked: !allowed,
          permission_status: topicPermissionStatus(db, req.currentUser, l.topic_slug),
        };
      });
    res.json(list);
  });

  app.get('/api/v1/lessons/:slug', (req: AuthedRequest, res: Response) => {
    const lesson = db.lessons.find((l) => l.slug === req.params.slug);
    if (!lesson) {
      res.status(404).json({ detail: 'Dars topilmadi.' });
      return;
    }
    if (!canAccessTopic(db, req, lesson.topic_slug)) {
      res.status(403).json({ detail: 'Bu darsni ochish uchun mavzu ruxsati kerak.' });
      return;
    }
    const gradeLessons = db.lessons
      .filter((l) => l.grade_num === lesson.grade_num)
      .sort((a, b) => a.lesson_number - b.lesson_number);
    const idx = gradeLessons.findIndex((l) => l.slug === lesson.slug);
    const prev = idx > 0 ? gradeLessons[idx - 1] : null;
    const next = idx >= 0 && idx < gradeLessons.length - 1 ? gradeLessons[idx + 1] : null;

    res.json({
      ...lesson,
      prev_lesson: prev ? { slug: prev.slug, dars: prev.dars, title: prev.title } : null,
      next_lesson: next ? { slug: next.slug, dars: next.dars, title: next.title } : null,
    });
  });

  app.patch('/api/v1/lessons/:slug', requireEducator, (req: AuthedRequest, res: Response) => {
    const lesson = db.lessons.find((l) => l.slug === req.params.slug);
    if (!lesson) {
      res.status(404).json({ detail: 'Dars topilmadi.' });
      return;
    }
    if (req.body?.title !== undefined) lesson.title = String(req.body.title).trim();
    if (req.body?.note !== undefined) lesson.note = String(req.body.note).trim();
    if (req.body?.hours !== undefined) lesson.hours = Number(req.body.hours) || 1;
    if (req.body?.content && typeof req.body.content === 'object') {
      lesson.content = { ...lesson.content, ...req.body.content };
    }
    saveDatabase(db);
    res.json(lesson);
  });

  // ==================== TOPICS & LESSONS ====================
  app.get('/api/v1/topics', (req: AuthedRequest, res: Response) => {
    const gradeFilter = req.query.grade ? Number(req.query.grade) : null;
    const filtered = db.topics
      .filter((t) => (gradeFilter ? t.grade_num === gradeFilter : true))
      .sort((a, b) => (a.grade_num !== b.grade_num ? a.grade_num - b.grade_num : a.order - b.order))
      .map((t) => {
        const allowed = canAccessTopic(db, req, t.slug);
        return {
          id: t.id,
          slug: t.slug,
          grade_num: t.grade_num,
          order: t.order,
          term: t.term,
          lesson_range: t.lesson_range,
          total_hours: t.total_hours,
          title: allowed ? t.title : `${t.grade_num}-sinf · ${t.order}-bo‘lim (Qulflangan)`,
          short_desc: allowed ? t.short_desc : 'Ruxsat olish uchun so‘rov yuboring.',
          anim_type: t.anim_type,
          game_ids: t.game_ids,
          lesson_count: t.lessons.length,
          test_count: db.tests.filter((q) => q.topic_slug === t.slug && !q.lesson_slug).length,
          practice_count: t.practices.length,
          locked: !allowed,
          permission_status: topicPermissionStatus(db, req.currentUser, t.slug),
        };
      });
    res.json(filtered);
  });

  app.post('/api/v1/topics/check-practice', (req: AuthedRequest, res: Response) => {
    const code = String(req.body?.practice_code || '').trim();
    const answer = String(req.body?.answer || '').trim().toLowerCase();
    let foundTopic: StoredTopic | null = null;
    let foundLesson: StoredLessonItem | null = null;
    let foundTask: StoredPractice | null = null;

    for (const l of db.lessons) {
      const p = l.practices.find((item) => item.code === code);
      if (p) {
        foundLesson = l;
        foundTask = p;
        break;
      }
    }
    if (!foundTask) {
      for (const t of db.topics) {
        const p = t.practices.find((item) => item.code === code);
        if (p) {
          foundTopic = t;
          foundTask = p;
          break;
        }
      }
    }
    if ((!foundTopic && !foundLesson) || !foundTask) {
      res.status(404).json({ detail: 'Amaliy topshiriq topilmadi.' });
      return;
    }
    const practiceTopicSlug = foundLesson?.topic_slug || foundTopic?.slug || '';
    if (!canAccessTopic(db, req, practiceTopicSlug)) {
      res.status(403).json({ detail: 'Bu amaliyot uchun mavzu ruxsati kerak.' });
      return;
    }
    if (!answer) {
      res.json({ correct: false, detail: 'Javob kiriting.' });
      return;
    }
    const matched = foundTask.expected_keywords.some((kw) => answer.includes(kw.toLowerCase()));
    if (matched && req.currentUser) {
      let prog = foundLesson
        ? db.progress.find(
            (p) => p.user_id === req.currentUser!.id && p.lesson_slug === foundLesson!.slug
          )
        : db.progress.find(
            (p) =>
              p.user_id === req.currentUser!.id &&
              !p.lesson_slug &&
              p.topic_slug === foundTopic!.slug
          );
      if (!prog) {
        const actualTestsTotal = foundLesson
          ? db.tests.filter((q) => q.lesson_slug === foundLesson!.slug).length || 5
          : db.tests.filter((q) => q.topic_slug === foundTopic!.slug && !q.lesson_slug).length || 10;
        prog = {
          id: nextId(db, 'progress'),
          user_id: req.currentUser.id,
          topic_slug: foundLesson ? foundLesson.topic_slug : foundTopic!.slug,
          lesson_slug: foundLesson ? foundLesson.slug : null,
          presentation_viewed: false,
          lesson_completed: false,
          best_test_score: 0,
          tests_total: actualTestsTotal,
          solved_practices: [],
          updated_at: new Date().toISOString(),
        };
        db.progress.push(prog);
      }
      if (!prog.solved_practices.includes(code)) {
        prog.solved_practices.push(code);
        prog.updated_at = new Date().toISOString();
      }
      saveDatabase(db);
    }
    res.json({ correct: matched, practice_code: code });
  });

  app.get('/api/v1/topics/:slug', (req: AuthedRequest, res: Response) => {
    const topic = db.topics.find((t) => t.slug === req.params.slug);
    if (!topic) {
      res.status(404).json({ detail: 'Bo‘lim topilmadi.' });
      return;
    }
    if (!canAccessTopic(db, req, topic.slug)) {
      res.status(403).json({ detail: 'Bu mavzuni ochish uchun ruxsat oling.' });
      return;
    }
    const childLessons = db.lessons
      .filter((l) => l.topic_slug === topic.slug)
      .sort((a, b) => a.lesson_number - b.lesson_number);
    const enrichedLessons = topic.lessons.map((row, idx) => {
      const matched =
        childLessons.find((l) => l.dars === row.dars) || childLessons[idx] || null;
      return {
        ...row,
        slug: matched ? matched.slug : undefined,
      };
    });
    res.json({
      ...topic,
      lessons: enrichedLessons,
    });
  });

  app.post('/api/v1/topics', requireEducator, (req: AuthedRequest, res: Response) => {
    const gradeNum = Number(req.body?.grade_num);
    const title = String(req.body?.title || '').trim();
    if (!gradeNum || !title) {
      res.status(400).json({ detail: 'Sinf va mavzu nomi majburiy.' });
      return;
    }
    const baseSlug =
      String(req.body?.slug || '').trim() ||
      `g${gradeNum}-custom-${Date.now().toString(36)}`;
    if (db.topics.some((t) => t.slug === baseSlug)) {
      res.status(400).json({ detail: 'Ushbu slug allaqachon mavjud.' });
      return;
    }
    const gradeTopics = db.topics.filter((t) => t.grade_num === gradeNum);
    const created: StoredTopic = {
      id: nextId(db, 'topic'),
      slug: baseSlug,
      grade_num: gradeNum,
      order: Number(req.body?.order) || gradeTopics.length + 1,
      term: String(req.body?.term || 'I chorak').trim(),
      lesson_range: String(req.body?.lesson_range || '1–4-dars').trim(),
      total_hours: Number(req.body?.total_hours) || 4,
      title,
      short_desc: String(req.body?.short_desc || title).trim(),
      objectives: Array.isArray(req.body?.objectives) ? req.body.objectives.map(String) : [title],
      detailed_explanation: Array.isArray(req.body?.detailed_explanation)
        ? req.body.detailed_explanation.map(String)
        : [String(req.body?.short_desc || title)],
      real_world_examples: Array.isArray(req.body?.real_world_examples)
        ? req.body.real_world_examples.map(String)
        : [],
      summary_text: String(req.body?.summary_text || `${title} bo‘limi yakuni.`).trim(),
      anim_type: String(req.body?.anim_type || 'typing'),
      anim_title: String(req.body?.anim_title || title),
      anim_subtitle: String(req.body?.anim_subtitle || 'Interaktiv sxema'),
      game_ids: Array.isArray(req.body?.game_ids) ? req.body.game_ids.map(Number) : [],
      lessons: Array.isArray(req.body?.lessons)
        ? req.body.lessons.map((l: Record<string, unknown>, i: number) => ({
            id: nextId(db, 'lesson'),
            order: i + 1,
            dars: String(l.dars || `${i + 1}-dars`),
            title: String(l.title || title),
            hours: Number(l.hours) || 1,
            note: String(l.note || ''),
          }))
        : [
            {
              id: nextId(db, 'lesson'),
              order: 1,
              dars: '1-dars',
              title,
              hours: 1,
              note: '',
            },
          ],
      key_concepts: Array.isArray(req.body?.key_concepts)
        ? req.body.key_concepts.map((kc: Record<string, unknown>) => ({
            id: nextId(db, 'concept'),
            term: String(kc.term || ''),
            meaning: String(kc.meaning || ''),
          }))
        : [],
      practices: [],
    };
    db.topics.push(created);

    // Create default presentation deck for new unit
    db.presentations.push({
      id: nextId(db, 'presentation'),
      topic_slug: created.slug,
      lesson_slug: null,
      title: created.title,
      description: created.short_desc,
      updated_at: new Date().toISOString(),
      slides: [
        {
          id: nextId(db, 'slide'),
          order: 1,
          layout: 'cover',
          title: created.title,
          subtitle: `${created.grade_num}-sinf · ${created.term}`,
          bullet_points: created.objectives,
          image: null,
          speaker_notes: '',
        },
      ],
    });

    saveDatabase(db);
    res.status(201).json(created);
  });

  app.patch('/api/v1/topics/:slug', requireEducator, (req: AuthedRequest, res: Response) => {
    const topic = db.topics.find((t) => t.slug === req.params.slug);
    if (!topic) {
      res.status(404).json({ detail: 'Bo‘lim topilmadi.' });
      return;
    }
    if (req.body?.title !== undefined) topic.title = String(req.body.title).trim();
    if (req.body?.short_desc !== undefined) topic.short_desc = String(req.body.short_desc).trim();
    if (req.body?.term !== undefined) topic.term = String(req.body.term).trim();
    if (req.body?.lesson_range !== undefined) topic.lesson_range = String(req.body.lesson_range).trim();
    if (req.body?.total_hours !== undefined) topic.total_hours = Number(req.body.total_hours);
    if (req.body?.summary_text !== undefined) topic.summary_text = String(req.body.summary_text).trim();
    if (Array.isArray(req.body?.objectives)) topic.objectives = req.body.objectives.map(String);
    if (Array.isArray(req.body?.detailed_explanation)) {
      topic.detailed_explanation = req.body.detailed_explanation.map(String);
    }
    if (Array.isArray(req.body?.real_world_examples)) {
      topic.real_world_examples = req.body.real_world_examples.map(String);
    }
    if (Array.isArray(req.body?.lessons)) {
      topic.lessons = req.body.lessons.map((l: Record<string, unknown>, idx: number) => ({
        id: Number(l.id) || nextId(db, 'lesson'),
        order: idx + 1,
        dars: String(l.dars || `${idx + 1}-dars`),
        title: String(l.title || ''),
        hours: Number(l.hours) || 1,
        note: String(l.note || ''),
      }));
    }
    saveDatabase(db);
    res.json(topic);
  });

  // ==================== TOPIC PERMISSION REQUESTS ====================
  app.post('/api/v1/topics/:slug/permission-request', requireAuth, (req: AuthedRequest, res: Response) => {
    const topic = db.topics.find((t) => t.slug === req.params.slug);
    if (!topic) {
      res.status(404).json({ detail: 'Bo‘lim topilmadi.' });
      return;
    }
    const user = req.currentUser!;
    const existing = db.topicPermissions.find(
      (p) => p.user_id === user.id && p.topic_slug === topic.slug
    );
    if (existing) {
      res.json({ ...serializeTopicPermission(db, existing), already_exists: true });
      return;
    }
    const now = new Date().toISOString();
    const record: StoredTopicPermission = {
      id: nextId(db, 'topicPermission'),
      user_id: user.id,
      topic_slug: topic.slug,
      status: 'pending',
      created_at: now,
      updated_at: now,
      reviewed_by: null,
    };
    db.topicPermissions.push(record);
    saveDatabase(db);
    res.status(201).json({ ...serializeTopicPermission(db, record), already_exists: false });
  });

  app.get('/api/v1/permissions/me', requireAuth, (req: AuthedRequest, res: Response) => {
    const list = db.topicPermissions
      .filter((p) => p.user_id === req.currentUser!.id)
      .map((p) => serializeTopicPermission(db, p));
    res.json(list);
  });

  app.get('/api/v1/permissions/requests', requireEducator, (_req: AuthedRequest, res: Response) => {
    const records = [...db.topicPermissions]
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
        return b.created_at.localeCompare(a.created_at);
      })
      .map((p) => serializeTopicPermission(db, p));
    res.json({
      records,
      pending_count: records.filter((r) => r.status === 'pending').length,
      total_count: records.length,
    });
  });

  app.post('/api/v1/permissions/:id/approve', requireEducator, (req: AuthedRequest, res: Response) => {
    const record = db.topicPermissions.find((p) => p.id === Number(req.params.id));
    if (!record) {
      res.status(404).json({ detail: 'So‘rov topilmadi.' });
      return;
    }
    record.status = 'approved';
    record.updated_at = new Date().toISOString();
    record.reviewed_by = req.currentUser!.username;
    saveDatabase(db);
    res.json(serializeTopicPermission(db, record));
  });

  app.get('/api/v1/users', requireEducator, (_req: AuthedRequest, res: Response) => {
    const users = [...db.users]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((u) => ({
        ...sanitizeUser(u),
        approved_topics: db.topicPermissions.filter(
          (p) => p.user_id === u.id && p.status === 'approved'
        ).length,
      }));
    res.json({ users, total: users.length });
  });

  // ==================== PRESENTATIONS & SLIDES ====================
  app.get('/api/v1/presentations/:slug', (req: AuthedRequest, res: Response) => {
    const pres =
      db.presentations.find((p) => p.lesson_slug === req.params.slug) ||
      db.presentations.find((p) => p.topic_slug === req.params.slug);
    if (!pres) {
      res.status(404).json({ detail: 'Ushbu mavzu yoki dars uchun taqdimot topilmadi.' });
      return;
    }
    const presTopicSlug =
      pres.topic_slug || db.lessons.find((l) => l.slug === pres.lesson_slug)?.topic_slug || '';
    if (!canAccessTopic(db, req, presTopicSlug)) {
      res.status(403).json({ detail: 'Bu taqdimot uchun mavzu ruxsati kerak.' });
      return;
    }
    const sortedSlides = [...pres.slides]
      .sort((a, b) => a.order - b.order)
      .map((s) => serializeSlide(s, db));
    res.json({
      id: pres.id,
      topic_slug: pres.topic_slug || pres.lesson_slug || '',
      lesson_slug: pres.lesson_slug,
      title: pres.title,
      description: pres.description,
      updated_at: pres.updated_at,
      slides: sortedSlides,
    });
  });

  app.post('/api/v1/presentations/:slug/slides', requireEducator, (req: AuthedRequest, res: Response) => {
    const pres =
      db.presentations.find((p) => p.lesson_slug === req.params.slug) ||
      db.presentations.find((p) => p.topic_slug === req.params.slug);
    if (!pres) {
      res.status(404).json({ detail: 'Taqdimot topilmadi.' });
      return;
    }
    const slide: StoredSlide = {
      id: nextId(db, 'slide'),
      order: Number(req.body?.order) || pres.slides.length + 1,
      layout: (req.body?.layout as StoredSlide['layout']) || 'concepts',
      title: String(req.body?.title || 'Yangi slayd').trim(),
      subtitle: String(req.body?.subtitle || '').trim(),
      bullet_points: Array.isArray(req.body?.bullet_points) ? req.body.bullet_points.map(String) : [],
      image: req.body?.image ? Number(req.body.image) : null,
      speaker_notes: String(req.body?.speaker_notes || '').trim(),
    };
    pres.slides.push(slide);
    pres.updated_at = new Date().toISOString();
    saveDatabase(db);
    res.status(201).json(serializeSlide(slide, db));
  });

  app.patch('/api/v1/presentations/slides/:id', requireEducator, (req: AuthedRequest, res: Response) => {
    const slideId = Number(req.params.id);
    for (const pres of db.presentations) {
      const slide = pres.slides.find((s) => s.id === slideId);
      if (slide) {
        if (req.body?.title !== undefined) slide.title = String(req.body.title).trim();
        if (req.body?.subtitle !== undefined) slide.subtitle = String(req.body.subtitle).trim();
        if (req.body?.layout !== undefined) slide.layout = req.body.layout;
        if (req.body?.order !== undefined) slide.order = Number(req.body.order);
        if (req.body?.image !== undefined) slide.image = req.body.image ? Number(req.body.image) : null;
        if (Array.isArray(req.body?.bullet_points)) slide.bullet_points = req.body.bullet_points.map(String);
        if (req.body?.speaker_notes !== undefined) slide.speaker_notes = String(req.body.speaker_notes);
        pres.updated_at = new Date().toISOString();
        saveDatabase(db);
        res.json(serializeSlide(slide, db));
        return;
      }
    }
    res.status(404).json({ detail: 'Slayd topilmadi.' });
  });

  app.delete('/api/v1/presentations/slides/:id', requireEducator, (req: AuthedRequest, res: Response) => {
    const slideId = Number(req.params.id);
    for (const pres of db.presentations) {
      const idx = pres.slides.findIndex((s) => s.id === slideId);
      if (idx !== -1) {
        pres.slides.splice(idx, 1);
        pres.updated_at = new Date().toISOString();
        saveDatabase(db);
        res.status(204).send();
        return;
      }
    }
    res.status(404).json({ detail: 'Slayd topilmadi.' });
  });

  // ==================== TESTS (5-QUESTION SERVER GRADING) ====================
  app.get('/api/v1/tests', (req: AuthedRequest, res: Response) => {
    const lessonSlug = String(req.query.lesson || '').trim();
    const topicSlug = String(req.query.topic || '').trim();
    const educator = isEducator(req.currentUser);
    if (lessonSlug) {
      const lesson = db.lessons.find((l) => l.slug === lessonSlug);
      if (!lesson || !canAccessTopic(db, req, lesson.topic_slug)) {
        res.status(403).json({ detail: 'Bu testlar uchun mavzu ruxsati kerak.' });
        return;
      }
    } else if (topicSlug && !canAccessTopic(db, req, topicSlug)) {
      res.status(403).json({ detail: 'Bu testlar uchun mavzu ruxsati kerak.' });
      return;
    }
    const list = db.tests
      .filter((q) => {
        if (lessonSlug) return q.lesson_slug === lessonSlug;
        if (topicSlug) return q.topic_slug === topicSlug && !q.lesson_slug;
        const qTopic = q.topic_slug || db.lessons.find((l) => l.slug === q.lesson_slug)?.topic_slug || '';
        return canAccessTopic(db, req, qTopic);
      })
      .sort((a, b) => a.order - b.order)
      .map((q) =>
        educator
          ? q
          : {
              id: q.id,
              code: q.code,
              order: q.order,
              question: q.question,
              options: q.options,
            }
      );
    res.json(list);
  });

  app.post('/api/v1/tests/submit', (req: AuthedRequest, res: Response) => {
    const lessonSlug = String(req.body?.lesson_slug || '').trim();
    const topicSlug = String(req.body?.topic_slug || '').trim();
    const answers = req.body?.answers;
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      res.status(400).json({ detail: 'answers obyekt ko‘rinishida bo‘lishi kerak.' });
      return;
    }

    const lesson = lessonSlug ? db.lessons.find((l) => l.slug === lessonSlug) : null;
    const topic = topicSlug ? db.topics.find((t) => t.slug === topicSlug) : null;
    if (!lesson && !topic) {
      res.status(404).json({ detail: 'Dars yoki bo‘lim topilmadi.' });
      return;
    }
    const submitTopicSlug = lesson?.topic_slug || topic?.slug || '';
    if (!canAccessTopic(db, req, submitTopicSlug)) {
      res.status(403).json({ detail: 'Bu testlarni topshirish uchun mavzu ruxsati kerak.' });
      return;
    }

    const questions = (
      lesson
        ? db.tests.filter((q) => q.lesson_slug === lesson.slug)
        : db.tests.filter((q) => q.topic_slug === topic!.slug && !q.lesson_slug)
    ).sort((a, b) => a.order - b.order);

    if (!questions.length) {
      res.status(404).json({ detail: 'Test savollari topilmadi.' });
      return;
    }

    let score = 0;
    const results = questions.map((q) => {
      const picked = answers[q.code];
      const isCorrect = typeof picked === 'number' && picked === q.correct_index;
      if (isCorrect) score += 1;
      return {
        code: q.code,
        picked: typeof picked === 'number' ? picked : null,
        correct_index: q.correct_index,
        is_correct: isCorrect,
        explanation: q.explanation,
      };
    });

    const resolvedTopicSlug = lesson ? lesson.topic_slug : topic!.slug;

    db.testAttempts.push({
      id: nextId(db, 'attempt'),
      user_id: req.currentUser ? req.currentUser.id : null,
      topic_slug: resolvedTopicSlug,
      lesson_slug: lesson ? lesson.slug : null,
      answers,
      score,
      total: questions.length,
      created_at: new Date().toISOString(),
    });

    if (req.currentUser) {
      let prog = lesson
        ? db.progress.find(
            (p) => p.user_id === req.currentUser!.id && p.lesson_slug === lesson.slug
          )
        : db.progress.find(
            (p) =>
              p.user_id === req.currentUser!.id &&
              !p.lesson_slug &&
              p.topic_slug === topic!.slug
          );
      if (!prog) {
        prog = {
          id: nextId(db, 'progress'),
          user_id: req.currentUser.id,
          topic_slug: resolvedTopicSlug,
          lesson_slug: lesson ? lesson.slug : null,
          presentation_viewed: false,
          lesson_completed: false,
          best_test_score: score,
          tests_total: questions.length,
          solved_practices: [],
          updated_at: new Date().toISOString(),
        };
        db.progress.push(prog);
      } else {
        if (score > prog.best_test_score) prog.best_test_score = score;
        prog.tests_total = questions.length;
        prog.updated_at = new Date().toISOString();
      }
    }

    saveDatabase(db);
    res.json({
      lesson_slug: lesson ? lesson.slug : null,
      topic_slug: resolvedTopicSlug,
      score,
      total: questions.length,
      results,
    });
  });

  // ==================== GAMES (40 GAMES CATALOG) ====================
  app.get('/api/v1/games', (req: Request, res: Response) => {
    const gradeFilter = req.query.grade ? Number(req.query.grade) : null;
    const list = db.games
      .filter((g) => (gradeFilter ? g.grade_num === gradeFilter : true))
      .sort((a, b) => a.external_id - b.external_id);
    res.json(list);
  });

  app.post('/api/v1/games/:id/score', (req: AuthedRequest, res: Response) => {
    const extId = Number(req.params.id);
    const game = db.games.find((g) => g.external_id === extId);
    if (!game) {
      res.status(404).json({ detail: 'O‘yin topilmadi.' });
      return;
    }
    if (!canAccessTopic(db, req, game.topic_slug)) {
      res.status(403).json({ detail: 'Bu o‘yin uchun mavzu ruxsati kerak.' });
      return;
    }
    const rawScore = Number(req.body?.score);
    if (!Number.isFinite(rawScore) || rawScore < 0) {
      res.status(400).json({ detail: 'Noto‘g‘ri ball qiymati.' });
      return;
    }
    const scoreVal = Math.round(rawScore);

    if (req.currentUser) {
      let rec = db.gameScores.find(
        (s) => s.user_id === req.currentUser!.id && s.game_id === extId
      );
      if (!rec) {
        rec = {
          id: nextId(db, 'gameScore'),
          user_id: req.currentUser.id,
          game_id: extId,
          best_score: scoreVal,
          attempts: 1,
          updated_at: new Date().toISOString(),
        };
        db.gameScores.push(rec);
      } else {
        rec.best_score = Math.max(rec.best_score, scoreVal);
        rec.attempts += 1;
        rec.updated_at = new Date().toISOString();
      }
      saveDatabase(db);
      res.json({ game_id: extId, best_score: rec.best_score, attempts: rec.attempts });
      return;
    }

    res.json({ game_id: extId, best_score: scoreVal });
  });

  // ==================== PROGRESS ====================
  app.get('/api/v1/progress/me', requireAuth, (req: AuthedRequest, res: Response) => {
    const uid = req.currentUser!.id;
    const records = db.progress
      .filter((p) => p.user_id === uid)
      .map((p) => {
        const l = p.lesson_slug ? db.lessons.find((item) => item.slug === p.lesson_slug) : null;
        const t = p.topic_slug ? db.topics.find((item) => item.slug === p.topic_slug) : null;
        return {
          ...p,
          username: req.currentUser!.username,
          lesson_title: l ? `${l.dars}: ${l.title}` : null,
          topic_title: l ? `${l.dars}: ${l.title}` : t?.title || p.topic_slug || '',
          grade_num: l?.grade_num || t?.grade_num || 5,
        };
      });

    const gameScoresMap: Record<string, number> = {};
    for (const s of db.gameScores.filter((item) => item.user_id === uid)) {
      gameScoresMap[String(s.game_id)] = s.best_score;
    }

    res.json({
      topics: records,
      lessons: records.filter((r) => Boolean(r.lesson_slug)),
      game_scores: gameScoresMap,
      total_units: db.topics.length,
      total_lessons: db.lessons.length,
    });
  });

  app.post('/api/v1/progress/me', requireAuth, (req: AuthedRequest, res: Response) => {
    const lessonSlug = String(req.body?.lesson_slug || '').trim();
    const topicSlug = String(req.body?.topic_slug || '').trim();
    const lesson = lessonSlug ? db.lessons.find((l) => l.slug === lessonSlug) : null;
    const topic = topicSlug ? db.topics.find((t) => t.slug === topicSlug) : null;

    if (!lesson && !topic) {
      res.status(404).json({ detail: 'Dars yoki bo‘lim topilmadi.' });
      return;
    }
    if (!canAccessTopic(db, req, lesson?.topic_slug || topic!.slug)) {
      res.status(403).json({ detail: 'Bu mavzu uchun ruxsat olinmagan.' });
      return;
    }

    let prog = lesson
      ? db.progress.find((p) => p.user_id === req.currentUser!.id && p.lesson_slug === lesson.slug)
      : db.progress.find(
          (p) => p.user_id === req.currentUser!.id && !p.lesson_slug && p.topic_slug === topic!.slug
        );

    if (!prog) {
      const actualTestsTotal = lesson
        ? db.tests.filter((q) => q.lesson_slug === lesson.slug).length || 5
        : db.tests.filter((q) => q.topic_slug === topic!.slug && !q.lesson_slug).length || 10;
      prog = {
        id: nextId(db, 'progress'),
        user_id: req.currentUser!.id,
        topic_slug: lesson ? lesson.topic_slug : topic!.slug,
        lesson_slug: lesson ? lesson.slug : null,
        presentation_viewed: false,
        lesson_completed: false,
        best_test_score: 0,
        tests_total: actualTestsTotal,
        solved_practices: [],
        updated_at: new Date().toISOString(),
      };
      db.progress.push(prog);
    }
    if (req.body?.presentation_viewed !== undefined) {
      prog.presentation_viewed = Boolean(req.body.presentation_viewed);
    }
    if (req.body?.lesson_completed !== undefined) {
      prog.lesson_completed = Boolean(req.body.lesson_completed);
    }
    prog.updated_at = new Date().toISOString();
    saveDatabase(db);
    res.json({
      ...prog,
      username: req.currentUser!.username,
      lesson_title: lesson ? `${lesson.dars}: ${lesson.title}` : null,
      topic_title: lesson ? `${lesson.dars}: ${lesson.title}` : topic!.title,
      grade_num: lesson ? lesson.grade_num : topic!.grade_num,
    });
  });

  app.get('/api/v1/progress/overview', requireEducator, (_req: AuthedRequest, res: Response) => {
    const records = [...db.progress]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 200)
      .map((p) => {
        const user = db.users.find((u) => u.id === p.user_id);
        const l = p.lesson_slug ? db.lessons.find((item) => item.slug === p.lesson_slug) : null;
        const topic = p.topic_slug ? db.topics.find((t) => t.slug === p.topic_slug) : null;
        return {
          ...p,
          username: user?.username || 'noma’lum',
          lesson_title: l ? `${l.dars}: ${l.title}` : null,
          topic_title: l ? `${l.dars}: ${l.title}` : topic?.title || p.topic_slug || '',
          grade_num: l?.grade_num || topic?.grade_num || 5,
        };
      });
    res.json({
      records,
      total_students: db.users.filter((u) => u.role === 'student').length,
      total_attempts: db.testAttempts.length,
    });
  });

  // ==================== ORIGINAL-QUALITY MEDIA STORE ====================
  app.get('/api/v1/media', (_req, res) => {
    const list = [...db.media]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(serializeMedia);
    res.json(list);
  });

  app.post(
    '/api/v1/media',
    requireEducator,
    upload.single('file'),
    (req: AuthedRequest, res: Response) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ detail: 'Rasm fayli topilmadi.' });
        return;
      }
      const ext = path.extname(file.originalname || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        res
          .status(400)
          .json({ detail: 'Faqat PNG, JPG, JPEG, WEBP yoki GIF formatdagi rasmlarga ruxsat etiladi.' });
        return;
      }
      if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
        res.status(400).json({ detail: 'Noto‘g‘ri MIME turi.' });
        return;
      }
      const verifiedMime = validateImageMagicBytes(file.buffer);
      if (!verifiedMime) {
        res.status(400).json({ detail: 'Fayl mazmuni haqiqiy rasm sifatida tasdiqlanmadi.' });
        return;
      }

      // Preserve exact raw bytes without compression or re-encoding
      const safeName = `${crypto.randomUUID()}${ext}`;
      const targetPath = path.join(MEDIA_DIR, safeName);
      fs.writeFileSync(targetPath, file.buffer);

      const dims = detectImageDimensions(file.buffer, verifiedMime);
      const asset: StoredMediaAsset = {
        id: nextId(db, 'media'),
        title: String(req.body?.title || file.originalname || safeName).slice(0, 200),
        file: safeName,
        mime_type: verifiedMime,
        file_size: file.size,
        width: dims.width,
        height: dims.height,
        uploaded_by: req.currentUser?.id || null,
        created_at: new Date().toISOString(),
      };
      db.media.push(asset);
      saveDatabase(db);
      res.status(201).json(serializeMedia(asset));
    }
  );

  // Clean Multer size/upload errors
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ detail: 'Fayl hajmi 15 MB dan oshmasligi kerak.' });
      return;
    }
    next(err);
  });

  // ==================== VITE DEV / PROD STATIC SPA ====================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`NOVA INFORMATIKA server listening at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
