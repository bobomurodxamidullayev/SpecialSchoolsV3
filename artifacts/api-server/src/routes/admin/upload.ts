import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { UPLOADS_DIR } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
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

router.post("/", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: "No file uploaded" });
    return;
  }
  res.json({
    ok: true,
    data: {
      filename: req.file.filename,
      url: `/api/uploads/${req.file.filename}`,
      size: req.file.size,
    },
  });
});

router.post("/multiple", requireAdmin, upload.array("files", 20), (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ ok: false, error: "No files uploaded" });
    return;
  }
  res.json({
    ok: true,
    data: files.map((f) => ({
      filename: f.filename,
      url: `/api/uploads/${f.filename}`,
      size: f.size,
    })),
  });
});

export default router;
