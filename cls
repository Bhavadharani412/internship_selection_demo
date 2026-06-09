import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { z } from "zod";
import { defaultProfile, products, type Profile } from "./data.js";
import { ProductModel } from "./product.model.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const wishlists = new Map<string, Set<string>>();
const carts = new Map<string, Map<string, { productId: string; size: string; quantity: number }>>();
const appointments: Array<Record<string, unknown>> = [];
const profiles = new Map<string, Profile>();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: "200kb" }));

const owner = (request: express.Request) => String(request.header("x-client-id") || "demo-client");
const values = (value: unknown) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const send = (response: express.Response, data: unknown, meta: Record<string, unknown> = {}) =>
  response.json({ data, meta: { requestId: crypto.randomUUID(), ...meta }, error: null });

app.get("/api/v1/health", (_request, response) =>
  send(response, { status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "seeded-demo" })
);

app.get("/api/v1/products", (request, response) => {
  const query = String(request.query.q || "").trim().toLowerCase();
  const categories = values(request.query.category);
  const metalColors = values(request.query.metalColor);
  const gemstones = values(request.query.gemstone);
  const occasions = values(request.query.occasion);
  const priceMax = Number(request.query.priceMax || 0);
  const sort = String(request.query.sort || "popular");
  const page = Math.max(1, Number(request.query.page || 1));
  const limit = Math.min(48, Math.max(1, Number(request.query.limit || 12)));

  let result = products.filter((product) => {
    const searchable = [product.name, product.category, product.collection, product.description, product.gemstone, ...product.style]
      .join(" ")
      .toLowerCase();
    return (!query || searchable.includes(query)) &&
      (!categories.length || categories.includes(product.category)) &&
      (!metalColors.length || metalColors.includes(product.metalColor)) &&
      (!gemstones.length || gemstones.includes(product.gemstone)) &&
      (!occasions.length || occasions.some((occasion) => product.occasion.includes(occasion))) &&
      (!priceMax || product.price <= priceMax);
  });

  result = [...result].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "new") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
    return b.popularity - a.popularity;
  });

  const total = result.length;
  const start = (page - 1) * limit;
  const facets = {
    categories: [...new Set(products.map((product) => product.category))],
    metalColors: [...new Set(products.map((product) => product.metalColor))],
    gemstones: [...new Set(products.map((product) => product.gemstone))],
    occasions: [...new Set(products.flatMap((product) => product.occasion))]
  };
  send(response, { items: result.slice(start, start + limit), facets }, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

app.get("/api/v1/search/suggestions", (request, response) => {
  const query = String(request.query.q || "").toLowerCase();
  const suggestions = products
    .filter((product) => !query || product.name.toLowerCase().includes(query) || product.category.includes(query))
    .slice(0, 6)
    .map(({ id, name, slug, category, images, price }) => ({ id, name, slug, category, image: images[0], price }));
  send(response, suggestions);
});

app.get("/api/v1/products/:slug", (request, response) => {
  const product = products.find((item) => item.slug === request.params.slug || item.id === request.params.slug);
  if (!product) return response.status(404).json({ data: null, error: { code: "NOT_FOUND", message: "Product not found." } });
  return send(response, product);
});

app.get("/api/v1/products/:id/recommendations", (request, response) => {
  const current = products.find((item) => item.id === request.params.id);
  if (!current) return send(response, products.slice(0, 4));
  const ranked = products
    .filter((item) => item.id !== current.id)
    .map((item) => ({
      item,
      score:
        (item.category === current.category ? 30 : 0) +
        item.style.filter((style) => current.style.includes(style)).length * 20 +
        (item.metalColor === current.metalColor ? 10 : 0) +
        Math.max(0, 10 - Math.abs(item.price - current.price) / 10000)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ item }) => item);
  return send(response, ranked);
});

app.get("/api/v1/delivery-estimates", (request, response) => {
  const pincode = String(request.query.pincode || "");
  if (!/^\d{6}$/.test(pincode)) {
    return response.status(400).json({ data: null, error: { code: "VALIDATION_ERROR", message: "Enter a valid 6-digit pincode." } });
  }
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (Number(pincode.at(-1)) % 3) + 3);
  return send(response, { serviceable: true, estimatedDate: deliveryDate.toISOString(), insured: true });
});

app.get("/api/v1/wishlist", (request, response) => {
  const ids = wishlists.get(owner(request)) || new Set<string>();
  send(response, products.filter((product) => ids.has(product.id)));
});

app.get("/api/v1/profile", (request, response) => {
  const id = owner(request);
  const profile = profiles.get(id) || structuredClone(defaultProfile);
  profiles.set(id, profile);
  const cartCount = [...(carts.get(id) || new Map()).values()].reduce((total, item) => total + item.quantity, 0);
  const appointmentCount = appointments.filter((appointment) => appointment.ownerId === id).length;
  send(response, {
    ...profile,
    stats: {
      wishlistCount: (wishlists.get(id) || new Set()).size,
      cartCount,
      appointmentCount
    }
  });
});

app.patch("/api/v1/profile", (request, response) => {
  const profileSchema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    phone: z.string().min(8).max(20),
    birthday: z.string(),
    preferences: z.object({
      categories: z.array(z.string()).max(5),
      metalColors: z.array(z.string()).max(3),
      occasions: z.array(z.string()).max(8)
    }),
    address: z.object({
      label: z.string().min(1).max(30),
      line1: z.string().min(3).max(120),
      city: z.string().min(2).max(60),
      state: z.string().min(2).max(60),
      pincode: z.string().regex(/^\d{6}$/)
    })
  });
  const parsed = profileSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({
      data: null,
      error: { code: "VALIDATION_ERROR", message: "Please check your profile details." }
    });
  }
  const id = owner(request);
  const current = profiles.get(id) || structuredClone(defaultProfile);
  const updated: Profile = { ...current, ...parsed.data };
  profiles.set(id, updated);
  return send(response, updated);
});

app.post("/api/v1/wishlist/items", (request, response) => {
  const parsed = z.object({ productId: z.string() }).safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Product is required." } });
  const id = owner(request);
  const list = wishlists.get(id) || new Set<string>();
  list.add(parsed.data.productId);
  wishlists.set(id, list);
  return send(response, products.filter((product) => list.has(product.id)));
});

app.delete("/api/v1/wishlist/items/:productId", (request, response) => {
  const list = wishlists.get(owner(request)) || new Set<string>();
  list.delete(request.params.productId);
  return send(response, products.filter((product) => list.has(product.id)));
});

app.get("/api/v1/cart", (request, response) => {
  const lines = [...(carts.get(owner(request)) || new Map()).values()].map((line) => ({
    ...line,
    product: products.find((product) => product.id === line.productId)
  }))