const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('foodloop_token') : null;
  const demoRole = typeof window !== 'undefined' ? localStorage.getItem('foodloop_active_role') || 'household' : 'household';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Default demo token according to active role
    headers['Authorization'] = `Bearer demo-token-${demoRole}`;
  }
  headers['x-demo-role'] = demoRole;

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg = json?.error?.message || json?.error || json?.message || `HTTP Error ${res.status}`;
      throw new ApiError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), res.status, json);
    }

    return json?.data !== undefined ? json.data : json;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed. Is the backend server running?', 503);
  }
}
