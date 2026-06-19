import app from "./app";
import { logger } from "./lib/logger";

// Replit majburlayotgan portni inkor qilib, qat'iy boshqa bo'sh port (masalan 5001) beramiz
// Replit-da PORT doim 8080 keladi va u band bo'ladi.
// Agar port 8080 bo'lsa yoki umuman berilmagan bo'lsa, Replit uchun 5001 ni oladi.
// Vercel-da esa o'zi bergan boshqa dinamik portni ishlatadi.
const rawPort = process.env["PORT"];
const port = (rawPort && rawPort !== "8080") ? Number(rawPort) : 5001;

// Express listen funksiyasi
const server = app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});