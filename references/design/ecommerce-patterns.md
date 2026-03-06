# E-Commerce Patterns

Reusable e-commerce patterns extracted from the Bloomin' Acres project. Use as a starting template for future OphidianAI client stores.

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend | HTML + Tailwind CSS (CDN) | Static `.html` files with inline Tailwind config. Use Next.js only for complex stores with SSR needs. |
| Payments | Stripe (Checkout Sessions) | One-time payments via `checkout.session.create`. Subscriptions via `mode: 'subscription'`. |
| Database | Supabase | Products catalog (synced from Stripe), orders, user accounts, cart, favorites. |
| Auth | Supabase Auth | Email/password login. Session checked client-side via `sb.auth.getSession()`. |
| Hosting | Vercel | Static files + serverless API routes in `api/` directory. |
| API Routes | Vercel Serverless Functions | Node.js ES modules in `api/`. Each file exports a `default async function handler(req, res)`. |

### Vercel Configuration

Minimal `vercel.json` -- no build step needed for static HTML sites:

```json
{
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null
}
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe API access |
| `STRIPE_WEBHOOK_SECRET` | Validates incoming Stripe webhook signatures |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key (safe for client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only -- bypasses RLS |
| `STRIPE_CLUB_PRICE_ID` | Subscription price ID (if subscriptions used) |
| `STRIPE_CLUB_DISCOUNT_ID` | Coupon ID for member discounts |
| `STRIPE_REFERRAL_CLUB_COUPON` | Coupon ID for referral discounts on subscriptions |
| `STRIPE_REFERRAL_REG_COUPON` | Coupon ID for referral discounts on one-time orders |

---

## Product Catalog

### Storage

Products live in Stripe as the source of truth. The API route `api/stripe/products.js` fetches all active products with their default prices:

```js
const result = await stripe.products.list({
  active: true,
  expand: ['data.default_price'],
  limit: 100,
});
```

Each product is mapped to a simplified object for the frontend:

```js
{
  id: p.id,               // Stripe product ID
  name: p.name,
  description: p.description,
  images: p.images,
  unit_amount: price.unit_amount,  // cents
  currency: price.currency,
  price_formatted: "$12.00",
}
```

### Product Variations

Stored in a Supabase `product_details` table, keyed by `stripe_product_id`. Each row has a `variations` JSON array:

```json
[
  { "name": "Half Loaf", "price_delta": -200 },
  { "name": "Full Loaf", "price_delta": 0 },
  { "name": "Double Loaf", "price_delta": 400 }
]
```

Variation price = base `unit_amount` + `price_delta` (in cents). This avoids creating separate Stripe products for every variation.

### Menu/Category Structure

Categories are stored in Supabase `menu_sections` table with `title` and `sort_order`. Menu items are in `menu_items` with `section_id`, `stripe_product_id`, and `sort_order`. This lets the client (admin) reorder and categorize products independently from Stripe.

### Display Pattern

1. Fetch config from `/api/config` (Supabase URL + anon key)
2. Fetch products from `/api/stripe/products` and sections/items from Supabase in parallel
3. Build a `productMap` keyed by Stripe product ID
4. Render sections in order, each with its items resolved from the product map
5. Show skeleton loading state while data loads; replace with error message on failure

### Product Card Component

Each menu item row contains:
- Product name (linked to detail page)
- Dotted leader line
- Formatted price
- Action buttons: View, Options (if variations exist), Save (favorite), + Cart

---

## Cart and Checkout

### Cart State Management

Cart is stored server-side in Supabase `user_cart` table (not localStorage). Schema:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to auth.users |
| `stripe_product_id` | text | Stripe product ID |
| `variation_name` | text | Nullable -- set when a specific variation is selected |
| `variation_delta` | integer | Price delta in cents for the variation |
| `quantity` | integer | Default 1 |

This approach requires login before adding to cart, but it means cart persists across devices and sessions.

### Add to Cart Interaction

1. Check if user is logged in. If not, redirect to `account.html`.
2. Check if product already exists in cart (same `stripe_product_id` + `variation_name`).
3. If exists, increment `quantity`. If not, insert new row.
4. Show toast notification confirming the add.

```js
const { data: existing } = await sb.from('user_cart')
  .select('id, quantity')
  .eq('user_id', currentUser.id)
  .eq('stripe_product_id', pid)
  .eq('variation_name', vName)
  .maybeSingle();

