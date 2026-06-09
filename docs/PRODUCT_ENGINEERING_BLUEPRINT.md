# Aurelia Product and Engineering Blueprint

## 1. Product Vision

### Vision

Aurelia helps customers move from "I want something meaningful" to "I am
confident this is right" through visual discovery, guided choice, transparent
product detail, and optional human consultation.

It is not a catalog with checkout controls. It is a premium decision-support
experience for emotionally important purchases.

### Value Proposition

- Discover by occasion, style, recipient, budget, and intent.
- Understand materials, pricing, fit, care, authenticity, and delivery.
- Save intent across sessions without forcing early account creation.
- Move naturally between self-service shopping and expert consultation.
- Build trust through transparent pricing, certification, returns, and service.

### Product Principles

1. Inspire first, narrow choices second.
2. Never hide essential purchase information behind interaction.
3. Make high-consideration decisions feel calm and reversible.
4. Treat mobile as the primary browsing and sharing surface.
5. Personalize progressively from explicit and behavioral signals.
6. Preserve user control over recommendations and saved data.

### Success Metrics

- North star: qualified product-detail engagement per active shopper.
- Discovery: search success rate, PLP-to-PDP rate, filter usage.
- Confidence: gallery completion, size-guide use, delivery-check use.
- Intent: wishlist rate, add-to-cart rate, appointment completion.
- Quality: Core Web Vitals, API error rate, accessibility violations.

## 2. User Personas

| Persona | Need | Friction | Product response |
| --- | --- | --- | --- |
| Rhea, 26, young professional | Daily-wear jewelry under a budget | Too many similar products | Shop by style, budget chips, lightweight filters |
| Arjun, 29, gift shopper | A meaningful gift by a date | Does not know jewelry language | Gift finder, recipient/occasion prompts, delivery promise |
| Meera, 31, wedding buyer | Coordinated pieces and expert reassurance | High price and fit anxiety | Wedding edits, set recommendations, consultation |
| Tara, 23, fashion explorer | New, stackable, social-ready pieces | Wants fast visual exploration | Editorial collections, quick view, recently viewed |

## 3. User Journeys

### Daily-Wear Discovery

Home editorial card -> "Everyday under INR 30k" -> PLP -> filter by metal and
delivery -> compare visually -> PDP -> inspect try-on imagery and price breakup
-> wishlist or cart.

### Gift With a Deadline

Home gift finder -> choose recipient, occasion, budget, delivery date -> ranked
results -> PDP -> pincode delivery check -> gift packaging -> cart.

### Wedding Consultation

Wedding landing/edit -> browse complete looks -> PDP/set detail -> book virtual
or store appointment -> select city/store/time -> confirmation and calendar link.

### Returning Shopper

Home -> recently viewed rail -> revisit product -> similar recommendations ->
wishlist -> cart. Anonymous state merges into the account after sign-in.

## 4. Information Architecture

The top-level model follows customer intent, not internal merchandising:

- Discover: new arrivals, trending, curated edits.
- Shop: rings, earrings, necklaces, bracelets, mangalsutras.
- Occasion: work, gifting, festive, wedding.
- Services: consultation, stores, care, sizing.
- Account intent: wishlist, cart, appointments, profile.

Global utilities: search, pincode, wishlist, cart, account.

## 5. Complete Sitemap

