import { Router } from "express";
import Order from "../models/order";
import Product from "../models/product";
import { auth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", auth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .lean(); 

    res.json(orders);
  } catch (err) {
    console.error("GET /admin/orders error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch(
  "/:id/status",
  auth,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body as { status?: string };

      const allowed = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ];
      if (!status || !allowed.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status value.", allowed });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      const oldStatus = order.status;
      order.status = status as any;
      await order.save();

       if (status === "cancelled" && oldStatus !== "cancelled") {
         for (const oi of order.items as any[]) {
           await Product.updateOne(
             { _id: oi.product },
             {
               $inc: {
                 stock: oi.quantity,
                 salesCount: -oi.quantity
      }
      }
           );
         }
       }

      return res.json(order);
    } catch (err) {
      console.error("PATCH /admin/orders/:id/status error", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


export default router;
