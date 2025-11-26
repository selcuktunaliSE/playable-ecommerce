# Playable E-Commerce Platform

This repository contains the source code for the **Playable E-Commerce Platform**, developed as a software engineer case study. It is a modern, full-stack e-commerce application designed to provide a seamless shopping experience for customers and a powerful management dashboard for administrators.

---

## 📖 Project Description

The goal of this project was to design and develop a **user-friendly e-commerce platform**.

The application includes:

- A robust **customer storefront** with product browsing, advanced filtering, a persistent shopping cart, and a simulation of the checkout process.
- An **admin dashboard** for visualizing key sales statistics, managing orders, inventory, and overseeing the customer base.

The project emphasizes:

- Clean code architecture  
- Real-world functionality (tax/shipping calculations, order statuses)  
- Responsive, modern UI/UX  

---

## 🌟 Main Features Overview

- **Storefront**
  - Dynamic product listing with pagination, sorting, and filtering

- **Checkout**
  - Support for both **Guest** and **Registered** user checkout flows

- **Tracking**
  - Public order tracking system using unique short codes

- **Admin Dashboard**
  - Data visualization for sales trends and order statuses

- **Management**
  - Full CRUD capabilities for products and categories

---

## 💻 Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **State Management:** React Context API (Auth, Cart, Toast contexts)
  
### Backend

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **Authentication:** JSON Web Tokens (JWT) & BCrypt  
- **Security:** Helmet, CORS  

---

## 🛠️ Installation Instructions

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js:** v18.0.0 or higher  
- **MongoDB:** Local MongoDB instance or MongoDB Atlas connection string  

---

### 1. Clone the Repository

```bash
git clone https://github.com/selcuktunaliSE/playable-ecommerce.git
cd playable-ecommerce
```


## 2. Backend Setup

Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a .env file in the backend directory (see Environment Configuration below).

3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the frontend directory.

---

## ⚙️ Environment Configuration

You must configure environment variables for both applications to communicate.

### Backend (`backend/.env`)

Copy the contents below into `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@your-cluster.mongodb.net/playable-ecommerce
JWT_SECRET=your_secure_random_secret_key
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000
```


## Frontend (frontend/.env.local)

Copy the contents below into frontend/.env.local:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

--- 
## 🌱 Database Seeding (Important)

To populate the database with the required 15 products, multiple images, options, test users, and 12 diverse orders, run the seed script.

Make sure your backend/.env file has a valid MONGODB_URI.

Run the following command from the backend directory:

# Inside /backend directory
```bash
npm run seed
```

# Alternative using ts-node directly:
```bash
npx ts-node src/seed/seed.ts
```

Output should confirm: "✅ Seed completed successfully..."

---

## ▶️ Running the Application

You need to run both the backend and frontend servers simultaneously.

## 1. Start Backend Server
```bash
cd backend
npm run dev
```

# Server runs on http://localhost:4000


## 2. Start Frontend Server

Open a new terminal window:

cd frontend
npm run dev
# Frontend runs on http://localhost:3000

---

🔐 Demo Credentials

Use these accounts to test the application features:

# Role : Admin

Email : admin@test.com  

Password : 123


# Role : Customer

Email : user@test.com

Password : 123

---

## 📡 API Documentation

# Authentication

***POST /api/auth/register - Register a new customer account.***

***POST /api/auth/login - Authenticate user and return JWT token.***

***GET /api/auth/profile - Get current authenticated user details.***

***GET /api/auth/profile/orders - Get order history for the current user.***

***POST /api/auth/change-password - Update the logged-in user's password.***

# Public Storefront

***GET /api/products - List all products (supports pagination, search, and filtering).***

***GET /api/products/:id - Get detailed information for a specific product.***

***GET /api/categories - Get a list of all active product categories.***

# Orders & Checkout

***POST /api/orders - Create a new order (supports both Guest and Registered users).***

***GET /api/orders/my - Retrieve orders for the authenticated user.***

***GET /api/orders/:id - Get detailed receipt/status for a specific order by ID.***

***GET /api/orders/track/:code - (Bonus) Track real-time order status using a public short code.***

# Admin Dashboard & Analytics

***GET /api/admin/dashboard - Get aggregated stats (Sales, Orders, Customers) filtered by date range (e.g., ?range=7d).***

### Admin Management (Protected)

# Customers

***GET /api/admin/customers - Search and list all registered customers.***

***GET /api/admin/customers/:id - View specific customer profile and lifetime value.***

# Orders

***GET /api/admin/orders - List all system orders with user details.***

***PATCH /api/admin/orders/:id/status - Update order status (e.g., shipped, delivered, cancelled). Includes logic to restore stock if cancelled.***

# Products

***GET /api/admin/products - List all products for inventory management.***

***POST /api/admin/products - Create a new product with options and images.***

***PUT /api/admin/products/:id - Update an existing product.***

***DELETE /api/admin/products/:id - Soft delete or remove a product.***

***POST /api/admin/products/bulk-status - Bulk activate/deactivate products.***

# Categories

***GET /api/admin/categories - List all product categories.***

***POST /api/admin/categories - Create a new category.***

***PUT /api/admin/categories/:id - Update an existing category.***

***DELETE /api/admin/categories/:id - Remove a category.***

# Uploads

***POST /api/admin/upload/product-image - Upload product images to the server.***

☁️ Deployment Guide

To deploy this application to a production environment (e.g., VPS, Cloud Provider, or PaaS), follow these general steps:

Build the Application:
Run the build command to compile the source code and optimize assets.

# In frontend directory
npm run build

# In backend directory
npm run build

--- 

Environment Variables:
Ensure all required environment variables (as listed in the Configuration section) are set in your production environment.

Backend: MONGODB_URI, JWT_SECRET, ALLOWED_ORIGINS (Use your production frontend URL)

Frontend: NEXT_PUBLIC_API_BASE_URL (Use your production backend URL)

Start the Server:
Start the application in production mode.

npm start


# ✅ Features List

Core Customer Features

Authentication: Login, Registration, and Profile management.

Product Discovery:

Homepage with "Popular Products" sections.

Category filtering, Price range slider, Rating filter.

Sorting (Price Low/High, Newest).

Product Interaction:

Dynamic options (Color, Storage) that update price instantly.

Image gallery and stock status display.

Shopping Cart:

Persistent cart (Local Storage).

Quantity management and item removal.

Checkout:

Calculates Subtotal, Shipping (based on Country), and Tax (18%).

Simulated payment processing.

Core Admin Features

Dashboard:

Visual charts for "Sales Over Time" and "Order Status Distribution".

Date range filtering (Last 7 days, 14 days, All time, etc.).

Product Management:

Add, Edit, Delete products with image upload support.

Stock management.

Recent Activity: List of latest orders with status indicators.

# 🎁 Bonus Features Implemented

Customer Management: A dedicated admin page to list, search, and view details of all customers and their spending history.

Guest Checkout: Customers can place orders without registering or logging in.

Public Order Tracking: An "Order Tracking" page where anyone can check delivery status using a secure 6-digit order code (no login required).

Order Delivery Simulation: Visual progress bar in the tracking page showing steps (Pending -> Processing -> Shipped -> Delivered).

Pagination: Implemented on Product Listing and Admin Sales Lists for performance.
