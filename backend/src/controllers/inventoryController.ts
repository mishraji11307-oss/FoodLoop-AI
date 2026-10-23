import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventoryService';
import { sendSuccess } from '../utils/responseHandler';
import { InventoryStatus } from '../types';

export const getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, storage } = req.query;

    const items = await inventoryService.getInventory(userId, {
      status: status as InventoryStatus,
      storage: storage as string
    });

    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
};

export const getInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await inventoryService.getInventoryItem(req.params.id, req.user!.id);
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await inventoryService.addItem(req.user!.id, req.body);
    sendSuccess(res, item, 'Inventory item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.user!.id, req.body);
    sendSuccess(res, item, 'Inventory item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await inventoryService.deleteItem(req.params.id, req.user!.id);
    sendSuccess(res, { deleted: true }, 'Inventory item deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateInventoryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await inventoryService.updateItemStatus(req.params.id, req.user!.id, req.body.status);
    sendSuccess(res, item, 'Inventory item status updated');
  } catch (error) {
    next(error);
  }
};

export const scanReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rawText } = req.body;
    const parsedDrafts = inventoryService.parseReceiptText(rawText);
    sendSuccess(res, parsedDrafts, 'Receipt parsed successfully');
  } catch (error) {
    next(error);
  }
};

export const getRecipeSuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suggestions = await inventoryService.getZeroWasteRecipeSuggestions(req.user!.id);
    sendSuccess(res, suggestions);
  } catch (error) {
    next(error);
  }
};
