import { ArrowRight, CalendarDays, Gem, Gift, RefreshCw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api";
import { ProductCard } from "../components/ProductCard";
import { useUIStore } from "../store";
import type { Product } from "../types";

export function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => api<{ items: Product[] }>("/products?limit=8")
  });
  const recent = useUIStore((state) => state.recent);
  const recentProducts = data?.data.items.filter((product) => recent.includes(product.id)).slice(0, 4) || [];

  return (
    <>
      <section className="relative min-h-[680px] overflow-hidden bg-plum-100 md:min-h-[760px]">
        <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=88" alt="Fine gold jewelry arranged on blush fabric" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-plum-950/70 via-plum-950/20 to-transparent" />
        <div className="page-shell relative flex min-h-[680px] items-end pb-16 md:min-h-[760px] md:items-center md:pb-0">
          <div className="max-w-xl text-white reveal">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[.28em]">The Afterglow Collection</p>
            <h1 className="font-display text-5xl leading-[1.03] sm:text-6xl md:text-7xl">Jewelry that feels like you.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/85">Light-catching diamonds, modern gold, and meaningful pieces made for every version of your story.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-plum-950 transition hover:bg-blush-100">Explore the collection</Link>
              <Link to="/appointments" className="rounded-full border border-white/55 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Meet a stylist</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-20">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[.25em] text-gold-500">Find your piece</p>
          <h2 className="mt-3 font-display text-4xl text-plum-950 md:text-5xl">Shop by category</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Rings", "rings", "photo-1605100804763-247f67b3557e"],
            ["Earrings", "earrings", "photo-1535632066927-ab7c9ab60908"],
            ["Necklaces", "necklaces", "photo-1599643478518-a784e5dc4c8f"],
            ["Bracelets", "bracelets", "photo-1611591437281-460bfbe1220a"]
          ].map(([label, value, photo]) => (
            <Link key={value} to={`/shop?category=${value}`} className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-blush-100">
              <img src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=700&q=82`} alt={`${label} collection`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-20 text-white"><span className="font-display text-2xl">{label}</span><ArrowRight className="mt-2" size={18} /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-blush-100 py-20">
        <div className="page-shell">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div><p className="text-xs uppercase tracking-[.25em] text-gold-500">Loved right now</p><h2 className="mt-3 font-display text-4xl text-plum-950">Trending pieces</h2></div>
            <Link to="/shop" className="hidden items-center gap-2 border-b border-plum-900 pb-1 text-sm md:flex">View all <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">
            {isLoading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-3xl bg-white/70" />) : data?.data.items.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-5 py-20 md:grid-cols-3">
        <IntentCard icon={<Gift />} eyebrow="Thoughtful gifting" title="Make it personal" text="Discover pieces by relationship, moment, and budget." href="/shop?occasion=Gift" tone="bg-[#e8d8d0]" />
        <IntentCard icon={<Sparkles />} eyebrow="The wedding edit" title="For every celebration" text="Modern heirlooms and complete looks, chosen with an expert." href="/shop?occasion=Wedding" tone="bg-[#d9d0dc]" />
        <IntentCard icon={<CalendarDays />} eyebrow="One-to-one guidance" title="Meet your jewelry stylist" text="Book a virtual or in-store appointment at your pace." href="/appointments" tone="bg-[#e7dfca]" />
      </section>

      <section className="page-shell overflow-hidden rounded-[2rem] bg-plum-900 text-white md:grid md:grid-cols-2">
        <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1100&q=85" alt="Layered fine gold necklaces" className="h-[380px] w-full object-cover md:h-[560px]" />
        <div className="flex flex-col justify-center p-8 md:p-14">
          <p className="text-xs uppercase tracking-[.25em] text-white/60">Crafted with intention</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Beauty you can believe in.</h2>
          <p className="mt-5 max-w-lg leading-8 text-white/70">Every Aurelia piece comes with transparent pricing, certified materials, insured delivery, and lifetime care. Because confidence is part of the design.</p>
          <Link to="/shop" className="mt-8 flex w-fit items-center gap-2 border-b border-white/50 pb-2 text-sm">Discover our craft <ArrowRight size={16} /></Link>
        </div>
      </section>

      {recentProducts.length >= 1 && <section className="page-shell py-20"><h2 className="mb-8 font-display text-3xl text-plum-950">Continue exploring</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{recentProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}

      <section className="page-shell grid grid-cols-2 gap-6 py-16 text-center md:grid-cols-4">
        {[[<Gem />, "Certified quality", "Every stone verified"], [<Truck />, "Insured delivery", "Secure, trackable shipping"], [<RefreshCw />, "15-day returns", "Easy and transparent"], [<ShieldCheck />, "Lifetime care", "Support beyond purchase"]].map(([icon, title, text]) => <div key={String(title)} className="flex flex-col items-center">{icon}<h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-stone-500">{text}</p></div>)}
      </section>
    </>
  );
}

function IntentCard({ icon, eyebrow, title, text, href, tone }: { icon: React.ReactNode; eyebrow: string; title: string; text: string; href: string; tone: string }) {
  return <Link to={href} className={`${tone} group rounded-[2rem] p-7 transition hover:-translate-y-1`}><div className="text-plum-900">{icon}</div><p className="mt-8 text-xs uppercase tracking-[.2em] text-stone-600">{eyebrow}</p><h3 className="mt-3 font-display text-3xl text-plum-950">{title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{text}</p><ArrowRight className="mt-6 transition group-hover:translate-x-1" size={19} /></Link>;
}
