import { Request, Response, NextFunction } from 'express';
import { openFoodFactsService } from '../services/openFoodFactsService';
import { sendSuccess, sendError } from '../utils/responseHandler';

export const getProductByBarcode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { barcode } = req.params;
    const result = await openFoodFactsService.getProductByBarcode(barcode);

    if (!result.success || !result.data) {
      sendError(res, result.message || 'Product not found in Open Food Facts', 404);
      return;
    }

    sendSuccess(res, result.data, `Product retrieved successfully (${result.source})`);
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string || '1', 10);

    if (!query) {
      sendError(res, 'Query parameter "q" is required', 400);
      return;
    }

    const result = await openFoodFactsService.searchProducts(query, page);

    if (!result.success || !result.data) {
      sendError(res, result.message || 'Search failed', 500);
      return;
    }

    sendSuccess(res, result.data, `Search results retrieved (${result.source})`);
  } catch (error) {
    next(error);
  }
};
