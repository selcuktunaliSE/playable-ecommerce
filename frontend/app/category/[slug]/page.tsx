import Link from "next/link";
import { apiGet } from "@/lib/api";
import { ProductAddToCart } from "@/components/ProductAddToCard";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    q?: string;
    page?: string;
  }>;
};

const PER_PAGE = 12;

async function getCategoryPageData(
  slug: string,
  sort?: string,
  q?: string
) {
  const categories = await apiGet("/categories");

  const category =
    slug === "all"
      ? null
      : (categories as any[]).find((c) => c.slug === slug);

  const searchParams = new URLSearchParams();

  if (slug !== "all") {
    searchParams.set("categorySlug", slug);
  } else {
    searchParams.set("categorySlug", "all");
  }

  if (sort) {
    searchParams.set("sort", sort);
  }

  if (q) {
    searchParams.set("q", q);
  }

  searchParams.set("limit", "9999999");

  const query = searchParams.toString();
  const products = await apiGet(`/products?${query}`);

  return { category, products, sort, q };
}

export default async function CategoryPage({
  params,
  searchParams
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = sp?.sort;
  const q = sp?.q;
  const pageParam = sp?.page;

  const { category, products } = await getCategoryPageData(
    slug,
    sort,
    q
  );

  const title =
    slug === "all"
      ? "All products"
      : category?.name || "Category";

  const allItemsRaw =
    (products as any).items ??
    (Array.isArray(products) ? products : []);

  const allItems =
    slug === "all"
      ? allItemsRaw
      : allItemsRaw.filter((p: any) => p.category?.slug === slug);

  const totalItems = allItems.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

  const pageFromUrl = pageParam ? Number(pageParam) : 1;
  const currentPage =
    !pageFromUrl || Number.isNaN(pageFromUrl)
      ? 1
      : Math.min(Math.max(pageFromUrl, 1), totalPages);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const pageItems = allItems.slice(
    startIndex,
    startIndex + PER_PAGE
  );

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (q) params.set("q", q);
    if (page > 1) {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs
      ? `/category/${slug}?${qs}`
      : `/category/${slug}`;
  };

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
                {category?.name+" "}
              </span>
              category
            </p>
          )}
          {slug === "all" && (
            <p className="text-sm text-slate-400 mt-1">
              All available products in the catalog.
            </p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            Showing{" "}
            {totalItems === 0
              ? "0"
              : `${startIndex + 1}–${Math.min(
                  startIndex + pageItems.length,
                  totalItems
                )}`}{" "}
            of {totalItems} products
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-slate-400">Sort by:</span>
          <SortLink
            slug={slug}
            label="Newest"
            value="newest"
            current={sort}
            q={q}
          />
          <SortLink
            slug={slug}
            label="Price ↑"
            value="price-asc"
            current={sort}
            q={q}
          />
          <SortLink
            slug={slug}
            label="Price ↓"
            value="price-desc"
            current={sort}
            q={q}
          />
          <SortLink
            slug={slug}
            label="Rating"
            value="rating"
            current={sort}
            q={q}
          />
        </div>
      </section>

      {pageItems.length === 0 ? (
        <p className="text-sm text-slate-400">
          No products found in this category.
        </p>
      ) : (
        <>
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pageItems.map((p: any) => {
                const rawPrice = p.price ?? 0;
                const priceNumber =
                  typeof rawPrice === "number"
                    ? rawPrice
                    : Number(rawPrice);

                const rawRating = p.rating ?? 0;
                const ratingNumber =
                  typeof rawRating === "number"
                    ? rawRating
                    : Number(rawRating);

                return (
                  <div
                    key={p._id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm hover:border-orange-500/60 hover:shadow-md transition flex flex-col"
                  >
                    <Link
                      href={`/product/${p._id}`}
                      className="flex-1 flex flex-col"
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
                          ${priceNumber.toFixed(2)}
                        </div>
                        <div className="text-xs text-amber-400 mt-1">
                          ⭐ {ratingNumber.toFixed(1)} (
                          {p.numReviews ?? 0} reviews)
                        </div>
                      </div>
                    </Link>

                    <div className="pt-3">
                      <ProductAddToCart
                        variant="card"
                        productId={p._id}
                        name={p.name}
                        price={priceNumber}
                        image={p.images?.[0]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {totalPages > 1 && (
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4">
              <div className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={buildPageHref(Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage === 1}
                  className={
                    "px-3 py-1 rounded-full border text-xs md:text-sm transition " +
                    (currentPage === 1
                      ? "border-slate-700 text-slate-500 cursor-not-allowed opacity-50 pointer-events-none"
                      : "border-slate-700 text-slate-200 hover:border-orange-400 hover:text-orange-300")
                  }
                >
                  Prev
                </Link>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  const isActive = page === currentPage;
                  return (
                    <Link
                      key={page}
                      href={buildPageHref(page)}
                      className={
                        "px-3 py-1 rounded-full border text-xs md:text-sm transition " +
                        (isActive
                          ? "bg-orange-500 border-orange-500 text-slate-950"
                          : "border-slate-700 text-slate-200 hover:border-orange-400 hover:text-orange-300")
                      }
                    >
                      {page}
                    </Link>
                  );
                })}

                <Link
                  href={buildPageHref(
                    Math.min(totalPages, currentPage + 1)
                  )}
                  aria-disabled={currentPage === totalPages}
                  className={
                    "px-3 py-1 rounded-full border text-xs md:text-sm transition " +
                    (currentPage === totalPages
                      ? "border-slate-700 text-slate-500 cursor-not-allowed opacity-50 pointer-events-none"
                      : "border-slate-700 text-slate-200 hover:border-orange-400 hover:text-orange-300")
                  }
                >
                  Next
                </Link>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

type SortLinkProps = {
  slug: string;
  label: string;
  value: string;
  current?: string;
  q?: string;
};

function SortLink({ slug, label, value, current, q }: SortLinkProps) {
  const isActive = current === value;

  const params = new URLSearchParams();
  params.set("sort", value);
  if (q) {
    params.set("q", q);
  }

  const href = `/category/${slug}?${params.toString()}`;

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
