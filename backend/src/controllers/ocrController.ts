import { Request, Response, NextFunction } from 'express';
import { ocrService } from '../services/ocrService';
import { sendSuccess } from '../utils/responseHandler';
import { AppError } from '../middleware/errorHandler';

export const scanImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { image, itemType } = req.body;
    if (!image || typeof image !== 'string') {
      throw new AppError('Image base64 data is required', 400);
    }

    const result = await ocrService.extractText(image, itemType || 'general');
    sendSuccess(res, result, 'Image OCR extracted successfully');
  } catch (error) {
    next(error);
  }
};
