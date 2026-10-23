import { inventoryRepository } from '../repositories/inventoryRepository';
import { InventoryItem, InventoryStatus } from '../types';
import {
  computeInventoryStatus,
  getFoodSafetyGuidance,
  getDaysRemaining
} from '../utils/dateHelpers';
import { AppError } from '../middleware/errorHandler';

export interface ReceiptParsedItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedExpiryDays: number;
  date_label: 'best_before' | 'use_by' | 'expiry';
  storage: 'fridge' | 'pantry' | 'freezer';
}

export class InventoryService {
  async getInventory(userId: string, filters?: { status?: InventoryStatus; storage?: string }) {
    const items = await inventoryRepository.findByUserId(userId, filters);

    // Dynamic refresh of statuses based on current date
    return items.map(item => {
      const liveStatus = computeInventoryStatus(item.expiry_date, item.status);
      return {
        ...item,
        status: liveStatus,
        days_remaining: getDaysRemaining(item.expiry_date)
      };
    });
  }

  async getInventoryItem(id: string, userId: string) {
    const item = await inventoryRepository.findById(id);
    if (!item) throw new AppError('Inventory item not found', 404);
    if (item.user_id !== userId) throw new AppError('Forbidden: Not your inventory item', 403);
    return {
      ...item,
      status: computeInventoryStatus(item.expiry_date, item.status),
      days_remaining: getDaysRemaining(item.expiry_date)
    };
  }

  async addItem(userId: string, data: Omit<InventoryItem, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) {
    const calculatedStatus = computeInventoryStatus(data.expiry_date);
    const safetyGuidance = data.safety_guidance || getFoodSafetyGuidance(data.category, data.date_label, data.is_opened);

    return inventoryRepository.create({
      ...data,
      user_id: userId,
      status: calculatedStatus,
      safety_guidance: safetyGuidance
    });
  }

  async updateItem(id: string, userId: string, data: Partial<InventoryItem>) {
    const existing = await inventoryRepository.findById(id);
    if (!existing) throw new AppError('Inventory item not found', 404);
    if (existing.user_id !== userId) throw new AppError('Forbidden: Not your item', 403);

    const expiryDate = data.expiry_date || existing.expiry_date;
    const dateLabel = data.date_label || existing.date_label;
    const category = data.category || existing.category;
    const isOpened = data.is_opened !== undefined ? data.is_opened : existing.is_opened;

    const safetyGuidance = getFoodSafetyGuidance(category, dateLabel, isOpened);
    const status = computeInventoryStatus(expiryDate, data.status || existing.status);

    return inventoryRepository.update(id, {
      ...data,
      safety_guidance: safetyGuidance,
      status
    });
  }

  async deleteItem(id: string, userId: string) {
    const existing = await inventoryRepository.findById(id);
    if (!existing) throw new AppError('Inventory item not found', 404);
    if (existing.user_id !== userId) throw new AppError('Forbidden: Not your item', 403);

    return inventoryRepository.delete(id);
  }

  async updateItemStatus(id: string, userId: string, status: InventoryStatus) {
    const existing = await inventoryRepository.findById(id);
    if (!existing) throw new AppError('Inventory item not found', 404);
    if (existing.user_id !== userId) throw new AppError('Forbidden: Not your item', 403);

    return inventoryRepository.update(id, { status });
  }

