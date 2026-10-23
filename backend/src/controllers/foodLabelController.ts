import { Request, Response, NextFunction } from 'express';
import { foodLabelService } from '../services/foodLabelService';
import { sendSuccess } from '../utils/responseHandler';

export const scanFoodLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { product_name, brand, raw_text, user_allergens, image_url } = req.body;
    const userId = req.user?.id;

    const result = await foodLabelService.processLabelScan({
      userId,
      productName: product_name,
      brand,
      rawText: raw_text,
      userAllergens: user_allergens,
      imageUrl: image_url
    });

    sendSuccess(res, result, 'Food label processed successfully');
  } catch (error) {
    next(error);
  }
};

export const getScanHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const history = await foodLabelService.getRecentScans(userId);
    sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
};

export const getAllergenPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const prefs = await foodLabelService.getUserAllergenPreferences(userId);
    sendSuccess(res, prefs || { allergens: [], dietary_flags: [], strictness_level: 'warning' });
  } catch (error) {
    next(error);
  }
};

export const updateAllergenPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { allergens, dietary_flags, strictness_level } = req.body;
    const updated = await foodLabelService.updateUserAllergenPreferences(
      userId,
      allergens,
      dietary_flags || [],
      strictness_level || 'warning'
    );
    sendSuccess(res, updated, 'Allergen preferences saved');
  } catch (error) {
    next(error);
  }
};
