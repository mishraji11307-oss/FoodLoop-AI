/**
 * Open Food Facts Service Module (Frontend Client)
 * Implements high-performance, minimal payload queries, in-memory caching,
 * sanitized schema normalization, and resilient error handling.
 */

export interface NutritionPer100g {
  calories: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbs: number | null;
  sugars: number | null;
  protein: number | null;
  salt: number | null;
  fiber: number | null;
}

export interface NormalizedFoodProduct {
  id: string; // code
  name: string; // product_name (fallback: 'Unknown Product')
  brand: string; // brands
  quantity: string; // quantity
  image: string; // image_front_url
  imageSmall: string; // image_front_small_url
  nutriscore: string | null; // nutriscore_grade (lowercase letter or null)
  novaGroup: number | null; // nova_group (1 to 4 or null)
  ecoscore: string | null; // ecoscore_grade (lowercase letter or null)
  ingredients: string; // ingredients_text
  allergens: string[]; // allergens_tags cleaned of language prefixes
  nutritionPer100g: NutritionPer100g;
  attribution: string; // "Data sourced from Open Food Facts (ODbL)"
}

export interface OpenFoodFactsResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  source?: 'cache' | 'backend' | 'network';
}

const BASE_URL = 'https://world.openfoodfacts.org';
const FALLBACK_URL = 'https://world.openfoodfacts.net';
const USER_AGENT = 'FoodLoopAI - WebApp - Version 1.0 - (contact@foodloop.ai)';

// Mandatory minimal payload restriction
const ESSENTIAL_FIELDS = [
  'code',
  'product_name',
  'brands',
  'quantity',
  'image_front_url',
  'image_front_small_url',
  'nutriscore_grade',
  'nova_group',
  'ecoscore_grade',
  'ingredients_text',
  'allergens_tags',
  'nutriments'
].join(',');

