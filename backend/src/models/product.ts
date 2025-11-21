import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
  category: Types.ObjectId;
  rating: number;
  numReviews: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Product = model<IProduct>("Product", productSchema);

export default Product;
