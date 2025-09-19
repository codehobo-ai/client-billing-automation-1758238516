-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id integer NOT NULL DEFAULT nextval('accounts_id_seq'::regclass),
    account_code character varying UNIQUE,
    account_name character varying NOT NULL,
    account_type character varying NOT NULL,
    account_subtype character varying,
    qbo_account_id character varying UNIQUE,
    qbo_account_ref character varying,
    category character varying,
    subcategory character varying,
    is_expense_account boolean DEFAULT true,
    account_embedding jsonb,
    keywords jsonb,
    typical_descriptions jsonb,
    requires_approval_over_amount numeric,
    default_tax_code character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    classification character varying,
    is_sub_account boolean DEFAULT false,
    parent_ref character varying,
    fully_qualified_name character varying,
    current_balance numeric DEFAULT 0,
    currency character varying DEFAULT 'USD'::character varying,
    tax_code_ref character varying,
    sync_token character varying,
    created_time timestamp without time zone,
    last_updated_time timestamp without time zone,
    processed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    text_corpus text,
    -- Use JSONB for now, will be converted to vector if extension is available
    account_embedding_vector jsonb,
    CONSTRAINT accounts_pkey PRIMARY KEY (id)
);

-- Add table comment
COMMENT ON TABLE public.accounts IS 'Chart of accounts for expense categorization and QuickBooks integration';