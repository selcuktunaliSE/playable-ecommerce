"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type DashboardStats = {
  totalSales: number;
  orderCount: number;
  customerCount: number;
  pendingOrders: number;
};

type RangeKey = "7d" | "14d" | "1m" | "6m" | "all";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "14d", label: "Last 14 days" },
  { key: "1m", label: "Last 1 month" },
  { key: "6m", label: "Last 6 months" },
  { key: "all", label: "All time" }
];

type RecentOrder = {
  _id: string;
  createdAt: string;
  paymentStatus: string;
  totalAmount: number;
  userId: string | null;
  userName: string;
  userEmail: string;
  itemsCount: number;
};

type PopularProduct = {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  salesCount: number;
};

type SalesByDate = { date: string; total: number };
type StatusCount = { status: string; count: number };

type DashboardResponse = {
  selectedRange?: RangeKey;
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  popularProducts: PopularProduct[];
  salesByDate: SalesByDate[];
  orderStatusCounts: StatusCount[];
};

const SALES_ITEMS_PER_PAGE = 6;

export default function AdminDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [range, setRange] = useState<RangeKey>("7d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesPage, setSalesPage] = useState(1);

  const fetchDashboard = async (selectedRange: RangeKey = range) => {
    if (!API_BASE_URL) {
      setError("API base URL is not configured.");
      return;
    }
    if (!token) {
      setError("Not authenticated.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("range", selectedRange);

      const res = await fetch(
        `${API_BASE_URL}/admin/dashboard?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: "include"
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to load dashboard");
      }

      const json = (await res.json()) as DashboardResponse;
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?from=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") return;
    fetchDashboard(range);
  }, [authLoading, user, token, range]);

  useEffect(() => {
    setSalesPage(1);
  }, [range]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const stats = data?.stats;

  const maxSales =
    data && data.salesByDate.length > 0
      ? Math.max(...data.salesByDate.map((d) => d.total))
      : 0;

  const maxStatus =
    data && data.orderStatusCounts.length > 0
      ? Math.max(...data.orderStatusCounts.map((s) => s.count))
      : 0;

  const formatCurrency = (value?: number | null) => {
    const safe = typeof value === "number" && !Number.isNaN(value) ? value : 0;
    return `$${safe.toFixed(2)}`;
  };

  const rangeLabel =
    RANGE_OPTIONS.find((o) => o.key === range)?.label ?? "Selected period";

  const allSalesData = data?.salesByDate || [];
  const totalSalesPages = Math.ceil(allSalesData.length / SALES_ITEMS_PER_PAGE);
  const currentSalesData = allSalesData.slice(
    (salesPage - 1) * SALES_ITEMS_PER_PAGE,
    salesPage * SALES_ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Admin – Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            High-level overview of sales, orders and customers.
          </p>

          <div className="mt-3 inline-flex items-center rounded-full bg-slate-900/60 border border-slate-700 p-1 text-xs">
            {RANGE_OPTIONS.map((opt) => {
              const isActive = opt.key === range;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRange(opt.key)}
                  className={
                    "px-3 py-1.5 rounded-full transition text-[11px] cursor-pointer " +
                    (isActive
                      ? "bg-orange-500 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:bg-slate-800")
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(range)}
          className="self-start md:self-auto inline-flex items-center px-4 py-2.5 rounded-full bg-slate-800 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition cursor-pointer disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-700 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Total sales</p>
          <p className="mt-2 text-xl font-semibold text-slate-50">
            {stats ? formatCurrency(stats.totalSales) : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Orders</p>
          <p className="mt-2 text-xl font-semibold text-slate-50">
            {stats?.orderCount ?? "—"}
          </p>
        </div>

        <Link 
          href="/admin/customers"
          className="block rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:bg-slate-900 hover:border-slate-700 transition group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs text-slate-400 group-hover:text-orange-300 transition-colors">Customers</p>
            <span className="text-[10px] text-slate-500">View all →</span>
          </div>
          <p className="mt-2 text-xl font-semibold text-slate-50">
            {stats?.customerCount ?? "—"}
          </p>
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Pending orders</p>
          <p className="mt-2 text-xl font-semibold text-amber-300">
            {stats?.pendingOrders ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-100">
            Sales ({rangeLabel.toLowerCase()})
          </h2>
          
          <div className="flex-1">
            {(!data || data.salesByDate.length === 0) ? (
              <p className="text-xs text-slate-500">No sales data yet.</p>
            ) : (
              <div className="space-y-2">
                {currentSalesData.map((d) => (
                  <div
                    key={d.date}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-20 text-slate-400">
                      {new Date(d.date).toLocaleDateString()}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-500"
                        style={{
                          width:
                            maxSales > 0
                              ? `${(d.total / maxSales) * 100}%`
                              : "0%"
                        }}
                      />
                    </div>
                    <span className="w-16 text-right text-slate-300 text-[11px]">
                      ${d.total.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalSalesPages > 1 && (
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                disabled={salesPage === 1}
                className="px-2 py-1 rounded hover:bg-slate-900 text-[10px] text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>
              <span className="text-[10px] text-slate-500">
                Page {salesPage} of {totalSalesPages}
              </span>
              <button
                type="button"
                onClick={() => setSalesPage((p) => Math.min(totalSalesPages, p + 1))}
                disabled={salesPage === totalSalesPages}
                className="px-2 py-1 rounded hover:bg-slate-900 text-[10px] text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Order status distribution
          </h2>
          {(!data || data.orderStatusCounts.length === 0) && (
            <p className="text-xs text-slate-500">No orders yet.</p>
          )}

          <div className="space-y-2">
            {data?.orderStatusCounts.map((s) => (
              <div key={s.status} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="capitalize">
                    {s.status || "unknown"}
                  </span>
                  <span className="text-slate-400">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width:
                        maxStatus > 0
                          ? `${(s.count / maxStatus) * 100}%`
                          : "0%"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Recent orders
          </h2>
          {(!data || data.recentOrders.length === 0) && (
            <p className="text-xs text-slate-500">No orders yet.</p>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-2 py-1 text-left text-slate-400">
                    Order
                  </th>
                  <th className="px-2 py-1 text-left text-slate-400">
                    Customer
                  </th>
                  <th className="px-2 py-1 text-left text-slate-400">
                    Date
                  </th>
                  <th className="px-2 py-1 text-right text-slate-400">
                    Total
                  </th>
                  <th className="px-2 py-1 text-center text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.recentOrders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-t border-slate-800"
                  >
                    <td className="px-2 py-1 align-middle text-slate-100">
                      #{String(o._id).slice(-6)}
                    </td>

                    <td className="px-2 py-1 align-middle text-slate-200">
                      <div className="flex flex-col">
                        {o.userId ? (
                          <Link
                            href={`/admin/customers/${o.userId}`}
                            className="hover:text-orange-300 hover:underline underline-offset-2 cursor-pointer"
                            title={
                              o.userEmail || "View customer profile"
                            }
                          >
                            {o.userName || "Customer"}
                          </Link>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-slate-200"
                            title={
                              o.userEmail
                                ? `Guest checkout – ${o.userEmail}`
                                : "Guest checkout"
                            }
                          >
                            {o.userName || "Guest"}
                            <span className="rounded-full bg-slate-800 px-1.5 py-[1px] text-[9px] text-slate-300 border border-slate-600">
                              Guest
                            </span>
                          </span>
                        )}

                        {o.userEmail && (
                          <span className="text-[10px] text-slate-500">
                            {o.userEmail}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-2 py-1 align-middle text-slate-300">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-2 py-1 align-middle text-right text-slate-100">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-2 py-1 align-middle text-center">
                      <span className="inline-flex rounded-full px-2 py-[2px] text-[10px] border border-slate-600/60 text-slate-200 capitalize">
                        {o.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Popular products
          </h2>
          {(!data || data.popularProducts.length === 0) && (
            <p className="text-xs text-slate-500">
              No product data yet.
            </p>
          )}

          <div className="space-y-3">
            {data?.popularProducts.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2"
              >
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={
                      p.images?.[0] ||
                      "https://via.placeholder.com/80x80"
                    }
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatCurrency(p.price)}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  Sold:{" "}
                  <span className="font-semibold text-slate-100">
                    {p.salesCount ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-[11px] text-slate-500">
          Loading dashboard…
        </p>
      )}
    </div>
  );
}