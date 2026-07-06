"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { byId, inr, Product } from "@/lib/catalogue";
import { getWish, toast, useTick, useUser } from "@/lib/client-store";

type Panel = "overview" | "wishlist" | "orders" | "recent" | "addresses" | "profile";
const PANELS: [Panel, string][] = [
  ["overview", "Overview"], ["wishlist", "Wishlist"], ["orders", "Orders"],
  ["recent", "Recently Viewed"], ["addresses", "Addresses"], ["profile", "Profile"]
];

export default function AccountPage() {
  useTick();
  const router = useRouter();
  const { user, refresh } = useUser();
  const [panel, setPanel] = useState<Panel>("overview");
  const [rv, setRv] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const h = (location.hash || "").slice(1) as Panel;
    if (PANELS.some(([id]) => id === h)) setPanel(h);
  }, []);

  const load = useCallback(() => {
    fetch("/api/recently-viewed").then(r => r.json())
      .then(d => setRv((d.ids || []).map(byId).filter(Boolean) as Product[]));
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(d.orders || []));
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);

  if (user === undefined) return (<><Header /><main className="page" /><Footer /></>);

  if (!user) return (<>
    <Header />
    <main className="page wrap">
      <div className="empty">
        <div className="big">You&apos;re not logged in</div>
        <p>Log in with your mobile number to see your wishlist, orders and history.</p>
        <p style={{ marginTop: 18 }}><Link className="btn btn-primary" href="/login?next=/account">Login with OTP</Link></p>
      </div>
    </main>
    <Footer />
  </>);

  const wish = getWish().map(byId).filter(Boolean) as Product[];
  const show = (id: Panel) => { setPanel(id); history.replaceState(null, "", "#" + id); };
  const clearRV = async () => {
    await fetch("/api/recently-viewed", { method: "DELETE" });
    setRv([]); toast("History cleared");
  };
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    refresh(); toast("Logged out");
    setTimeout(() => router.push("/"), 600);
  };

  return (<>
    <Header />
    <main className="page"><div className="wrap">
      <div className="crumbs"><Link href="/">Home</Link><span>›</span>My Account</div>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account sections">
          {PANELS.map(([id, label]) => (
            <button key={id} className={panel === id ? "on" : ""} onClick={() => show(id)}>{label}</button>
          ))}
          <button onClick={logout} style={{ color: "#C0533B" }}>Log out</button>
        </nav>
        <div>
          {panel === "overview" && <div className="panel on">
            <h1 className="display" style={{ fontSize: 30 }}>Hello, {user.name.split(" ")[0]} ♡</h1>
            <p style={{ color: "var(--ink-soft)", margin: "6px 0 22px" }}>
              Logged in as +91 {user.mobile} · your history syncs across devices.</p>
            <div className="kpis" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <div className="kpi"><div className="label">Orders</div><div className="value">{orders.length}</div></div>
              <div className="kpi"><div className="label">Wishlist</div><div className="value">{wish.length}</div></div>
              <div className="kpi"><div className="label">Recently viewed</div><div className="value">{rv.length}</div></div>
            </div>
          </div>}

          {panel === "wishlist" && <div className="panel on">
            <h2 style={{ fontSize: 26, marginBottom: 16 }}>Wishlist</h2>
            {wish.length
              ? <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>{wish.map(p => <ProductCard key={p.id} p={p} />)}</div>
              : <div className="empty"><div className="big">Nothing saved yet</div><p>Tap the ♡ on any product to keep it here.</p></div>}
          </div>}

          {panel === "orders" && <div className="panel on">
            <h2 style={{ fontSize: 26, marginBottom: 16 }}>Orders</h2>
            {orders.length ? orders.map(o => (
              <div className="order" key={o.orderNumber}>
                <div>
                  <div className="oid">#{o.orderNumber}</div>
                  <div className="meta">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{o.items.reduce((s: number, i: any) => s + i.qty, 0)} item(s) · {inr(o.totalPaise)}</div>
                  <div className="meta">{o.items.map((i: any) => byId(i.id)?.name).filter(Boolean).join(", ")}</div>
                </div>
                <span className={`status ${o.status}`}>{o.status}</span>
              </div>
            )) : <div className="empty"><div className="big">No orders yet</div>
              <p>Your parcels will show up here once you place an order.</p></div>}
          </div>}

          {panel === "recent" && <div className="panel on">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontSize: 26 }}>Recently Viewed</h2>
              <button className="btn btn-ghost btn-sm" onClick={clearRV}>Clear all</button>
            </div>
            {rv.length
              ? <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>{rv.map(p => <ProductCard key={p.id} p={p} />)}</div>
              : <div className="empty"><div className="big">No history yet</div>
                  <p>Products you view will appear here, synced to your account.</p></div>}
          </div>}

          {panel === "addresses" && <div className="panel on">
            <h2 style={{ fontSize: 26, marginBottom: 16 }}>Saved Addresses</h2>
            <div className="addr"><strong>Home · Default</strong>{user.name}<br />221, 4th Cross, Indiranagar<br />Bengaluru, Karnataka 560038<br />+91 {user.mobile}</div>
            <button className="btn btn-outline btn-sm" onClick={() => toast("Address form — coming with the DB wiring")}>+ Add new address</button>
          </div>}

          {panel === "profile" && <div className="panel on">
            <h2 style={{ fontSize: 26, marginBottom: 16 }}>Profile</h2>
            <div className="field" style={{ maxWidth: 380 }}><label>Full name</label>
              <input defaultValue={user.name} /></div>
            <div className="field" style={{ maxWidth: 380 }}><label>Mobile</label>
              <input value={"+91 " + user.mobile} disabled style={{ background: "var(--peach-mist)" }} /></div>
            <button className="btn btn-primary btn-sm" onClick={() => toast("Profile updated ✓")}>Save changes</button>
          </div>}
        </div>
      </div>
    </div></main>
    <Footer />
  </>);
}
