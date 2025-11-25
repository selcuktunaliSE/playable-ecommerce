"use client";

import { useState, FormEvent } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type OrderTrackResponse = {
  id: string;
  createdAt: string;
  paymentStatus: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;
  totalAmount: number;
  shippingName: string;
  shortCode?: string;
};

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OrderTrackResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);

    const raw = orderId.trim();
    if (!raw) {
      setError("Please enter an order ID.");
      return;
    }

    if (!API_BASE_URL) {
      setError("API base URL is not configured.");
      return;
    }

    const code = raw.replace(/^#/, "");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders/track/${code}`);
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || "Order not found");
      }
      const json = (await res.json()) as OrderTrackResponse;
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString();
  };

  const stepFromStatus = (status?: string) => {
    switch (status) {
      case "cancelled":
        return 0;
      case "delivered":
        return 4;
      case "shipped":
        return 3;
      case "processing":
        return 2;
      case "pending":
      default:
        return 1;
    }
  };

  const currentStep = stepFromStatus(data?.status);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Track your order
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter your order ID to see the current delivery status.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch gap-2"
      >
        <div className="flex-1 flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
            #
          </span>
          <input
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-full bg-orange-500 text-sm font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "Checking…" : "Check status"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-600 bg-rose-950/50 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
            <p className="text-xs text-slate-400">
              Order ID:{" "}
              <span className="text-slate-100 font-mono">
                {data.shortCode ? `#${data.shortCode}` : data.id}
              </span>
            </p>
            {data.shippingName && (
              <p className="text-xs text-slate-400">
                Name:{" "}
                <span className="text-slate-100">
                  {data.shippingName}
                </span>
              </p>
            )}
            <p className="text-xs text-slate-400">
              Placed at:{" "}
              <span className="text-slate-100">
                {formatDate(data.createdAt)}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              Payment:{" "}
              <span className="capitalize text-slate-100">
                {data.paymentStatus}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              Total:{" "}
              <span className="text-slate-100">
                ${data.totalAmount.toFixed(2)}
              </span>
            </p>
          </div>

          {data.status === "cancelled" ? (
            <div className="rounded-2xl border border-rose-700 bg-rose-950/40 p-4 text-xs text-rose-100">
              This order has been cancelled.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
              <h2 className="text-sm font-semibold text-slate-100">
                Delivery progress
              </h2>

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={
                      "h-6 w-6 rounded-full border flex items-center justify-center " +
                      (currentStep >= 1
                        ? "bg-orange-500 border-orange-500 text-slate-950"
                        : "border-slate-600 text-slate-400")
                    }
                  >
                    1
                  </div>
                  <span className="mt-1 text-center">
                    Order placed
                  </span>
                </div>

                <div className="flex-1 h-[2px] mx-1 bg-slate-700">
                  <div
                    className="h-[2px] bg-orange-500 transition-all"
                    style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                  />
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div
                    className={
                      "h-6 w-6 rounded-full border flex items-center justify-center " +
                      (currentStep >= 2
                        ? "bg-orange-500 border-orange-500 text-slate-950"
                        : "border-slate-600 text-slate-400")
                    }
                  >
                    2
                  </div>
                  <span className="mt-1 text-center">
                    Processing
                  </span>
                </div>

                <div className="flex-1 h-[2px] mx-1 bg-slate-700">
                  <div
                    className="h-[2px] bg-orange-500 transition-all"
                    style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                  />
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div
                    className={
                      "h-6 w-6 rounded-full border flex items-center justify-center " +
                      (currentStep >= 3
                        ? "bg-orange-500 border-orange-500 text-slate-950"
                        : "border-slate-600 text-slate-400")
                    }
                  >
                    3
                  </div>
                  <span className="mt-1 text-center">
                    Shipped
                  </span>
                </div>

                <div className="flex-1 h-[2px] mx-1 bg-slate-700">
                  <div
                    className="h-[2px] bg-orange-500 transition-all"
                    style={{ width: currentStep >= 4 ? "100%" : "0%" }}
                  />
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div
                    className={
                      "h-6 w-6 rounded-full border flex items-center justify-center " +
                      (currentStep >= 4
                        ? "bg-orange-500 border-orange-500 text-slate-950"
                        : "border-slate-600 text-slate-400")
                    }
                  >
                    4
                  </div>
                  <span className="mt-1 text-center">Delivered</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Current status:{" "}
                <span className="capitalize text-slate-100">
                  {data.status}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}