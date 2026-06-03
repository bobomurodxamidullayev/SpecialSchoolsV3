import fs from "fs/promises";
import path from "path";
import { logger } from "./logger.js";

const BASE = process.cwd();
export const DATA_DIR = path.join(BASE, "data");
export const UPLOADS_DIR = path.join(BASE, "public", "uploads");
export const BACKUPS_DIR = path.join(BASE, "backups");

export async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(BACKUPS_DIR, { recursive: true });
}

export async function readData<T>(filename: string, defaultValue: T): Promise<T> {
  const file = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(file, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  const file = path.join(DATA_DIR, filename);
  const serialized = JSON.stringify(data, null, 2);
  JSON.parse(serialized);

  try {
    const existing = await fs.readFile(file, "utf-8");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.writeFile(path.join(BACKUPS_DIR, `${ts}_${filename}`), existing, "utf-8");
  } catch {
    // No existing file
  }

  await fs.writeFile(file, serialized, "utf-8");
  const verify = await fs.readFile(file, "utf-8");
  JSON.parse(verify);
}

async function fileExists(filename: string): Promise<boolean> {
  try {
    await fs.access(path.join(DATA_DIR, filename));
    return true;
  } catch {
    return false;
  }
}

export async function initializeData(): Promise<void> {
  await ensureDirs();

  if (!(await fileExists("admin.json"))) {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("admin123", 10);
    await writeData("admin.json", { username: "admin", passwordHash: hash, name: "Administrator" });
    logger.info("Created default admin credentials: admin / admin123");
  }

  if (!(await fileExists("settings.json"))) {
    await writeData("settings.json", {
      schoolName: { uz: "QCh Maktab", en: "QCh School", ru: "Школа QCh" },
      slogan: { uz: "Prezident maktabi", en: "Presidential Specialized School", ru: "Президентская специализированная школа" },
      description: { uz: "O'zbekistonning eng yaxshi ixtisoslashtirilgan maktabi", en: "Uzbekistan's premier specialized educational institution", ru: "Ведущее специализированное учебное заведение Узбекистана" },
      heroTitle: { uz: "Kelajak bugundan boshlanadi", en: "The Future Starts Today", ru: "Будущее начинается сегодня" },
      heroStats: [
        { value: "1200+", label: { uz: "O'quvchi", en: "Students", ru: "Учащихся" } },
        { value: "85+", label: { uz: "O'qituvchi", en: "Teachers", ru: "Учителей" } },
        { value: "18+", label: { uz: "Laboratoriya", en: "Laboratories", ru: "Лабораторий" } },
        { value: "150+", label: { uz: "Medal", en: "Medals", ru: "Медалей" } },
      ],
      phone: "+998 90 123 45 67",
      phone2: "+998 93 456 78 90",
      email: "info@qch-school.uz",
      email2: "director@qch-school.uz",
      address: { uz: "Quyi Chirchiq tumani, Toshkent viloyati, O'zbekiston", en: "Quyi Chirchiq District, Tashkent Region, Uzbekistan", ru: "Куйи Чирчикский район, Ташкентская область, Узбекистан" },
      workingHours: "Dushanba–Shanba, 08:00–18:00",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.1!2d69.6!3d41.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDEzMDAw!5e0!3m2!1sen!2suz!4v1234567890",
      social: { telegram: "https://t.me/qchschool", instagram: "https://instagram.com/qchschool", youtube: "https://youtube.com/@qchschool" },
      seoTitle: { uz: "QCh Maktab - Prezident Ixtisoslashtirilgan Maktabi", en: "QCh School - Presidential Specialized School", ru: "Школа QCh - Президентская специализированная школа" },
      seoDescription: { uz: "O'zbekistonning eng yaxshi ixtisoslashtirilgan maktabi", en: "Uzbekistan's premier specialized educational institution", ru: "Ведущее специализированное учебное заведение Узбекистана" },
      copyright: "© 2024 QCh School. All rights reserved.",
    });
  }

  if (!(await fileExists("administration.json"))) {
    await writeData("administration.json", [
      { id: "1", name: { uz: "Azizbek Rahimov", en: "Azizbek Rahimov", ru: "Азизбек Рахимов" }, position: { uz: "Direktor", en: "Principal", ru: "Директор" }, degree: { uz: "Pedagogika fanlari doktori (PhD)", en: "PhD in Pedagogy", ru: "Доктор педагогических наук (PhD)" }, bio: { uz: "", en: "", ru: "" }, phone: "+998 90 123 45 67", email: "director@qch-school.uz", receptionTime: { uz: "Dushanba–Juma, 09:00–18:00", en: "Mon–Fri, 09:00–18:00", ru: "Пн–Пт, 09:00–18:00" }, photo: "" },
      { id: "2", name: { uz: "Dilnoza Karimova", en: "Dilnoza Karimova", ru: "Дилноза Каримова" }, position: { uz: "O'quv ishlari bo'yicha direktor o'rinbosari", en: "Vice Principal (Academic)", ru: "Заместитель директора по учебной работе" }, degree: { uz: "Filologiya fanlari nomzodi", en: "Candidate of Philological Sciences", ru: "Кандидат филологических наук" }, bio: { uz: "", en: "", ru: "" }, phone: "+998 93 456 78 90", email: "academic@qch-school.uz", receptionTime: { uz: "Dushanba–Shanba, 08:30–17:00", en: "Mon–Sat, 08:30–17:00", ru: "Пн–Сб, 08:30–17:00" }, photo: "" },
    ]);
  }

  if (!(await fileExists("teachers.json"))) {
    await writeData("teachers.json", [
      { id: "1", name: "Bo'riqulov Avazbek To'lqinjonovich", subject: "English", grade: "1-toifa", phone: "+998 93 132 94 02", university: "ADU", graduationYear: 2020, experience: 4, email: "", bio: { uz: "", en: "", ru: "" }, photo: "" },
      { id: "2", name: "Urazbayeva Balnura Erjanovna", subject: "English", grade: "Oliy toifa", phone: "+998 99 872 68 61", university: "TDJTSU", graduationYear: 2016, experience: 8, email: "", bio: { uz: "", en: "", ru: "" }, photo: "" },
      { id: "3", name: "Sherzod Abdullayev Baxtiyorovich", subject: "Math", grade: "Oliy toifa", phone: "+998 90 312 45 67", university: "NUUz", graduationYear: 2007, experience: 16, email: "", bio: { uz: "", en: "", ru: "" }, photo: "" },
      { id: "4", name: "Malika Toshpulatova Ibrohimovna", subject: "Physics", grade: "Oliy toifa", phone: "+998 90 234 56 78", university: "ToshDTU", graduationYear: 2010, experience: 13, email: "", bio: { uz: "", en: "", ru: "" }, photo: "" },
      { id: "5", name: "Otabek Murodov Shodmonovich", subject: "IT", grade: "Oliy toifa", phone: "+998 90 789 01 23", university: "TUIT", graduationYear: 2014, experience: 10, email: "", bio: { uz: "", en: "", ru: "" }, photo: "" },
    ]);
  }

  if (!(await fileExists("certificates.json"))) {
    await writeData("certificates.json", [
      { id: "1", name: { uz: "IELTS", en: "IELTS", ru: "IELTS" }, subject: "English", level: "International", quantity: 45, year: 2024 },
      { id: "2", name: { uz: "Cambridge B2", en: "Cambridge B2", ru: "Cambridge B2" }, subject: "English", level: "International", quantity: 32, year: 2024 },
      { id: "3", name: { uz: "SAT", en: "SAT", ru: "SAT" }, subject: "Math/English", level: "International", quantity: 28, year: 2024 },
      { id: "4", name: { uz: "Milliy olimpiada 1-o'rin", en: "National Olympiad 1st Place", ru: "Национальная олимпиада 1 место" }, subject: "Math", level: "National", quantity: 12, year: 2024 },
      { id: "5", name: { uz: "Milliy olimpiada 1-o'rin", en: "National Olympiad 1st Place", ru: "Национальная олимпиада 1 место" }, subject: "Physics", level: "National", quantity: 8, year: 2024 },
    ]);
  }

  if (!(await fileExists("news.json"))) {
    await writeData("news.json", [
      { id: "1", title: { uz: "Xalqaro matematika olimpiadasida oltin medal", en: "Gold Medal at International Math Olympiad", ru: "Золотая медаль на Международной математической олимпиаде" }, slug: "gold-medal-math-olympiad", content: { uz: "", en: "Three of our 11th-grade students brought home gold medals from the IMO.", ru: "" }, category: "Achievements", author: "Press Service", readTime: "5", publishDate: "2024-03-15", coverImage: "", status: "published", featured: true },
      { id: "2", title: { uz: "Yangi Robototexnika va AI laboratoriyasi", en: "New Robotics & AI Lab Opened", ru: "Открыта новая лаборатория Робототехники и ИИ" }, slug: "new-robotics-lab", content: { uz: "", en: "State-of-the-art robotics and AI laboratory with 40 workstations.", ru: "" }, category: "Facilities", author: "Admin Office", readTime: "3", publishDate: "2024-02-28", coverImage: "", status: "published", featured: false },
    ]);
  }

  if (!(await fileExists("gallery.json"))) {
    await writeData("gallery.json", [
      { id: "1", title: { uz: "Navruz bayrami 2024", en: "Navruz Festival 2024", ru: "Праздник Навруз 2024" }, description: { uz: "", en: "", ru: "" }, category: "Events", date: "2024-03-21", images: [] },
      { id: "2", title: { uz: "Matematik olimpiada", en: "Math Olympiad Finals", ru: "Финал математической олимпиады" }, description: { uz: "", en: "", ru: "" }, category: "Competitions", date: "2024-04-15", images: [] },
    ]);
  }

  if (!(await fileExists("students.json"))) {
    await writeData("students.json", [
      { id: "1", name: { uz: "Alibek Yusupov", en: "Alibek Yusupov", ru: "Алибек Юсупов" }, achievement: { uz: "Xalqaro Matematika Olimpiadasi — Oltin medal", en: "International Mathematics Olympiad — Gold Medal", ru: "Международная олимпиада по математике — Золотая медаль" }, olympiad: { uz: "Xalqaro Matematika Olimpiadasi (IMO)", en: "International Mathematics Olympiad (IMO)", ru: "Международная олимпиада по математике (IMO)" }, medalType: "gold", country: "🇬🇧 London, UK", year: 2024, bio: { uz: "", en: "", ru: "" }, photo: "" },
      { id: "2", name: { uz: "Sarvinoz Qodirova", en: "Sarvinoz Qodirova", ru: "Сарвиноз Кадырова" }, achievement: { uz: "Xalqaro Fizika Olimpiadasi — Kumush medal", en: "International Physics Olympiad — Silver Medal", ru: "Международная олимпиада по физике — Серебряная медаль" }, olympiad: { uz: "Xalqaro Fizika Olimpiadasi (IPhO)", en: "International Physics Olympiad (IPhO)", ru: "Международная олимпиада по физике (IPhO)" }, medalType: "silver", country: "🇯🇵 Tokyo, Japan", year: 2024, bio: { uz: "", en: "", ru: "" }, photo: "" },
    ]);
  }

  if (!(await fileExists("admissions.json"))) {
    await writeData("admissions.json", [
      { id: "1", order: 1, name: { uz: "Ariza topshirish", en: "Application", ru: "Подача заявки" }, description: { uz: "Online ariza to'ldiring va hujjatlarni yuklang", en: "Fill out the online application and upload documents", ru: "Заполните онлайн-заявку и загрузите документы" }, deadline: "2026-05-01", status: "active" },
      { id: "2", order: 2, name: { uz: "Kirish imtihoni", en: "Entrance Exam", ru: "Вступительный экзамен" }, description: { uz: "Matematika va ingliz tilidan yozma imtihon", en: "Written exam in Mathematics and English", ru: "Письменный экзамен по математике и английскому языку" }, deadline: "2026-05-20", status: "upcoming" },
      { id: "3", order: 3, name: { uz: "Suhbat", en: "Interview", ru: "Собеседование" }, description: { uz: "O'qituvchilar bilan individual suhbat", en: "Individual interview with teachers", ru: "Индивидуальное собеседование с учителями" }, deadline: "2026-06-01", status: "upcoming" },
      { id: "4", order: 4, name: { uz: "Qabul", en: "Enrollment", ru: "Зачисление" }, description: { uz: "Qabul natijalari e'lon qilinadi", en: "Admission results announced", ru: "Объявление результатов приёма" }, deadline: "2026-06-15", status: "upcoming" },
    ]);
  }

  if (!(await fileExists("events.json"))) {
    await writeData("events.json", [
      { id: "1", order: 1, title: { uz: "Ochiq eshiklar kuni", en: "Open Day for Prospective Students", ru: "День открытых дверей" }, date: "2024-04-10", time: "10:00", location: { uz: "Asosiy zal", en: "Main Hall", ru: "Главный зал" }, description: { uz: "Ota-onalar va o'quvchilar maktab bilan tanishishlari va o'qituvchilar bilan uchrashishlari mumkin.", en: "Parents and students are welcome to tour the school and meet our faculty.", ru: "Родители и учащиеся могут ознакомиться со школой и встретиться с преподавателями." }, category: "Academic" },
      { id: "2", order: 2, title: { uz: "Fan yarmarkasi 2024", en: "Science Fair 2024", ru: "Ярмарка науки 2024" }, date: "2024-04-25", time: "09:00", location: { uz: "Fan qanoti", en: "Science Wing", ru: "Научный корпус" }, description: { uz: "O'quvchi fan va muhandislik loyihalarining yillik ko'rgazmasi.", en: "Annual exhibition of student science and engineering projects, judged by external experts.", ru: "Ежегодная выставка научных и инженерных проектов учащихся." }, category: "Academic" },
      { id: "3", order: 3, title: { uz: "Milliy matematika olimpiadasiga tayyorlov lagerl", en: "National Math Olympiad Preparation Camp", ru: "Подготовительный лагерь к национальной олимпиаде по математике" }, date: "2024-05-05", time: "08:00", location: { uz: "Ma'ruza zali A", en: "Lecture Hall A", ru: "Лекционный зал A" }, description: { uz: "Matematika fakulteti rahbarligida 3 kunlik intensiv tayyorlov lagerl.", en: "Intensive 3-day preparation camp led by our award-winning Mathematics faculty.", ru: "Интенсивный 3-дневный подготовительный лагерь под руководством преподавателей математики." }, category: "Competition" },
      { id: "4", order: 4, title: { uz: "2024 yil bitiruvchilar marosimi", en: "Graduation Ceremony — Class of 2024", ru: "Церемония выпуска — класс 2024" }, date: "2024-06-15", time: "11:00", location: { uz: "Ochiq amfiteatr", en: "Outdoor Amphitheatre", ru: "Открытый амфитеатр" }, description: { uz: "Mukofotlar, ijrolar va asosiy nutq bilan bitiruvchilarni tabriklash.", en: "Celebrate our graduating class with awards, performances, and a keynote address.", ru: "Поздравляем выпускников с наградами, выступлениями и основным докладом." }, category: "Community" },
    ]);
  }

  if (!(await fileExists("faq.json"))) {
    await writeData("faq.json", [
      { id: "1", order: 1, category: "Admissions", question: { uz: "Qabul uchun qanday ariza topshirish mumkin?", en: "How can I apply for admission?", ru: "Как подать заявку на поступление?" }, answer: { uz: "Qabul har yili may oyida ochiladi. Matematika va ingliz tilidan kirish imtihonlari bilan onlayn ariza yuboring. Tanlangan nomzodlar suhbatga taklif etiladi.", en: "Admissions open each May. Submit an online application followed by entrance exams in Math and English. Shortlisted candidates are invited for an interview.", ru: "Приём открывается каждый май. Подайте онлайн-заявку, затем сдайте вступительные экзамены по математике и английскому языку." } },
      { id: "2", order: 2, category: "Academic", question: { uz: "O'qitish tili qanday?", en: "What is the language of instruction?", ru: "Какой язык обучения?" }, answer: { uz: "Asosiy o'qitish tili o'zbek tili, ingliz va rus tili darslari ham keng o'qitiladi.", en: "The primary language of instruction is Uzbek, with extensive courses in English and Russian. STEM subjects are taught in English in upper grades.", ru: "Основной язык обучения — узбекский, с расширенными курсами английского и русского языков." } },
      { id: "3", order: 3, category: "Facilities", question: { uz: "Maktab yotoqxona xizmatini ko'rsatadimi?", en: "Does the school provide accommodation?", ru: "Предоставляет ли школа жилье?" }, answer: { uz: "Ha, boshqa viloyatlardan kelgan o'quvchilar uchun zamonaviy yotoqxonamiz mavjud.", en: "Yes, we have a fully equipped modern dormitory for students coming from other regions with supervised study halls and recreational areas.", ru: "Да, у нас есть современное общежитие для студентов из других регионов." } },
      { id: "4", order: 4, category: "Admissions", question: { uz: "QCh maktabi qaysi sinflarga qabul qiladi?", en: "What grades does QCh School accept?", ru: "В какие классы принимает школа QCh?" }, answer: { uz: "Biz 5-11-sinfga kiruvchi o'quvchilarni qabul qilamiz. Asosiy qabul 5-sinfda bo'ladi.", en: "We accept students entering grades 5 through 11. The main intake is at grade 5, with limited spaces available at other grade levels.", ru: "Мы принимаем учащихся в 5–11 классы. Основной прием в 5-й класс." } },
      { id: "5", order: 5, category: "Academic", question: { uz: "Xalqaro sertifikatlar olish mumkinmi?", en: "Are international certifications available?", ru: "Доступны ли международные сертификаты?" }, answer: { uz: "Ha — Cambridge IGCSE, IELTS tayyorlov va SAT dasturlari 9–11-sinf o'quvchilari uchun o'quv rejasiga kiritilgan.", en: "Yes — Cambridge IGCSE, IELTS preparation, and SAT readiness programs are embedded in our curriculum for grades 9–11.", ru: "Да — программы Cambridge IGCSE, подготовка к IELTS и SAT включены в учебный план для 9–11 классов." } },
    ]);
  }

  if (!(await fileExists("achievements-international.json"))) {
    await writeData("achievements-international.json", [
      { id: "1", order: 1, subject: "Mathematics", competition: "IMO 2024", award: "Gold Medal", flag: "🇬🇧", country: "London, UK" },
      { id: "2", order: 2, subject: "Physics", competition: "APhO 2024", award: "Silver Medal", flag: "🇯🇵", country: "Tokyo, Japan" },
      { id: "3", order: 3, subject: "Informatics", competition: "IOI 2023", award: "Bronze Medal", flag: "🇭🇺", country: "Budapest, Hungary" },
      { id: "4", order: 4, subject: "Chemistry", competition: "IChO 2024", award: "Silver Medal", flag: "🇸🇦", country: "Riyadh, KSA" },
    ]);
  }

  if (!(await fileExists("achievements-national.json"))) {
    await writeData("achievements-national.json", [
      { id: "1", order: 1, subject: "Mathematics", award: "1st Place", count: 8, color: "from-blue-500 to-indigo-600" },
      { id: "2", order: 2, subject: "Physics", award: "1st Place", count: 6, color: "from-violet-500 to-purple-600" },
      { id: "3", order: 3, subject: "Chemistry", award: "1st–2nd", count: 5, color: "from-orange-500 to-red-600" },
      { id: "4", order: 4, subject: "Informatics", award: "1st Place", count: 7, color: "from-cyan-500 to-teal-600" },
      { id: "5", order: 5, subject: "Biology", award: "Top 3", count: 4, color: "from-emerald-500 to-green-600" },
      { id: "6", order: 6, subject: "English", award: "1st Place", count: 3, color: "from-amber-500 to-yellow-600" },
    ]);
  }

  if (!(await fileExists("directions.json"))) {
    await writeData("directions.json", [
      { id: "1", order: 1, name: { uz: "Aniq fanlar", en: "Exact Sciences", ru: "Точные науки" }, desc: { uz: "Matematika, Fizika, Kimyo, Astronomiya — mantiqiy fikrlash va ilmiy tadqiqot ko'nikmalarini rivojlantiradi.", en: "Mathematics, Physics, Chemistry, Astronomy — developing logical thinking and scientific research skills.", ru: "Математика, Физика, Химия, Астрономия — развитие логического мышления и научно-исследовательских навыков." }, students: 320, teachers: 24, labs: 4, subjects: { uz: "Matematika\nFizika\nKimyo\nAstronomiya\nInformatika (asoslar)", en: "Mathematics\nPhysics\nChemistry\nAstronomy\nComputer Science (basics)", ru: "Математика\nФизика\nХимия\nАстрономия\nИнформатика (основы)" }, careers: { uz: "Muhandislik\nIlmiy tadqiqot\nMoliya\nMimarlik\nMeditsina", en: "Engineering\nScientific Research\nFinance\nArchitecture\nMedicine", ru: "Инженерия\nНаучные исследования\nФинансы\nАрхитектура\nМедицина" } },
      { id: "2", order: 2, name: { uz: "Tabiiy fanlar", en: "Natural Sciences", ru: "Естественные науки" }, desc: { uz: "Biologiya, Kimyo, Ekologiya — tirik organizmlar va atrof-muhitni o'rganishga yo'naltirilgan.", en: "Biology, Chemistry, Ecology — focused on living organisms and the environment.", ru: "Биология, Химия, Экология — изучение живых организмов и окружающей среды." }, students: 280, teachers: 22, labs: 6, subjects: { uz: "Biologiya\nKimyo\nEkologiya\nAnatamiya\nGenetika", en: "Biology\nChemistry\nEcology\nAnatomy\nGenetics", ru: "Биология\nХимия\nЭкология\nАнатомия\nГенетика" }, careers: { uz: "Tibbiyot\nFarmatsevtika\nBiotexnologiya\nEkologiya\nQishloq xo'jaligi", en: "Medicine\nPharmaceuticals\nBiotechnology\nEcology\nAgriculture", ru: "Медицина\nФармацевтика\nБиотехнологии\nЭкология\nСельское хозяйство" } },
      { id: "3", order: 3, name: { uz: "Axborot texnologiyalari", en: "Information Technology", ru: "Информационные технологии" }, desc: { uz: "Dasturlash, Sun'iy intellekt, Robototexnika — raqamli kelajakka yo'l ochadi.", en: "Programming, AI, Robotics — opening the path to a digital future.", ru: "Программирование, ИИ, Робототехника — открывая путь в цифровое будущее." }, students: 250, teachers: 18, labs: 5, subjects: { uz: "Dasturlash\nSun'iy intellekt\nRobototexnika\nMa'lumotlar bazasi\nKiberxavfsizlik", en: "Programming\nArtificial Intelligence\nRobotics\nDatabases\nCybersecurity", ru: "Программирование\nИскусственный интеллект\nРобототехника\nБазы данных\nКибербезопасность" }, careers: { uz: "Dastur muhandisi\nMa'lumotlar olimi\nKiberhavfsizlik mutaxassisi\nAI tadqiqotchisi\nIT menedjer", en: "Software Engineer\nData Scientist\nCybersecurity Specialist\nAI Researcher\nIT Manager", ru: "Программный инженер\nУчёный по данным\nСпециалист по кибербезопасности\nИсследователь ИИ\nIT-менеджер" } },
      { id: "4", order: 4, name: { uz: "Tillar va gumanitar fanlar", en: "Languages & Humanities", ru: "Языки и гуманитарные науки" }, desc: { uz: "Ingliz, Rus, O'zbek, Xitoy — ko'p tilli aloqa va madaniy bilimlarni rivojlantiradi.", en: "English, Russian, Uzbek, Chinese — developing multilingual communication and cultural knowledge.", ru: "Английский, Русский, Узбекский, Китайский — развитие многоязычного общения и культурных знаний." }, students: 350, teachers: 21, labs: 3, subjects: { uz: "Ingliz tili\nRus tili\nO'zbek adabiyoti\nTarix\nFalsafa", en: "English Language\nRussian Language\nUzbek Literature\nHistory\nPhilosophy", ru: "Английский язык\nРусский язык\nУзбекская литература\nИстория\nФилософия" }, careers: { uz: "Tarjimon\nDiplomat\nJurnalist\nO'qituvchi\nXalqaro biznes", en: "Translator\nDiplomat\nJournalist\nTeacher\nInternational Business", ru: "Переводчик\nДипломат\nЖурналист\nПреподаватель\nМеждународный бизнес" } },
    ]);
  }

  if (!(await fileExists("about.json"))) {
    await writeData("about.json", {
      mission: { uz: "O'quvchilarga o'z salohiyatini to'liq ochishga imkon beruvchi, tez o'zgarayotgan zamonaviy dunyoda muvaffaqiyat qozonish uchun zarur bilim va ko'nikmalar bilan qurollantiramiz.", en: "To provide a world-class education that empowers students to reach their highest potential, equipping them with the knowledge, skills, and values needed to succeed in a rapidly changing global society.", ru: "Обеспечить мировое образование, которое позволяет студентам раскрыть весь свой потенциал, вооружив их знаниями, навыками и ценностями, необходимыми для успеха в быстро меняющемся мире." },
      vision: { uz: "Innovatsion o'qitish usullari va chuqur akademik bilim uyg'unlashgan holda, maktabimiz jahon miqyosida tan olingan nufuzli muassasaga aylanishini maqsad qilamiz.", en: "To be recognized globally as a premier institution of excellence, where innovative teaching meets academic rigor, producing graduates who are lifelong learners and responsible global citizens.", ru: "Стать глобально признанным учреждением превосходства, где инновационное преподавание сочетается с академической строгостью." },
      philosophy: [
        { id: "1", order: 1, title: { uz: "Chuqur Bilim", en: "Academic Rigor", ru: "Академическая строгость" }, desc: { uz: "Tanqidiy fikrlash va ijodiy yondashuvni rivojlantiradigan kuchli o'quv dasturi.", en: "Challenging curriculum designed to stretch boundaries and foster critical thinking.", ru: "Сложная учебная программа, разработанная для расширения границ и развития критического мышления." } },
        { id: "2", order: 2, title: { uz: "Birgalikda O'rganish", en: "Collaborative Learning", ru: "Совместное обучение" }, desc: { uz: "Jamoaviy ish, muloqot va o'rtoqlar o'rtasida bilim almashishga alohida e'tibor beriladi.", en: "Emphasis on teamwork, communication, and peer-to-peer knowledge sharing.", ru: "Акцент на командной работе, общении и обмене знаниями между коллегами." } },
        { id: "3", order: 3, title: { uz: "Dunyo Miqyosida", en: "Global Perspective", ru: "Глобальная перспектива" }, desc: { uz: "Har bir fanda xalqaro standartlar va zamonaviy talablarni asosiy mezon sifatida qabul qilamiz.", en: "Integrating international standards and perspectives into every subject.", ru: "Интеграция международных стандартов и перспектив в каждый предмет." } },
      ],
      timeline: [
        { id: "1", order: 1, year: "2012", title: { uz: "Maktab tashkil topdi", en: "Foundation", ru: "Основание" }, desc: { uz: "Mahalliy iste'dodli yoshlarni tarbiyalash maqsadida maktabga asos solindi.", en: "School established with a vision to nurture local talent.", ru: "Школа основана с целью воспитания местных талантов." } },
        { id: "2", order: 2, year: "2015", title: { uz: "Birinchi bitiruvchilar", en: "First Graduates", ru: "Первые выпускники" }, desc: { uz: "Birinchi o'quvchilar yuqori natijalar bilan maktabni tamomladi.", en: "Our first cohort of students graduates with outstanding results.", ru: "Первый поток студентов окончил школу с отличными результатами." } },
        { id: "3", order: 3, year: "2018", title: { uz: "Prezident maqomi berildi", en: "Presidential Status", ru: "Президентский статус" }, desc: { uz: "Akademik yutuqlar uchun Prezident Ixtisoslashtirilgan Maktabi maqomiga sazovor bo'ldi.", en: "Elevated to Presidential Specialized School status for academic excellence.", ru: "Получила статус Президентской специализированной школы за академическое превосходство." } },
        { id: "4", order: 4, year: "2021", title: { uz: "Yangi bino", en: "New Campus", ru: "Новый кампус" }, desc: { uz: "Zamonaviy laboratoriyalarga ega yangi o'quv binosiga ko'chib o'tildi.", en: "Moved to a state-of-the-art modern facility with advanced laboratories.", ru: "Переехали в современное учебное здание с передовыми лабораториями." } },
        { id: "5", order: 5, year: "2024", title: { uz: "Xalqaro tan olinish", en: "International Recognition", ru: "Международное признание" }, desc: { uz: "Xalqaro akkreditatsiya qo'lga kiritildi va bir nechta olimpiada oltin medali qo'lga olindi.", en: "Achieved international accreditation and multiple Olympiad golds.", ru: "Получила международную аккредитацию и несколько золотых медалей олимпиад." } },
      ],
    });
  }

  if (!(await fileExists("admissions-requirements.json"))) {
    await writeData("admissions-requirements.json", [
      { id: "1", order: 1, text: { uz: "4-sinfni a'lo baholar bilan tamomlaganlik", en: "Completion of 4th grade with excellent grades", ru: "Окончание 4-го класса с отличными оценками" } },
      { id: "2", order: 2, text: { uz: "Tug'ilganlik to'g'risidagi guvohnoma yoki pasport nusxasi", en: "Birth certificate or passport copy", ru: "Свидетельство о рождении или копия паспорта" } },
      { id: "3", order: 3, text: { uz: "Tibbiy ma'lumotnoma (086-shakl)", en: "Medical certificate (086 form)", ru: "Медицинская справка (форма 086)" } },
      { id: "4", order: 4, text: { uz: "4 dona 3×4 formatdagi rasm", en: "4 photos in 3×4 format", ru: "4 фотографии в формате 3×4" } },
      { id: "5", order: 5, text: { uz: "Akademik yutuqlar to'plami — portfolio (ixtiyoriy, ammo tavsiya etiladi)", en: "Academic achievements portfolio (optional, but recommended)", ru: "Портфолио академических достижений (необязательно, но рекомендуется)" } },
    ]);
  }

  if (!(await fileExists("admissions-dates.json"))) {
    await writeData("admissions-dates.json", [
      { id: "1", order: 1, date: "1-may — 31-may", event: { uz: "Onlayn ariza qabul qilish davri", en: "Online application period", ru: "Период приёма онлайн-заявок" } },
      { id: "2", order: 2, date: "15-iyun", event: { uz: "Birinchi bosqich — Matematika imtihoni", en: "Stage 1 — Mathematics Exam", ru: "Этап 1 — Экзамен по математике" } },
      { id: "3", order: 3, date: "5-iyul", event: { uz: "Ikkinchi bosqich — Ingliz tili va mantiq", en: "Stage 2 — English and Logic", ru: "Этап 2 — Английский язык и логика" } },
      { id: "4", order: 4, date: "20–25-iyul", event: { uz: "Nomzodlar bilan suhbatlar", en: "Candidate interviews", ru: "Собеседования с кандидатами" } },
      { id: "5", order: 5, date: "10-avgust", event: { uz: "Yakuniy natijalar e'lon qilinadi", en: "Final results announced", ru: "Объявление окончательных результатов" } },
    ]);
  }

  if (!(await fileExists("contact.json"))) {
    await writeData("contact.json", {
      phone: "+998 90 123 45 67",
      phone2: "+998 93 456 78 90",
      email: "info@qch-school.uz",
      email2: "director@qch-school.uz",
      address: { uz: "Quyi Chirchiq tumani, Toshkent viloyati", en: "Quyi Chirchiq District, Tashkent Region", ru: "Куйи Чирчикский район, Ташкентская область" },
      workingHours: { uz: "Dushanba–Shanba: 08:00–18:00", en: "Mon–Sat: 08:00–18:00", ru: "Пн–Сб: 08:00–18:00" },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.1!2d69.6!3d41.3",
      telegram: "https://t.me/qchschool",
      instagram: "https://instagram.com/qchschool",
    });
  }

  logger.info("Data initialization complete");
}
