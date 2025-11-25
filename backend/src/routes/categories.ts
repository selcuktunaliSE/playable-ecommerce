import { Router } from "express";
import { getCategories } from "../controllers/categoryController";
import { cacheGet } from "../middleware/cache";

const router = Router();

router.get("/", cacheGet(60_000), getCategories);

export default router;