  /**
   * Parses raw receipt OCR text and produces normalized draft inventory items
   */
  parseReceiptText(rawText: string): ReceiptParsedItem[] {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: ReceiptParsedItem[] = [];

    const categoryKeywords: Record<string, { category: string; shelfDays: number; date_label: 'best_before' | 'use_by' | 'expiry'; storage: 'fridge' | 'pantry' | 'freezer' }> = {
      milk: { category: 'Dairy', shelfDays: 5, date_label: 'use_by', storage: 'fridge' },
      yogurt: { category: 'Dairy', shelfDays: 10, date_label: 'best_before', storage: 'fridge' },
      cheese: { category: 'Dairy', shelfDays: 14, date_label: 'best_before', storage: 'fridge' },
      bread: { category: 'Bakery', shelfDays: 4, date_label: 'best_before', storage: 'pantry' },
      croissant: { category: 'Bakery', shelfDays: 2, date_label: 'best_before', storage: 'pantry' },
      spinach: { category: 'Produce', shelfDays: 3, date_label: 'use_by', storage: 'fridge' },
      apple: { category: 'Produce', shelfDays: 14, date_label: 'best_before', storage: 'fridge' },
      banana: { category: 'Produce', shelfDays: 5, date_label: 'best_before', storage: 'pantry' },
      tomato: { category: 'Produce', shelfDays: 6, date_label: 'best_before', storage: 'pantry' },
      chicken: { category: 'Meat & Poultry', shelfDays: 2, date_label: 'use_by', storage: 'fridge' },
      rice: { category: 'Pantry', shelfDays: 180, date_label: 'best_before', storage: 'pantry' },
      pasta: { category: 'Pantry', shelfDays: 365, date_label: 'best_before', storage: 'pantry' },
      oats: { category: 'Pantry', shelfDays: 120, date_label: 'best_before', storage: 'pantry' }
    };

    for (const line of lines) {
      const lower = line.toLowerCase();
      let matched = false;

      for (const [kw, info] of Object.entries(categoryKeywords)) {
        if (lower.includes(kw)) {
          parsed.push({
            name: line.replace(/[$€₹\d.,\-xX]+/g, '').trim() || kw.toUpperCase(),
            category: info.category,
            quantity: 1,
            unit: info.category === 'Dairy' ? 'liters' : info.category === 'Produce' ? 'grams' : 'units',
            estimatedExpiryDays: info.shelfDays,
            date_label: info.date_label,
            storage: info.storage
          });
          matched = true;
          break;
        }
      }

      if (!matched && line.length > 3 && !line.match(/total|tax|subtotal|cash|change|date/i)) {
        parsed.push({
          name: line,
          category: 'Pantry',
          quantity: 1,
          unit: 'units',
          estimatedExpiryDays: 14,
          date_label: 'best_before',
          storage: 'pantry'
        });
      }
    }

    return parsed.slice(0, 10);
  }

  /**
   * Suggests creative zero-waste recipes using items currently in the user's inventory
   * that are expiring soon.
   */
  async getZeroWasteRecipeSuggestions(userId: string) {
    const items = await this.getInventory(userId);
    const expiringItems = items.filter(i => i.status === 'expiring_soon' || i.status === 'fresh');
    const names = expiringItems.map(i => i.name.toLowerCase());

    const suggestions = [
      {
        title: 'Zero-Waste Garden Frittata',
        description: 'Quick oven bake combining wilting greens, dairy, and pantry herbs before they spoil.',
        matchingIngredients: names.filter(n => n.includes('spinach') || n.includes('milk') || n.includes('cheese')),
        prepTimeMinutes: 20,
        difficulty: 'Easy',
        sustainabilityImpact: 'Rescues delicate produce and dairy protein.'
      },
      {
        title: 'Artisan Crouton & Tomato Panzanella Salad',
        description: 'Repurpose day-old artisan bread with ripe tomatoes and olive oil into a crisp Tuscan classic.',
        matchingIngredients: names.filter(n => n.includes('bread') || n.includes('tomato')),
        prepTimeMinutes: 15,
        difficulty: 'Easy',
        sustainabilityImpact: 'Prevents bakery staling and uses overripe produce.'
      },
      {
        title: 'Spiced Creamy Curry / Dal Companion',
        description: 'Combine wilting vegetables and dairy into a comforting savory pot.',
        matchingIngredients: names.filter(n => n.includes('milk') || n.includes('yogurt') || n.includes('spinach')),
        prepTimeMinutes: 30,
        difficulty: 'Medium',
        sustainabilityImpact: 'High thermal cooking renders past-best-before ingredients safe and delicious.'
      }
    ];

    return suggestions;
  }
}

export const inventoryService = new InventoryService();
