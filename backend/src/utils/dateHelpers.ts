import { DateLabelType, InventoryStatus } from '../types';

export const getDaysRemaining = (expiryDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const computeInventoryStatus = (
  expiryDateStr: string,
  currentStatus: InventoryStatus = 'fresh'
): InventoryStatus => {
  if (currentStatus === 'consumed' || currentStatus === 'wasted') {
    return currentStatus;
  }

  const days = getDaysRemaining(expiryDateStr);

  if (days < 0) return 'expired';
  if (days <= 2) return 'expiring_soon';
  return 'fresh';
};

/**
 * Returns evidence-based food safety guidance distinguishing Best Before from Use By.
 */
export const getFoodSafetyGuidance = (
  category: string,
  dateLabel: DateLabelType,
  isOpened: boolean
): string => {
  const cat = category.toLowerCase();

  if (dateLabel === 'use_by') {
    if (cat.includes('dairy') || cat.includes('milk')) {
      return 'USE-BY: High microbial risk. Consume strictly before the date or boil immediately. Once opened, consume within 3 days.';
    }
    if (cat.includes('meat') || cat.includes('poultry') || cat.includes('fish')) {
      return 'USE-BY: Strict food safety deadline. Do NOT consume past date due to salmonella/listeria risk. Freeze before date to extend life.';
    }
    return 'USE-BY: Strict safety warning. Discard after this date even if sensory appearance seems normal.';
  }

  if (dateLabel === 'best_before') {
    if (cat.includes('bakery') || cat.includes('bread')) {
      return 'BEST-BEFORE: Indicates optimal freshness, not safety. Safe past date if no visible mold. Toasting restores texture.';
    }
    if (cat.includes('canned') || cat.includes('pantry')) {
      return 'BEST-BEFORE: Shelf-stable. Safe for months past date if can seal is intact and not dented or bulging.';
    }
    if (cat.includes('dairy') || cat.includes('yogurt') || cat.includes('cheese')) {
      return 'BEST-BEFORE: Acidic cultures naturally preserve yogurt/hard cheese for 5-7 days past date if kept cold (<4°C). Inspect smell and surface.';
    }
    return 'BEST-BEFORE: Quality guarantee. Item remains safe to eat past date if color, texture, and aroma are normal.';
  }

  return 'EXPIRY: Consume or preserve prior to this date. Keep refrigerated below 4°C.';
};
