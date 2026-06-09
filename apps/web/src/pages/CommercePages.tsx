import { CalendarCheck, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { api, money } from "../api";
import { ProductCard } from "../components/ProductCard";
import type { Cart, Product } from "../types";

export function WishlistPage() {
  const { data, isLoading } = useQuery({ queryKey: ["wishlist"], queryFn: () => api<Product[]>("/wishlist") });
  return <div className="page-shell py-12"><p className="text-xs uppercase tracking-[.22em] text-gold-500">Saved for later</p><h1 className="mt-3 font-display text-5xl text-plum-950">Your wishlist</h1><p className="mt-3 text-sm text-stone-500">{data?.data.length || 0} pieces you love</p>{isLoading ? <div className="mt-10 h-80 animate-pulse rounded-3xl bg-blush-100" /> : data?.data.length ? <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">{data.data.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <Empty icon={<span className="font-display text-5xl">♡</span>} title="Your wishlist is waiting" text="Save pieces you love and find them here whenever inspiration strikes." action="Discover jewelry" href="/shop" />}</div>;
}

export function CartPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["cart"], queryFn: () => api<Cart>("/cart") });
  const mutate = useMutation({
    mutationFn: ({ key, method, quantity }: { key: string; method: "PATCH" | "DELETE"; quantity?: number }) => api(`/cart/items/${encodeURIComponent(key)}`, { method, body: quantity ? JSON.stringify({ quantity }) : undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });
  const cart = data?.data;
  if (isLoading) return <div className="page-shell py-12"><div className="h-96 animate-pulse rounded-3xl bg-blush-100" /></div>;
  return <div className="page-shell py-12"><h1 className="font-display text-5xl text-plum-950">Your bag</h1>{!cart?.items.length ? <Empty icon={<ShoppingBag size={44} />} title="Your bag is empty" text="Find something made to become part of your story." action="Explore jewelry" href="/shop" /> : <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_390px]"><section className="divide-y divide-stone-200">{cart.items.map((line) => { const key = `${line.productId}:${line.size}`; return <article key={key} className="flex gap-5 py-6 first:pt-0"><img src={line.product.images[0]} alt={line.product.name} className="h-36 w-28 rounded-2xl object-cover sm:h-44 sm:w-36" /><div className="flex flex-1 flex-col"><p className="text-xs uppercase tracking-widest text-stone-400">{line.product.collection}</p><Link to={`/products/${line.product.slug}`} className="mt-1 font-display text-xl">{line.product.name}</Link><p className="mt-2 text-xs text-stone-500">Size: {line.size} · {line.product.metalColor}</p><p className="mt-3 font-semibold">{money(line.product.price)}</p><div className="mt-auto flex items-center justify-between"><div className="flex items-center rounded-full border border-stone-200"><button onClick={() => mutate.mutate({ key, method: "PATCH", quantity: Math.max(1, line.quantity - 1) })} className="p-2"><Minus size={14} /></button><span className="w-7 text-center text-xs">{line.quantity}</span><button onClick={() => mutate.mutate({ key, method: "PATCH", quantity: line.quantity + 1 })} className="p-2"><Plus size={14} /></button></div><button onClick={() => mutate.mutate({ key, method: "DELETE" })} className="text-stone-400 hover:text-plum-900" aria-label="Remove item"><Trash2 size={17} /></button></div></div></article>; })}</section><aside className="h-fit rounded-3xl bg-blush-100 p-7 lg:sticky lg:top-28"><h2 className="font-display text-2xl">Order summary</h2><div className="mt-6 space-y-3 border-b border-stone-300 pb-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div><div className="flex justify-between"><span>Insured shipping</span><span className="text-green-700">Complimentary</span></div></div><div className="flex justify-between py-5 font-semibold"><span>Total</span><span>{money(cart.total)}</span></div><button className="w-full rounded-full bg-plum-900 py-4 text-sm font-semibold text-white">Proceed securely</button><p className="mt-4 text-center text-[11px] leading-5 text-stone-500">Taxes included · Secure checkout · 15-day returns</p></aside></div>}</div>;
}

