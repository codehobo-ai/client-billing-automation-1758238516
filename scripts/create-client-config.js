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

function createClientConfig(name, billing, tier) {
  const config = {
    client: {
      name: name,
      id: name.toLowerCase().replace(/\s+/g, '-'),
      created: new Date().toISOString(),
      status: 'active'
    },
    billing: {
      type: billing,
      tier: tier,
      startDate: new Date().toISOString(),
      nextBillingDate: calculateNextBillingDate(billing)
    },
    services: getServicesForTier(tier),
    contacts: [],
    settings: {
      notifications: true,
      autoRenewal: true,
      invoiceDelivery: 'email'
    }
  };

  const clientDir = path.join(__dirname, '..', 'data', 'clients', config.client.id);

  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(clientDir, 'config.json'),
    JSON.stringify(config, null, 2)
  );

  console.log(`Client configuration created for ${name}`);
  return config;
}

function calculateNextBillingDate(billingType) {
  const now = new Date();
  switch (billingType) {
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      now.setMonth(now.getMonth() + 3);
      break;
    case 'annual':
      now.setFullYear(now.getFullYear() + 1);
      break;
  }
  return now.toISOString();
}

function getServicesForTier(tier) {
  const tierServices = {
    basic: ['email_support', 'basic_reporting'],
    standard: ['email_support', 'phone_support', 'advanced_reporting', 'api_access'],
    premium: ['priority_support', 'custom_reporting', 'api_access', 'dedicated_account_manager'],
    enterprise: ['24x7_support', 'custom_features', 'sla_guarantee', 'dedicated_team']
  };

  return tierServices[tier] || tierServices.basic;
}

if (require.main === module) {
  const values = parseCliArgs();
  const { name, billing, tier } = values;

  if (!name || !billing || !tier) {
    console.error('Error: Missing required arguments');
    console.error('Usage: node create-client-config.js --name <name> --billing <type> --tier <tier>');
    process.exit(1);
  }

  createClientConfig(name, billing, tier);
}

module.exports = { createClientConfig };