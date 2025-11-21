import { Router } from "express";
import Product from "../models/product";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deactivated", product });
  } catch (err) {
    console.error("soft delete product error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
