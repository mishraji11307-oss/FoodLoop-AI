-- FoodLoop AI Seed Data
-- License: MIT

-- 1. Profiles
INSERT INTO profiles (id, email, full_name, role, avatar_url, phone, preferred_language)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'household@foodloop.ai', 'Aarav Sharma', 'household', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '+91 98765 43210', 'en'),
  ('22222222-2222-2222-2222-222222222222', 'donor@greenbites.com', 'Chef Vikram Patel', 'donor', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150', '+91 98111 22233', 'en'),
  ('33333333-3333-3333-3333-333333333333', 'director@annadaata.org', 'Priya Deshmukh', 'ngo', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '+91 98222 33344', 'hi'),
  ('44444444-4444-4444-4444-444444444444', 'admin@foodloop.ai', 'System Administrator', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '+91 99999 88888', 'en')
ON CONFLICT (id) DO NOTHING;

-- 2. Organizations
INSERT INTO organizations (id, user_id, name, org_type, registration_number, address, city, state, postal_code, latitude, longitude, contact_phone, contact_email, verification_status, daily_capacity_kg, accepted_food_types)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'GreenBites Artisan Cafe & Bakery', 'donor', 'MH-REG-2024-897', 'Plot 45, Sector 18, Vashi', 'Navi Mumbai', 'Maharashtra', '400703', 19.0760, 72.8777, '+91 98111 22233', 'donor@greenbites.com', 'verified', 250.0, ARRAY['bakery', 'cooked', 'packaged']),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Annadaata Relief & Hunger Foundation', 'ngo', 'NGO-IND-104928', 'Community Center 4, Chembur East', 'Mumbai', 'Maharashtra', '400071', 19.0607, 72.8997, '+91 98222 33344', 'director@annadaata.org', 'verified', 500.0, ARRAY['cooked', 'packaged', 'raw', 'bakery'])
ON CONFLICT (id) DO NOTHING;

