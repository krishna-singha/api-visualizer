import { Request, Response, NextFunction, RequestHandler } from "express";

export const accessControlMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === "/ping") return next();

  const origin = req.headers.origin || req.headers.referer;

  if (origin && origin.startsWith(process.env.FRONTEND_URL!)) {
    return next();
  }

  res.status(403).json({ message: "Forbidden: You don't have access to this API" });
};
