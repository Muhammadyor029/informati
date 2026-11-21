import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'backend', 'fixtures', 'seed_curriculum.json');

// Complete 340 scheduled lessons transcribed faithfully from Informatika_5-11-sinf_yillik_reja_2026-2027_0364fcd5.pdf
const OFFICIAL_CURRICULUM = {
  5: [
    // 1-yarim yillik (1..16)
    { n: 1, term: '1-yarim yillik', h: 1, title: 'Matnli hujjat bilan ishlashni boshlash' },
    { n: 2, term: '1-yarim yillik', h: 1, title: 'Sichqonchadan va klaviaturadan foydalanish' },
    { n: 3, term: '1-yarim yillik', h: 1, title: 'Matnni belgilash va tahrirlash' },
    { n: 4, term: '1-yarim yillik', h: 1, title: 'Matnni o‘chirish. Amaliy mashg‘ulot' },
    { n: 5, term: '1-yarim yillik', h: 1, title: 'Matnni ko‘chirish. Amaliy mashg‘ulot' },
    { n: 6, term: '1-yarim yillik', h: 1, title: 'Asosiy tugmalarni tanlash. Hujjatni chop etish' },
    { n: 7, term: '1-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 8, term: '1-yarim yillik', h: 1, title: 'Matnni tekshirish' },
    { n: 9, term: '1-yarim yillik', h: 1, title: 'Save tugmasi va hujjatni qulay nom bilan saqlash' },
    { n: 10, term: '1-yarim yillik', h: 1, title: 'Tasvirlar bilan ishlashni boshlash. Line uskunasidan foydalanish' },
    { n: 11, term: '1-yarim yillik', h: 1, title: 'Pencil va Brush uskunalaridan foydalanish' },
    { n: 12, term: '1-yarim yillik', h: 1, title: 'Chiziqning qalinligi va rangini o‘zgartirish.' },
    { n: 13, term: '1-yarim yillik', h: 1, title: 'Shakllar chizish' },
    { n: 14, term: '1-yarim yillik', h: 1, title: 'Tasvir qismlaridan nusxa olish, kesib tashlash yoki joylashtirishdan foydalanish' },
    { n: 15, term: '1-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 16, term: '1-yarim yillik', h: 1, title: 'Eraser uskunasi. Tasvirni saqlash' },
    // 2-yarim yillik (17..34)
    { n: 17, term: '2-yarim yillik', h: 1, title: 'Diagrammalar bilan ishlashni boshlash. Axborotni guruhlash' },
    { n: 18, term: '2-yarim yillik', h: 1, title: 'Axborotni qiymatini hisoblash. Piktogramma yaratish' },
    { n: 19, term: '2-yarim yillik', h: 1, title: 'Jadvallar yaratishda Microsoft Excel dasturidan foydalanish. Grafika. Diagramma va unga ma’lumotlar kiritish' },
    { n: 20, term: '2-yarim yillik', h: 1, title: 'Diagramma turini tanlash. Diagrammaga x-o‘qi, y-o‘qi hamda diagramma nomini joylash' },
    { n: 21, term: '2-yarim yillik', h: 1, title: 'Diagrammadan xulosa chiqarish' },
    { n: 22, term: '2-yarim yillik', h: 1, title: 'Ustunli diagramma ustunlari rangini o‘zgartirish' },
    { n: 23, term: '2-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 24, term: '2-yarim yillik', h: 1, title: 'Blok-sxema yaratish. Burchaklar bilan ishlash.' },
    { n: 25, term: '2-yarim yillik', h: 1, title: 'Spraytlarni oldinga va turli yo‘nalishlarga harakatlantirish' },
    { n: 26, term: '2-yarim yillik', h: 1, title: 'Dasturlashni boshlash. Robotni labirint bo‘ylab harakatlantirish' },
    { n: 27, term: '2-yarim yillik', h: 1, title: 'Takrorlash' },
    { n: 28, term: '2-yarim yillik', h: 1, title: 'Qidiruv tizimlarida ishlashni boshlash. Qidiruv tizimlari.' },
    { n: 29, term: '2-yarim yillik', h: 1, title: 'Veb-brauzerlar.' },
    { n: 30, term: '2-yarim yillik', h: 1, title: 'Elektron pochtada ishlash. Elektron pochta. Yangi elektron xat yozish.' },
    { n: 31, term: '2-yarim yillik', h: 1, title: 'Qabul qiluvchining manzilini kiritish. Xatni o‘qish va unga javob qaytarish.' },
    { n: 32, term: '2-yarim yillik', h: 1, title: 'Elektron pochtada xabarlarni uzatish va formatlash' },
    { n: 33, term: '2-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 34, term: '2-yarim yillik', h: 1, title: 'Takrorlash' },
  ],
  6: [
    // 1-yarim yillik (1..16)
    { n: 1, term: '1-yarim yillik', h: 1, title: 'Matn qo‘shish, o‘zgartirish va ko‘chirish' },
    { n: 2, term: '1-yarim yillik', h: 1, title: 'Shrift turi, o‘lchami va rangini o‘zgartirish. Matnni tekislash' },
    { n: 3, term: '1-yarim yillik', h: 1, title: 'Hujjatga tasvir va hoshiya qo‘shish' },
    { n: 4, term: '1-yarim yillik', h: 1, title: 'Hujjatlarni auditoriya uchun moslash' },
    { n: 5, term: '1-yarim yillik', h: 1, title: 'Loyiha ishi. Amaliy mashg‘ulot' },
    { n: 6, term: '1-yarim yillik', h: 1, title: 'Tasvirni import qilish' },
    { n: 7, term: '1-yarim yillik', h: 1, title: 'Ishning boshlang‘ich nusxalari.' },
    { n: 8, term: '1-yarim yillik', h: 1, title: 'Tasvirlarni aylantirish, teskari o‘girish. Tasvirni o‘lchamlarini o‘zgartirish' },
    { n: 9, term: '1-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 10, term: '1-yarim yillik', h: 1, title: 'Elektron jadval tushunchasi. Ma’lumotlarni elektron jadvalga kiritish' },
    { n: 11, term: '1-yarim yillik', h: 1, title: 'Sodda formulalarni kiritishda katak manzilidan foydalanish. Formulalarni nusxalash' },
    { n: 12, term: '1-yarim yillik', h: 1, title: 'Grafik yaratish.' },
    { n: 13, term: '1-yarim yillik', h: 1, title: 'Amaliy mashg‘ulot' },
    { n: 14, term: '1-yarim yillik', h: 1, title: 'Ma’lumotlar turlari va bazasi, maydonlarni aniqlash' },
    { n: 15, term: '1-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 16, term: '1-yarim yillik', h: 1, title: 'Ma’lumotlar bazasidan harakatlanish va teng sharti bilan query yaratish. Query-ma’lumotlar bazasidan aniq ma’lumotni qidirish uskunasi' },
    // 2-yarim yillik (17..34)
    { n: 17, term: '2-yarim yillik', h: 1, title: 'Takrorlash algoritmi' },
    { n: 18, term: '2-yarim yillik', h: 1, title: 'Takrorlash algoritmidan foydalanib blok-sxemalar yaratish' },
    { n: 19, term: '2-yarim yillik', h: 1, title: 'Scratch dasturida takrorlash amaliyotidan foydalanish' },
    { n: 20, term: '2-yarim yillik', h: 1, title: 'Scratch dasturida PEN uskunasidan foydalanish' },
    { n: 21, term: '2-yarim yillik', h: 1, title: 'Scratch dasturida shakllar bilan ishlash' },
    { n: 22, term: '2-yarim yillik', h: 1, title: 'Scratch dasturida takrorlash bloki yordamida yangi shakl chizish' },
    { n: 23, term: '2-yarim yillik', h: 1, title: 'Takrorlash blokidan foydalanib dastur natijasini taxmin qilish' },
    { n: 24, term: '2-yarim yillik', h: 1, title: 'Scratch dasturida protseduralar bilan ishlash' },
    { n: 25, term: '2-yarim yillik', h: 1, title: 'Dekompozitsiyadan foydalanish. Kichik masala yechimi orqali katta masalaga o‘tish' },
    { n: 26, term: '2-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 27, term: '2-yarim yillik', h: 1, title: 'Web manzillar haqida tushuncha. Qidirish tizimini ishlash tamoyili va axborotning ishonchliligi.' },
    { n: 28, term: '2-yarim yillik', h: 1, title: 'Axborotni filtrlash. Web-sahifa, web-sayt, URL manzilidagi matnlarni saqlash' },
    { n: 29, term: '2-yarim yillik', h: 1, title: 'Elektron xatni yozish, tahrirlash, o‘qish, javob berish va matn bilan ishlash uskunalari. Foydalanuvchi manzillarini qo‘shish' },
    { n: 30, term: '2-yarim yillik', h: 1, title: 'Ilova qilingan hujjatlarni ochish, elektron xatga hujjat ilova qilish' },
    { n: 31, term: '2-yarim yillik', h: 1, title: 'Elektron pochta papkalarini boshqarish. Loyiha ishi' },
    { n: 32, term: '2-yarim yillik', h: 1, title: 'Taqdimotni yaratish rejasi. Maketni tanlash va slaydga matn, tasvir, ovoz qo‘shish' },
    { n: 33, term: '2-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 34, term: '2-yarim yillik', h: 1, title: 'Takrorlash' },
  ],
  7: [
    // 1-yarim yillik (1..16)
    { n: 1, term: '1-yarim yillik', h: 1, title: 'Matn stillarini sozlash va ulardan foydalanish' },
    { n: 2, term: '1-yarim yillik', h: 1, title: 'Wrap text sozlamalaridan foydalanish. Tasvirni qirqish va o‘lchamini o‘zgartirish' },
    { n: 3, term: '1-yarim yillik', h: 1, title: 'Jadval o‘rnatish' },
    { n: 4, term: '1-yarim yillik', h: 1, title: 'Belgili ro‘yxat yaratish' },
    { n: 5, term: '1-yarim yillik', h: 1, title: 'Hujjatga Header va Footer maydonlarini qo‘shish' },
    { n: 6, term: '1-yarim yillik', h: 1, title: 'Matnni ustunlarga bo‘lish' },
    { n: 7, term: '1-yarim yillik', h: 1, title: 'Sahifani formatlash buyruqlaridan foydalanish. Print preview buyrug‘idan foydalanish' },
    { n: 8, term: '1-yarim yillik', h: 1, title: 'Amaliy mashg‘ulot: Internetdan foydalanish jarayonida xavfsizlikni ta’minlash' },
    { n: 9, term: '1-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 10, term: '1-yarim yillik', h: 1, title: 'Loyiha xususiyatini ishlab chiqish', note: 'Manba PDF hujjatda soat katagi bo‘sh qolgan (jami 34 soat tarkibida 1 soat sifatida hisoblandi).' },
    { n: 11, term: '1-yarim yillik', h: 1, title: 'Slaydga o‘tish effektlarini qo‘shish.' },
    { n: 12, term: '1-yarim yillik', h: 1, title: 'Slaydlarga vaqt va audio qo‘shish' },
    { n: 13, term: '1-yarim yillik', h: 1, title: 'Animatsiya effektini qo‘shish' },
    { n: 14, term: '1-yarim yillik', h: 1, title: 'Animatsiya va vaqtni moslash' },
    { n: 15, term: '1-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 16, term: '1-yarim yillik', h: 1, title: 'Auditoriya va maqsadni bilish' },
    // 2-yarim yillik (17..34)
    { n: 17, term: '2-yarim yillik', h: 1, title: 'Elektron jadvalni loyihalash. Dizayn shakllantirish' },
    { n: 18, term: '2-yarim yillik', h: 1, title: 'Formulani kiritish. Elektron jadvalni sinovdan o‘tkazish' },
    { n: 19, term: '2-yarim yillik', h: 1, title: 'Modellashtirish' },
    { n: 20, term: '2-yarim yillik', h: 1, title: 'Ma’lumotlarni to‘plash shaklini tuzish' },
    { n: 21, term: '2-yarim yillik', h: 1, title: 'Elektron jadvalni formatlash' },
    { n: 22, term: '2-yarim yillik', h: 1, title: 'Elektron jadvalni baholash' },
    { n: 23, term: '2-yarim yillik', h: 1, title: 'Elektron jadval natijalarini diagramma sifatida taqdim etish' },
    { n: 24, term: '2-yarim yillik', h: 1, title: 'Shartli formatlash va maqsadni qidirish vositalaridan foydalanish' },
    { n: 25, term: '2-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 26, term: '2-yarim yillik', h: 1, title: 'Takrorlash' },
    { n: 27, term: '2-yarim yillik', h: 1, title: 'Ma’lumotlar bazasi uchun maqsadni aniqlash. Ma’lumotlar bazasi uchun maydon tanlash' },
    { n: 28, term: '2-yarim yillik', h: 1, title: 'Ma’lumot turlari. Ma’lumotlar bazasi jadvalini yaratish.' },
    { n: 29, term: '2-yarim yillik', h: 1, title: 'Ochiladigan ro‘yxatni yaratish. Ma’lumot kiritish formasini yaratish (Form).' },
    { n: 30, term: '2-yarim yillik', h: 1, title: 'Ma’lumotlar bazasini sinovdan o‘tkazish. Ma’lumotlar xavfsizligi.' },
    { n: 31, term: '2-yarim yillik', h: 1, title: 'Ma’lumotlarni matn bilan ishlash dasturiga yuborish.' },
    { n: 32, term: '2-yarim yillik', h: 1, title: 'Ma’lumotlarni jadval bilan ishlash dasturiga yuborish.' },
    { n: 33, term: '2-yarim yillik', h: 1, title: 'Nazorat ishi' },
    { n: 34, term: '2-yarim yillik', h: 1, title: 'Takrorlash' },
  ],
  8: [
    // I CHORAK (1..16)
    { n: 1, term: 'I CHORAK', h: 1, title: 'Kirish. Dasturlashning asosiy tushunchalari' },
    { n: 2, term: 'I CHORAK', h: 1, title: 'Amaliy mashg‘ulot' },
    { n: 3, term: 'I CHORAK', h: 1, title: 'O‘zgaruvchilar va ularni boshqarish.' },
    { n: 4, term: 'I CHORAK', h: 1, title: 'Amaliy mashg‘ulot. Spraytni bosilganda ochko oshib boruvchi o‘yin yaratish' },
    { n: 5, term: 'I CHORAK', h: 1, title: 'Shartli dasturlash. To‘qnashuvlar asosidagi ssenariy.' },
    { n: 6, term: 'I CHORAK', h: 1, title: 'Ma’lumotlar validatsiyasi. Yosh va bo‘yni so‘rab oluvchi dastur' },
    { n: 7, term: 'I CHORAK', h: 1, title: 'Sprayt kostyumlari va vaqt bilan ishlash.' },
    { n: 8, term: 'I CHORAK', h: 1, title: 'Dasturni sinovdan o‘tkazish va debaglash.' },
    { n: 9, term: 'I CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 10, term: 'I CHORAK', h: 1, title: 'HTML tushunchasi va veb-sahifani sozlash' },
    { n: 11, term: 'I CHORAK', h: 1, title: 'Veb-sahifada matn joylashtirish va ularni boshqarish.' },
    { n: 12, term: 'I CHORAK', h: 1, title: 'Link joylashtirish' },
    { n: 13, term: 'I CHORAK', h: 1, title: 'Veb-sahifada tasvirlar joylashtirish va ularni boshqarish.' },
    { n: 14, term: 'I CHORAK', h: 1, title: 'Veb-sahifa dizaynini tanlash ularni boshqarish. Ranglar' },
    { n: 15, term: 'I CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 16, term: 'I CHORAK', h: 1, title: 'Veb-saytni internetda joylashtirish' },
    // 2-yarim yillik (PDFda "3 CHORAK" deb yozilgan) (17..34)
    { n: 17, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Kompyuter tarmoqlari. Asosiy tushunchalar' },
    { n: 18, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Tarmoq komponentlari.' },
    { n: 19, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Amaliy mashg‘ulot. Kabel, jek, Hub, Swich, Router, modem' },
    { n: 20, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Tarmoqni loyihalash' },
    { n: 21, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Tarmoq boshqaruvi. Boshqarish vazifalarini aniqlash' },
    { n: 22, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Tarmoq xavfsizligi' },
    { n: 23, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Amaliy mashg‘ulot: maktab kompyuter tarmog‘ini loyihalash' },
    { n: 24, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Nazorat ishi' },
    { n: 25, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Video va animatsiyalardan foydalanish. Asosiy tushunchalar' },
    { n: 26, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Animatsiya yaratish. Pencil2D dasturidan foydalanish' },
    { n: 27, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Takrorlash' },
    { n: 28, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Adobe Spark dasturida yangi video yaratish' },
    { n: 29, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Animatsiya yoki videoga saundtrek yoki ovozli sharh (Narration) qo‘shish' },
    { n: 30, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Auditoriya talablarini inobatga olish.' },
    { n: 31, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Mahsulotni reklama qilish' },
    { n: 32, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Audacity dasturida ishlash' },
    { n: 33, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Nazorat ishi' },
    { n: 34, term: '2-yarim yillik (PDF: 3 CHORAK)', h: 1, title: 'Takrorlash' },
  ],
  9: [
    // 1 CHORAK (1..18)
    { n: 1, term: '1 CHORAK', h: 1, title: 'Kompyuter qurilmalari va dasturiy ta’minot. Kompyuter tizimining asosiy komponentlari' },
    { n: 2, term: '1 CHORAK', h: 1, title: 'Operatsion tizimlar' },
    { n: 3, term: '1 CHORAK', h: 1, title: 'Kompyuter turlari' },
    { n: 4, term: '1 CHORAK', h: 1, title: 'Yangi texnologiyalarning ta’siri' },
    { n: 5, term: '1 CHORAK', h: 1, title: 'Kiritish qurilmalari va ularning qo‘llanishi' },
    { n: 6, term: '1 CHORAK', h: 1, title: 'Ma’lumotni bevosita kiritishda foydalaniladigan qurilmalar.' },
    { n: 7, term: '1 CHORAK', h: 1, title: 'Chiqarish qurilmalari va ulardan foydalanish' },
    { n: 8, term: '1 CHORAK', h: 1, title: 'Xotira qurilmalari va ma’lumot almashish vositalari' },
    { n: 9, term: '1 CHORAK', h: 1, title: 'Turli xotira qurilmalarining afzallik va kamchiliklari' },
    { n: 10, term: '1 CHORAK', h: 1, title: 'Xotira hajmiga bog‘liq masalalarni yechish' },
    { n: 11, term: '1 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 12, term: '1 CHORAK', h: 1, title: 'Kompyuter tarmoqlari qurilmalari' },
    { n: 13, term: '1 CHORAK', h: 1, title: 'Brauzerdan foydalanish. Kompyuter tarmoqlari dasturiy jihati.' },
    { n: 14, term: '1 CHORAK', h: 1, title: 'Tarmoq muammolari va kommunikatsiya' },
    { n: 15, term: '1 CHORAK', h: 1, title: 'Axborot texnologiyasining bandlikka ta’siri' },
    { n: 16, term: '1 CHORAK', h: 1, title: 'Axborot texnologiyasi (AT) ning tashkilotlar ish uslubiga ta’siri. Mikroprotsessorli uy qurilmalari' },
    { n: 17, term: '1 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 18, term: '1 CHORAK', h: 1, title: 'Axborot texnologiyasi (AT) jihozlaridan uzoq muddat foydalanishning sog‘liqqa ta’siri' },
    // 2 CHORAK (19..32)
    { n: 19, term: '2 CHORAK', h: 1, title: 'Kommunikatsiya dasturlari qamrovi. Ma’lumotlarni boshqarish dasturlari' },
    { n: 20, term: '2 CHORAK', h: 1, title: 'O‘lchov dasturlari. Boshqaruv dasturlaridagi mikroprotsessorlar' },
    { n: 21, term: '2 CHORAK', h: 1, title: 'Modellashtirish dasturlari. Boshqaruv, ta’lim, sog‘liqni saqlash, savdo va autentifikatsiyada kompyuter tizimlari' },
    { n: 22, term: '2 CHORAK', h: 1, title: 'Tahlil va loyihalash' },
    { n: 23, term: '2 CHORAK', h: 1, title: 'Ishlab chiqish, sinash va joriy qilish' },
    { n: 24, term: '2 CHORAK', h: 1, title: 'Hujjatlashtirish, baholash va texnik xizmat ko‘rsatish' },
    { n: 25, term: '2 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 26, term: '2 CHORAK', h: 1, title: 'Xavfsizlik muammolari. Elektron xavfsizlik. Ma’lumotlar xavfsizligi' },
    { n: 27, term: '2 CHORAK', h: 1, title: 'Axborot himoyasi protokoli. Antiviruslar va fayervol' },
    { n: 28, term: '2 CHORAK', h: 1, title: 'Auditoriyani huquqiy, ma’naviy, axloqiy va madaniy jihatdan baho berish' },
    { n: 29, term: '2 CHORAK', h: 1, title: 'Mualliflik huquqi va uning turlari. Mualliflik huquqi himoyasi' },
    { n: 30, term: '2 CHORAK', h: 1, title: 'AKT foydalanuvchisi bilan elektron xat orqali muloqot qilish. Spam tushunchasi' },
    { n: 31, term: '2 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 32, term: '2 CHORAK', h: 1, title: 'Internetdan samarali foydalanish. Internetdan topilgan axborotning ishonchliligini baholash' },
    // 3 CHORAK (33..52)
    { n: 33, term: '3 CHORAK', h: 1, title: 'Fayl kengaytmasi va ularni samarali boshqarish' },
    { n: 34, term: '3 CHORAK', h: 1, title: 'Saqlash yoki uzatish uchun fayl hajmini kamaytirish' },
    { n: 35, term: '3 CHORAK', h: 1, title: 'Tasvirlarni joylashtirish va tahrirlash uchun dastur uskunalaridan foydalanish' },
    { n: 36, term: '3 CHORAK', h: 1, title: 'Tasvirni aniq joylashtirish. Tasvirning tomonlar nisbatini o‘zgartirish' },
    { n: 37, term: '3 CHORAK', h: 1, title: 'Tasvirni qirqish va aylantirish' },
    { n: 38, term: '3 CHORAK', h: 1, title: 'Tasvir rangi, yorqinligi, kontrasti va aniqligi boshqarish' },
    { n: 39, term: '3 CHORAK', h: 1, title: 'Sahifa maketi. Maqsad va auditoriyaga mos hujjat yaratish uchun dasturiy uskunalardan foydalanish' },
    { n: 40, term: '3 CHORAK', h: 1, title: 'Hujjatga obyektlarni joylashtirish' },
    { n: 41, term: '3 CHORAK', h: 1, title: 'Header va Footer maydonlarini yaratish' },
    { n: 42, term: '3 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 43, term: '3 CHORAK', h: 1, title: 'Korporativ brend va unga xos stil. Korporativ brendga xos stilga muvofiq hujjat tayyorlash' },
    { n: 44, term: '3 CHORAK', h: 1, title: 'Sahifa/slayd izchilligini ta’minlash' },
    { n: 45, term: '3 CHORAK', h: 1, title: 'Yangi stil yaratish' },
    { n: 46, term: '3 CHORAK', h: 1, title: 'Xatolarni tekshirish uchun dasturlardan foydalanish' },
    { n: 47, term: '3 CHORAK', h: 1, title: 'Xatolarni tekshirish usullari' },
    { n: 48, term: '3 CHORAK', h: 1, title: 'Verifikatsiya va validatsiya tushunchalari' },
    { n: 49, term: '3 CHORAK', h: 1, title: 'Grafik yoki diagramma yaratish. Diagramma turlari' },
    { n: 50, term: '3 CHORAK', h: 1, title: 'Tayyorlangan diagrammani boshqarish va o‘zgartirish' },
    { n: 51, term: '3 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 52, term: '3 CHORAK', h: 1, title: 'Takrorlash' },
    // 4 CHORAK (53..68)
    { n: 53, term: '4 CHORAK', h: 1, title: 'Matn va sahifa maketini formatlash' },
    { n: 54, term: '4 CHORAK', h: 1, title: 'Dastur uskunalari yordamida jadvallarni tahrirlash' },
    { n: 55, term: '4 CHORAK', h: 1, title: 'Ma’lumot manbasi bilan hujjatni birlashtirib, pochta orqali yuborish' },
    { n: 56, term: '4 CHORAK', h: 1, title: 'Ma’lumotlar bazasi tuzilmasini yaratish. Ma’lumotlarni boshqarish va taqdim etish' },
    { n: 57, term: '4 CHORAK', h: 1, title: 'Ob’yektlarni to‘g‘ri joylash. Taqdimot slaydlarini yaratish uchun mos dastur imkoniyatlaridan foydalanish' },
    { n: 58, term: '4 CHORAK', h: 1, title: 'Taqdimotga elektron jadvaldan diagrammalarni import qilish' },
    { n: 59, term: '4 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 60, term: '4 CHORAK', h: 1, title: 'Ma’lumotlar modelini yaratish. Nisbiy va absolyut murojaat.' },
    { n: 61, term: '4 CHORAK', h: 1, title: 'Formula va funksiyalar hamda ulardan foydalanish' },
    { n: 62, term: '4 CHORAK', h: 1, title: 'Ma’lumotlar modelini sinovdan o‘tkazish. Ma’lumotlarni boshqarish' },
    { n: 63, term: '4 CHORAK', h: 1, title: 'Ma’lumotlarni taqdim etish' },
    { n: 64, term: '4 CHORAK', h: 1, title: 'Veb dasturlashning uch qatlami. Veb sahifa yaratish' },
    { n: 65, term: '4 CHORAK', h: 1, title: 'Linklar, bookmarklar va ankor. Absolyut va nisbiy fayl manzillari' },
    { n: 66, term: '4 CHORAK', h: 1, title: 'Stil jadvallaridan foydalanish. Veb saytni sinash va publikatsiya qilish' },
    { n: 67, term: '4 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 68, term: '4 CHORAK', h: 1, title: 'Takrorlash' },
  ],
  10: [
    // 1 CHORAK (1..18)
    { n: 1, term: '1 CHORAK', h: 1, title: 'Ma’lumot, axborot va bilimlar bazasi. Ma’lumot manbasi. Bevosita va bilvosita manbalardan ma’lumot to‘plashning afzallik hamda kamchiliklari. Axborotning sifati' },
    { n: 2, term: '1 CHORAK', h: 1, title: 'Kod berish, kodlash va shifrlash. Ma’lumotlarni kodlashning afzallik va kamchiliklari. Simmetrik va asimmetrik shifrlash usullari.' },
    { n: 3, term: '1 CHORAK', h: 1, title: 'Ma’lumotlarning to‘g‘riligini tekshirish.' },
    { n: 4, term: '1 CHORAK', h: 1, title: 'Vizual tekshirish va ma’lumotlarni ikki marta kiritish.' },
    { n: 5, term: '1 CHORAK', h: 1, title: 'Apparat ta’minot. Ichki va tashqi qurilmalar' },
    { n: 6, term: '1 CHORAK', h: 1, title: 'Xotira qurilmalari. Tizimli dasturiy ta’minot. Drayverlar.' },
    { n: 7, term: '1 CHORAK', h: 1, title: 'Amaliy dasturiy ta’minot. Fotosuratni tahrirlash dasturiy ta’minoti' },
    { n: 8, term: '1 CHORAK', h: 1, title: 'Video tahrirlash dasturiy ta’minoti. Veb sahifa ishlab chiqish dasturiy ta’minoti' },
    { n: 9, term: '1 CHORAK', h: 1, title: 'Foydalanuvchi interfeysi dizaynidagi boshqaruv elementlari. Utilit dasturlar. Buyurtma yoki tayyor dasturiy ta’minot.' },
    { n: 10, term: '1 CHORAK', h: 1, title: 'Loyiha (amaliy) ishi' },
    { n: 11, term: '1 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 12, term: '1 CHORAK', h: 1, title: 'Sensorlar. Harakat va bosim sensorlari, Namlik, harorat va yorug‘lik sensorlari' },
    { n: 13, term: '1 CHORAK', h: 1, title: 'Elektron xavfsizlik tushunchasi.' },
    { n: 14, term: '1 CHORAK', h: 1, title: 'Phishing, Pharming, Vishing, Troyan, Worm, Spyware, Rootkit, Adware, Ransomware tushunchalari va xavfsizlikni ta’minlash.' },
    { n: 15, term: '1 CHORAK', h: 1, title: 'Salomatlik va xavfsizlik.' },
    { n: 16, term: '1 CHORAK', h: 1, title: 'Raqamli tengsizlik tushunchasi va sabablari, Sanoati rivojlangan va rivojlanmagan hududlar, Ijtimoiy-iqtisodiy guruhlar.' },
    { n: 17, term: '1 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 18, term: '1 CHORAK', h: 1, title: 'Samarasi yuqori va past bo‘lgan texnologiyalar. Turli davlatlardagi holatlarni o‘rganish' },
    // 2 CHORAK (19..32)
    { n: 19, term: '2 CHORAK', h: 1, title: 'Tarmoq kompyuterlari. Lokal hududiy (Local area networks) va global hududiy tarmoq (Wide area networks).' },
    { n: 20, term: '2 CHORAK', h: 1, title: 'Kliyent-server va peer-to-peer tarmoqlari.' },
    { n: 21, term: '2 CHORAK', h: 1, title: 'Virtual shaxsiy tarmoq (VPN)' },
    { n: 22, term: '2 CHORAK', h: 1, title: 'Intranet va ekstranet. Internet va uning xususiyatlari' },
    { n: 23, term: '2 CHORAK', h: 1, title: 'Internetda muloqot qilish. Mobil tarmoqlar' },
    { n: 24, term: '2 CHORAK', h: 1, title: 'Video va veb konferensiya. Videokonferensiyaning jamiyatga ta’siri' },
    { n: 25, term: '2 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 26, term: '2 CHORAK', h: 1, title: 'Ekspert tizim haqida' },
    { n: 27, term: '2 CHORAK', h: 1, title: 'Bilimlar bazasi va yakunlovchi mexanizm' },
    { n: 28, term: '2 CHORAK', h: 1, title: 'Foydalanuvchi interfeysi' },
    { n: 29, term: '2 CHORAK', h: 1, title: 'Ekspert tizimlardan foydalanish' },
    { n: 30, term: '2 CHORAK', h: 1, title: 'Ma’lumotlarni qayta ishlash tizimlari' },
    { n: 31, term: '2 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 32, term: '2 CHORAK', h: 1, title: 'Real vaqt rejimida qayta ishlash tizimi' },
    // 3 CHORAK (33..52)
    { n: 33, term: '3 CHORAK', h: 1, title: 'Elektron jadval yaratish. Qatorlar va ustunlarni boshqarish' },
    { n: 34, term: '3 CHORAK', h: 1, title: 'Elektron jadval xavfsizligi' },
    { n: 35, term: '3 CHORAK', h: 1, title: 'Panel va oynalarni interfeysga mahkamlash' },
    { n: 36, term: '3 CHORAK', h: 1, title: 'Elektron jadvalni formatlash. Shartli formatlash' },
    { n: 37, term: '3 CHORAK', h: 1, title: 'Formula va funksiyalarni yaratish. Katakka absolyut va nisbiy murojaat' },
    { n: 38, term: '3 CHORAK', h: 1, title: 'Nomlangan katak va diapazon' },
    { n: 39, term: '3 CHORAK', h: 1, title: 'Yaxlitlash funksiyalari' },
    { n: 40, term: '3 CHORAK', h: 1, title: 'Sana va vaqtga oid funksiyalar. Shartli funksiyalar. Qidirish funksiyalari' },
    { n: 41, term: '3 CHORAK', h: 1, title: 'INDEX va MATCH funksiyalari' },
    { n: 42, term: '3 CHORAK', h: 1, title: 'Shartli statistik funksiyalar' },
    { n: 43, term: '3 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 44, term: '3 CHORAK', h: 1, title: 'Validatsiya qoidalari' },
    { n: 45, term: '3 CHORAK', h: 1, title: 'Elektron jadvalga qo‘llanadigan validatsiya' },
    { n: 46, term: '3 CHORAK', h: 1, title: 'Ma’lumotlar kiritilishini tekshirish' },
    { n: 47, term: '3 CHORAK', h: 1, title: 'Ma’lumotlarni filtrlash va saralash' },
    { n: 48, term: '3 CHORAK', h: 1, title: 'Jamlovchi jadvallar va diagrammalar' },
    { n: 49, term: '3 CHORAK', h: 1, title: 'Ma’lumotlarni import va eksport qilish' },
    { n: 50, term: '3 CHORAK', h: 1, title: 'Grafik va diagrammalar. Modellashtirish. Simulyatorlar' },
    { n: 51, term: '3 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 52, term: '3 CHORAK', h: 1, title: 'Takrorlash' },
    // 4 CHORAK (53..68)
    { n: 53, term: '4 CHORAK', h: 1, title: 'Ma’lumotlar bazasini yaratish. Ma’lumot turlari va katak hajmlari. Uch tomonlama bog‘lanish.' },
    { n: 54, term: '4 CHORAK', h: 1, title: 'Birga-bir va birga-ko‘p bog‘lanish. Ko‘pga-ko‘p bog‘lanish. Bog‘lanishlar yaratish va foydalanish' },
    { n: 55, term: '4 CHORAK', h: 1, title: 'Oddiy yozuvli va relyatsion ma’lumotlar bazasi o‘rtasidagi farq' },
    { n: 56, term: '4 CHORAK', h: 1, title: 'Ma’lumotlarni import qilish. Relyatsion ma’lumotlar bazasini yaratish.' },
    { n: 57, term: '4 CHORAK', h: 1, title: 'Kalitlar. Murakkab kalit. Tashqi kalit.' },
    { n: 58, term: '4 CHORAK', h: 1, title: 'Bog‘lanishlar yaxlitligi. Ma’lumotlar validatsiyasi va verifikatsiyasi' },
    { n: 59, term: '4 CHORAK', h: 1, title: 'Qidirish amallari. Murakkab querylar. Ichki va jamlanma querylar.' },
    { n: 60, term: '4 CHORAK', h: 1, title: 'Statik va dinamik parametrlar. Ma’lumotlar bazasi doirasida hisoblashlarni amalga oshirish.' },
    { n: 61, term: '4 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 62, term: '4 CHORAK', h: 1, title: 'Ma’lumotlarni saralash. Ma’lumot kiritish formalari.' },
    { n: 63, term: '4 CHORAK', h: 1, title: 'Hisobotlar. Ma’lumotlarni eksport qilish.' },
    { n: 64, term: '4 CHORAK', h: 1, title: 'Formni normallashtirish. Ma’lumotlar bazasini 3NFga normallashtirish.' },
    { n: 65, term: '4 CHORAK', h: 1, title: 'Ma’lumotlar lug‘ati. Ma’lumot turlari. Fayl va ma’lumotlarni boshqarish.' },
    { n: 66, term: '4 CHORAK', h: 1, title: 'Bevosita fayldan foydalanish. Boshqaruv axborot tizimlari.' },
    { n: 67, term: '4 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 68, term: '4 CHORAK', h: 1, title: 'Takrorlash' },
  ],
  11: [
    // 1 CHORAK (1..18)
    { n: 1, term: '1 CHORAK', h: 1, title: 'Videoni tahrirlash dasturi. Mutanosiblikni belgilash.' },
    { n: 2, term: '1 CHORAK', h: 1, title: 'Videoklipni montaj qilish va kliplarni birlashtirish.' },
    { n: 3, term: '1 CHORAK', h: 1, title: 'Matnli slayd va titr yaratish. Izoh va subtitr qo‘shish. Animatsiya va effektlar qo‘shish.' },
    { n: 4, term: '1 CHORAK', h: 1, title: 'Videoklipdan tasvir hosil qilish. Videoklipga ovozli ma’lumot qo‘shish va o‘chirish.' },
    { n: 5, term: '1 CHORAK', h: 1, title: 'Videoklip tezligini o‘zgartirish. Videoklipni turli fayl formatlarida eksport qilish.' },
    { n: 6, term: '1 CHORAK', h: 1, title: 'Audioni tahrirlash dasturlari' },
    { n: 7, term: '1 CHORAK', h: 1, title: 'Audiokliplarni kesish va kliplarni birlashtirish' },
    { n: 8, term: '1 CHORAK', h: 1, title: 'Audioklipning ovoz sozlamalarini tahrirlash' },
    { n: 9, term: '1 CHORAK', h: 1, title: 'Audioklipning tezligini va ovoz balandligini sozlash. Reverberatsiya effektini qo‘shish yoki uni sozlash.' },
    { n: 10, term: '1 CHORAK', h: 1, title: 'Audiokliplarni turli fayl formatlarida eksport qilish.' },
    { n: 11, term: '1 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 12, term: '1 CHORAK', h: 1, title: 'Texnologiya va bizning turmush tarzimiz. Uch o‘lchamli printer. To‘rtinchi va beshinchi avlod uyali aloqasi.' },
    { n: 13, term: '1 CHORAK', h: 1, title: 'Sun’iy intellekt. Boyitilgan reallik. Biometrik axborot. Bulutli texnologiyalar.' },
    { n: 14, term: '1 CHORAK', h: 1, title: 'Avtomatlashtirilgan tarjima. Golografik tasvirlash. Robototexnika.' },
    { n: 15, term: '1 CHORAK', h: 1, title: 'QR kodlar. Taqiladigan hisoblash qurilmalari.' },
    { n: 16, term: '1 CHORAK', h: 1, title: 'Ultra yuqori aniqlik darajasidagi televideniye. Ko‘rish qobiliyatini yaxshilash. Virtual reallik.' },
    { n: 17, term: '1 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 18, term: '1 CHORAK', h: 1, title: 'Takrorlash darsi' },
    // 2 CHORAK (19..32)
    { n: 19, term: '2 CHORAK', h: 1, title: 'Elektron tijorat va internet banking nima?' },
    { n: 20, term: '2 CHORAK', h: 1, title: 'Elektron pul o‘tkazmalari. Zaxiralarni avtomatik boshqarish' },
    { n: 21, term: '2 CHORAK', h: 1, title: 'Ma’lumotlarni intellektual tahlillash' },
    { n: 22, term: '2 CHORAK', h: 1, title: 'Ijtimoiy tarmoq va videokonferensiyalar' },
    { n: 23, term: '2 CHORAK', h: 1, title: 'Masofadan ishlash. Sport va tibbiyotda texnologiyalar' },
    { n: 24, term: '2 CHORAK', h: 1, title: 'Ishlab chiqarish va ta’limda texnologiyalar' },
    { n: 25, term: '2 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 26, term: '2 CHORAK', h: 1, title: 'Kompyuter tarmoqlari komponentlari' },
    { n: 27, term: '2 CHORAK', h: 1, title: 'Simsiz ulanish nuqtasi' },
    { n: 28, term: '2 CHORAK', h: 1, title: 'Shlyuz, Bridj va Fayervol. Bit oqimini uzatish' },
    { n: 29, term: '2 CHORAK', h: 1, title: 'Kanalli va paketli kommutatsiyalash. Xabarli kommutatsiyalash' },
    { n: 30, term: '2 CHORAK', h: 1, title: 'Optik usulda ma’lumot almashish. Simsiz aloqa/uzatish usullari' },
    { n: 31, term: '2 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 32, term: '2 CHORAK', h: 1, title: 'Takrorlash darsi' },
    // 3 CHORAK (33..52)
    { n: 33, term: '3 CHORAK', h: 1, title: 'Ma’lumotlarni uzatishda polosa kengligi va bit tezligining ahamiyati. BitTorrent protokoli' },
    { n: 34, term: '3 CHORAK', h: 1, title: 'Tarmoq xavfsizligi muammolari. Xavfsizlik usullari' },
    { n: 35, term: '3 CHORAK', h: 1, title: 'Ma’lumotlarni himoya qilish haqidagi qonun tamoyillari' },
    { n: 36, term: '3 CHORAK', h: 1, title: 'Sun’iy yo‘ldosh aloqa tizimlari' },
    { n: 37, term: '3 CHORAK', h: 1, title: 'Loyiha boshqaruvining bosqichlari. Konsepsiya va boshlash' },
    { n: 38, term: '3 CHORAK', h: 1, title: 'Loyiha boshqaruvi uchun foydalaniladigan dasturiy ta’minot turlari' },
    { n: 39, term: '3 CHORAK', h: 1, title: 'Kritik bosqichlarni tahlil qilish. Gantt diagrammalari' },
    { n: 40, term: '3 CHORAK', h: 1, title: 'Amaliy mashg‘ulot' },
    { n: 41, term: '3 CHORAK', h: 1, title: 'Avariya/falokatdan keyingi tiklanishni boshqarish' },
    { n: 42, term: '3 CHORAK', h: 1, title: 'Prototiplash' },
    { n: 43, term: '3 CHORAK', h: 1, title: 'Kompyuter yordamida dizayn yaratish va ishlab chiqarish' },
    { n: 44, term: '3 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 45, term: '3 CHORAK', h: 1, title: 'Tahlil. Hujjatlar tahlili usuli' },
    { n: 46, term: '3 CHORAK', h: 1, title: 'Dizayn. Ma’lumotlar oqimi diagrammasi. Tizim blok-sxemasi. Ekran formasi' },
    { n: 47, term: '3 CHORAK', h: 1, title: 'Yangi tizim uchun texnik va dasturiy ta’minot' },
    { n: 48, term: '3 CHORAK', h: 1, title: 'Ishlab chiqish va sinovdan o‘tkazish. Qora quti va oq quti strategiyasi sinovlari' },
    { n: 49, term: '3 CHORAK', h: 1, title: 'Alfa sinov va beta sinov' },
    { n: 50, term: '3 CHORAK', h: 1, title: 'Installyatsiya va hujjatlashtirish. Tahlil va texnik xizmat ko‘rsatish' },
    { n: 51, term: '3 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 52, term: '3 CHORAK', h: 1, title: 'Takrorlash darsi' },
    // 4 CHORAK (53..68)
    { n: 53, term: '4 CHORAK', h: 1, title: 'Vektorli va rastrli tasvirlar' },
    { n: 54, term: '4 CHORAK', h: 1, title: 'Guruhlash va biriktirish. Elementni burchak bo‘ylab aylantirish va joylashtirish. Transformatsiya uskunalari. Tanlash uskunalari.' },
    { n: 55, term: '4 CHORAK', h: 1, title: 'Tasvirni saqlash va hajmini kichraytirish. Matn uchun maydon yaratish. Rastrli tasvirlar. Qizil ko‘zni olib tashlash.' },
    { n: 56, term: '4 CHORAK', h: 1, title: 'Animatsiya asoslari. Niqoblovchi qatlam.' },
    { n: 57, term: '4 CHORAK', h: 1, title: 'Elektron xatlarni birlashtirish. Master hujjatni manba faylga biriktirish.' },
    { n: 58, term: '4 CHORAK', h: 1, title: 'Prompt matni yaratish. Kerakli yozuvlarni avtomatik belgilash. O‘zgaruvchi maydonlar.' },
    { n: 59, term: '4 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 60, term: '4 CHORAK', h: 1, title: 'Ma’lumotlarni chiqarish. HTML elementlari.' },
    { n: 61, term: '4 CHORAK', h: 1, title: 'O‘zgaruvchilar bilan ishlash. Ma’lumot turlari.' },
    { n: 62, term: '4 CHORAK', h: 1, title: 'Operatorlar. Stringlarni boshqarish.' },
    { n: 63, term: '4 CHORAK', h: 1, title: 'Array. Shartli buyruqlar.' },
    { n: 64, term: '4 CHORAK', h: 1, title: 'Luplar.' },
    { n: 65, term: '4 CHORAK', h: 1, title: 'Funksiyalar.' },
    { n: 66, term: '4 CHORAK', h: 1, title: 'HTML shakllari va boshqaruv hodisalari. Pop-up oynalar.' },
    { n: 67, term: '4 CHORAK', h: 1, title: 'Nazorat ishi' },
    { n: 68, term: '4 CHORAK', h: 1, title: 'Takrorlash darsi' },
  ],
};

function detectLessonType(title) {
  const low = title.toLowerCase();
  if (low.includes('nazorat ishi')) return 'assessment';
  if (low.includes('takrorlash')) return 'revision';
  if (low.includes('loyiha')) return 'project';
  if (low.includes('amaliy mashg‘ulot') || low.includes("amaliy mashg'ulot")) return 'practical';
  return 'regular';
}

function mapLessonToTopicUnit(grade, n, units) {
  const gradeUnits = units.filter((u) => u.grade === grade).sort((a, b) => a.order - b.order);
  for (const u of gradeUnits) {
    const nums = (u.lessonRange.match(/\d+/g) || []).map(Number);
    if (nums.length >= 2 && n >= nums[0] && n <= nums[1]) {
      return u;
    }
  }
  return gradeUnits[gradeUnits.length - 1];
}

// Rich domain classifier & content builder so every single one of the 340 lessons
// gets genuinely relevant Informatics explanations, examples, diagrams, 5 tests, and practical tasks!
function classifyDomain(grade, title, unit) {
  const t = title.toLowerCase();
  if (t.includes('nazorat ishi')) return 'assessment';
  if (t.includes('takrorlash darsi') || t === 'takrorlash') return 'revision';
  if (t.includes('sql') || t.includes('query') || t.includes('ma’lumotlar bazasi') || t.includes('kalit') || t.includes('3nf') || t.includes('relyatsion') || t.includes('bog‘lanish') || t.includes('forma')) return 'database';
  if (t.includes('excel') || t.includes('elektron jadval') || t.includes('diagramma') || t.includes('grafik') || t.includes('piktogramma') || t.includes('katak') || t.includes('formula') || t.includes('index') || t.includes('yaxlitlash') || t.includes('modellashtirish') || t.includes('jamlovchi')) return 'spreadsheet';
  if (t.includes('html') || t.includes('veb') || t.includes('web') || t.includes('url') || t.includes('brauzer') || t.includes('qidiruv') || t.includes('qidirish') || t.includes('link') || t.includes('stil jadval')) return 'web_html';
  if (t.includes('array') || t.includes('luplar') || t.includes('funksiyalar') || t.includes('operatorlar') || t.includes('o‘zgaruvchilar') || t.includes('string')) return 'js_prog';
  if (t.includes('scratch') || t.includes('sprayt') || t.includes('blok-sxema') || t.includes('labirint') || t.includes('algoritm') || t.includes('protsedura') || t.includes('dekompozitsiya') || t.includes('debag') || t.includes('dasturlash')) return 'algo_scratch';
  if (t.includes('tarmoq') || t.includes('router') || t.includes('vpn') || t.includes('intranet') || t.includes('kommutatsiya') || t.includes('shlyuz') || t.includes('optik') || t.includes('bittorrent') || t.includes('yo‘ldosh') || t.includes('simsiz') || t.includes('elektron tijorat') || t.includes('ijtimoiy tarmoq') || t.includes('konferensiya')) return 'network';
  if (t.includes('xavfsizlik') || t.includes('shifr') || t.includes('kodlash') || t.includes('phishing') || t.includes('antivirus') || t.includes('fayervol') || t.includes('mualliflik') || t.includes('salomatlik') || t.includes('tengsizlik') || t.includes('qonun')) return 'security';
  if (t.includes('video') || t.includes('audio') || t.includes('audacity') || t.includes('pencil2d') || t.includes('niqob') || t.includes('animatsiya') || t.includes('slayd') || t.includes('taqdimot') || t.includes('maket')) return 'media_pres';
  if (t.includes('ekspert tizim') || t.includes('bilimlar bazasi') || t.includes('sun’iy intellekt') || t.includes('sensor') || t.includes('real vaqt') || t.includes('3d') || t.includes('robototexnika') || t.includes('qr kod') || t.includes('biometrik') || t.includes('golograf')) return 'ai_systems';
  if (t.includes('gantt') || t.includes('loyiha') || t.includes('prototip') || t.includes('tizim') || t.includes('tahlil') || t.includes('alfa sinov') || t.includes('qora quti') || t.includes('avariya') || t.includes('installyatsiya')) return 'sdlc_project';
  if (t.includes('tasvir') || t.includes('pencil') || t.includes('line') || t.includes('shakllar') || t.includes('eraser') || t.includes('vektor') || t.includes('rastr') || t.includes('qizil ko‘z') || t.includes('qirqish')) return 'graphics';
  if (t.includes('pochta') || t.includes('xat') || t.includes('spam') || t.includes('birlashtirish') || t.includes('master hujjat') || t.includes('prompt matni')) return 'email_merge';
  if (t.includes('qurilma') || t.includes('operatsion') || t.includes('xotira') || t.includes('apparat') || t.includes('utilit') || t.includes('fayl kengaytma') || t.includes('hajmini kamaytirish')) return 'hardware_os';
  if (t.includes('matn') || t.includes('hujjat') || t.includes('shrift') || t.includes('sichqoncha') || t.includes('klaviatura') || t.includes('save') || t.includes('jadval') || t.includes('header') || t.includes('ustun') || t.includes('brend') || t.includes('stil') || t.includes('xatolar') || t.includes('verifikatsiya') || t.includes('validatsiya')) return 'document_word';
  return unit?.animType === 'network' ? 'network' : 'document_word';
}

const DOMAIN_META = {
  document_word: {
    animType: 'typing',
    diagramNodes: ['Kiritish / Tahrirlash', 'Formatlash va Stillar', 'Tekshirish (Validatsiya)', 'Chop etish / Saqlash'],
    examples: (title) => [
      `Amaliy namuna: “${title}” bo‘yicha maktab e’loni yoki rasmiy hisobot hujjatida matnni Ctrl+S bilan saqlash va to‘g‘ri nomlash.`,
      'Klaviaturada tezkor tugmalar: Ctrl+C (nusxa), Ctrl+X (kesish), Ctrl+V (joylash), Ctrl+Z (bekor qilish).',
      'Auditoriyaga mos shrift o‘lchami (12–14 pt), sarlavha stillari va sahifa hoshiyalarini sozlash.',
    ],
    terms: [
      { term: 'Kursor (Cursor)', meaning: 'Hujjat ichida keyingi belgi kiritiladigan faol o‘rinni ko‘rsatuvchi miltillovchi belgi.' },
      { term: 'Formatlash (Formatting)', meaning: 'Matn shrifti, o‘lchami, rangi, tekislanishi va sahifa maketini bezash jarayoni.' },
      { term: 'Validatsiya / Tekshirish', meaning: 'Kiritilgan ma’lumot va imlo xatolarini qoidalarga mosligini nazorat qilish.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: Ctrl+S yoki Print Preview...',
      keywords: ['ctrl', 'save', 'saqlash', 'font', 'shrift', 'header', 'footer', 'still', 'validatsiya', 'chop'],
      sample: 'Ctrl+S yordamida hujjatni qulay nom bilan saqlash va Print Preview orqali tekshirish',
      hint: 'Hujjatni saqlash, shrift yoki sahifani tekshirish buyruqlaridan birini yozing.',
    },
  },
  graphics: {
    animType: 'raster',
    diagramNodes: ['Piksellar / Vektorlar', 'Chizish va Shakllar', 'Transformatsiya / Qirqish', 'Eksport (PNG / SVG)'],
    examples: (title) => [
      `“${title}” mashqida chizilgan shakl qismini belgilab nusxalash, aylantirish (Rotate) va o‘lchamini mutanosib o‘zgartirish.`,
      'Rastrli tasvir (JPG/PNG) piksellardan, vektorli tasvir (SVG) esa matematik egri chiziqlardan iborat bo‘ladi.',
      'Qizil ko‘zni olib tashlash va tasvir hajmini kichraytirish orqali veb uchun optimallashtirish.',
    ],
    terms: [
      { term: 'Piksel (Pixel)', meaning: 'Rastrli tasvirni tashkil etuvchi eng kichik rangli nuqta.' },
      { term: 'Transformatsiya', meaning: 'Tasvirni aylantirish (Rotate), aks ettirish (Flip) yoki masshtablash amali.' },
      { term: 'Vektorli grafika', meaning: 'Kattalashtirilganda sifatini yo‘qotmaydigan matematik formulali tasvir turi.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: Rotate 90, Crop, PNG, SVG...',
      keywords: ['line', 'brush', 'eraser', 'rotate', 'flip', 'crop', 'qirqish', 'png', 'svg', 'piksel', 'vektor', 'rastr'],
      sample: 'Tasvirni Crop uskunasi bilan qirqib, PNG formatida saqlash',
      hint: 'Grafik uskuna (Line, Brush, Crop, Rotate) yoki tasvir formatini yozing.',
    },
  },
  spreadsheet: {
    animType: 'excel',
    diagramNodes: ['Katak manzili (A1:B10)', 'Formula va Funksiyalar', 'Shartli formatlash', 'Diagramma / Grafik'],
    examples: (title) => [
      `“${title}” jadvalida =SUM(B2:B6), =AVERAGE(C2:C6) va =IF(D2>=70;"O‘tdi";"Qayta") formulalarini qo‘llash.`,
      'Absolyut ($A$1) va nisbiy (A1) katak murojaati hamda =INDEX(B2:B10; MATCH("Ali"; A2:A10; 0)) qidiruvi.',
      'Ustunli va doiraviy diagrammalarga X-o‘qi, Y-o‘qi va aniq sarlavha biriktirish.',
    ],
    terms: [
      { term: 'Katak manzili', meaning: 'Ustun harfi va qator raqami birikmasi (masalan, B4 yoki absolyut $B$4).' },
      { term: 'Formula', meaning: 'Excelda har doim “=” belgisi bilan boshlanuvchi hisoblash ifodasi.' },
      { term: 'Diagramma', meaning: 'Jadvaldagi sonli ma’lumotlarni ko‘rgazmali ustun, chiziq yoki doira shaklida tasvirlash.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: =SUM(A1:A5) yoki =IF(B2>50;"Ha";"Yo‘q")',
      keywords: ['=', 'sum', 'average', 'if', 'index', 'match', 'round', '$', 'diagramma', 'katak'],
      sample: '=SUM(B2:B10)',
      hint: 'Excel formulasi “=” belgisi bilan boshlanishini unutmang.',
    },
  },
  database: {
    animType: 'database',
    diagramNodes: ['Jadval va Maydonlar', 'Birlamchi/Tashqi Kalit', 'Normallashtirish (1NF–3NF)', 'Query va Hisobot'],
    examples: (title) => [
      `“${title}” bo‘yicha O‘quvchilar jadvali (ID Primary Key, Ism, Sinf) va Baholar jadvalini Foreign Key orqali bog‘lash.`,
      'Query (so‘rov) yordamida shartga mos yozuvlarni ajratish: SELECT Ism, Sinf FROM Oquvchilar WHERE Sinf = 7.',
      'Ma’lumot kiritish formasi (Form) va ochiladigan ro‘yxat (Lookup) orqali xatosiz kiritishni ta’minlash.',
    ],
    terms: [
      { term: 'Birlamchi kalit (Primary Key)', meaning: 'Jadvaldagi har bir yozuvni yagona tarzda aniqlovchi takrorlanmas maydon.' },
      { term: 'Query (So‘rov)', meaning: 'Ma’lumotlar bazasidan aniq shartlar asosida ma’lumot qidirish va saralash vositasi.' },
      { term: 'Tashqi kalit (Foreign Key)', meaning: 'Ikki jadval orasida relyatsion bog‘lanish yaratuvchi maydon.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: Primary Key, SELECT * FROM ..., 3NF',
      keywords: ['key', 'kalit', 'query', 'select', 'where', 'form', '3nf', 'relyatsion', 'jadval', 'maydon'],
      sample: 'SELECT Ism FROM Oquvchilar WHERE Sinf = 10',
      hint: 'Kalit turi (Primary/Foreign Key), Query yoki normallashtirish atamasini kiriting.',
    },
  },
  algo_scratch: {
    animType: 'scratch',
    diagramNodes: ['Masalani dekompozitsiya qilish', 'Shart va Takrorlash', 'Protsedura / Blok', 'Sinash va Debaglash'],
    examples: (title) => [
      `“${title}” algoritmida spraytni kvadrat chizish uchun Repeat(4) { Move(100); Turn(90); } siklidan foydalanish.`,
      'Shartli tarmoqlanish: if (ball >= 10) { say("G‘olib!"); } else { changeScore(1); }.',
      'Katta muammoni kichik protseduralarga bo‘lish (dekompozitsiya) va chekka holatlarda dasturni debaglash.',
    ],
    terms: [
      { term: 'Algoritm', meaning: 'Qo‘yilgan masalani yechishga olib keladigan aniq, tartibli buyruqlar ketma-ketligi.' },
      { term: 'Sikl (Takrorlash)', meaning: 'Bir xil amallarni belgilangan marta yoki shart bajarilguncha qaytarish tuzilmasi.' },
      { term: 'Debaglash (Debugging)', meaning: 'Dasturdagi mantiqiy va sintaktik xatolarni aniqlab tuzatish jarayoni.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: repeat 4, if, blok-sxema, pen down...',
      keywords: ['repeat', 'takror', 'if', 'shart', 'pen', 'sprayt', 'protsedura', 'debag', 'dekompozitsiya', 'blok'],
      sample: 'Repeat(4) blokidan foydalanib kvadrat chizish va debaglash',
      hint: 'Scratch/algoritm buyrug‘i (repeat, if, pen, protsedura) nomini yozing.',
    },
  },
  web_html: {
    animType: 'html',
    diagramNodes: ['HTML (Tuzilma)', 'CSS (Dizayn va Rang)', 'Havola va URL', 'Sinash va Publikatsiya'],
    examples: (title) => [
      `“${title}” darsida asosiy HTML skeleti: <h1>Sarlavha</h1>, <p>Matn</p>, <a href="https://...">Havola</a> va <img src="rasm.png" alt="...">.`,
      'CSS yordamida rang va maketni boshqarish: body { background: #f3f5f8; color: #0f172a; }.',
      'Veb-brauzerda URL manzili (https://domen.uz/sahifa) orqali ishonchli axborotni tekshirish.',
    ],
    terms: [
      { term: 'HTML Teg', meaning: 'Veb-sahifa elementlarini belgilovchi burchakli qavsdagi buyruq (masalan, <a>, <img>, <p>).' },
      { term: 'CSS (Cascading Style Sheets)', meaning: 'Veb-sahifaning rangi, shrifti va joylashuvini bezovchi uslub qatlami.' },
      { term: 'URL', meaning: 'Internetdagi resursning yagona veb-manzili.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: <a href="...">, <h1>, CSS color, HTTPS...',
      keywords: ['<', 'html', 'css', 'href', 'img', 'url', 'http', 'link', 'color', 'div'],
      sample: '<a href="https://example.uz">Maktab sayti</a>',
      hint: 'HTML teg (<h1, <a, <img) yoki CSS/URL atamasini yozing.',
    },
  },
  js_prog: {
    animType: 'jsloop',
    diagramNodes: ['O‘zgaruvchi va Tip', 'Operator va Shart', 'Massiv (Array) va Lup', 'Funksiya va DOM Hodisa'],
    examples: (title) => [
      `“${title}” mavzusida JavaScript kodi: let ballar = [85, 92, 78]; for (let b of ballar) { if (b >= 80) console.log(b); }.`,
      'String metodlari va funksiyalar: function salom(ism) { return "Salom, " + ism; }.',
      'HTML formasi submit hodisasi (addEventListener) orqali kiritilgan qiymatni validatsiya qilish.',
    ],
    terms: [
      { term: 'Massiv (Array)', meaning: 'Bir nechta qiymatlarni tartiblangan indekslar bilan saqlovchi ma’lumot tuzilmasi.' },
      { term: 'Lup (Loop)', meaning: 'for yoki while yordamida takroriy hisoblash bajaruvchi kod bloki.' },
      { term: 'Funksiya', meaning: 'Parametr qabul qilib, qayta ishlatiladigan natija qaytaruvchi kod moduli.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: function test(), let arr = [], for(let i=0;...)',
      keywords: ['let', 'const', 'function', 'for', 'while', 'if', 'array', '[', 'return', 'event'],
      sample: 'function yigindi(a, b) { return a + b; }',
      hint: 'JavaScript kalit so‘zi (let, function, for, if, array) bilan namuna yozing.',
    },
  },
  network: {
    animType: 'network',
    diagramNodes: ['Mijoz (Kliyent)', 'Switch / Access Point', 'Router / Firewall', 'Server / Bulut (WAN)'],
    examples: (title) => [
      `“${title}” sxemasida lokal tarmoq (LAN) qurilmalari UTP kabel orqali Switchga, tashqi internet esa Router orqali WANga ulanadi.`,
      'Paketli kommutatsiya ma’lumotni kichik paketlarga bo‘lib eng optimal yo‘ldan uzatadi; VPN esa shifrlangan tunnel yaratadi.',
      'Polosa kengligi (Mbps) va bit tezligi katta video yoki bulutli ma’lumotlarni uzatish vaqtini belgilaydi.',
    ],
    terms: [
      { term: 'Router (Marshrutizator)', meaning: 'Turli tarmoqlarni o‘zaro bog‘lab, paketlarni eng qisqa IP yo‘nalishi bo‘yicha uzatuvchi qurilma.' },
      { term: 'LAN / WAN', meaning: 'Lokal hududiy tarmoq (bitta bino) va global hududiy tarmoq (shaharlararo/internet).' },
      { term: 'VPN', meaning: 'Ochiq tarmoq ustidan shifrlangan himoyalangan virtual shaxsiy tarmoq.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: Router, Switch, LAN, VPN, Firewall...',
      keywords: ['router', 'switch', 'hub', 'modem', 'lan', 'wan', 'vpn', 'ip', 'fayervol', 'paket', 'optik'],
      sample: 'Router LAN tarmog‘ini global internet (WAN) bilan bog‘laydi',
      hint: 'Tarmoq qurilmasi yoki protokol nomini (Router, Switch, VPN, LAN) kiriting.',
    },
  },
  security: {
    animType: 'security',
    diagramNodes: ['Tahdid tahlili', 'Kodlash va Shifrlash', 'Firewall / Antivirus', 'Qonuniy va Axloqiy Himoya'],
    examples: (title) => [
      `“${title}” doirasida simmetrik (bitta umumiy kalit, tez) va asimmetrik (ochiq/yopiq kalit juftligi) shifrlash farqini tahlil qilish.`,
      'Phishing, Vishing va Ransomware hujumlaridan himoyalanish: manzilni tekshirish, 2FA yoqish va zaxira nusxa (backup) saqlash.',
      'Mualliflik huquqi va shaxsiy ma’lumotlarni himoya qilish qonun tamoyillariga rioya etish.',
    ],
    terms: [
      { term: 'Phishing / Social Engineering', meaning: 'Soxta xat yoki sayt orqali foydalanuvchining parol va karta ma’lumotlarini aldash usuli.' },
      { term: 'Asimmetrik shifrlash', meaning: 'Shifrlash uchun ochiq kalit (Public Key) va deshifrlash uchun maxfiy kalit (Private Key) ishlatiladigan usul.' },
      { term: 'Firewall (Tarmoq ekrani)', meaning: 'Tarmoqqa kiruvchi va chiquvchi trafikni xavfsizlik qoidalariga ko‘ra filtrlaydigan himoya.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: 2FA, shifrlash, antivirus, fayervol, phishing...',
      keywords: ['shifr', 'kalit', 'antivirus', 'fayervol', 'firewall', 'phishing', '2fa', 'parol', 'huquq', 'backup'],
      sample: 'Ikki bosqichli autentifikatsiya (2FA) va HTTPS shifrlashdan foydalanish',
      hint: 'Xavfsizlik chorasi (shifrlash, fayervol, 2FA, antivirus) nomini kiriting.',
    },
  },
  media_pres: {
    animType: 'video',
    diagramNodes: ['Ssenariy va Maket', 'Montaj / Kadrlar', 'Audio va Effektlar', 'Eksport (MP4 / MP3)'],
    examples: (title) => [
      `“${title}” loyihasida videoklip va audioklipni vaqt shkalasida (Timeline) kesish, o‘tish effektlari va subtitr qo‘shish.`,
      'Audacity yordamida shovqinni kamaytirish, ovoz balandligi va reverberatsiya sozlamalarini tahrirlash.',
      'Taqdimot slaydlarida ortiqcha matn o‘rniga vizual diagramma va mos shrift kontrastidan foydalanish.',
    ],
    terms: [
      { term: 'Timeline (Vaqt shkalasi)', meaning: 'Video, rasm va audio treklarni vaqt bo‘yicha joylashtirib montaj qiladigan panel.' },
      { term: 'Subtitr / Titr', meaning: 'Videorolik kadrlariga sinxronlashtirib qo‘shiladigan izoh va sarlavha matnlari.' },
      { term: 'Eksport formati', meaning: 'Tayyor media loyihani MP4, MOV, MP3 yoki WAV ko‘rinishida yakuniy faylga chiqarish.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: Timeline, MP4, MP3, Audacity, Slayd...',
      keywords: ['video', 'audio', 'mp4', 'mp3', 'wav', 'slayd', 'animatsiya', 'niqob', 'montaj', 'audacity'],
      sample: 'Timeline panelida kliplarni birlashtirib MP4 formatida eksport qilish',
      hint: 'Video/audio montaj tushunchasi yoki eksport formatini (MP4, MP3, Timeline) yozing.',
    },
  },
  ai_systems: {
    animType: 'expert',
    diagramNodes: ['Sensorlar / Kirish', 'Bilimlar Bazasi', 'Yakunlovchi Mexanizm', 'Foydalanuvchi Qarori'],
    examples: (title) => [
      `“${title}” mavzusida ekspert tizim: Bilimlar bazasi (qoidalar) + Inference Engine (xulosa chiqarish) + UI.`,
      'Harakat, bosim, harorat va yorug‘lik sensorlaridan kelgan ma’lumotlarni real vaqt tizimida (Real-time) qayta ishlash.',
      'Sun’iy intellekt, QR kod, VR/AR (boyitilgan reallik) va biometrik autentifikatsiya qo‘llanilishi.',
    ],
    terms: [
      { term: 'Ekspert tizim', meaning: 'Mutaxassis bilimlari asosida murakkab savollarga xulosa va tavsiya beruvchi dastur.' },
      { term: 'Sensor', meaning: 'Atrof-muhitdagi fizik kattaliklarni (harorat, yorug‘lik, bosim) raqamli signalga aylantiruvchi qurilma.' },
      { term: 'Real vaqt tizimi', meaning: 'Kiruvchi ma’lumotga kechikishsiz (millisoniyalarda) javob qaytaruvchi boshqaruv tizimi.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: Bilimlar bazasi, Sensor, AI, VR, Biometrika...',
      keywords: ['ekspert', 'bilim', 'sensor', 'real', 'ai', 'intellekt', 'vr', 'ar', 'qr', 'biometrik', '3d'],
      sample: 'Bilimlar bazasi va yakunlovchi mexanizm asosida tashxis qo‘yuvchi ekspert tizim',
      hint: 'Ekspert tizim, sensor yoki zamonaviy texnologiya atamasini kiriting.',
    },
  },
  sdlc_project: {
    animType: 'gantt',
    diagramNodes: ['Tahlil va Konsepsiya', 'Loyihalash (DFD / Prototip)', 'Ishlab chiqish va Sinov', 'Joriy etish va Xizmat'],
    examples: (title) => [
      `“${title}” bosqichida SDLC sikli: Tahlil → Dizayn → Kodlash → Qora/Oq quti sinovi → Alfa/Beta sinov → Texnik xizmat.`,
      'Gantt diagrammasida vazifalar davomiyligi va kritik yo‘lni (Critical Path) aniqlash.',
      'Avariyadan keyingi tiklanish rejasi (Disaster Recovery) va hujjat tahlili usullari.',
    ],
    terms: [
      { term: 'Gantt diagrammasi', meaning: 'Loyiha vazifalarining boshlanish, tugash muddati va ketma-ketligini ko‘rsatuvchi jadval.' },
      { term: 'Qora quti / Oq quti sinovi', meaning: 'Dasturni ichki kodsiz funksional (Black-box) va ichki mantiq asosida (White-box) tekshirish.' },
      { term: 'Prototiplash', meaning: 'Yakuniy tizimni qurishdan oldin foydalanuvchi bilan sinash uchun tezkor namuna yaratish.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: Gantt, Prototip, Alfa sinov, Black-box...',
      keywords: ['gantt', 'kritik', 'prototip', 'qora', 'oq', 'alfa', 'beta', 'tahlil', 'dizayn', 'tiklanish', 'loyiha'],
      sample: 'Kritik bosqichlarni Gantt diagrammasida belgilash va Alfa/Beta sinovdan o‘tkazish',
      hint: 'SDLC bosqichi, Gantt yoki sinov turi nomini kiriting.',
    },
  },
  email_merge: {
    animType: 'email',
    diagramNodes: ['Qabul qiluvchi (To / CC)', 'Mavzu va Xat Matni', 'Ilova / Mail Merge Manbasi', 'Yuborish va Saralash'],
    examples: (title) => [
      `“${title}” amaliyotida elektron xatning To (asosiy qabul qiluvchi), Subject (mavzu) va Attachment (ilova) maydonlarini to‘g‘ri to‘ldirish.`,
      'Mail Merge: Master hujjatdagi «Ism» va «Manzil» o‘zgaruvchilarini Excel/DB ro‘yxati bilan avtomatik birlashtirish.',
      'Spam xabarlarni aniqlash va papkalarga (Kiruvchi, Yuborilgan, Muhim) saralash.',
    ],
    terms: [
      { term: 'Mail Merge', meaning: 'Bitta shablon hujjatni ma’lumotlar manbasi bilan birlashtirib ko‘plab shaxsiy xatlar yaratish.' },
      { term: 'Spam', meaning: 'Roziliksiz ommaviy yuboriladigan istalmagan reklama yoki xavfli elektron xabarlar.' },
      { term: 'Ilova (Attachment)', meaning: 'Elektron xatga biriktirib yuboriladigan hujjat, rasm yoki arxiv fayli.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: user@maktab.uz, Mail Merge, Spam, Attachment...',
      keywords: ['@', 'pochta', 'email', 'xat', 'spam', 'ilova', 'merge', 'master', 'manzil'],
      sample: 'Master hujjatni Excel manba fayli bilan birlashtirib @ manzillarga yuborish',
      hint: 'Email belgisi (@), Mail Merge yoki Spam/Ilova atamasini kiriting.',
    },
  },
  hardware_os: {
    animType: 'hardware',
    diagramNodes: ['Kiritish qurilmalari', 'CPU va Xotira (RAM/ROM)', 'Operatsion Tizim va Drayver', 'Chiqarish va Fayl Tizimi'],
    examples: (title) => [
      `“${title}” mavzusida xotira hisob-kitobi: 1 KB = 1024 bayt, 1 MB = 1024 KB; 4 GB faylga sig‘adigan rasmlar sonini hisoblash.`,
      'Fayl kengaytmalari (.docx, .xlsx, .png, .mp4, .zip) orqali formatni aniqlash va hajmni siqish (ZIP/RAR).',
      'Operatsion tizim (Windows, Linux, macOS) va drayverlarning apparat hamda foydalanuvchi o‘rtasidagi roli.',
    ],
    terms: [
      { term: 'Operatsion tizim (OS)', meaning: 'Kompyuter qurilmalari va barcha amaliy dasturlar ishini boshqaruvchi tizimli dastur.' },
      { term: 'RAM / ROM', meaning: 'Tezkor (vaqtinchalik) xotira va doimiy (o‘qish uchun) xotira.' },
      { term: 'Drayver', meaning: 'Operatsion tizimning tashqi/ichki qurilma (printer, video karta) bilan ishlashini ta’minlovchi dastur.' },
    ],
    practiceCmd: {
      placeholder: 'Masalan: RAM, CPU, 1024 bayt, Drayver, .zip...',
      keywords: ['ram', 'rom', 'cpu', 'kb', 'mb', 'gb', '1024', 'drayver', 'os', 'zip', 'fayl', 'kengaytma'],
      sample: '1 MB = 1024 KB; drayver OS va apparat qurilma o‘rtasidagi ko‘prikdir',
      hint: 'Xotira birligi (KB, MB, RAM), drayver yoki fayl kengaytmasini kiriting.',
    },
  },
  assessment: {
    animType: 'expert',
    diagramNodes: ['O‘tilgan Bo‘limlarni Tahlil', '5 ta Nazorat Testi', 'Amaliy Topshiriq Tekshiruvi', 'Natija va Xulosa'],
    examples: (title) => [
      `“${title}” darsida chorak/bo‘lim davomida o‘rganilgan barcha nazariy tushunchalar va amaliy ko‘nikmalar kompleks baholanadi.`,
      'Test savollarini yechishda savol shartini diqqat bilan o‘qib, chalg‘ituvchi javoblarni chiqarib tashlash usuli.',
      'Amaliy topshiriqni bajarishda tayyor natijani saqlash, sinovdan o‘tkazish va xatolarni tuzatish.',
    ],
    terms: [
      { term: 'Nazorat ishi', meaning: 'O‘quvchilarning bo‘lim bo‘yicha olgan bilim va amaliy malakasini rasmiy baholash bosqichi.' },
      { term: 'Mezonli baholash', meaning: 'Har bir topshiriqning to‘g‘riligi, aniqligi va mustaqilligi bo‘yicha ball qo‘yish.' },
      { term: 'O‘z-o‘zini tekshirish', meaning: 'Javobni topshirishdan avval mantiq va sintaksisni qayta ko‘zdan kechirish.' },
    ],
    practiceCmd: {
      placeholder: 'Bo‘lim bo‘yicha asosiy xulosangizni yozing...',
      keywords: ['nazorat', 'test', 'tahlil', 'xulosa', 'bilim', 'amaliy', 'saqlash', 'tekshirish'],
      sample: 'Bo‘lim mavzulari bo‘yicha nazorat testi va amaliy mashq tekshirildi',
      hint: 'Nazorat ishi yoki tekshirish haqida qisqa javob yozing.',
    },
  },
  revision: {
    animType: 'gantt',
    diagramNodes: ['Asosiy Atamalarni Yodlash', 'Amaliy Mashqlarni Qaytarish', 'Xatolar Ustida Ishlash', 'Yakuniy Mustahkamlash'],
    examples: (title) => [
      `“${title}” darsida chorak davomida o‘zlashtirilgan asosiy formulalar, algoritmlar va terminlar qayta mustahkamlanadi.`,
      'Avvalgi nazorat ishlarida uchragan xatolarni tahlil qilib, muammoli mavzular bo‘yicha mini-o‘yinlarni qayta o‘ynash.',
      'Keyingi bo‘lim yoki sinf mavzulariga poydevor bo‘ladigan tayanch bilimlarni tizimlashtirish.',
    ],
    terms: [
      { term: 'Takrorlash (Revision)', meaning: 'Oldin o‘rganilgan bilim va ko‘nikmalarni uzoq muddatli xotirada mustahkamlash jarayoni.' },
      { term: 'Tizimlashtirish', meaning: 'Alohida darslarni yagona mantiqiy sxema va bog‘liqlikka keltirish.' },
      { term: 'Refleksiya', meaning: 'O‘z o‘zlashtirish darajasini baholab, kuchli va zaif tomonlarni aniqlash.' },
    ],
    practiceCmd: {
      placeholder: 'Takrorlash bo‘yicha asosiy xulosani kiriting...',
      keywords: ['takrorlash', 'mustahkamlash', 'tizim', 'algoritm', 'dastur', 'xulosa', 'amaliy'],
      sample: 'Chorak mavzulari bo‘yicha asosiy atama va amaliy ko‘nikmalar takrorlandi',
      hint: 'Takrorlash yoki mustahkamlash so‘zini qatnashtirib javob yozing.',
    },
  },
};

function build5QuestionsForLesson(grade, lessonNum, title, term, domain, existingUnit) {
  const unitTests = existingUnit?.tests || [];
  // Reuse authentic unit test question when it matches cleanly as Q1, and build 4 additional
  // strictly lesson-scoped questions (or all 5 tailored to the lesson title & domain) so every lesson has 5 distinct questions!
  const lType = detectLessonType(title);
  const typeLabel =
    lType === 'assessment'
      ? 'nazorat va baholash'
      : lType === 'revision'
      ? 'takrorlash va mustahkamlash'
      : lType === 'practical' || lType === 'project'
      ? 'amaliy loyiha va mashq'
      : 'nazariy va amaliy dars';

  const dMeta = DOMAIN_META[domain] || DOMAIN_META.document_word;
  const term0 = dMeta.terms[0];
  const term1 = dMeta.terms[1];
  const term2 = dMeta.terms[2];

  const q1 = {
    code: `g${grade}-l${String(lessonNum).padStart(2, '0')}-q1`,
    order: 1,
    question: `${grade}-sinf ${lessonNum}-dars (“${title}”) asosan qaysi o‘quv yo‘nalishiga bag‘ishlangan?`,
    options: [
      `${grade}-sinf ${term} rejasidagi ${typeLabel} va “${title}” mavzusiga`,
      'Faqat kompyuter korpusini bo‘yash va bezashga',
      'Matematika fanining faqat geometrik isbotlariga',
      'Kompyuterni tarmoqdan butunlay uzib qo‘yishga',
    ],
    correct_index: 0,
    explanation: `Rasmiy 2026–2027 yillik taqvimiy rejaga ko‘ra ${grade}-sinf ${lessonNum}-dars aynan “${title}” (${term}) mavzusini qamrab oladi.`,
  };

  const q2 = {
    code: `g${grade}-l${String(lessonNum).padStart(2, '0')}-q2`,
    order: 2,
    question: `“${title}” mavzusida qo‘llaniladigan «${term0.term}» atamasining to‘g‘ri ta’rifi qaysi?`,
    options: [
      'Kompyuterni elektr tarmog‘idan o‘chiradigan mexanik tugma',
      term0.meaning,
      'Faqat printer qog‘ozining qalinligini o‘lchaydigan chizg‘ich',
      'Internet tezligini pasaytiruvchi tasodifiy xatolik',
    ],
    correct_index: 1,
    explanation: `${term0.term} — ${term0.meaning}`,
  };

  const q3 = {
    code: `g${grade}-l${String(lessonNum).padStart(2, '0')}-q3`,
    order: 3,
    question: `«${term1.term}» tushunchasi “${title}” darsida qanday vazifani bajaradi?`,
    options: [
      'Barcha saqlangan fayllarni ogohlantirishsiz o‘chirib yuboradi',
      'Faqat tizim soati va taqvimini orqaga qaytaradi',
      term1.meaning,
      'Monitor yorqinligini nolga tushirib qo‘yadi',
    ],
    correct_index: 2,
    explanation: `${term1.term}: ${term1.meaning}`,
  };

  const q4 = {
    code: `g${grade}-l${String(lessonNum).padStart(2, '0')}-q4`,
    order: 4,
    question: `“${title}” darsidagi amaliy ishlarni to‘g‘ri bajarish tartibini belgilang:`,
    options: [
      'Natijani saqlamasdan dasturni darhol yopish',
      'Fayl formatini tekshirmasdan tasodifiy belgilar kiritish',
      'Tekshiruv va validatsiya bosqichlarini butunlay o‘tkazib yuborish',
      `Bosqichma-bosqich: ${dMeta.diagramNodes.join(' → ')}`,
    ],
    correct_index: 3,
    explanation: `To‘g‘ri ish ketma-ketligi: ${dMeta.diagramNodes.join(' → ')}.`,
  };

  // Pick a real domain question from existing unit test if aligned, or synthesize Q5 around term2
  let q5;
  if (unitTests.length > 0 && lType === 'regular') {
    const pick = unitTests[lessonNum % unitTests.length];
    q5 = {
      code: `g${grade}-l${String(lessonNum).padStart(2, '0')}-q5`,
      order: 5,
      question: pick.question,
      options: pick.options,
      correct_index: pick.correctIndex,
      explanation: pick.explanation,
    };
  } else {
    q5 = {
      code: `g${grade}-l${String(lessonNum).padStart(2, '0')}-q5`,
      order: 5,
      question: `“${title}” bo‘yicha «${term2.term}» nimani anglatadi?`,
      options: [
        term2.meaning,
        'Klaviatura tugmalarining joylashuvini tasodifiy almashtirish',
        'Kompyuter xotirasini to‘ldirish uchun keraksiz nusxalar yaratish',
        'Hech qanday axborot qiymatiga ega bo‘lmagan bo‘sh fayl',
      ],
      correct_index: 0,
      explanation: `${term2.term} — ${term2.meaning}`,
    };
  }

  return [q1, q2, q3, q4, q5];
}

function buildLessonFullRecord(grade, item, seedData) {
  const slug = `g${grade}-l${String(item.n).padStart(2, '0')}`;
  const dars = `${item.n}-dars`;
  const lType = detectLessonType(item.title);
  const unit = mapLessonToTopicUnit(grade, item.n, seedData.topics);
  const domain = classifyDomain(grade, item.title, unit);
  const dMeta = DOMAIN_META[domain] || DOMAIN_META.document_word;

  const gradeFocus =
    grade <= 6
      ? 'Boshlang‘ich va o‘rta bosqich o‘quvchilari uchun sodda, ko‘rgazmali va amaliy qadamlar asosida tushuntiriladi.'
      : grade <= 8
      ? '7–8-sinf darajasida mustaqil loyihalash, mantiqiy fikrlash va amaliy natijani tekshirishga e’tibor qaratiladi.'
      : '9–11-sinf yuqori bosqichida tizimli tahlil, standartlar, xavfsizlik hamda kasbiy-texnik yondashuv chuqur o‘rganiladi.';

  const typeExplain =
    lType === 'assessment'
      ? `Ushbu dars (${dars}) “${unit.title}” bo‘limi va ${item.term} doirasida egallangan bilim hamda ko‘nikmalarni nazorat qilishga mo‘ljallangan. O‘quvchilar nazariy savollar bilan birga amaliy topshiriqlar va 5 talik test orqali o‘z natijalarini tekshiradilar.`
      : lType === 'revision'
      ? `Ushbu dars (${dars}) “${unit.title}” bo‘limida o‘tilgan asosiy mavzularni qayta ko‘rib chiqish, murakkab jihatlarni tahlil qilish va bilimlarni interaktiv o‘yin hamda testlar orqali mustahkamlashga qaratilgan.`
      : lType === 'practical' || lType === 'project'
      ? `Ushbu amaliy/loyiha darsida (${dars}) o‘quvchilar “${item.title}” mavzusi bo‘yicha nazariy bilimlarni bevosita amaliy topshiriq, namuna va interaktiv mashqlar orqali sinab ko‘radilar.`
      : `“${item.title}” darsi ${grade}-sinf Informatika va axborot texnologiyalari fanining ${item.term} rejasidagi ${item.n}-darsidir (${unit.title} bo‘limi). ${gradeFocus}`;

  const explanation = [
    typeExplain,
    `Dars davomida ${dMeta.diagramNodes.join(' → ')} ketma-ketligi asosiy tayanch jarayon sifatida ko‘rib chiqiladi. Har bir bosqichda kiritilgan ma’lumotlarning aniqligi, formati va xavfsizligi tekshiriladi.`,
    `Amaliy ish sifatida o‘quvchilar ${dMeta.terms.map((t) => t.term).join(', ')} kabi asosiy tushunchalarni real misollar yordamida qo‘llaydilar va yakunda 5 ta test savoli orqali o‘zlashtirish darajasini baholaydilar.`,
  ];

  const objectives = [
    `“${item.title}” mavzusining asosiy mazmuni va maqsadini tushunish`,
    `${dMeta.terms[0].term} va ${dMeta.terms[1].term} atamalarini amalda to‘g‘ri qo‘llash`,
    `${dMeta.diagramNodes[0]} dan ${dMeta.diagramNodes[3]} gacha bo‘lgan bosqichlarni bajarish`,
    '5 ta nazorat testi va amaliy topshiriqni mustaqil yechish',
  ];

  const practical_examples = dMeta.examples(item.title);
  const summary_text = `${grade}-sinf ${dars} (“${item.title}”) yakunida o‘quvchi ${dMeta.terms
    .map((t) => t.term)
    .join(', ')} tushunchalarini biladi hamda amaliy vazifani mustaqil bajara oladi.`;

  const visual_diagram = {
    type: dMeta.animType,
    caption: `${dars}: ${item.title} — jarayon sxemasi`,
    nodes: dMeta.diagramNodes,
  };

  const slides = [
    {
      order: 1,
      layout: 'cover',
      title: `${dars}: ${item.title}`,
      subtitle: `${grade}-sinf · ${item.term} · ${unit.title}`,
      bullet_points: objectives,
      image: null,
      speaker_notes: `Dars boshida ${item.title} mavzusining maqsadlari va oldingi dars bilan bog‘liqligini tushuntiring.`,
    },
    {
      order: 2,
      layout: 'concepts',
      title: 'Asosiy atamalar va tushunchalar',
      subtitle: `${grade}-sinf Informatika tayanch lug‘ati`,
      bullet_points: dMeta.terms.map((t) => `${t.term}: ${t.meaning}`),
      image: null,
      speaker_notes: 'Har bir atamani doska yoki proyektor yordamida qisqa misol bilan izohlang.',
    },
    {
      order: 3,
      layout: 'diagram',
      title: `Vizual sxema: ${item.title}`,
      subtitle: `${dMeta.diagramNodes.join(' → ')}`,
      bullet_points: explanation.slice(0, 2),
      image: null,
      speaker_notes: 'Interaktiv diagrammadagi har bir bosqich ketma-ketligini tushuntiring.',
    },
    {
      order: 4,
      layout: 'practice',
      title: 'Amaliy misollar va namuna yechimlar',
      subtitle: 'Sinfda bajariladigan real vaziyatlar',
      bullet_points: practical_examples,
      image: null,
      speaker_notes: 'O‘quvchilardan amaliy namunani mustaqil takrorlashni so‘rang.',
    },
    {
      order: 5,
      layout: 'summary',
      title: 'Xulosa va 5 talik nazoratga tayyorgarlik',
      subtitle: `${dars} yakuni · Test · Amaliyot · O‘yin`,
      bullet_points: [
        summary_text,
        'Dars oxiridagi 5 ta test savolini yechib natijangizni saqlang.',
        'Amaliy mashq va mavzuga mos interaktiv o‘yinni bajaring.',
      ],
      image: null,
      speaker_notes: 'Yakuniy baholash hamda keyingi darsga tayyorgarlik ko‘rsatmasini bering.',
    },
  ];

  const practices = [
    {
      code: `${slug}-p1`,
      order: 1,
      title: `${dars} · Asosiy buyruq va sintaksis`,
      instruction: `“${item.title}” mavzusi bo‘yicha asosiy buyruq, formula, teg yoki kalit so‘zni kiriting:`,
      placeholder: dMeta.practiceCmd.placeholder,
      expected_keywords: dMeta.practiceCmd.keywords,
      sample_answer: dMeta.practiceCmd.sample,
      hint: dMeta.practiceCmd.hint,
    },
    {
      code: `${slug}-p2`,
      order: 2,
      title: `${dars} · «${dMeta.terms[0].term}» qo‘llanilishi`,
      instruction: `«${dMeta.terms[0].term}» tushunchasini “${item.title}” darsidagi amaliy misol bilan qisqa izohlang:`,
      placeholder: `Masalan: ${dMeta.terms[0].term.split(' ')[0]} — ${dMeta.practiceCmd.sample.slice(0, 28)}...`,
      expected_keywords: [
        ...dMeta.practiceCmd.keywords,
        dMeta.terms[0].term.split(' ')[0].toLowerCase().replace(/[^a-z0-9o‘g‘a-zа-я]/gi, ''),
      ].filter(Boolean),
      sample_answer: `${dMeta.terms[0].term}: ${dMeta.examples(item.title)[0]}`,
      hint: `“${dMeta.terms[0].term.split(' ')[0]}” atamasini yoki asosiy buyruqni qo‘llang.`,
    },
    {
      code: `${slug}-p3`,
      order: 3,
      title: `${dars} · Bosqichlar va natija tekshiruvi`,
      instruction: `“${item.title}” ishini tekshirish yoki yakunlash bosqichini yozing (${dMeta.diagramNodes[0]} → ${dMeta.diagramNodes[dMeta.diagramNodes.length - 1]}):`,
      placeholder: `Masalan: ${dMeta.diagramNodes[dMeta.diagramNodes.length - 1]}`,
      expected_keywords: [
        ...dMeta.practiceCmd.keywords,
        dMeta.diagramNodes[0].split(' ')[0].toLowerCase(),
        dMeta.diagramNodes[dMeta.diagramNodes.length - 1].split(' ')[0].toLowerCase(),
        'tekshir',
        'saql',
        'natija',
      ],
      sample_answer: dMeta.diagramNodes.join(' → '),
      hint: 'Ish ketma-ketligi bosqichi yoki tekshirish/saqlash so‘zini kiriting.',
    },
  ];

  const tests = build5QuestionsForLesson(grade, item.n, item.title, item.term, domain, unit);

  // Pick relevant game IDs: topic's dedicated game first, then unit games, then grade games
  const directGameIds = seedData.games.filter((g) => g.topicId === unit.id).map((g) => g.id);
  const gradeGameIds = seedData.games.filter((g) => g.grade === grade).map((g) => g.id);
  const unitGameIds = Array.isArray(unit?.gameIds) ? unit.gameIds : [];
  const game_ids = [...new Set([...directGameIds, ...unitGameIds, ...gradeGameIds])].slice(0, 5);

  return {
    slug,
    grade,
    topic_slug: unit.id,
    lesson_number: item.n,
    dars,
    title: item.title,
    term: item.term,
    hours: item.h,
    lesson_type: lType,
    note: item.note || '',
    game_ids,
    content: {
      objectives,
      explanation,
      practical_examples,
      key_terms: dMeta.terms,
      summary_text,
      anim_type: dMeta.animType,
      anim_title: `${dars} — ${item.title}`,
      anim_subtitle: `${grade}-sinf · ${item.term} vizual sxemasi`,
      visual_diagram,
    },
    slides,
    practices,
    tests,
  };
}

const EXPANDED_TOPIC_BLUEPRINTS = [
  // ================= 5-SINF (8 bo'lim, 1..34) =================
  { id: 'g5-u1', grade: 5, order: 1, term: '1-yarim yillik', start: 1, end: 5, domain: 'document_word', title: 'Matn muharriri va kiritish asoslari', shortDesc: 'Matnli hujjat bilan ishlash, sichqoncha va klaviatura, belgilash, o‘chirish va ko‘chirish.', animTitle: 'Klaviatura va Kursor Harakati', animSubtitle: 'Matn kiritish, belgilash va Ctrl+C / Ctrl+V' },
  { id: 'g5-u2', grade: 5, order: 2, term: '1-yarim yillik', start: 6, end: 9, domain: 'document_word', title: 'Hujjatni tekshirish, chop etish va saqlash', shortDesc: 'Asosiy tugmalar, chop etish, imlo tekshiruvi, Save tugmasi va qulay fayl nomi berish.', animTitle: 'Hujjatni Tekshirish va Saqlash', animSubtitle: 'Imlo nazorati, Ctrl+P va Ctrl+S bilan saqlash' },
  { id: 'g5-u3', grade: 5, order: 3, term: '1-yarim yillik', start: 10, end: 13, domain: 'graphics', title: 'Grafik muharrir: Line, Pencil, Brush va Shakllar', shortDesc: 'Tasvir yaratish, Line, Pencil, Brush uskunalari, chiziq qalinligi, rangi va shakllar.', animTitle: 'Grafik Muharrir Asoslari', animSubtitle: 'Line, Pencil, Brush va geometrik shakllar' },
  { id: 'g5-u4', grade: 5, order: 4, term: '1-yarim yillik', start: 14, end: 16, domain: 'graphics', title: 'Tasvir qismlarini tahrirlash va saqlash', shortDesc: 'Nusxa olish, kesib tashlash, joylashtirish, Nazorat ishi, Eraser uskunasi va tasvirni saqlash.', animTitle: 'Tasvir Tahrirlash va Eksport', animSubtitle: 'Select, Cut/Copy/Paste, Eraser va saqlash' },
  { id: 'g5-u5', grade: 5, order: 5, term: '2-yarim yillik', start: 17, end: 20, domain: 'spreadsheet', title: 'Axborotni guruhlash, piktogramma va Excel', shortDesc: 'Axborotni guruhlash, qiymatini hisoblash, piktogramma, Excel jadval va diagramma o‘qlari.', animTitle: 'Piktogramma va Excel Diagramma', animSubtitle: 'Jadvalga ma’lumot kiritish va X/Y o‘qlarini sozlash' },
  { id: 'g5-u6', grade: 5, order: 6, term: '2-yarim yillik', start: 21, end: 23, domain: 'spreadsheet', title: 'Diagrammalarni bezash va tahlil qilish', shortDesc: 'Diagrammadan xulosa chiqarish, ustunli diagramma rangini o‘zgartirish va Nazorat ishi.', animTitle: 'Diagramma Tahlili', animSubtitle: 'Ustunlar rangini boshqarish va xulosa chiqarish' },
  { id: 'g5-u7', grade: 5, order: 7, term: '2-yarim yillik', start: 24, end: 27, domain: 'algo_scratch', title: 'Blok-sxema, spraytlar va robot labirinti', shortDesc: 'Blok-sxema va burchaklar, spraytlarni harakatlantirish, robot labirinti va takrorlash.', animTitle: 'Robot Labirinti va Sprayt', animSubtitle: 'Blok-sxema, burilish burchaklari va algoritm' },
  { id: 'g5-u8', grade: 5, order: 8, term: '2-yarim yillik', start: 28, end: 34, domain: 'email_merge', title: 'Qidiruv tizimlari, brauzerlar va elektron pochta', shortDesc: 'Qidiruv tizimlari, veb-brauzerlar, elektron xat yozish, o‘qish, javob qaytarish va formatlash.', animTitle: 'Brauzer va Elektron Pochta', animSubtitle: 'Qidiruv, xat yuborish va formatlash bosqichlari' },

  // ================= 6-SINF (8 bo'lim, 1..34) =================
  { id: 'g6-u1', grade: 6, order: 1, term: '1-yarim yillik', start: 1, end: 5, domain: 'document_word', title: 'Matn formatlash va auditoriya uchun hujjat', shortDesc: 'Shrift turi, o‘lchami, rangi, tekislash, tasvir va hoshiya qo‘shish, auditoriyaga moslash.', animTitle: 'Auditoriyaga Mos Hujjat', animSubtitle: 'Shrift, hoshiya, rasm va tekislash' },
  { id: 'g6-u2', grade: 6, order: 2, term: '1-yarim yillik', start: 6, end: 9, domain: 'graphics', title: 'Tasvir importi va geometrik transformatsiya', shortDesc: 'Tasvir importi, boshlang‘ich nusxalar, aylantirish, teskari o‘girish va o‘lcham o‘zgartirish.', animTitle: 'Tasvir Transformatsiyasi', animSubtitle: 'Rotate, Flip va o‘lchamlarni mutanosib sozlash' },
  { id: 'g6-u3', grade: 6, order: 3, term: '1-yarim yillik', start: 10, end: 13, domain: 'spreadsheet', title: 'Elektron jadval, formulalar va grafiklar', shortDesc: 'Ma’lumot kiritish, katak manzili bilan sodda formulalar, nusxalash va grafik yaratish.', animTitle: 'Excel Katak Manzili va Formula', animSubtitle: '=A1+B1 formulasi, nusxalash va grafik' },
  { id: 'g6-u4', grade: 6, order: 4, term: '1-yarim yillik', start: 14, end: 16, domain: 'database', title: 'Ma’lumotlar bazasi, maydonlar va Query', shortDesc: 'Ma’lumot turlari, maydonlarni aniqlash, bazada harakatlanish va teng shartli Query.', animTitle: 'Ma’lumotlar Bazasi va Query', animSubtitle: 'Maydon turlari va aniq qidiruv sharti' },
  { id: 'g6-u5', grade: 6, order: 5, term: '2-yarim yillik', start: 17, end: 21, domain: 'algo_scratch', title: 'Takrorlash algoritmi va Scratch PEN uskunasi', shortDesc: 'Takrorlash blok-sxemasi, Scratch sikllari, PEN uskunasi va shakllar bilan ishlash.', animTitle: 'Scratch PEN va Takrorlash', animSubtitle: 'Loop bloklari yordamida geometrik shakllar' },
  { id: 'g6-u6', grade: 6, order: 6, term: '2-yarim yillik', start: 22, end: 26, domain: 'algo_scratch', title: 'Protseduralar va masalani dekompozitsiya qilish', shortDesc: 'Yangi shakl chizish, natijani taxmin qilish, protseduralar va dekompozitsiya usuli.', animTitle: 'Dekompozitsiya va Protseduralar', animSubtitle: 'Katta masalani kichik bloklarga ajratish' },
  { id: 'g6-u7', grade: 6, order: 7, term: '2-yarim yillik', start: 27, end: 29, domain: 'web_html', title: 'Web-manzillar, axborot ishonchliligi va xat yozish', shortDesc: 'URL manzillar, qidiruv tamoyili, axborotni filtrlash va elektron xat uskunalari.', animTitle: 'URL va Axborotni Filtrlash', animSubtitle: 'Web-sayt manzili va ishonchlilik tahlili' },
  { id: 'g6-u8', grade: 6, order: 8, term: '2-yarim yillik', start: 30, end: 34, domain: 'media_pres', title: 'Elektron pochta papkalari va taqdimot yaratish', shortDesc: 'Hujjat ilova qilish, pochta papkalarini boshqarish, maket va slaydga ovoz/tasvir qo‘shish.', animTitle: 'Taqdimot Maketi va Ovoz', animSubtitle: 'Slayd rejasi, matn, tasvir va audio' },

  // ================= 7-SINF (8 bo'lim, 1..34) =================
  { id: 'g7-u1', grade: 7, order: 1, term: '1-yarim yillik', start: 1, end: 5, domain: 'document_word', title: 'Matn stillari, jadval, ro‘yxat va kolontitullar', shortDesc: 'Stillarni sozlash, Wrap Text, jadval o‘rnatish, belgili ro‘yxat, Header va Footer.', animTitle: 'Stillar, Jadval va Kolontitul', animSubtitle: 'Wrap Text, ro‘yxatlar va Header/Footer' },
  { id: 'g7-u2', grade: 7, order: 2, term: '1-yarim yillik', start: 6, end: 9, domain: 'security', title: 'Sahifani formatlash va Internet xavfsizligi', shortDesc: 'Matnni ustunlarga bo‘lish, Print Preview, Internet xavfsizligi amaliyoti va Nazorat ishi.', animTitle: 'Sahifa Maketi va Kiber-Xavfsizlik', animSubtitle: 'Ustunlar, Print Preview va onlayn himoya' },
  { id: 'g7-u3', grade: 7, order: 3, term: '1-yarim yillik', start: 10, end: 14, domain: 'media_pres', title: 'Taqdimotga o‘tish, audio va animatsiya qo‘shish', shortDesc: 'Loyiha xususiyati, slaydga o‘tish effektlari, vaqt va audio, animatsiya va vaqtni moslash.', animTitle: 'Slayd O‘tishi va Animatsiya', animSubtitle: 'Transition, Audio va vaqtni sinxronlash' },
  { id: 'g7-u4', grade: 7, order: 4, term: '1-yarim yillik', start: 15, end: 16, domain: 'media_pres', title: 'Taqdimot nazorati va auditoriya maqsadi', shortDesc: '1-yarim yillik taqdimot bo‘yicha Nazorat ishi va auditoriya maqsadini aniqlash.', animTitle: 'Auditoriya va Maqsad Tahlili', animSubtitle: 'Taqdimot samaradorligini baholash' },
  { id: 'g7-u5', grade: 7, order: 5, term: '2-yarim yillik', start: 17, end: 21, domain: 'spreadsheet', title: 'Elektron jadval loyihalash, modellashtirish va shakl', shortDesc: 'Jadval dizayni, formulani sinash, modellashtirish, ma’lumot to‘plash shakli va formatlash.', animTitle: 'Excelda Modellashtirish', animSubtitle: 'Formulalar, shakl va dizayn bosqichlari' },
  { id: 'g7-u6', grade: 7, order: 6, term: '2-yarim yillik', start: 22, end: 26, domain: 'spreadsheet', title: 'Jadval tahlili: shartli formatlash va Goal Seek', shortDesc: 'Jadvalni baholash, diagramma natijalari, shartli formatlash va maqsadni qidirish.', animTitle: 'Shartli Formatlash va Goal Seek', animSubtitle: 'Natijalarni diagramma va mezon bilan tahlil qilish' },
  { id: 'g7-u7', grade: 7, order: 7, term: '2-yarim yillik', start: 27, end: 30, domain: 'database', title: 'Ma’lumotlar bazasi jadvallari, forma va xavfsizlik', shortDesc: 'Maqsad va maydon tanlash, ma’lumot turlari, Form, ochiladigan ro‘yxat va xavfsizlik.', animTitle: 'MB Jadval va Kiritish Formasi', animSubtitle: 'Maydon turlari, Form va ma’lumot himoyasi' },
  { id: 'g7-u8', grade: 7, order: 8, term: '2-yarim yillik', start: 31, end: 34, domain: 'database', title: 'Ma’lumotlarni eksport qilish va yakuniy nazorat', shortDesc: 'Ma’lumotlarni matn va jadval dasturlariga yuborish, Nazorat ishi va yakuniy takrorlash.', animTitle: 'MB Ma’lumotlarini Eksport Qilish', animSubtitle: 'Word va Excelga integratsiya' },

  // ================= 8-SINF (8 bo'lim, 1..34) =================
  { id: 'g8-u1', grade: 8, order: 1, term: 'I CHORAK', start: 1, end: 5, domain: 'algo_scratch', title: 'Dasturlash asoslari, o‘zgaruvchilar va to‘qnashuvlar', shortDesc: 'O‘yin yaratish mantiqi, o‘zgaruvchilar, ochko o‘yini va shartli to‘qnashuv ssenariysi.', animTitle: 'O‘zgaruvchilar va To‘qnashuv Mantiqi', animSubtitle: 'Sprayt harakati, ochko va shartli bloklar' },
  { id: 'g8-u2', grade: 8, order: 2, term: 'I CHORAK', start: 6, end: 9, domain: 'algo_scratch', title: 'Ma’lumotlar validatsiyasi, kostyum va debaglash', shortDesc: 'Yosh/bo‘y validatsiyasi, kostyumlar va vaqt, dasturni sinash, debaglash va Nazorat ishi.', animTitle: 'Validatsiya va Debaglash', animSubtitle: 'Xatolarni topish va kostyumlarni almashtirish' },
  { id: 'g8-u3', grade: 8, order: 3, term: 'I CHORAK', start: 10, end: 13, domain: 'web_html', title: 'HTML asoslari, matn, havola va tasvirlar', shortDesc: 'HTML tuzilma, veb-sahifada matn, giperhavola (Link) va tasvirlarni joylashtirish.', animTitle: 'HTML Teglar va Havolalar', animSubtitle: '<h1>, <p>, <a> va <img> teglari' },
  { id: 'g8-u4', grade: 8, order: 4, term: 'I CHORAK', start: 14, end: 16, domain: 'web_html', title: 'Veb-sahifa dizayni, ranglar va hosting', shortDesc: 'Veb-sahifa dizayni va ranglarni boshqarish, Nazorat ishi hamda saytni internetga joylash.', animTitle: 'CSS Ranglar va Veb-Hosting', animSubtitle: 'Dizayn uslubi va saytni nashr etish' },
  { id: 'g8-u5', grade: 8, order: 5, term: '2-yarim yillik (PDF: 3 CHORAK)', start: 17, end: 20, domain: 'network', title: 'Kompyuter tarmoqlari va apparat komponentlari', shortDesc: 'Tarmoq tushunchalari, Kabel, Hub, Switch, Router, modem amaliyoti va tarmoqni loyihalash.', animTitle: 'Hub, Switch va Router Tarmog‘i', animSubtitle: 'Kabel ulanishlari va tarmoq topologiyasi' },
  { id: 'g8-u6', grade: 8, order: 6, term: '2-yarim yillik (PDF: 3 CHORAK)', start: 21, end: 24, domain: 'network', title: 'Tarmoq boshqaruvi, xavfsizlik va maktab loyihasi', shortDesc: 'Tarmoq boshqaruvi vazifalari, tarmoq xavfsizligi va maktab kompyuter tarmog‘i loyihasi.', animTitle: 'Maktab Tarmog‘i Loyihasi', animSubtitle: 'Xavfsizlik siyosati va tarmoq boshqaruvi' },
  { id: 'g8-u7', grade: 8, order: 7, term: '2-yarim yillik (PDF: 3 CHORAK)', start: 25, end: 28, domain: 'media_pres', title: 'Pencil2D animatsiyasi va Adobe Spark video', shortDesc: 'Video va animatsiya asoslari, Pencil2D dasturida kadrli animatsiya va Adobe Spark video.', animTitle: 'Pencil2D Kadrli Animatsiya', animSubtitle: 'Kadrlar ketma-ketligi va video yaratish' },
  { id: 'g8-u8', grade: 8, order: 8, term: '2-yarim yillik (PDF: 3 CHORAK)', start: 29, end: 34, domain: 'media_pres', title: 'Ovozli sharh, Audacity montaji va reklama', shortDesc: 'Saundtrek va Narration qo‘shish, auditoriya talabi, mahsulot reklamasi va Audacity audio.', animTitle: 'Audacity Audio va Narration', animSubtitle: 'Ovoz yozish, tahrirlash va video bilan biriktirish' },

  // ================= 9-SINF (8 bo'lim, 1..68) =================
  { id: 'g9-u1', grade: 9, order: 1, term: '1 CHORAK', start: 1, end: 10, domain: 'hardware_os', title: 'Kompyuter arxitekturasi, OS va xotira masalalari', shortDesc: 'Komponentlar, OS, kompyuter turlari, kiritish/chiqarish, xotira qurilmalari va hajm masalalari.', animTitle: 'Apparat Ta’minot va Xotira', animSubtitle: 'CPU, RAM/ROM va hajm birliklari hisobi' },
  { id: 'g9-u2', grade: 9, order: 2, term: '1 CHORAK', start: 11, end: 18, domain: 'network', title: 'Tarmoq qurilmalari va AT ning jamiyatga ta’siri', shortDesc: 'Tarmoq qurilmalari, brauzer, kommunikatsiya, bandlik, mikroprotsessorli uy va sog‘liqqa ta’sir.', animTitle: 'Tarmoq va Raqamli Jamiyat', animSubtitle: 'Kommunikatsiya tizimlari va AT ta’siri' },
  { id: 'g9-u3', grade: 9, order: 3, term: '2 CHORAK', start: 19, end: 25, domain: 'sdlc_project', title: 'Amaliy dasturlar va tizim hayotiy sikli (SDLC)', shortDesc: 'O‘lchov/boshqaruv/modellashtirish dasturlari, Tahlil, Loyihalash, Sinash va Texnik xizmat.', animTitle: 'SDLC — Tizim Hayotiy Sikli', animSubtitle: 'Tahlil, dizayn, joriy etish va baholash' },
  { id: 'g9-u4', grade: 9, order: 4, term: '2 CHORAK', start: 26, end: 32, domain: 'security', title: 'Elektron xavfsizlik, mualliflik huquqi va axborot', shortDesc: 'Antivirus, fayervol, himoya protokoli, mualliflik huquqi, spam va ishonchli axborot.', animTitle: 'Elektron Xavfsizlik va Huquq', animSubtitle: 'Fayervol, mualliflik huquqi va anti-spam' },
  { id: 'g9-u5', grade: 9, order: 5, term: '3 CHORAK', start: 33, end: 42, domain: 'graphics', title: 'Fayllarni siqish, tasvirlar va sahifa maketi', shortDesc: 'Fayl kengaytmasi, hajmni kamaytirish, tasvir tahriri, maket, obyektlar va Header/Footer.', animTitle: 'Fayl Hajmi va Sahifa Maketi', animSubtitle: 'Arxivlash, tasvir o‘lchami va sahifa tuzilmasi' },
  { id: 'g9-u6', grade: 9, order: 6, term: '3 CHORAK', start: 43, end: 52, domain: 'document_word', title: 'Korporativ brend, validatsiya va diagrammalar', shortDesc: 'Brend stili, slayd izchilligi, xato tekshirish, verifikatsiya/validatsiya va diagrammalar.', animTitle: 'Verifikatsiya va Validatsiya', animSubtitle: 'Brend izchilligi va xatolarni tekshirish' },
  { id: 'g9-u7', grade: 9, order: 7, term: '4 CHORAK', start: 53, end: 59, domain: 'database', title: 'Jadvallar, Mail Merge, Ma’lumotlar bazasi va Taqdimot', shortDesc: 'Maket formatlash, pochta birlashtirish (Mail Merge), DB tuzilmasi va taqdimotga import.', animTitle: 'Mail Merge va MB Tuzilmasi', animSubtitle: 'Hujjat, baza va slayd integratsiyasi' },
  { id: 'g9-u8', grade: 9, order: 8, term: '4 CHORAK', start: 60, end: 68, domain: 'web_html', title: 'Ma’lumot modeli ($A$1) va Veb uch qatlami', shortDesc: 'Nisbiy/absolyut murojaat, modellar, HTML/CSS/JS uch qatlam, linklar va ankor.', animTitle: 'Absolyut Murojaat va Veb Uch Qatlam', animSubtitle: '$A$1 modeli va HTML/CSS publikatsiyasi' },

  // ================= 10-SINF (8 bo'lim, 1..68) =================
  { id: 'g10-u1', grade: 10, order: 1, term: '1 CHORAK', start: 1, end: 11, domain: 'security', title: 'Axborot sifati, shifrlash va apparat/dastur tizimlari', shortDesc: 'Ma’lumot manbasi, simmetrik/asimmetrik shifrlash, vizual tekshirish, drayver va UI dizayn.', animTitle: 'Shifrlash va Tizimli Dasturlar', animSubtitle: 'Kodlash, asimmetrik kalitlar va drayverlar' },
  { id: 'g10-u2', grade: 10, order: 2, term: '1 CHORAK', start: 12, end: 18, domain: 'security', title: 'Sensorlar, kiber-tahdidlar va raqamli tengsizlik', shortDesc: 'Harakat/bosim/harorat sensorlari, Phishing/Ransomware/Troyan va raqamli tengsizlik.', animTitle: 'Sensorlar va Kiber-Tahdidlar', animSubtitle: 'Phishing/Ransomware himoyasi va sensorlar' },
  { id: 'g10-u3', grade: 10, order: 3, term: '2 CHORAK', start: 19, end: 25, domain: 'network', title: 'LAN, WAN, VPN va zamonaviy tarmoq muloqoti', shortDesc: 'LAN/WAN, Client-Server/P2P, VPN, Intranet/Ekstranet, mobil tarmoqlar va videokonferensiya.', animTitle: 'LAN, WAN, VPN Arxitekturasi', animSubtitle: 'Client-Server, P2P va shifrlangan tunnel' },
  { id: 'g10-u4', grade: 10, order: 4, term: '2 CHORAK', start: 26, end: 32, domain: 'ai_systems', title: 'Ekspert tizimlar va Real-vaqt qayta ishlash', shortDesc: 'Bilimlar bazasi, yakunlovchi mexanizm, UI, ma’lumotlarni qayta ishlash va real vaqt tizimlari.', animTitle: 'Ekspert Tizim Arxitekturasi', animSubtitle: 'Bilimlar bazasi va real vaqt qarorlari' },
  { id: 'g10-u5', grade: 10, order: 5, term: '3 CHORAK', start: 33, end: 43, domain: 'spreadsheet', title: 'Excel: Shartli formatlash va INDEX/MATCH funksiyalari', shortDesc: 'Jadval xavfsizligi, nomlangan diapazon, yaxlitlash, shartli va INDEX/MATCH funksiyalari.', animTitle: 'INDEX, MATCH va Statistik Funksiyalar', animSubtitle: 'Qidiruv va shartli hisoblash algoritmlari' },
  { id: 'g10-u6', grade: 10, order: 6, term: '3 CHORAK', start: 44, end: 52, domain: 'spreadsheet', title: 'Validatsiya qoidalari, Pivot jadvallar va simulyatorlar', shortDesc: 'Validatsiya qoidalari, filtrlash/saralash, jamlovchi jadvallar, import/eksport va simulyatsiya.', animTitle: 'Pivot Jadval va Simulyatorlar', animSubtitle: 'Validatsiya, filtr va jamlanma tahlil' },
  { id: 'g10-u7', grade: 10, order: 7, term: '4 CHORAK', start: 53, end: 61, domain: 'database', title: 'Relyatsion ma’lumotlar bazasi, kalitlar va Query', shortDesc: '1:1, 1:N, M:N bog‘lanishlar, murakkab va tashqi kalitlar, yaxlitlik va murakkab querylar.', animTitle: 'Relyatsion DB Bog‘lanishlari', animSubtitle: 'Primary/Foreign Key va murakkab SQL query' },
  { id: 'g10-u8', grade: 10, order: 8, term: '4 CHORAK', start: 62, end: 68, domain: 'database', title: 'Formalar, hisobotlar va 3NF normallashtirish', shortDesc: 'Saralash, kiritish formalari, hisobotlar, 3NF normallashtirish, ma’lumotlar lug‘ati va MIS.', animTitle: '3NF Normallashtirish va Hisobot', animSubtitle: 'Jadvallarni 3-normal shaklga keltirish' },

  // ================= 11-SINF (8 bo'lim, 1..68) =================
  { id: 'g11-u1', grade: 11, order: 1, term: '1 CHORAK', start: 1, end: 11, domain: 'media_pres', title: 'Professional video va audio montaj texnologiyalari', shortDesc: 'Mutanosiblik, video montaj, subtitr, tezlik, ovoz sozlamalari, reverberatsiya va eksport.', animTitle: 'Video va Audio Montaj Studiyasi', animSubtitle: 'Timeline, subtitr, reverberatsiya va MP4/MP3' },
  { id: 'g11-u2', grade: 11, order: 2, term: '1 CHORAK', start: 12, end: 18, domain: 'ai_systems', title: 'Kelajak texnologiyalari: AI, AR/VR, 5G va Biometrika', shortDesc: '3D printer, 4G/5G, Sun’iy intellekt, AR/VR, biometrika, bulut, golografiya va QR kodlar.', animTitle: 'AI, AR/VR, 5G va Biometrika', animSubtitle: 'Zamonaviy raqamli texnologiyalar ekotizimi' },
  { id: 'g11-u3', grade: 11, order: 3, term: '2 CHORAK', start: 19, end: 25, domain: 'network', title: 'Elektron tijorat, Data Mining va raqamli jamiyat', shortDesc: 'Elektron tijorat, internet banking, zaxira boshqaruvi, Data Mining va masofaviy ish.', animTitle: 'E-Tijorat va Ma’lumotlar Tahlili', animSubtitle: 'Internet banking va intellektual tahlil' },
  { id: 'g11-u4', grade: 11, order: 4, term: '2 CHORAK', start: 26, end: 32, domain: 'network', title: 'Shlyuz, Bridj, kommutatsiya va optik aloqa', shortDesc: 'Access Point, Shlyuz, Bridj, Fayervol, kanalli/paketli kommutatsiya va optik aloqa.', animTitle: 'Shlyuz, Bridj va Paketli Aloqa', animSubtitle: 'Tarmoq kommutatsiyasi va optik tolali kanal' },
  { id: 'g11-u5', grade: 11, order: 5, term: '3 CHORAK', start: 33, end: 44, domain: 'sdlc_project', title: 'Tarmoq xavfsizligi va Loyiha boshqaruvi (Gantt)', shortDesc: 'Polosa kengligi, BitTorrent, himoya qonuni, sun’iy yo‘ldosh, Gantt diagrammasi va prototiplash.', animTitle: 'Gantt Diagrammasi va Kritik Yo‘l', animSubtitle: 'Loyiha bosqichlari, prototip va CAD/CAM' },
  { id: 'g11-u6', grade: 11, order: 6, term: '3 CHORAK', start: 45, end: 52, domain: 'sdlc_project', title: 'Tizim tahlili, DFD va Sinov strategiyalari', shortDesc: 'Hujjat tahlili, DFD, blok-sxema, Qora/Oq quti sinovi, Alfa/Beta sinov va installyatsiya.', animTitle: 'DFD va Black/White Box Sinovi', animSubtitle: 'Tizim dizayni va sifat nazorati' },
  { id: 'g11-u7', grade: 11, order: 7, term: '4 CHORAK', start: 53, end: 59, domain: 'graphics', title: 'Vektor/Rastr grafika, Niqoblash va Mail Merge', shortDesc: 'Vektor va rastr, transformatsiya, qizil ko‘zni olish, niqoblovchi qatlam va Mail Merge.', animTitle: 'Niqoblovchi Qatlam va Vektor/Rastr', animSubtitle: 'Masking, transformatsiya va Master hujjat' },
  { id: 'g11-u8', grade: 11, order: 8, term: '4 CHORAK', start: 60, end: 68, domain: 'js_prog', title: 'JavaScript: O‘zgaruvchi, Array, Loop va Funksiyalar', shortDesc: 'HTML chiqarish, o‘zgaruvchilar, operatorlar, string, Array, Luplar, funksiyalar va DOM hodisalar.', animTitle: 'JavaScript Dasturlash Sikllari', animSubtitle: 'Array, for/while Loop, Funksiya va DOM' },
];

const GAME_TOPIC_REMAP = {
  1: 'g5-u1', 2: 'g5-u3', 3: 'g5-u5', 4: 'g5-u7', 5: 'g5-u4', 6: 'g5-u8',
  7: 'g6-u1', 8: 'g6-u2', 9: 'g6-u3', 10: 'g6-u5', 11: 'g6-u4', 12: 'g6-u7',
  13: 'g7-u1', 14: 'g7-u3', 15: 'g7-u5', 16: 'g7-u7', 17: 'g7-u2',
  18: 'g8-u1', 19: 'g8-u3', 20: 'g8-u4', 21: 'g8-u5', 22: 'g8-u7',
  23: 'g9-u1', 24: 'g9-u1', 25: 'g9-u4', 26: 'g9-u5', 27: 'g9-u8', 28: 'g9-u8',
  29: 'g10-u1', 30: 'g10-u2', 31: 'g10-u4', 32: 'g10-u3', 33: 'g10-u5', 34: 'g10-u7',
  35: 'g11-u1', 36: 'g11-u2', 37: 'g11-u4', 38: 'g11-u5', 39: 'g11-u7', 40: 'g11-u8',
};

const EXTRA_GAMES_41_58 = [
  { id: 41, grade: 5, topicId: 'g5-u2', title: 'Imlo Tekshiruvi va Saqlash (Save/Print)', idea: '5-sinf 6–9-darslar: To‘g‘ri nomlangan fayllar va chop etish qoidalarini saralang.', engine: 'CLASSIFY_SORT', durationSec: 75, sort: { categories: ['To‘g‘ri saqlash / Chop etish', 'Xato odat / Noto‘g‘ri usul'], items: [{ label: 'Ctrl+S bosib "Matematika_dars5.docx" nom berish', categoryIndex: 0 }, { label: 'Hujjatni saqlamasdan kompyuterni o‘chirish', categoryIndex: 1 }, { label: 'Chop etishdan oldin imloni tekshirish (Print Preview)', categoryIndex: 0 }, { label: 'Faylga "dfg123_nomalum" deb tushunarsiz nom qo‘yish', categoryIndex: 1 }, { label: 'Saqlash uchun alohida "5-sinf ishlar" papkasini tanlash', categoryIndex: 0 }] } },
  { id: 42, grade: 5, topicId: 'g5-u6', title: 'Ustunli Diagramma Tahlilchisi', idea: '5-sinf 21–23-darslar: Berilgan xulosa bo‘yicha diagramma ustunlarini sozlang.', engine: 'CHART_GANTT', durationSec: 90, chart: { title: 'Kutubxonadan olingan kitoblar (choraklar bo‘yicha)', labels: ['1-chorak', '2-chorak', '3-chorak', '4-chorak'], targets: [4, 7, 9, 6], unit: 'dona' } },
  { id: 43, grade: 6, topicId: 'g6-u6', title: 'Dekompozitsiya va Protsedura Ustasi', idea: '6-sinf 22–26-darslar: Katta masalani kichik protseduralarga ajratish blitsi.', engine: 'QUIZ_BLITZ', durationSec: 70, blitz: [{ prompt: 'Katta murakkab masalani kichik bo‘laklarga bo‘lib yechish usuli nima deyiladi?', choices: ['Dekompozitsiya', 'Arxivlash', 'Formatlash', 'Eksport'], answer: 0, tip: '25-dars: Dekompozitsiya — katta masalani kichik qismlarga ajratish.' }, { prompt: 'Scratch dasturida qayta ishlatiladigan maxsus blok qanday ataladi?', choices: ['Protsedura (My Blocks)', 'Piksel', 'Hoshiya', 'Kolontitul'], answer: 0, tip: '24-dars: Protseduralar kodingizni ixcham va tushunarli qiladi.' }, { prompt: 'Repeat 4 [Move 50; Turn 90°] buyrug‘i qanday shakl chizadi?', choices: ['Kvadrat', 'Uchburchak', 'Doira', 'Oltiburchak'], answer: 0, tip: '4 ta 90° burilish kvadrat hosil qiladi.' }, { prompt: 'Dasturni ishga tushirishdan oldin natijani taxmin qilish nimaga yordam beradi?', choices: ['Mantiqiy xatoni erta topishga', 'Monitorni o‘chirishga', 'Fayl hajmini oshirishga', 'Shriftni kattalashtirishga'], answer: 0, tip: '23-dars: Takrorlash blokidan foydalanib natijani taxmin qilish.' }] },
  { id: 44, grade: 6, topicId: 'g6-u8', title: 'Pochta Papkalari va Slayd Maketi', idea: '6-sinf 30–34-darslar: Elektron pochta va taqdimot uskunalarini juftlang.', engine: 'MEMORY_PAIR', durationSec: 90, memory: [{ left: 'Attachment (Ilova)', right: 'Elektron xatga fayl biriktirish' }, { left: 'Inbox / Papkalar', right: 'Kelgan xatlarni mavzuga ko‘ra saralash' }, { left: 'Slayd Maketi (Layout)', right: 'Matn va tasvir joylashuv shabloni' }, { left: 'Ovoz qo‘shish', right: 'Taqdimot slaydiga audio izoh biriktirish' }] },
  { id: 45, grade: 7, topicId: 'g7-u4', title: 'Auditoriya va Taqdimot Maqsadi', idea: '7-sinf 15–16-darslar: Turli auditoriyalar uchun taqdimot uslubini moslang.', engine: 'CLASSIFY_SORT', durationSec: 75, sort: { categories: ['Boshlang‘ich sinf auditoriyasi', 'Ilmiy/Rasmiy auditoriya'], items: [{ label: 'Katta rasmlar, qisqa so‘zlar va quvnoq animatsiyalar', categoryIndex: 0 }, { label: 'Aniq statistik jadvallar, diagramma va manba havolalari', categoryIndex: 1 }, { label: 'Ertak qahramonli interaktiv viktorina slaydi', categoryIndex: 0 }, { label: 'Yillik hisobot xulosasi va metodik ko‘rsatkichlar', categoryIndex: 1 }] } },
  { id: 46, grade: 7, topicId: 'g7-u6', title: 'Shartli Formatlash va Goal Seek', idea: '7-sinf 22–26-darslar: Maqsadni qidirish va shartli formulalarni tuzing.', engine: 'FORMULA_BUILDER', durationSec: 90, formula: [{ tableHint: 'B2 katakda o‘quvchi bali = 75', prompt: 'Agar B2 >= 70 bo‘lsa "Otdi", aks holda "Qayta" chiqaruvchi IF formulasini yozing:', accepted: ['=IF(B2>=70,"Otdi","Qayta")', '=IF(B2>=70, "Otdi", "Qayta")'], sample: '=IF(B2>=70,"Otdi","Qayta")' }, { tableHint: 'D2:D8 xarajatlar ro‘yxati', prompt: 'O‘rtacha xarajatni topuvchi formula:', accepted: ['=AVERAGE(D2:D8)'], sample: '=AVERAGE(D2:D8)' }] },
  { id: 47, grade: 7, topicId: 'g7-u8', title: 'MB Ma’lumotlarini Eksport Qilish', idea: '7-sinf 31–34-darslar: Jadvaldan matn va Excel dasturlariga yuboriladigan qatorlarni tanlang.', engine: 'DB_QUERY', durationSec: 90, db: [{ tableName: 'Eksport_Royxati', columns: ['ID', 'Nomi', 'Format', 'Tayyor'], rows: [['1', 'Sinf_hisoboti', 'DOCX', 'Ha'], ['2', 'Qoralama_fayl', 'TMP', 'Yoq'], ['3', 'Chorak_jadvali', 'XLSX', 'Ha'], ['4', 'Test_nusxa', 'BAK', 'Yoq']], prompt: 'Matn yoki Excelga eksport qilishga Tayyor = "Ha" bo‘lgan qatorlarni belgilang.', matchRowIndices: [0, 2] }] },
  { id: 48, grade: 8, topicId: 'g8-u2', title: 'Validatsiya va Debaglash Simulyatori', idea: '8-sinf 6–9-darslar: Yosh/bo‘y validatsiyasi va dasturdagi xatoni (bug) topish blitsi.', engine: 'QUIZ_BLITZ', durationSec: 70, blitz: [{ prompt: 'Foydalanuvchi yosh sifatida -5 kiritsa, buni rad etuvchi jarayon nima?', choices: ['Ma’lumotlar validatsiyasi', 'Grafik eksport', 'Audio montaj', 'Kolontitul'], answer: 0, tip: '6-dars: Yosh va bo‘y ma’lumotlarini mantiqiy chegarada tekshirish.' }, { prompt: 'Dasturdagi xatolarni bosqichma-bosqich izlab tuzatish nima deyiladi?', choices: ['Debaglash (Debugging)', 'Arxivlash', 'Formatlash', 'Klonlash'], answer: 0, tip: '8-dars: Dasturni sinovdan o‘tkazish va debaglash.' }, { prompt: 'Sprayt yurayotganda qadam tashlayotgandek ko‘rinishi uchun nima almashtiriladi?', choices: ['Sprayt kostyumlari', 'Fayl kengaytmasi', 'IP manzil', 'Shrift rangi'], answer: 0, tip: '7-dars: Sprayt kostyumlari va vaqt bilan ishlash.' }, { prompt: '8-sinf yosh chegarasi tekshiruvida to‘g‘ri shart qaysi?', choices: ['yosh >= 7 va yosh <= 18', 'yosh < 0', 'yosh = "abc"', 'yosh > 500'], answer: 0, tip: 'Maktab o‘quvchisi yoshi mantiqiy diapazonida bo‘lishi kerak.' }] },
  { id: 49, grade: 8, topicId: 'g8-u6', title: 'Maktab Tarmog‘i Xavfsizlik Siyosati', idea: '8-sinf 21–24-darslar: Tarmoq boshqaruvi va xavfsizlik qoidalarini juftlang.', engine: 'MEMORY_PAIR', durationSec: 90, memory: [{ left: 'Firewall', right: 'Ruxsatsiz tarmoq trafigini to‘sadi' }, { left: 'Switch', right: 'Kompyuterlarni LAN ichida bog‘laydi' }, { left: 'Router', right: 'Lokal tarmoqni Internetga chiqaradi' }, { left: 'Parol siyosati', right: 'Har bir foydalanuvchi uchun alohida kirish huquqi' }, { left: 'Zaxira nusxa', right: 'Maktab serveri ma’lumotlarini tiklash kafolati' }] },
  { id: 50, grade: 8, topicId: 'g8-u8', title: 'Audacity Audio va Reklama Studiyasi', idea: '8-sinf 29–34-darslar: Ovozli sharh (Narration) va auditoriya talabini saralang.', engine: 'CLASSIFY_SORT', durationSec: 75, sort: { categories: ['Audio montaj (Audacity)', 'Auditoriya va Reklama'], items: [{ label: 'Fon shovqinini (Noise Reduction) tozalash', categoryIndex: 0 }, { label: 'Mahsulot afzalligini 15 soniyada aniq yetkazish', categoryIndex: 1 }, { label: 'Narration (ovozli sharh) trekini video ostiga qo‘yish', categoryIndex: 0 }, { label: 'Maqsadli auditoriya yoshi va qiziqishini tahlil qilish', categoryIndex: 1 }] } },
  { id: 51, grade: 9, topicId: 'g9-u2', title: 'AT Ta’siri va Tarmoq Kommunikatsiyasi', idea: '9-sinf 11–18-darslar: Tarmoq muammolari, mikroprotsessorli uy va salomatlik blitsi.', engine: 'QUIZ_BLITZ', durationSec: 75, blitz: [{ prompt: 'Uzoq vaqt kompyuterda noto‘g‘ri o‘tirish qaysi muammoga olib keladi?', choices: ['Ko‘z zo‘riqishi va umurtqa og‘rig‘i', 'RAM hajmi oshishiga', 'Tarmoq tezlashishiga', 'Fayl shifrlanishiga'], answer: 0, tip: '18-dars: Ergonomika va tanaffus qoidalariga amal qilish zarur.' }, { prompt: 'Mikroprotsessorli aqlli uy qurilmasiga qaysi misol bo‘la oladi?', choices: ['Avtomatik haroratli konditsioner', 'Oddiy yog‘och qalam', 'Mexanik qulf', 'Qog‘oz daftar'], answer: 0, tip: '16-dars: Mikroprotsessorli uy qurilmalari.' }, { prompt: 'Tarmoqda ma’lumot paketlari kechikishi nimadan kelib chiqadi?', choices: ['Kanal yuklanishi yoki kabel nosozligidan', 'Shrift turidan', 'Header balandligidan', 'Monitor rangidan'], answer: 0, tip: '14-dars: Tarmoq muammolari va kommunikatsiya.' }, { prompt: 'AT rivojlanishi bandlik bozoriga qanday ta’sir qiladi?', choices: ['Yangi IT kasblarni yaratadi va avtomatlashtiradi', 'Barcha maktablarni yopadi', 'Elektr energiyasini bekor qiladi', 'Hech narsani o‘zgartirmaydi'], answer: 0, tip: '15-dars: Axborot texnologiyasining bandlikka ta’siri.' }] },
  { id: 52, grade: 9, topicId: 'g9-u3', title: 'SDLC — Tizim Hayotiy Sikli Bosqichlari', idea: '9-sinf 19–25-darslar: Tahlil, Loyihalash, Sinash va Joriy etish ketma-ketligini juftlang.', engine: 'MEMORY_PAIR', durationSec: 90, memory: [{ left: '1. Tahlil (Analysis)', right: 'Muammo va foydalanuvchi talablarini o‘rganish' }, { left: '2. Loyihalash (Design)', right: 'Ekran formasi, ma’lumotlar modeli va sxema chizish' }, { left: '3. Sinash (Testing)', right: 'Dasturdagi xato va chegaraviy holatlarni tekshirish' }, { left: '4. Hujjatlashtirish', right: 'Foydalanuvchi va texnik qo‘llanmalarni yozish' }, { left: '5. Texnik xizmat', right: 'Tizimni yangilab borish va qo‘llab-quvvatlash' }] },
  { id: 53, grade: 9, topicId: 'g9-u6', title: 'Korporativ Brend va Piksel Belgisi', idea: '9-sinf 43–52-darslar: Korporativ brend izchilligi uchun 5x5 geometrik logotipni tiklang.', engine: 'PIXEL_GRID', durationSec: 90, pixel: { size: 5, modeLabel: 'Brend uslubidagi simmetrik N/romb logotipi', target: [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0] } },
  { id: 54, grade: 9, topicId: 'g9-u7', title: 'Mail Merge Manba Filtratori', idea: '9-sinf 53–59-darslar: Pochta orqali shaxsiy taklifnoma yuboriladigan qatorlarni tanlang.', engine: 'DB_QUERY', durationSec: 90, db: [{ tableName: 'Taklifnoma_Manbasi', columns: ['ID', 'Ism', 'Sinf', 'Email_Bor'], rows: [['01', 'Dilshod', '9-A', 'Ha'], ['02', 'Kamola', '8-B', 'Ha'], ['03', 'Sardor', '9-B', 'Yoq'], ['04', 'Nigina', '9-A', 'Ha']], prompt: 'Mail Merge uchun Sinfi 9-sinf ("9-A" yoki "9-B") VA Email_Bor = "Ha" qatorlarni tanlang.', matchRowIndices: [0, 3] }] },
  { id: 55, grade: 10, topicId: 'g10-u6', title: 'Pivot Jadval va Simulyator Sozlamasi', idea: '10-sinf 44–52-darslar: Hududlar bo‘yicha jamlanma ko‘rsatkich ustunlarini tiklang.', engine: 'CHART_GANTT', durationSec: 90, chart: { title: 'Pivot jadval jamlanma natijasi (mln so‘m)', labels: ['Toshkent', 'Samarqand', 'Farg‘ona', 'Buxoro'], targets: [9, 6, 8, 5], unit: 'mln' } },
  { id: 56, grade: 10, topicId: 'g10-u8', title: '3NF Normallashtirish va MIS Tizimi', idea: '10-sinf 62–68-darslar: Ma’lumotlar bazasini 1NF, 2NF, 3NF ga keltirish blitsi.', engine: 'QUIZ_BLITZ', durationSec: 75, blitz: [{ prompt: 'Har bir katakda faqat bitta atomar qiymat bo‘lishi qaysi normal shakl talabi?', choices: ['1NF (Birinchi normal shakl)', '3NF', 'HTML', 'VPN'], answer: 0, tip: '64-dars: 1NF takrorlanuvchi guruhlarni yo‘qotadi.' }, { prompt: 'Kalit bo‘lmagan maydonlar orasidagi tranzitiv bog‘liqlikni ajratish qaysi shakl?', choices: ['3NF (Uchinchi normal shakl)', '0NF', 'CSS', 'BitTorrent'], answer: 0, tip: '64-dars: Ma’lumotlar bazasini 3NFga normallashtirish.' }, { prompt: 'Barcha maydon nomlari, turlari va hajmi yozilgan hujjat nima deyiladi?', choices: ['Ma’lumotlar lug‘ati (Data Dictionary)', 'Spam papka', 'Grafik maket', 'Subtitr'], answer: 0, tip: '65-dars: Ma’lumotlar lug‘ati va turlari.' }, { prompt: 'Rahbarlarga qaror qabul qilish uchun hisobot tayyorlaydigan tizim?', choices: ['Boshqaruv axborot tizimi (MIS)', 'Grafik muharrir', 'Audio pleyer', 'Klaviatura drayveri'], answer: 0, tip: '66-dars: Boshqaruv axborot tizimlari.' }] },
  { id: 57, grade: 11, topicId: 'g11-u3', title: 'E-Tijorat, Banking va Data Mining', idea: '11-sinf 19–25-darslar: Zamonaviy elektron tijorat va intellektual tahlil shifrlarini yeching.', engine: 'CIPHER_NET', durationSec: 90, cipher: [{ prompt: 'Katta hajmdagi ma’lumotlardan yashirin qonuniyatlarni aniqlash jarayoni qaysi?', detail: '11-sinf 21-dars mavzusi.', answer: 'Data Mining', options: ['Data Mining', 'Mail Merge', 'Paint Brush', 'Page Border'], hint: 'Ma’lumotlarni intellektual tahlillash — Data Mining.' }, { prompt: 'Omborda tovar kamayganda avtomatik buyurtma beruvchi tizim nima?', detail: '20-dars: Zaxiralarni avtomatik boshqarish.', answer: 'Avtomatik zaxira boshqaruvi', options: ['Avtomatik zaxira boshqaruvi', 'Oddiy daftar', 'Qo‘lda sanash', 'Audio eksport'], hint: 'Shtrix-kod/QR skaner orqali avtomatik yangilanish.' }, { prompt: 'Masofadan turib internet orqali ishlash modeli qaysi?', detail: '23-dars mavzusi.', answer: 'Masofadan ishlash (Remote)', options: ['Masofadan ishlash (Remote)', 'Kanalli kabel', 'Offline arxiv', 'Lokal chop etish'], hint: 'Videokonferensiya va bulutli xizmatlar asosida ishlaydi.' }] },
  { id: 58, grade: 11, topicId: 'g11-u6', title: 'Qora/Oq Quti va Alfa/Beta Sinovlari', idea: '11-sinf 45–52-darslar: Tizim dizayni va dasturiy ta’minot sinov turlarini juftlang.', engine: 'MEMORY_PAIR', durationSec: 90, memory: [{ left: 'DFD (Data Flow Diagram)', right: 'Tizimdagi ma’lumotlar oqimini tasvirlaydi' }, { left: 'Qora quti (Black-box)', right: 'Ichki kodni ko‘rmasdan kiritish/chiqarishni sinash' }, { left: 'Oq quti (White-box)', right: 'Dastur kodi va barcha mantiqiy yo‘llarni sinash' }, { left: 'Alfa sinov', right: 'Ishlab chiqaruvchi jamoa ichidagi dastlabki sinov' }, { left: 'Beta sinov', right: 'Haqiqiy foydalanuvchilar bilan ochiq yakuniy sinov' }] },
  {
    id: 59,
    grade: 7,
    topicId: 'g7-u1',
    title: 'Arqon Tortish: 2 Kishilik PvP Bellashuv',
    idea: '2 kishilik duel: Har bir to‘g‘ri javob arqonni o‘z jamoangiz tomoniga tortadi! Klaviatura (A/S/D/F vs 1/2/3/4) yoki sensor bilan o‘ynang.',
    engine: 'TUG_OF_WAR',
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

function build56Topics(seedData) {
  return EXPANDED_TOPIC_BLUEPRINTS.map((bp) => {
    const dMeta = DOMAIN_META[bp.domain] || DOMAIN_META.document_word;
    const rows = (OFFICIAL_CURRICULUM[bp.grade] || []).filter((r) => r.n >= bp.start && r.n <= bp.end);
    const gradeGameIds = seedData.games.filter((g) => g.grade === bp.grade).map((g) => g.id);
    const directGameIds = seedData.games.filter((g) => g.topicId === bp.id).map((g) => g.id);
    const gameIds = [...new Set([...directGameIds, ...gradeGameIds])].slice(0, 5);

    const lessonTitlesSample = rows.slice(0, 4).map((r) => `“${r.title}”`).join(', ');
    const detailedExplanation = [
      `${bp.grade}-sinf “${bp.title}” bo‘limi (${bp.start}–${bp.end}-darslar, ${bp.term}) davomida o‘quvchilar ${bp.shortDesc.toLowerCase()}`,
      `Bo‘lim tarkibiga ${lessonTitlesSample} kabi mavzular kiradi. Har bir darsda ${dMeta.diagramNodes.join(' → ')} bosqichlari amaliy misollar bilan tushuntiriladi.`,
      `Bo‘lim yakunida o‘quvchilar ${dMeta.terms.map((t) => t.term).join(', ')} tushunchalarini amalda qo‘llay oladilar va 10 ta test hamda 6 ta amaliy topshiriq orqali bilimini mustahkamlaydilar.`,
    ];

    const keyConcepts = [
      ...dMeta.terms,
      { term: `${bp.grade}-sinf ${bp.order}-bo‘lim`, meaning: `${bp.start}–${bp.end}-darslar (${rows.length} soat): ${bp.title}` },
    ];

    const lessons = rows.map((r) => ({
      dars: `${r.n}-dars`,
      title: r.title,
      hours: r.h,
      note: r.note || `${bp.title} · ${bp.term}`,
      slug: `g${bp.grade}-l${String(r.n).padStart(2, '0')}`,
    }));

    const t0 = dMeta.terms[0];
    const t1 = dMeta.terms[1];
    const t2 = dMeta.terms[2];
    const firstTitle = rows[0]?.title || bp.title;
    const midTitle = rows[Math.floor(rows.length / 2)]?.title || bp.title;
    const lastTitle = rows[rows.length - 1]?.title || bp.title;
    const domainEx = dMeta.examples(bp.title);

    const tests = [
      {
        id: `${bp.id}-t1`,
        question: `${bp.grade}-sinf “${bp.title}” bo‘limi qaysi darslar oralig‘ini qamrab oladi?`,
        options: [
          `${bp.start}–${bp.end}-darslar (${bp.term})`,
          'Faqat darslikning kirish sahifasi',
          'Barcha sinflarning yakuniy imtihoni',
          'Hech qanday amaliy mashg‘ulotsiz nazariya',
        ],
        correctIndex: 0,
        explanation: `Ushbu bo‘lim ${bp.grade}-sinf ${bp.term} rejasidagi ${bp.start}–${bp.end}-darslarni (${rows.length} soat) o‘z ichiga oladi.`,
      },
      {
        id: `${bp.id}-t2`,
        question: `“${bp.title}” bo‘limidagi asosiy «${t0.term}» tushunchasi nimani anglatadi?`,
        options: ['Tizim soatini o‘chirish tugmasini', t0.meaning, 'Printer qog‘ozi o‘lchamini', 'Tasodifiy fayl nomini'],
        correctIndex: 1,
        explanation: `${t0.term} — ${t0.meaning}`,
      },
      {
        id: `${bp.id}-t3`,
        question: `Bo‘limda o‘rganiladigan «${t1.term}» atamasining vazifasi qaysi javobda to‘g‘ri berilgan?`,
        options: ['Qurilmani tarmoqdan uzish', 'Barcha ma’lumotni o‘chirish', t1.meaning, 'Monitorni o‘chirish'],
        correctIndex: 2,
        explanation: `${t1.term}: ${t1.meaning}`,
      },
      {
        id: `${bp.id}-t4`,
        question: `“${firstTitle}” va “${midTitle}” darslaridagi to‘g‘ri ish ketma-ketligi qaysi?`,
        options: [
          'Natijani saqlamay yopish',
          'Tekshiruv bosqichini o‘tkazib yuborish',
          'Ma’lumotni tasodifiy kiritish',
          dMeta.diagramNodes.join(' → '),
        ],
        correctIndex: 3,
        explanation: `To‘g‘ri jarayon sxemasi: ${dMeta.diagramNodes.join(' → ')}.`,
      },
      {
        id: `${bp.id}-t5`,
        question: `«${t2.term}» tushunchasi amaliyotda qaysi holatda qo‘llaniladi?`,
        options: [t2.meaning, 'Faqat kompyuterni qayta yuklashda', 'Sichqonchani uzib qo‘yishda', 'Ekran yorqinligini nolga tushirishda'],
        correctIndex: 0,
        explanation: `${t2.term} — ${t2.meaning}`,
      },
      {
        id: `${bp.id}-t6`,
        question: `Bo‘limdagi "${dMeta.diagramNodes[0]}" bosqichidan so‘ng qaysi qadam bajariladi?`,
        options: [
          'Kompyuterni elektrdan uzish',
          dMeta.diagramNodes[1] || dMeta.diagramNodes[0],
          'Barcha sozlamalarni bekor qilish',
          'Matnni o‘chirib tashlash',
        ],
        correctIndex: 1,
        explanation: `Jarayon sxemasida "${dMeta.diagramNodes[0]}" bosqichidan keyin "${dMeta.diagramNodes[1]}" bajariladi.`,
      },
      {
        id: `${bp.id}-t7`,
        question: `“${bp.title}” bo‘limining amaliy namunasiga mos keluvchi to‘g‘ri fikr qaysi?`,
        options: [
          'Amaliy topshiriqlar natijasini tekshirmaslik',
          'Fayl formati va tuzilmasini e’tiborsiz qoldirish',
          domainEx[0],
          'Faqat nazariy matnni ko‘chirib yozish',
        ],
        correctIndex: 2,
        explanation: domainEx[0],
      },
      {
        id: `${bp.id}-t8`,
        question: `“${lastTitle}” darsi qaysi bo‘lim va yarim yillik/chorak tarkibiga kiradi?`,
        options: [
          `${bp.grade}-sinf, 11-sinf yakuniy imtihoni`,
          `Boshqa fan darslari ro‘yxatiga`,
          'Hech qanday bo‘limga kirmaydi',
          `${bp.grade}-sinf · ${bp.term} · ${bp.title}`,
        ],
        correctIndex: 3,
        explanation: `“${lastTitle}” ${bp.grade}-sinf ${bp.term}dagi “${bp.title}” bo‘limining yakunlovchi darslaridan biridir.`,
      },
      {
        id: `${bp.id}-t9`,
        question: `“${bp.title}” amaliyotida to‘g‘ri buyruq yoki namuna qaysi javobda berilgan?`,
        options: [
          dMeta.practiceCmd.sample,
          'Hech qanday buyruqsiz tasodifiy bosish',
          'Format: ??? / Noma’lum kengaytma',
          'Tekshirilmagan xato natijani qoldirish',
        ],
        correctIndex: 0,
        explanation: `To‘g‘ri amaliy namuna: ${dMeta.practiceCmd.sample}.`,
      },
      {
        id: `${bp.id}-t10`,
        question: `Ushbu bo‘limning yakuniy natijasi («${dMeta.diagramNodes[dMeta.diagramNodes.length - 1]}») nimani ta’minlaydi?`,
        options: [
          'Kiritilgan ma’lumotlarning yo‘qolishini',
          `Natijani sifatli yakunlash va ${bp.grade}-sinf malakasini mustahkamlashni`,
          'Foydalanuvchi parolini hammaga ko‘rsatishni',
          'Ekran o‘lchamini kichraytirishni',
        ],
        correctIndex: 1,
        explanation: `Yakuniy bosqich — "${dMeta.diagramNodes[dMeta.diagramNodes.length - 1]}" olingan bilim va natijani amalda mustahkamlaydi.`,
      },
    ];

    const practices = [
      {
        id: `${bp.id}-p1`,
        title: 'Asosiy atama va buyruq',
        instruction: `“${bp.title}” bo‘limiga oid asosiy buyruq, formula yoki atamani kiriting:`,
        placeholder: dMeta.practiceCmd.placeholder,
        expectedKeywords: dMeta.practiceCmd.keywords,
        sampleAnswer: dMeta.practiceCmd.sample,
        hint: dMeta.practiceCmd.hint,
      },
      {
        id: `${bp.id}-p2`,
        title: `${t0.term} qo‘llanilishi`,
        instruction: `«${t0.term}» tushunchasidan “${firstTitle}” darsida qanday foydalanilishini qisqa yozing:`,
        placeholder: dMeta.practiceCmd.placeholder,
        expectedKeywords: dMeta.practiceCmd.keywords,
        sampleAnswer: `${t0.term} — ${dMeta.practiceCmd.sample}`,
        hint: dMeta.practiceCmd.hint,
      },
      {
        id: `${bp.id}-p3`,
        title: 'Ish bosqichlari ketma-ketligi',
        instruction: `“${bp.title}” bo‘limidagi birinchi yoki yakuniy ish bosqichini yozing (${dMeta.diagramNodes[0]} ...):`,
        placeholder: `Masalan: ${dMeta.diagramNodes[0]}...`,
        expectedKeywords: [
          ...dMeta.practiceCmd.keywords,
          dMeta.diagramNodes[0].split(' ')[0].toLowerCase(),
          dMeta.diagramNodes[dMeta.diagramNodes.length - 1].split(' ')[0].toLowerCase(),
        ],
        sampleAnswer: dMeta.diagramNodes.join(' → '),
        hint: 'Bosqich nomini yoki asosiy kalit so‘zni yozing.',
      },
      {
        id: `${bp.id}-p4`,
        title: 'Amaliy misol yechimi',
        instruction: `“${midTitle}” mavzusi bo‘yicha amaliy namuna yoki buyruq yozing:`,
        placeholder: dMeta.practiceCmd.placeholder,
        expectedKeywords: dMeta.practiceCmd.keywords,
        sampleAnswer: dMeta.examples(midTitle)[0],
        hint: dMeta.practiceCmd.hint,
      },
      {
        id: `${bp.id}-p5`,
        title: 'Xatoni tekshirish va validatsiya',
        instruction: `“${lastTitle}” darsida natijani tekshirish yoki xatoni tuzatish usulini yozing:`,
        placeholder: `Masalan: ${t2.term.split(' ')[0]} / tekshirish...`,
        expectedKeywords: [...dMeta.practiceCmd.keywords, 'tekshir', 'validatsiya', 'debag', 'saql'],
        sampleAnswer: `${t2.term}: ${dMeta.examples(lastTitle)[0]}`,
        hint: 'Tekshirish, saqlash yoki asosiy atamadan foydalaning.',
      },
      {
        id: `${bp.id}-p6`,
        title: 'Bo‘lim xulosasi va natijasi',
        instruction: `“${bp.title}” bo‘limini yakunlashda qaysi muhim natija yoki atama tekshiriladi?`,
        placeholder: dMeta.practiceCmd.placeholder,
        expectedKeywords: [...dMeta.practiceCmd.keywords, 'tekshir', 'saql', 'tahlil', 'natija'],
        sampleAnswer: `${bp.title}: ${dMeta.practiceCmd.sample}`,
        hint: 'Tekshirish, saqlash yoki asosiy buyruq so‘zidan foydalaning.',
      },
    ];

    return {
      id: bp.id,
      grade: bp.grade,
      order: bp.order,
      term: bp.term,
      lessonRange: `${bp.start}–${bp.end}-darslar`,
      totalHours: rows.reduce((s, r) => s + r.h, 0),
      title: bp.title,
      shortDesc: bp.shortDesc,
      detailedExplanation,
      keyConcepts,
      lessons,
      animType: dMeta.animType,
      animTitle: bp.animTitle,
      animSubtitle: bp.animSubtitle,
      gameIds,
      tests,
      practices,
    };
  });
}

const CODELAB_SCAFFOLDS = {
  19: {
    starter: '<!-- 1. "Salom Web" sarlavhasini yozing -->\n\n<!-- 2. "Batafsil" havolasini yozing -->\n',
    requiredTokens: ['<h1', 'salom web', '</h1>', '<a', 'href=', '</a>'],
    hint: 'Sarlavha uchun ochiluvchi va yopiluvchi h1, havola uchun href atributli a tegidan foydalaning.',
  },
  20: {
    starter: '<p>Informatika 8-sinf</p>\n<!-- Matn rangini ko‘k (#1e40af) qilib belgilang -->',
    requiredTokens: ['<p', 'style=', 'color:', '#1e40af', '</p>'],
    hint: 'Tashqi ko‘rinishni o‘zgartirish uchun teg ichida style="color: #1e40af;" yozing.',
  },
  28: {
    starter: '<style>\n  /* Sarlavha matn rangini yozing */\n</style>\n<h1 id="top">9-sinf Veb</h1>\n<!-- Pastga yuqoriga qaytaruvchi ankor havola qo‘shing -->\n',
    requiredTokens: ['<style>', 'h1', 'color:', 'href="#top"', '</a>'],
    hint: 'Ichki CSS da h1 { color: ... } va ankor havola uchun href="#top" ishlatiladi.',
  },
  40: {
    starter: '// 1. "ballar" nomli massiv (80, 90, 100) yarating\n// 2. Yangi funksiya ichida sikl orqali elementlarni chiqaring\n',
    requiredTokens: ['[', ']', 'for', 'function'],
    hint: 'Massiv kvadrat qavs [...], funksiya esa function kalit so‘zi va for (let i = ...) siklidan tashkil topadi.',
  },
};

const SAFE_CIPHER_HINTS = {
  '2 Kilobayt (KB) necha Baytga teng?': 'KB ni Baytga aylantirish uchun sonni 1024 ga ko‘paytiring.',
  '3 Bayt necha Bitdan iborat?': 'Har bir baytda 8 ta bit borligidan foydalaning.',
  '4096 Megabayt (MB) necha Gigabayt (GB)?': 'MB dan GB ga o‘tish uchun 1024 ga bo‘ling.',
  'Kalit = +1 (har bir harf 1 ta keyingi harfga o‘tgan). "OPWB" so‘zini deshifrlang:': 'Alifbo bo‘yicha har bir harfni 1 o‘rin orqaga suring.',
  'Simmetrik shifrlashda nechta kalit ishlatiladi?': 'Shifrlovchi ham, ochuvchi ham ayni bir maxfiy kalitdan foydalanadi.',
  'Asimmetrik shifrlashda qaysi kalitlar jufti ishlaydi?': 'Biri hammaga ko‘rinadigan, ikkinchisi sir saqlanadigan juftlik.',
  'Turli protokollarga ega ikki tarmoqni bog‘lovchi qurilma qaysi?': 'Ushbu qurilma turli tarmoq protokollari o‘rtasida tarjimon vazifasini bajaradi.',
  '80 Megabit/s tezlikda 10 Megabaytli fayl necha sekundda yuklanadi?': 'Avval 10 Megabaytni 8 ga ko‘paytirib Megabitga o‘tkazing, so‘ng tezlikka bo‘ling.',
  'Fayllarni markaziy serversiz bo‘lib-bo‘lib almashish protokoli qaysi?': 'Markaziy serversiz P2P bo‘lakli almashinuv protokoli.',
  'Katta hajmdagi ma’lumotlardan yashirin qonuniyatlarni aniqlash jarayoni qaysi?': 'Ma’lumotlar bazasidan avtomatik qonuniyat qidirish inglizcha atamasi.',
};

function rotateQuizChoices(questions, gameId) {
  return questions.map((q, idx) => {
    const choices = Array.isArray(q.choices) ? [...q.choices] : [];
    if (choices.length < 2) return q;
    const correctText = choices[q.answer] ?? choices[0];
    const shift = (gameId * 3 + idx * 5 + 1) % choices.length;
    const rotated = choices.map((_, i) => choices[(i + shift) % choices.length]);
    const newAns = rotated.indexOf(correctText);
    return {
      ...q,
      choices: rotated,
      answer: newAns >= 0 ? newAns : 0,
    };
  });
}

function run() {
  const seedData = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));

  // 1. Remap base 40 games onto the 56 expanded TopicUnits and append 19 bespoke games (41..59)
  const baseGames = seedData.games.filter((g) => g.id <= 40);
  const combinedGames = [...baseGames, ...EXTRA_GAMES_41_58];
  seedData.games = combinedGames.map((g) => {
    const mappedTopic = GAME_TOPIC_REMAP[g.id] || g.topicId;
    const updated = { ...g, topicId: mappedTopic };

    if (Array.isArray(updated.blitz)) {
      updated.blitz = rotateQuizChoices(updated.blitz, updated.id);
    }
    if (Array.isArray(updated.tug)) {
      updated.tug = rotateQuizChoices(updated.tug, updated.id);
    }
    if (Array.isArray(updated.cipher)) {
      updated.cipher = updated.cipher.map((item, idx) => {
        const opts = Array.isArray(item.options) ? [...item.options] : undefined;
        let rotatedOpts = opts;
        if (opts && opts.length > 1) {
          const shift = (updated.id + idx * 3 + 1) % opts.length;
          rotatedOpts = opts.map((_, i) => opts[(i + shift) % opts.length]);
        }
        return {
          ...item,
          options: rotatedOpts,
          hint: SAFE_CIPHER_HINTS[item.prompt] || item.hint,
        };
      });
    }
    if (Array.isArray(updated.codeLab) && CODELAB_SCAFFOLDS[updated.id]) {
      const scaffold = CODELAB_SCAFFOLDS[updated.id];
      updated.codeLab = updated.codeLab.map((item, idx) =>
        idx === 0
          ? {
              ...item,
              starter: scaffold.starter,
              requiredTokens: scaffold.requiredTokens,
              hint: scaffold.hint,
            }
          : item
      );
    }
    return updated;
  });

  // 2. Build all 56 TopicUnits (8 per grade across Grades 5-11)
  seedData.topics = build56Topics(seedData);

  // 3. Build all 340 official lessons mapped cleanly onto the 56 TopicUnits
  const allLessons = [];
  for (const gradeStr of Object.keys(OFFICIAL_CURRICULUM)) {
    const grade = Number(gradeStr);
    const rows = OFFICIAL_CURRICULUM[grade];
    for (const row of rows) {
      allLessons.push(buildLessonFullRecord(grade, row, seedData));
    }
  }

  seedData.lessons = allLessons;
  seedData.source_discrepancies = [
    {
      grade: 7,
      lesson: 10,
      issue: 'PDF 4-betda 10-dars ("Loyiha xususiyatini ishlab chiqish") Soat ustuni bo‘sh qolgan; sarlavhada jami 34 soat va 34 ta dars qatori borligi sababli 1 soat deb qabul qilindi.',
    },
    {
      grade: 8,
      lesson: '17-34',
      issue: 'PDF 5-betda ikkinchi yarim yillik sarlavhasi "3 CHORAK" deb yozilgan va 34-darsdan keyin pastda bo‘sh qatorning Soat ustunida "1" raqami turibdi (1–34-darslar to‘liq 34 soatni tashkil etadi).',
    },
    {
      grade: '7 va 11 Excel',
      lesson: 'all',
      issue: 'Ishchi papkada alohida .xlsx/.xls Excel fayllari mavjud emas; barcha ma’lumotlar rasmiy "Informatika_5-11-sinf_yillik_reja_2026-2027_0364fcd5.pdf" hujjati asosida tekshirildi.',
    },
  ];

  fs.writeFileSync(SEED_PATH, JSON.stringify(seedData, null, 2), 'utf-8');

  const perGradeLessons = {};
  const perGradeTopics = {};
  for (const l of allLessons) {
    perGradeLessons[l.grade] = (perGradeLessons[l.grade] || 0) + 1;
  }
  for (const t of seedData.topics) {
    perGradeTopics[t.grade] = (perGradeTopics[t.grade] || 0) + 1;
  }
  console.log('Generated complete 56-topic curriculum:', {
    total_topics: seedData.topics.length,
    topics_per_grade: perGradeTopics,
    total_lessons: allLessons.length,
    lessons_per_grade: perGradeLessons,
    total_games: seedData.games.length,
    total_tests: allLessons.reduce((s, l) => s + l.tests.length, 0),
    total_slides: allLessons.reduce((s, l) => s + l.slides.length, 0),
    total_practices: allLessons.reduce((s, l) => s + l.practices.length, 0),
    topics_lesson_sum: seedData.topics.reduce((s, u) => s + u.lessons.length, 0),
  });
}

run();
