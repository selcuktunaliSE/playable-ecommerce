"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductAddToCart } from "@/components/ProductAddToCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function resolveImageUrl(raw?: string): string {
  if (!raw) {
    return "https://via.placeholder.com/400x300?text=No+Image";
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (API_BASE_URL) {
    return `${API_BASE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
  }

  return raw;
}

type ProductLike = {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  rating?: number;
  numReviews?: number;
};

type Props = {
  title: string;
  items: ProductLike[];
  viewAllHref: string;
};

const ITEMS_PER_PAGE = 4;

export function ProductCarouselSection({
  title,
  items,
  viewAllHref
}: Props) {
  const [page, setPage] = useState(0);

  if (!items || items.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleItems = items.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  const goPrev = () => {
    if (!canPrev) return;
    setPage((p) => Math.max(0, p - 1));
  };

  const goNext = () => {
    if (!canNext) return;
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };

  return (
    <section className="space-y-4">
      {/* Header + controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          {totalPages > 1 && (
            <span className="text-[11px] text-slate-500">
              Page {currentPage + 1} of {totalPages}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={viewAllHref}
            className="text-xs md:text-sm text-orange-400 hover:text-orange-300 hover:underline"
          >
            View all products
          </Link>

          {totalPages > 1 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canPrev}
                className={
                  "w-8 h-8 rounded-full border text-slate-200 text-sm flex items-center justify-center transition cursor-pointer " +
                  (canPrev
                    ? "border-slate-700 hover:border-orange-400 hover:text-orange-300 hover:bg-slate-900/60"
                    : "border-slate-800 text-slate-500 cursor-not-allowed opacity-50")
                }
                aria-label="Previous products"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext}
                className={
                  "w-8 h-8 rounded-full border text-slate-200 text-sm flex items-center justify-center transition cursor-pointer " +
                  (canNext
                    ? "border-slate-700 hover:border-orange-400 hover:text-orange-300 hover:bg-slate-900/60"
                    : "border-slate-800 text-slate-500 cursor-not-allowed opacity-50")
                }
                aria-label="Next products"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4’lü grid – hep tam kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleItems.map((p) => {
          const firstImage = Array.isArray(p.images)
            ? p.images[0]
            : undefined;
          const imageSrc = resolveImageUrl(firstImage);

          const rating =
            p.rating != null ? Number(p.rating).toFixed(1) : "0.0";
          const numReviews = p.numReviews ?? 0;

          return (
            <div
              key={p._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col hover:border-orange-500/60 transition-colors"
            >
              <Link
                href={`/product/${p._id}`}
                className="flex-1 flex flex-col gap-2"
              >
                <div className="aspect-[4/3] bg-slate-800 rounded mb-3 overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm font-semibold text-slate-50 line-clamp-2">
                  {p.name}
                </div>
                <div className="text-sm text-slate-300">
                  ${Number(p.price).toFixed(2)}
                </div>
                <div className="text-xs text-amber-400 mt-1">
                  ⭐ {rating} ({numReviews} reviews)
                </div>
              </Link>

              <div className="mt-3">
                <ProductAddToCart
                  variant="card"
                  productId={p._id}
                  name={p.name}
                  price={Number(p.price)}
                  image={imageSrc}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
