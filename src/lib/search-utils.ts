import { Product } from '@/types';

/**
 * Normaliza un texto para búsqueda: quita tildes/acentos y pasa a minúsculas.
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Filtra y ordena productos letra por letra según la consulta:
 * - Insensible a mayúsculas y tildes ("cafe" encuentra "Café").
 * - Prioriza coincidencias al inicio del nombre, luego inicio de palabra en el nombre,
 *   luego contenido en el nombre, y (a partir de 2 letras) categoría/subcategoría/descripción.
 */
export function filterProductsBySearch<T extends Pick<Product, 'name' | 'description' | 'category' | 'subcategory'>>(
  products: T[],
  rawQuery: string
): T[] {
  const query = normalizeSearchText(rawQuery).trim();
  if (!query) return products;

  const scored: { product: T; score: number }[] = [];

  for (const product of products) {
    const name = normalizeSearchText(product.name);
    const words = name.split(/[\s\-·/()]+/).filter(Boolean);

    let score = 0;
    if (name.startsWith(query)) {
      score = 1;
    } else if (words.some(w => w.startsWith(query))) {
      score = 2;
    } else if (name.includes(query)) {
      score = 3;
    } else if (query.length >= 2) {
      const cat = normalizeSearchText(product.category?.name);
      const sub = normalizeSearchText(product.subcategory);
      const desc = normalizeSearchText(product.description);
      if (sub.includes(query) || cat.includes(query)) {
        score = 4;
      } else if (desc.includes(query)) {
        score = 5;
      }
    }

    if (score > 0) {
      scored.push({ product, score });
    }
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.map(item => item.product);
}
