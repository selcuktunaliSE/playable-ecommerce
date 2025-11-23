import { Request, Response } from "express";
import Product from "../models/product";
import Category from "../models/category";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "12",
      q,
      categorySlug,
      minPrice,
      maxPrice,
      minRating,
      sort
    } = req.query;

    const filters: any = {};
    filters.isActive = true;
    filters.stock = { $gt: 0 };

    if (q && typeof q === "string") {
      filters.name = { $regex: q, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      filters.rating = { $gte: Number(minRating) };
    }

    if (
      categorySlug &&
      typeof categorySlug === "string" &&
      categorySlug !== "all"
    ) {
      const category = await Category.findOne({ slug: categorySlug }).lean();
      if (category) {
        filters.category = category._id;
      } else {
        return res.json({
          items: [],
          total: 0,
          page: Number(page),
          pages: 0
        });
      }
    }

    // Sort
    const sortObj: any = {};
    if (sort === "price-asc") sortObj.price = 1;
    if (sort === "price-desc") sortObj.price = -1;
    if (sort === "rating") sortObj.rating = -1;
    if (sort === "newest") sortObj.createdAt = -1;
    if (sort === "sales") sortObj.salesCount = -1;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filters)
        .populate("category")
        .sort(sortObj)
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
    console.error("getProducts error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("category").lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isActive || (product.stock ?? 0) <= 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("getProductById error", err);
    res.status(500).json({ message: "Server error" });
  }
};