if (existing) {
  await sb.from('user_cart').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
} else {
  await sb.from('user_cart').insert({
    user_id: currentUser.id,
    stripe_product_id: pid,
    variation_name: vName,
    variation_delta: vDelta,
    quantity: 1,
  });
}
```

### Stripe Checkout Session Flow

1. Frontend collects cart items from Supabase and sends them to `POST /api/stripe/checkout`.
2. API route retrieves each Stripe product with its default price.
3. For variations with a `price_delta`, the API creates an inline `price_data` instead of referencing the default price ID.
4. Server-side membership/referral discount validation happens here (never trust client-sent discount info).
5. Session is created with `mode: 'payment'` and redirect URLs pointing back to the account page.
6. Frontend redirects to `session.url`.

```js
const sessionParams = {
  mode: 'payment',
  line_items: lineItems,
  success_url: `${origin}/account.html?tab=orders&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/account.html?tab=cart`,
  client_reference_id: user_id,
  metadata: { user_id },
};
```

### Subscription Checkout (Memberships)

For recurring payments (e.g., club memberships), use a separate API route (`api/stripe/subscribe.js`):

1. Create or retrieve a Stripe customer (store `stripe_customer_id` in Supabase).
2. Create a checkout session with `mode: 'subscription'`.
3. Apply referral coupons server-side if a valid referral code is provided.
4. Webhook handles post-payment membership activation.

### Billing Portal

For subscription management (cancel, update payment method), use the Stripe Billing Portal:

```js
const session = await stripe.billingPortal.sessions.create({
  customer: member.stripe_customer_id,
  return_url: `${origin}/account.html?tab=club`,
});
```

---

## Webhook Handling

### Setup

The webhook endpoint at `api/stripe/webhook.js` must:
- Disable Vercel's default body parser to access raw body for signature verification.
- Validate the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`.

```js
export const config = { api: { bodyParser: false } };

const rawBody = await getRawBody(req);
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
```

### Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` (payment) | Create order in Supabase, store line items, clear user's cart |
| `checkout.session.completed` (subscription) | Activate club membership, record referral if applicable |
| `customer.subscription.created` | Upsert club membership status |
| `customer.subscription.updated` | Update membership status (active, past_due, etc.) |
| `customer.subscription.deleted` | Mark membership as cancelled |

### Order Creation (from webhook)

```js
const { data: order } = await sb.from('orders').insert({
  user_id: userId,
  stripe_session_id: session.id,
  status: 'paid',
  total_amount: session.amount_total,
}).select().single();

const orderItemRows = lineItems.data.map(item => ({
  order_id: order.id,
  stripe_product_id: item.price?.product ?? '',
  product_name: item.description,
  quantity: item.quantity,
  unit_amount: item.price?.unit_amount ?? null,
}));
await sb.from('order_items').insert(orderItemRows);
await sb.from('user_cart').delete().eq('user_id', userId);
```

---

## Order Management

### Database Schema

**orders**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to auth.users |
| `stripe_session_id` | text | Links back to Stripe session |
| `status` | text | `paid`, `fulfilled`, `cancelled` |
| `total_amount` | integer | Total in cents |
| `created_at` | timestamp | Auto-set |

**order_items**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `order_id` | uuid | FK to orders |
| `stripe_product_id` | text | |
| `product_name` | text | Snapshot of name at time of purchase |
| `quantity` | integer | |
| `unit_amount` | integer | Cents |

### Admin View

The admin dashboard (`admin.html`) loads orders from Supabase, shows them in a table with status badges, and allows status updates (e.g., marking orders as fulfilled). Admin access is gated by checking the `admins` table for the current user's ID.

### User Order History

Users view their orders on the account page (`account.html?tab=orders`). After a successful checkout redirect, the `session_id` query param can be used to highlight the new order.

---

## User Features

### Favorites

Stored in `user_favorites` table with `user_id`, `stripe_product_id`, and optional `variation_name`. Toggle on/off from menu or product pages. Uses `upsert` with a unique constraint on `(user_id, stripe_product_id, variation_name)`.

### Referral System

- Each member gets a unique code stored in `referral_codes` table.
- Referral link format: `https://site.com/club.html?ref=CODE`
- Code is stored in `sessionStorage` on the referred user's browser.
- Validated server-side before applying discounts.
- Referral uses tracked in `referral_uses` table with milestone thresholds (5, 15, 25).

---

## Security Considerations

- **Never expose `STRIPE_SECRET_KEY` on the frontend.** The client only gets `SUPABASE_URL` and `SUPABASE_ANON_KEY` via the `/api/config` endpoint.
- **Validate prices server-side.** The checkout API fetches product prices directly from Stripe -- it never trusts client-sent price values.
- **Verify discounts server-side.** Club membership and referral eligibility are checked in the API route before applying coupons.
- **Use Stripe webhooks to confirm payment.** Orders are only created in the webhook handler after Stripe confirms payment succeeded. Do not rely on the redirect alone.
- **Webhook signature verification is mandatory.** Raw body + `stripe-signature` header validated via `stripe.webhooks.constructEvent()`.
- **CORS headers on API routes.** Set `Access-Control-Allow-Origin`, `Allow-Methods`, and `Allow-Headers` on every API endpoint. Handle `OPTIONS` preflight requests.
- **Use Supabase service role key only server-side.** The anon key is safe for the client because Row Level Security (RLS) restricts what it can access. The service role key bypasses RLS and must never be exposed.

---

## Deployment

### Vercel API Route Structure

```
api/
  config.js          -- Returns Supabase URL + anon key (public)
  stripe/
    products.js      -- GET: List all active Stripe products with prices
    checkout.js      -- POST: Create one-time payment checkout session
    subscribe.js     -- POST: Create subscription checkout session
    webhook.js       -- POST: Handle Stripe webhook events
    portal.js        -- POST: Create Stripe Billing Portal session
```

Each route is a Vercel serverless function. Export a `default async function handler(req, res)`.

### Testing with Stripe Test Mode

1. Use Stripe test mode keys (`sk_test_...`, `pk_test_...`).
2. Set up a webhook endpoint in the Stripe dashboard pointing to `https://your-vercel-url.vercel.app/api/stripe/webhook`.
3. Use the Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
4. Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline).

### Content Management

The Bloomin' Acres pattern uses a `site_content` table in Supabase as a simple key-value CMS. The admin dashboard writes to it, and the frontend reads from it on page load to override default HTML content. This avoids the need for a full CMS while giving the client control over text and images.

```js
const { data: lpContent } = await sb.from('site_content').select('key, value');
lpContent.forEach(({ key, value }) => {
  // Map keys to DOM element IDs and update content
});
```

### Auth-Aware Navigation

The sidebar navigation adapts based on auth state:
- **Logged out:** Shows "Sign In" link.
- **Logged in (regular user):** Shows "My Account" submenu with Cart, Favorites, Orders, Profile.
- **Logged in (admin):** Shows "Dashboard" link instead of My Account submenu.

Admin status is checked by querying the `admins` table for the current user's ID.

---

## Supabase Tables Summary

| Table | Purpose |
|-------|---------|
| `menu_sections` | Category names + sort order |
| `menu_items` | Product assignments to sections + sort order |
| `product_details` | Variation definitions per Stripe product |
| `site_content` | Key-value CMS for editable text/images |
| `menu_schedule` | Start/end dates for menu availability |
| `user_cart` | Per-user cart items with quantities |
| `user_favorites` | Per-user saved/favorited products |
| `orders` | Completed orders (created by webhook) |
| `order_items` | Line items for each order |
| `profiles` | User profile info (first name, last name) |
| `admins` | User IDs with admin access |
| `club_members` | Subscription membership records |
| `referral_codes` | Per-member referral codes |
| `referral_uses` | Referral tracking + milestone progress |

---

## Checklist for New E-Commerce Projects

1. Create Stripe account (or use existing) and add products with default prices.
2. Create Supabase project with the tables above (adjust as needed).
3. Configure Supabase RLS policies for each table.
4. Set up Vercel project with environment variables.
5. Copy API route structure from `api/` directory.
6. Build frontend pages: landing, menu/catalog, product detail, account, admin.
7. Register Stripe webhook endpoint in dashboard.
8. Test full flow: browse -> add to cart -> checkout -> webhook -> order created.
9. Switch to Stripe live keys for production.
