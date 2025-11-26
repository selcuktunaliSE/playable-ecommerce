"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type AdminOrderItem = {
  _id?: string;
  product?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type ShippingAddress = {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

type AdminOrder = {
  _id: string;
  shortCode?: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  items?: AdminOrderItem[];
  shippingAddress?: ShippingAddress;
};

const STATUS_LABELS: Record<AdminOrder["status"], string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped (On the way)",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

type StatusFilter = AdminOrder["status"] | "all";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "processing", label: STATUS_LABELS.processing },
  { value: "shipped", label: STATUS_LABELS.shipped },
  { value: "delivered", label: STATUS_LABELS.delivered },
  { value: "cancelled", label: STATUS_LABELS.cancelled }
];

function statusBadgeClass(status: AdminOrder["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-300 border-amber-500/40";
    case "processing":
      return "bg-sky-500/10 text-sky-300 border-sky-500/40";
    case "shipped":
      return "bg-blue-500/10 text-blue-300 border-blue-500/40";
    case "delivered":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    case "cancelled":
      return "bg-rose-500/10 text-rose-300 border-rose-500/40";
    default:
      return "bg-slate-700/40 text-slate-200 border-slate-600";
  }
}

export default function AdminOrdersPage() {
  const { user, token, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / PAGE_SIZE)
  );
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  useEffect(() => {
    const relevant = statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

    const newTotalPages = Math.max(
      1,
      Math.ceil(relevant.length / PAGE_SIZE)
    );
    if (page > newTotalPages) {
      setPage(newTotalPages);
      setExpandedOrderId(null);
    }
  }, [orders, page, statusFilter]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!token || !API_BASE_URL) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load orders");
        }

        const data = (await res.json()) as AdminOrder[];
        setOrders(data);
        setPage(1); 
        setExpandedOrderId(null);
      } catch (err: any) {
        addToast(err.message || "Failed to load orders", "error");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token, addToast]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: AdminOrder["status"]
  ) => {
    if (!token || !API_BASE_URL) return;

    try {
      setUpdatingId(orderId);

      const res = await fetch(
        `${API_BASE_URL}/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to update status");
      }

      const updated = (await res.json()) as AdminOrder;

      setOrders((prev) =>
        prev.map((o) =>
          o._id === updated._id ? { ...o, status: updated.status } : o
        )
      );

      addToast("Order status updated.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    setExpandedOrderId(null);
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Admin – Orders
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage all orders from a single place.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as StatusFilter;
                setStatusFilter(val);
                setPage(1);
                setExpandedOrderId(null);
              }}
              className="text-[11px] rounded-full bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {orders.length > 0 && (
            <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {loadingOrders ? (
        <p className="text-sm text-slate-400">Loading orders…</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-sm text-slate-400">
          No orders for the selected status.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedOrders.map((o) => {
              const isExpanded = expandedOrderId === o._id;

              const isGuest = !o.user;
              const displayCode = o.shortCode
                ? `#${o.shortCode}`
                : `#${o._id.slice(-6)}`;

              return (
                <div
                  key={o._id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 hover:border-slate-600/80 hover:bg-slate-900 transition-shadow shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-100">
                          Order {displayCode}
                        </p>
                        <span
                          className={
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] " +
                            statusBadgeClass(o.status)
                          }
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                          {STATUS_LABELS[o.status]}
                        </span>
                        {isGuest ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200 border border-slate-700">
                            Guest order
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200 border border-slate-700">
                            Registered user
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        {new Date(o.createdAt).toLocaleString()}
                      </p>

                      {o.user ? (
                        <p className="text-[11px] text-slate-300">
                          {o.user.name} · {o.user.email}
                        </p>
                      ) : (
                        o.shippingAddress?.fullName && (
                          <p className="text-[11px] text-slate-300">
                            Receiver: {o.shippingAddress.fullName}
                          </p>
                        )
                      )}

                      <p className="text-[11px] text-slate-400">
                        Payment:{" "}
                        <span className="font-medium">
                          {o.paymentStatus ?? "paid"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm md:text-base text-orange-400 font-semibold">
                        ${o.totalAmount.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          Status:
                        </span>
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(
                              o._id,
                              e.target.value as AdminOrder["status"]
                            )
                          }
                          disabled={updatingId === o._id}
                          className="text-[11px] rounded-full bg-slate-800 border border-slate-700 px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                          <option value="pending">
                            {STATUS_LABELS.pending}
                          </option>
                          <option value="processing">
                            {STATUS_LABELS.processing}
                          </option>
                          <option value="shipped">
                            {STATUS_LABELS.shipped}
                          </option>
                          <option value="delivered">
                            {STATUS_LABELS.delivered}
                          </option>
                          <option value="cancelled">
                            {STATUS_LABELS.cancelled}
                          </option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId((prev) =>
                            prev === o._id ? null : o._id
                          )
                        }
                        className="text-[11px] text-slate-300 hover:text-orange-300 hover:underline"
                      >
                        {isExpanded ? "Hide details" : "View details"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-800 pt-3 mt-1 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-200">
                          Items
                        </p>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {o.items && o.items.length > 0 ? (
                            o.items.map((item, idx) => (
                              <div
                                key={item._id ?? item.product ?? idx}
                                className="flex items-center justify-between gap-3 text-xs rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.image && (
                                    <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-slate-100 truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[11px] text-slate-400">
                                    ${Number(item.price).toFixed(2)} each
                                  </p>
                                  <p className="text-[11px] text-slate-100 font-medium">
                                    $
                                    {(
                                      Number(item.price) *
                                      Number(item.quantity)
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              No item details available for this order.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-200">
                          Shipping address
                        </p>
                        {o.shippingAddress ? (
                          <div className="text-[11px] text-slate-300 space-y-0.5">
                            {o.shippingAddress.fullName && (
                              <p>{o.shippingAddress.fullName}</p>
                            )}
                            {(o.shippingAddress.addressLine1 ||
                              o.shippingAddress.addressLine2) && (
                              <p className="text-slate-400">
                                {o.shippingAddress.addressLine1}
                                {o.shippingAddress.addressLine2
                                  ? `, ${o.shippingAddress.addressLine2}`
                                  : ""}
                              </p>
                            )}
                            {(o.shippingAddress.postalCode ||
                              o.shippingAddress.city) && (
                              <p className="text-slate-400">
                                {o.shippingAddress.postalCode}{" "}
                                {o.shippingAddress.city}
                              </p>
                            )}
                            {o.shippingAddress.country && (
                              <p className="text-slate-400">
                                {o.shippingAddress.country}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            No shipping information.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-4">
              <p className="text-[11px] text-slate-400">
                Showing{" "}
                <span className="text-slate-200">
                  {filteredOrders.length === 0 ? 0 : startIndex + 1}–
                  {Math.min(endIndex, filteredOrders.length)}
                </span>{" "}
                of{" "}
                <span className="text-slate-200">
                  {filteredOrders.length}
                </span>{" "}
                orders
              </p>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-500 hover:bg-slate-800 transition"
                >
                  ← Prev
                </button>
                <span className="text-slate-400">
                  Page{" "}
                  <span className="text-slate-200">{page}</span> /{" "}
                  <span className="text-slate-200">{totalPages}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-500 hover:bg-slate-800 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}