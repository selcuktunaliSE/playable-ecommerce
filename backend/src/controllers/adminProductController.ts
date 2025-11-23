import { Request, Response } from "express";
import Product from "../models/product";
import Category from "../models/category";

export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "50", q, categoryId } = req.query;

    const filters: any = {};

    if (q && typeof q === "string") {
      filters.name = { $regex: q, $options: "i" };
    }

    if (categoryId && typeof categoryId === "string") {
      filters.category = categoryId;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filters)
        .populate("category")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filters)
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error("getAdminProducts error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      categoryId,
      price,
      stock,
      description,
      images,
      isActive
    } = req.body as {
      name: string;
      slug: string;
      categoryId: string;
      price: number;
      stock: number;
      description?: string;
      images?: string[];
      isActive?: boolean;
    };

    if (!name || !slug || !categoryId || price == null || stock == null) {
      return res
        .status(400)
        .json({ message: "name, slug, categoryId, price, stock are required" });
    }

    const category = await Category.findById(categoryId).lean();
    if (!category) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const product = await Product.create({
      name,
      slug,
      category: categoryId,
      price,
      stock,
      description: description ?? "",
      images: images ?? [],
      isActive: isActive ?? true
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      categoryId,
      price,
      stock,
      description,
      images,
      isActive
    } = req.body as {
      name?: string;
      slug?: string;
      categoryId?: string;
      price?: number;
      stock?: number;
      description?: string;
      images?: string[];
      isActive?: boolean;
    };

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (categoryId !== undefined) updateData.category = categoryId;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = images;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true
    }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("updateProduct error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const bulkUpdateProductStatus = async (req: Request, res: Response) => {
  try {
    const { ids, isActive } = req.body as {
      ids: string[];
      isActive: boolean;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product ids provided" });
    }

    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );

    res.json({
      message: `Updated ${ids.length} product(s)`,
      isActive
    });
  } catch (err) {
    console.error("bulkUpdateProductStatus error", err);
    res.status(500).json({ message: "Server error" });
  }
};
