import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, index: "text" },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true, index: true },
    collection: { type: String, required: true },
    description: { type: String, required: true, index: "text" },
    story: String,
    price: { type: Number, required: true, min: 0, index: true },
    originalPrice: Number,
    metalColor: { type: String, required: true, index: true },
    metal: String,
    gemstone: { type: String, index: true },
    style: [{ type: String, index: true }],
    occasion: [{ type: String, index: true }],
    rating: Number,
    reviews: Number,
    badge: String,
    images: [String],
    sizes: [String],
    inventory: { type: Number, default: 0 },
    isNew: Boolean,
    popularity: Number
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export const ProductModel = model("Product", productSchema);