```text
/
|-- /shop
|   |-- /shop/rings
|   |-- /shop/earrings
|   |-- /shop/necklaces
|   |-- /shop/bracelets
|   `-- /shop/mangalsutras
|-- /collections/:slug
|-- /occasions/gifts
|-- /occasions/wedding
|-- /search?q=
|-- /products/:slug
|-- /wishlist
|-- /cart
|-- /appointments/new
|-- /appointments/confirmation/:id
|-- /stores
|-- /services/size-guide
|-- /services/jewelry-care
|-- /account
|   |-- /account/profile
|   |-- /account/orders
|   `-- /account/appointments
|-- /about
|-- /contact
|-- /shipping-returns
|-- /privacy
`-- /terms
```

Assignment delivery should implement `/`, PLP routes, `/search`, and
`/products/:slug`; wishlist, cart, appointment, and recently viewed should be
functional supporting flows.

## 6. Feature Prioritization

### Must Have

- Responsive home, PLP, PDP, user profile.
- Search with suggestions, result count, empty and error states.
- URL-backed sort and multi-select filters.
- Product gallery, variant selection, size, price breakup, delivery check.
- Wishlist, cart, recently viewed with anonymous persistence.
- User profile with preference management, address, and activity tracking.
- Recommendations using deterministic rules.
- Appointment booking happy path.
- Loading skeletons, accessible controls, analytics events.

### Good To Have

- Account sign-in and anonymous-state merge.
- Gift finder, compare tray, store inventory.
- Product reviews and user photos.
- Shareable wishlist, calendar file for appointments.
- Admin seed scripts and merchandising controls.

### Wow Factor

- Visual "complete the look" bundles.
- Preference quiz that explains its recommendations.
- Client-side image zoom and product video.
- Contextual concierge that hands off to an appointment.
- Camera-based virtual try-on as a separately scoped prototype.

## 7. Database Schema

Use MongoDB documents for read-heavy catalog data and references for mutable
entities. Store money as integer paise, never floating point.

### Product

```ts
interface Product {
  _id: ObjectId;
  name: string;
  slug: string;
  skuGroup: string;
  status: "draft" | "active" | "archived";
  category: "ring" | "earring" | "necklace" | "bracelet" | "mangalsutra";
  collectionIds: ObjectId[];
  occasionTags: string[];
  styleTags: string[];
  recipientTags: string[];
  description: string;
  story?: string;
  metal: { type: string; purity: string; color: string; weightGrams: number };
  gemstones: Array<{
    type: string; shape?: string; carat?: number; count: number; certification?: string;
  }>;
  variants: Array<{
    _id: ObjectId;
    sku: string;
    size?: string;
    metalColor: string;
    price: { mrp: number; selling: number; making: number; tax: number };
    inventory: { available: number; reserved: number };
    mediaIds: ObjectId[];
  }>;
  media: Array<{
    _id: ObjectId;
    type: "image" | "video";
    url: string;
    alt: string;
    width: number;
    height: number;
    position: number;
  }>;
  rating: { average: number; count: number };
  popularityScore: number;
  isNew: boolean;
  isBestseller: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Indexes:

```js
{ slug: 1 } unique
{ status: 1, category: 1, "variants.price.selling": 1 }
{ status: 1, styleTags: 1, occasionTags: 1 }
{ name: "text", description: "text", styleTags: "text" }
```

### User

```ts
interface User {
  _id: ObjectId;
  email: string;
  name: string;
  phone?: string;
  preferences: {
    categories: string[];
    styles: string[];
    metalColors: string[];
    budget?: { min: number; max: number };
  };
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Wishlist

```ts
interface Wishlist {
  _id: ObjectId;
  owner: { userId?: ObjectId; anonymousId?: string };
  items: Array<{ productId: ObjectId; variantId?: ObjectId; addedAt: Date }>;
  updatedAt: Date;
}
```

Unique partial indexes on `owner.userId` and `owner.anonymousId`.

### Cart

```ts
interface Cart {
  _id: ObjectId;
  owner: { userId?: ObjectId; anonymousId?: string };
  items: Array<{
    productId: ObjectId;
    variantId: ObjectId;
    quantity: number;
    priceSnapshot: number;
    addedAt: Date;
  }>;
  couponCode?: string;
  expiresAt: Date;
  updatedAt: Date;
}
```

Prices and inventory must be revalidated server-side on every cart read and
before checkout.

### Appointment

```ts
interface Appointment {
  _id: ObjectId;
  userId?: ObjectId;
  anonymousId?: string;
  type: "virtual" | "store";
  storeId?: ObjectId;
  startsAt: Date;
  durationMinutes: number;
  customer: { name: string; email: string; phone: string };
  interests: { productIds: ObjectId[]; occasion?: string; budget?: string };
  status: "confirmed" | "cancelled" | "completed" | "no_show";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Supporting Collections

- `collections`: title, slug, hero, rules, manually pinned products.
- `stores`: address, city, geo, services, opening hours.
- `availabilitySlots`: store/type/date/capacity/reserved.
- `events`: session, user/anonymous id, event name, product, metadata, timestamp.
- `searchSynonyms`: canonical term and synonyms.

## 8. REST API Design

Base URL: `/api/v1`. Use JSON, ISO 8601 UTC timestamps, cursor pagination for
behavioral feeds and page pagination for a shareable PLP.

### Response Envelope

```json
{
  "data": {},
  "meta": { "requestId": "req_123" },
  "error": null
}
```

Validation errors use:

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Review the highlighted fields.",
    "fields": { "pincode": "Enter a valid 6-digit pincode." }
  }
}
```

### Catalog and Search

```http
GET /products?category=ring&metalColor=rose-gold&priceMax=3000000&page=1&limit=24&sort=popular
GET /products/:slug
GET /products/:id/recommendations?strategy=similar&limit=8
GET /search?q=diamond+ring&category=ring&page=1
GET /search/suggestions?q=diam
GET /filters?category=ring
GET /collections/:slug
GET /delivery-estimates?pincode=560001&variantId=...
```

PLP response:

```json
{
  "data": {
    "items": [{ "id": "...", "name": "...", "slug": "...", "price": 2499000 }],
    "facets": {
      "metalColor": [{ "value": "rose-gold", "count": 28 }],
      "price": { "min": 599000, "max": 8999000 }
    }
  },
  "meta": { "page": 1, "limit": 24, "total": 142, "totalPages": 6 }
}
```

### Wishlist

```http
GET    /wishlist
POST   /wishlist/items                { "productId": "...", "variantId": "..." }
DELETE /wishlist/items/:productId
POST   /wishlist/merge                { "anonymousId": "..." }
```

Mutations are idempotent; adding an existing product returns the current item.

### Cart

```http
GET    /cart
POST   /cart/items                    { "variantId": "...", "quantity": 1 }
PATCH  /cart/items/:variantId         { "quantity": 2 }
DELETE /cart/items/:variantId
POST   /cart/merge                    { "anonymousId": "..." }
```

Cart responses include recalculated totals, inventory warnings, and price-change
warnings.

### Recently Viewed and Appointments

```http
GET  /recently-viewed?limit=12
POST /recently-viewed                 { "productId": "..." }
GET  /appointments/availability?type=store&storeId=...&date=2026-06-20
POST /appointments
GET  /appointments/:id
POST /appointments/:id/cancel
```

### User Profile

```http
GET    /profile
PATCH  /profile                       { "name": "...", "email": "...", "phone": "...", "birthday": "...", "preferences": {...}, "address": {...} }
```

Profile response includes user stats (wishlist count, cart count, appointments booked) and
preferences for personalized recommendations.

### API Rules

- Zod validation at every boundary.
- `Idempotency-Key` required for appointment creation.
- Rate limit search suggestions, pincode checks, auth, and appointment writes.
- Never trust client prices, availability, owner ids, or role claims.
- Return `ETag` or cache headers for catalog reads.

## 9. Folder Structure

```text
/
|-- apps/
|   |-- web/
|   |   |-- src/
|   |   |   |-- app/             # router, providers, layouts
|   |   |   |-- components/      # shared UI and commerce components
|   |   |   |-- features/        # cart, wishlist, search, appointments
|   |   |   |-- pages/
|   |   |   |-- services/        # API client
|   |   |   |-- stores/          # small client-only Zustand stores
|   |   |   |-- hooks/
|   |   |   |-- lib/
|   |   |   |-- styles/
|   |   |   |-- assets/
|   |   |   `-- test/
|   |   `-- public/
|   `-- api/
|       `-- src/
|           |-- config/
|           |-- modules/
|           |   |-- products/
|           |   |-- search/
|           |   |-- wishlist/
|           |   |-- cart/
|           |   `-- appointments/
|           |-- middleware/
|           |-- shared/
|           |-- jobs/
|           |-- app.ts
|           `-- server.ts
|-- packages/
|   |-- contracts/               # shared schemas and DTO types
|   |-- eslint-config/
|   `-- tsconfig/
|-- docs/
|-- scripts/                      # seed and asset scripts
|-- docker-compose.yml
`-- package.json
```

Use a pnpm workspace. Do not share Mongoose models with the browser; share only
validated contracts.

## 10. Frontend Architecture

- Feature-oriented modules with route-level lazy loading.
- TanStack Query owns all server state.
- React Router owns navigable state: query, filters, sort, page.
- Zustand owns only client workflow state that is not server state.
- Typed `fetch` wrapper handles base URL, headers, abort signals, and errors.
- Tailwind tokens express the design system; avoid one-off arbitrary values.
- Error boundaries at app, route, and high-value widget levels.

```text
App
`-- AppProviders
    |-- QueryClientProvider
    |-- RouterProvider
    |-- ToastProvider
    `-- AnalyticsProvider
