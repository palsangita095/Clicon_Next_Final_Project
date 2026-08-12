# E-commerce Platform with Admin Panel

A full-stack e-commerce platform with a customer storefront and a complete admin panel, built with **Next.js (App Router)** and **Supabase**, styled with **Tailwind CSS** and **shadcn/ui**. It includes Stripe-powered payments, an AI shopping assistant, order tracking, reviews & ratings, wishlist, and an inventory-aware admin dashboard.

## Live Website

[![Deployed on Vercel](https://img.shields.io/badge/Live_Demo-View_Project-brightgreen?style=for-the-badge&logo=vercel)](https://clicon-next-final-project.vercel.app/)

Click the badge above to visit the deployed live website.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Framework  | [Next.js 16](https://nextjs.org) (App Router, SSR) + React 19 + TypeScript |
| Styling    | Tailwind CSS v4, shadcn/ui, next-themes (light/dark), tw-animate-css |
| State      | Zustand (storefront, auth, notifications, AI chat) + TanStack Query |
| Backend    | [Supabase](https://supabase.com) — PostgreSQL, Auth, Storage, Realtime |
| Payments   | Stripe (Payment Element + PaymentIntent + webhooks) |
| AI         | Google Generative AI (`@google/genai`, `@ai-sdk/google`) — "Clicon AI" assistant |
| PDF        | `@react-pdf/renderer` — PDF invoice generation |
| Forms      | react-hook-form + yup / zod validation |
| Charts     | recharts (admin dashboard) |
| UI/Utils   | radix-ui, lucide-react, sonner (toasts), motion, lottie-react, leaflet |

## Features

### Storefront (Customers)

- **Home Page** — hero banner, features bar, best deals, shop by category, featured products, promo banners, flash sale, latest news, and more.
- **Product Listings** — categorized products with search, filters (category, price range, ratings), and sorting (price, popularity, etc.).
- **Product Details** — image gallery, description, price, and customer reviews & ratings.
- **Cart & Checkout** — add products, manage quantities, apply coupons, choose Cash-on-Delivery or pay via Stripe (card/UPI etc.). Orders are placed on the **Order button**; payment gateway integration included via Stripe.
- **Order Tracking** — track orders by order ID + billing email with real-time status updates (4-step progress UI).
- **User Accounts** — register/login with email & password (Supabase Auth), email verification, order history, order details with downloadable **PDF invoice**, manage addresses/cards, and browsing history.
- **Wishlist** — save products for later.
- **Compare** — compare multiple products side-by-side.
- **Reviews & Ratings** — submit reviews and rate purchased (delivered) products; reviews appear after admin approval.
- **AI Assistant** — "Clicon AI" chatbot built on Google Generative AI.
- **Extras** — blog, FAQ, contact, customer support, newsletter, coupon/promotions, store settings driven (logo, contact, tax, shipping, theme color), currency displayed in INR.

### Admin Panel

- **Dashboard** — overview of sales, revenue, orders, conversion rate; weekly revenue chart, category pie chart, latest orders.
- **Product Management** — add, edit, delete products; upload images (Supabase Storage); set descriptions, pricing, categories, brands, and tags.
- **Order Management** — view and update customer orders; track statuses (**Pending → Shipped → Delivered**); view order metrics.
- **User Management** — view and manage customer accounts; ban/suspend accounts and reply to customer support queries.
- **Inventory Management** — monitor stock levels and manage stock (low-stock tracking).
- **Review Moderation** — approve or reject customer reviews to maintain quality.
- **Promotions** — manage coupons/promotions for the storefront.
- **Settings** — configure payment methods, tax rates, shipping options, free-shipping threshold; upload website logo; manage contact details, addresses, app-store links, and theme color.
- **Categories & Brands** — manage product categories and brands.

## Project Structure

```
├── src/
│   ├── app/                    # App Router (pages & API routes)
│   │   ├── (public)/           # Storefront pages
│   │   │   ├── about/  blog/  cart/  checkout/  compare/  contact/
│   │   │   ├── customer-support/  email-verification/  faq/  forget-password/
│   │   │   ├── need-help/  reset-password/  shop/  signin/  signup/
│   │   │   ├── track-order/  wishlist/
│   │   │   ├── account/        # orders, settings, cards-address, browsing-history
│   │   │   └── products/[id]/
│   │   ├── admin/              # Admin panel
│   │   │   ├── dashboard/  orders/  products/  categories/  brands/
│   │   │   └── inventory/  users/  reviews/  promotions/  settings/
│   │   ├── api/                # Route handlers
│   │   │   ├── create-payment-intent/  webhooks/  ai/chat/
│   │   │   ├── auth/signup/  auth/callback/
│   │   │   └── orders/[id]/invoice/
│   │   └── auth/callback/
│   ├── api/api-function/       # Supabase API function wrappers (admin & customer)
│   ├── assets/                 # Static assets & lottie JSONs
│   ├── components/             # UI, sections, store, account, AI, PDF, notification components
│   ├── constants/              # AI prompts and constants
│   ├── hooks/                  # Custom hooks (queries, realtime, AI, store settings)
│   ├── layout/                 # Public Header/Footer & dashboard Sidebar/Header
│   ├── lib/                    # supabase client/server, auth-routing, currency, utils
│   ├── proxy.ts                # Middleware (auth/session refresh, route guards)
│   ├── services/               # Helper services, validation schemas, JSON configs
│   ├── store/                  # Zustand stores (storefront, auth, admin, customer)
│   └── types/                  # TypeScript types & interfaces
├── public/                     # Static files
├── .env                        # Environment variables (see below)
├── next.config.ts
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or yarn/pnpm/bun)
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode)

### Environment Variables

Create a `.env` file in the project root (see `.env` in the repo for reference) with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_ENABLE_ADMIN_SIGNUP=true
GOOGLE_GENERATIVE_AI_API_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Installation & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

> Note: `.env*` files are gitignored; add them locally for development.

### Available Scripts

```bash
npm run dev     # start the development server
npm run build   # create a production build
npm run start   # start the production server
npm run lint    # run ESLint
```

## Supabase Setup

The app relies on the following Supabase resources:

- **Auth** — email/password sign-in, email verification, role-based access (`customer` / `admin`).
- **Database** — tables for products, categories, brands, orders, order items, reviews, users/profiles, addresses, carts, wishlists, promotions, notifications, site settings, and inventory.
- **Storage** — buckets for product images (`product_images`), user `profiles`, and `logos`.
- **Realtime** — `postgres_changes` subscription for live order-tracking updates.
- **RPC functions** — e.g. `get_trackable_order` for public order tracking.

### Roles

- **Customer** — auto-approved on signup.
- **Admin** — signup gated by `NEXT_PUBLIC_ENABLE_ADMIN_SIGNUP` and requires email verification.

## Payments (Stripe)

- The checkout page uses **Stripe Elements** (Payment Element + PaymentIntent) and also supports **Cash on Delivery**.
- `/api/create-payment-intent` creates a PaymentIntent (Bearer-token verified).
- `/api/webhooks` reconciles `payment_intent.succeeded` events (with amount tolerance) and updates the order status.
- Stock is verified before an order is placed.

## Deployment

### Frontend — Vercel

The easiest way to deploy this Next.js app is on the [Vercel Platform](https://vercel.com/new?utm_source=nextjs&utm_campaign=nextjs-readme):

1. Push the repository to GitHub/GitLab.
2. Import the project in Vercel.
3. Add the environment variables listed above.
4. Deploy.

### Backend — Supabase

Supabase-hosted services (PostgreSQL, Auth, Storage, Realtime) run as-is; configure the same project URL/keys in your production environment.

### Stripe Webhook

Configure a webhook endpoint in the Stripe Dashboard pointing to `https://<your-domain>/api/webhooks` and set `STRIPE_WEBHOOK_SECRET` accordingly.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
