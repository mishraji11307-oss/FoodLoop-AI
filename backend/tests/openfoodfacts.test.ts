import { openFoodFactsService } from '../src/services/openFoodFactsService';

describe('Open Food Facts API Service Tests', () => {
  beforeEach(() => {
    openFoodFactsService.clearCache();
  });

  it('should fetch and normalize product data by barcode (Nutella 3017620422003)', async () => {
    const result = await openFoodFactsService.getProductByBarcode('3017620422003');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const product = result.data!;
    expect(product.id).toBe('3017620422003');
    expect(product.name.toLowerCase()).toContain('nutella');
    expect(product.brand.toLowerCase()).toContain('nutella');
    expect(product.nutriscore).toBe('e');
    expect(product.novaGroup).toBeGreaterThanOrEqual(1);
    expect(product.attribution).toBe('Data sourced from Open Food Facts (ODbL)');

    // Nutrition facts per 100g
    expect(product.nutritionPer100g).toBeDefined();
    expect(product.nutritionPer100g.calories).toBeGreaterThan(400);
    expect(product.nutritionPer100g.sugars).toBeGreaterThan(40);

    // Allergens sanitized without language prefixes ('en:milk' -> 'milk')
    expect(Array.isArray(product.allergens)).toBe(true);
    expect(product.allergens.some(a => a.startsWith('en:'))).toBe(false);
  }, 15000);

  it('should serve subsequent barcode requests from in-memory cache', async () => {
    const firstCall = await openFoodFactsService.getProductByBarcode('3017620422003');
    expect(firstCall.success).toBe(true);
    expect(firstCall.source).toBe('network');

    const secondCall = await openFoodFactsService.getProductByBarcode('3017620422003');
    expect(secondCall.success).toBe(true);
    expect(secondCall.source).toBe('cache');
    expect(secondCall.data?.name).toEqual(firstCall.data?.name);
  }, 10000);

  it('should gracefully handle non-existent barcodes without throwing', async () => {
    const result = await openFoodFactsService.getProductByBarcode('999999999999999999999999999');
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
  }, 10000);

  it('should reject empty barcode with error message', async () => {
    const result = await openFoodFactsService.getProductByBarcode('   ');
    expect(result.success).toBe(false);
    expect(result.message).toContain('required');
  });
});
