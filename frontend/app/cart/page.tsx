"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
  const {
    items,
    totalAmount,
    totalQuantity,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Your cart
        </h1>
        <p className="text-sm text-slate-400">
          Your cart is empty.
        </p>
        <Link
          href="/category/all"
          className="inline-flex items-center text-sm text-orange-400 hover:text-orange-300 hover:underline"
        >
          ← Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Your cart
          </h1>
          <p className="text-sm text-slate-400">
            {totalQuantity} item{totalQuantity !== 1 ? "s" : ""} in your cart.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-300 hover:underline cursor-pointer"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        
        <div className="space-y-3">
          {items.map((item: any) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900 p-3"
            >
              <div className="w-20 h-20 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                <img
                  src={item.image || "https://via.placeholder.com/200x200"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-50">
                      {item.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-slate-500 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 mt-2">
                  <div className="inline-flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center hover:border-slate-400"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center hover:border-slate-400"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-slate-50">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3 self-start">
          <h2 className="text-sm font-semibold text-slate-50">
            Order summary
          </h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Subtotal ({totalQuantity} item
              {totalQuantity !== 1 ? "s" : ""})
            </span>
            <span className="font-semibold text-slate-50">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            This is a demo checkout – a valid-looking card number will simulate a
            successful payment.
          </p>

          <Link
            href="/checkout"
            className="block text-center w-full mt-2 px-4 py-2.5 rounded-full bg-orange-500 text-sm font-semibold text-slate-950 hover:bg-orange-400 transition cursor-pointer"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
