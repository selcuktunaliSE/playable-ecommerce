"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

type OrderItem = {
  _id?: string;
  productId?: string;
  name: string;
  quantity: number;
  price?: number;
  image?: string;
};

type Order = {
  _id: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: {
    fullName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod?: string;
  status?: string;
  shortCode?: string;
};

export default function ProfilePage() {
  const { user, token, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const { addToast } = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // ⭐ Admin ise siparişleri çekme
    if (!token || isAdmin) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load orders");
        }

        const raw = (await res.json()) as any[];

        const mapped: Order[] = raw
          .map((o: any) => ({
            _id: o._id,
            shortCode: o.shortCode, 
            total: o.totalAmount ?? o.total ?? 0,
            createdAt: o.createdAt,
            items: o.items ?? [],
            shippingAddress: o.shippingAddress,
            paymentMethod: o.paymentMethod,
            status: o.status
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

        setOrders(mapped);
      } catch (err: any) {
        addToast(err.message || "Failed to load orders", "error");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token, addToast, isAdmin]);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      addToast("Please fill in all password fields.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }
    if (!token) {
      addToast("You must be logged in to change password.", "error");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to change password");
      }

      addToast("Password changed successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      addToast(err.message || "Failed to change password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        Profile
      </h1>

      <div className="grid gap-6 md:grid-cols-[1.1fr_1.4fr]">
        <section className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  Account details
                </h2>
                <p className="text-sm mt-2">
                  <span className="text-slate-400">Name:</span>{" "}
                  <span className="text-slate-100 font-medium">
                    {user.name}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-400">Email:</span>{" "}
                  <span className="text-slate-100 font-medium">
                    {user.email}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300">
                  {user.role === "admin" ? "Admin" : "Customer"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm((p) => !p)}
                  className="mt-1 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-slate-800 text-[11px] font-medium text-slate-100 hover:bg-slate-700 transition"
                >
                  {showPasswordForm ? "Close" : "Change password"}
                </button>
              </div>
            </div>
          </div>

          {showPasswordForm && (
            <form
              onSubmit={handlePasswordChange}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
            >
              <h2 className="text-sm font-semibold text-slate-100">
                Change password
              </h2>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Your current password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="New password"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) =>
                      setConfirmNewPassword(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-full bg-orange-500 text-xs font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {changingPassword ? "Updating…" : "Change password"}
              </button>

            </form>
          )}
        </section>
        
        {!isAdmin && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Order history</h2>
              {orders.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loadingOrders ? (
              <p className="text-sm text-slate-400">Loading orders…</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-slate-400">
                You don&apos;t have any orders yet.
              </p>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => {
                  const isExpanded = expandedOrderId === o._id;
                  return (
                    <div
                      key={o._id}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-slate-100 font-medium">
                            Order #{(o.shortCode ?? o._id.slice(-6)).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(o.createdAt).toLocaleString()}
                          </p>
                          {o.status && (
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300">
                              {o.status}
                            </span>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm text-orange-400 font-semibold">
                            ${o.total.toFixed(2)}
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
                        <div className="mt-3 border-t border-slate-800 pt-3 space-y-3">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-200">
                              Items
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {o.items && o.items.length > 0 ? (
                                o.items.map((item, idx) => (
                                  <div
                                    key={item._id ?? item.productId ?? idx}
                                    className="flex items-center justify-between gap-3 text-xs"
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
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      {item.price != null && (
                                        <>
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
                                        </>
                                      )}
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

                          {o.shippingAddress && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-200">
                                Shipping address
                              </p>
                              <p className="text-[11px] text-slate-300">
                                {o.shippingAddress.fullName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {o.shippingAddress.addressLine1}
                                {o.shippingAddress.addressLine2
                                  ? `, ${o.shippingAddress.addressLine2}`
                                  : ""}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {o.shippingAddress.postalCode}{" "}
                                {o.shippingAddress.city}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {o.shippingAddress.country}
                              </p>
                            </div>
                          )}

                          {o.paymentMethod && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-200">
                                Payment
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Method: {o.paymentMethod}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}