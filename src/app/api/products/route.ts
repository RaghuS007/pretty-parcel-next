
import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/catalogue";

/** GET /api/products?cat=&q=&sort=&collection=&minPaise=&maxPaise= */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const cat = u.searchParams.get("cat");
  const q = (u.searchParams.get("q") || "").toLowerCase();
  const coll = u.searchParams.get("collection");
  const min = Number(u.searchParams.get("minPaise") || 0);
  const max = Number(u.searchParams.get("maxPaise") || Infinity);
  const sort = u.searchParams.get("sort") || "popular";

  let list = PRODUCTS.filter(p =>
    (!cat || p.cat === cat) &&
    (!coll || p.collection === coll) &&
    p.pricePaise >= min && p.pricePaise <= max &&
    (!q || [p.name, p.sub, p.collection, ...p.tags].join(" ").toLowerCase().includes(q))
  );
  if (sort === "low") list = [...list].sort((a, b) => a.pricePaise - b.pricePaise);
  else if (sort === "high") list = [...list].sort((a, b) => b.pricePaise - a.pricePaise);
  else if (sort === "new") list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  else list = [...list].sort((a, b) => b.reviews * b.rating - a.reviews * a.rating);

  return NextResponse.json({ products: list, total: list.length });
}
