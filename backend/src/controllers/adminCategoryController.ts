import { Request, Response } from "express";
import Category from "../models/category";

export const getAdminCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    res.json(categories);
  } catch (err) {
    console.error("getAdminCategories error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      isActive
    } = req.body as {
      name: string;
      slug: string;
      description?: string;
      isActive?: boolean;
    };

    if (!name || !slug) {
      return res
        .status(400)
        .json({ message: "name and slug are required" });
    }

    const existing = await Category.findOne({ slug }).lean();
    if (existing) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      description: description ?? "",
      isActive: isActive ?? true
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("createCategory error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      isActive
    } = req.body as {
      name?: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
    };

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true
    }).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error("updateCategory error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("deleteCategory error", err);
    res.status(500).json({ message: "Server error" });
  }
};
