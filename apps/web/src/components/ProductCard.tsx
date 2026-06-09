import { Check, Heart, ShoppingBag, Star, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, money } from "../api";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { data } = useQuery({ queryKey: ["wishlist"], queryFn: () => api<Product[]>("/wishlist") });
  const wished = data?.data.some((item) => item.id === product.id);
  const wishlist = useMutation({
    mutationFn: () =>
      api<Product[]>(`/wishlist/items${wished ? `/${product.id}` : ""}`, {
        method: wished ? "DELETE" : "POST",
        body: wished ? undefined : JSON.stringify({ productId: product.id })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });
  const cart = useMutation({
    mutationFn: (size: string) =>
      api("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, size, quantity: 1 })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setQuickAddOpen(false);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    }
  });

  const quickAdd = () => {
    if (product.sizes.length === 1) {
      cart.mutate(product.sizes[0]);
      return;
    }
    setQuickAddOpen(true);
  };

  return (
    <article className="product-card group relative min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-blush-100">
        <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <img className="product-image h-full w-full object-cover" src={product.images[0]} alt={product.name} loading="lazy" />
        </Link>
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-ivory-50/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[.14em] text-plum-900">{product.badge}</span>}
        <button
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-plum-900 shadow-sm transition hover:scale-105"
          onClick={() => wishlist.mutate()}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
        >
          <Heart size={18} fill={wished ? "currentColor" : "none"} />
        </button>
        <button
          onClick={quickAdd}
          disabled={cart.isPending}
          className={`absolute bottom-3 left-3 right-3 flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold shadow-lg transition duration-300 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 ${
            added ? "bg-[#256b4a] text-white" : "bg-white/95 text-plum-950 hover:bg-plum-900 hover:text-white"
          }`}
          aria-label={`Quick add ${product.name} to bag`}
        >
          {added ? <><Check size={16} /> Added to bag</> : <><ShoppingBag size={16} /> Quick add</>}
        </button>
        {quickAddOpen && (
          <div className="absolute inset-x-2 bottom-2 rounded-2xl bg-white p-4 shadow-2xl reveal" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-plum-950">Select a size</p>
              <button onClick={() => setQuickAddOpen(false)} className="grid h-7 w-7 place-items-center rounded-full bg-stone-100" aria-label="Close size selection"><X size={14} /></button>
            </div>
            <div className="mt-3 flex max-h-24 flex-wrap gap-2 overflow-auto">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => cart.mutate(size)}
                  disabled={cart.isPending}
                  className="min-w-10 rounded-full border border-stone-300 px-3 py-2 text-xs transition hover:border-plum-900 hover:bg-plum-900 hover:text-white disabled:opacity-50"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Link to={`/products/${product.slug}`} className="mt-4 block">
        <p className="text-xs uppercase tracking-[.16em] text-stone-500">{product.collection}</p>
        <h3 className="mt-1 truncate font-display text-lg text-plum-950">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <span className="font-semibold">{money(product.price)}</span>
            {product.originalPrice && <span className="ml-2 text-sm text-stone-400 line-through">{money(product.originalPrice)}</span>}
          </div>
          <span className="flex items-center gap-1 text-xs text-stone-500"><Star size={13} fill="#b7924a" color="#b7924a" />{product.rating}</span>
        </div>
      </Link>
      <button
        onClick={quickAdd}
        disabled={cart.isPending}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-xs font-semibold transition md:hidden ${
          added ? "border-[#256b4a] bg-[#256b4a] text-white" : "border-plum-900 text-plum-900"
        }`}
      >
        {added ? <><Check size={15} /> Added to bag</> : <><ShoppingBag size={15} /> Add to bag</>}
      </button>
    </article>
  );
}
