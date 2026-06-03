import { Router } from "express";
import bcrypt from "bcryptjs";
import { readData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ ok: false, error: "Username and password required" });
    return;
  }
  const admin = await readData<{ username: string; passwordHash: string; name: string }>("admin.json", { username: "", passwordHash: "", name: "" });
  if (admin.username !== username) {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
    return;
  }
  req.session.adminUsername = admin.username;
  req.session.adminName = admin.name;
  res.json({ ok: true, user: { username: admin.username, name: admin.name } });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/session", requireAdmin, (req, res) => {
  res.json({ ok: true, user: { username: req.session.adminUsername, name: req.session.adminName } });
});

router.put("/password", requireAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    res.status(400).json({ ok: false, error: "Both fields required" });
    return;
  }
  const { readData: rd, writeData: wd } = await import("../../lib/dataManager.js");
  const admin = await rd<{ username: string; passwordHash: string; name: string }>("admin.json", { username: "", passwordHash: "", name: "" });
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ ok: false, error: "Current password is incorrect" });
    return;
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await wd("admin.json", { ...admin, passwordHash: hash });
  res.json({ ok: true });
});

export default router;
