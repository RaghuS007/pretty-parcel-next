/** Catalogue types + seed data. Prices are integer PAISE throughout. */

export type Category = "demi-fine" | "oxidised" | "hair";

export interface Product {
  id: string;
  slug: string;
  name: string;
  cat: Category;
  sub: string;
  pricePaise: number;
  mrpPaise: number;
  material: string;
  collection: string;
  tags: string[];
  rating: number;
  reviews: number;
  bestseller: boolean;
  isNew: boolean;
  icon: string;
  stock: number;
}

export const CATEGORIES: Record<Category, string> = {
  "demi-fine": "Demi-Fine Jewellery",
  "oxidised": "Traditional & Oxidised",
  "hair": "Hair Accessories"
};

export const PALETTES: Record<Category, [string, string]> = {
  "demi-fine": ["#F7E3DA", "#EFC9B8"],
  "oxidised": ["#E9DED8", "#CBB8AE"],
  "hair": ["#FFE9E0", "#FFD6C9"]
};

const P = (r: number) => r * 100; // rupees → paise

export const PRODUCTS: Product[] = [
  { id: "p01", slug: "aurelia-layered-necklace", name: "Aurelia Layered Necklace", cat: "demi-fine", sub: "Necklaces", pricePaise: P(1499), mrpPaise: P(1899), material: "18k rose-gold plated brass", collection: "Golden Hour", tags: ["layered","rose-gold","minimal","everyday"], rating: 4.8, reviews: 32, bestseller: true, isNew: false, icon: "necklace", stock: 14 },
  { id: "p02", slug: "petal-drop-earrings", name: "Petal Drop Earrings", cat: "demi-fine", sub: "Earrings", pricePaise: P(899), mrpPaise: P(1099), material: "Rose-gold plated, cubic zirconia", collection: "First Light", tags: ["drop","rose-gold","party","zirconia"], rating: 4.7, reviews: 21, bestseller: true, isNew: false, icon: "earring", stock: 22 },
  { id: "p03", slug: "mira-chain-bracelet", name: "Mira Chain Bracelet", cat: "demi-fine", sub: "Bracelets", pricePaise: P(749), mrpPaise: P(949), material: "Gold-tone stainless steel", collection: "Golden Hour", tags: ["chain","minimal","everyday","stackable"], rating: 4.6, reviews: 14, bestseller: false, isNew: true, icon: "bracelet", stock: 8 },
  { id: "p04", slug: "solstice-stacking-rings", name: "Solstice Stacking Rings (Set of 3)", cat: "demi-fine", sub: "Rings", pricePaise: P(999), mrpPaise: P(1299), material: "Rose-gold plated brass", collection: "First Light", tags: ["stackable","minimal","set","rose-gold"], rating: 4.9, reviews: 41, bestseller: true, isNew: false, icon: "ring", stock: 31 },
  { id: "p05", slug: "sia-pearl-anklet", name: "Sia Pearl Anklet", cat: "demi-fine", sub: "Anklets", pricePaise: P(649), mrpPaise: P(799), material: "Freshwater pearl, gold-tone chain", collection: "Sea Whisper", tags: ["pearl","dainty","summer"], rating: 4.5, reviews: 9, bestseller: false, isNew: true, icon: "anklet", stock: 4 },
  { id: "p06", slug: "noor-jewellery-set", name: "Noor Jewellery Set", cat: "demi-fine", sub: "Jewellery Sets", pricePaise: P(2499), mrpPaise: P(3199), material: "Rose-gold plated, zirconia", collection: "Golden Hour", tags: ["set","party","gifting","zirconia","rose-gold"], rating: 4.8, reviews: 18, bestseller: false, isNew: true, icon: "set", stock: 11 },
  { id: "p07", slug: "rani-oxidised-choker", name: "Rani Oxidised Choker", cat: "oxidised", sub: "Necklaces", pricePaise: P(1299), mrpPaise: P(1599), material: "Oxidised german silver", collection: "Raat Rani", tags: ["oxidised","traditional","choker","festive"], rating: 4.9, reviews: 56, bestseller: true, isNew: false, icon: "necklace", stock: 19 },
  { id: "p08", slug: "jhilmil-jhumkas", name: "Jhilmil Jhumkas", cat: "oxidised", sub: "Earrings", pricePaise: P(799), mrpPaise: P(999), material: "Oxidised silver-tone alloy", collection: "Raat Rani", tags: ["jhumka","oxidised","festive","traditional"], rating: 4.8, reviews: 63, bestseller: true, isNew: false, icon: "jhumka", stock: 38 },
  { id: "p09", slug: "tara-coin-pendant", name: "Tara Coin Pendant", cat: "oxidised", sub: "Pendants", pricePaise: P(699), mrpPaise: P(899), material: "Oxidised german silver", collection: "Mitti", tags: ["coin","oxidised","boho","everyday"], rating: 4.6, reviews: 12, bestseller: false, isNew: true, icon: "pendant", stock: 9 },
  { id: "p10", slug: "meera-carved-bangles", name: "Meera Carved Bangles (Pair)", cat: "oxidised", sub: "Bangles", pricePaise: P(1099), mrpPaise: P(1399), material: "Oxidised brass, hand-carved", collection: "Mitti", tags: ["bangles","oxidised","traditional","pair"], rating: 4.7, reviews: 24, bestseller: false, isNew: false, icon: "bangle", stock: 6 },
  { id: "p11", slug: "peach-blush-claw-clip", name: "Peach Blush Claw Clip", cat: "hair", sub: "Claw Clips", pricePaise: P(399), mrpPaise: P(499), material: "Cellulose acetate", collection: "Soft Hour", tags: ["claw","peach","matte","everyday"], rating: 4.7, reviews: 48, bestseller: true, isNew: false, icon: "claw", stock: 44 },
  { id: "p12", slug: "ivory-pearl-hair-clip-duo", name: "Ivory Pearl Hair Clip Duo", cat: "hair", sub: "Hair Clips", pricePaise: P(349), mrpPaise: P(449), material: "Faux pearl, gold-tone alloy", collection: "Soft Hour", tags: ["pearl","clip","duo","party"], rating: 4.6, reviews: 17, bestseller: false, isNew: true, icon: "clip", stock: 16 },
  { id: "p13", slug: "velvet-ribbon-hair-band", name: "Velvet Ribbon Hair Band", cat: "hair", sub: "Hair Bands", pricePaise: P(299), mrpPaise: P(399), material: "Velvet over flexible frame", collection: "Soft Hour", tags: ["band","velvet","minimal"], rating: 4.4, reviews: 8, bestseller: false, isNew: false, icon: "band", stock: 3 },
  { id: "p14", slug: "satin-scrunchie-trio", name: "Satin Scrunchie Trio", cat: "hair", sub: "Scrunchies", pricePaise: P(329), mrpPaise: P(429), material: "Mulberry satin", collection: "Soft Hour", tags: ["scrunchie","satin","set","everyday"], rating: 4.8, reviews: 35, bestseller: true, isNew: false, icon: "scrunchie", stock: 52 },
  { id: "p15", slug: "grand-peach-bow", name: "Grand Peach Bow", cat: "hair", sub: "Hair Bows", pricePaise: P(449), mrpPaise: P(549), material: "Structured satin bow", collection: "Soft Hour", tags: ["bow","peach","statement","gifting"], rating: 4.9, reviews: 26, bestseller: false, isNew: true, icon: "bow", stock: 12 },
  { id: "p16", slug: "champa-flower-studs", name: "Champa Flower Studs", cat: "oxidised", sub: "Earrings", pricePaise: P(549), mrpPaise: P(699), material: "Oxidised silver-tone alloy", collection: "Mitti", tags: ["studs","oxidised","floral","everyday"], rating: 4.5, reviews: 11, bestseller: false, isNew: true, icon: "earring", stock: 7 }
];