-- 3. FreshTrack: Household Food Inventory
INSERT INTO inventory_items (id, user_id, name, category, quantity, unit, storage, purchase_date, expiry_date, date_label, safety_guidance, status, is_opened, notes)
VALUES
  ('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Organic Whole Milk', 'Dairy', 1.0, 'liters', 'fridge', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'use_by', 'Must be consumed by expiry date or boiled. Keep below 4°C.', 'expiring_soon', TRUE, 'Opened 2 days ago'),
  ('f2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Sourdough Bread', 'Bakery', 1.0, 'loaf', 'pantry', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', 'best_before', 'Safe to consume past date if no visible mold. Toasting recommended.', 'fresh', FALSE, 'Store in sealed breadbox'),
  ('f3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Baby Spinach Leaves', 'Produce', 250.0, 'grams', 'fridge', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '1 day', 'use_by', 'Discard if slimy or discolored. Cook into soup if wilting.', 'expiring_soon', TRUE, 'Crisper drawer'),
  ('f4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Greek Probiotic Yogurt', 'Dairy', 400.0, 'grams', 'fridge', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '1 day', 'best_before', 'Acidic environment preserves yogurt 5-7 days past best-before if unopened.', 'expired', FALSE, 'Unopened tub'),
  ('f5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'San Marzano Canned Tomatoes', 'Pantry', 2.0, 'cans', 'pantry', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '180 days', 'best_before', 'High shelf life. Discard if can is bulging or dented along seam.', 'fresh', FALSE, 'Emergency cooking pantry')
ON CONFLICT (id) DO NOTHING;

-- 4. User Allergen Preferences
INSERT INTO allergen_preferences (user_id, allergens, dietary_flags, strictness_level)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  ARRAY['peanuts', 'gluten', 'shellfish'],
  ARRAY['vegetarian', 'low_sodium'],
  'strict'
) ON CONFLICT (user_id) DO NOTHING;

-- 5. FoodLabel AI: Scan History
INSERT INTO food_label_scans (id, user_id, product_name, brand, extracted_text, ingredients, nutrition_facts, detected_allergens, health_score, nutri_grade, explanation_en, explanation_hi, preservatives_additives)
VALUES (
  's1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Crunchy Honey Granola',
  'NatureHarvest',
  'INGREDIENTS: Rolled Oats, Cane Sugar, Honey, Palm Oil, Almonds, Peanuts, Sunflower Seeds, Salt, Tocopherols (Vitamin E preservative). CONTAINS: PEANUTS, TREE NUTS (ALMONDS). MAY CONTAIN MILK AND SOY. Per 100g: Energy 450kcal, Protein 10g, Sugar 24g, Saturated Fat 6g, Sodium 180mg.',
  '["Rolled Oats", "Cane Sugar", "Honey", "Palm Oil", "Almonds", "Peanuts", "Sunflower Seeds", "Salt", "Tocopherols"]'::jsonb,
  '{"calories": 450, "protein_g": 10, "carbs_g": 62, "sugar_g": 24, "fat_g": 18, "sat_fat_g": 6, "sodium_mg": 180}'::jsonb,
  ARRAY['peanuts', 'tree_nuts'],
  62,
  'C',
  'Contains whole grain oats and nuts providing fiber and healthy fats, but sugar content is elevated (24g/100g). WARNING: Contains peanuts and almonds which trigger your personal allergy profile.',
  'इसमें साबुत ओट्स और मेवे हैं जो फाइबर प्रदान करते हैं, लेकिन चीनी की मात्रा अधिक (24g/100g) है। चेतावनी: इसमें मूंगफली और बादाम हैं जो आपके एलर्जी प्रोफाइल से मेल खाते हैं।',
  ARRAY['Tocopherols (E306)']
) ON CONFLICT (id) DO NOTHING;

-- 6. FoodBridge: Surplus Food Donations
INSERT INTO donations (id, donor_id, donor_org_id, title, food_category, quantity_kg, servings_estimate, perishable, prepared_at, expiry_time, pickup_address, pickup_latitude, pickup_longitude, pickup_window_start, pickup_window_end, dietary_attributes, packaging_notes, status, pickup_otp, delivery_otp, assigned_ngo_id)
VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Fresh Whole Wheat Croissants & Artisan Loaves',
    'bakery',
    18.5,
    60,
    TRUE,
    NOW() - INTERVAL '4 hours',
    NOW() + INTERVAL '16 hours',
    'GreenBites Cafe, Plot 45, Sector 18, Vashi, Navi Mumbai',
    19.0760,
    72.8777,
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '4 hours',
    ARRAY['vegetarian'],
    'Packed in food-grade kraft paper bags, sealed and stored in clean crates.',
    'available',
    '482910',
    '910283',
    NULL
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Catered Veg Pulao & Dal Tadka (Untouched)',
    'cooked',
    35.0,
    110,
    TRUE,
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '6 hours',
    'GreenBites Banquet Wing, Vashi, Navi Mumbai',
    19.0760,
    72.8777,
    NOW() + INTERVAL '30 minutes',
    NOW() + INTERVAL '2 hours',
    ARRAY['vegetarian', 'vegan'],
    'Kept at safe temperature (>65°C) in stainless steel food pans with lids.',
    'matched',
    '739104',
    '104938',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. FoodBridge: Donation Requests
INSERT INTO donation_requests (id, donation_id, ngo_id, requester_user_id, match_score, status, request_notes)
VALUES (
  'r1111111-1111-1111-1111-111111111111',
  'd2222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  94,
  'accepted',
  'Our volunteer van is 4.2km away with insulated thermal food containers ready for rapid distribution.'
) ON CONFLICT (id) DO NOTHING;

-- 8. Platform Notifications
INSERT INTO notifications (id, user_id, title, message, type, link_url, is_read)
VALUES
  (
    'n1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'FreshTrack Reminder: Baby Spinach wilting soon!',
    'Your Baby Spinach Leaves expires tomorrow. Check our AI recipe ideas to use it up today!',
    'expiry_alert',
    '/freshtrack',
    FALSE
  ),
  (
    'n2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Donation Matched: Annadaata Foundation',
    'Annadaata Foundation accepted your donation of Catered Veg Pulao (35kg). Pickup expected within 90 minutes.',
    'donation_match',
    '/foodbridge',
    FALSE
  ),
  (
    'n3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'New Surplus Available in your area: 18.5kg Bread',
    'GreenBites Cafe posted 18.5kg of artisan bakery items within 4.5km of your center.',
    'donation_match',
    '/foodbridge',
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- 9. Audit Logs
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, ip_address)
VALUES (
  'l1111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  'ORG_VERIFIED',
  'organization',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '{"reason": "80G Certificate and FSSAI Food Safety Registration validated", "verified_by": "System Administrator"}'::jsonb,
  '127.0.0.1'
) ON CONFLICT (id) DO NOTHING;
