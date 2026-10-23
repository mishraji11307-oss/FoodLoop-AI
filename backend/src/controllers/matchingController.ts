import { Request, Response, NextFunction } from 'express';
import { matchingService } from '../services/matchingService';
import { sendSuccess } from '../utils/responseHandler';

export const getMatchingRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recommendations = await matchingService.getRecommendationsForNgo(req.user!.id);
    sendSuccess(res, recommendations);
  } catch (error) {
    next(error);
  }
};
