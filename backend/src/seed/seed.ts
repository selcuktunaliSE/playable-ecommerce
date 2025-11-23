import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Category from "../models/category";
import Product from "../models/product";
import User from "../models/user";

dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI as string;
    if (!uri) throw new Error("MONGODB_URI not set");

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log("Cleared Category, Product & User collections");

    const categoriesData = [
      { name: "Laptops", slug: "laptops" },
      { name: "Monitors", slug: "monitors" },
      { name: "Keyboards", slug: "keyboards" },
      { name: "Mouse", slug: "mouse" }
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log("📁 Inserted categories");

    const slugToId = new Map<string, any>();
    categories.forEach((c: any) => slugToId.set(c.slug, c._id));

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
        numReviews: 12,
        isActive: true
      },
      {
        name: 'Business Laptop 15"',
        slug: "business-laptop-15",
        description: '15" business laptop with long battery life.',
        images: [
          "https://via.placeholder.com/600x400?text=Business+Laptop+15"
        ],
        price: 999,
        stock: 18,
        category: slugToId.get("laptops"),
        rating: 4.3,
        numReviews: 9,
        isActive: true
      },
      {
        name: 'Gaming Monitor 27" 144Hz',
        slug: "gaming-monitor-27-144hz",
        description: '27" gaming monitor with 144Hz refresh rate.',
        images: [
          "https://via.placeholder.com/600x400?text=Gaming+Monitor+27"
        ],
        price: 350,
        stock: 20,
        category: slugToId.get("monitors"),
        rating: 4.7,
        numReviews: 25,
        isActive: true
      },
      {
        name: '4K UHD Monitor 32"',
        slug: "4k-uhd-monitor-32",
        description: '32" 4K UHD monitor for creators and productivity.',
        images: [
          "https://via.placeholder.com/600x400?text=4K+UHD+Monitor+32"
        ],
        price: 550,
        stock: 8,
        category: slugToId.get("monitors"),
        rating: 4.4,
        numReviews: 14,
        isActive: true
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
        numReviews: 8,
        isActive: true
      },
      {
        name: "Low-profile Office Keyboard",
        slug: "low-profile-office-keyboard",
        description: "Quiet low-profile keyboard for office use.",
        images: [
          "https://via.placeholder.com/600x400?text=Office+Keyboard"
        ],
        price: 45,
        stock: 40,
        category: slugToId.get("keyboards"),
        rating: 4.0,
        numReviews: 6,
        isActive: true
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
        category: slugToId.get("mouse"),
        rating: 4.1,
        numReviews: 15,
        isActive: true
      },
      {
        name: "Gaming Mouse RGB",
        slug: "gaming-mouse-rgb",
        description: "High precision gaming mouse with RGB lighting.",
        images: [
          "https://via.placeholder.com/600x400?text=Gaming+Mouse+RGB"
        ],
        price: 60,
        stock: 25,
        category: slugToId.get("mouse"),
        rating: 4.6,
        numReviews: 21,
        isActive: true
      }
    ];

    await Product.insertMany(productsData);
    console.log("🛒 Inserted products");

    const passwordPlain = "test";
    const hashed = await bcrypt.hash(passwordPlain, 10);

    await User.insertMany([
      {
        name: "Admin",
        email: "admin@test.com",
        passwordHash: hashed,
        role: "admin"
      },
      {
        name: "User",
        email: "user@test.com",
        passwordHash: hashed,
        role: "customer"
      }
    ]);
    console.log("👤 Inserted users: admin@test.com & user@test.com (password: test)");

    console.log("✅ Seeding done");
  } catch (err) {
    console.error("❌ Seed error", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
