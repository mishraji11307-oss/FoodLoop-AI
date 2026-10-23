export type UserRole = 'household' | 'donor' | 'ngo' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  preferred_language?: string;
}

export type DateLabelType = 'best_before' | 'use_by' | 'expiry';
export type InventoryStatus = 'fresh' | 'expiring_soon' | 'expired' | 'consumed' | 'wasted';
export type StorageLocation = 'fridge' | 'pantry' | 'freezer';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  storage: StorageLocation;
  purchase_date: string;
  expiry_date: string;
  date_label: DateLabelType;
  safety_guidance?: string;
  status: InventoryStatus;
  is_opened: boolean;
  opened_date?: string;
  notes?: string;
  days_remaining?: number;
}

export interface FoodLabelScan {
  id: string;
  user_id?: string;
  product_name: string;
  brand?: string;
  image_url?: string;
  extracted_text: string;
  ingredients: string[];
  nutrition_facts: {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    sugar_g?: number;
    fat_g?: number;
    sat_fat_g?: number;
    sodium_mg?: number;
    fiber_g?: number;
  };
  detected_allergens: string[];
  health_score: number;
  nutri_grade: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation_en: string;
  explanation_hi: string;
  preservatives_additives: string[];
  userAllergenConflict?: boolean;
  matchingUserAllergens?: string[];
  created_at?: string;
}

export type DonationStatus = 
  | 'available' 
  | 'requested' 
  | 'matched' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled' 
  | 'expired';

export interface Donation {
  id: string;
  donor_id: string;
  donor_org_id?: string;
  title: string;
  food_category: string;
  quantity_kg: number;
  servings_estimate: number;
  perishable: boolean;
  prepared_at?: string;
  expiry_time: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_window_start: string;
  pickup_window_end: string;
  dietary_attributes: string[];
  packaging_notes?: string;
  status: DonationStatus;
  pickup_otp: string;
  delivery_otp: string;
  assigned_ngo_id?: string;
  created_at?: string;
}

export interface DonationRequest {
  id: string;
  donation_id: string;
  ngo_id: string;
  requester_user_id: string;
  match_score: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  request_notes?: string;
}

export interface MatchRecommendation {
  donation: Donation;
  ngo: {
    id: string;
    name: string;
    city: string;
    daily_capacity_kg: number;
  };
  distanceKm: number;
  matchScore: number;
  scoreBreakdown: {
    distanceScore: number;
    capacityScore: number;
    categoryMatchScore: number;
    urgencyBonus: number;
  };
  rationale: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url?: string;
  created_at?: string;
}

export interface PlatformAnalytics {
  totalMealsRescued: number;
  totalKgDiverted: number;
  co2KgPrevented: number;
  activeDonationsCount: number;
  completedDonationsCount: number;
  verifiedNgoCount: number;
  wasteReductionRatePercent: number;
  categoryBreakdown: { category: string; count: number; kg: number }[];
  monthlyImpactTrend: { month: string; kg: number; meals: number }[];
}
