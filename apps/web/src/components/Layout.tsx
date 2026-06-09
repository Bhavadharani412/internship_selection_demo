import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useUIStore } from "../store";
import type { Cart, Product } from "../types";

const nav = [
  ["New In", "/shop?sort=new"],
  ["Rings", "/shop?category=rings"],
  ["Earrings", "/shop?category=earrings"],
  ["Necklaces", "/shop?category=necklaces"],
  ["Bracelets", "/shop?category=bracelets"],
  ["Wedding", "/shop?occasion=Wedding"]
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { searchOpen, setSearchOpen } = useUIStore();
  const { data: wishlist } = useQuery({ queryKey: ["wishlist"], queryFn: () => api<Product[]>("/wishlist") });
  const { data: cart } = useQuery({ queryKey: ["cart"], queryFn: () => api<Cart>("/cart") });
  const navigate = useNavigate();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(String(form.get("q") || ""))}`);
  };

  return (
    <div className="min-h-screen">
      <a href="#main" className="fixed left-4 top-2 z-[100] -translate-y-20 bg-white px-4 py-2 focus:translate-y-0">Skip to content</a>
      <div className="bg-plum-950 px-4 py-2 text-center text-[11px] tracking-[.11em] text-white">COMPLIMENTARY INSURED SHIPPING · 15-DAY RETURNS</div>
      <header className="glass sticky top-0 z-40 border-b border-black/5">
        <div className="page-shell flex h-[76px] items-center justify-between">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
          <Link to="/" className="font-display text-2xl font-semibold tracking-[.1em] text-plum-900 sm:text-3xl">AURELIA</Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {nav.map(([label, href]) => <NavLink key={label} to={href} className="text-sm text-stone-600 transition hover:text-plum-900">{label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={20} /></button>
            <Link to="/wishlist" className="relative" aria-label="Wishlist"><Heart size={20} />{Boolean(wishlist?.data.length) && <Count value={wishlist!.data.length} />}</Link>
            <Link to="/cart" className="relative" aria-label="Shopping bag"><ShoppingBag size={20} />{Boolean(cart?.data.items.length) && <Count value={cart!.data.items.length} />}</Link>
            <div className="relative hidden sm:block">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="User menu"><User size={20} /></button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 rounded-2xl bg-white shadow-lg border border-stone-200">
                  <Link
                    to="/account/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-plum-50 first:rounded-t-2xl last:rounded-b-2xl border-b border-stone-100 last:border-b-0"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="block w-full px-4 py-3 text-sm text-left hover:bg-plum-50 last:rounded-b-2xl"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-ivory-50 p-6 reveal">
          <div className="flex items-center justify-between"><span className="font-display text-2xl tracking-widest text-plum-900">AURELIA</span><button onClick={() => setMobileOpen(false)}><X /></button></div>
          <nav className="mt-14 flex flex-col gap-7">{nav.map(([label, href]) => <Link key={label} to={href} onClick={() => setMobileOpen(false)} className="font-display text-3xl text-plum-950">{label}</Link>)}</nav>
          <Link to="/account/profile" onClick={() => setMobileOpen(false)} className="mt-12 inline-block border-b border-plum-900 pb-1 text-sm uppercase tracking-widest">My profile</Link>
          <Link to="/appointments" onClick={() => setMobileOpen(false)} className="mt-4 inline-block border-b border-plum-900 pb-1 text-sm uppercase tracking-widest">Book a consultation</Link>
        </div>
      )}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-plum-950/35 p-4 backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}>
          <div className="mx-auto mt-20 max-w-2xl rounded-3xl bg-ivory-50 p-6 soft-shadow" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl">What are you looking for?</h2><button onClick={() => setSearchOpen(false)}><X /></button></div>
            <form onSubmit={submit} className="mt-6 flex border-b border-stone-300 pb-3"><Search className="mr-3 text-stone-400" /><input autoFocus name="q" className="w-full bg-transparent text-lg outline-none" placeholder="Try diamond rings, gifts, pearls..." /></form>
            <div className="mt-5 flex flex-wrap gap-2">{["Gifts under ₹30K", "Everyday diamonds", "Wedding edit", "Rose gold"].map((term) => <button key={term} onClick={() => navigate(`/shop?q=${encodeURIComponent(term)}`)} className="rounded-full border border-stone-200 px-4 py-2 text-sm">{term}</button>)}</div>
          </div>
        </div>
      )}
      <main id="main">{children}</main>
      <footer className="mt-24 bg-plum-950 text-white">
        <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div><p className="font-display text-3xl tracking-widest">AURELIA</p><p className="mt-4 max-w-sm text-sm leading-7 text-white/65">Fine jewelry for everyday stories and extraordinary moments, crafted with care and chosen with confidence.</p></div>
          <div><p className="mb-4 text-xs uppercase tracking-widest text-white/50">Explore</p><div className="space-y-3 text-sm"><Link className="block" to="/shop">All jewelry</Link><Link className="block" to="/appointments">Book an appointment</Link><Link className="block" to="/wishlist">Your wishlist</Link><Link className="block" to="/account/profile">Your profile</Link></div></div>
          <div><p className="mb-4 text-xs uppercase tracking-widest text-white/50">Trust</p><div className="space-y-3 text-sm text-white/80"><p>Certified diamonds</p><p>Lifetime exchange</p><p>Insured delivery</p></div></div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/45">© 2026 Aurelia </div>
      </footer>
    </div>
  );
}

function Count({ value }: { value: number }) {
  return <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-plum-800 px-1 text-[9px] text-white">{value}</span>;
}
