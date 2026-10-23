import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';
import { sendSuccess } from '../utils/responseHandler';

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.id);
    sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const success = await notificationService.markAsRead(req.params.id, req.user!.id);
    sendSuccess(res, { read: success });
  } catch (error) {
    next(error);
  }
};
