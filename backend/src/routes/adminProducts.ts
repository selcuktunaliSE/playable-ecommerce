import { Router } from "express";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProductStatus
} from "../controllers/adminProductController";
import { auth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(auth,requireAdmin);

router.get("/", getAdminProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/bulk-status", bulkUpdateProductStatus);

export default router;
