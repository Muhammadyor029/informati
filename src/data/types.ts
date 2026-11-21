export type GradeId = 5 | 6 | 7 | 8 | 9 | 10 | 11;

export enum GameEngine {
  ROBOT_MAZE = 'ROBOT_MAZE',
  QUIZ_BLITZ = 'QUIZ_BLITZ',
  CLASSIFY_SORT = 'CLASSIFY_SORT',
  FORMULA_BUILDER = 'FORMULA_BUILDER',
  MEMORY_PAIR = 'MEMORY_PAIR',
  HTML_CSS_LAB = 'HTML_CSS_LAB',
  CIPHER_NET = 'CIPHER_NET',
  DB_QUERY = 'DB_QUERY',
  PIXEL_GRID = 'PIXEL_GRID',
  CHART_GANTT = 'CHART_GANTT',
  TUG_OF_WAR = 'TUG_OF_WAR',
}

export function supportsPvpEngine(engine: GameEngine): boolean {
  return (
    engine === GameEngine.TUG_OF_WAR ||
    engine === GameEngine.QUIZ_BLITZ ||
    engine === GameEngine.CLASSIFY_SORT ||
    engine === GameEngine.MEMORY_PAIR ||
    engine === GameEngine.CIPHER_NET ||
    engine === GameEngine.FORMULA_BUILDER
  );
}

export type MiniAnimType =
  | 'typing'
  | 'raster'
  | 'chart'
  | 'maze'
  | 'email'
  | 'scratch'
  | 'excel'
  | 'database'
  | 'html'
  | 'network'
  | 'video'
  | 'hardware'
  | 'security'
  | 'sensor'
  | 'expert'
  | 'gantt'
  | 'jsloop';

export interface LessonRow {
  dars: string;
  title: string;
  hours: number;
  note: string;
  slug?: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface PracticeTask {
  id: string;
  title: string;
  instruction: string;
  placeholder: string;
  expectedKeywords: string[];
  sampleAnswer: string;
  hint: string;
}

export interface TopicUnit {
  id: string;
  grade: GradeId;
  order: number;
  term: string;
  lessonRange: string;
  totalHours: number;
  title: string;
  shortDesc: string;
  detailedExplanation: string[];
  keyConcepts: { term: string; meaning: string }[];
  lessons: LessonRow[];
  animType: MiniAnimType;
  animTitle: string;
  animSubtitle: string;
  gameIds: number[]; // Up to 5 topic-aligned games from the 58-game catalog
  tests: TestQuestion[]; // 10 tests per topic unit
  practices: PracticeTask[]; // 6 hands-on practices per topic unit
}

export interface GradeInfo {
  grade: GradeId;
  title: string;
  weeklyHours: number;
  totalHours: number;
  summary: string;
  focusAreas: string[];
}

export interface MazeLevelConfig {
  grid: number[][]; // 0 = empty, 1 = wall, 2 = start, 3 = goal
  startDir: 0 | 1 | 2 | 3; // 0: right, 1: down, 2: left, 3: up
  maxSteps: number;
  objective: string;
}

export interface BlitzQuestion {
  prompt: string;
  choices: string[];
  answer: number;
  tip: string;
}

export interface SortItem {
  label: string;
  categoryIndex: 0 | 1;
}

export interface FormulaChallenge {
  tableHint: string;
  prompt: string;
  accepted: string[];
  sample: string;
}

export interface PairItem {
  left: string;
  right: string;
}

export interface CodeChallenge {
  prompt: string;
  starter: string;
  requiredTokens: string[];
  previewHtml?: string;
  hint: string;
}

export interface CipherNetChallenge {
  prompt: string;
  detail: string;
  answer: string;
  options?: string[];
  hint: string;
}

export interface DbChallenge {
  tableName: string;
  columns: string[];
  rows: string[][];
  prompt: string;
  matchRowIndices: number[];
}

export interface PixelChallenge {
  size: number;
  target: number[]; // flat array of 0/1
  modeLabel: string;
}

export interface ChartChallenge {
  title: string;
  labels: string[];
  targets: number[];
  unit: string;
}

export interface GameDef {
  id: number;
  grade: GradeId;
  topicId: string;
  title: string;
  idea: string;
  engine: GameEngine;
  durationSec: number;
  maze?: MazeLevelConfig;
  blitz?: BlitzQuestion[];
  sort?: { categories: [string, string]; items: SortItem[] };
  formula?: FormulaChallenge[];
  memory?: PairItem[];
  codeLab?: CodeChallenge[];
  cipher?: CipherNetChallenge[];
  db?: DbChallenge[];
  pixel?: PixelChallenge;
  chart?: ChartChallenge;
  tug?: BlitzQuestion[];
}
