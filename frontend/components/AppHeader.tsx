"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";

export function AppHeader() {
  const { totalQuantity } = useCart();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center text-xs font-bold text-slate-950">
            PF
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              Playable Shop
            </span>
            <span className="text-[11px] text-slate-400">
              Interactive ecommerce demo
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/category/all"
            className="text-slate-300 hover:text-orange-300"
          >
            All products
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-slate-200 hover:text-orange-300"
          >
            <span className="text-xs uppercase tracking-wide">Cart</span>
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-slate-800 text-[11px] font-semibold">
              {totalQuantity}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
