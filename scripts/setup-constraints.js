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

async function setupConstraints(url, serviceKey, dryRun = false) {
  try {
    console.log('🔗 Setting up foreign key constraints...');

    const supabase = createClient(url, serviceKey);

    const sqlPath = path.join(__dirname, '..', 'sql', 'schemas', '07_constraints.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    if (dryRun) {
      console.log('🏃‍♂️ DRY RUN - Foreign key constraints:');
      console.log(sql);
      return true;
    }

    console.log('-- Execute the following SQL in your Supabase SQL editor:');
    console.log('-- Foreign Key Constraints');
    console.log(sql);
    console.log('');

    console.log('✅ Constraint SQL prepared');
    return true;

  } catch (error) {
    console.error(`❌ Constraint setup failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    const { url, key, 'dry-run': dryRun } = parseCliArgs();

    if (!url || !key) {
      throw new Error('URL and service key are required');
    }

    await setupConstraints(url, key, dryRun === 'true');

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupConstraints };