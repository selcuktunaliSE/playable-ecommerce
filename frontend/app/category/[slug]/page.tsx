import Link from "next/link";
import { apiGet } from "@/lib/api";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ sort?: string }>;
};

async function getCategoryPageData(slug: string, sort?: string) {
  const categories = await apiGet("/categories");

  const category =
    slug === "all"
      ? null
      : (categories as any[]).find((c) => c.slug === slug);

  const searchParams = new URLSearchParams();
  if (sort) {
    searchParams.set("sort", sort);
  }

  const query = searchParams.toString();
  const products = await apiGet(
    query ? `/products?${query}` : "/products"
  );

  return { category, products, sort, slug };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { slug } = await props.params;
  const sp = props.searchParams ? await props.searchParams : undefined;
  const sort = sp?.sort;

  const { category, products } = await getCategoryPageData(slug, sort);

  const title =
    slug === "all"
      ? "All products"
      : category?.name || "Category";

  const allItems = (products as any).items ?? [];

  const filteredItems =
    slug === "all"
      ? allItems
      : allItems.filter((p: any) => p.category?.slug === slug);

  return (
    <div className="space-y-6">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {slug !== "all" && (
            <p className="text-sm text-slate-400 mt-1">
              Browse products under{" "}
              <span className="text-orange-400">
                {category?.name}
              </span>
            </p>
          )}
          {slug === "all" && (
            <p className="text-sm text-slate-400 mt-1">
              All available products in the catalog.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-slate-400">Sort by:</span>
          <SortLink slug={slug} label="Newest" value="newest" current={sort} />
          <SortLink slug={slug} label="Price ↑" value="price-asc" current={sort} />
          <SortLink slug={slug} label="Price ↓" value="price-desc" current={sort} />
          <SortLink slug={slug} label="Rating" value="rating" current={sort} />
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-slate-400">
          No products found in this category.
        </p>
      ) : (
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((p: any) => (
              <Link
                key={p._id}
                href={`/product/${p._id}`}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm hover:border-orange-500/60 hover:shadow-md transition flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-800 rounded mb-3 overflow-hidden">
                  <img
                    src={
                      p.images?.[0] ||
                      "https://via.placeholder.com/400x300"
                    }
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
      )}
    </div>
  );
}

type SortLinkProps = {
  slug: string;
  label: string;
  value: string;
  current?: string;
};

function SortLink({ slug, label, value, current }: SortLinkProps) {
  const isActive = current === value;
  const href = `/category/${slug}?sort=${value}`;

  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full border text-xs md:text-sm transition ${
        isActive
          ? "border-orange-500 bg-orange-500 text-slate-950"
          : "border-slate-700 text-slate-200 hover:border-orange-400 hover:text-orange-300"
      }`}
    >
      {label}
    </Link>
  );
}
