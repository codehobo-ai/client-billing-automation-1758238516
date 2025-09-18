#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');

const { values } = parseArgs({
  options: {
    client: { type: 'string' }
  }
});

function generateDocumentation(clientName) {
  const clientId = clientName.toLowerCase().replace(/\s+/g, '-');
  const configPath = path.join(__dirname, '..', 'data', 'clients', clientId, 'config.json');
  const billingPath = path.join(__dirname, '..', 'data', 'clients', clientId, 'billing.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Client configuration not found for ${clientName}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const billing = fs.existsSync(billingPath)
    ? JSON.parse(fs.readFileSync(billingPath, 'utf8'))
    : null;

  const docContent = generateMarkdown(config, billing);

  const docsDir = path.join(__dirname, '..', 'data', 'clients', clientId, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const docPath = path.join(docsDir, 'README.md');
  fs.writeFileSync(docPath, docContent);

  console.log(`Documentation generated for ${clientName}`);
  console.log(`Location: ${docPath}`);

  return docPath;
}

function generateMarkdown(config, billing) {
  const { client, billing: billingConfig, services, settings } = config;

  let markdown = `# ${client.name} - Client Documentation

## Overview
- **Client ID:** ${client.id}
- **Status:** ${client.status}
- **Created:** ${new Date(client.created).toLocaleDateString()}

## Billing Information
- **Type:** ${billingConfig.type}
- **Tier:** ${billingConfig.tier}
- **Start Date:** ${new Date(billingConfig.startDate).toLocaleDateString()}
- **Next Billing Date:** ${new Date(billingConfig.nextBillingDate).toLocaleDateString()}
`;

  if (billing && billing.pricing) {
    markdown += `- **Amount:** $${billing.pricing.amount} ${billing.pricing.currency}\n`;
    if (billing.pricing.discount > 0) {
      markdown += `- **Discount:** ${billing.pricing.discount * 100}%\n`;
    }
  }

  markdown += `
## Services
The following services are included in the ${billingConfig.tier} tier:
`;

  services.forEach(service => {
    markdown += `- ${service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
  });

  markdown += `
## Settings
- **Notifications:** ${settings.notifications ? 'Enabled' : 'Disabled'}
- **Auto-Renewal:** ${settings.autoRenewal ? 'Enabled' : 'Disabled'}
- **Invoice Delivery:** ${settings.invoiceDelivery}

## Quick Links
- [Client Portal](#)
- [Billing Dashboard](#)
- [Support Center](#)

## Support
For any questions or issues, please contact our support team:
- **Email:** support@company.com
- **Phone:** 1-800-XXX-XXXX
${billingConfig.tier === 'premium' || billingConfig.tier === 'enterprise' ? '- **Priority Support:** priority@company.com' : ''}

---
*This document was auto-generated on ${new Date().toLocaleDateString()}*
`;

  return markdown;
}

if (require.main === module) {
  const { client } = values;

  if (!client) {
    console.error('Error: Client name not provided');
    console.error('Usage: node generate-docs.js --client <name>');
    process.exit(1);
  }

  try {
    generateDocumentation(client);
  } catch (error) {
    console.error(`Error generating documentation: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generateDocumentation };