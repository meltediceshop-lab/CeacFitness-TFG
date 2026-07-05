import { NextRequest, NextResponse } from 'next/server';
import { searchLocalFoods, type FoodItem } from '@/lib/foodDatabase';

// Busca alimentos: primero en la base local (instantánea), luego amplía con Open Food Facts.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ data: [] });

  const local = searchLocalFoods(q, 16);

  let off: FoodItem[] = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,nutriments`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'FitMente/1.0 (TFG educational app)' },
    });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      const products: Record<string, unknown>[] = json.products || [];
      off = products
        .map((p): FoodItem | null => {
          const n = (p.nutriments || {}) as Record<string, number>;
          const kcal = n['energy-kcal_100g'];
          const name = (p.product_name as string) || '';
          if (!kcal || !name || kcal <= 0) return null;
          const brand = (p.brands as string)?.split(',')[0];
          return {
            id: `off-${name}-${brand || ''}`.slice(0, 60),
            name: brand ? `${name} (${brand})` : name,
            category: 'Open Food Facts',
            kcal: Math.round(kcal),
            protein: Math.round((n['proteins_100g'] || 0) * 10) / 10,
            carbs: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
            fats: Math.round((n['fat_100g'] || 0) * 10) / 10,
            source: 'off',
          };
        })
        .filter((f): f is FoodItem => f !== null)
        .slice(0, 10);
    }
  } catch {
    // Open Food Facts no disponible o timeout → solo resultados locales
  }

  // Combinar evitando duplicados por nombre normalizado
  const seen = new Set(local.map(f => f.name.toLowerCase()));
  const merged = [...local];
  for (const f of off) {
    if (!seen.has(f.name.toLowerCase())) {
      merged.push(f);
      seen.add(f.name.toLowerCase());
    }
  }

  return NextResponse.json({ data: merged });
}