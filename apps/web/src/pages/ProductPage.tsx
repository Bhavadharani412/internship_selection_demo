import { CalendarDays, Check, ChevronDown, Heart, PackageCheck, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, money } from "../api";
import { ProductCard } from "../components/ProductCard";
import { useUIStore } from "../store";
import type { Product } from "../types";

export function ProductPage() {
  const { slug = "" } = useParams();
  const queryClient = useQueryClient();
  const [image, setImage] = useState(0);
  const [size, setSize] = useState("");
  const [pincode, setPincode] = useState("");
  const [delivery, setDelivery] = useState("");
  const [added, setAdded] = useState(false);
  const addRecent = useUIStore((state) => state.addRecent);
  const { data, isLoading } = useQuery({ queryKey: ["product", slug], queryFn: () => api<Product>(`/products/${slug}`) });
  const product = data?.data;
  const { data: recommendations } = useQuery({ queryKey: ["recommendations", product?.id], queryFn: () => api<Product[]>(`/products/${product!.id}/recommendations`), enabled: Boolean(product) });
  const { data: wishlist } = useQuery({ queryKey: ["wishlist"], queryFn: () => api<Product[]>("/wishlist") });
  const wished = Boolean(product && wishlist?.data.some((item) => item.id === product.id));
  useEffect(() => { if (product) { addRecent(product.id); setSize(product.sizes.length === 1 ? product.sizes[0] : ""); } }, [product, addRecent]);

  const wishlistMutation = useMutation({
    mutationFn: () => api(`/wishlist/items${wished ? `/${product!.id}` : ""}`, { method: wished ? "DELETE" : "POST", body: wished ? undefined : JSON.stringify({ productId: product!.id }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] })
  });
  const cartMutation = useMutation({
    mutationFn: () => api("/cart/items", { method: "POST", body: JSON.stringify({ productId: product!.id, size, quantity: 1 }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cart"] }); setAdded(true); }
  });
  const checkDelivery = async () => {
    try {
      const response = await api<{ estimatedDate: string }>(`/delivery-estimates?pincode=${pincode}`);
      setDelivery(`Delivery by ${new Date(response.data.estimatedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`);
    } catch (error) { setDelivery((error as Error).message); }
  };

  if (isLoading) return <div className="page-shell grid gap-8 py-10 md:grid-cols-2"><div className="aspect-[4/5] animate-pulse rounded-3xl bg-blush-100" /><div className="h-96 animate-pulse rounded-3xl bg-blush-100" /></div>;
  if (!product) return <div className="page-shell py-24 text-center"><h1 className="font-display text-4xl">This piece could not be found.</h1><Link to="/shop" className="mt-6 inline-block underline">Explore all jewelry</Link></div>;

  return (
    <div className="page-shell py-6 md:py-10">
      <p className="mb-6 text-xs text-stone-500"><Link to="/">Home</Link> / <Link to={`/shop?category=${product.category}`} className="capitalize">{product.category}</Link> / {product.name}</p>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
        <section>
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-blush-100"><img src={product.images[image]} alt={`${product.name}, view ${image + 1}`} className="h-full w-full object-cover" /></div>
          <div className="mt-3 flex gap-3">{product.images.map((url, index) => <button key={url} onClick={() => setImage(index)} className={`h-20 w-16 overflow-hidden rounded-xl border-2 ${image === index ? "border-plum-900" : "border-transparent"}`}><img src={url} alt="" className="h-full w-full object-cover" /></button>)}</div>
        </section>
        <section className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs uppercase tracking-[.22em] text-gold-500">{product.collection}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-plum-950 md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm"><span className="flex items-center gap-1"><Star size={15} fill="#b7924a" color="#b7924a" /> {product.rating}</span><span className="text-stone-400">({product.reviews} reviews)</span><span className="text-stone-300">|</span><span className="text-success">In stock</span></div>
          <div className="mt-7"><span className="text-2xl font-semibold">{money(product.price)}</span>{product.originalPrice && <span className="ml-3 text-stone-400 line-through">{money(product.originalPrice)}</span>}<p className="mt-1 text-xs text-stone-500">Inclusive of all taxes</p></div>
          <p className="mt-6 leading-7 text-stone-600">{product.description}</p>
          <div className="mt-7"><div className="mb-3 flex justify-between"><label className="text-sm font-semibold">Choose size</label><button className="text-xs underline">Size guide</button></div><div className="flex flex-wrap gap-2">{product.sizes.map((item) => <button key={item} onClick={() => setSize(item)} className={`min-w-12 rounded-full border px-4 py-2.5 text-sm transition ${size === item ? "border-plum-900 bg-plum-900 text-white" : "border-stone-300 hover:border-plum-900"}`}>{item}</button>)}</div></div>
          <div className="mt-7 flex gap-3">
            <button onClick={() => cartMutation.mutate()} disabled={!size || cartMutation.isPending} className="flex-1 rounded-full bg-plum-900 py-4 text-sm font-semibold text-white transition hover:bg-plum-800 disabled:cursor-not-allowed disabled:opacity-45">{added ? "Added to bag" : size ? "Add to bag" : "Select a size"}</button>
            <button onClick={() => wishlistMutation.mutate()} className="grid h-[52px] w-[52px] place-items-center rounded-full border border-plum-900 text-plum-900" aria-label="Toggle wishlist"><Heart fill={wished ? "currentColor" : "none"} /></button>
          </div>
          {added && <Link to="/cart" className="mt-3 block text-center text-sm font-semibold text-plum-900 underline">View your bag</Link>}
          <div className="mt-8 rounded-2xl bg-blush-100 p-5"><p className="mb-3 text-sm font-semibold">Check delivery</p><div className="flex rounded-full border border-stone-300 bg-white p-1"><input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" placeholder="6-digit pincode" inputMode="numeric" /><button onClick={checkDelivery} className="rounded-full bg-plum-100 px-5 py-2 text-xs font-semibold text-plum-900">Check</button></div>{delivery && <p className="mt-3 flex items-center gap-2 text-xs text-stone-600"><Check size={14} />{delivery}</p>}</div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[11px] text-stone-600">{[[<ShieldCheck />, "Certified"], [<Truck />, "Insured delivery"], [<PackageCheck />, "15-day returns"]].map(([icon, label]) => <div key={String(label)} className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 p-3">{icon}{label}</div>)}</div>
          <div className="mt-7 divide-y divide-stone-200 border-y border-stone-200">{["Product details", "Price breakup", "Shipping & returns", "Jewelry care"].map((label) => <button key={label} className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold">{label}<ChevronDown size={17} /></button>)}</div>
          <Link to={`/appointments?productId=${product.id}`} className="mt-6 flex items-center gap-4 rounded-2xl border border-plum-200 p-5"><CalendarDays className="text-plum-900" /><span><strong className="block font-display text-lg">Need a little guidance?</strong><span className="text-xs text-stone-500">Book a complimentary styling appointment.</span></span></Link>
        </section>
      </div>
      <section className="my-20 rounded-[2rem] bg-plum-100 p-8 text-center md:p-14"><Sparkles className="mx-auto text-gold-500" /><p className="mt-5 text-xs uppercase tracking-[.2em] text-stone-500">The story</p><h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl leading-snug text-plum-950 md:text-4xl">“{product.story}”</h2><p className="mt-5 text-sm text-stone-500">{product.metal} · {product.gemstone} · {product.metalColor}</p></section>
      <section><h2 className="mb-8 font-display text-3xl text-plum-950">You may also love</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{recommendations?.data.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>
    </div>
  );
}
