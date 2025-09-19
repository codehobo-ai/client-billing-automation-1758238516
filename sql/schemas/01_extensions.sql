-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- Create custom types for vector embeddings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
        -- If vector type doesn't exist, we'll handle it in the application
        RAISE NOTICE 'Vector extension not available, will use JSONB for embeddings';
    END IF;
END $$;