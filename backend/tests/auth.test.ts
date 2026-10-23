import request from 'supertest';
import app from '../src/app';

describe('Auth & Permission Middleware Tests', () => {
  it('should reject unauthenticated requests to protected route /api/v1/auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user with valid Bearer demo token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer demo-token-household');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('household');
    expect(res.body.data.email).toBe('household@foodloop.ai');
  });

  it('should deny non-admin users from accessing /api/v1/admin/organizations', async () => {
    const res = await request(app)
      .get('/api/v1/admin/organizations')
      .set('Authorization', 'Bearer demo-token-household');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin user to access /api/v1/admin/organizations', async () => {
    const res = await request(app)
      .get('/api/v1/admin/organizations')
      .set('Authorization', 'Bearer demo-token-admin');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
