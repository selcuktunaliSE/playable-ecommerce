import { Router, Request, Response } from "express";
import { auth, requireAdmin } from "../middleware/auth";
import { uploadProductImage } from "../middleware/upload";

const router = Router();

const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:4000";

router.post(
  "/product-image",
  auth,
  requireAdmin,
  uploadProductImage,
  (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const url = `${APP_BASE_URL}/uploads/products/${file.filename}`;
    return res.json({ url });
  }
);

export default router;