```

Query keys:

```ts
productKeys.all
productKeys.list(normalizedFilters)
productKeys.detail(slug)
productKeys.recommendations(productId, strategy)
wishlistKeys.current(ownerKey)
cartKeys.current(ownerKey)
```

## 11. Backend Architecture

Use a modular monolith: simple to review and deploy, with clear future service
boundaries.

```text
route -> validation middleware -> controller -> service -> repository -> MongoDB
                                     |
                                     `-> domain policy / event publisher
```

- Controllers translate HTTP only.
- Services hold use cases and transaction boundaries.
- Repositories isolate Mongoose queries and projections.
- Domain policies cover pricing, inventory, merge, and slot capacity.
- Central error middleware maps typed errors to safe responses.
- Structured logs include request id, route, duration, status, anonymous/user id.
- Helmet, CORS allowlist, compression, rate limiting, payload limits.

Background jobs: expired cart cleanup, reminder notifications, popularity score
aggregation, and search index synchronization.

## 12. Responsive Design Strategy

Breakpoints should follow content pressure:

- Base: 320-639 px, one-column, sticky bottom PDP action.
- `sm`: 640 px, denser chips and two-column product grid.
- `md`: 768 px, tablet navigation and two-column PDP.
- `lg`: 1024 px, desktop header, filter sidebar, 3-4 column PLP.
- `xl`: 1280 px, max content width 1440 px and editorial whitespace.

