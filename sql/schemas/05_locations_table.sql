-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id integer NOT NULL DEFAULT nextval('locations_id_seq'::regclass),
    location_code character varying UNIQUE,
    location_name character varying NOT NULL,
    location_type character varying,
    qbo_class_id character varying UNIQUE,
    qbo_class_ref character varying,
    address text,
    manager_name character varying,
    cost_center character varying,
    is_default_location boolean DEFAULT false,
    handles_high_value_bills boolean DEFAULT false,
    vendor_assignment_rules jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fully_qualified_name character varying,
    parent_ref character varying,
    is_sub_class boolean DEFAULT false,
    sync_token character varying,
    created_time timestamp without time zone,
    last_updated_time timestamp without time zone,
    text_corpus text,
    location_embedding jsonb,
    processed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    -- Use JSONB for now, will be converted to vector if extension is available
    location_embedding_vector jsonb,
    CONSTRAINT locations_pkey PRIMARY KEY (id)
);

-- Add table comment
COMMENT ON TABLE public.locations IS 'Location/class management for expense allocation';