-- FoodLoop AI Migration 002: Row Level Security (RLS) Policies
-- Author: FoodLoop AI Engineering Team
-- License: MIT

-- Enable RLS on all primary entities
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergen_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_label_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION auth_user_role() 
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id OR auth_user_role() = 'admin');

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Organizations Policies
CREATE POLICY "Public can view verified organizations" 
    ON organizations FOR SELECT 
    USING (verification_status = 'verified' OR user_id = auth.uid() OR auth_user_role() = 'admin');

CREATE POLICY "Owners can manage organization" 
    ON organizations FOR ALL 
    USING (user_id = auth.uid() OR auth_user_role() = 'admin');

-- 3. FreshTrack Inventory Policies
CREATE POLICY "Users can view own inventory items" 
    ON inventory_items FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own inventory items" 
    ON inventory_items FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own inventory items" 
    ON inventory_items FOR UPDATE 
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own inventory items" 
    ON inventory_items FOR DELETE 
    USING (user_id = auth.uid());

-- 4. Allergen Preferences Policies
CREATE POLICY "Users manage own allergen preferences" 
    ON allergen_preferences FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. FoodLabel AI Scans Policies
CREATE POLICY "Users can view own scan history" 
    ON food_label_scans FOR SELECT 
    USING (user_id = auth.uid() OR user_id IS NULL OR auth_user_role() = 'admin');

CREATE POLICY "Users can insert scans" 
    ON food_label_scans FOR INSERT 
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 6. FoodBridge Donations Policies
CREATE POLICY "Anyone can view available or matched donations" 
    ON donations FOR SELECT 
    USING (status IN ('available', 'matched', 'in_transit', 'delivered') OR donor_id = auth.uid() OR auth_user_role() = 'admin');

CREATE POLICY "Donors can create donations" 
    ON donations FOR INSERT 
    WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Donors and Admins can update donations" 
    ON donations FOR UPDATE 
    USING (donor_id = auth.uid() OR auth_user_role() = 'admin');

-- 7. Donation Requests Policies
CREATE POLICY "NGOs can view requests for their org" 
    ON donation_requests FOR SELECT 
    USING (requester_user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM donations d WHERE d.id = donation_id AND d.donor_id = auth.uid()
    ) OR auth_user_role() = 'admin');

CREATE POLICY "NGOs can submit requests" 
    ON donation_requests FOR INSERT 
    WITH CHECK (requester_user_id = auth.uid());

-- 8. Notifications Policies
CREATE POLICY "Users can view and manage their own notifications" 
    ON notifications FOR ALL 
    USING (user_id = auth.uid());

-- 9. Delivery Confirmations Policies
CREATE POLICY "Participants can view delivery confirmations" 
    ON delivery_confirmations FOR SELECT 
    USING (
        EXISTS (SELECT 1 FROM donations d WHERE d.id = donation_id AND d.donor_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM organizations o WHERE o.id = ngo_id AND o.user_id = auth.uid()) OR
        auth_user_role() = 'admin'
    );

-- 10. Audit Logs Policies (Admin exclusive)
CREATE POLICY "Admins can view audit logs" 
    ON audit_logs FOR SELECT 
    USING (auth_user_role() = 'admin');