export const byId = (id: string) => PRODUCTS.find(p => p.id === id);

/** Complementary category rules — PRD §8b fallback */
export const COMPLEMENT_RULES: Record<string, string[]> = {
  "Necklaces": ["Earrings", "Bracelets"],
  "Claw Clips": ["Scrunchies", "Hair Bows"],
  "Hair Clips": ["Scrunchies", "Hair Bows"],
  "Earrings": ["Necklaces", "Pendants"],
  "Pendants": ["Earrings"],
  "Bangles": ["Earrings", "Rings"],
  "Rings": ["Bracelets"],
  "Bracelets": ["Rings", "Necklaces"],
  "Scrunchies": ["Claw Clips", "Hair Bows"],
  "Hair Bows": ["Claw Clips", "Scrunchies"],
  "Hair Bands": ["Hair Clips"],
  "Anklets": ["Bracelets"],
  "Jewellery Sets": ["Rings"]
};

export const COUPONS: Record<string, { type: "pct" | "flat"; value: number; minPaise?: number; label: string }> = {
  NEEMS10: { type: "pct", value: 10, label: "10% off" },
  PARCEL200: { type: "flat", value: P(200), minPaise: P(1499), label: "₹200 off on ₹1,499+" }
};

export const FREE_SHIPPING_THRESHOLD_PAISE = P(999);
export const SHIPPING_FLAT_PAISE = P(79);

/** Format paise → ₹x,xxx (Indian grouping) */
export const inr = (paise: number) =>
  "₹" + Math.round(paise / 100).toLocaleString("en-IN");
