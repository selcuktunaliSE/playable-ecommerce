"use client";

import Link from "next/link";
import { apiGet } from "@/lib/api";
import { ProductAddToCart } from "@/components/ProductAddToCard";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { useState, useEffect } from "react";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

async function getProduct(id: string) {
  const product = await apiGet(`/products/${id}`);
  return product;
}

export default function ProductPage(props: ProductPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    (async () => {
      try {
        const { id } = await props.params;
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [props.params]);

  if (loading) return <p className="text-slate-400">Loading…</p>;
  if (error || !product || !product._id) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-400">{error || "Product not found."}</p>
        <Link
          href="/"
          className="text-sm text-orange-400 hover:text-orange-300 hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  const images: string[] = Array.isArray(product.images)
    ? product.images
    : product.image
    ? [product.image]
    : [];
  const mainImage = images[0] ?? "https://via.placeholder.com/800x600";

  // ❌ SİLDİM: Manuel fiyat hesaplamalarını kaldırdık. 
  // Sadece base fiyatı alıyoruz.
  const basePrice = product.price ?? 0;
  
  const rating = (product.rating ?? 0).toFixed(1);
  const stock = typeof product.stock === "number" ? product.stock : 0;

  // ❌ SİLDİM: handleOptionChange fonksiyonuna gerek kalmadı.

  return (
    <div className="space-y-6">
      <nav className="text-xs text-slate-400">
        <Link href="/" className="hover:text-orange-300">Home</Link>
        <span className="mx-1">/</span>
        <Link
          href={
            product.category?.slug
              ? `/category/${product.category.slug}`
              : "/category/all"
          }
          className="hover:text-orange-300"
        >
          {product.category?.name ?? "Catalog"}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-200">{product.name}</span>
      </nav>

      <section className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8">
        <ProductImageGallery images={images} name={product.name} />

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-50">
              {product.name}
            </h1>
            {product.category?.name && (
              <p className="text-xs mt-1 text-slate-400">
                Category:{" "}
                <Link
                  href={
                    product.category?.slug
                      ? `/category/${product.category.slug}`
                      : "/category/all"
                  }
                >
                  <span className="text-orange-400">{product.category.name}</span>
                </Link>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            {/* Burada sadece başlangıç fiyatını gösteriyoruz.
                Opsiyon seçilince değişen fiyatı ProductAddToCart kendi içinde gösteriyor zaten. */}
            <span className="text-lg font-semibold text-slate-50">
              ${basePrice.toFixed(2)}
            </span>
            <span className="text-xs text-amber-400">
              ⭐ {rating} ({product.numReviews ?? 0} reviews)
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {product.description || "No description available."}
          </p>

          {/* ❌ SİLDİM: Manuel Select/Option renderlama kısmını tamamen kaldırdık. */}
          
          <div>
            {/* ✅ DÜZELTİLDİ: OptionsConfig props'unu geçiyoruz */}
            <ProductAddToCart
              productId={product._id}
              name={product.name}
              price={basePrice}      // Base fiyat
              basePrice={basePrice}  // Base fiyat (Logic için)
              image={mainImage}
              stock={stock}
              optionsConfig={product.options} // Bütün sihir burada!
              variant="product" // Bu modda açılınca select boxları kendi render eder
            />
          </div>

          <div>
            <Link
              href={
                product.category?.slug
                  ? `/category/${product.category.slug}`
                  : "/category/all"
              }
              className="text-xs text-slate-400 hover:text-orange-300 hover:underline"
            >
              ← Back to {product.category?.name ?? "catalog"} Category
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}