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

async function setupIndexes(url, serviceKey, dryRun = false) {
  try {
    console.log('📈 Setting up database indexes...');

    const supabase = createClient(url, serviceKey);

    const sqlPath = path.join(__dirname, '..', 'sql', 'indexes', 'indexes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    if (dryRun) {
      console.log('🏃‍♂️ DRY RUN - Database indexes:');
      console.log(sql);
      return true;
    }

    console.log('-- Execute the following SQL in your Supabase SQL editor:');
    console.log('-- Performance Indexes');
    console.log(sql);
    console.log('');

    console.log('✅ Index SQL prepared');
    console.log('📊 Indexes will improve query performance for:');
    console.log('   - Account lookups by code and type');
    console.log('   - Vendor searches by name and QuickBooks ID');
    console.log('   - Location filtering and assignment');
    console.log('   - Bill processing status tracking');
    console.log('   - JSONB data queries (embeddings, classifications)');

    return true;

  } catch (error) {
    console.error(`❌ Index setup failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    const { url, key, 'dry-run': dryRun } = parseCliArgs();

    if (!url || !key) {
      throw new Error('URL and service key are required');
    }

    await setupIndexes(url, key, dryRun === 'true');

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupIndexes };