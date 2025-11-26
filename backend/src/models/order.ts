import mongoose, { Schema, Document, Types } from "mongoose";

interface IOrderItemOption {
  name: string;  // "Color"
  value: string; // "Blue Titanium"
}

interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: IOrderItemOption[];
}

interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  user?: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  paymentInfo?: {
    method?: string;
    last4?: string;
  };
  shortCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String },
    options: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true }
      }
    ]
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed","refunded"],
      default: "paid"
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    totalAmount: { type: Number, required: true },

    paymentInfo: {
      method: { type: String },
      last4: { type: String }
    },

    shortCode: {
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  const doc = this as IOrder;

  if (!doc.shortCode && doc._id) {
    const hex = doc._id.toString();
    doc.shortCode = hex.slice(-6);
  }

  next();
});

export default mongoose.model<IOrder>("Order", orderSchema);