"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";

type ProductOptionValue = {
  value: string;
  priceDelta?: number; 
};

type ProductOptionDefinition = {
  name: string; 
  values: ProductOptionValue[];
};

type ProductAddToCartProps = {
  productId: string;
  name: string;
  price: number; 
  image?: string;
  stock?: number;
  variant?: "product" | "card";
  optionsConfig?: ProductOptionDefinition[];
  basePrice?: number;
};

export function ProductAddToCart({
  productId,
  name,
  price,
  image,
  stock,
  variant = "product",
  optionsConfig,
  basePrice
}: ProductAddToCartProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);

  // Opsiyon seçimi
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    if (optionsConfig && Array.isArray(optionsConfig)) {
      optionsConfig.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          initial[opt.name] = opt.values[0].value;
        }
      });
    }
    return initial;
  });

  const isOutOfStock = stock !== undefined && stock <= 0;
  const maxQty = stock ?? Infinity;

  const clampedQty = Math.max(1, Math.min(quantity, maxQty));

  const effectiveBasePrice = basePrice ?? price;

  const optionPriceDelta = (optionsConfig ?? []).reduce((sum, opt) => {
    const selectedValue = selectedOptions[opt.name];
    const match = opt.values.find((v) => v.value === selectedValue);
    return sum + (match?.priceDelta ?? 0);
  }, 0);

  const finalUnitPrice = effectiveBasePrice + optionPriceDelta;

  const handleAdd = () => {
    if (isOutOfStock) {
      addToast("This product is out of stock.", "error");
      return;
    }

    if (clampedQty <= 0) return;

    const normalizedOptions =
      (optionsConfig ?? [])
        .map((opt) => {
          const selectedValue = selectedOptions[opt.name];
          if (!selectedValue) return null;
          const match = opt.values.find((v) => v.value === selectedValue);
          return {
            name: opt.name,
            value: selectedValue,
            priceDelta: match?.priceDelta ?? 0
          };
        })
        .filter(Boolean) as Array<{
        name: string;
        value: string;
        priceDelta: number;
      }>;

    // Tipi bozmamak için önce basic payload oluşturup sonra options ekliyoruz.
    const itemPayload: any = {
      productId,
      name,
      price: finalUnitPrice,
      image
    };

    if (normalizedOptions.length > 0) {
      itemPayload.options = normalizedOptions;
    }

    addItem(itemPayload, clampedQty);

    addToast(`${clampedQty} × ${name} added to cart`, "success");
  };

  const inc = () => {
    setQuantity((prev) => {
      const next = prev + 1;
      if (stock !== undefined && next > stock) return stock;
      return next;
    });
  };

  const dec = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // 🧩 CARD VARIANT (listing kartlarındaki minik buton)
  if (variant === "card") {
    return (
      <div className="mt-3 space-y-1">
        {typeof stock === "number" && (
          <p className="text-[11px] text-slate-400">
            In stock:{" "}
            <span className="text-slate-100 font-medium">
              {stock}
            </span>
          </p>
        )}

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
            <button
              type="button"
              onClick={dec}
              disabled={isOutOfStock}
              className="px-2 text-slate-300 disabled:text-slate-500"
            >
              −
            </button>
            <span className="w-6 text-center text-slate-100">
              {clampedQty}
            </span>
            <button
              type="button"
              onClick={inc}
              disabled={isOutOfStock}
              className="px-2 text-slate-300 disabled:text-slate-500"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`
              flex-1 inline-flex items-center justify-center gap-1.5
              px-3 py-1.5 rounded-md text-xs font-semibold
              shadow-sm cursor-pointer transition
              ${
                isOutOfStock
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-orange-500 text-slate-950 hover:bg-orange-400 hover:shadow-md hover:-translate-y-[1px]"
              }
            `}
          >
            <span>🛒</span>
            <span>{isOutOfStock ? "Out of stock" : "Add to cart"}</span>
          </button>
        </div>
      </div>
    );
  }

  // 🧩 PRODUCT VARIANT (ürün detay sayfasındaki büyük buton)
  return (
    <div className="space-y-3 mt-4">
      {/* Opsiyon seçiciler (sadece optionsConfig varsa göster) */}
      {optionsConfig && optionsConfig.length > 0 && (
        <div className="space-y-2">
          {optionsConfig.map((opt) => (
            <div key={opt.name} className="space-y-1">
              <label className="text-xs text-slate-300">
                {opt.name.charAt(0).toUpperCase() + opt.name.slice(1)}
              </label>
              <select
                value={selectedOptions[opt.name] ?? ""}
                onChange={(e) =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [opt.name]: e.target.value
                  }))
                }
                className="w-full md:w-64 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {opt.values.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.value}
                    {typeof v.priceDelta === "number" && v.priceDelta !== 0
                      ? v.priceDelta > 0
                        ? ` (+$${v.priceDelta})`
                        : ` (-$${Math.abs(v.priceDelta)})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <p className="text-xs text-slate-400">
            Price:{" "}
            <span className="text-slate-100 font-semibold">
              ${finalUnitPrice.toFixed(2)}
            </span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={clampedQty}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (Number.isNaN(value)) return;

            let next = value;
            if (next < 1) next = 1;
            if (stock !== undefined && next > stock) next = stock;
            setQuantity(next);
          }}
          className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-orange-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className="
          w-full md:w-auto px-6 py-2.5 rounded-full
          bg-orange-500 text-sm font-semibold text-slate-950
          shadow-sm
          hover:bg-orange-400 hover:shadow-lg hover:-translate-y-[1px]
          hover:ring-2 hover:ring-orange-400/70 hover:ring-offset-2 hover:ring-offset-slate-950
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:hover:ring-0
          cursor-pointer
          transition-transform transition-shadow duration-150
        "
        >
          {isOutOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}