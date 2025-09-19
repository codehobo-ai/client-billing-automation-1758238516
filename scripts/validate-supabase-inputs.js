#!/usr/bin/env node

const { URL } = require('url');

function parseCliArgs() {
  const args = process.argv.slice(2);
  const values = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    values[key] = value;
  }

  return values;
}

function validateSupabaseUrl(url) {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      throw new Error('Supabase URL must use HTTPS');
    }

    if (!parsed.hostname.includes('supabase.co') && !parsed.hostname.includes('supabase.')) {
      console.warn('Warning: URL does not appear to be a standard Supabase URL');
    }

    // Extract project ID from URL
    const projectId = parsed.hostname.split('.')[0];

    return {
      isValid: true,
      host: parsed.hostname,
      projectId: projectId
    };
  } catch (error) {
    throw new Error(`Invalid Supabase URL: ${error.message}`);
  }
}

function validateClientName(name) {
  if (!name || name.trim().length === 0) {
    throw new Error('Client name is required');
  }

  if (name.length > 100) {
    throw new Error('Client name must be 100 characters or less');
  }

  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    throw new Error('Client name contains invalid characters');
  }

  return true;
}

function main() {
  try {
    const { client, url, 'dry-run': dryRun } = parseCliArgs();

    console.log('🔍 Validating Supabase setup inputs...');

    // Validate client name
    validateClientName(client);
    console.log(`✅ Client name validated: ${client}`);

    // Validate Supabase URL
    const urlValidation = validateSupabaseUrl(url);
    console.log(`✅ Supabase URL validated: ${url}`);
    console.log(`📍 Project ID: ${urlValidation.projectId}`);
    console.log(`🏠 Host: ${urlValidation.host}`);

    // Set GitHub outputs
    console.log(`::set-output name=supabase_host::${urlValidation.host}`);
    console.log(`::set-output name=project_id::${urlValidation.projectId}`);

    if (dryRun === 'true') {
      console.log('🏃‍♂️ Dry run mode enabled - no actual changes will be made');
    }

    console.log('✅ All inputs validated successfully');

  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateSupabaseUrl, validateClientName };