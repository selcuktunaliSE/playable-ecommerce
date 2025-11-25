import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import categoryRoutes from "./routes/categories";
import productRoutes from "./routes/products";
import adminProductRoutes from "./routes/adminProducts";
import orderRoutes from "./routes/orders"
import adminCategoryRoutes from "./routes/adminCategory";
import adminUploadRoutes from "./routes/adminUpload";
import path from "path";
import adminDashboardRoutes from "./routes/adminDashboard";

import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  "/uploads",
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
  express.static(path.join(__dirname, "../uploads"))
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products",adminProductRoutes)
app.use("/api/orders", orderRoutes);
app.use("/api/admin/categories",adminCategoryRoutes)
app.use("/api/admin/upload", adminUploadRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
async function start() {
  try {
    const uri = process.env.MONGODB_URI as string;
    if (!uri) {
      throw new Error("MONGODB_URI is not set in .env");
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`✅ Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

start();
