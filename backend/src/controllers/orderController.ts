import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Product from "../models/product";
import Order from "../models/order";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const bodyUserId = (req.body as any).userId;
    const userId = req.userId || bodyUserId;

    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails
    } = req.body as {
      items: Array<{
        productId?: string;
        product?: string;
        _id?: string;
        quantity?: number;
        name?: string;
        image?: string;
        options?: { name: string; value: string }[]; // ⭐ seçilen opsiyonlar
      }>;
      shippingAddress: {
        fullName: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        postalCode: string;
        country: string;
      };
      paymentMethod?: string;
      paymentDetails?: {
        cardName?: string;
        cardNumber?: string;
        expiry?: string;
        cvc?: string;
      };
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res
        .status(400)
        .json({ message: "Shipping address is incomplete" });
    }

    const pm = paymentMethod ?? "card";
    if (pm !== "card") {
      return res
        .status(400)
        .json({ message: "Unsupported payment method in this demo" });
    }

    if (
      !paymentDetails ||
      !paymentDetails.cardName ||
      !paymentDetails.cardNumber ||
      !paymentDetails.expiry ||
      !paymentDetails.cvc
    ) {
      return res
        .status(400)
        .json({ message: "Payment details are incomplete" });
    }

    const sanitizedCardNumber = paymentDetails.cardNumber.replace(/\s+/g, "");

    if (!/^\d{16}$/.test(sanitizedCardNumber)) {
      return res.status(400).json({ message: "Invalid card number" });
    }

    if (!/^\d{3}$/.test(paymentDetails.cvc.trim())) {
      return res.status(400).json({ message: "Invalid CVC" });
    }

    const expiryMatch = paymentDetails.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      return res.status(400).json({ message: "Invalid expiry date format" });
    }
    const month = Number(expiryMatch[1]);
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid expiry month" });
    }

    const productIds = items
      .map((i) => i.productId || i.product || i._id)
      .filter(Boolean) as string[];

    const products = await Product.find({
      _id: { $in: productIds }
    }).lean();

    const productMap = new Map(
      products.map((p: any) => [p._id.toString(), p])
    );

    const orderItems: any[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const productId = (item.productId || item.product || item._id) as string;
      const product = productMap.get(productId);

      if (!product) continue;

      const quantity = Number(item.quantity ?? 1);
      const basePrice = Number(product.price ?? 0);

      let optionPriceDeltaTotal = 0;
      const selectedOptions = Array.isArray(item.options) ? item.options : [];
      const productOptions = Array.isArray((product as any).options)
        ? (product as any).options
        : [];

      for (const selected of selectedOptions) {
        const optDef = productOptions.find(
          (o: any) => o.name === selected.name
        );
        if (!optDef || !Array.isArray(optDef.values)) continue;

        const valDef = optDef.values.find(
          (v: any) => v.value === selected.value
        );
        if (!valDef) continue;

        optionPriceDeltaTotal += Number(valDef.priceDelta ?? 0);
      }

      const finalPrice = basePrice + optionPriceDeltaTotal;

      orderItems.push({
        product: product._id,
        name: item.name || product.name,
        price: finalPrice,
        quantity,
        image: item.image || product.images?.[0],
        options: selectedOptions.length > 0 ? selectedOptions : undefined
      });

      totalAmount += finalPrice * quantity;
    }

    if (orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid products found in cart" });
    }

    // Stok kontrolü
    for (const oi of orderItems) {
      const p = productMap.get(oi.product.toString());
      const currentStock = Number((p as any)?.stock ?? 0);

      if (currentStock < oi.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${oi.name}. Available: ${currentStock}, requested: ${oi.quantity}`
        });
      }
    }

    // Stok düş
    for (const oi of orderItems) {
      await Product.updateOne(
        { _id: oi.product },
        { $inc: { stock: -oi.quantity } }
      );
    }

    const orderData: any = {
      items: orderItems,
      shippingAddress,
      paymentStatus: "paid",
      status: "pending",
      totalAmount,
      paymentInfo: {
        method: "card",
        last4: sanitizedCardNumber.slice(-4)
      }
    };

    if (userId) {
      orderData.user = userId;
      console.log("createOrder attaching user to order:", userId);
    } else {
      console.log("createOrder: NO userId, saving as guest order");
    }

    // 🔥 Sales count arttır
    for (const oi of orderItems) {
      await Product.updateOne(
        { _id: oi.product },
        { $inc: { salesCount: oi.quantity } }
      );
    }

    const order = await Order.create(orderData);
    console.log("createOrder DONE. Saved order id:", order._id);
    res.status(201).json(order);
  } catch (err) {
    console.error("createOrder error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error("getMyOrders error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("items.product")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!userId && req.userRole !== "admin") {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (
      order.user &&
      userId &&
      order.user.toString() !== userId &&
      req.userRole !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json(order);
  } catch (err) {
    console.error("getOrderById error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const publicTrackOrder = async (req: Request, res: Response) => {
  try {
    const rawCode = String(req.params.code || "");
    const code = rawCode.trim().replace(/^#/, "").toLowerCase();

    if (!code) {
      return res.status(400).json({ message: "Order code is required" });
    }

    let order: any = null;

    if (/^[0-9a-f]{24}$/.test(code)) {
      order = await Order.findById(code).lean();
    }

    if (!order && /^[0-9a-f]{6}$/.test(code)) {
      order = await Order.findOne({ shortCode: code }).lean();
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      id: order._id.toString(),
      createdAt: order.createdAt,
      shortCode: order.shortCode,
      paymentStatus: order.paymentStatus,
      status: order.status || "pending",
      totalAmount: order.totalAmount,
      shippingName: order.shippingAddress?.fullName ?? "Customer"
    });
  } catch (err) {
    console.error("publicTrackOrder error", err);
    return res.status(500).json({ message: "Server error" });
  }
};