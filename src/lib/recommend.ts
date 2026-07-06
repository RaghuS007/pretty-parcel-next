/**
 * Recommendation engine (PRD §8)
 * Content-based weights: category 45 · tag Jaccard 25 · price ±30% 15 · material 10 · collection 5
 * In production these scores are precomputed nightly into related_scores;
 * collaborative co-view signals blend in after 500+ view events.
 */
import { PRODUCTS, Product, COMPLEMENT_RULES, byId } from "./catalogue";

export function relatedProducts(p: Product, n = 8): Product[] {
  return PRODUCTS
    .filter(x => x.id !== p.id)
    .map(x => {
      let s = 0;
      if (x.cat === p.cat) s += 45;
      if (x.sub === p.sub) s += 10;
      const a = new Set(p.tags), b = new Set(x.tags);
      let inter = 0; a.forEach(t => { if (b.has(t)) inter++; });
      s += 25 * (inter / (a.size + b.size - inter || 1));
      const diff = Math.abs(x.pricePaise - p.pricePaise) / p.pricePaise;
      if (diff <= 0.30) s += 15 * (1 - diff / 0.30);
      if (x.material.split(",")[0] === p.material.split(",")[0]) s += 10;
      if (x.collection === p.collection) s += 5;
      return { x, s };
    })
    .sort((u, v) => v.s - u.s)
    .slice(0, n)
    .map(r => r.x);
}

/** “Complete the look” — co-purchase matrix in production; complementary rules until then */
export function completeTheLook(cartIds: string[], excludeIds: string[] = [], n = 4): Product[] {
  const skip = new Set([...cartIds, ...excludeIds]);
  const scores = new Map<string, number>();
  for (const id of cartIds) {
    const p = byId(id);
    if (!p) continue;
    (COMPLEMENT_RULES[p.sub] || []).forEach((sub, i) => {
      for (const x of PRODUCTS) {
        if (x.sub === sub && !skip.has(x.id)) {
          scores.set(x.id, (scores.get(x.id) || 0) + (2 - i) + (x.bestseller ? 0.5 : 0));
        }
      }
    });
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id]) => byId(id)!)
    .filter(Boolean);
}
