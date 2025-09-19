-- Add foreign key constraints
DO $$
BEGIN
    -- Add foreign key from vendors to accounts (default_account_id)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'vendors_default_account_id_fkey'
    ) THEN
        ALTER TABLE public.vendors
        ADD CONSTRAINT vendors_default_account_id_fkey
        FOREIGN KEY (default_account_id) REFERENCES public.accounts(id);
    END IF;

    -- Add foreign key from vendors to locations (default_location_id)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'vendors_default_location_id_fkey'
    ) THEN
        ALTER TABLE public.vendors
        ADD CONSTRAINT vendors_default_location_id_fkey
        FOREIGN KEY (default_location_id) REFERENCES public.locations(id);
    END IF;

END $$;