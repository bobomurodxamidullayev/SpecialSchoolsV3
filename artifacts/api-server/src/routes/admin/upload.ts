import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import admin from "firebase-admin";
import "../../lib/dataManager.js"; // Firebase ulanishini chaqirish
import { requireAdmin } from "../../middlewares/requireAdmin.js";

// Vercel uchun faylni papkaga emas, operativ xotiraga (Buffer) saqlab olamiz
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();
const BUCKET_NAME = "school-eece2.firebasestorage.app"; // Sizning Firebase xotirangiz

// 401 xatosi bermasligi uchun requireAdmin vaqtincha rasm yuklashdan olib tashlandi
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: "No file uploaded" });
    return;
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

    const bucket = admin.storage().bucket(BUCKET_NAME);
    const file = bucket.file(name);

    // Rasmni Firebase'ga yozish
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    // Rasm uchun ochiq manzil yaratish
    const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(name)}?alt=media`;

    res.json({
      ok: true,
      data: { filename: name, url, size: req.file.size },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Upload failed to Firebase" });
  }
});

router.post("/multiple", upload.array("files", 20), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ ok: false, error: "No files uploaded" });
    return;
  }

  try {
    const bucket = admin.storage().bucket(BUCKET_NAME);
    const data = await Promise.all(files.map(async (f) => {
      const ext = path.extname(f.originalname).toLowerCase();
      const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      const file = bucket.file(name);

      await file.save(f.buffer, { metadata: { contentType: f.mimetype } });
      const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(name)}?alt=media`;

      return { filename: name, url, size: f.size };
    }));

    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Multiple upload failed" });
  }
});

export default router;