import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById
} from "../controllers/orderController";
import { auth, optionalAuth } from "../middleware/auth";

const router = Router();
router.post("/", optionalAuth, createOrder);

router.get("/my", auth, getMyOrders);

router.get("/:id", auth, getOrderById);

export default router;
