# Aurelia - Premium Jewelry Commerce

Aurelia is a portfolio-grade, full-stack jewelry discovery experience inspired by
the product thinking behind modern luxury commerce. It is designed for young
professionals, gift shoppers, wedding buyers, and fashion-conscious customers.

This repository contains a working full-stack product and its implementation blueprint:

- [Product and Engineering Blueprint](docs/PRODUCT_ENGINEERING_BLUEPRINT.md)
- [Image Sourcing Manifest](docs/IMAGE_SOURCING.md)

## Proposed Stack

- React, TypeScript, Vite, Tailwind CSS
- TanStack Query, React Router, Zustand
- Node.js, Express, TypeScript, MongoDB
- Vitest, React Testing Library, Playwright, Supertest

## Run Locally

Prerequisites: Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:5173`. The API runs on `http://localhost:4000`.

MongoDB is optional for the portfolio demo. Copy `.env.example` to `.env` and
set `MONGODB_URI` to connect Atlas; otherwise the API uses its realistic seeded
catalog and in-memory customer state.

```bash
pnpm build
pnpm typecheck
```

## Implemented Journeys

- Editorial home and category discovery
- Search, URL-persistent filters, sorting, and responsive PLP
- Product gallery, variants, delivery check, details, and recommendations
- Anonymous wishlist, cart, quantity updates, and recently viewed products
- Virtual/in-store appointment availability and confirmation
- User profile with preferences, address, and activity tracking
- Responsive navigation, loading/empty/error states, keyboard focus, reduced motion

## Product Principles

1. Discovery before catalog navigation.
2. Confidence before conversion.
3. Personalization without requiring sign-in.
4. Luxury through restraint, clarity, and responsiveness.
5. Mobile-first, accessible, observable, and testable by default.

## Delivery Phases

1. Foundation: design system, app shell, API conventions, seed data.
2. Discovery: home page, product listing, search, filters.
3. Confidence: product detail, pricing transparency, delivery and trust.
4. Intent: wishlist, cart, recently viewed, recommendations.
5. Omnichannel: appointment booking and confirmation.
6. Hardening: testing, accessibility, performance, SEO, deployment.

See the blueprint for acceptance criteria, route contracts, schemas, component
hierarchy, architecture decisions, and a professional commit sequence.