export function AppointmentPage() {
  const [params] = useSearchParams();
  const [date, setDate] = useState(() => { const value = new Date(); value.setDate(value.getDate() + 1); return value.toISOString().slice(0, 10); });
  const [time, setTime] = useState("");
  const [type, setType] = useState<"virtual" | "store">("virtual");
  const [confirmation, setConfirmation] = useState<{ id: string; date: string; time: string } | null>(null);
  const { data } = useQuery({ queryKey: ["slots", date], queryFn: () => api<Array<{ time: string; available: boolean }>>(`/appointments/availability?date=${date}`) });
  const booking = useMutation({
    mutationFn: (payload: Record<string, string>) => api<{ id: string; date: string; time: string }>("/appointments", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (result) => setConfirmation(result.data)
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    booking.mutate({ ...values as Record<string, string>, date, time, type, productId: params.get("productId") || "" });
  };
  if (confirmation) return <div className="page-shell py-20"><div className="mx-auto max-w-xl rounded-[2rem] bg-blush-100 p-10 text-center"><CalendarCheck className="mx-auto text-plum-900" size={50} /><p className="mt-6 text-xs uppercase tracking-widest text-gold-500">Appointment confirmed</p><h1 className="mt-3 font-display text-4xl">We look forward to meeting you.</h1><p className="mt-5 text-sm leading-7 text-stone-600">Your consultation is booked for <strong>{new Date(confirmation.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} at {confirmation.time}</strong>.</p><p className="mt-3 text-xs text-stone-500">Reference: {confirmation.id}</p><Link to="/" className="mt-8 inline-block rounded-full bg-plum-900 px-8 py-3.5 text-sm font-semibold text-white">Return home</Link></div></div>;
  return <div className="page-shell grid gap-10 py-12 lg:grid-cols-[.8fr_1.2fr]"><section className="rounded-[2rem] bg-plum-900 p-8 text-white md:p-12"><p className="text-xs uppercase tracking-[.22em] text-white/55">Complimentary consultation</p><h1 className="mt-4 font-display text-4xl md:text-5xl">A little guidance, entirely around you.</h1><p className="mt-6 leading-8 text-white/70">Meet a jewelry stylist for thoughtful recommendations on gifting, wedding looks, sizing, or finding your new everyday piece.</p><ul className="mt-10 space-y-4 text-sm text-white/80">{["Personalized product curation", "No purchase obligation", "Virtual or in-store", "30-minute private session"].map((item) => <li key={item} className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-gold-500" />{item}</li>)}</ul></section><form onSubmit={submit} className="rounded-[2rem] bg-white p-7 soft-shadow md:p-10"><h2 className="font-display text-3xl">Book your appointment</h2><div className="mt-7 grid grid-cols-2 gap-3">{(["virtual", "store"] as const).map((value) => <button type="button" key={value} onClick={() => setType(value)} className={`rounded-2xl border p-4 text-left capitalize ${type === value ? "border-plum-900 bg-plum-100" : "border-stone-200"}`}><strong className="block text-sm">{value}</strong><span className="text-xs text-stone-500">{value === "virtual" ? "Video consultation" : "Visit our studio"}</span></button>)}</div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Your name" name="name" placeholder="Full name" /><Field label="Email" name="email" type="email" placeholder="you@example.com" /><Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" /><Field label="Occasion" name="occasion" placeholder="Gift, wedding, everyday..." /></div><label className="mt-6 block text-sm font-semibold">Preferred date<input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDate(e.target.value); setTime(""); }} className="mt-2 w-full rounded-xl border border-stone-200 bg-transparent p-3 font-normal outline-none" /></label><div className="mt-6"><p className="text-sm font-semibold">Available times</p><div className="mt-3 grid grid-cols-3 gap-2">{data?.data.map((slot) => <button type="button" key={slot.time} disabled={!slot.available} onClick={() => setTime(slot.time)} className={`rounded-xl border px-3 py-3 text-sm ${time === slot.time ? "border-plum-900 bg-plum-900 text-white" : "border-stone-200"} disabled:opacity-30`}>{slot.time}</button>)}</div></div>{booking.isError && <p className="mt-4 text-sm text-red-700">{booking.error.message}</p>}<button disabled={!time || booking.isPending} className="mt-8 w-full rounded-full bg-plum-900 py-4 text-sm font-semibold text-white disabled:opacity-40">{booking.isPending ? "Confirming..." : "Confirm appointment"}</button></form></div>;
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder: string }) {
  return <label className="text-sm font-semibold">{label}<input required name={name} type={type} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-stone-200 bg-transparent p-3 font-normal outline-none" /></label>;
}

function Empty({ icon, title, text, action, href }: { icon: React.ReactNode; title: string; text: string; action: string; href: string }) {
  return <div className="mx-auto my-20 max-w-lg text-center"><div className="text-plum-900">{icon}</div><h2 className="mt-5 font-display text-3xl">{title}</h2><p className="mt-3 text-sm leading-6 text-stone-500">{text}</p><Link to={href} className="mt-7 inline-block rounded-full bg-plum-900 px-7 py-3.5 text-sm font-semibold text-white">{action}</Link></div>;
}
