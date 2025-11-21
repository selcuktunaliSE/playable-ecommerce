"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/category/all?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5"
    >
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent text-xs md:text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
      />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-full bg-orange-500 text-[11px] md:text-xs font-semibold text-slate-950 hover:bg-orange-400 transition cursor-pointer"
      >
        Search
      </button>
    </form>
  );
}
