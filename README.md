# Playable E-commerce Case Study

This is a small ecommerce app I built as a technical case study for Playable.

## Tech Stack

**Backend**

- Node.js, TypeScript
- Express
- MongoDB + Mongoose
- dotenv, cors

 **Frontend**

- Next.js 16 (App Router, Server Components)
- TypeScript
- Tailwind CSS
- React Context + `localStorage` for cart state


## What I Implemented

### Backend

- `Category` and `Product` models
- Soft delete:
  - Products are never hard-deleted, only marked with `isActive = false`
- Product listing with:
  - Pagination: `page`, `limit`
  - Text search on name: `q`
  - Price range: `minPrice`, `maxPrice`
  - Minimum rating: `minRating`
  - Category filter by slug: `categorySlug`
  - Sorting:  
    `sort = newest | price-asc | price-desc | rating`
- Product detail endpoint:
  - `GET /api/products/:id` returns a single product with its category populated

### Frontend

- Dark UI with orange accents (inspired by Playable’s website)
- Landing page:
  - “Shop by Category” section
  - “Top rated products” section
- Category pages: `/category/[slug]`
  - `all` category to browse the full catalog
  - Sorting controls:
    - newest  
    - price (asc/desc)  
    - rating
  - Responsive grid with product cards
- Product detail page: `/product/[id]`
  - Large hero image
  - Price, rating, reviews count, stock info
  - Breadcrumb navigation back to category / home
  - “Add to cart” button with hover states that match the theme
- Cart:
  - Global cart state with React Context
  - Cart is persisted in `localStorage` so it survives refresh
  - Header shows a cart badge with total item count
  - `/cart` page:
    - List of items with thumbnail, name, unit price
    - Quantity controls (+/−)
    - Remove item
    - Clear cart
    - Order summary with subtotal and a “Proceed to checkout” CTA  
      (this is a demo, no real payment)

---

## Why I Chose This Architecture

I tried to keep the setup simple but still representative of how I’d structure a real project:

- **Separation of concerns**  
  Backend and frontend live in their own folders (`backend/`, `frontend/`).  
  The API doesn’t know anything about React, and the frontend talks to the API via a single `NEXT_PUBLIC_API_BASE_URL`. This keeps things modular and easy to change later.

- **Familiar but modern stack**  
  Node.js + Express + MongoDB is a very common combo for small ecommerce or MVP projects.  
  On the frontend, Next.js 16 with the App Router gives me:
  - server components for data-fetching pages
  - dynamic routes for `/category/[slug]` and `/product/[id]`
  - a nice DX for building a SPA-like experience without overcomplicating the setup.

- **Soft delete instead of hard delete**  
  I added an `isActive` flag on `Product` instead of removing products from the database.  
  This is closer to real projects where you don’t want to lose data, and it makes it easy to:
  - hide deactivated products from listings
  - keep them available for future analytics or internal tools.

- **Simple state management for the cart**  
  I chose React Context + `localStorage` for the cart:
  - enough for this size of project (no Redux or extra libraries needed),
  - global state accessible from header, product pages and cart page,
  - `localStorage` keeps the cart alive across refreshes and sessions, which makes the demo feel like a real shop.

- **Playable-inspired UX**  
  I used a dark background with orange accents, simple cards and hover states to loosely match Playable’s visual style.  
  The focus was to keep the UI clean, readable and slightly “playful”, without spending all the time on pure design.

---


## Getting Started

### 1. Prerequisites

- Node.js (LTS)
- npm
- MongoDB
  - either a local MongoDB instance
  - or via Docker, for example:

    ```bash
    docker run -d \
      --name playable-mongo \
      -p 27017:27017 \
      mongo:7
    ```

---

### 2. Backend setup

```bash
cd playable-ecommerce/backend
npm install
```

Create a .env file:

MONGODB_URI=mongodb://localhost:27017/playable-ecommerce
PORT=4000

Seed initial categories and products:
npm run seed

Run the backend in dev mode:
npm run dev

### 3. Frontend setup
```bash
cd playable-ecommerce/frontend
npm install
```
Create .env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

Run the frontend:
```bash
npm run dev
```
