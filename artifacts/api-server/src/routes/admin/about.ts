import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "about.json";

router.get("/", requireAdmin, async (_req, res) => {
  const data = await readData(FILE, {});
  res.json({ ok: true, data });
});

router.put("/", requireAdmin, async (req, res) => {
  await writeData(FILE, req.body);
  res.json({ ok: true, data: req.body });
});

export default router;
