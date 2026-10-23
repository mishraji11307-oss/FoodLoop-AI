/**
 * Open Food Facts API Service Module
 * Implements high-performance, minimal payload queries, normalized schema,
 * in-memory caching, and resilient network error handling.
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

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  source?: 'cache' | 'network';
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class OpenFoodFactsService {
  private readonly baseUrl = 'https://world.openfoodfacts.org';
  private readonly fallbackBaseUrl = 'https://world.openfoodfacts.net';
  private readonly userAgent = 'FoodLoopAI - NodeBackend - Version 1.0 - (contact@foodloop.ai)';
  
  // Mandatory fields parameter to optimize payload size to minimal essentials
  private readonly essentialFields = [
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

  // In-memory cache layer keyed by barcode/query (TTL 1 hour)
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtlMs = 60 * 60 * 1000; // 1 hour

  /**
   * Fetches product information by barcode with in-memory caching and minimal payload.
   */
  async getProductByBarcode(barcode: string): Promise<ServiceResult<NormalizedFoodProduct>> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) {
      return { success: false, message: 'Barcode is required' };
    }

    const cacheKey = `barcode:${cleanBarcode}`;
    const cached = this.getFromCache<NormalizedFoodProduct>(cacheKey);
    if (cached) {
      return { success: true, data: cached, source: 'cache' };
    }

    const path = `/api/v2/product/${encodeURIComponent(cleanBarcode)}.json?fields=${this.essentialFields}`;
    
    try {
      const rawData = await this.fetchWithFallback(path);
      
      // Handle the status flag: 1 = found, 0 = not found
      if (!rawData || rawData.status !== 1 || !rawData.product) {
        return {
          success: false,
          message: rawData?.status_verbose || `Product with barcode ${cleanBarcode} not found in Open Food Facts`
        };
      }

      const normalized = this.normalizeProduct(rawData.product, cleanBarcode);
      this.setInCache(cacheKey, normalized);

      return { success: true, data: normalized, source: 'network' };
    } catch (error: any) {
      return {
        success: false,
        message: `Network or parsing error querying Open Food Facts: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Searches products by keyword with pagination and minimal payload.
   */
  async searchProducts(query: string, page: number = 1): Promise<ServiceResult<{ products: NormalizedFoodProduct[]; total: number; page: number }>> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return { success: false, message: 'Search query is required' };
    }

    const cacheKey = `search:${cleanQuery}:${page}`;
    const cached = this.getFromCache<{ products: NormalizedFoodProduct[]; total: number; page: number }>(cacheKey);
    if (cached) {
      return { success: true, data: cached, source: 'cache' };
    }

    const searchParams = new URLSearchParams({
      search_terms: cleanQuery,
      page: page.toString(),
      page_size: '10',
      json: '1',
      fields: this.essentialFields
    });

    const path = `/api/v2/search?${searchParams.toString()}`;

    try {
      const rawData = await this.fetchWithFallback(path);
      const rawProducts: any[] = rawData?.products || [];
      const total: number = rawData?.count || rawProducts.length;

      const products = rawProducts.map(p => this.normalizeProduct(p, p.code || ''));
      const resultData = { products, total, page };

      this.setInCache(cacheKey, resultData);
      return { success: true, data: resultData, source: 'network' };
    } catch (error: any) {
      return {
        success: false,
        message: `Network or parsing error searching Open Food Facts: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Helper to perform HTTP GET requests with mandatory User-Agent, timeout, and mirror resilience.
   */
  private async fetchWithFallback(pathAndQuery: string): Promise<any> {
    const headers = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json'
    };

    // 1. Primary attempt on world.openfoodfacts.org
    const urlsToTry = [
      `${this.baseUrl}${pathAndQuery}`,
      `https://in.openfoodfacts.org${pathAndQuery}`,
      `${this.fallbackBaseUrl}${pathAndQuery}`
    ];

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const json = await res.json();
          return json;
        }
        if (res.status === 404) {
          // If 404, product is legitimately not found
          try {
            return await res.json();
          } catch {
            return { status: 0, status_verbose: 'product not found' };
          }
        }
      } catch (err) {
        // Try next mirror
      }
    }

    throw new Error('Open Food Facts API is currently unreachable across all mirror endpoints');
  }

  /**
   * Sanitizes and normalizes raw Open Food Facts product JSON to our strict contract.
   */
  private normalizeProduct(raw: any, fallbackCode: string): NormalizedFoodProduct {
    const nutriments = raw.nutriments || {};

    // Clean allergen language prefixes (e.g., 'en:milk' -> 'milk', 'fr:soja' -> 'soja')
    const allergens: string[] = (raw.allergens_tags || [])
      .map((tag: string) => tag.replace(/^[a-z]{2}:/i, '').trim())
      .filter((tag: string) => tag.length > 0);

    // Extract nutriscore (lowercase letter: a, b, c, d, e or null)
    let nutriscore: string | null = null;
    if (raw.nutriscore_grade && typeof raw.nutriscore_grade === 'string') {
      const grade = raw.nutriscore_grade.toLowerCase();
      if (['a', 'b', 'c', 'd', 'e'].includes(grade)) {
        nutriscore = grade;
      }
    }

    // Extract NOVA group (1 to 4 or null)
    let novaGroup: number | null = null;
    const rawNova = raw.nova_group ?? nutriments['nova-group'];
    if (typeof rawNova === 'number' && rawNova >= 1 && rawNova <= 4) {
      novaGroup = rawNova;
    }

    // Extract Eco-score (lowercase letter: a, b, c, d, e or null)
    let ecoscore: string | null = null;
    if (raw.ecoscore_grade && typeof raw.ecoscore_grade === 'string') {
      const eco = raw.ecoscore_grade.toLowerCase();
      if (['a', 'b', 'c', 'd', 'e'].includes(eco)) {
        ecoscore = eco;
      }
    }

    const parseNum = (val: any): number | null => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : Math.round(parsed * 100) / 100;
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

  // --- Cache Helpers ---
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setInCache<T>(key: string, data: T, ttlMs: number = this.defaultTtlMs): void {
    // Evict oldest if cache exceeds 500 items
    if (this.cache.size >= 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Clears the in-memory cache (useful for testing or cache resets).
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const openFoodFactsService = new OpenFoodFactsService();
