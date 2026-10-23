import {
  UserProfile,
  Organization,
  InventoryItem,
  AllergenPreferences,
  FoodLabelScan,
  Donation,
  DonationRequest,
  DonationStatusHistory,
  DeliveryConfirmation,
  Notification,
  AuditLog
} from '../types';

export const mockProfiles: UserProfile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'household@foodloop.ai',
    full_name: 'Aarav Sharma',
    role: 'household',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    phone: '+91 98765 43210',
    preferred_language: 'en'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'donor@greenbites.com',
    full_name: 'Chef Vikram Patel',
    role: 'donor',
    avatar_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150',
    phone: '+91 98111 22233',
    preferred_language: 'en'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'director@annadaata.org',
    full_name: 'Priya Deshmukh',
    role: 'ngo',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+91 98222 33344',
    preferred_language: 'hi'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'admin@foodloop.ai',
    full_name: 'System Administrator',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phone: '+91 99999 88888',
    preferred_language: 'en'
  }
];

export const mockOrganizations: Organization[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'GreenBites Artisan Cafe & Bakery',
    org_type: 'donor',
    registration_number: 'MH-REG-2024-897',
    address: 'Plot 45, Sector 18, Vashi',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    postal_code: '400703',
    latitude: 19.0760,
    longitude: 72.8777,
    contact_phone: '+91 98111 22233',
    contact_email: 'donor@greenbites.com',
    verification_status: 'verified',
    daily_capacity_kg: 250.0,
    accepted_food_types: ['bakery', 'cooked', 'packaged']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    user_id: '33333333-3333-3333-3333-333333333333',
    name: 'Annadaata Relief & Hunger Foundation',
    org_type: 'ngo',
    registration_number: 'NGO-IND-104928',
    address: 'Community Center 4, Chembur East',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400071',
    latitude: 19.0607,
    longitude: 72.8997,
    contact_phone: '+91 98222 33344',
    contact_email: 'director@annadaata.org',
    verification_status: 'verified',
    daily_capacity_kg: 500.0,
    accepted_food_types: ['cooked', 'packaged', 'raw', 'bakery']
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Organic Whole Milk',
    category: 'Dairy',
    quantity: 1.0,
    unit: 'liters',
    storage: 'fridge',
    purchase_date: '2026-10-20',
    expiry_date: '2026-10-25',
    date_label: 'use_by',
    safety_guidance: 'USE-BY: High microbial risk. Consume strictly before the date or boil immediately. Keep below 4°C.',
    status: 'expiring_soon',
    is_opened: true,
    opened_date: '2026-10-21',
    notes: 'Opened 2 days ago'
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Sourdough Bread',
    category: 'Bakery',
    quantity: 1.0,
    unit: 'loaf',
    storage: 'pantry',
    purchase_date: '2026-10-22',
    expiry_date: '2026-10-26',
    date_label: 'best_before',
    safety_guidance: 'BEST-BEFORE: Indicates optimal freshness, not safety. Safe past date if no visible mold. Toasting restores texture.',
    status: 'fresh',
    is_opened: false,
    notes: 'Store in sealed breadbox'
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Baby Spinach Leaves',
    category: 'Produce',
    quantity: 250.0,
    unit: 'grams',
    storage: 'fridge',
    purchase_date: '2026-10-19',
    expiry_date: '2026-10-24',
    date_label: 'use_by',
    safety_guidance: 'USE-BY: Discard if slimy or discolored. Cook into soup if wilting.',
    status: 'expiring_soon',
    is_opened: true,
    notes: 'Crisper drawer'
  },
  {
    id: 'f4444444-4444-4444-4444-444444444444',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'Greek Probiotic Yogurt',
    category: 'Dairy',
    quantity: 400.0,
    unit: 'grams',
    storage: 'fridge',
    purchase_date: '2026-10-13',
    expiry_date: '2026-10-22',
    date_label: 'best_before',
    safety_guidance: 'BEST-BEFORE: Acidic cultures naturally preserve yogurt 5-7 days past best-before if unopened.',
    status: 'expired',
    is_opened: false,
    notes: 'Unopened tub'
  },
  {
    id: 'f5555555-5555-5555-5555-555555555555',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'San Marzano Canned Tomatoes',
    category: 'Pantry',
    quantity: 2.0,
    unit: 'cans',
    storage: 'pantry',
    purchase_date: '2026-09-23',
    expiry_date: '2027-04-20',
    date_label: 'best_before',
    safety_guidance: 'BEST-BEFORE: High shelf life. Discard if can is bulging or dented along seam.',
    status: 'fresh',
    is_opened: false,
    notes: 'Emergency pantry supply'
  }
];

export const mockAllergenPrefs: AllergenPreferences[] = [
  {
    id: 'ap111111-1111-1111-1111-111111111111',
    user_id: '11111111-1111-1111-1111-111111111111',
    allergens: ['peanuts', 'gluten', 'shellfish'],
    dietary_flags: ['vegetarian', 'low_sodium'],
    strictness_level: 'strict'
  }
];