Rules:

- Touch targets at least 44x44 px.
- Filters use a bottom sheet on mobile and sidebar on desktop.
- Avoid hover-only information.
- Product media controls remain reachable with one hand.
- Use `clamp()` typography and stable media aspect ratios.

## 13. State Management Strategy

| State | Owner |
| --- | --- |
| Products, search, wishlist, cart, slots | TanStack Query |
| Filters, sort, search term, pagination | URL search params |
| Mobile nav, modal state, compare tray | Local state or Zustand |
| Anonymous id, recent ids before sync | localStorage via versioned adapter |
| Form state | React Hook Form + Zod |

Optimistic updates are suitable for wishlist. Cart mutations should optimistically
change quantity but reconcile immediately because price and stock are authoritative.

## 14. Search Architecture

### MVP

MongoDB Atlas Search where available; fallback to MongoDB text index for local
development.

Pipeline:

1. Normalize Unicode, case, whitespace, and common jewelry spellings.
2. Apply synonyms: `ear tops -> studs`, `finger ring -> ring`.
3. Search name, category, tags, collection, metal, gemstone.
4. Boost exact phrase, name, category, popularity, in-stock, and newness.
5. Return facets alongside results.

Ranking sketch:

```text
score =
  textRelevance * 0.55 +
  popularity * 0.15 +
  availability * 0.10 +
  freshness * 0.05 +
  preferenceMatch * 0.15
```

Track query, result count, clicked position, refinements, and zero-result terms.
Never log raw sensitive personal input.

## 15. Filtering Architecture

- Canonical filter definitions come from the API.
- Multi-select within a facet uses OR; across facets uses AND.
- Query format: `metalColor=yellow-gold,rose-gold&style=minimal&priceMax=3000000`.
- The server validates allowlisted keys and values.
- Facet counts reflect the current query excluding that facet where practical.
- Selected filters remain visible as removable chips.
- "Clear all" preserves the search/category context.
- Update mobile results only after Apply; desktop may update with debounce.

## 16. Recommendation Engine Logic

Start explainable and deterministic; do not claim machine learning without data.

Candidate generation:

- Same category and collection.
- Shared style, occasion, metal, gemstone, and price band.
- Co-view and wishlist signals once enough events exist.
- Exclude current, inactive, and unavailable products.

Scoring:

