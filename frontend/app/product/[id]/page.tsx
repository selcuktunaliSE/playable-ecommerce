import Link from "next/link";
import { apiGet } from "@/lib/api";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

async function getProduct(id: string) {
  const product = await apiGet(`/products/${id}`);
  return product;
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params;

  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Product not found.
        </p>
        <Link
          href="/"
          className="text-sm text-orange-400 hover:text-orange-300 hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  const price = product.price?.toFixed
    ? product.price.toFixed(2)
    : Number(product.price).toFixed(2);

  return (
    <div className="space-y-6">
      <nav className="text-xs text-slate-400">
        <Link href="/" className="hover:text-orange-300">
          Home
        </Link>
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
        <span className="text-slate-200">
          {product.name}
        </span>
      </nav>
      <section className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
          <div className="w-full max-w-md aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden">
            <img
              src={
                product.images?.[0] ||
                "https://via.placeholder.com/800x600"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-50">
              {product.name}
            </h1>
            {product.category?.name && (
              <p className="text-xs mt-1 text-slate-400">
                Category:{" "}
                <span className="text-orange-400">
                  {product.category.name}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-lg font-semibold text-slate-50">
              ${price}
            </span>
            <span className="text-xs text-amber-400">
              ⭐ {product.rating?.toFixed
                ? product.rating.toFixed(1)
                : Number(product.rating).toFixed(1)}{" "}
              ({product.numReviews} reviews)
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {product.description || "No description available."}
          </p>

          <div className="text-xs text-slate-400 space-y-1">
            <p>
              Stock:{" "}
              <span
                className={
                  product.stock > 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              >
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </span>
            </p>
            <p>Product ID: {product._id}</p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="w-full md:w-auto px-6 py-2.5 rounded-full bg-orange-500 text-sm font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? "Add to cart" : "Out of stock"}
            </button>
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
              ← Back to {product.category?.name ?? "catalog"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
