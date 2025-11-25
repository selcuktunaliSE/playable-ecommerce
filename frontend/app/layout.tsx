import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { ToastProvider } from "@/contexts/toast-context";
import { AuthProvider } from "@/contexts/auth-context";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Playable Store",
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
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