```text
similarity =
  categoryMatch * 30 +
  styleOverlap * 20 +
  occasionOverlap * 15 +
  metalMatch * 10 +
  gemstoneMatch * 10 +
  priceProximity * 10 +
  popularityNormalized * 5
```

For "complete the look", require a complementary category and reward shared
collection, metal color, and visual style. Add diversity caps so a rail is not
eight near-identical products. Display a reason such as "Similar minimal style."

## 17. Wishlist Design

- Heart control on cards and PDP with accessible pressed state.
- Anonymous wishlist keyed by a random first-party id.
- Optimistic add/remove with rollback and toast.
- On login, union anonymous and account items by product/variant.
- Wishlist page shows price changes and unavailable products without deleting
  user intent.
- Wishlist count comes from cached data, not an independent mutable counter.

## 18. Cart Design

- Cart drawer for quick confirmation; full cart route for editing.
- Require a concrete variant before add.
- Show product, variant, size, price, delivery estimate, and stock warning.
- Server recalculates subtotal, discount, shipping, tax, and total.
- Quantity writes are idempotent and capped by stock/business rules.
- Cart merge combines matching variants, respects limits, and reports conflicts.
- Persist anonymous carts server-side with a TTL; local storage is a fallback.

Checkout/payment is intentionally out of scope unless the assignment explicitly
requires it. A polished cart is stronger than a fake payment flow.

## 19. Appointment Booking Feature

Flow:

1. Select virtual or store consultation.
2. Select store/city when relevant.
3. Choose date and live availability slot.
4. Add contact details, occasion, budget, and products of interest.
5. Review and confirm.
6. Show confirmation id, calendar download, and cancellation action.

Prevent double booking with an atomic conditional update against slot capacity.
Normalize all storage to UTC and render in the store/customer timezone. Validate
India phone numbers without assuming every user has one. Consent must be
separate from marketing opt-in.

## 20. Recently Viewed Feature

- Record a PDP view after meaningful dwell or gallery interaction, not route
  prefetch.
- Keep the latest 20 unique product ids with timestamps.
- Anonymous: local storage plus optional server sync.
- Signed in: server collection; merge by latest timestamp.
- Do not show the rail with fewer than three valid products.
- Provide a clear-history control and honor privacy preference.

## 21. Performance Optimizations

- Target LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at the 75th percentile.
- Responsive AVIF/WebP, intrinsic dimensions, hero preload, lazy loading.
- Route and heavy-widget code splitting.
- CDN cache catalog images and immutable hashed assets.
- Cache public catalog reads; use stale-while-revalidate semantics.
- Debounce search suggestions and cancel stale requests.
- Use projections and lean Mongo reads for PLP cards.
- Virtualize only after measurement; pagination is preferable for SEO.
- Bundle analysis in CI with a size budget.
- Skeletons must preserve final geometry.

## 22. Accessibility Improvements

- WCAG 2.2 AA target.
- Semantic landmarks, real buttons/links, logical headings.
- Visible focus states and skip-to-content.
- Keyboard-operable gallery, dialogs, drawers, filters, and menus.
- Trap and restore focus in modal surfaces.
- Announce wishlist/cart updates with a polite live region.
- Product swatches include text labels; color is never the only signal.
- Alt text describes the product and view; decorative editorial art uses empty alt.
- Respect reduced motion and maintain 4.5:1 text contrast.
- Error messages are associated with fields and summarized on submit.

## 23. SEO Strategy

- Prefer SSR/prerendering for production commerce; for the Vite assignment use
  static prerendering of home and key collection routes where feasible.
- Unique title, description, canonical URL, and social cards.
- Product JSON-LD with price, availability, SKU, aggregate rating when genuine.
- BreadcrumbList JSON-LD on PLP/PDP.
- Human-readable slugs and crawlable pagination links.
- Canonicalize harmless filter permutations; noindex thin internal search pages.
- XML sitemap, robots.txt, image sitemap, and 404 handling.
- Never publish fabricated reviews in structured data.

## 24. Testing Strategy

### Unit

- Money formatting, filter serialization, ranking, cart totals, merge rules.
- Vitest with deterministic fixtures.

### Component

- Product card, gallery, filters, variant selector, appointment form.
- React Testing Library; assert behavior and accessibility roles.

