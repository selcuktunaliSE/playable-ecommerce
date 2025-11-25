"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

export function AppHeader() {
  const router = useRouter();

  const { items } = useCart();
  const totalCount = items.reduce(
    (sum, it: any) => sum + (it.quantity ?? 0),
    0
  );

  const { user, token, logout } = useAuth();
  const isLoggedIn = Boolean(user && token);
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              playable<span className="text-orange-400">store</span>
            </span>
          </Link>
        </div>

        <div className="w-full md:flex-1">
          <SearchBar />
        </div>

        <nav className="flex items-center justify-end gap-4 text-sm mt-2 md:mt-0">
          <Link
            href="/"
            className="text-slate-300 hover:text-orange-400 transition"
          >
            Home
          </Link>
          {!isAdmin && (
               <Link
            href="/cart"
            className="text-slate-300 hover:text-orange-400 transition flex items-center gap-1"
          >
            <span>Cart</span>
            {totalCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] px-1 rounded-full bg-orange-500 text-[10px] font-semibold text-slate-950">
                {totalCount}
              </span>
            )}
          </Link>
          )}
       

          {!isLoggedIn && (
            <Link
              href="/login"
              className="text-slate-300 hover:text-orange-400 transition"
            >
              Login
            </Link>
          )}

          {isLoggedIn && (
            <>
              <Link
                href="/profile"
                className="text-slate-300 hover:text-orange-400 transition"
              >
                Profile
              </Link>
              {isAdmin && (
               <Link
                  href="/admin"
                  className="text-slate-300 hover:text-orange-400 transition"
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/products"
                  className="text-slate-300 hover:text-orange-400 transition"
                >
                  Panel
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 rounded-full border border-slate-600 text-slate-200 hover:border-rose-400 hover:text-rose-300 transition text-xs"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
