import { Router } from "express";
import authRouter from "./auth.js";
import settingsRouter from "./settings.js";
import administrationRouter from "./administration.js";
import teachersRouter from "./teachers.js";
import certificatesRouter from "./certificates.js";
import newsRouter from "./news.js";
import galleryRouter from "./gallery.js";
import studentsRouter from "./students.js";
import admissionsRouter from "./admissions.js";
import contactRouter from "./contact.js";
import mediaRouter from "./media.js";
import uploadRouter from "./upload.js";
import dashboardRouter from "./dashboard.js";

const router = Router();

router.use(authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/settings", settingsRouter);
router.use("/administration", administrationRouter);
router.use("/teachers", teachersRouter);
router.use("/certificates", certificatesRouter);
router.use("/news", newsRouter);
router.use("/gallery", galleryRouter);
router.use("/students", studentsRouter);
router.use("/admissions", admissionsRouter);
router.use("/contact", contactRouter);
router.use("/media", mediaRouter);
router.use("/upload", uploadRouter);

export default router;
