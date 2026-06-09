import { ArrowRight, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types";

type ProductResult = { items: Product[]; facets: { categories: string[]; metalColors: string[]; gemstones: string[]; occasions: string[] } };

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const queryString = params.toString();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", queryString],
    queryFn: () => api<ProductResult>(`/products?${queryString}`)
  });
  const hasNoResults = !isLoading && !isError && data?.data.items.length === 0;
  const { data: fallbackData, isLoading: fallbackLoading } = useQuery({
    queryKey: ["products", "closest-matches", params.get("category") || "all"],
    queryFn: () =>
      api<ProductResult>(
        `/products?limit=6${params.get("category") ? `&category=${encodeURIComponent(params.get("category")!)}` : ""}`
      ),
    enabled: hasNoResults
  });
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };
  const category = params.get("category") || "";
  const title = params.get("q") ? `Results for “${params.get("q")}”` : category || "All jewelry";
  const selected = ["category", "metalColor", "gemstone", "occasion"].filter((key) => params.has(key));

  return (
    <>
      <CollectionHero category={category} title={title} isSearch={Boolean(params.get("q"))} />
      <div className="page-shell py-8 md:py-10">
      <div className="mt-12 flex items-center justify-between border-y border-stone-200 py-4">
        <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 text-sm font-semibold lg:hidden"><SlidersHorizontal size={18} /> Filters {selected.length > 0 && `(${selected.length})`}</button>
        <p className="hidden text-sm text-stone-500 lg:block">{data?.meta?.total ?? 0} designs</p>
        <select value={params.get("sort") || "popular"} onChange={(e) => update("sort", e.target.value)} className="bg-transparent text-sm outline-none" aria-label="Sort products">
          <option value="popular">Most loved</option><option value="new">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
        </select>
      </div>
      {selected.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{selected.map((key) => <button key={key} onClick={() => update(key, "")} className="flex items-center gap-2 rounded-full bg-plum-100 px-4 py-2 text-xs text-plum-900">{params.get(key)} <X size={13} /></button>)}<button onClick={() => setParams({})} className="px-2 text-xs underline">Clear all</button></div>}
      <div className="mt-9 grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          <Filters data={data?.data.facets} params={params} update={update} />
        </aside>
        <section>
          {isLoading && <div className="grid grid-cols-2 gap-5 md:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-3xl bg-blush-100" />)}</div>}
          {isError && <Message title="We couldn't load the collection" text="Please refresh and try again." />}
          {hasNoResults && (
            <NoResultsRecovery
              selected={selected.map((key) => ({ key, value: params.get(key)! }))}
              products={fallbackData?.data.items || []}
              loading={fallbackLoading}
              clearAll={() => setParams(category ? { category } : {})}
              removeFilter={(key) => update(key, "")}
            />
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">{data?.data.items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      </div>
      {filtersOpen && <div className="fixed inset-0 z-50 bg-black/35" onClick={() => setFiltersOpen(false)}><div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-[2rem] bg-ivory-50 p-6" onClick={(e) => e.stopPropagation()}><div className="mb-7 flex items-center justify-between"><h2 className="font-display text-2xl">Refine your selection</h2><button onClick={() => setFiltersOpen(false)}><X /></button></div><Filters data={data?.data.facets} params={params} update={update} /><button onClick={() => setFiltersOpen(false)} className="mt-8 w-full rounded-full bg-plum-900 py-4 text-sm font-semibold text-white">Show {data?.meta?.total ?? 0} designs</button></div></div>}
      </div>
    </>
  );
}

const heroImages: Record<string, string> = {
  rings: "photo-1605100804763-247f67b3557e",
  earrings: "photo-1535632066927-ab7c9ab60908",
  necklaces: "photo-1599643478518-a784e5dc4c8f",
  bracelets: "photo-1611591437281-460bfbe1220a",
  mangalsutras: "photo-1611085583191-a3b181a88401"
};

function CollectionHero({ category, title, isSearch }: { category: string; title: string; isSearch: boolean }) {
  const image = heroImages[category] || "photo-1515562141207-7a88fb7ce338";
  return (
    <section className="relative overflow-hidden bg-[#f2e8e3]">
      <div className="page-shell grid min-h-[310px] items-center gap-8 py-10 md:grid-cols-[1fr_.9fr] md:py-0">
        <div className="relative z-10 py-8 text-center md:text-left">
          <div className="mb-5 flex items-center justify-center gap-3 md:justify-start">
            <span className="h-px w-8 bg-gold-500" />
            <p className="text-xs uppercase tracking-[.26em] text-gold-500">
              {isSearch ? "Your search" : "Curated for you"}
            </p>
          </div>
          <h1 className="font-display text-5xl capitalize leading-none text-plum-950 md:text-6xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-stone-600 md:mx-0">
            {category
              ? `Discover ${category} crafted in fine gold, diamonds, and precious details for modern lives and meaningful moments.`
              : "Discover certified fine jewelry designed for modern lives and meaningful moments."}
          </p>
          {!isSearch && (
            <div className="mt-6 flex items-center justify-center gap-5 text-xs text-stone-500 md:justify-start">
              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-gold-500" /> Certified quality</span>
              <span>Complimentary styling</span>
            </div>
          )}
        </div>
        <div className="relative hidden h-[310px] md:block">
          <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border border-gold-500/25" />
          <div className="absolute right-[58%] top-6 h-16 w-16 rounded-full bg-gold-500/10 blur-xl" />
          <div className="absolute bottom-0 right-0 h-[285px] w-[78%] overflow-hidden rounded-tl-[7rem]">
            <img
              src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=1000&q=88`}
              alt={`${category || "Fine"} jewelry collection`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f2e8e3]/25 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function NoResultsRecovery({
  selected,
  products,
  loading,
  clearAll,
  removeFilter
}: {
  selected: Array<{ key: string; value: string }>;
  products: Product[];
  loading: boolean;
  clearAll: () => void;
  removeFilter: (key: string) => void;
}) {
  return (
    <div>
      <div className="rounded-[2rem] bg-gradient-to-br from-blush-100 to-[#eee4d5] px-6 py-10 text-center md:px-12">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-plum-900 shadow-sm">
          <Sparkles size={21} />
        </div>
        <h2 className="mt-5 font-display text-3xl text-plum-950">Nothing exact, but your next favorite may be close.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">
          This combination is very specific. Remove one refinement, or browse the closest pieces selected from this collection.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {selected.filter(({ key }) => key !== "category").map(({ key, value }) => (
            <button key={key} onClick={() => removeFilter(key)} className="flex items-center gap-2 rounded-full border border-plum-900/15 bg-white px-4 py-2 text-xs text-plum-900 transition hover:border-plum-900">
              Remove {value} <X size={13} />
            </button>
          ))}
          <button onClick={clearAll} className="rounded-full bg-plum-900 px-5 py-2 text-xs font-semibold text-white">Reset refinements</button>
        </div>
      </div>
      <div className="mb-7 mt-12 flex items-end justify-between">
        <div><p className="text-xs uppercase tracking-[.2em] text-gold-500">Selected for you</p><h3 className="mt-2 font-display text-3xl text-plum-950">Closest matches</h3></div>
        <Link to="/shop" className="hidden items-center gap-2 text-sm font-semibold text-plum-900 sm:flex">Explore all jewelry <ArrowRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-3xl bg-blush-100" />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}

function Filters({ data, params, update }: { data?: ProductResult["facets"]; params: URLSearchParams; update: (key: string, value: string) => void }) {
  return <div className="space-y-8">
    <Filter title="Category" name="category" values={data?.categories} params={params} update={update} />
    <Filter title="Metal colour" name="metalColor" values={data?.metalColors} params={params} update={update} />
    <Filter title="Gemstone" name="gemstone" values={data?.gemstones.filter((item) => item !== "None")} params={params} update={update} />
    <Filter title="Occasion" name="occasion" values={data?.occasions} params={params} update={update} />
    <div><h3 className="mb-4 text-sm font-semibold">Budget</h3>{[["Under ₹25K", "25000"], ["Under ₹50K", "50000"], ["Under ₹1L", "100000"]].map(([label, value]) => <label key={value} className="mb-3 flex cursor-pointer items-center gap-3 text-sm text-stone-600"><input type="radio" name="price" checked={params.get("priceMax") === value} onChange={() => update("priceMax", value)} className="accent-plum-900" />{label}</label>)}</div>
  </div>;
}

function Filter({ title, name, values = [], params, update }: { title: string; name: string; values?: string[]; params: URLSearchParams; update: (key: string, value: string) => void }) {
  return <div><h3 className="mb-4 text-sm font-semibold">{title}</h3>{values.map((value) => <label key={value} className="mb-3 flex cursor-pointer items-center gap-3 text-sm capitalize text-stone-600"><input type="radio" name={name} checked={params.get(name) === value} onChange={() => update(name, value)} className="accent-plum-900" />{value}</label>)}</div>;
}

function Message({ title, text }: { title: string; text: string }) {
  return <div className="rounded-3xl bg-blush-100 p-12 text-center"><h2 className="font-display text-2xl">{title}</h2><p className="mt-2 text-sm text-stone-500">{text}</p></div>;
}
