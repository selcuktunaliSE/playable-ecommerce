"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

type Order = {
  _id: string;
  total: number;
  createdAt: string;
};

export default function ProfilePage() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!res.ok) {
          throw new Error("Failed to load orders");
        }
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        addToast(err.message || "Failed to load orders", "error");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token, addToast]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
        <p className="text-sm">
          <span className="text-slate-400">Name:</span>{" "}
          <span className="text-slate-100 font-medium">{user.name}</span>
        </p>
        <p className="text-sm">
          <span className="text-slate-400">Email:</span>{" "}
          <span className="text-slate-100 font-medium">{user.email}</span>
        </p>
        <p className="text-sm">
          <span className="text-slate-400">Role:</span>{" "}
          <span className="text-slate-100 font-medium">{user.role}</span>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Order history</h2>
        {loadingOrders ? (
          <p className="text-sm text-slate-400">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-400">
            You don&apos;t have any orders yet.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-100 font-medium">
                    Order #{o._id.slice(-6)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-orange-400 font-semibold">
                  ${o.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
