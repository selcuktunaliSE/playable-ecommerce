import { Router } from "express";
import { cacheGet } from "../middleware/cache";
import { getProducts, getProductById } from "../controllers/productController";

const router = Router();

router.get("/", cacheGet(30_000), getProducts);
router.get("/:id", getProductById);

export default router;
