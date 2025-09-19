#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

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

async function testConnection(url, serviceKey) {
  try {
    console.log('🔗 Testing Supabase connection...');

    const supabase = createClient(url, serviceKey);

    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }

    console.log('✅ Supabase connection successful');

    // Test if we can access the public schema
    const { data: schemaTest, error: schemaError } = await supabase
      .rpc('current_schema');

    if (schemaError && !schemaError.message.includes('function "current_schema"')) {
      console.warn('⚠️  Warning: Limited schema access detected');
    }

    return true;

  } catch (error) {
    throw new Error(`Failed to connect to Supabase: ${error.message}`);
  }
}

async function main() {
  try {
    const { url, key } = parseCliArgs();

    if (!url || !key) {
      throw new Error('URL and service key are required');
    }

    await testConnection(url, key);
    console.log('🎉 Connection validation completed successfully');

  } catch (error) {
    console.error(`❌ Connection test failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testConnection };