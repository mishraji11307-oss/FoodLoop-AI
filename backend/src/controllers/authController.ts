import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { mockProfiles } from '../repositories/mockStore';

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 401);
      return;
    }
    sendSuccess(res, req.user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    sendSuccess(res, {
      token: `demo-token-${user.role}`,
      user
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, full_name, role, phone, preferred_language } = req.body;
    const existing = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      full_name,
      role: role || 'household',
      phone,
      preferred_language: preferred_language || 'en',
      created_at: new Date().toISOString()
    };
    mockProfiles.push(newUser);

    sendSuccess(res, {
      token: `demo-token-${newUser.role}`,
      user: newUser
    }, 'Account registered successfully', 201);
  } catch (error) {
    next(error);
  }
};