### API Integration

- Supertest against isolated Mongo test database.
- Validation, authorization, pagination, stock, merge, double-booking.

### End to End

- Home -> PLP -> filters -> PDP.
- Wishlist survives reload.
- Add configured variant to cart.
- Book and cancel appointment.
- Mobile navigation and filter sheet.

Use Playwright with API seeding. Add axe checks to critical routes. CI gates:
typecheck, lint, unit, integration, build, and a small E2E smoke suite.

## 25. Deployment Strategy

### Recommended Assignment Setup

- Web: Vercel or Netlify.
- API: Render, Railway, or Fly.io.
- Database: MongoDB Atlas.
- Media: Cloudinary or an image CDN.
- CI: GitHub Actions.

Environments: local, preview/staging, production. Validate environment variables
at startup. Use separate databases and credentials. Configure CORS by exact
origin. Add health/readiness endpoints, structured logs, error monitoring, and
database backups. Seed demo data via an explicit versioned command.

Production rollout:

1. CI test and build.
2. Deploy API and run backward-compatible migration/seed tasks.
3. Smoke test health and read endpoints.
4. Deploy web.
5. Run E2E smoke tests against production.
6. Roll back immutable release on failure.

## 26. README Structure

The final project README should contain:

1. Product pitch and screenshots.
2. Live demo and API links.
3. Feature highlights and scope decisions.
4. Architecture diagram.
5. Stack and key tradeoffs.
6. Local setup, environment variables, seed commands.
7. Scripts and testing commands.
8. API documentation link.
9. Accessibility and performance results.
10. Image/data credits.
11. Known limitations and future work.

## 27. Professional Git Commit Plan

Keep commits reviewable and independently valid:

```text
chore: initialize pnpm workspace and shared TypeScript config
chore: configure linting formatting testing and CI
feat(web): add design tokens typography and application shell
feat(api): add Express foundation validation and error handling
feat(api): add product model seed data and catalog endpoints
feat(web): build responsive home discovery experience
feat(web): add product listing filters sorting and pagination
feat(web): add accessible product detail gallery and variants
feat(search): add suggestions facets and ranked results
feat(wishlist): support anonymous persistence and optimistic updates
feat(cart): add server-validated cart and merge behavior
feat(recent): add privacy-aware recently viewed products
feat(recommendations): add explainable product ranking
feat(appointments): add availability and booking flow
test: cover core commerce and appointment journeys
perf: optimize media loading caching and route bundles
docs: add architecture setup API and image credits
```

Do not use commits such as "final", "changes", or one giant assignment commit.

## 28. Production-Level Component Breakdown

### Shared Foundation

```text
AppShell
|-- AnnouncementBar
|-- Header
|   |-- DesktopNavigation
|   |-- MobileNavigationDrawer
|   |-- SearchTrigger
|   `-- HeaderActions
|-- Breadcrumbs
|-- Main
|-- Footer
`-- GlobalOverlays
    |-- SearchPalette
    |-- CartDrawer
    `-- ToastViewport
```

Core UI: `Button`, `IconButton`, `Link`, `Input`, `Select`, `Checkbox`,
`RadioGroup`, `Price`, `Badge`, `Chip`, `Dialog`, `Drawer`, `Popover`,
`Skeleton`, `Carousel`, `EmptyState`, `ErrorState`.

### Home Page

```text
HomePage
|-- HeroCampaign
|-- CategoryQuickLinks
|-- IntentEntryPoints
|   |-- GiftFinderCard
|   |-- EverydayEditCard
|   `-- WeddingConsultationCard
|-- ProductRail "Trending Now"
|-- EditorialCollectionGrid
|-- TrustStrip
|-- RecentlyViewedRail
`-- ConsultationBanner
```

### Product Listing Page

```text
ProductListingPage
|-- CollectionHeader
|-- ResultToolbar
|   |-- ResultCount
|   |-- ActiveFilterChips
|   |-- SortSelect
|   `-- MobileFilterTrigger
|-- FilterSidebar / FilterDrawer
|   |-- PriceFilter
|   |-- CategoryFilter
|   |-- MetalFilter
|   |-- GemstoneFilter
|   |-- StyleFilter
|   `-- DeliveryFilter
|-- ProductGrid
|   `-- ProductCard
|       |-- ProductMedia
|       |-- WishlistButton
|       |-- ProductMeta
|       `-- ColorOptions
|-- Pagination
`-- PLPEmptyState
```

