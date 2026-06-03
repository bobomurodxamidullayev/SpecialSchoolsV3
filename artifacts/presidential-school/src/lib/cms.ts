import type { Language } from "@/data/translations";

export type LangField = { uz: string; en: string; ru: string };

export function pickLang(field: LangField | string | undefined, lang: Language): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.en || field.uz || field.ru || "";
}

export async function fetchContent<T>(path: string): Promise<T> {
  const res = await fetch(`/api/content/${path}`);
  const json = await res.json() as { ok: boolean; data?: T; error?: string };
  if (!res.ok || !json.ok || json.data === undefined) {
    throw new Error(json.error ?? "Failed to load content");
  }
  return json.data;
}

export interface CmsSettings {
  schoolName: LangField;
  slogan: LangField;
  description: LangField;
  heroTitle: LangField;
  heroStats: Array<{ value: string; label: LangField }>;
  phone: string;
  phone2: string;
  email: string;
  email2: string;
  address: LangField;
  workingHours: string;
  mapUrl: string;
  social: { telegram: string; instagram: string; youtube: string };
  seoTitle: LangField;
  seoDescription: LangField;
  copyright: string;
}

export interface CmsContact {
  phone: string;
  phone2: string;
  email: string;
  email2: string;
  address: LangField;
  workingHours: LangField;
  mapUrl: string;
  telegram: string;
  instagram: string;
}

export interface CmsAdmin {
  id: string;
  name: LangField;
  position: LangField;
  degree: LangField;
  bio: LangField;
  phone: string;
  email: string;
  receptionTime: LangField;
  photo: string;
}

export interface CmsTeacher {
  id: string;
  name: string;
  subject: string;
  grade: string;
  phone: string;
  university: string;
  graduationYear: number;
  experience: number;
  email: string;
  bio?: LangField;
  photo: string;
}

export interface CmsNews {
  id: string;
  title: LangField;
  slug: string;
  content: LangField;
  category: string;
  author: string;
  readTime: string;
  publishDate: string;
  coverImage: string;
  status: string;
  featured: boolean;
}

export interface CmsGalleryItem {
  id: string;
  title: LangField;
  description: LangField;
  category: string;
  date: string;
  images: string[];
}

export interface CmsStudent {
  id: string;
  name: LangField;
  achievement: LangField;
  olympiad: LangField;
  medalType: string;
  country: string;
  year: number;
  bio: LangField;
  photo: string;
}

export interface CmsCertificate {
  id: string;
  name: LangField;
  subject: string;
  level: string;
  quantity: number;
  year: number;
}

export interface CmsAdmissionStage {
  id: string;
  order: number;
  name: LangField;
  description: LangField;
  deadline: string;
  status: string;
}
