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
    console.log(`📝 ${description}...`);

    // For table creation, we'll output the SQL for manual execution
    // since Supabase doesn't always allow direct DDL through the REST API
    console.log(`-- Execute the following SQL in your Supabase SQL editor:`);
    console.log(`-- ${description}`);
    console.log(sql);
    console.log('');

    console.log(`✅ ${description} SQL prepared`);
    return true;

  } catch (error) {
    console.error(`❌ ${description} failed: ${error.message}`);
    return false;
  }
}

async function setupTables(url, serviceKey, dryRun = false) {
  try {
    console.log('🏗️  Setting up database tables...');

    const supabase = createClient(url, serviceKey);

    const tableFiles = [
      '03_accounts_table.sql',
      '04_vendors_table.sql',
      '05_locations_table.sql',
      '06_ai_processed_bills_table.sql'
    ];

    for (const file of tableFiles) {
      const sqlPath = path.join(__dirname, '..', 'sql', 'schemas', file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      const description = `Create ${file.replace('_table.sql', '').replace(/^\d+_/, '')} table`;

      await executeSQL(supabase, sql, description, dryRun);
    }

    if (!dryRun) {
      console.log('📋 All table creation SQL has been prepared');
      console.log('   Please execute the SQL statements in your Supabase SQL editor');
      console.log('   Tables: accounts, vendors, locations, ai_processed_bills');
    }

    return true;

  } catch (error) {
    console.error(`❌ Table setup failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    const { url, key, 'dry-run': dryRun } = parseCliArgs();

    if (!url || !key) {
      throw new Error('URL and service key are required');
    }

    await setupTables(url, key, dryRun === 'true');

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupTables };