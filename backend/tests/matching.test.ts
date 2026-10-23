import request from 'supertest';
import app from '../src/app';

describe('FoodBridge Matching Engine Tests', () => {
  const ngoAuth = 'Bearer demo-token-ngo';

  it('should return ranked recommendations with explainable score breakdowns', async () => {
    const res = await request(app)
      .get('/api/v1/matching/recommendations')
      .set('Authorization', ngoAuth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length > 0) {
      const first = res.body.data[0];
      expect(first.matchScore).toBeGreaterThanOrEqual(0);
      expect(first.matchScore).toBeLessThanOrEqual(100);
      expect(first.scoreBreakdown).toHaveProperty('distanceScore');
      expect(first.scoreBreakdown).toHaveProperty('capacityScore');
      expect(first.scoreBreakdown).toHaveProperty('categoryMatchScore');
      expect(first.scoreBreakdown).toHaveProperty('urgencyBonus');
      expect(typeof first.rationale).toBe('string');
    }
  });
});
