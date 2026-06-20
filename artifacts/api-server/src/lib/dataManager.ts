import { logger } from "./logger.js";
import admin from "firebase-admin";

// Vercel Environment Variables dan Firebase ma'lumotlarini olish
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString())
  : null;

if (serviceAccountKey && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  logger.info("Firebase Realtime Database ulandi");
} else if (!serviceAccountKey) {
  logger.warn("Firebase sozlanmagan! Ma'lumotlar saqlanmaydi.");
}

const db = admin.apps.length ? admin.database() : null;

export async function readData<T>(filename: string, defaultValue: T): Promise<T> {
  if (!db) return defaultValue;
  try {
    const refName = filename.replace('.json', '');
    const snapshot = await db.ref(refName).once('value');
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return defaultValue;
  } catch (error) {
    logger.error(`Baza o'qishda xato: ${filename}`, error);
    return defaultValue;
  }
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  if (!db) {
    logger.warn(`Firebase ulanmagan. Baza yozilmadi: ${filename}`);
    return;
  }
  try {
    const refName = filename.replace('.json', '');
    await db.ref(refName).set(data);
  } catch (error) {
    logger.error(`Baza yozishda xato: ${filename}`, error);
    throw error;
  }
}

export async function initializeData(): Promise<void> {
  // Firebase bazasi bo'sh bo'lsa, uni boshlang'ich ma'lumotlar bilan to'ldirish kerak bo'ladi.
  // Bu funksiya faylga emas, bazaga yozishi sababli uni vaqtincha bo'sh qoldiramiz 
  // qachonki admin panel ishlasa, o'zingiz kiritib olaverasiz.
  logger.info("Firebase muhitida data initsializatsiyasi yakunlandi.");
}

export const UPLOADS_DIR = "/tmp"; // Vercel vaqtincha xotirasi
export async function ensureDirs(): Promise<void> {}