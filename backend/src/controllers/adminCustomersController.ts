import { Request, Response } from "express";
import User from "../models/user";
import Order from "../models/order";

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const filter: any = { role: { $ne: "admin" } };

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
    
    const customers = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          orderCount: { $size: "$orders" },
          totalSpent: { $sum: "$orders.totalAmount" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(customers);
  } catch (err) {
    console.error("getCustomers error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-passwordHash").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .select("shortCode totalAmount status paymentStatus createdAt items")
      .lean();

    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

    res.json({
      ...user,
      orders: orders.map(o => ({
        ...o,
        itemsCount: o.items ? o.items.length : 0
      })),
      stats: {
        totalSpent,
        averageOrderValue,
        lastOrderDate
      }
    });
  } catch (err) {
    console.error("getCustomerDetails error", err);
    res.status(500).json({ message: "Server error" });
  }
};