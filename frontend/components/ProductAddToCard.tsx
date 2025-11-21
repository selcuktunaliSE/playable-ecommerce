"use client";

import { useCart } from "@/contexts/cart-context";

type ProductAddToCartProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
};

export function ProductAddToCart({
  productId,
  name,
  price,
  image,
  stock
}: ProductAddToCartProps) {
  const { addItem } = useCart();

  const handleClick = () => {
    if (stock <= 0) return;
    addItem({ productId, name, price, image }, 1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={stock <= 0}
      className="
        w-full md:w-auto px-6 py-2.5 rounded-full
        bg-orange-500 text-sm font-semibold text-slate-950
        shadow-sm
        hover:bg-orange-400 hover:shadow-lg hover:-translate-y-[1px]
        hover:ring-2 hover:ring-orange-400/70 hover:ring-offset-2 hover:ring-offset-slate-950
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:hover:ring-0
        cursor-pointer
        transition-transform transition-shadow duration-150
      "
    >
      {stock > 0 ? "Add to cart" : "Out of stock"}
    </button>
  );
}
