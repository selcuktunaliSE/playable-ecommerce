"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useCart } from "@/contexts/cart-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CartPage() {
  const {
    items,
    totalAmount,
    totalQuantity,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);

  const [shipping, setShipping] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "Turkiye"
  });

  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });


  if (items.length === 0 && !orderPlaced) {
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

  if (items.length === 0 && orderPlaced) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Thank you for your order! 🎉
        </h1>
        <p className="text-sm text-slate-400">
          Your order has been placed successfully. This is a demo checkout, so no real payment was processed.
        </p>
        <Link
          href="/category/all"
          className="inline-flex items-center text-sm text-orange-400 hover:text-orange-300 hover:underline"
        >
          ← Continue shopping
        </Link>
      </div>
    );
  }

  const handleOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setOrderMessage(null);

    if (!API_BASE_URL) {
      setOrderError("API base URL is not configured.");
      return;
    }

    if (
      !shipping.fullName ||
      !shipping.addressLine1 ||
      !shipping.city ||
      !shipping.postalCode ||
      !shipping.country
    ) {
      setOrderError("Please fill in all required address fields.");
      return;
    }

    const cardDigits = payment.cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cardDigits)) {
      setOrderError("Please enter a valid 16-digit card number.");
      return;
    }

    if (!/^\d{3}$/.test(payment.cvc)) {
      setOrderError("Please enter a valid 3-digit CVC.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) {
      setOrderError("Please enter a valid expiry date (MM/YY).");
      return;
    }
    const [mmStr] = payment.expiry.split("/");
    const mm = Number(mmStr);
    if (mm < 1 || mm > 12) {
      setOrderError("Expiry month must be between 01 and 12.");
      return;
    }

    if (!payment.cardName) {
      setOrderError("Please enter the name on card.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items,
          shippingAddress: shipping,
          paymentMethod: "card",
          paymentDetails: payment
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to place order");
      }

      const data = await res.json();

      setOrderMessage("Your order has been placed!");
      setOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      setOrderError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="text-xs text-slate-400 hover:text-rose-300 hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900 p-3"
            >
              <div className="w-20 h-20 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                <img
                  src={
                    item.image ||
                    "https://via.placeholder.com/200x200"
                  }
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
                      ${item.price.toFixed(2)} each
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
                        updateQuantity(
                          item.productId,
                          item.quantity - 1
                        )
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
                        updateQuantity(
                          item.productId,
                          item.quantity + 1
                        )
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
            This is a demo checkout – a valid-looking card number will simulate a successful payment.
          </p>

          {!showCheckout && (
            <button
              type="button"
              className="w-full mt-2 px-4 py-2.5 rounded-full bg-orange-500 text-sm font-semibold text-slate-950 hover:bg-orange-400 transition cursor-pointer"
              onClick={() => setShowCheckout(true)}
            >
              Proceed to checkout
            </button>
          )}

          {showCheckout && (
            <form
              className="mt-4 space-y-3"
              onSubmit={handleOrderSubmit}
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  Full name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={shipping.fullName}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      fullName: e.target.value
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  Address line 1
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={shipping.addressLine1}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      addressLine1: e.target.value
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  Address line 2 (optional)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={shipping.addressLine2}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      addressLine2: e.target.value
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        city: e.target.value
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Postal code
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        postalCode: e.target.value
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  Country
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      country: e.target.value
                    }))
                  }
                  required
                >
                  <option value="Turkiye">Turkiye</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Netherlands">Netherlands</option>
                </select>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-800 space-y-2">
                <h3 className="text-xs font-semibold text-slate-200">
                  Payment details
                </h3>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Name on card
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={payment.cardName}
                    onChange={(e) =>
                      setPayment((prev) => ({
                        ...prev,
                        cardName: e.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Card number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="1234 5678 9012 3456"
                    value={payment.cardNumber}
                    onChange={(e) =>
                      setPayment((prev) => ({
                        ...prev,
                        cardNumber: formatCardNumber(e.target.value)
                      }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="12/28"
                      value={payment.expiry}
                      onChange={(e) =>
                        setPayment((prev) => ({
                          ...prev,
                          expiry: formatExpiry(e.target.value)
                        }))
                      }
                      maxLength={5} 
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">
                      CVC
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="123"
                      value={payment.cvc}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
                        setPayment((prev) => ({
                          ...prev,
                          cvc: digits
                        }));
                      }}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {orderError && (
                <p className="text-xs text-rose-400">
                  {orderError}
                </p>
              )}
              {orderMessage && (
                <p className="text-xs text-emerald-400">
                  {orderMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 px-4 py-2.5 rounded-full bg-orange-500 text-sm font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
