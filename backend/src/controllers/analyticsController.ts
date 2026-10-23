import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';
import { sendSuccess } from '../utils/responseHandler';

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const analytics = await analyticsService.getPlatformImpact();
    sendSuccess(res, analytics);
  } catch (error) {
    next(error);
  }
};
