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

async function verifyTable(supabase, tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    if (error) {
      console.log(`❌ Table '${tableName}' verification failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Table '${tableName}' exists and is accessible`);
    return true;
  } catch (error) {
    console.log(`❌ Table '${tableName}' verification error: ${error.message}`);
    return false;
  }
}

async function verifySchema(url, serviceKey) {
  try {
    console.log('🔍 Verifying schema setup...');

    const supabase = createClient(url, serviceKey);

    const expectedTables = [
      'accounts',
      'vendors',
      'locations',
      'ai_processed_bills'
    ];

    let allTablesExist = true;

    for (const table of expectedTables) {
      const exists = await verifyTable(supabase, table);
      if (!exists) {
        allTablesExist = false;
      }
    }

    // Check for sequences
    console.log('🔢 Checking sequences...');
    try {
      const { data: sequences, error: seqError } = await supabase
        .rpc('get_sequences_info');

      if (seqError) {
        console.log('ℹ️  Sequence verification not available through API');
      } else {
        console.log('✅ Sequences verified');
      }
    } catch (error) {
      console.log('ℹ️  Sequence verification skipped (not critical)');
    }

    if (allTablesExist) {
      console.log('🎉 Schema verification completed successfully');
      console.log('📋 All core tables are present and accessible');
      return true;
    } else {
      console.log('⚠️  Some tables may not be properly created');
      console.log('   Please check the Supabase dashboard and ensure all SQL was executed');
      return false;
    }

  } catch (error) {
    console.error(`❌ Schema verification failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    const { url, key } = parseCliArgs();

    if (!url || !key) {
      throw new Error('URL and service key are required');
    }

    const isValid = await verifySchema(url, key);

    if (!isValid) {
      process.exit(1);
    }

  } catch (error) {
    console.error(`❌ Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifySchema };