-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id integer NOT NULL DEFAULT nextval('vendors_id_seq'::regclass),
    vendor_name character varying NOT NULL,
    canonical_name character varying NOT NULL UNIQUE,
    normalized_name character varying NOT NULL UNIQUE,
    vendor_type character varying,
    industry character varying,
    address text,
    phone character varying,
    email character varying,
    website character varying,
    tax_id character varying,
    qbo_vendor_id character varying UNIQUE,
    qbo_vendor_ref character varying,
    is_recurring_vendor boolean DEFAULT false,
    average_bill_amount numeric,
    typical_payment_terms character varying,
    default_account_id integer,
    default_location_id integer,
    vendor_embedding jsonb,
    aliases jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sync_token character varying,
    created_time timestamp without time zone,
    last_updated_time timestamp without time zone,
    text_corpus text,
    processed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    balance numeric DEFAULT 0,
    acct_num character varying,
    -- Use JSONB for now, will be converted to vector if extension is available
    vendor_embedding_vector jsonb,
    CONSTRAINT vendors_pkey PRIMARY KEY (id)
);

-- Add table comment
COMMENT ON TABLE public.vendors IS 'Vendor information and management for bill processing';