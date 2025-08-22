import { Request, Response, NextFunction, RequestHandler } from "express";

const toOrigin = (url?: string) => {
  try {
    return url ? new URL(url).origin : "";
  } catch {
    return "";
  }
};

export const accessControlMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === "/ping") return next();

  // Exact origin match; startsWith let "https://app.vercel.app.evil.com" through
  const origin = toOrigin(req.headers.origin || req.headers.referer);

  if (origin && origin === toOrigin(process.env.FRONTEND_URL)) {
    return next();
  }

  res.status(403).json({ message: "Forbidden: You don't have access to this API" });
};
