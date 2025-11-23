"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

export default function CheckoutPage() {
  const router = useRouter();
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

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Turkey");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!items || items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            items: items.map((item: any) => ({
              productId:
                item.productId ?? item.id ?? item._id,
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
            }
          })
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to place order.");
      }

      const order = await res.json();
      clearCart();
      setSuccess("Your order has been placed successfully.");

      if (user) {
        router.push("/profile");
      } else {
        router.push("/");
      }
    } catch (err: any) {
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
            <label className="text-xs text-slate-300">Address line 2 (optional)</label>
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
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 mt-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 mt-2">{success}</p>
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

          <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>${Number(cartTotal).toFixed(2)}</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Payment is processed as a dummy service in this case study.
            Your order will be marked as <span className="text-emerald-400">paid</span>{" "}
            automatically.
          </p>
        </aside>
      </div>
    </div>
  );
}
