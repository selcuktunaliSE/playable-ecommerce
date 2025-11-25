"use client";

import { useState } from "react";

type ProductImageGalleryProps = {
  images: string[];
  name: string;
};

export function ProductImageGallery({
  images,
  name
}: ProductImageGalleryProps) {
  const safeImages =
    Array.isArray(images) && images.length > 0
      ? images
      : ["https://via.placeholder.com/800x600"];

  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setActiveIndex((prev) =>
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="flex justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-sm md:max-w-md">
        <div className="w-full flex flex-col gap-4">
          <div className="relative aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden group">
            <img
              src={safeImages[activeIndex]}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700 px-2.5 py-2 text-slate-100 text-sm backdrop-blur-sm hover:bg-slate-800 hover:border-slate-500 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 border border-slate-700 px-2.5 py-2 text-slate-100 text-sm backdrop-blur-sm hover:bg-slate-800 hover:border-slate-500 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  ›
                </button>
              </>
            )}

            {safeImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {safeImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeIndex
                        ? "w-4 bg-orange-400"
                        : "w-2 bg-slate-500/70 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {safeImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pt-1">
              {safeImages.map((url, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border transition-all ${
                      isActive
                        ? "border-orange-400 ring-2 ring-orange-500/60"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
