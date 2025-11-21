import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const createToken = (userId: string, isAdmin: boolean) => {
  return jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      isAdmin: false 
    });

    const token = createToken(user._id.toString(), user.isAdmin);

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false 
      })
      .status(201)
      .json({
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id.toString(), user.isAdmin);

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      })
      .json({
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("me error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (_req: AuthRequest, res: Response) => {
  res.clearCookie("token").json({ message: "Logged out" });
};
