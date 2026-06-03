import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    adminUsername?: string;
    adminName?: string;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.adminUsername) {
    next();
  } else {
    res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}
