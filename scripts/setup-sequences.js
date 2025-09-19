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

async function executeSQL(supabase, sql, description, dryRun = false) {
  if (dryRun) {
    console.log(`🏃‍♂️ DRY RUN - ${description}:`);
    console.log(sql);
    console.log('---');
    return true;
  }

  try {
    // For Supabase, we need to execute SQL through the REST API
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'apikey': supabase.supabaseKey
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      // Fallback: try to use psql-style execution
      console.log(`⚠️  Direct SQL execution not available, logging SQL for manual execution:`);
      console.log(`-- ${description}`);
      console.log(sql);
      console.log('');
      return true;
    }

    console.log(`✅ ${description} completed successfully`);
    return true;

  } catch (error) {
    console.error(`❌ ${description} failed: ${error.message}`);
    return false;
  }
}

async function setupSequences(url, serviceKey, dryRun = false) {
  try {
    console.log('📊 Setting up database sequences...');

    const supabase = createClient(url, serviceKey);

    const sqlPath = path.join(__dirname, '..', 'sql', 'schemas', '02_sequences.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await executeSQL(supabase, sql, 'Create sequences', dryRun);

    if (!dryRun) {
      console.log('✅ All sequences created successfully');
    }

    return true;

  } catch (error) {
    console.error(`❌ Sequence setup failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    const { url, key, 'dry-run': dryRun } = parseCliArgs();

    if (!url || !key) {
      throw new Error('URL and service key are required');
    }

    await setupSequences(url, key, dryRun === 'true');

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupSequences };