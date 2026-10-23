import request from 'supertest';
import app from '../src/app';

describe('FoodLabel AI OCR & Allergen Scanner Tests', () => {
  it('should process food label text and detect allergens and compute Nutri-Score', async () => {
    const res = await request(app)
      .post('/api/v1/food-labels/scan')
      .send({
        product_name: 'Almond Honey Granola Crunch',
        raw_text: 'Ingredients: Whole grain rolled oats, sugar, honey, almonds, peanuts, salt. Energy 420kcal, Protein 9g, Sugar 22g, Total Fat 14g, Sodium 120mg.',
        user_allergens: ['peanuts']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product_name).toBe('Almond Honey Granola Crunch');
    expect(res.body.data.detected_allergens).toContain('peanuts');
    expect(res.body.data.detected_allergens).toContain('tree_nuts');
    expect(res.body.data.userAllergenConflict).toBe(true);
    expect(res.body.data.health_score).toBeGreaterThanOrEqual(10);
    expect(res.body.data.health_score).toBeLessThanOrEqual(100);
    expect(res.body.data.explanation_en).toBeDefined();
    expect(res.body.data.explanation_hi).toBeDefined();
  });

  it('should retrieve scan history', async () => {
    const res = await request(app).get('/api/v1/food-labels/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
