import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: "customer" | "admin";
}

type JwtPayload = {
  userId?: string;
  id?: string;
};

function extractUserIdFromToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const userId = payload.userId || payload.id || null;
    return userId;
  } catch (err) {
    console.error("extractUserIdFromToken error:", err);
    return null;
  }
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.substring(7);

  try {
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (err) {
    console.error("auth error", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);
    if (user) {
      req.userId = user.id;
      req.userRole = user.role;
      console.log("optionalAuth attached user:", user.id, user.email);
    } else {
      console.log("optionalAuth: user not found for id", userId);
    }
  } catch (err) {
    console.warn("optionalAuth: invalid token, ignoring", err);
  }

  return next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("requireAdmin userRole:", req.userRole);
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};