// In-memory cache layer keyed by barcode to avoid duplicate requests
const memoryCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache<T>(key: string, data: T): void {
  if (memoryCache.size >= 500) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function normalizeRawProduct(raw: any, fallbackCode: string): NormalizedFoodProduct {
  const nutriments = raw.nutriments || {};

  // Clean language prefixes ('en:milk' -> 'milk', 'fr:gluten' -> 'gluten')
  const allergens: string[] = (raw.allergens_tags || [])
    .map((tag: string) => tag.replace(/^[a-z]{2}:/i, '').trim())
    .filter((tag: string) => tag.length > 0);

  // Clean Nutri-Score grade
  let nutriscore: string | null = null;
  if (raw.nutriscore_grade && typeof raw.nutriscore_grade === 'string') {
    const grade = raw.nutriscore_grade.toLowerCase();
    if (['a', 'b', 'c', 'd', 'e'].includes(grade)) {
      nutriscore = grade;
    }
  }

  // Clean NOVA Group
  let novaGroup: number | null = null;
  const rawNova = raw.nova_group ?? nutriments['nova-group'];
  if (typeof rawNova === 'number' && rawNova >= 1 && rawNova <= 4) {
    novaGroup = rawNova;
  }

  // Clean Eco-Score
  let ecoscore: string | null = null;
  if (raw.ecoscore_grade && typeof raw.ecoscore_grade === 'string') {
    const eco = raw.ecoscore_grade.toLowerCase();
    if (['a', 'b', 'c', 'd', 'e'].includes(eco)) {
      ecoscore = eco;
    }
  }

  const parseNum = (val: any): number | null => {
    if (val === undefined || val === null || val === '') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : Math.round(n * 100) / 100;
  };

  const nutritionPer100g: NutritionPer100g = {
    calories: parseNum(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal']),
    fat: parseNum(nutriments.fat_100g ?? nutriments.fat),
    saturatedFat: parseNum(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat']),
    carbs: parseNum(nutriments.carbohydrates_100g ?? nutriments.carbohydrates),
    sugars: parseNum(nutriments.sugars_100g ?? nutriments.sugars),
    protein: parseNum(nutriments.proteins_100g ?? nutriments.proteins),
    salt: parseNum(nutriments.salt_100g ?? nutriments.salt),
    fiber: parseNum(nutriments.fiber_100g ?? nutriments.fiber)
  };

  return {
    id: raw.code || fallbackCode,
    name: (raw.product_name || '').trim() || 'Unknown Product',
    brand: (raw.brands || '').trim() || 'Generic Brand',
    quantity: (raw.quantity || '').trim() || '',
    image: raw.image_front_url || '',
    imageSmall: raw.image_front_small_url || raw.image_front_url || '',
    nutriscore,
    novaGroup,
    ecoscore,
    ingredients: (raw.ingredients_text || '').trim(),
    allergens: Array.from(new Set(allergens)),
    nutritionPer100g,
    attribution: 'Data sourced from Open Food Facts (ODbL)'
  };
}

/**
 * 1. Fetches product info by barcode.
 */
export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsResult<NormalizedFoodProduct>> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) {
    return { success: false, message: 'Barcode is required' };
  }

  const cacheKey = `barcode:${cleanBarcode}`;
  const cached = getFromCache<NormalizedFoodProduct>(cacheKey);
  if (cached) {
    return { success: true, data: cached, source: 'cache' };
  }

  // First try backend proxy endpoint for optimal speed & server-side caching
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
    const proxyRes = await fetch(`${apiBase}/food-labels/barcode/${encodeURIComponent(cleanBarcode)}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.success && json.data) {
        setInCache(cacheKey, json.data);
        return { success: true, data: json.data, source: 'backend' };
      }
    }
  } catch {
    // Backend unreachable, fallback to direct Open Food Facts fetch
  }

  // Direct fetch with minimal payload & mandatory custom User-Agent
  try {
    const path = `/api/v2/product/${encodeURIComponent(cleanBarcode)}.json?fields=${ESSENTIAL_FIELDS}`;
    const headers = { 'User-Agent': USER_AGENT, 'Accept': 'application/json' };

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${path}`, { headers, signal: AbortSignal.timeout(7000) });
      if (!res.ok && (res.status === 503 || res.status === 502)) {
        res = await fetch(`${FALLBACK_URL}${path}`, { headers, signal: AbortSignal.timeout(7000) });
      }
    } catch {
      res = await fetch(`${FALLBACK_URL}${path}`, { headers, signal: AbortSignal.timeout(7000) });
    }

    if (!res.ok) {
      return { success: false, message: `Open Food Facts returned HTTP ${res.status}` };
    }

    const rawData = await res.json();
    if (rawData.status !== 1 || !rawData.product) {
      return {
        success: false,
        message: rawData.status_verbose || `Product with barcode ${cleanBarcode} not found in Open Food Facts`
      };
    }

    const normalized = normalizeRawProduct(rawData.product, cleanBarcode);
    setInCache(cacheKey, normalized);

    return { success: true, data: normalized, source: 'network' };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to query Open Food Facts: ${error.message || 'Network error'}`
    };
  }
}

/**
 * 2. Searches products by keyword.
 */
export async function searchProducts(
  query: string,
  page: number = 1
): Promise<OpenFoodFactsResult<{ products: NormalizedFoodProduct[]; total: number; page: number }>> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { success: false, message: 'Search query is required' };
  }

  const cacheKey = `search:${cleanQuery}:${page}`;
  const cached = getFromCache<{ products: NormalizedFoodProduct[]; total: number; page: number }>(cacheKey);
  if (cached) {
    return { success: true, data: cached, source: 'cache' };
  }

  // First try backend proxy endpoint
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
    const proxyRes = await fetch(`${apiBase}/food-labels/search?q=${encodeURIComponent(cleanQuery)}&page=${page}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });

    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.success && json.data) {
        setInCache(cacheKey, json.data);
        return { success: true, data: json.data, source: 'backend' };
      }
    }
  } catch {
    // Backend unreachable, fallback to direct Open Food Facts fetch
  }

  // Direct fetch with fallback mirror
  try {
    const searchParams = new URLSearchParams({
      search_terms: cleanQuery,
      page: page.toString(),
      page_size: '10',
      json: '1',
      fields: ESSENTIAL_FIELDS
    });

    const path = `/api/v2/search?${searchParams.toString()}`;
    const headers = { 'User-Agent': USER_AGENT, 'Accept': 'application/json' };

    let res: Response;
    try {
      res = await fetch(`${FALLBACK_URL}${path}`, { headers, signal: AbortSignal.timeout(7000) });
    } catch {
      res = await fetch(`${BASE_URL}${path}`, { headers, signal: AbortSignal.timeout(7000) });
    }

    if (!res.ok) {
      return { success: false, message: `Open Food Facts search returned HTTP ${res.status}` };
    }

    const rawData = await res.json();
    const rawProducts: any[] = rawData?.products || [];
    const total: number = rawData?.count || rawProducts.length;

    const products = rawProducts.map(p => normalizeRawProduct(p, p.code || ''));
    const resultData = { products, total, page };

    setInCache(cacheKey, resultData);
    return { success: true, data: resultData, source: 'network' };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to search Open Food Facts: ${error.message || 'Network error'}`
    };
  }
}

export const openFoodFactsService = {
  getProductByBarcode,
  searchProducts
};
