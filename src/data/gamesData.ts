import { GameDef, GameEngine } from './types';

export const GAMES_CATALOG: GameDef[] = [
  // ===================== 5-SINF (1–6) =====================
  {
    id: 1,
    grade: 5,
    topicId: 'g5-u1',
    title: 'Matn Muharriri Tezkor Klavishlari',
    idea: 'Matnni belgilash, nusxa olish, o‘chirish va saqlash tugmalarini tezlikda toping.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 60,
    blitz: [
      { prompt: 'Matndan nusxa olish (Copy) uchun qaysi klavishlar birikmasi bosiladi?', choices: ['Ctrl + C', 'Ctrl + V', 'Ctrl + X', 'Ctrl + Z'], answer: 0, tip: 'Ctrl + C — Copy (Nusxa olish).' },
      { prompt: 'Hujjatni tez saqlash (Save) buyrug‘i qaysi?', choices: ['Ctrl + P', 'Ctrl + S', 'Ctrl + A', 'Ctrl + N'], answer: 1, tip: 'Ctrl + S — Save (Saqlash).' },
      { prompt: 'Kursorning chap tomonidagi belgini o‘chirish tugmasi qaysi?', choices: ['Delete', 'Enter', 'Backspace', 'Shift'], answer: 2, tip: 'Backspace chapdan, Delete o‘ngdan o‘chiradi.' },
      { prompt: 'Butun matnni bir vaqtda belgilash (Select All) qaysi?', choices: ['Ctrl + A', 'Ctrl + B', 'Ctrl + F', 'Alt + Tab'], answer: 0, tip: 'Ctrl + A barcha matnni belgilaydi.' },
      { prompt: 'Hujjatni qog‘ozga chop etish (Print) tugmasi qaysi?', choices: ['Ctrl + O', 'Ctrl + P', 'Ctrl + Z', 'Ctrl + X'], answer: 1, tip: 'Ctrl + P — Print.' }
    ]
  },
  {
    id: 2,
    grade: 5,
    topicId: 'g5-u3',
    title: 'Piksel Rassomi: Line va Brush',
    idea: '5x5 piksel panjarasida berilgan shakl namunasini chizib bering.',
    engine: GameEngine.PIXEL_GRID,
    durationSec: 90,
    pixel: {
      size: 5,
      modeLabel: 'Chiziq va shakl chizish namunasi (Kichik uy)',
      target: [
        0, 0, 1, 0, 0,
        0, 1, 0, 1, 0,
        1, 1, 1, 1, 1,
        1, 0, 0, 0, 1,
        1, 1, 1, 1, 1
      ]
    }
  },
  {
    id: 3,
    grade: 5,
    topicId: 'g5-u5',
    title: 'Diagramma Quruvchi: Sinf Ko‘rsatkichlari',
    idea: 'Jadvaldagi axborot qiymatiga mos ustunli diagramma balandligini sozlang.',
    engine: GameEngine.CHART_GANTT,
    durationSec: 90,
    chart: {
      title: '5-sinf o‘quvchilari fan tanlovi',
      labels: ['Matematika', 'Informatika', 'Ingliz tili', 'Tarix'],
      targets: [6, 9, 7, 4],
      unit: 'nafar'
    }
  },
  {
    id: 4,
    grade: 5,
    topicId: 'g5-u7',
    title: 'Robot Labirinti: 26-dars Simulyatori',
    idea: 'Blok-buyruqlar yordamida robotni to‘siqlardan o‘tkazib marraga yetkazing.',
    engine: GameEngine.ROBOT_MAZE,
    durationSec: 120,
    maze: {
      grid: [
        [2, 0, 1, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 3]
      ],
      startDir: 0,
      maxSteps: 14,
      objective: 'Robotni yashil bayroqchaga (pastki o‘ng burchak) olib boring.'
    }
  },
  {
    id: 5,
    grade: 5,
    topicId: 'g5-u4',
    title: 'Grafik Muharrir Uskunalari',
    idea: 'Paint dasturi uskunalarini ularning vazifasi bilan juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'Pencil', right: 'Ingichka qalam bilan chizish' },
      { left: 'Brush', right: 'Turli qalinlikda bo‘yash' },
      { left: 'Line', right: 'To‘g‘ri chiziq tortish' },
      { left: 'Eraser', right: 'Chizilgan qismni o‘chirish' },
      { left: 'Crop / Cut', right: 'Tasvir qismini kesib olish' }
    ]
  },
  {
    id: 6,
    grade: 5,
    topicId: 'g5-u8',
    title: 'Elektron Pochta Saralagichi',
    idea: 'Kelgan xatlarni "Xavfsiz xat" yoki "Shubhali / Spam" guruhiga ajrating.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Xavfsiz xat', 'Shubhali / Spam'],
      items: [
        { label: 'Maktab kutubxonasidan dars jadvali', categoryIndex: 0 },
        { label: 'Siz 1 000 000$ yutdingiz, parolni yuboring!', categoryIndex: 1 },
        { label: 'Informatika o‘qituvchisidan uyga vazifa', categoryIndex: 0 },
        { label: 'Noma’lum manzildan .exe faylli sovg‘a', categoryIndex: 1 },
        { label: 'Sinfdoshdan loyiha taqdimoti', categoryIndex: 0 },
        { label: 'Hisobingiz bloklandi, hoziroq karta raqamini kiriting', categoryIndex: 1 }
      ]
    }
  },

  // ===================== 6-SINF (7–12) =====================
  {
    id: 7,
    grade: 6,
    topicId: 'g6-u1',
    title: 'Hujjat Dizayneri: Shrift va Tekislash',
    idea: 'Auditoriya va matn formatlash qoidalari bo‘yicha tezkor savol-javob.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 60,
    blitz: [
      { prompt: 'Matnni sahifa markaziga tekislash (Center) tugmasi qaysi?', choices: ['Ctrl + E', 'Ctrl + L', 'Ctrl + R', 'Ctrl + J'], answer: 0, tip: 'Ctrl + E — Center alignment.' },
      { prompt: 'Matn o‘lchami qanday birlikda o‘lchanadi?', choices: ['Piksel (px)', 'Punkt (pt)', 'Bayt (B)', 'Gerts (Hz)'], answer: 1, tip: 'Matn muharrirlarida shrift o‘lchami pt (punkt) da beriladi.' },
      { prompt: 'Hujjatni bolalar uchun tayyorlaganda nima muhim?', choices: ['Katta shrift va rangli tasvirlar', 'Juda mayda 8pt shrift', 'Faqat jadvallar', 'Sarlavhasiz matn'], answer: 0, tip: 'Auditoriyaga moslash — 6-sinf 4-dars mavzusi.' },
      { prompt: 'Hujjat chetiga bezakli ramka qo‘yish nima deyiladi?', choices: ['Footer', 'Hoshiya (Page Border)', 'Query', 'Formula'], answer: 1, tip: '3-dars: Hujjatga tasvir va hoshiya qo‘shish.' }
    ]
  },
  {
    id: 8,
    grade: 6,
    topicId: 'g6-u2',
    title: 'Tasvirni Aylantirish Studiyasi',
    idea: '4x4 rastrli strelkani 90° o‘ngga aylantirilgan ko‘rinishini tiklang.',
    engine: GameEngine.PIXEL_GRID,
    durationSec: 90,
    pixel: {
      size: 4,
      modeLabel: 'O‘ngga qaragan strelkani hosil qiling',
      target: [
        0, 0, 1, 0,
        1, 1, 1, 1,
        0, 0, 1, 0,
        0, 0, 0, 0
      ]
    }
  },
  {
    id: 9,
    grade: 6,
    topicId: 'g6-u3',
    title: 'Sodda Formula Ustasi',
    idea: 'Katak manzillaridan foydalanib Excel formulasini to‘g‘ri yozing.',
    engine: GameEngine.FORMULA_BUILDER,
    durationSec: 90,
    formula: [
      { tableHint: 'A1=15, B1=25', prompt: 'A1 va B1 kataklar yig‘indisini hisoblovchi formula yozing:', accepted: ['=A1+B1', '=SUM(A1:B1)', '=SUM(A1,B1)'], sample: '=A1+B1' },
      { tableHint: 'A2=100, B2=4', prompt: 'A2 ni B2 ga bo‘lish formulasini kiriting:', accepted: ['=A2/B2'], sample: '=A2/B2' },
      { tableHint: 'C1=12, C2=5', prompt: 'C1 va C2 kataklar ko‘paytmasini toping:', accepted: ['=C1*C2'], sample: '=C1*C2' }
    ]
  },
  {
    id: 10,
    grade: 6,
    topicId: 'g6-u5',
    title: 'Scratch Takrorlash Labirinti',
    idea: 'Dekompozitsiya va takrorlash (Loop) fikrlashi bilan robotni maqsadga olib boring.',
    engine: GameEngine.ROBOT_MAZE,
    durationSec: 120,
    maze: {
      grid: [
        [2, 0, 0, 0, 1],
        [1, 1, 1, 0, 1],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [3, 0, 0, 0, 0]
      ],
      startDir: 0,
      maxSteps: 18,
      objective: 'Takrorlanuvchi burilishlar orqali pastki chap burchakdagi finishga yeting.'
    }
  },
  {
    id: 11,
    grade: 6,
    topicId: 'g6-u4',
    title: 'Query Ma’lumot Qidiruvchisi',
    idea: 'Teng shartli Query yordamida jadvaldan aniq yozuvlarni ajratib oling.',
    engine: GameEngine.DB_QUERY,
    durationSec: 90,
    db: [
      {
        tableName: 'Oquvchilar',
        columns: ['Ism', 'Sinf', 'Baho'],
        rows: [
          ['Aziza', '6-A', '5'],
          ['Jasur', '6-B', '4'],
          ['Madina', '6-A', '5'],
          ['Bobur', '6-A', '4']
        ],
        prompt: 'Shart: Sinf = "6-A" VA Baho = "5" bo‘lgan qatorlarni belgilang.',
        matchRowIndices: [0, 2]
      }
    ]
  },
  {
    id: 12,
    grade: 6,
    topicId: 'g6-u7',
    title: 'Web Manzil va Axborot Ishonchliligi',
    idea: 'Manbalarni "Ishonchli manba" va "Tekshirilmagan / Soxta" ga ajrating.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Ishonchli manba', 'Tekshirilmagan / Shubhali'],
      items: [
        { label: 'https://gov.uz rasmiy portali', categoryIndex: 0 },
        { label: 'Muallifsiz va sanasiz shov-shuvli blog', categoryIndex: 1 },
        { label: 'Rasmiy universitet ensiklopediyasi (.edu)', categoryIndex: 0 },
        { label: 'http://free-prize-win99.xyz', categoryIndex: 1 },
        { label: 'Rasmiy darslik nashriyoti sahifasi', categoryIndex: 0 }
      ]
    }
  },

  // ===================== 7-SINF (13–17) =====================
  {
    id: 13,
    grade: 7,
    topicId: 'g7-u1',
    title: 'Hujjat Formatlash Juftliklari',
    idea: '7-sinf Word/Docs terminlarini vazifalari bilan moslang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'Wrap Text', right: 'Rasm atrofida matn oqimi' },
      { left: 'Header', right: 'Har sahifa tepasidagi sarlavha' },
      { left: 'Footer', right: 'Sahifa pastki kolontituli' },
      { left: 'Print Preview', right: 'Chop etishdan oldingi ko‘rinish' },
      { left: 'Columns', right: 'Matnni ustunlarga bo‘lish' }
    ]
  },
  {
    id: 14,
    grade: 7,
    topicId: 'g7-u3',
    title: 'Taqdimot va Animatsiya Rejissyori',
    idea: 'Slayd o‘tishlari, vaqt va audio qo‘shish bo‘yicha blits o‘yin.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 60,
    blitz: [
      { prompt: 'Bir slayddan ikkinchisiga o‘tish effekti nima deyiladi?', choices: ['Transition', 'Header', 'Query', 'Wrap Text'], answer: 0, tip: 'Transition — slaydlararo o‘tish effekti.' },
      { prompt: 'Slayd ichidagi matn yoki rasm harakati nima?', choices: ['Animation', 'Margin', 'Footer', 'Filter'], answer: 0, tip: 'Animation slayd ichidagi obyektlarga qo‘llanadi.' },
      { prompt: 'Taqdimotga nutq yoki musiqa qo‘shish bo‘limi qaysi?', choices: ['Insert -> Audio', 'File -> Print', 'View -> Grid', 'Data -> Sort'], answer: 0, tip: '12-dars: Slaydlarga vaqt va audio qo‘shish.' },
      { prompt: 'Taqdimot vaqtini tomoshabin diqqatiga moslash nima uchun kerak?', choices: ['Matnni o‘qishga ulgurish uchun', 'Faylni buzish uchun', 'Internetni o‘chirish uchun', 'Shriftni kichraytirish uchun'], answer: 0, tip: '14-dars: Animatsiya va vaqtni moslash.' }
    ]
  },
  {
    id: 15,
    grade: 7,
    topicId: 'g7-u5',
    title: 'Elektron Jadvalda Modellashtirish',
    idea: 'Xarajatlar modelini hisoblash uchun Excel funksiyalarini tuzing.',
    engine: GameEngine.FORMULA_BUILDER,
    durationSec: 90,
    formula: [
      { tableHint: 'B2:B6 oralig‘ida kundalik xarajatlar', prompt: 'B2 dan B6 gacha bo‘lgan sonlar yig‘indisini toping:', accepted: ['=SUM(B2:B6)'], sample: '=SUM(B2:B6)' },
      { tableHint: 'C2:C6 oralig‘ida ballar', prompt: 'C2:C6 oralig‘ining o‘rtacha qiymatini hisoblang:', accepted: ['=AVERAGE(C2:C6)'], sample: '=AVERAGE(C2:C6)' },
      { tableHint: 'D2=85 (o‘tish bali 60)', prompt: 'Agar D2 >= 60 bo‘lsa "Otdi" aks holda "Qoldi" chiqaruvchi formula:', accepted: ['=IF(D2>=60,"Otdi","Qoldi")', '=IF(D2>=60, "Otdi", "Qoldi")'], sample: '=IF(D2>=60,"Otdi","Qoldi")' }
    ]
  },
  {
    id: 16,
    grade: 7,
    topicId: 'g7-u7',
    title: 'Ma’lumotlar Bazasi Forma & Filtr',
    idea: 'Jadvaldan kerakli yozuvlarni ma’lumot turlari va shart bo‘yicha ajrating.',
    engine: GameEngine.DB_QUERY,
    durationSec: 90,
    db: [
      {
        tableName: 'Kutubxona_Kitoblar',
        columns: ['Kitob', 'Turi', 'Soni'],
        rows: [
          ['Algoritmlar', 'Darslik', '12'],
          ['She’riyat', 'Badiiy', '5'],
          ['Python asoslari', 'Darslik', '8'],
          ['Ertaklar', 'Badiiy', '15']
        ],
        prompt: 'Turi = "Darslik" VA Soni >= 10 bo‘lgan kitobni tanlang.',
        matchRowIndices: [0]
      }
    ]
  },
  {
    id: 17,
    grade: 7,
    topicId: 'g7-u2',
    title: 'Internetda Xavfsizlik Qalqoni',
    idea: 'Onlayn harakatlarni "Xavfsiz odat" va "Xavfli harakat" ga ajrating.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Xavfsiz odat', 'Xavfli harakat'],
      items: [
        { label: 'Murakkab va noyob parol o‘rnatish', categoryIndex: 0 },
        { label: 'Parolni chatda do‘stga yuborish', categoryIndex: 1 },
        { label: 'Ikki bosqichli tasdiqlash (2FA) yoqish', categoryIndex: 0 },
        { label: 'Umumiy Wi-Fi da bank parolini kiritish', categoryIndex: 1 },
        { label: 'Shaxsiy ma’lumotlarni maxfiy saqlash', categoryIndex: 0 }
      ]
    }
  },

  // ===================== 8-SINF (18–22) =====================
  {
    id: 18,
    grade: 8,
    topicId: 'g8-u1',
    title: 'Sprayt To‘qnashuvi va Marshrut',
    idea: '8-sinf o‘yin yaratish mantiqi: devorlarga to‘qnashmasdan finishga yeting.',
    engine: GameEngine.ROBOT_MAZE,
    durationSec: 120,
    maze: {
      grid: [
        [2, 0, 1, 0, 3],
        [0, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0]
      ],
      startDir: 1,
      maxSteps: 16,
      objective: 'To‘qnashuv shartlarini chetlab yuqori o‘ng burchakka chiqing.'
    }
  },
  {
    id: 19,
    grade: 8,
    topicId: 'g8-u3',
    title: 'HTML Teg Quruvchi Studiya',
    idea: 'Veb-sahifa sarlavhasi va link teglarini jonli kodda yozing.',
    engine: GameEngine.HTML_CSS_LAB,
    durationSec: 120,
    codeLab: [
      {
        prompt: '<h1> tegi ichida "Salom Web" sarlavhasini va <a href="..."> tegi bilan havola yozing.',
        starter: '<!-- 1. "Salom Web" sarlavhasini yozing -->\n\n<!-- 2. "Batafsil" havolasini yozing -->\n',
        requiredTokens: ['<h1', 'salom web', '</h1>', '<a', 'href=', '</a>'],
        hint: 'Sarlavha uchun ochiluvchi va yopiluvchi h1, havola uchun href atributli a tegidan foydalaning.'
      }
    ]
  },
  {
    id: 20,
    grade: 8,
    topicId: 'g8-u4',
    title: 'HTML Tasvir va Rang Dizayneri',
    idea: 'Veb-sahifaga <img> yoki rangli uslub qo‘shish mashqi.',
    engine: GameEngine.HTML_CSS_LAB,
    durationSec: 120,
    codeLab: [
      {
        prompt: 'Paragraf matnining rangini ko‘k (#1e40af) qilib belgilovchi style atributini yozing.',
        starter: '<p>Informatika 8-sinf</p>\n<!-- Matn rangini ko‘k (#1e40af) qilib belgilang -->',
        requiredTokens: ['<p', 'style=', 'color:', '#1e40af', '</p>'],
        hint: 'Tashqi ko‘rinishni o‘zgartirish uchun teg ichida style="color: #1e40af;" yozing.'
      }
    ]
  },
  {
    id: 21,
    grade: 8,
    topicId: 'g8-u5',
    title: 'Tarmoq Komponentlari: Hub, Switch, Router',
    idea: '8-sinf 19-dars tarmoq qurilmalarini vazifalari bilan juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'Router', right: 'Tarmoqlarni bog‘laydi, IP yo‘naltiradi' },
      { left: 'Switch', right: 'MAC manzil orqali paket uzatadi' },
      { left: 'Hub', right: 'Signalni barcha portlarga tarqatadi' },
      { left: 'Modem', right: 'Raqamli va analog signalni aylantiradi' },
      { left: 'RJ-45 Jek', right: 'UTP kabel uchidagi ulagich' }
    ]
  },
  {
    id: 22,
    grade: 8,
    topicId: 'g8-u7',
    title: 'Video, Pencil2D va Audacity Ustasi',
    idea: 'Animatsiya va ovoz tahrirlash dasturlari bo‘yicha savollar.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 60,
    blitz: [
      { prompt: 'Pencil2D dasturi nima uchun ishlatiladi?', choices: ['2D kadrli animatsiya yaratish', 'Elektron jadval tuzish', 'SQL so‘rov yozish', 'Tarmoq kabelini siqish'], answer: 0, tip: '26-dars: Pencil2D dasturidan foydalanish.' },
      { prompt: 'Audacity dasturining asosiy vazifasi nima?', choices: ['Audio va ovozni tahrirlash', '3D modellashtirish', 'Veb server sozlash', 'PDF chop etish'], answer: 0, tip: '32-dars: Audacity dasturida ishlash.' },
      { prompt: 'Video ustidan o‘qiladigan ovozli sharh nima deyiladi?', choices: ['Narration', 'Compilation', 'Validation', 'Ping'], answer: 0, tip: '29-dars: Ovozli sharh (Narration) qo‘shish.' },
      { prompt: 'Reklama videosi yaratishda birinchi nimani inobatga olish kerak?', choices: ['Auditoriya talabini', 'Kabel uzunligini', 'DNS portini', 'BIOS versiyasini'], answer: 0, tip: '30-dars: Auditoriya talablarini inobatga olish.' }
    ]
  },

  // ===================== 9-SINF (23–28) =====================
  {
    id: 23,
    grade: 9,
    topicId: 'g9-u1',
    title: 'Kiritish, Chiqarish va Xotira Qurilmalari',
    idea: 'Qurilmalarni Kiritish (Input) yoki Chiqarish (Output) toifasiga ajrating.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Kiritish qurilmasi (Input)', 'Chiqarish qurilmasi (Output)'],
      items: [
        { label: 'Skaner va Shtrix-kod o‘quvchi', categoryIndex: 0 },
        { label: 'Lazerli printer va Plotter', categoryIndex: 1 },
        { label: 'Mikrofon va Veb-kamera', categoryIndex: 0 },
        { label: 'Proyektor va Monitor', categoryIndex: 1 },
        { label: 'Grafik planshet (Digitizer)', categoryIndex: 0 },
        { label: 'Dinamik (Karnay)', categoryIndex: 1 }
      ]
    }
  },
  {
    id: 24,
    grade: 9,
    topicId: 'g9-u1',
    title: 'Xotira Hajmi Kalkulyatori',
    idea: '9-sinf 10-dars: Bit, Bayt, KB, MB, GB birliklarini tez hisoblang.',
    engine: GameEngine.CIPHER_NET,
    durationSec: 90,
    cipher: [
      { prompt: '2 Kilobayt (KB) necha Baytga teng?', detail: '1 KB = 1024 Bayt deb hisoblang.', answer: '2048', options: ['1000', '2048', '1024', '4096'], hint: 'KB ni Baytga aylantirish uchun sonni 1024 ga ko‘paytiring.' },
      { prompt: '3 Bayt necha Bitdan iborat?', detail: '1 Bayt = 8 Bit.', answer: '24', options: ['16', '24', '32', '12'], hint: 'Har bir baytda 8 ta bit borligidan foydalaning.' },
      { prompt: '4096 Megabayt (MB) necha Gigabayt (GB)?', detail: '1 GB = 1024 MB.', answer: '4', options: ['2', '4', '8', '16'], hint: 'MB dan GB ga o‘tish uchun 1024 ga bo‘ling.' }
    ]
  },
  {
    id: 25,
    grade: 9,
    topicId: 'g9-u4',
    title: 'Kiberxavfsizlik va Mualliflik Huquqi',
    idea: 'Xavfsizlik vositalari va qonunbuzarlik tushunchalarini ajrating.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Himoya / Qonuniy amal', 'Tahdid / Qonunbuzarlik'],
      items: [
        { label: 'Fayervol (Firewall) va Antivirus yoqish', categoryIndex: 0 },
        { label: 'Ommaviy spam xabar tarqatish', categoryIndex: 1 },
        { label: 'Muallif ruxsati bilan iqtibos keltirish', categoryIndex: 0 },
        { label: 'Litsenziyasiz dasturni noqonuniy nusxalash', categoryIndex: 1 },
        { label: 'Kuchli autentifikatsiya qo‘llash', categoryIndex: 0 }
      ]
    }
  },
  {
    id: 26,
    grade: 9,
    topicId: 'g9-u5',
    title: 'Fayl Formatlari va Verifikatsiya',
    idea: 'Fayl kengaytmalari, siqish, validatsiya va verifikatsiya blitsi.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 60,
    blitz: [
      { prompt: 'Ma’lumotni ikki marta kiritib yoki asl manba bilan solishtirib tekshirish nima?', choices: ['Verifikatsiya', 'Siqish', 'Formatlash', 'Render'], answer: 0, tip: '48-dars: Verifikatsiya — asl nusxaga moslikni tekshirish.' },
      { prompt: 'Fayl hajmini kichraytirish (arxivlash) formati qaysi?', choices: ['.zip', '.bmp', '.wav', '.txt'], answer: 0, tip: '34-dars: Saqlash yoki uzatish uchun fayl hajmini kamaytirish.' },
      { prompt: 'Shaffof fonni qo‘llab-quvvatlovchi rastrli tasvir kengaytmasi qaysi?', choices: ['.png', '.jpg', '.mp3', '.csv'], answer: 0, tip: 'PNG shaffoflik (alpha) kanaliga ega.' },
      { prompt: 'Korporativ brend stiliga rioya qilish nimani beradi?', choices: ['Hujjat va slaydlar izchilligini', 'Fayl buzilishini', 'Virus ko‘payishini', 'Matn o‘chishini'], answer: 0, tip: '43–44-dars: Korporativ brend va izchillik.' }
    ]
  },
  {
    id: 27,
    grade: 9,
    topicId: 'g9-u8',
    title: 'Absolyut ($A$1) va Nisbiy Murojaat',
    idea: 'Nusxalanganda o‘zgarmaydigan absolyut murojaat formulasini yozing.',
    engine: GameEngine.FORMULA_BUILDER,
    durationSec: 90,
    formula: [
      { tableHint: 'B1 katakda QQS stavkasi 12%', prompt: 'A2 ni o‘zgarmas $B$1 katakka ko‘paytiruvchi formula yozing:', accepted: ['=A2*$B$1', '=$B$1*A2'], sample: '=A2*$B$1' },
      { tableHint: 'C2:C10 narxlar ro‘yxati', prompt: 'Eng katta qiymatni topuvchi formula:', accepted: ['=MAX(C2:C10)'], sample: '=MAX(C2:C10)' }
    ]
  },
  {
    id: 28,
    grade: 9,
    topicId: 'g9-u8',
    title: 'Veb Dasturlashning Uch Qatlami',
    idea: 'HTML tuzilma va CSS stil jadvalini birlashtirib sahifa yarating.',
    engine: GameEngine.HTML_CSS_LAB,
    durationSec: 120,
    codeLab: [
      {
        prompt: '<style> tegi ichida h1 rangi va ichki <a href="#top"> ankor linkini yozing.',
        starter: '<style>\n  /* Sarlavha matn rangini yozing */\n</style>\n<h1 id="top">9-sinf Veb</h1>\n<!-- Pastga yuqoriga qaytaruvchi ankor havola qo‘shing -->\n',
        requiredTokens: ['<style>', 'h1', 'color:', 'href="#top"', '</a>'],
        hint: 'Ichki CSS da h1 { color: ... } va ankor havola uchun href="#top" ishlatiladi.'
      }
    ]
  },

  // ===================== 10-SINF (29–34) =====================
  {
    id: 29,
    grade: 10,
    topicId: 'g10-u1',
    title: 'Simmetrik Shifrlash Dekoderi',
    idea: '10-sinf 2-dars: Sezar siljitish shifri bilan maxfiy kalitni oching.',
    engine: GameEngine.CIPHER_NET,
    durationSec: 90,
    cipher: [
      { prompt: 'Kalit = +1 (har bir harf 1 ta keyingi harfga o‘tgan). "OPWB" so‘zini deshifrlang:', detail: 'Alifbo: A B C D ... N O P Q R S T U V W X Y Z', answer: 'NOVA', options: ['DATA', 'NOVA', 'CODE', 'BYTE'], hint: 'Alifbo bo‘yicha har bir harfni 1 o‘rin orqaga suring.' },
      { prompt: 'Simmetrik shifrlashda nechta kalit ishlatiladi?', detail: 'Shifrlash va deshifrlash uchun.', answer: '1 ta umumiy kalit', options: ['2 ta (ochiq va yopiq)', '1 ta umumiy kalit', 'Kalit kerak emas', '4 ta kalit'], hint: 'Shifrlovchi ham, ochuvchi ham ayni bir maxfiy kalitdan foydalanadi.' },
      { prompt: 'Asimmetrik shifrlashda qaysi kalitlar jufti ishlaydi?', detail: 'RSA / SSL protokoli misolida.', answer: 'Ochiq va yopiq kalit', options: ['Faqat parol', 'Faqat MAC manzil', 'Ochiq va yopiq kalit', 'Faqat IP'], hint: 'Biri hammaga ko‘rinadigan, ikkinchisi sir saqlanadigan juftlik.' }
    ]
  },
  {
    id: 30,
    grade: 10,
    topicId: 'g10-u2',
    title: 'Kiber-Tahdidlar Ovchisi',
    idea: '10-sinf 14-dars: Phishing, Ransomware, Spyware, Troyan tahdidlarini ajrating.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Firibgarlik (Ijtimoiy muhandislik)', 'Zararli dastur (Malware)'],
      items: [
        { label: 'Phishing (soxta bank sahifasi xati)', categoryIndex: 0 },
        { label: 'Ransomware (fayllarni shifrlab to‘lov talab qilish)', categoryIndex: 1 },
        { label: 'Vishing (telefon qo‘ng‘irog‘i orqali aldash)', categoryIndex: 0 },
        { label: 'Troyan / Worm / Spyware', categoryIndex: 1 },
        { label: 'Pharming (soxta DNS manziliga yo‘naltirish)', categoryIndex: 0 },
        { label: 'Rootkit (tizimda yashirin kirish saqlash)', categoryIndex: 1 }
      ]
    }
  },
  {
    id: 31,
    grade: 10,
    topicId: 'g10-u4',
    title: 'Sensorlar va Ekspert Tizimlar',
    idea: '10-sinf 12 va 26–29-darslar: Sensorlar va ekspert tizim qismlarini juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'Bilimlar bazasi', right: 'Ekspert tizimdagi fakt va qoidalar' },
      { left: 'Yakunlovchi mexanizm', right: 'Qoidalar asosida xulosa chiqaruvchi dvigatel' },
      { left: 'Harorat sensori', right: 'Issiqxona va konditsionerni nazorat qiladi' },
      { left: 'Bosim sensori', right: 'Avtomatik eshik va tarozida ishlatiladi' },
      { left: 'Real vaqt tizimi', right: 'Darhol kechikishsiz javob qaytaradi' }
    ]
  },
  {
    id: 32,
    grade: 10,
    topicId: 'g10-u3',
    title: 'LAN, WAN, VPN va Tarmoq Arxitekturasi',
    idea: 'Tarmoq turlari va arxitektura savollari bo‘yicha blits.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 60,
    blitz: [
      { prompt: 'Bir bino yoki maktab ichidagi lokal tarmoq qaysi?', choices: ['LAN', 'WAN', 'VPN', 'PAN'], answer: 0, tip: '19-dars: LAN — Local Area Network.' },
      { prompt: 'Ochiq internet orqali shifrlangan xavfsiz kanal yaratuvchi texnologiya?', choices: ['VPN', 'Hub', 'HTML', 'ASCII'], answer: 0, tip: '21-dars: Virtual shaxsiy tarmoq (VPN).' },
      { prompt: 'Tashkilotning tashqi hamkorlar uchun cheklangan ichki tarmog‘i nima?', choices: ['Ekstranet', 'Intranet', 'Lokal disk', 'Rootkit'], answer: 0, tip: '22-dars: Intranet — ichki, Ekstranet — hamkorlar uchun.' },
      { prompt: 'Barcha tugunlar teng huquqli bo‘lgan tarmoq modeli qaysi?', choices: ['Peer-to-peer (P2P)', 'Client-Server', 'Mainframe', 'Serial'], answer: 0, tip: '20-dars: Kliyent-server va peer-to-peer.' }
    ]
  },
  {
    id: 33,
    grade: 10,
    topicId: 'g10-u5',
    title: 'INDEX, MATCH va Shartli Statistik Funksiyalar',
    idea: '10-sinf 3-chorak: Murakkab Excel funksiyalarini tuzing.',
    engine: GameEngine.FORMULA_BUILDER,
    durationSec: 90,
    formula: [
      { tableHint: 'A2:A10 — Hudud, B2:B10 — Savdo', prompt: 'A2:A10 da "Toshkent" bo‘lganlarning B2:B10 yig‘indisini toping:', accepted: ['=SUMIF(A2:A10,"Toshkent",B2:B10)', '=SUMIF(A2:A10, "Toshkent", B2:B10)'], sample: '=SUMIF(A2:A10,"Toshkent",B2:B10)' },
      { tableHint: 'C2:C20 — Ballar', prompt: '80 dan katta ballar sonini sanovchi formula:', accepted: ['=COUNTIF(C2:C20,">80")', '=COUNTIF(C2:C20, ">80")'], sample: '=COUNTIF(C2:C20,">80")' }
    ]
  },
  {
    id: 34,
    grade: 10,
    topicId: 'g10-u7',
    title: 'Relyatsion DB & Murakkab Query',
    idea: '10-sinf 4-chorak: Tashqi kalitlar va ko‘p shartli query filter.',
    engine: GameEngine.DB_QUERY,
    durationSec: 90,
    db: [
      {
        tableName: 'Buyurtmalar (1:N)',
        columns: ['ID', 'Mijoz_ID', 'Holat', 'Summa'],
        rows: [
          ['101', 'M-01', 'Tolangan', '450000'],
          ['102', 'M-02', 'Kutilmoqda', '210000'],
          ['103', 'M-01', 'Tolangan', '890000'],
          ['104', 'M-03', 'Bekor', '150000']
        ],
        prompt: 'Mijoz_ID = "M-01" VA Summa > 500000 bo‘lgan buyurtmani toping.',
        matchRowIndices: [2]
      }
    ]
  },

  // ===================== 11-SINF (35–40) =====================
  {
    id: 35,
    grade: 11,
    topicId: 'g11-u1',
    title: 'Audio/Video Montaj va Effektlar',
    idea: '11-sinf 1–10-darslar: Audio/Video montaj atamalarini juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'Reverberatsiya', right: 'Xona aks-sado akustik effekti' },
      { left: 'Mutanosiblik (Aspect Ratio)', right: 'Kadr kenglik va balandlik nisbati (16:9)' },
      { left: 'Subtitr', right: 'Video ostidagi matnli tarjima/izoh' },
      { left: 'Export MP4', right: 'Videoni tayyor faylga chiqarish' },
      { left: 'Split / Cut', right: 'Klipni kerakli nuqtadan kesish' }
    ]
  },
  {
    id: 36,
    grade: 11,
    topicId: 'g11-u2',
    title: 'Zamonaviy Texnologiyalar: AI, AR/VR, 5G',
    idea: '11-sinf 12–16-darslar: 3D printer, Biometrika, Cloud va AR/VR blitsi.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 60,
    blitz: [
      { prompt: 'Haqiqiy dunyo tasviri ustiga raqamli obyekt qo‘shadigan texnologiya?', choices: ['Boyitilgan reallik (AR)', 'BitTorrent', 'Fayervol', 'Gantt'], answer: 0, tip: '13-dars: Boyitilgan reallik (AR) vs Virtual reallik (VR).' },
      { prompt: 'Barmoq izi yoki yuz orqali shaxsni aniqlash qaysi axborot turi?', choices: ['Biometrik axborot', 'Golografiya', 'Rastrli piksel', 'Mail merge'], answer: 0, tip: '13-dars: Biometrik axborot.' },
      { prompt: 'Internet orqali server resurslaridan masofadan foydalanish nima?', choices: ['Bulutli texnologiyalar', 'Kanalli kommutatsiya', '3NF', 'Alfa sinov'], answer: 0, tip: '13-dars: Bulutli texnologiyalar (Cloud).' },
      { prompt: 'Smart-soat va fitnes bilaguzuklar qaysi turkumga kiradi?', choices: ['Taqiladigan hisoblash qurilmalari', 'Shlyuzlar', 'Bridjlar', 'Plotterlar'], answer: 0, tip: '15-dars: QR kodlar va taqiladigan qurilmalar.' }
    ]
  },
  {
    id: 37,
    grade: 11,
    topicId: 'g11-u4',
    title: 'Shlyuz, Bridj va Polosa Kengligi',
    idea: '11-sinf 26–33-darslar: Tarmoq qurilmalari va bit tezligi masalalari.',
    engine: GameEngine.CIPHER_NET,
    durationSec: 90,
    cipher: [
      { prompt: 'Turli protokollarga ega ikki tarmoqni bog‘lovchi qurilma qaysi?', detail: '11-sinf 28-dars: Shlyuz, Bridj va Fayervol.', answer: 'Shlyuz (Gateway)', options: ['Repeater', 'Shlyuz (Gateway)', 'Printer', 'Klaviatura'], hint: 'Ushbu qurilma turli tarmoq protokollari o‘rtasida tarjimon vazifasini bajaradi.' },
      { prompt: '80 Megabit/s tezlikda 10 Megabaytli fayl necha sekundda yuklanadi?', detail: '10 MB = 80 Megabit.', answer: '1 sekund', options: ['8 sekund', '10 sekund', '1 sekund', '0.5 sekund'], hint: 'Avval 10 Megabaytni 8 ga ko‘paytirib Megabitga o‘tkazing, so‘ng tezlikka bo‘ling.' },
      { prompt: 'Fayllarni markaziy serversiz bo‘lib-bo‘lib almashish protokoli qaysi?', detail: '33-dars mavzusi.', answer: 'BitTorrent', options: ['SMTP', 'POP3', 'DHCP', 'BitTorrent'], hint: 'Markaziy serversiz P2P bo‘lakli almashinuv protokoli.' }
    ]
  },
  {
    id: 38,
    grade: 11,
    topicId: 'g11-u5',
    title: 'Gantt Diagrammasi va Loyiha Bosqichlari',
    idea: '11-sinf 39-dars: Loyiha bosqichlarining hafta davomiyligini Gantt grafigiga joylang.',
    engine: GameEngine.CHART_GANTT,
    durationSec: 90,
    chart: {
      title: 'Tizim yaratish Gantt muddati (haftalar)',
      labels: ['Tahlil', 'Dizayn', 'Kodlash', 'Sinov'],
      targets: [2, 3, 6, 3],
      unit: 'hafta'
    }
  },
  {
    id: 39,
    grade: 11,
    topicId: 'g11-u7',
    title: 'Niqoblovchi Qatlam (Mask) Simulyatori',
    idea: '11-sinf 56-dars: Markaziy doira/kvadrat niqob shaklini hosil qiling.',
    engine: GameEngine.PIXEL_GRID,
    durationSec: 90,
    pixel: {
      size: 5,
      modeLabel: 'Niqob (Mask) uchun markaziy ramka shakli',
      target: [
        0, 0, 0, 0, 0,
        0, 1, 1, 1, 0,
        0, 1, 1, 1, 0,
        0, 1, 1, 1, 0,
        0, 0, 0, 0, 0
      ]
    }
  },
  {
    id: 40,
    grade: 11,
    topicId: 'g11-u8',
    title: 'JavaScript Array, Loop va Funksiyalar',
    idea: '11-sinf 61–66-darslar: JS massiv, sikl va funksiya kodini yozing.',
    engine: GameEngine.HTML_CSS_LAB,
    durationSec: 120,
    codeLab: [
      {
        prompt: 'let ballar = [80, 90, 100]; massivini e’lon qiling va for sikli yoki funksiya yozing.',
        starter: '// 1. "ballar" nomli massiv (80, 90, 100) yarating\n// 2. Yangi funksiya ichida sikl orqali elementlarni chiqaring\n',
        requiredTokens: ['[', ']', 'for', 'function'],
        hint: 'Massiv kvadrat qavs [...], funksiya esa function kalit so‘zi va for (let i = ...) siklidan tashkil topadi.'
      }
    ]
  },

  // ===================== QO‘SHIMCHA 18 TA BO‘LIM UCHUN MAXSUS O‘YINLAR (41–58) =====================
  {
    id: 41,
    grade: 5,
    topicId: 'g5-u2',
    title: 'Imlo Tekshiruvi va Saqlash (Save/Print)',
    idea: '5-sinf 6–9-darslar: To‘g‘ri nomlangan fayllar va chop etish qoidalarini saralang.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['To‘g‘ri saqlash / Chop etish', 'Xato odat / Noto‘g‘ri usul'],
      items: [
        { label: 'Ctrl+S bosib "Matematika_dars5.docx" nom berish', categoryIndex: 0 },
        { label: 'Hujjatni saqlamasdan kompyuterni o‘chirish', categoryIndex: 1 },
        { label: 'Chop etishdan oldin imloni tekshirish (Print Preview)', categoryIndex: 0 },
        { label: 'Faylga "dfg123_nomalum" deb tushunarsiz nom qo‘yish', categoryIndex: 1 },
        { label: 'Saqlash uchun alohida "5-sinf ishlar" papkasini tanlash', categoryIndex: 0 }
      ]
    }
  },
  {
    id: 42,
    grade: 5,
    topicId: 'g5-u6',
    title: 'Ustunli Diagramma Tahlilchisi',
    idea: '5-sinf 21–23-darslar: Berilgan xulosa bo‘yicha diagramma ustunlarini sozlang.',
    engine: GameEngine.CHART_GANTT,
    durationSec: 90,
    chart: {
      title: 'Kutubxonadan olingan kitoblar (choraklar bo‘yicha)',
      labels: ['1-chorak', '2-chorak', '3-chorak', '4-chorak'],
      targets: [4, 7, 9, 6],
      unit: 'dona'
    }
  },
  {
    id: 43,
    grade: 6,
    topicId: 'g6-u6',
    title: 'Dekompozitsiya va Protsedura Ustasi',
    idea: '6-sinf 22–26-darslar: Katta masalani kichik protseduralarga ajratish blitsi.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 70,
    blitz: [
      { prompt: 'Katta murakkab masalani kichik bo‘laklarga bo‘lib yechish usuli nima deyiladi?', choices: ['Dekompozitsiya', 'Arxivlash', 'Formatlash', 'Eksport'], answer: 0, tip: '25-dars: Dekompozitsiya — katta masalani kichik qismlarga ajratish.' },
      { prompt: 'Scratch dasturida qayta ishlatiladigan maxsus blok qanday ataladi?', choices: ['Protsedura (My Blocks)', 'Piksel', 'Hoshiya', 'Kolontitul'], answer: 0, tip: '24-dars: Protseduralar kodingizni ixcham va tushunarli qiladi.' },
      { prompt: 'Repeat 4 [Move 50; Turn 90°] buyrug‘i qanday shakl chizadi?', choices: ['Kvadrat', 'Uchburchak', 'Doira', 'Oltiburchak'], answer: 0, tip: '4 ta 90° burilish kvadrat hosil qiladi.' },
      { prompt: 'Dasturni ishga tushirishdan oldin natijani taxmin qilish nimaga yordam beradi?', choices: ['Mantiqiy xatoni erta topishga', 'Monitorni o‘chirishga', 'Fayl hajmini oshirishga', 'Shriftni kattalashtirishga'], answer: 0, tip: '23-dars: Takrorlash blokidan foydalanib natijani taxmin qilish.' }
    ]
  },
  {
    id: 44,
    grade: 6,
    topicId: 'g6-u8',
    title: 'Pochta Papkalari va Slayd Maketi',
    idea: '6-sinf 30–34-darslar: Elektron pochta va taqdimot uskunalarini juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'Attachment (Ilova)', right: 'Elektron xatga fayl biriktirish' },
      { left: 'Inbox / Papkalar', right: 'Kelgan xatlarni mavzuga ko‘ra saralash' },
      { left: 'Slayd Maketi (Layout)', right: 'Matn va tasvir joylashuv shabloni' },
      { left: 'Ovoz qo‘shish', right: 'Taqdimot slaydiga audio izoh biriktirish' }
    ]
  },
  {
    id: 45,
    grade: 7,
    topicId: 'g7-u4',
    title: 'Auditoriya va Taqdimot Maqsadi',
    idea: '7-sinf 15–16-darslar: Turli auditoriyalar uchun taqdimot uslubini moslang.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Boshlang‘ich sinf auditoriyasi', 'Ilmiy/Rasmiy auditoriya'],
      items: [
        { label: 'Katta rasmlar, qisqa so‘zlar va quvnoq animatsiyalar', categoryIndex: 0 },
        { label: 'Aniq statistik jadvallar, diagramma va manba havolalari', categoryIndex: 1 },
        { label: 'Ertak qahramonli interaktiv viktorina slaydi', categoryIndex: 0 },
        { label: 'Yillik hisobot xulosasi va metodik ko‘rsatkichlar', categoryIndex: 1 }
      ]
    }
  },
  {
    id: 46,
    grade: 7,
    topicId: 'g7-u6',
    title: 'Shartli Formatlash va Goal Seek',
    idea: '7-sinf 22–26-darslar: Maqsadni qidirish va shartli formulalarni tuzing.',
    engine: GameEngine.FORMULA_BUILDER,
    durationSec: 90,
    formula: [
      { tableHint: 'B2 katakda o‘quvchi bali = 75', prompt: 'Agar B2 >= 70 bo‘lsa "Otdi", aks holda "Qayta" chiqaruvchi IF formulasini yozing:', accepted: ['=IF(B2>=70,"Otdi","Qayta")', '=IF(B2>=70, "Otdi", "Qayta")'], sample: '=IF(B2>=70,"Otdi","Qayta")' },
      { tableHint: 'D2:D8 xarajatlar ro‘yxati', prompt: 'O‘rtacha xarajatni topuvchi formula:', accepted: ['=AVERAGE(D2:D8)'], sample: '=AVERAGE(D2:D8)' }
    ]
  },
  {
    id: 47,
    grade: 7,
    topicId: 'g7-u8',
    title: 'MB Ma’lumotlarini Eksport Qilish',
    idea: '7-sinf 31–34-darslar: Jadvaldan matn va Excel dasturlariga yuboriladigan qatorlarni tanlang.',
    engine: GameEngine.DB_QUERY,
    durationSec: 90,
    db: [
      {
        tableName: 'Eksport_Royxati',
        columns: ['ID', 'Nomi', 'Format', 'Tayyor'],
        rows: [
          ['1', 'Sinf_hisoboti', 'DOCX', 'Ha'],
          ['2', 'Qoralama_fayl', 'TMP', 'Yoq'],
          ['3', 'Chorak_jadvali', 'XLSX', 'Ha'],
          ['4', 'Test_nusxa', 'BAK', 'Yoq']
        ],
        prompt: 'Matn yoki Excelga eksport qilishga Tayyor = "Ha" bo‘lgan qatorlarni belgilang.',
        matchRowIndices: [0, 2]
      }
    ]
  },
  {
    id: 48,
    grade: 8,
    topicId: 'g8-u2',
    title: 'Validatsiya va Debaglash Simulyatori',
    idea: '8-sinf 6–9-darslar: Yosh/bo‘y validatsiyasi va dasturdagi xatoni (bug) topish blitsi.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 70,
    blitz: [
      { prompt: 'Foydalanuvchi yosh sifatida -5 kiritsa, buni rad etuvchi jarayon nima?', choices: ['Ma’lumotlar validatsiyasi', 'Grafik eksport', 'Audio montaj', 'Kolontitul'], answer: 0, tip: '6-dars: Yosh va bo‘y ma’lumotlarini mantiqiy chegarada tekshirish.' },
      { prompt: 'Dasturdagi xatolarni bosqichma-bosqich izlab tuzatish nima deyiladi?', choices: ['Debaglash (Debugging)', 'Arxivlash', 'Formatlash', 'Klonlash'], answer: 0, tip: '8-dars: Dasturni sinovdan o‘tkazish va debaglash.' },
      { prompt: 'Sprayt yurayotganda qadam tashlayotgandek ko‘rinishi uchun nima almashtiriladi?', choices: ['Sprayt kostyumlari', 'Fayl kengaytmasi', 'IP manzil', 'Shrift rangi'], answer: 0, tip: '7-dars: Sprayt kostyumlari va vaqt bilan ishlash.' },
      { prompt: '8-sinf yosh chegarasi tekshiruvida to‘g‘ri shart qaysi?', choices: ['yosh >= 7 va yosh <= 18', 'yosh < 0', 'yosh = "abc"', 'yosh > 500'], answer: 0, tip: 'Maktab o‘quvchisi yoshi mantiqiy diapazonida bo‘lishi kerak.' }
    ]
  },
  {
    id: 49,
    grade: 8,
    topicId: 'g8-u6',
    title: 'Maktab Tarmog‘i Xavfsizlik Siyosati',
    idea: '8-sinf 21–24-darslar: Tarmoq boshqaruvi va xavfsizlik qoidalarini juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'Firewall', right: 'Ruxsatsiz tarmoq trafigini to‘sadi' },
      { left: 'Switch', right: 'Kompyuterlarni LAN ichida bog‘laydi' },
      { left: 'Router', right: 'Lokal tarmoqni Internetga chiqaradi' },
      { left: 'Parol siyosati', right: 'Har bir foydalanuvchi uchun alohida kirish huquqi' },
      { left: 'Zaxira nusxa', right: 'Maktab serveri ma’lumotlarini tiklash kafolati' }
    ]
  },
  {
    id: 50,
    grade: 8,
    topicId: 'g8-u8',
    title: 'Audacity Audio va Reklama Studiyasi',
    idea: '8-sinf 29–34-darslar: Ovozli sharh (Narration) va auditoriya talabini saralang.',
    engine: GameEngine.CLASSIFY_SORT,
    durationSec: 75,
    sort: {
      categories: ['Audio montaj (Audacity)', 'Auditoriya va Reklama'],
      items: [
        { label: 'Fon shovqinini (Noise Reduction) tozalash', categoryIndex: 0 },
        { label: 'Mahsulot afzalligini 15 soniyada aniq yetkazish', categoryIndex: 1 },
        { label: 'Narration (ovozli sharh) trekini video ostiga qo‘yish', categoryIndex: 0 },
        { label: 'Maqsadli auditoriya yoshi va qiziqishini tahlil qilish', categoryIndex: 1 }
      ]
    }
  },
  {
    id: 51,
    grade: 9,
    topicId: 'g9-u2',
    title: 'AT Ta’siri va Tarmoq Kommunikatsiyasi',
    idea: '9-sinf 11–18-darslar: Tarmoq muammolari, mikroprotsessorli uy va salomatlik blitsi.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 75,
    blitz: [
      { prompt: 'Uzoq vaqt kompyuterda noto‘g‘ri o‘tirish qaysi muammoga olib keladi?', choices: ['Ko‘z zo‘riqishi va umurtqa og‘rig‘i', 'RAM hajmi oshishiga', 'Tarmoq tezlashishiga', 'Fayl shifrlanishiga'], answer: 0, tip: '18-dars: Ergonomika va tanaffus qoidalariga amal qilish zarur.' },
      { prompt: 'Mikroprotsessorli aqlli uy qurilmasiga qaysi misol bo‘la oladi?', choices: ['Avtomatik haroratli konditsioner', 'Oddiy yog‘och qalam', 'Mexanik qulf', 'Qog‘oz daftar'], answer: 0, tip: '16-dars: Mikroprotsessorli uy qurilmalari.' },
      { prompt: 'Tarmoqda ma’lumot paketlari kechikishi nimadan kelib chiqadi?', choices: ['Kanal yuklanishi yoki kabel nosozligidan', 'Shrift turidan', 'Header balandligidan', 'Monitor rangidan'], answer: 0, tip: '14-dars: Tarmoq muammolari va kommunikatsiya.' },
      { prompt: 'AT rivojlanishi bandlik bozoriga qanday ta’sir qiladi?', choices: ['Yangi IT kasblarni yaratadi va avtomatlashtiradi', 'Barcha maktablarni yopadi', 'Elektr energiyasini bekor qiladi', 'Hech narsani o‘zgartirmaydi'], answer: 0, tip: '15-dars: Axborot texnologiyasining bandlikka ta’siri.' }
    ]
  },
  {
    id: 52,
    grade: 9,
    topicId: 'g9-u3',
    title: 'SDLC — Tizim Hayotiy Sikli Bosqichlari',
    idea: '9-sinf 19–25-darslar: Tahlil, Loyihalash, Sinash va Joriy etish ketma-ketligini juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: '1. Tahlil (Analysis)', right: 'Muammo va foydalanuvchi talablarini o‘rganish' },
      { left: '2. Loyihalash (Design)', right: 'Ekran formasi, ma’lumotlar modeli va sxema chizish' },
      { left: '3. Sinash (Testing)', right: 'Dasturdagi xato va chegaraviy holatlarni tekshirish' },
      { left: '4. Hujjatlashtirish', right: 'Foydalanuvchi va texnik qo‘llanmalarni yozish' },
      { left: '5. Texnik xizmat', right: 'Tizimni yangilab borish va qo‘llab-quvvatlash' }
    ]
  },
  {
    id: 53,
    grade: 9,
    topicId: 'g9-u6',
    title: 'Korporativ Brend va Piksel Belgisi',
    idea: '9-sinf 43–52-darslar: Korporativ brend izchilligi uchun 5x5 geometrik logotipni tiklang.',
    engine: GameEngine.PIXEL_GRID,
    durationSec: 90,
    pixel: {
      size: 5,
      modeLabel: 'Brend uslubidagi simmetrik N/romb logotipi',
      target: [
        0, 0, 1, 0, 0,
        0, 1, 1, 1, 0,
        1, 1, 0, 1, 1,
        0, 1, 1, 1, 0,
        0, 0, 1, 0, 0
      ]
    }
  },
  {
    id: 54,
    grade: 9,
    topicId: 'g9-u7',
    title: 'Mail Merge Manba Filtratori',
    idea: '9-sinf 53–59-darslar: Pochta orqali shaxsiy taklifnoma yuboriladigan qatorlarni tanlang.',
    engine: GameEngine.DB_QUERY,
    durationSec: 90,
    db: [
      {
        tableName: 'Taklifnoma_Manbasi',
        columns: ['ID', 'Ism', 'Sinf', 'Email_Bor'],
        rows: [
          ['01', 'Dilshod', '9-A', 'Ha'],
          ['02', 'Kamola', '8-B', 'Ha'],
          ['03', 'Sardor', '9-B', 'Yoq'],
          ['04', 'Nigina', '9-A', 'Ha']
        ],
        prompt: 'Mail Merge uchun Sinfi 9-sinf ("9-A" yoki "9-B") VA Email_Bor = "Ha" qatorlarni tanlang.',
        matchRowIndices: [0, 3]
      }
    ]
  },
  {
    id: 55,
    grade: 10,
    topicId: 'g10-u6',
    title: 'Pivot Jadval va Simulyator Sozlamasi',
    idea: '10-sinf 44–52-darslar: Hududlar bo‘yicha jamlanma ko‘rsatkich ustunlarini tiklang.',
    engine: GameEngine.CHART_GANTT,
    durationSec: 90,
    chart: {
      title: 'Pivot jadval jamlanma natijasi (mln so‘m)',
      labels: ['Toshkent', 'Samarqand', 'Farg‘ona', 'Buxoro'],
      targets: [9, 6, 8, 5],
      unit: 'mln'
    }
  },
  {
    id: 56,
    grade: 10,
    topicId: 'g10-u8',
    title: '3NF Normallashtirish va MIS Tizimi',
    idea: '10-sinf 62–68-darslar: Ma’lumotlar bazasini 1NF, 2NF, 3NF ga keltirish blitsi.',
    engine: GameEngine.QUIZ_BLITZ,
    durationSec: 75,
    blitz: [
      { prompt: 'Har bir katakda faqat bitta atomar qiymat bo‘lishi qaysi normal shakl talabi?', choices: ['1NF (Birinchi normal shakl)', '3NF', 'HTML', 'VPN'], answer: 0, tip: '64-dars: 1NF takrorlanuvchi guruhlarni yo‘qotadi.' },
      { prompt: 'Kalit bo‘lmagan maydonlar orasidagi tranzitiv bog‘liqlikni ajratish qaysi shakl?', choices: ['3NF (Uchinchi normal shakl)', '0NF', 'CSS', 'BitTorrent'], answer: 0, tip: '64-dars: Ma’lumotlar bazasini 3NFga normallashtirish.' },
      { prompt: 'Barcha maydon nomlari, turlari va hajmi yozilgan hujjat nima deyiladi?', choices: ['Ma’lumotlar lug‘ati (Data Dictionary)', 'Spam papka', 'Grafik maket', 'Subtitr'], answer: 0, tip: '65-dars: Ma’lumotlar lug‘ati va turlari.' },
      { prompt: 'Rahbarlarga qaror qabul qilish uchun hisobot tayyorlaydigan tizim?', choices: ['Boshqaruv axborot tizimi (MIS)', 'Grafik muharrir', 'Audio pleyer', 'Klaviatura drayveri'], answer: 0, tip: '66-dars: Boshqaruv axborot tizimlari.' }
    ]
  },
  {
    id: 57,
    grade: 11,
    topicId: 'g11-u3',
    title: 'E-Tijorat, Banking va Data Mining',
    idea: '11-sinf 19–25-darslar: Zamonaviy elektron tijorat va intellektual tahlil shifrlarini yeching.',
    engine: GameEngine.CIPHER_NET,
    durationSec: 90,
    cipher: [
      { prompt: 'Katta hajmdagi ma’lumotlardan yashirin qonuniyatlarni aniqlash jarayoni qaysi?', detail: '11-sinf 21-dars mavzusi.', answer: 'Data Mining', options: ['Data Mining', 'Mail Merge', 'Paint Brush', 'Page Border'], hint: 'Ma’lumotlarni intellektual tahlillash — Data Mining.' },
      { prompt: 'Omborda tovar kamayganda avtomatik buyurtma beruvchi tizim nima?', detail: '20-dars: Zaxiralarni avtomatik boshqarish.', answer: 'Avtomatik zaxira boshqaruvi', options: ['Avtomatik zaxira boshqaruvi', 'Oddiy daftar', 'Qo‘lda sanash', 'Audio eksport'], hint: 'Shtrix-kod/QR skaner orqali avtomatik yangilanish.' },
      { prompt: 'Masofadan turib internet orqali ishlash modeli qaysi?', detail: '23-dars mavzusi.', answer: 'Masofadan ishlash (Remote)', options: ['Masofadan ishlash (Remote)', 'Kanalli kabel', 'Offline arxiv', 'Lokal chop etish'], hint: 'Videokonferensiya va bulutli xizmatlar asosida ishlaydi.' }
    ]
  },
  {
    id: 58,
    grade: 11,
    topicId: 'g11-u6',
    title: 'Qora/Oq Quti va Alfa/Beta Sinovlari',
    idea: '11-sinf 45–52-darslar: Tizim dizayni va dasturiy ta’minot sinov turlarini juftlang.',
    engine: GameEngine.MEMORY_PAIR,
    durationSec: 90,
    memory: [
      { left: 'DFD (Data Flow Diagram)', right: 'Tizimdagi ma’lumotlar oqimini tasvirlaydi' },
      { left: 'Qora quti (Black-box)', right: 'Ichki kodni ko‘rmasdan kiritish/chiqarishni sinash' },
      { left: 'Oq quti (White-box)', right: 'Dastur kodi va barcha mantiqiy yo‘llarni sinash' },
      { left: 'Alfa sinov', right: 'Ishlab chiqaruvchi jamoa ichidagi dastlabki sinov' },
      { left: 'Beta sinov', right: 'Haqiqiy foydalanuvchilar bilan ochiq yakuniy sinov' }
    ]
  },
  {
    id: 59,
    grade: 7,
    topicId: 'g7-u1',
    title: 'Arqon Tortish: 2 Kishilik PvP Bellashuv',
    idea: '2 kishilik duel: Har bir to‘g‘ri javob arqonni o‘z jamoangiz tomoniga tortadi! Klaviatura (A/S/D/F vs 1/2/3/4) yoki sensor bilan o‘ynang.',
    engine: GameEngine.TUG_OF_WAR,
    durationSec: 90,
    tug: [
      { prompt: 'Kompyuterning vaqtinchalik tezkor xotirasi qaysi?', choices: ['RAM', 'ROM', 'HDD', 'Printer'], answer: 0, tip: 'RAM elektr o‘chganda tozalanadi.' },
      { prompt: 'Ikkilik sanoq tizimi qaysi raqamlardan tashkil topgan?', choices: ['0 va 1', '1 va 2', '0 dan 9 gacha', 'A va B'], answer: 0, tip: 'Kompyuter barcha axborotni 0 va 1 da saqlaydi.' },
      { prompt: '1 Bayt necha bitga teng?', choices: ['8 bit', '4 bit', '16 bit', '10 bit'], answer: 0, tip: '1 bayt = 8 bit.' },
      { prompt: 'Excel dasturida formula qaysi belgi bilan boshlanadi?', choices: ['=', '+', '#', '$'], answer: 0, tip: 'Har bir formula = belgisi bilan boshlanadi.' },
      { prompt: 'Veb-sahifa tuzilmasini yaratuvchi belgilash tili qaysi?', choices: ['HTML', 'MP3', 'PNG', 'BIOS'], answer: 0, tip: 'HTML sahifa skeletini belgilaydi.' },
      { prompt: 'Veb-sahifaga rang va dizayn beruvchi texnologiya?', choices: ['CSS', 'SQL', 'DNS', 'ZIP'], answer: 0, tip: 'CSS — Cascading Style Sheets.' },
      { prompt: 'Tarmoqda ruxsatsiz trafikni to‘sadigan himoya tizimi?', choices: ['Firewall', 'Scanner', 'Joystick', 'Plotter'], answer: 0, tip: 'Firewall tarmoq devori vazifasini bajaradi.' },
      { prompt: 'Algoritmning bitta amalni ko‘p marta takrorlovchi turi?', choices: ['Siklli (Takrorlanuvchi)', 'Chiziqli', 'Grafik', 'Ovozli'], answer: 0, tip: 'Loop/Sikl takrorlanishni ta’minlaydi.' },
      { prompt: 'Ma’lumotlar bazasidan kerakli satrlarni qidirish buyrug‘i?', choices: ['SELECT / Query', 'PRINT', 'ERASE', 'CROP'], answer: 0, tip: 'Query aniq mezon bo‘yicha ma’lumot topadi.' },
      { prompt: 'Hujjatni tezkor saqlash klavish birikmasi?', choices: ['Ctrl + S', 'Ctrl + X', 'Ctrl + P', 'Alt + F4'], answer: 0, tip: 'Ctrl + S — Save.' },
      { prompt: 'Internetda xavfsiz shifrlangan aloqa protokoli?', choices: ['HTTPS', 'HTTP', 'TXT', 'BMP'], answer: 0, tip: 'HTTPS — TLS shifrlangan protokol.' },
      { prompt: 'Dasturdagi xatolarni topish va tuzatish jarayoni?', choices: ['Debaglash', 'Arxivlash', 'Formatlash', 'Chop etish'], answer: 0, tip: 'Debugging xatolarni bartaraf etadi.' },
      { prompt: 'Katta masalani kichik bo‘laklarga bo‘lib yechish usuli?', choices: ['Dekompozitsiya', 'Klonlash', 'Kadr tezligi', 'Kolontitul'], answer: 0, tip: 'Dekompozitsiya murakkab masalani soddalashtiradi.' },
      { prompt: 'JavaScript dasturlash tilida ro‘yxat (massiv) qanday ataladi?', choices: ['Array', 'Header', 'Pixel', 'Router'], answer: 0, tip: 'Array bir nechta qiymatlarni saqlaydi.' }
    ]
  }
];

