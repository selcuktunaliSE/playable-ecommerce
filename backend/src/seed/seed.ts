import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category";
import Product from "../models/product";

dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI as string;
    if (!uri) throw new Error("MONGODB_URI not set");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared Category & Product collections");

    const categoriesData = [
      { name: "Laptops", slug: "laptops" },
      { name: "Monitors", slug: "monitors" },
      { name: "Keyboards", slug: "keyboards" },
      { name: "Mice", slug: "mice" }
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log("Inserted categories");

    const slugToId = new Map<string, any>();
    categories.forEach(c => slugToId.set(c.slug, c._id));

    const productsData = [
      {
        name: 'UltraBook Pro 14"',
        slug: "ultrabook-pro-14",
        description: 'Lightweight 14" laptop ideal for everyday use.',
        images: [
          "https://via.placeholder.com/600x400?text=Ultrabook+Pro+14"
        ],
        price: 1200,
        stock: 10,
        category: slugToId.get("laptops"),
        rating: 4.5,
        numReviews: 12
      },
      {
        name: 'Gaming Monitor 27\" 144Hz',
        slug: "gaming-monitor-27-144hz",
        description: '27" gaming monitor with 144Hz refresh rate.',
        images: [
          "https://via.placeholder.com/600x400?text=Gaming+Monitor+27"
        ],
        price: 350,
        stock: 20,
        category: slugToId.get("monitors"),
        rating: 4.7,
        numReviews: 25
      },
      {
        name: "Mechanical Keyboard RGB",
        slug: "mechanical-keyboard-rgb",
        description: "RGB mechanical keyboard with blue switches.",
        images: [
          "https://via.placeholder.com/600x400?text=Mechanical+Keyboard"
        ],
        price: 90,
        stock: 50,
        category: slugToId.get("keyboards"),
        rating: 4.3,
        numReviews: 8
      },
      {
        name: "Wireless Mouse",
        slug: "wireless-mouse",
        description: "Ergonomic wireless mouse for work and play.",
        images: [
          "https://via.placeholder.com/600x400?text=Wireless+Mouse"
        ],
        price: 40,
        stock: 30,
        category: slugToId.get("mice"),
        rating: 4.1,
        numReviews: 15
      }
    ];

    await Product.insertMany(productsData);
    console.log("Inserted products");

    console.log("✅ Seeding done");
  } catch (err) {
    console.error("Seed error", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
