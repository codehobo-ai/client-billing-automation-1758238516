# Supabase Schema Setup Automation

This workflow automatically sets up the billing automation database schema in a client's Supabase project.

## Features

- **Automated Schema Deployment**: Creates all necessary tables, indexes, and constraints
- **Vector Extension Support**: Configures pgvector for AI embeddings
- **Dry Run Mode**: Test the setup without making changes
- **Comprehensive Validation**: Verifies inputs and connection before deployment
- **Setup Reports**: Generates detailed documentation of the deployment

## Schema Components

### Tables
- **accounts** - Chart of accounts for expense categorization
- **vendors** - Vendor information and management
- **locations** - Location/class management for expense allocation
- **ai_processed_bills** - AI-processed bill data with extraction results

### Features
- QuickBooks Online integration fields
- Vector embeddings for AI similarity search
- JSON storage for flexible metadata
- Comprehensive indexing for performance
- Foreign key relationships for data integrity

## Usage

### 1. GitHub Actions Workflow

Navigate to Actions → "Supabase Schema Setup" and provide:

- **Client Name**: Reference name for the setup
- **Supabase URL**: Your project URL (e.g., `https://your-project.supabase.co`)
- **Service Key**: Supabase service role key
- **Database Password**: Database password
- **Setup Vector Extension**: Enable pgvector (recommended)
- **Dry Run**: Test mode without making changes

### 2. Manual Script Execution

```bash
# Install dependencies
npm install

# Test connection
node scripts/test-supabase-connection.js --url "https://your-project.supabase.co" --key "your-service-key"

# Run setup (dry run first)
node scripts/validate-supabase-inputs.js --client "Client Name" --url "https://your-project.supabase.co" --dry-run true

# Execute setup scripts
node scripts/setup-vector-extension.js --url "https://your-project.supabase.co" --key "your-service-key"
node scripts/setup-sequences.js --url "https://your-project.supabase.co" --key "your-service-key"
node scripts/setup-tables.js --url "https://your-project.supabase.co" --key "your-service-key"
node scripts/setup-constraints.js --url "https://your-project.supabase.co" --key "your-service-key"
node scripts/setup-indexes.js --url "https://your-project.supabase.co" --key "your-service-key"

# Verify setup
node scripts/verify-schema.js --url "https://your-project.supabase.co" --key "your-service-key"
```

## Prerequisites

### Supabase Project Requirements
1. **Active Supabase Project** with database access
2. **Service Role Key** with full database permissions
3. **pgvector Extension** available (enable in Dashboard → Database → Extensions)

### Required Information
- Supabase project URL
- Service role key (not anon key)
- Database password
- Client name for reference

## Security Notes

- **Service keys are sensitive** - never commit them to code
- Use GitHub Secrets for storing credentials
- Service keys have full database access
- All SQL execution is logged for audit purposes

## Manual Steps Required

The automation prepares SQL statements that need to be executed manually in the Supabase SQL editor:

1. **Enable pgvector extension** in Dashboard → Database → Extensions
2. **Execute generated SQL** in the SQL editor (statements are outputted by the scripts)
3. **Verify table creation** using the verification script

## Troubleshooting

### Connection Issues
- Verify Supabase URL format
- Check service key permissions
- Ensure project is not paused

### SQL Execution
- Some operations require manual execution in Supabase SQL editor
- Check for syntax errors in generated SQL
- Verify sufficient permissions

### Schema Verification
- Tables may take a few minutes to appear in API
- Use Supabase dashboard to verify table creation
- Check for constraint violations

## Example URLs

- **Supabase URL**: `https://abcdefghijklmnop.supabase.co`
- **Dashboard**: `https://supabase.com/dashboard/project/abcdefghijklmnop`

## Support

For issues with the Supabase setup:
1. Check the generated setup report
2. Verify all SQL was executed in Supabase
3. Use the verification script to test schema
4. Check Supabase dashboard for any errors

## Schema Files

- `sql/schemas/` - Table and constraint definitions
- `sql/indexes/` - Performance indexes
- `scripts/` - Setup and validation scripts
- `reports/` - Generated setup documentation