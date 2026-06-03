import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { UPLOADS_DIR } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const files = await fs.readdir(UPLOADS_DIR);
    const images = files.filter((f) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
    const data = await Promise.all(
      images.map(async (filename) => {
        const stat = await fs.stat(path.join(UPLOADS_DIR, filename));
        return {
          filename,
          url: `/api/uploads/${filename}`,
          size: stat.size,
          createdAt: stat.birthtime.toISOString(),
        };
      })
    );
    data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ ok: true, data });
  } catch {
    res.json({ ok: true, data: [] });
  }
});

router.delete("/:filename", requireAdmin, async (req, res) => {
  const raw = req.params["filename"];
  const safe = path.basename(Array.isArray(raw) ? raw[0] : (raw ?? ""));
  if (!safe) { res.status(400).json({ ok: false, error: "Invalid filename" }); return; }
  try {
    await fs.unlink(path.join(UPLOADS_DIR, safe));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ ok: false, error: "File not found" });
  }
});

export default router;
