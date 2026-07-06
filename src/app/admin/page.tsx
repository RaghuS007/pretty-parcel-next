"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { PRODUCTS, inr } from "@/lib/catalogue";
import { toast } from "@/lib/client-store";

const WEEK: [string, number][] = [["Mon",62],["Tue",48],["Wed",71],["Thu",55],["Fri",84],["Sat",100],["Sun",90]];
const MOCK_ORDERS: [string, string, string][] = [
  ["TPP482913","₹1,848","shipped"],["TPP482907","₹649","delivered"],
  ["TPP482899","₹2,499","processing"],["TPP482887","₹728","delivered"]
];

export default function AdminPage() {
  const [recent, setRecent] = useState<[string, string, string][]>(MOCK_ORDERS);
  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(d => {
      const real = (d.orders || []).slice(0, 3).map((o: any) =>
        ["#" + o.orderNumber, inr(o.totalPaise), o.status] as [string, string, string]);
      setRecent([...real, ...MOCK_ORDERS].slice(0, 5));
    }).catch(() => {});
  }, []);

  return (
    <div className="admin-shell" style={{ background: "#FBF8F6" }}>
      <aside className="admin-side">
        <div className="brand" style={{ fontFamily: "var(--font-display)" }}>TPP Admin</div>
        <a href="#" className="on">◆ Dashboard</a>
        <a href="#products">◇ Products</a>
        <a href="#orders">◇ Orders</a>
        <a href="#" onClick={e => { e.preventDefault(); toast("Customer database — with the DB wiring"); }}>◇ Customers</a>
        <a href="#coupons">◇ Coupons</a>
        <Link href="/" style={{ marginTop: "auto" }}>← Back to store</Link>
      </aside>

      <main className="admin-main">
        <h1 className="display">Dashboard</h1>
        <p className="sub">The Pretty Parcel by Neems · prototype data</p>

        <div className="kpis">
          <div className="kpi"><div className="label">Revenue (30d)</div><div className="value">₹86,450</div><div className="delta">▲ 18% vs last month</div></div>
          <div className="kpi"><div className="label">Orders (30d)</div><div className="value">112</div><div className="delta">▲ 12%</div></div>
          <div className="kpi"><div className="label">Customers</div><div className="value">348</div><div className="delta">▲ 26 new</div></div>
          <div className="kpi"><div className="label">Avg. order value</div><div className="value">₹772</div><div className="delta down">▼ 3%</div></div>
        </div>

        <div className="admin-grid">
          <div className="panel-card">
            <h3>Weekly sales</h3>
            <div className="bar-chart">
              {WEEK.map(([d, v]) => (
                <div className="bar" key={d}><div className="fill" style={{ height: v + "%" }} /><span className="lbl">{d}</span></div>
              ))}
            </div>
          </div>
          <div className="panel-card" id="orders">
            <h3>Recent orders</h3>
            <table className="data"><thead><tr><th>Order</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>{recent.map(([id, amt, st]) => (
                <tr key={id}><td>{id}</td><td>{amt}</td><td><span className={`status ${st}`}>{st}</span></td></tr>
              ))}</tbody></table>
          </div>
        </div>

        <div className="panel-card" id="products" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Products &amp; inventory</h3>
            <button className="btn btn-primary btn-sm" onClick={() => toast("Add product form — with the DB wiring")}>+ Add product</button>
          </div>
          <div style={{ overflowX: "auto" }}><table className="data">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead>
            <tbody>{PRODUCTS.map(p => (
              <tr key={p.id}>
                <td style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flex: "none" }}>
                    <ProductImage p={p} /></span>{p.name}</td>
                <td>{p.sub}</td><td>{inr(p.pricePaise)}</td>
                <td className={p.stock <= 5 ? "stock-low" : ""}>{p.stock}{p.stock <= 5 ? " · low" : ""}</td>
                <td>★ {p.rating}</td>
                <td className="mini-actions"><button onClick={() => toast("Edit " + p.name)}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>

        <div className="panel-card" id="coupons">
          <h3>Active coupons</h3>
          <table className="data">
            <thead><tr><th>Code</th><th>Discount</th><th>Condition</th><th>Uses (30d)</th><th></th></tr></thead>
            <tbody>
              <tr><td><strong>NEEMS10</strong></td><td>10% off</td><td>—</td><td>41</td>
                <td className="mini-actions"><button>Edit</button><button>Pause</button></td></tr>
              <tr><td><strong>PARCEL200</strong></td><td>₹200 flat</td><td>Min ₹1,499</td><td>17</td>
                <td className="mini-actions"><button>Edit</button><button>Pause</button></td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
