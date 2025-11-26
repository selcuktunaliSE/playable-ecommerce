import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Product from "../models/product";
import Order from "../models/order";
import mongoose from "mongoose";

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
        options?: { name: string; value: string }[];
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
      return res.status(400).json({ message: "Unsupported payment method" });
    }

    if (
      !paymentDetails ||
      !paymentDetails.cardNumber ||
      !paymentDetails.cvc ||
      !paymentDetails.expiry
    ) {
      return res.status(400).json({ message: "Payment details incomplete" });
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
    let subtotal = 0; 

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
        if (valDef) {
          optionPriceDeltaTotal += Number(valDef.priceDelta ?? 0);
        }
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

      subtotal += finalPrice * quantity;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "No valid products found" });
    }

    for (const oi of orderItems) {
      await Product.updateOne(
        { _id: oi.product },
        { $inc: { stock: -oi.quantity, salesCount: oi.quantity } }
      );
    }

    let shippingFee = 0;
    if (subtotal > 0) {
        const country = shippingAddress.country;
        if (country === "Turkiye" || country === "Türkiye") {
            shippingFee = 5;
        } else if (country === "United States") {
            shippingFee = 15;
        } else {
            shippingFee = 10; 
        }
    }

    const taxAmount = subtotal * 0.18;
    const finalTotal = subtotal + shippingFee + taxAmount;

    const tempId = new mongoose.Types.ObjectId();
    const shortCode = tempId.toString().slice(-6);

    const orderData: any = {
      _id: tempId,
      user: userId || undefined,
      items: orderItems,
      shippingAddress,
      paymentStatus: "paid",
      status: "pending",
      totalAmount: finalTotal, 
      shortCode: shortCode,
      paymentInfo: {
        method: "card",
        last4: paymentDetails.cardNumber.slice(-4)
      }
    };

    const order = await Order.create(orderData);
    console.log(`✅ Order created: ${order._id}, Total: $${finalTotal.toFixed(2)}`);
    
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Order not found (invalid ID)" });
    }

    const order = await Order.findById(id).populate("items.product").lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
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