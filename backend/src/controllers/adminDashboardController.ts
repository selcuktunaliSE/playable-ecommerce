import { Request, Response } from "express";
import Order from "../models/order";
import User from "../models/user";
import Product from "../models/product";

type RangeKey = "7d" | "14d" | "1m" | "6m" | "all";

function getRangeDates(range: RangeKey) {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  if (range === "all") {
    return { from: null, to };
  }

  const from = new Date(to);
  switch (range) {
    case "7d":
      from.setDate(from.getDate() - 6);
      break;
    case "14d":
      from.setDate(from.getDate() - 13);
      break;
    case "1m":
      from.setMonth(from.getMonth() - 1);
      break;
    case "6m":
      from.setMonth(from.getMonth() - 6);
      break;
  }
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const rangeParam = (req.query.range as RangeKey) || "7d";
    const validRanges: RangeKey[] = ["7d", "14d", "1m", "6m", "all"];
    const range: RangeKey = validRanges.includes(rangeParam)
      ? rangeParam
      : "7d";

    const { from, to } = getRangeDates(range);

    const dateMatch: any = {};
    if (from) {
      dateMatch.createdAt = { $gte: from, $lte: to };
    }

    const paidMatch = {
      ...dateMatch,
      paymentStatus: "paid"
    };

    const [
      orderCount,
      customerCount,
      pendingOrders,
      totalSalesAgg,
      recentOrdersRaw,
      popularProducts,
      salesByDateAgg,
      statusCountsAgg
    ] = await Promise.all([

      Order.countDocuments(dateMatch),

      User.countDocuments({}),

      Order.countDocuments({
        ...dateMatch,
        paymentStatus: "pending"
      }),

      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]),

      Order.find(dateMatch)
        .sort({ createdAt: -1 })
        .limit(13)
        .populate("user")
        .lean(),

      Product.find({ isActive: true })
        .sort({ salesCount: -1 })
        .limit(5)
        .select("name price images salesCount")
        .lean(),

      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            total: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      Order.aggregate([
        {
          $group: {
            _id: "$paymentStatus",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    const totalSales = totalSalesAgg[0]?.total ?? 0;

    const recentOrders = recentOrdersRaw.map((order: any) => {
      const u = order.user as any | undefined;

      const userId = u?._id ? String(u._id) : null;

      const userName =
        u?.name ||
        u?.fullName ||
        (u?.firstName && u?.lastName
          ? `${u.firstName} ${u.lastName}`
          : null) ||
        order.shippingAddress?.fullName ||
        "Guest";

      const userEmail = u?.email || "";

      return {
        _id: order._id,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        userId,    
        userName,
        userEmail,
        itemsCount: Array.isArray(order.items) ? order.items.length : 0
      };
    });

    const salesByDate = salesByDateAgg.map((row: any) => ({
      date: row._id,
      total: row.total
    }));

    const orderStatusCounts = statusCountsAgg.map((row: any) => ({
      status: row._id || "unknown",
      count: row.count
    }));

    return res.json({
      selectedRange: range,
      stats: {
        totalSales,
        orderCount,
        customerCount,
        pendingOrders
      },
      recentOrders,
      popularProducts,
      salesByDate,
      orderStatusCounts
    });
  } catch (err) {
    console.error("getAdminDashboard error", err);
    return res.status(500).json({ message: "Server error" });
  }
};
