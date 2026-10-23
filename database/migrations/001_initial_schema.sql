-- FoodLoop AI Migration 001: Initial Schema
-- Author: FoodLoop AI Engineering Team
-- License: MIT

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & Role Management
CREATE TYPE user_role AS ENUM ('household', 'donor', 'ngo', 'admin');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'household',
    avatar_url TEXT,
    phone VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Organizations (for Donors and NGOs)
CREATE TYPE org_verification_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    org_type user_role NOT NULL CHECK (org_type IN ('donor', 'ngo')),
    registration_number VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    verification_status org_verification_status NOT NULL DEFAULT 'pending',
    daily_capacity_kg DECIMAL(10, 2) DEFAULT 100.0,
    accepted_food_types TEXT[] DEFAULT ARRAY['packaged', 'cooked', 'raw', 'bakery'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FreshTrack: Household Food Inventory
CREATE TYPE date_label_type AS ENUM ('best_before', 'use_by', 'expiry');
CREATE TYPE inventory_status AS ENUM ('fresh', 'expiring_soon', 'expired', 'consumed', 'wasted');
CREATE TYPE storage_location AS ENUM ('fridge', 'pantry', 'freezer');

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
    unit VARCHAR(50) NOT NULL DEFAULT 'units',
    storage storage_location NOT NULL DEFAULT 'fridge',
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    date_label date_label_type NOT NULL DEFAULT 'expiry',
    safety_guidance TEXT,
    status inventory_status NOT NULL DEFAULT 'fresh',
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    opened_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. User Allergen and Dietary Preferences
CREATE TABLE IF NOT EXISTS allergen_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    dietary_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    strictness_level VARCHAR(50) DEFAULT 'warning',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. FoodLabel AI: Scan History and OCR Extractions
CREATE TABLE IF NOT EXISTS food_label_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    image_url TEXT,
    extracted_text TEXT NOT NULL,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    nutrition_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
    detected_allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    health_score INT CHECK (health_score BETWEEN 0 AND 100),
    nutri_grade CHAR(1) CHECK (nutri_grade IN ('A', 'B', 'C', 'D', 'E')),
    explanation_en TEXT NOT NULL,
    explanation_hi TEXT NOT NULL,
    preservatives_additives TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FoodBridge: Surplus Food Donations
CREATE TYPE donation_status AS ENUM (
    'available',
    'requested',
    'matched',
    'in_transit',
    'delivered',
    'cancelled',
    'expired'
);

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    donor_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    food_category VARCHAR(100) NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    servings_estimate INT NOT NULL,
    perishable BOOLEAN NOT NULL DEFAULT TRUE,
    prepared_at TIMESTAMPTZ,
    expiry_time TIMESTAMPTZ NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 7) NOT NULL,
    pickup_longitude DECIMAL(10, 7) NOT NULL,
    pickup_window_start TIMESTAMPTZ NOT NULL,
    pickup_window_end TIMESTAMPTZ NOT NULL,
    dietary_attributes TEXT[] DEFAULT ARRAY['vegetarian']::TEXT[],
    packaging_notes TEXT,
    status donation_status NOT NULL DEFAULT 'available',
    pickup_otp VARCHAR(6),
    delivery_otp VARCHAR(6),
    assigned_ngo_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FoodBridge: Donation Requests
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE IF NOT EXISTS donation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    ngo_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requester_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_score INT NOT NULL DEFAULT 50,
    status request_status NOT NULL DEFAULT 'pending',
    request_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(donation_id, ngo_id)
);

-- 8. FoodBridge: Status History Audit
CREATE TABLE IF NOT EXISTS donation_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    previous_status donation_status,
    new_status donation_status NOT NULL,
    changed_by_user_id UUID NOT NULL REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. FoodBridge: Delivery & Pickup Confirmations
CREATE TABLE IF NOT EXISTS delivery_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    ngo_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pickup_timestamp TIMESTAMPTZ,
    pickup_verified_by UUID REFERENCES profiles(id),
    delivery_timestamp TIMESTAMPTZ,
    delivery_verified_by UUID REFERENCES profiles(id),
    beneficiaries_served INT DEFAULT 0,
    confirmation_photo_url TEXT,
    temperature_at_pickup DECIMAL(4, 1),
    handover_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Platform Notifications
CREATE TYPE notification_type AS ENUM (
    'expiry_alert',
    'donation_match',
    'request_accepted',
    'pickup_ready',
    'delivery_completed',
    'system_announcement'
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Moderation & Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
