"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { FloatingCartButton } from "./FloatingCartButton";

const AUTH_ROUTES = ["/login"];

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        {children}
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
      <FloatingCartButton />
    </>
  );
}