export const mockScans: FoodLabelScan[] = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    user_id: '11111111-1111-1111-1111-111111111111',
    product_name: 'Crunchy Honey Granola',
    brand: 'NatureHarvest',
    extracted_text: 'INGREDIENTS: Rolled Oats, Cane Sugar, Honey, Palm Oil, Almonds, Peanuts, Sunflower Seeds, Salt, Tocopherols (Vitamin E preservative). CONTAINS: PEANUTS, TREE NUTS (ALMONDS).',
    ingredients: ['Rolled Oats', 'Cane Sugar', 'Honey', 'Palm Oil', 'Almonds', 'Peanuts', 'Sunflower Seeds', 'Salt', 'Tocopherols'],
    nutrition_facts: {
      calories: 450,
      protein_g: 10,
      carbs_g: 62,
      sugar_g: 24,
      fat_g: 18,
      sat_fat_g: 6,
      sodium_mg: 180,
      fiber_g: 7
    },
    detected_allergens: ['peanuts', 'tree_nuts'],
    health_score: 62,
    nutri_grade: 'C',
    explanation_en: 'Contains whole grain oats and nuts providing fiber and healthy fats, but sugar content is elevated (24g/100g). WARNING: Contains peanuts and almonds which trigger your personal allergy profile.',
    explanation_hi: 'इसमें साबुत ओट्स और मेवे हैं जो फाइबर प्रदान करते हैं, लेकिन चीनी की मात्रा अधिक (24g/100g) है। चेतावनी: इसमें मूंगफली और बादाम हैं जो आपके एलर्जी प्रोफाइल से मेल खाते हैं।',
    preservatives_additives: ['Tocopherols (E306)'],
    created_at: new Date().toISOString()
  }
];

export const mockDonations: Donation[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    donor_id: '22222222-2222-2222-2222-222222222222',
    donor_org_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Fresh Whole Wheat Croissants & Artisan Loaves',
    food_category: 'bakery',
    quantity_kg: 18.5,
    servings_estimate: 60,
    perishable: true,
    prepared_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    expiry_time: new Date(Date.now() + 16 * 3600000).toISOString(),
    pickup_address: 'GreenBites Cafe, Plot 45, Sector 18, Vashi, Navi Mumbai',
    pickup_latitude: 19.0760,
    pickup_longitude: 72.8777,
    pickup_window_start: new Date(Date.now() + 3600000).toISOString(),
    pickup_window_end: new Date(Date.now() + 4 * 3600000).toISOString(),
    dietary_attributes: ['vegetarian'],
    packaging_notes: 'Packed in food-grade kraft paper bags, sealed and stored in clean crates.',
    status: 'available',
    pickup_otp: '482910',
    delivery_otp: '910283',
    created_at: new Date().toISOString()
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    donor_id: '22222222-2222-2222-2222-222222222222',
    donor_org_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Catered Veg Pulao & Dal Tadka (Untouched)',
    food_category: 'cooked',
    quantity_kg: 35.0,
    servings_estimate: 110,
    perishable: true,
    prepared_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    expiry_time: new Date(Date.now() + 6 * 3600000).toISOString(),
    pickup_address: 'GreenBites Banquet Wing, Vashi, Navi Mumbai',
    pickup_latitude: 19.0760,
    pickup_longitude: 72.8777,
    pickup_window_start: new Date(Date.now() + 1800000).toISOString(),
    pickup_window_end: new Date(Date.now() + 2 * 3600000).toISOString(),
    dietary_attributes: ['vegetarian', 'vegan'],
    packaging_notes: 'Kept at safe temperature (>65°C) in stainless steel food pans with lids.',
    status: 'matched',
    pickup_otp: '739104',
    delivery_otp: '104938',
    assigned_ngo_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: new Date().toISOString()
  }
];

export const mockRequests: DonationRequest[] = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    donation_id: 'd2222222-2222-2222-2222-222222222222',
    ngo_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    requester_user_id: '33333333-3333-3333-3333-333333333333',
    match_score: 94,
    status: 'accepted',
    request_notes: 'Our volunteer van is 4.2km away with insulated thermal food containers ready for rapid distribution.',
    created_at: new Date().toISOString()
  }
];

export const mockStatusHistory: DonationStatusHistory[] = [
  {
    id: 'sh111111-1111-1111-1111-111111111111',
    donation_id: 'd2222222-2222-2222-2222-222222222222',
    previous_status: 'available',
    new_status: 'matched',
    changed_by_user_id: '22222222-2222-2222-2222-222222222222',
    notes: 'Accepted request from Annadaata Foundation',
    created_at: new Date().toISOString()
  }
];

export const mockDeliveries: DeliveryConfirmation[] = [];

export const mockNotifications: Notification[] = [
  {
    id: 'n1111111-1111-1111-1111-111111111111',
    user_id: '11111111-1111-1111-1111-111111111111',
    title: 'FreshTrack Reminder: Baby Spinach wilting soon!',
    message: 'Your Baby Spinach Leaves expires tomorrow. Check our AI recipe ideas to use it up today!',
    type: 'expiry_alert',
    link_url: '/freshtrack',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'n2222222-2222-2222-2222-222222222222',
    user_id: '22222222-2222-2222-2222-222222222222',
    title: 'Donation Matched: Annadaata Foundation',
    message: 'Annadaata Foundation accepted your donation of Catered Veg Pulao (35kg). Pickup expected within 90 minutes.',
    type: 'donation_match',
    link_url: '/foodbridge',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'n3333333-3333-3333-3333-333333333333',
    user_id: '33333333-3333-3333-3333-333333333333',
    title: 'New Surplus Available in your area: 18.5kg Bread',
    message: 'GreenBites Cafe posted 18.5kg of artisan bakery items within 4.5km of your center.',
    type: 'donation_match',
    link_url: '/foodbridge',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'l1111111-1111-1111-1111-111111111111',
    actor_id: '44444444-4444-4444-4444-444444444444',
    action: 'ORG_VERIFIED',
    entity_type: 'organization',
    entity_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    details: { reason: '80G Certificate and FSSAI Food Safety Registration validated', verified_by: 'System Administrator' },
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  }
];
