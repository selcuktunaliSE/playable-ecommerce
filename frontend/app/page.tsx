import Link from "next/link";
import { apiGet } from "@/lib/api";

async function getHomeData() {
  const categories = await apiGet("/categories");
  const topRated = await apiGet("/products?sort=rating&limit=4");
  return { categories, topRated };
}

export default async function HomePage() {
  const { categories, topRated } = await getHomeData();

  return (
    <div className="space-y-10">
      {/* Hero / Intro */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-lg border border-slate-800">
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Creativity meets{" "}
            <span className="text-orange-400">commerce</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Browse a curated catalog of tech products with a clean,
            playable-inspired experience. Filter, sort and explore —
            just like a real store.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link
              href="/category/laptops"
              className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500 text-xs md:text-sm font-semibold text-slate-950 hover:bg-orange-400 transition"
            >
              Explore laptops
            </Link>
            <Link
              href="/category/all"
              className="inline-flex items-center px-4 py-2 rounded-full border border-slate-600 text-xs md:text-sm text-slate-200 hover:border-orange-400 hover:text-orange-300 transition"
            >
              View all products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-orange-500/60 hover:shadow-md transition"
            >
              <div className="font-semibold mb-1 text-slate-50">
                {cat.name}
              </div>
              <div className="text-xs text-slate-400">
                View products →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-semibold">
            Top Rated Products
          </h2>
          <Link
            href="/category/all"
            className="text-sm text-orange-400 hover:text-orange-300 hover:underline"
          >
            View all products
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topRated.items.map((p: any) => (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm hover:border-orange-500/60 hover:shadow-md transition flex flex-col"
            >
              <div className="aspect-[4/3] bg-slate-800 rounded mb-3 overflow-hidden">
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/400x300"}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between gap-1">
                <div className="text-sm font-semibold text-slate-50 line-clamp-2">
                  {p.name}
                </div>
                <div className="text-sm text-slate-300">
                  ${p.price.toFixed(2)}
                </div>
                <div className="text-xs text-amber-400 mt-1">
                  ⭐ {p.rating.toFixed(1)} ({p.numReviews} reviews)
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
