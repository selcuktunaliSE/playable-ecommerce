import { Schema, model, Document, Types } from "mongoose";

export interface IProductOptionValue {
  value: string;
  priceDelta?: number; // örn. Storage için +fiyat farkı
}

export interface IProductOption {
  name: string; // "Color", "Storage" vb.
  values: IProductOptionValue[];
}

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
  isActive: boolean;
  salesCount: number;

  // ⭐ Bazı ürünlerde olacak, bazılarında olmayacak
  options?: IProductOption[];
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    price: { type: Number, required: true }, // base price
    stock: { type: Number, required: true, default: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    salesCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // ⭐ Opsiyonel: Color / Storage vs
    options: [
      {
        name: { type: String, required: true },
        values: [
          {
            value: { type: String, required: true },
            priceDelta: { type: Number, default: 0 }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

const Product = model<IProduct>("Product", productSchema);

export default Product;