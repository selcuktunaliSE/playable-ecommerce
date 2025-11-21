"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";

export function FloatingCartButton() {
  const { totalQuantity } = useCart();

  if (!totalQuantity || totalQuantity <= 0) return null;

  return (
    <Link
      href="/cart"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-slate-950 text-sm font-semibold shadow-lg shadow-orange-500/30 hover:bg-orange-400 transition cursor-pointer"
    >
      <span className="text-lg">🛒</span>
      <span>{totalQuantity}</span>
    </Link>
  );
}
