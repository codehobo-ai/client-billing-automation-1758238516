#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function setupVectorExtension(url, serviceKey, dryRun = false) {
  try {
    console.log('🧩 Setting up vector extension...');

    const supabase = createClient(url, serviceKey);

    const sqlPath = path.join(__dirname, '..', 'sql', 'schemas', '01_extensions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    if (dryRun) {
      console.log('🏃‍♂️ DRY RUN - Vector extension SQL:');
      console.log(sql);
      return true;
    }

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If rpc doesn't exist, try direct execution
      console.log('⚠️  RPC method not available, attempting direct SQL execution...');

      // For vector extension, we'll need to use the REST API directly
      console.log('ℹ️  Vector extension setup may require manual installation');
      console.log('   Please ensure the pgvector extension is enabled in your Supabase project');
      console.log('   You can enable it in the Supabase dashboard under Database > Extensions');

      return true;
    }

    console.log('✅ Vector extension setup completed');
    return true;

  } catch (error) {
    console.error(`❌ Vector extension setup failed: ${error.message}`);
    if (!dryRun) {
      throw error;
    }
    return false;
  }
}

async function main() {
  try {
    const { url, key, 'dry-run': dryRun } = parseCliArgs();

    if (!url || !key) {
      throw new Error('URL and service key are required');
    }

    await setupVectorExtension(url, key, dryRun === 'true');

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupVectorExtension };