"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type OrderSummary = {
  _id: string;
  shortCode: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  itemsCount: number;
};

type CustomerDetail = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orders: OrderSummary[];
  stats: {
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
  };
};

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [customerId, setCustomerId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setCustomerId(p.id));
  }, [params]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    if (customerId && token) {
      fetchCustomerDetails(customerId);
    }
  }, [authLoading, user, token, customerId]);

  const fetchCustomerDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Customer not found");
      const data = await res.json();
      setCustomer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading profile...</div>;
  if (error || !customer) return (
    <div className="space-y-4">
      <div className="text-rose-400">{error || "Customer not found"}</div>
      <Link href="/admin/customers" className="text-orange-400 text-sm hover:underline">← Back to Customers</Link>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <nav className="text-xs text-slate-500 mb-2">
          <Link href="/admin" className="hover:text-slate-300">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/admin/customers" className="hover:text-slate-300">Customers</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{customer.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-50">{customer.name}</h1>
        <p className="text-sm text-slate-400">{customer.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-400">Total Spent</p>
          <p className="text-lg font-semibold text-emerald-400">${customer.stats.totalSpent.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-400">Total Orders</p>
          <p className="text-lg font-semibold text-slate-100">{customer.orders.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-400">Joined Date</p>
          <p className="text-lg font-semibold text-slate-100">{new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">Order History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Payment</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {customer.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                customer.orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-900/30 transition">
                    <td className="px-6 py-4 font-mono text-slate-300">
                      #{order.shortCode || order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border ${
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs capitalize ${order.paymentStatus === 'paid' ? 'text-slate-300' : 'text-amber-400'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-200">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}