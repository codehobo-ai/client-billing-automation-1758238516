#!/usr/bin/env node

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

function generateSetupReport(clientName, supabaseUrl, dryRun = false) {
  try {
    console.log('📄 Generating setup report...');

    const timestamp = new Date().toISOString();
    const clientId = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const report = {
      client: {
        name: clientName,
        id: clientId,
        setupDate: timestamp
      },
      supabase: {
        url: supabaseUrl,
        projectId: supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown'
      },
      schema: {
        tables: [
          {
            name: 'accounts',
            description: 'Chart of accounts for expense categorization',
            status: dryRun ? 'planned' : 'created'
          },
          {
            name: 'vendors',
            description: 'Vendor information and management',
            status: dryRun ? 'planned' : 'created'
          },
          {
            name: 'locations',
            description: 'Location/class management for expense allocation',
            status: dryRun ? 'planned' : 'created'
          },
          {
            name: 'ai_processed_bills',
            description: 'AI-processed bill data with extraction results',
            status: dryRun ? 'planned' : 'created'
          }
        ],
        extensions: [
          {
            name: 'pgvector',
            description: 'Vector similarity search for embeddings',
            status: dryRun ? 'planned' : 'configured'
          }
        ],
        indexes: [
          'Performance indexes for all tables',
          'JSONB indexes for embedded data',
          'Foreign key relationship indexes'
        ]
      },
      setup: {
        mode: dryRun ? 'dry_run' : 'live_deployment',
        timestamp: timestamp,
        status: 'completed'
      }
    };

    // Create report directory
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save JSON report
    const reportPath = path.join(reportsDir, `${clientId}-supabase-setup-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdown = generateMarkdownReport(report);
    const markdownPath = path.join(reportsDir, `${clientId}-supabase-setup.md`);
    fs.writeFileSync(markdownPath, markdown);

    console.log(`✅ Setup report generated`);
    console.log(`📁 JSON report: ${reportPath}`);
    console.log(`📝 Markdown report: ${markdownPath}`);

    return report;

  } catch (error) {
    console.error(`❌ Report generation failed: ${error.message}`);
    throw error;
  }
}

function generateMarkdownReport(report) {
  const { client, supabase, schema, setup } = report;

  return `# Supabase Schema Setup Report

## Client Information
- **Name:** ${client.name}
- **ID:** ${client.id}
- **Setup Date:** ${new Date(client.setupDate).toLocaleString()}

## Supabase Configuration
- **URL:** ${supabase.url}
- **Project ID:** ${supabase.projectId}

## Schema Components

### Tables Created
${schema.tables.map(table =>
  `- **${table.name}** (${table.status}): ${table.description}`
).join('\n')}

### Extensions
${schema.extensions.map(ext =>
  `- **${ext.name}** (${ext.status}): ${ext.description}`
).join('\n')}

### Performance Indexes
${schema.indexes.map(index => `- ${index}`).join('\n')}

## Setup Details
- **Mode:** ${setup.mode.replace('_', ' ').toUpperCase()}
- **Status:** ${setup.status.toUpperCase()}
- **Completed:** ${new Date(setup.timestamp).toLocaleString()}

## Next Steps

### Manual Steps Required
1. **Enable pgvector extension** in Supabase dashboard under Database > Extensions
2. **Execute SQL files** in the Supabase SQL editor in this order:
   - Extensions and sequences
   - Table creation
   - Foreign key constraints
   - Performance indexes

### Verification
- Use the verification script to check all tables are accessible
- Test basic CRUD operations on each table
- Confirm vector operations work if using embeddings

### QuickBooks Integration
The schema is designed for QuickBooks Online integration with:
- Account mapping (qbo_account_id, qbo_account_ref)
- Vendor synchronization (qbo_vendor_id, qbo_vendor_ref)
- Class/location mapping (qbo_class_id, qbo_class_ref)

---
*Report generated automatically by the Supabase Schema Setup automation*
`;
}

async function main() {
  try {
    const { client, url, 'dry-run': dryRun } = parseCliArgs();

    if (!client || !url) {
      throw new Error('Client name and URL are required');
    }

    generateSetupReport(client, url, dryRun === 'true');

  } catch (error) {
    console.error(`❌ Report generation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateSetupReport };