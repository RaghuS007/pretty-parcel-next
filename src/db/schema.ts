/**
 * The Pretty Parcel by Neems — Drizzle schema (Neon Postgres)
 * All money values are stored as integer PAISE (₹1,499.00 → 149900).
 *
 * Local dev runs on an in-memory repository (src/lib/store.ts) so no
 * database is needed. When DATABASE_URL is set:
 *   npm run db:push   → creates these tables on Neon
 * then swap the repository calls for Drizzle queries (see README).
 */
import {
  pgTable, uuid, varchar, text, integer, boolean, timestamp,
  jsonb, index, uniqueIndex, primaryKey
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at")
}, t => ({ mobileIdx: uniqueIndex("users_mobile_idx").on(t.mobile) }));

export const otpRequests = pgTable("otp_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  otpHash: varchar("otp_hash", { length: 128 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, t => ({ mobileIdx: index("otp_mobile_idx").on(t.mobile) }));

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  parentId: uuid("parent_id")
});

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull()
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  subcategory: varchar("subcategory", { length: 60 }).notNull(),
  collectionId: uuid("collection_id").references(() => collections.id),
  material: varchar("material", { length: 160 }),
  careInstructions: text("care_instructions"),
  pricePaise: integer("price_paise").notNull(),       // selling price
  mrpPaise: integer("mrp_paise").notNull(),           // strike-through price
  stockQty: integer("stock_qty").default(0).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  isBestseller: boolean("is_bestseller").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, t => ({
  catIdx: index("products_category_idx").on(t.categoryId),
  activeIdx: index("products_active_idx").on(t.isActive)
}));

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 200 }),
  sortOrder: integer("sort_order").default(0).notNull()
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  label: varchar("label", { length: 40 }).default("Home").notNull(),
  line1: varchar("line1", { length: 200 }).notNull(),
  line2: varchar("line2", { length: 200 }),
  city: varchar("city", { length: 80 }).notNull(),
  state: varchar("state", { length: 80 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull()
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("processing").notNull(), // processing|shipped|delivered|cancelled
  subtotalPaise: integer("subtotal_paise").notNull(),
  discountPaise: integer("discount_paise").default(0).notNull(),
  shippingPaise: integer("shipping_paise").default(0).notNull(),
  totalPaise: integer("total_paise").notNull(),
  couponCode: varchar("coupon_code", { length: 30 }),
  addressId: uuid("address_id").references(() => addresses.id),
  paymentMethod: varchar("payment_method", { length: 20 }), // upi|card|netbanking|wallet|cod
  paymentRef: varchar("payment_ref", { length: 80 }),       // Razorpay/Cashfree payment id
  createdAt: timestamp("created_at").defaultNow().notNull()
}, t => ({ userIdx: index("orders_user_idx").on(t.userId) }));

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: integer("qty").notNull(),
  unitPricePaise: integer("unit_price_paise").notNull() // snapshot at purchase time
});

export const wishlistItems = pgTable("wishlist_items", {
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull()
}, t => ({ pk: primaryKey({ columns: [t.userId, t.productId] }) }));

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1–5
  body: text("body"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  type: varchar("type", { length: 10 }).notNull(),          // pct | flat
  value: integer("value").notNull(),                        // pct: %, flat: paise
  minSubtotalPaise: integer("min_subtotal_paise").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at")
});

/** Recently Viewed (PRD §7) — server-side history for logged-in users */
export const productViews = pgTable("product_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull()
}, t => ({
  userRecencyIdx: index("views_user_recency_idx").on(t.userId, t.viewedAt)
}));

/** Nightly-precomputed content-based scores (PRD §8a) */
export const relatedScores = pgTable("related_scores", {
  productId: uuid("product_id").references(() => products.id).notNull(),
  relatedId: uuid("related_id").references(() => products.id).notNull(),
  score: integer("score").notNull() // 0–100, weighted: cat 45 · tags 25 · price 15 · material 10 · collection 5
}, t => ({ pk: primaryKey({ columns: [t.productId, t.relatedId] }) }));

/** Item–item co-purchase matrix for “Complete the look” (PRD §8b) */
export const coPurchaseScores = pgTable("co_purchase_scores", {
  productId: uuid("product_id").references(() => products.id).notNull(),
  coProductId: uuid("co_product_id").references(() => products.id).notNull(),
  count: integer("count").default(0).notNull()
}, t => ({ pk: primaryKey({ columns: [t.productId, t.coProductId] }) }));
