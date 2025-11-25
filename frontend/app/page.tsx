import Link from "next/link";
import { apiGet } from "@/lib/api";
import { ProductCarouselSection } from "@/components/ProductCarouselSection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function getHomePageData() {
  const categories = await apiGet("/categories");
  const topRatedRes = await apiGet("/products?sort=rating&limit=12");
  const bestSellersRes = await apiGet("/products?sort=sales&limit=12");

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

      <ProductCarouselSection
        title="Top Rated Products"
        items={topItems as any[]}
        viewAllHref="/category/all"
      />

      <ProductCarouselSection
        title="Best Sellers"
        items={bestSellerItems as any[]}
        viewAllHref="/category/all"
      />
    </div>
  );
}