### Product Detail Page

```text
ProductDetailPage
|-- ProductGallery
|   |-- ThumbnailRail
|   |-- MainMedia
|   |-- ZoomDialog
|   `-- MediaControls
|-- ProductPurchasePanel
|   |-- ProductIdentity
|   |-- RatingSummary
|   |-- ProductPrice
|   |-- MetalColorSelector
|   |-- SizeSelector
|   |-- SizeGuideDialog
|   |-- DeliveryChecker
|   |-- AddToCartButton
|   |-- WishlistButton
|   `-- TrustSummary
|-- ProductStory
|-- ProductSpecifications
|-- PriceBreakupAccordion
|-- ShippingReturnsAccordion
|-- CareAccordion
|-- CompleteTheLook
|-- SimilarProducts
`-- AppointmentCTA
```

### Supporting Features

```text
WishlistPage -> WishlistGrid -> WishlistItem
CartPage -> CartItemList + CartSummary + TrustPanel
AppointmentPage -> TypeStep -> LocationStep -> SlotStep -> DetailsStep -> ReviewStep
SearchPalette -> SearchInput + Suggestions + RecentSearches + TrendingTerms
```

## Visual System

### Palette

Use a distinct, inspired palette rather than cloning CaratLane:

```css
--color-ink: #211A20;
--color-plum: #5B284E;
--color-rose: #B76E79;
--color-blush: #F7ECEF;
--color-ivory: #FCF9F4;
--color-gold: #B7924A;
--color-stone: #746C70;
--color-border: #E8DFE2;
--color-success: #256B4A;
```

Typography: an editorial serif such as Cormorant Garamond for display and a
high-legibility sans such as Inter for UI. Self-host production fonts.

Motion: 160-240 ms for UI feedback, 300-500 ms for editorial reveal, transform
and opacity only where possible, disabled under reduced-motion preferences.

## Analytics Event Contract

```text
home_campaign_view
home_campaign_click
search_submitted
search_suggestion_selected
filter_applied
sort_changed
product_list_viewed
product_selected
product_gallery_viewed
variant_selected
delivery_checked
wishlist_added
wishlist_removed
cart_added
cart_updated
recommendation_selected
appointment_started
appointment_completed
```

Every event includes `eventId`, `occurredAt`, `sessionId`, route, device class,
and only the minimum relevant product/context fields.

## Development Roadmap

### Phase 0: Definition - 0.5 day

- Freeze scope and acceptance criteria.
- Select 24-40 representative products and licensed imagery.
- Produce low-fidelity home, PLP, and PDP flows.

### Phase 1: Foundation - 1.5 days

- Workspace, CI, design tokens, app shell, API foundation.
- Mongo connection, schemas, seed command, shared contracts.

### Phase 2: Core Browse - 3 days

- Home, PLP, search, URL filters, sorting, pagination.
- Responsive behavior, skeletons, empty and failure states.

### Phase 3: Product Confidence - 2 days

- PDP gallery, variants, sizing, price breakup, delivery estimate, trust content.

### Phase 4: Intent Features - 2 days

- Wishlist, cart, recently viewed, deterministic recommendations.

### Phase 5: Appointment - 1.5 days

- Availability API, booking wizard, atomic capacity handling, confirmation.

### Phase 6: Quality and Delivery - 2 days

- Automated tests, accessibility audit, performance budget, SEO, deployment,
  screenshots, architecture notes, and demo script.

## Hiring-Manager Demo Narrative

1. Start with a user problem, not the stack.
2. Show discovery paths for a gift shopper and daily-wear shopper.
3. Demonstrate URL-persistent filters and server-backed facets.
4. Explain confidence features on PDP.
5. Show anonymous wishlist/cart persistence and merge design.
6. Book an appointment and explain atomic slot protection.
7. Close with measured accessibility, performance, tests, and tradeoffs.

The strongest submission is not the one with the most features. It is the one
where every visible feature has complete states, clear ownership, credible data
contracts, and an explicit reason to exist.
