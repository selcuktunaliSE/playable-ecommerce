import { Router } from "express";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/adminCategoryController";

const router = Router();

router.get("/", getAdminCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
