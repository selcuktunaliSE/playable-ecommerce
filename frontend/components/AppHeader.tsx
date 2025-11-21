"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { SearchBar } from "@/components/SearchBar";

export function AppHeader() {
  const { totalQuantity } = useCart();

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              playable<span className="text-orange-400">store</span>
            </span>
          </Link>
        </div>

        <div className="w-full md:flex-1">
          <SearchBar />
        </div>

        <nav className="flex items-center justify-end gap-4 text-sm mt-2 md:mt-0">
          <Link
            href="/"
            className="text-slate-300 hover:text-orange-400 transition"
          >
            Home
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition"
          >
            <span className="text-xs uppercase tracking-wide">Cart</span>
            <span className="relative inline-flex items-center justify-center">
              {/* Cart icon */}
              <span className="text-lg">🛒</span>
              {/* Badge */}
              <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-[10px] font-semibold text-slate-950 flex items-center justify-center">
                {totalQuantity}
              </span>
            </span>
          </Link>

          <Link
            href="/profile"
            className="text-slate-300 hover:text-orange-400 transition"
          >
            Profile
          </Link>
          <Link
            href="/admin"
            className="text-slate-300 hover:text-orange-400 transition"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
