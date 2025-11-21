import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { SearchBar } from "@/components/SearchBar";
import { ToastProvider } from "@/contexts/toast-context";
import { FloatingCartButton } from "@/components/FloatingCartButton";

export const metadata: Metadata = {
  title: "Playable E-commerce",
  description: "Case study store"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <CartProvider>
          <ToastProvider>
          <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Logo */}
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight">
                    playable<span className="text-orange-400">store</span>
                  </span>
                </Link>
              </div>

              {/* Search bar */}
              <div className="w-full md:flex-1">
                <SearchBar />
              </div>

              {/* Nav */}
              <nav className="flex items-center justify-end gap-4 text-sm mt-2 md:mt-0">
                <Link
                  href="/"
                  className="text-slate-300 hover:text-orange-400 transition"
                >
                  Home
                </Link>
                <Link
                  href="/cart"
                  className="text-slate-300 hover:text-orange-400 transition"
                >
                  Cart
                </Link>
                <Link
                  href="/profile"
                  className="text-slate-300 hover:text-orange-400 transition"
                >
                  Profile
                </Link>
                <Link
                  href="/admin"
                  className="text-slate-300 hover:text-orange-400 transition"
                >
                  Admin
                </Link>
              </nav>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
          </ToastProvider>
          <FloatingCartButton />
        </CartProvider>
      </body>
    </html>
  );
}
