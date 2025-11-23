import Link from "next/link";
import { apiGet } from "@/lib/api";
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

async function getHomePageData() {
  const categories = await apiGet("/categories");
  const topRatedRes = await apiGet("/products?sort=rating&limit=4");
  const bestSellersRes = await apiGet("/products?sort=sales&limit=4");

  const categoryItems = (categories as any[]) ?? [];

  const topItems =
    (topRatedRes as any).items ?? ((topRatedRes as any[]) ?? []);

  const bestSellerItems =
    (bestSellersRes as any).items ??
    ((bestSellersRes as any[]) ?? []);

  return { categoryItems, topItems, bestSellerItems };
}

  export default async function HomePage() {
  const { categoryItems, topItems, bestSellerItems } =
  await getHomePageData();

  return (
    <div className="space-y-10">

      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl px-6 py-10 md:px-10 md:py-12 shadow-lg">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Creativity meets{" "}
            <span className="text-orange-400">commerce</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Browse a curated catalog of tech products with a clean,
            playable-inspired experience. Filter, sort and explore — just like
            a real store.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/category/laptops"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-orange-500 text-slate-950 text-sm font-semibold shadow-sm hover:bg-orange-400 hover:shadow-lg hover:-translate-y-[1px] transition"
            >
              Explore laptops
            </Link>
            <Link
              href="/category/all"
              className="inline-flex items-center px-5 py-2.5 rounded-full border border-slate-700 text-sm font-semibold text-slate-100 hover:border-orange-400 hover:text-orange-300 transition"
            >
              View all products
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl md:text-2xl font-semibold">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryItems.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 flex flex-col justify-between hover:border-orange-500/60 hover:shadow-md transition"
            >
              <div className="text-sm font-semibold text-slate-100">
                {cat.name}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                View products →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl md:text-2xl font-semibold">
            Top Rated Products
          </h2>
          <Link
            href="/category/all"
            className="text-xs md:text-sm text-orange-400 hover:text-orange-300 hover:underline"
          >
            View all products
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {topItems.map((p: any) => {
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
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm flex flex-col"
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
                    stock={p.stock}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl md:text-2xl font-semibold">
            Best Sellers
          </h2>
          <Link
            href="/category/all"
            className="text-xs md:text-sm text-orange-400 hover:text-orange-300 hover:underline"
          >
            View all products
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellerItems.map((p: any) => {
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
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm flex flex-col"
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
                    stock={p.stock}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
