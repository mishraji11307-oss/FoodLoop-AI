import request from 'supertest';
import app from '../src/app';

describe('FreshTrack Inventory Tests', () => {
  const authHeader = 'Bearer demo-token-household';

  it('should list household inventory items', async () => {
    const res = await request(app)
      .get('/api/v1/inventory')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should validate inventory input and reject invalid payload', async () => {
    const res = await request(app)
      .post('/api/v1/inventory')
      .set('Authorization', authHeader)
      .send({
        // Missing name and category
        quantity: -5 // invalid negative
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should create a new inventory item with correct date guidance', async () => {
    const res = await request(app)
      .post('/api/v1/inventory')
      .set('Authorization', authHeader)
      .send({
        name: 'Fresh Strawberries',
        category: 'Produce',
        quantity: 250,
        unit: 'grams',
        storage: 'fridge',
        purchase_date: '2026-10-23',
        expiry_date: '2026-10-27',
        date_label: 'use_by',
        is_opened: false
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Fresh Strawberries');
    expect(res.body.data.safety_guidance).toBeDefined();
  });

  it('should update item status to consumed', async () => {
    // Create an item first
    const createRes = await request(app)
      .post('/api/v1/inventory')
      .set('Authorization', authHeader)
      .send({
        name: 'Oat Milk Carton',
        category: 'Dairy',
        quantity: 1,
        unit: 'liters',
        storage: 'fridge',
        purchase_date: '2026-10-23',
        expiry_date: '2026-10-30',
        date_label: 'best_before'
      });

    const itemId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/inventory/${itemId}/status`)
      .set('Authorization', authHeader)
      .send({ status: 'consumed' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('consumed');
  });

  it('should parse receipt text into draft inventory items', async () => {
    const res = await request(app)
      .post('/api/v1/inventory/receipt-scan')
      .set('Authorization', authHeader)
      .send({
        rawText: 'ORGANIC MILK 1L\nWHOLE WHEAT BREAD\nBABY SPINACH 200G'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
  });
});
