"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, Product } from "@/lib/catalogue";

function ShopInner() {
  const params = useSearchParams();
  const [cats, setCats] = useState<string[]>([]);
  const [colls, setColls] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    const c = params.get("cat");
    if (c) setCats([c]);
  }, [params]);

  const collections = useMemo(() => [...new Set(PRODUCTS.map(p => p.collection))], []);

  const list = useMemo(() => {
    let l: Product[] = PRODUCTS.filter(p => {
      if (cats.length && !cats.includes(p.cat)) return false;
      if (colls.length && !colls.includes(p.collection)) return false;
      if (price) {
        const [lo, hi] = price.split("-").map(Number);
        const r = p.pricePaise / 100;
        if (r < lo || r > hi) return false;
      }
      if (q && ![p.name, p.sub, p.collection, ...p.tags].join(" ").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    if (sort === "low") l = [...l].sort((a, b) => a.pricePaise - b.pricePaise);
    else if (sort === "high") l = [...l].sort((a, b) => b.pricePaise - a.pricePaise);
    else if (sort === "new") l = [...l].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    else l = [...l].sort((a, b) => b.reviews * b.rating - a.reviews * a.rating);
    return l;
  }, [cats, colls, price, q, sort]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  return (
    <div className="wrap">
      <div className="crumbs"><a href="/">Home</a><span>›</span>Shop</div>
      <div className="shop-layout">
        <aside className="filters" aria-label="Filters">
          <div className="filter-group">
            <h4>Category</h4>
            {([["demi-fine","Demi-Fine Jewellery"],["oxidised","Traditional & Oxidised"],["hair","Hair Accessories"]] as const).map(([v, label]) => (
              <label key={v}><input type="checkbox" checked={cats.includes(v)} onChange={() => toggle(cats, setCats, v)} /> {label}</label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Price</h4>
            {([["","All prices"],["0-500","Under ₹500"],["500-1000","₹500 – ₹1,000"],["1000-2000","₹1,000 – ₹2,000"],["2000-99999","Above ₹2,000"]] as const).map(([v, label]) => (
              <label key={v}><input type="radio" name="price" checked={price === v} onChange={() => setPrice(v)} /> {label}</label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Collection</h4>
            {collections.map(c => (
              <label key={c}><input type="checkbox" checked={colls.includes(c)} onChange={() => toggle(colls, setColls, c)} /> {c}</label>
            ))}
          </div>
        </aside>
        <main>
          <div className="shop-toolbar">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input type="search" placeholder="Search necklaces, jhumkas, clips…" aria-label="Search products"
                value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <select className="sort" aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Sort: Popularity</option>
              <option value="new">Sort: Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
          <p className="result-count">{list.length} piece{list.length === 1 ? "" : "s"}</p>
          {list.length ? (
            <div className="grid" style={{ marginTop: 14 }}>{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <div className="empty"><div className="big">Nothing matches — yet</div>
              <p>Try clearing a filter or searching for something else.</p></div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (<>
    <Header />
    <main className="page">
      <Suspense><ShopInner /></Suspense>
    </main>
    <Footer />
  </>);
}
