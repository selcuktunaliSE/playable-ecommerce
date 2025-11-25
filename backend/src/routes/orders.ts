  import { Router } from "express";
  import {
    createOrder,
    getMyOrders,
    getOrderById,
    publicTrackOrder
  } from "../controllers/orderController";
  import { auth, optionalAuth } from "../middleware/auth";

  const router = Router();

  router.post("/", optionalAuth, createOrder);

  router.get("/my", auth, getMyOrders);

  router.get("/track/:code", publicTrackOrder);

  router.get("/:id", auth, getOrderById);


  export default router;
