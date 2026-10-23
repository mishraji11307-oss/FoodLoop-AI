-- FoodLoop AI Migration 003: Indexes and Auto-Update Triggers
-- Author: FoodLoop AI Engineering Team
-- License: MIT

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON organizations;
CREATE TRIGGER trigger_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_inventory_updated_at ON inventory_items;
CREATE TRIGGER trigger_inventory_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_donations_updated_at ON donations;
CREATE TRIGGER trigger_donations_updated_at
BEFORE UPDATE ON donations
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_donation_requests_updated_at ON donation_requests;
CREATE TRIGGER trigger_donation_requests_updated_at
BEFORE UPDATE ON donation_requests
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_status ON inventory_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry_date ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_food_label_user ON food_label_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_coords ON donations(pickup_latitude, pickup_longitude);
CREATE INDEX IF NOT EXISTS idx_donations_expiry ON donations(expiry_time);
CREATE INDEX IF NOT EXISTS idx_org_coords ON organizations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_donation ON donation_status_history(donation_id, created_at DESC);
