import { GradeId, GradeInfo, TopicUnit, GameDef } from './types';
import { TOPICS_5_TO_8 } from './curriculumPart1';
import { TOPICS_9_TO_11 } from './curriculumPart2';
import { GAMES_CATALOG } from './gamesData';

export const GRADE_INFOS: GradeInfo[] = [
  {
    grade: 5,
    title: '5-sinf Informatika',
    weeklyHours: 1,
    totalHours: 34,
    summary: 'Matn muharriri, grafik muharrir (Paint), diagramma va Excel asoslari, blok-sxema hamda robot labirinti, veb-brauzer va elektron pochta.',
    focusAreas: ['Matn tahrirlash va saqlash', 'Line / Pencil / Brush grafikasi', 'Piktogramma va Excel diagrammalari', 'Labirint va Sprayt harakati', 'Qidiruv tizimi va Email']
  },
  {
    grade: 6,
    title: '6-sinf Informatika',
    weeklyHours: 1,
    totalHours: 34,
    summary: 'Hujjat dizayni va tasvirlarni qayta ishlash, Excel sodda formulalari, Ma’lumotlar bazasi va Query, Scratch PEN/Protsedura/Dekompozitsiya, URL va taqdimot.',
    focusAreas: ['Auditoriyaga mos hujjat', 'Rotate / Flip / Resize', 'Katak manzili va Query', 'Scratch PEN va Dekompozitsiya', 'Ishonchli axborot va Taqdimot']
  },
  {
    grade: 7,
    title: '7-sinf Informatika',
    weeklyHours: 1,
    totalHours: 34,
    summary: 'Internet xavfsizligi, ustunli va rasmli hujjatlar, audio/animatsiyali taqdimotlar, Excelda modellashtirish (IF/Goal Seek) va Ma’lumotlar bazasi forma/filtr.',
    focusAreas: ['Internet xavfsizlik qoidalari', 'Slayd o‘tishi va audio', 'Excel IF() va Goal Seek', 'MB Forma, Filtr va Query']
  },
  {
    grade: 8,
    title: '8-sinf Informatika',
    weeklyHours: 1,
    totalHours: 34,
    summary: 'O‘yin dizayni va sprayt to‘qnashuvlari, HTML va CSS bilan veb-sahifa yaratish, kompyuter tarmoqlari (Hub/Switch/Router), Pencil2D va Audacity.',
    focusAreas: ['O‘yin yaratish va ballar', 'HTML/CSS veb-sahifa', 'Maktab tarmog‘ini loyihalash', 'Pencil2D va Audacity montaji']
  },
  {
    grade: 9,
    title: '9-sinf Informatika',
    weeklyHours: 2,
    totalHours: 68,
    summary: 'Apparat/dasturiy ta’minot, xotira hisob-kitoblari, tizim hayotiy sikli (SDLC), kiberxavfsizlik va mualliflik huquqi, brend stili, validatsiya/verifikatsiya, Mail Merge va Veb uch qatlami.',
    focusAreas: ['Kiritish/chiqarish va xotira masalalari', 'SDLC, Antivirus va Fayervol', 'Verifikatsiya va Validatsiya', 'Absolyut murojaat ($A$1)', 'HTML/CSS/JS uch qatlam']
  },
  {
    grade: 10,
    title: '10-sinf Informatika',
    weeklyHours: 2,
    totalHours: 68,
    summary: 'Simmetrik/asimmetrik shifrlash, sensorlar, kiber-tahdidlar (Phishing/Ransomware), LAN/WAN/VPN, Ekspert tizimlar, Excel INDEX/MATCH & Pivot, Relyatsion DB va 3NF normallashtirish.',
    focusAreas: ['Kodlash va Asimmetrik shifrlash', 'Sensorlar va Ekspert tizimlar', 'INDEX/MATCH, SUMIF va Pivot', '1:N / M:N va 3NF normallashtirish']
  },
  {
    grade: 11,
    title: '11-sinf Informatika',
    weeklyHours: 2,
    totalHours: 68,
    summary: 'Video/Audio montaj, AI/AR/VR/5G/Biometrika, Shlyuz va Bridj, paketli kommutatsiya, BitTorrent, Gantt diagrammasi, DFD, Qora/Oq quti sinovlari, Niqoblovchi qatlam va JavaScript dasturlash.',
    focusAreas: ['Video montaj va Reverberatsiya', 'AI, AR/VR, 5G va Biometrika', 'Shlyuz, Bridj va Gantt', 'Qora/Oq quti, Alfa/Beta sinov', 'JavaScript Array, Loop va Funksiyalar']
  }
];

export const TOPIC_UNITS: TopicUnit[] = [...TOPICS_5_TO_8, ...TOPICS_9_TO_11];

export function getTopicsByGrade(grade: GradeId): TopicUnit[] {
  return TOPIC_UNITS.filter((u) => u.grade === grade).sort((a, b) => a.order - b.order);
}

export function getGamesForTopic(topic: TopicUnit): GameDef[] {
  return topic.gameIds
    .map((id) => GAMES_CATALOG.find((g) => g.id === id))
    .filter((g): g is GameDef => Boolean(g));
}

export function getGameById(id: number): GameDef | undefined {
  return GAMES_CATALOG.find((g) => g.id === id);
}
