// Base de datos local de alimentos comunes (España). Macros por 100 g.
// Búsqueda instantánea y fiable; el endpoint /api/nutrition/foods amplía con Open Food Facts.

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  kcal: number;     // por 100 g
  protein: number;  // g por 100 g
  carbs: number;
  fats: number;
  portionG?: number;     // ración típica en gramos
  portionLabel?: string; // etiqueta de la ración (ej: "1 huevo")
  source?: 'local' | 'off';
}

export const FOOD_DB: FoodItem[] = [
  // ── Proteínas ──
  { id: 'pollo', name: 'Pechuga de pollo', category: 'Proteínas', kcal: 165, protein: 31, carbs: 0, fats: 3.6, portionG: 150, portionLabel: '1 filete' },
  { id: 'pavo', name: 'Pechuga de pavo', category: 'Proteínas', kcal: 135, protein: 29, carbs: 0, fats: 1, portionG: 120 },
  { id: 'ternera', name: 'Ternera magra', category: 'Proteínas', kcal: 187, protein: 26, carbs: 0, fats: 9, portionG: 150 },
  { id: 'huevo', name: 'Huevo', category: 'Proteínas', kcal: 155, protein: 13, carbs: 1.1, fats: 11, portionG: 60, portionLabel: '1 huevo' },
  { id: 'clara', name: 'Clara de huevo', category: 'Proteínas', kcal: 52, protein: 11, carbs: 0.7, fats: 0.2, portionG: 33, portionLabel: '1 clara' },
  { id: 'atun', name: 'Atún en lata (al natural)', category: 'Proteínas', kcal: 116, protein: 26, carbs: 0, fats: 1, portionG: 56, portionLabel: '1 lata' },
  { id: 'salmon', name: 'Salmón', category: 'Proteínas', kcal: 208, protein: 20, carbs: 0, fats: 13, portionG: 130 },
  { id: 'merluza', name: 'Merluza', category: 'Proteínas', kcal: 90, protein: 18, carbs: 0, fats: 2, portionG: 150 },
  { id: 'gambas', name: 'Gambas', category: 'Proteínas', kcal: 99, protein: 24, carbs: 0, fats: 0.3, portionG: 100 },
  { id: 'tofu', name: 'Tofu', category: 'Proteínas', kcal: 76, protein: 8, carbs: 1.9, fats: 4.8, portionG: 100 },
  { id: 'seitan', name: 'Seitán', category: 'Proteínas', kcal: 121, protein: 21, carbs: 4, fats: 1.9, portionG: 100 },
  { id: 'jamon-serrano', name: 'Jamón serrano', category: 'Proteínas', kcal: 241, protein: 31, carbs: 0, fats: 13, portionG: 40 },
  { id: 'jamon-york', name: 'Jamón cocido / pavo', category: 'Proteínas', kcal: 110, protein: 18, carbs: 1.5, fats: 3.5, portionG: 40, portionLabel: '2 lonchas' },

  // ── Lácteos ──
  { id: 'leche-entera', name: 'Leche entera', category: 'Lácteos', kcal: 61, protein: 3.2, carbs: 4.8, fats: 3.3, portionG: 250, portionLabel: '1 vaso' },
  { id: 'leche-desnatada', name: 'Leche desnatada', category: 'Lácteos', kcal: 35, protein: 3.4, carbs: 5, fats: 0.1, portionG: 250, portionLabel: '1 vaso' },
  { id: 'yogur-natural', name: 'Yogur natural', category: 'Lácteos', kcal: 61, protein: 3.5, carbs: 4.7, fats: 3.3, portionG: 125, portionLabel: '1 unidad' },
  { id: 'yogur-griego', name: 'Yogur griego', category: 'Lácteos', kcal: 97, protein: 9, carbs: 4, fats: 5, portionG: 150 },
  { id: 'queso-batido', name: 'Queso fresco batido 0%', category: 'Lácteos', kcal: 47, protein: 8, carbs: 4, fats: 0.2, portionG: 200 },
  { id: 'requeson', name: 'Requesón', category: 'Lácteos', kcal: 98, protein: 11, carbs: 3, fats: 4.3, portionG: 100 },
  { id: 'queso-curado', name: 'Queso curado', category: 'Lácteos', kcal: 390, protein: 25, carbs: 1.4, fats: 32, portionG: 30 },

  // ── Carbohidratos ──
  { id: 'arroz-blanco', name: 'Arroz blanco (cocido)', category: 'Carbohidratos', kcal: 130, protein: 2.4, carbs: 28, fats: 0.3, portionG: 200 },
  { id: 'arroz-integral', name: 'Arroz integral (cocido)', category: 'Carbohidratos', kcal: 111, protein: 2.6, carbs: 23, fats: 0.9, portionG: 200 },
  { id: 'pasta', name: 'Pasta (cocida)', category: 'Carbohidratos', kcal: 131, protein: 5, carbs: 25, fats: 1.1, portionG: 200 },
  { id: 'pan-blanco', name: 'Pan blanco', category: 'Carbohidratos', kcal: 265, protein: 9, carbs: 49, fats: 3.2, portionG: 50 },
  { id: 'pan-integral', name: 'Pan integral', category: 'Carbohidratos', kcal: 247, protein: 13, carbs: 41, fats: 3.4, portionG: 50 },
  { id: 'avena', name: 'Avena (copos)', category: 'Carbohidratos', kcal: 389, protein: 17, carbs: 66, fats: 7, portionG: 50 },
  { id: 'patata', name: 'Patata (cocida)', category: 'Carbohidratos', kcal: 87, protein: 2, carbs: 20, fats: 0.1, portionG: 200 },
  { id: 'boniato', name: 'Boniato', category: 'Carbohidratos', kcal: 86, protein: 1.6, carbs: 20, fats: 0.1, portionG: 150 },
  { id: 'quinoa', name: 'Quinoa (cocida)', category: 'Carbohidratos', kcal: 120, protein: 4.4, carbs: 21, fats: 1.9, portionG: 180 },
  { id: 'tortita-arroz', name: 'Tortita de arroz/maíz', category: 'Carbohidratos', kcal: 387, protein: 8, carbs: 81, fats: 3, portionG: 9, portionLabel: '1 tortita' },
  { id: 'cereales', name: 'Cereales (copos de maíz)', category: 'Carbohidratos', kcal: 357, protein: 7, carbs: 84, fats: 0.9, portionG: 40 },

  // ── Frutas ──
  { id: 'platano', name: 'Plátano', category: 'Frutas', kcal: 89, protein: 1.1, carbs: 23, fats: 0.3, portionG: 120, portionLabel: '1 plátano' },
  { id: 'manzana', name: 'Manzana', category: 'Frutas', kcal: 52, protein: 0.3, carbs: 14, fats: 0.2, portionG: 180, portionLabel: '1 manzana' },
  { id: 'naranja', name: 'Naranja', category: 'Frutas', kcal: 47, protein: 0.9, carbs: 12, fats: 0.1, portionG: 180, portionLabel: '1 naranja' },
  { id: 'fresa', name: 'Fresas', category: 'Frutas', kcal: 32, protein: 0.7, carbs: 7.7, fats: 0.3, portionG: 150 },
  { id: 'arandanos', name: 'Arándanos', category: 'Frutas', kcal: 57, protein: 0.7, carbs: 14, fats: 0.3, portionG: 80 },
  { id: 'kiwi', name: 'Kiwi', category: 'Frutas', kcal: 61, protein: 1.1, carbs: 15, fats: 0.5, portionG: 75, portionLabel: '1 kiwi' },
  { id: 'uva', name: 'Uvas', category: 'Frutas', kcal: 69, protein: 0.7, carbs: 18, fats: 0.2, portionG: 100 },
  { id: 'pera', name: 'Pera', category: 'Frutas', kcal: 57, protein: 0.4, carbs: 15, fats: 0.1, portionG: 170, portionLabel: '1 pera' },
  { id: 'aguacate', name: 'Aguacate', category: 'Frutas', kcal: 160, protein: 2, carbs: 9, fats: 15, portionG: 100, portionLabel: '½ aguacate' },

  // ── Verduras ──
  { id: 'brocoli', name: 'Brócoli', category: 'Verduras', kcal: 34, protein: 2.8, carbs: 7, fats: 0.4, portionG: 150 },
  { id: 'tomate', name: 'Tomate', category: 'Verduras', kcal: 18, protein: 0.9, carbs: 3.9, fats: 0.2, portionG: 120, portionLabel: '1 tomate' },
  { id: 'lechuga', name: 'Lechuga', category: 'Verduras', kcal: 15, protein: 1.4, carbs: 2.9, fats: 0.2, portionG: 80 },
  { id: 'zanahoria', name: 'Zanahoria', category: 'Verduras', kcal: 41, protein: 0.9, carbs: 10, fats: 0.2, portionG: 80, portionLabel: '1 zanahoria' },
  { id: 'espinaca', name: 'Espinacas', category: 'Verduras', kcal: 23, protein: 2.9, carbs: 3.6, fats: 0.4, portionG: 100 },
  { id: 'pimiento', name: 'Pimiento', category: 'Verduras', kcal: 31, protein: 1, carbs: 6, fats: 0.3, portionG: 120 },
  { id: 'calabacin', name: 'Calabacín', category: 'Verduras', kcal: 17, protein: 1.2, carbs: 3.1, fats: 0.3, portionG: 200 },
  { id: 'champinones', name: 'Champiñones', category: 'Verduras', kcal: 22, protein: 3.1, carbs: 3.3, fats: 0.3, portionG: 100 },

  // ── Legumbres ──
  { id: 'lentejas', name: 'Lentejas (cocidas)', category: 'Legumbres', kcal: 116, protein: 9, carbs: 20, fats: 0.4, portionG: 200 },
  { id: 'garbanzos', name: 'Garbanzos (cocidos)', category: 'Legumbres', kcal: 164, protein: 8.9, carbs: 27, fats: 2.6, portionG: 200 },
  { id: 'alubias', name: 'Alubias (cocidas)', category: 'Legumbres', kcal: 127, protein: 8.7, carbs: 23, fats: 0.5, portionG: 200 },
  { id: 'guisantes', name: 'Guisantes', category: 'Legumbres', kcal: 81, protein: 5, carbs: 14, fats: 0.4, portionG: 150 },
  { id: 'hummus', name: 'Hummus', category: 'Legumbres', kcal: 166, protein: 8, carbs: 14, fats: 10, portionG: 50 },

  // ── Grasas y frutos secos ──
  { id: 'almendras', name: 'Almendras', category: 'Grasas', kcal: 579, protein: 21, carbs: 22, fats: 50, portionG: 30, portionLabel: '1 puñado' },
  { id: 'nueces', name: 'Nueces', category: 'Grasas', kcal: 654, protein: 15, carbs: 14, fats: 65, portionG: 30, portionLabel: '1 puñado' },
  { id: 'cacahuete', name: 'Cacahuetes', category: 'Grasas', kcal: 567, protein: 26, carbs: 16, fats: 49, portionG: 30 },
  { id: 'crema-cacahuete', name: 'Crema de cacahuete', category: 'Grasas', kcal: 588, protein: 25, carbs: 20, fats: 50, portionG: 20, portionLabel: '1 cucharada' },
  { id: 'aceite-oliva', name: 'Aceite de oliva', category: 'Grasas', kcal: 884, protein: 0, carbs: 0, fats: 100, portionG: 10, portionLabel: '1 cucharada' },
  { id: 'chocolate-negro', name: 'Chocolate negro 85%', category: 'Grasas', kcal: 599, protein: 7.8, carbs: 32, fats: 43, portionG: 20 },

  // ── Suplementos y otros ──
  { id: 'whey', name: 'Proteína whey (polvo)', category: 'Suplementos', kcal: 380, protein: 80, carbs: 8, fats: 6, portionG: 30, portionLabel: '1 cazo' },
  { id: 'miel', name: 'Miel', category: 'Otros', kcal: 304, protein: 0.3, carbs: 82, fats: 0, portionG: 20, portionLabel: '1 cucharada' },
  { id: 'galleta-maria', name: 'Galletas maría', category: 'Otros', kcal: 436, protein: 7, carbs: 75, fats: 12, portionG: 24, portionLabel: '4 galletas' },
];

// Normaliza para búsqueda sin acentos ni mayúsculas
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function searchLocalFoods(query: string, limit = 24): FoodItem[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const scored = FOOD_DB
    .map(f => {
      const name = normalize(f.name);
      let score = -1;
      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 50;
      else if (normalize(f.category).includes(q)) score = 20;
      return { f, score };
    })
    .filter(x => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => ({ ...x.f, source: 'local' as const }));
  return scored;
}

// Calcula macros para una cantidad concreta en gramos
export function macrosForQuantity(food: FoodItem, grams: number) {
  const factor = grams / 100;
  return {
    kcal: Math.round(food.kcal * factor),
    protein: Math.round(food.protein * factor * 10) / 10,
    carbs: Math.round(food.carbs * factor * 10) / 10,
    fats: Math.round(food.fats * factor * 10) / 10,
  };
}