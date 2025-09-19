-- Performance indexes for the billing automation schema

-- Accounts table indexes
CREATE INDEX IF NOT EXISTS idx_accounts_code ON public.accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_qbo_id ON public.accounts(qbo_account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON public.accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_updated_at ON public.accounts(updated_at);

-- Vendors table indexes
CREATE INDEX IF NOT EXISTS idx_vendors_canonical_name ON public.vendors(canonical_name);
CREATE INDEX IF NOT EXISTS idx_vendors_normalized_name ON public.vendors(normalized_name);
CREATE INDEX IF NOT EXISTS idx_vendors_qbo_id ON public.vendors(qbo_vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON public.vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_type ON public.vendors(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendors_updated_at ON public.vendors(updated_at);

-- Locations table indexes
CREATE INDEX IF NOT EXISTS idx_locations_code ON public.locations(location_code);
CREATE INDEX IF NOT EXISTS idx_locations_qbo_class_id ON public.locations(qbo_class_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_default ON public.locations(is_default_location);
CREATE INDEX IF NOT EXISTS idx_locations_updated_at ON public.locations(updated_at);

-- AI processed bills table indexes
CREATE INDEX IF NOT EXISTS idx_bills_content_hash ON public.ai_processed_bills(content_hash);
CREATE INDEX IF NOT EXISTS idx_bills_vendor_name ON public.ai_processed_bills(vendor_name);
CREATE INDEX IF NOT EXISTS idx_bills_canonical_vendor ON public.ai_processed_bills(canonical_vendor_name);
CREATE INDEX IF NOT EXISTS idx_bills_bill_date ON public.ai_processed_bills(bill_date);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.ai_processed_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_processing_status ON public.ai_processed_bills(processing_status);
CREATE INDEX IF NOT EXISTS idx_bills_qbo_upload_status ON public.ai_processed_bills(qbo_upload_status);
CREATE INDEX IF NOT EXISTS idx_bills_urgency_level ON public.ai_processed_bills(urgency_level);
CREATE INDEX IF NOT EXISTS idx_bills_auto_processed ON public.ai_processed_bills(auto_processed);
CREATE INDEX IF NOT EXISTS idx_bills_requires_review ON public.ai_processed_bills(requires_manual_review);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON public.ai_processed_bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_updated_at ON public.ai_processed_bills(updated_at);

-- JSONB indexes for faster queries on embedded data
CREATE INDEX IF NOT EXISTS idx_accounts_embedding ON public.accounts USING gin(account_embedding);
CREATE INDEX IF NOT EXISTS idx_vendors_embedding ON public.vendors USING gin(vendor_embedding);
CREATE INDEX IF NOT EXISTS idx_vendors_aliases ON public.vendors USING gin(aliases);
CREATE INDEX IF NOT EXISTS idx_locations_embedding ON public.locations USING gin(location_embedding);
CREATE INDEX IF NOT EXISTS idx_locations_rules ON public.locations USING gin(vendor_assignment_rules);
CREATE INDEX IF NOT EXISTS idx_bills_ai_insights ON public.ai_processed_bills USING gin(ai_insights);
CREATE INDEX IF NOT EXISTS idx_bills_classification ON public.ai_processed_bills USING gin(classification_data);
CREATE INDEX IF NOT EXISTS idx_bills_anomaly_flags ON public.ai_processed_bills USING gin(anomaly_flags);