import { Request, Response } from "express";
import Category from "../models/category";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json(categories);
  } catch (err) {
    console.error("getCategories error", err);
    res.status(500).json({ message: "Server error" });
  }
};
