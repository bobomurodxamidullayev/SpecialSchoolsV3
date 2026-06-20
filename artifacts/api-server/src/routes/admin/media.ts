import { Router } from "express";
import admin from "firebase-admin";
import "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const BUCKET_NAME = "school-eece2.firebasestorage.app";

router.get("/", requireAdmin, async (req, res) => {
  try {
    const bucket = admin.storage().bucket(BUCKET_NAME);
    const [files] = await bucket.getFiles();

    const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));

    const data = await Promise.all(images.map(async (file) => {
      const [metadata] = await file.getMetadata();
      return {
        filename: file.name,
        url: `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(file.name)}?alt=media`,
        size: Number(metadata.size),
        createdAt: metadata.timeCreated,
      };
    }));

    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    res.json({ ok: true, data: [] });
  }
});

router.delete("/:filename", requireAdmin, async (req, res) => {
  try {
    const safe = req.params.filename;
    const bucket = admin.storage().bucket(BUCKET_NAME);
    await bucket.file(safe).delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ ok: false, error: "File not found in Firebase" });
  }
});

export default router;