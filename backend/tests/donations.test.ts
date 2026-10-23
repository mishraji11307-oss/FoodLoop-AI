import request from 'supertest';
import app from '../src/app';

describe('FoodBridge Donations & State Transitions Tests', () => {
  const donorAuth = 'Bearer demo-token-donor';
  const ngoAuth = 'Bearer demo-token-ngo';

  it('should list available surplus donations publicly', async () => {
    const res = await request(app).get('/api/v1/donations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should create a new surplus donation as donor and generate secret OTPs', async () => {
    const res = await request(app)
      .post('/api/v1/donations')
      .set('Authorization', donorAuth)
      .send({
        title: 'Fresh Dinner Rolls and Baguettes',
        food_category: 'bakery',
        quantity_kg: 12.0,
        servings_estimate: 40,
        perishable: true,
        expiry_time: new Date(Date.now() + 12 * 3600000).toISOString(),
        pickup_address: 'GreenBites Bakery Wing 2, Vashi',
        pickup_latitude: 19.0760,
        pickup_longitude: 72.8777,
        pickup_window_start: new Date(Date.now() + 3600000).toISOString(),
        pickup_window_end: new Date(Date.now() + 5 * 3600000).toISOString(),
        dietary_attributes: ['vegetarian']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('available');
    expect(res.body.data.pickup_otp).toHaveLength(6);
    expect(res.body.data.delivery_otp).toHaveLength(6);
  });

  it('should allow verified NGO to request donation, and donor to accept request', async () => {
    // 1. Create a donation
    const createRes = await request(app)
      .post('/api/v1/donations')
      .set('Authorization', donorAuth)
      .send({
        title: 'Catered Rice and Mixed Vegetables',
        food_category: 'cooked',
        quantity_kg: 25.0,
        servings_estimate: 80,
        perishable: true,
        expiry_time: new Date(Date.now() + 8 * 3600000).toISOString(),
        pickup_address: 'GreenBites Banquet, Vashi',
        pickup_latitude: 19.0760,
        pickup_longitude: 72.8777,
        pickup_window_start: new Date(Date.now() + 1800000).toISOString(),
        pickup_window_end: new Date(Date.now() + 3 * 3600000).toISOString(),
        dietary_attributes: ['vegetarian']
      });

    const donationId = createRes.body.data.id;
    const pickupOtp = createRes.body.data.pickup_otp;
    const deliveryOtp = createRes.body.data.delivery_otp;

    // 2. NGO requests the donation
    const reqRes = await request(app)
      .post(`/api/v1/donations/${donationId}/requests`)
      .set('Authorization', ngoAuth)
      .send({
        ngo_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        request_notes: 'Our team is nearby with thermal insulated storage.'
      });

    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.data.id;

    // 3. Donor accepts the request
    const acceptRes = await request(app)
      .post(`/api/v1/donation-requests/${requestId}/accept`)
      .set('Authorization', donorAuth);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe('matched');

    // 4. Reject pickup verification with wrong OTP
    const badPickupRes = await request(app)
      .post(`/api/v1/donations/${donationId}/pickup-confirmation`)
      .set('Authorization', ngoAuth)
      .send({ otp: '000000' });

    expect(badPickupRes.status).toBe(400);

    // 5. Confirm pickup with correct OTP -> transitions to in_transit
    const goodPickupRes = await request(app)
      .post(`/api/v1/donations/${donationId}/pickup-confirmation`)
      .set('Authorization', ngoAuth)
      .send({ otp: pickupOtp, temperature_celsius: 18.0 });

    expect(goodPickupRes.status).toBe(200);
    expect(goodPickupRes.body.data.status).toBe('in_transit');

    // 6. Confirm delivery with delivery OTP -> transitions to delivered
    const deliveryRes = await request(app)
      .post(`/api/v1/donations/${donationId}/delivery-confirmation`)
      .set('Authorization', ngoAuth)
      .send({
        otp: deliveryOtp,
        beneficiaries_served: 80,
        confirmation_notes: 'Served at community lunch shelter'
      });

    expect(deliveryRes.status).toBe(200);
    expect(deliveryRes.body.data.status).toBe('delivered');
  });
});
