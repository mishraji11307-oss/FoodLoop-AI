import { apiRequest } from './apiClient';
import { UserProfile, UserRole } from '../types';

export const authService = {
  async getMe(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/auth/me');
  },

  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await apiRequest<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('foodloop_token', res.token);
      localStorage.setItem('foodloop_active_role', res.user.role);
    }
    return res;
  },

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    phone?: string;
  }): Promise<{ token: string; user: UserProfile }> {
    const res = await apiRequest<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('foodloop_token', res.token);
      localStorage.setItem('foodloop_active_role', res.user.role);
    }
    return res;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodloop_token');
    }
  },

  setActiveRole(role: UserRole): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodloop_active_role', role);
      localStorage.setItem('foodloop_token', `demo-token-${role}`);
    }
  },

  getActiveRole(): UserRole {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('foodloop_active_role') as UserRole) || 'household';
    }
    return 'household';
  }
};
