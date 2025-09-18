#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');

const { values } = parseArgs({
  options: {
    client: { type: 'string' },
    type: { type: 'string' }
  }
});

function setupBilling(clientName, billingType) {
  const clientId = clientName.toLowerCase().replace(/\s+/g, '-');
  const configPath = path.join(__dirname, '..', 'data', 'clients', clientId, 'config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Client configuration not found for ${clientName}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const billingInfo = {
    clientId: clientId,
    clientName: clientName,
    billingType: billingType,
    pricing: getPricing(config.billing.tier, billingType),
    paymentMethods: [],
    invoices: [],
    subscriptions: [
      {
        id: generateSubscriptionId(),
        startDate: new Date().toISOString(),
        status: 'active',
        tier: config.billing.tier,
        services: config.services
      }
    ]
  };

  const billingPath = path.join(__dirname, '..', 'data', 'clients', clientId, 'billing.json');
  fs.writeFileSync(billingPath, JSON.stringify(billingInfo, null, 2));

  console.log(`Billing system setup completed for ${clientName}`);
  console.log(`- Billing Type: ${billingType}`);
  console.log(`- Tier: ${config.billing.tier}`);
  console.log(`- Amount: $${billingInfo.pricing.amount}`);

  return billingInfo;
}

function getPricing(tier, billingType) {
  const basePricing = {
    basic: { monthly: 49, quarterly: 140, annual: 500 },
    standard: { monthly: 99, quarterly: 280, annual: 1000 },
    premium: { monthly: 199, quarterly: 560, annual: 2000 },
    enterprise: { monthly: 499, quarterly: 1400, annual: 5000 }
  };

  return {
    amount: basePricing[tier][billingType],
    currency: 'USD',
    discount: billingType === 'annual' ? 0.15 : billingType === 'quarterly' ? 0.05 : 0
  };
}

function generateSubscriptionId() {
  return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

if (require.main === module) {
  const { client, type } = values;

  if (!client || !type) {
    console.error('Error: Missing required arguments');
    console.error('Usage: node setup-billing.js --client <name> --type <billing_type>');
    process.exit(1);
  }

  try {
    setupBilling(client, type);
  } catch (error) {
    console.error(`Error setting up billing: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { setupBilling };