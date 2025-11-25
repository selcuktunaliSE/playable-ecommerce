"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import Link from "next/link";

const STORAGE_KEY = "playable_ecommerce_auth";
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

export default function CheckoutPage() {
  const { user, token } = useAuth();

  const cart = useCart() as any;
  const items = cart.items ?? cart.cartItems ?? [];
  const clearCart = cart.clearCart ?? cart.reset ?? (() => {});
  const cartTotal =
  cart.total ??
  cart.totalAmount ??
  items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
    0
  );

const subtotal = Number(cartTotal) || 0;

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Turkiye");
  let shippingFee = 0;

if (subtotal > 0) {
  if (country === "Turkiye") {
    shippingFee = 5;
  } else if (country === "United States") {
    shippingFee = 15;
  } else {
    shippingFee = 10;
  }
}

const TAX_RATE = 0.18;
const taxAmount = subtotal * TAX_RATE;
const orderTotal = subtotal + shippingFee + taxAmount;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setOrderId(null);

    if (!items || items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!API_BASE_URL) {
      setError("API base URL is not configured.");
      return;
    }

    if (!fullName || !addressLine1 || !city || !postalCode || !country) {
      setError("Please fill in all required address fields.");
      return;
    }

    const cardDigits = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cardDigits)) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }

    if (!/^\d{3}$/.test(cvc)) {
      setError("Please enter a valid 3-digit CVC.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Please enter a valid expiry date (MM/YY).");
      return;
    }
    const [mmStr] = expiry.split("/");
    const mm = Number(mmStr);
    if (mm < 1 || mm > 12) {
      setError("Expiry month must be between 01 and 12.");
      return;
    }

    if (!cardName) {
      setError("Please enter the name on card.");
      return;
    }

    setLoading(true);

    try {
      let authToken: string | undefined = token || undefined;
      let bodyUserId: string | undefined =
        (user as any)?.id ?? (user as any)?._id ?? undefined;

      if ((!authToken || !bodyUserId) && typeof window !== "undefined") {
        try {
          const stored = window.localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as {
              user?: { id?: string; _id?: string };
              token?: string;
            };

            if (!authToken && parsed.token) {
              authToken = parsed.token;
            }

            if (!bodyUserId && parsed.user) {
              bodyUserId = parsed.user.id ?? parsed.user._id;
            }
          }
        } catch {
          
        }
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      console.log("CHECKOUT final headers:", headers);

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: bodyUserId,
          items: items.map((item: any) => ({
            productId: item.productId ?? item.id ?? item._id,
            quantity: item.quantity ?? 1,
            name: item.name,
            image: item.image
          })),
          shippingAddress: {
            fullName,
            addressLine1,
            addressLine2,
            city,
            postalCode,
            country
          },
          paymentMethod: "card",
          paymentDetails: {
            cardName,
            cardNumber,
            expiry,
            cvc
          }
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to place order.");
      }

      const order = await res.json();
      console.log("ORDER CREATED:", order);

      const createdId = order.shortCode
      setOrderId(createdId ?? null);

      clearCart();
      setSuccess("Your order has been placed successfully. Your order ID is below.");
      
    } catch (err: any) {
      console.error("Order error:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        Checkout
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-2">
            Shipping address
          </h2>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Address line 1</label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">
              Address line 2 (optional)
            </label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Postal code</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="space-y-1">
            <label className="text-xs text-slate-300">Country</label>
            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="Turkiye">Türkiye</option>
              <option value="Germany">Germany</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="France">France</option>
            </select>
          </div>

          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Payment details
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">
                Name on card
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
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
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
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
                  value={expiry}
                  onChange={(e) =>
                    setExpiry(formatExpiry(e.target.value))
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
                  value={cvc}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setCvc(digits);
                  }}
                  maxLength={3}
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 mt-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 mt-2">{success}</p>
          )}

          {orderId && (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-3 space-y-2">
              <p className="text-xs text-slate-300">
                Your order ID (keep this to track your order):
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-slate-900 px-3 py-2 text-xs text-orange-300 border border-slate-700">
                  {orderId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="px-3 py-1.5 rounded-full bg-slate-800 text-[11px] text-slate-100 hover:bg-slate-700 transition"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                You can track this order on the{" "}
                <Link
                  href={`/order-tracking?orderId=${orderId}`}
                  className="text-orange-400 hover:text-orange-300 hover:underline"
                >
                  Order Tracking
                </Link>{" "}
                page using this ID.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-orange-500 text-sm font-semibold text-slate-950 shadow-sm hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">
                Your cart is empty.
              </p>
            ) : (
              items.map((item: any) => (
                <div
                  key={item.productId ?? item.id ?? item._id}
                  className="flex justify-between text-xs text-slate-200"
                >
                  <span className="line-clamp-1">
                    {item.name} × {item.quantity ?? 1}
                  </span>
                  <span>
                    $
                    {(
                      Number(item.price ?? 0) *
                      Number(item.quantity ?? 1)
                    ).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-200">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Shipping</span>
              <span>{shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : "$0.00"}</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Tax (18%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-100 pt-2 border-t border-slate-800 mt-2">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
          </div>

         <p className="text-[11px] text-slate-500">
        Shipping fees are estimated based on your selected country
        ($5 for Türkiye, $10 for EU countries,
        and $15 for the United States)

        </p>
         <p className="text-[11px] text-slate-500">
        This is a demo checkout – a valid-looking card number will simulate
        a successful payment.
         </p>
        </aside>
      </div>
    </div>
  );
}
