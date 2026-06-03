import { Router, type IRouter } from "express";
import { readData } from "../lib/dataManager.js";

const router: IRouter = Router();

router.get("/settings", async (_req, res) => {
  const data = await readData("settings.json", {});
  res.json({ ok: true, data });
});

router.get("/contact", async (_req, res) => {
  const data = await readData("contact.json", {});
  res.json({ ok: true, data });
});

router.get("/administration", async (_req, res) => {
  const data = await readData<unknown[]>("administration.json", []);
  res.json({ ok: true, data });
});

router.get("/teachers", async (_req, res) => {
  const data = await readData<unknown[]>("teachers.json", []);
  res.json({ ok: true, data });
});

router.get("/certificates", async (_req, res) => {
  const data = await readData<unknown[]>("certificates.json", []);
  res.json({ ok: true, data });
});

router.get("/news", async (req, res) => {
  const all = await readData<Array<Record<string, unknown>>>("news.json", []);
  let items = all.filter((n) => n["status"] === "published");
  if (req.query["featured"] === "true") {
    items = items.filter((n) => n["featured"] === true);
  }
  items.sort((a, b) => String(b["publishDate"] ?? "").localeCompare(String(a["publishDate"] ?? "")));
  res.json({ ok: true, data: items });
});

router.get("/news/:slug", async (req, res) => {
  const all = await readData<Array<Record<string, unknown>>>("news.json", []);
  const item = all.find((n) => n["slug"] === req.params["slug"] && n["status"] === "published");
  if (!item) {
    res.status(404).json({ ok: false, error: "Not found" });
    return;
  }
  res.json({ ok: true, data: item });
});

router.get("/gallery", async (_req, res) => {
  const data = await readData<unknown[]>("gallery.json", []);
  res.json({ ok: true, data });
});

router.get("/students", async (_req, res) => {
  const data = await readData<unknown[]>("students.json", []);
  res.json({ ok: true, data });
});

router.get("/admissions", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("admissions.json", []);
  const sorted = [...data].sort(
    (a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0),
  );
  res.json({ ok: true, data: sorted });
});

router.get("/admissions-requirements", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("admissions-requirements.json", []);
  const sorted = [...data].sort(
    (a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0),
  );
  res.json({ ok: true, data: sorted });
});

router.get("/admissions-dates", async (_req, res) => {
  const data = await readData<Array<Record<string, unknown>>>("admissions-dates.json", []);
  const sorted = [...data].sort(
    (a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0),
  );
  res.json({ ok: true, data: sorted });
});

export default router;
