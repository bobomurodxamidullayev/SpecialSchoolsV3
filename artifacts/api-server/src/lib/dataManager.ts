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
