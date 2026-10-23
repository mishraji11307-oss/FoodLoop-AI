import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/database';
import { UserProfile, UserRole } from '../types';
import { sendError } from '../utils/responseHandler';
import { mockProfiles } from '../repositories/mockStore';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

const DEMO_USERS: Record<string, UserProfile> = {
  'demo-token-household': mockProfiles[0],
  'demo-token-donor': mockProfiles[1],
  'demo-token-ngo': mockProfiles[2],
  'demo-token-admin': mockProfiles[3]
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If running in development with no header, fall back to household demo user
    if (process.env.NODE_ENV !== 'production' && req.headers['x-demo-role']) {
      const demoRole = String(req.headers['x-demo-role']).toLowerCase();
      const matched = mockProfiles.find(p => p.role === demoRole);
      if (matched) {
        req.user = matched;
        return next();
      }
    }
    sendError(res, 'Authorization token missing or malformed', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  // Check demo tokens
  if (DEMO_USERS[token]) {
    req.user = DEMO_USERS[token];
    return next();
  }

  // Check if token matches a mock user ID directly (for tests)
  const matchedUserById = mockProfiles.find(p => p.id === token);
  if (matchedUserById) {
    req.user = matchedUserById;
    return next();
  }

  // Check Supabase Auth if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        sendError(res, 'Invalid or expired session token', 401);
        return;
      }

      // Fetch profile role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
        role: (profile?.role || user.user_metadata?.role || 'household') as UserRole,
        preferred_language: profile?.preferred_language || 'en'
      };
      return next();
    } catch {
      sendError(res, 'Authentication verification failed', 401);
      return;
    }
  }

  // Fallback default in demo mode if token unknown
  sendError(res, 'Invalid authentication token', 401);
};

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required for this resource', 401);
      return;
    }

    if (req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    sendError(
      res,
      `Access forbidden: requires one of [${allowedRoles.join(', ')}] role`,
      403
    );
  };
};
