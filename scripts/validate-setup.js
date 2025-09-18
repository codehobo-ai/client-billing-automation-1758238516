#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateSetup() {
  const dataDir = path.join(__dirname, '..', 'data', 'clients');
  let validationErrors = [];
  let validationWarnings = [];

  if (!fs.existsSync(dataDir)) {
    console.log('No client data directory found. This might be a fresh installation.');
    return true;
  }

  const clients = fs.readdirSync(dataDir).filter(file => {
    return fs.statSync(path.join(dataDir, file)).isDirectory();
  });

  console.log(`Validating ${clients.length} client(s)...`);

  clients.forEach(clientId => {
    const clientDir = path.join(dataDir, clientId);
    const configPath = path.join(clientDir, 'config.json');
    const billingPath = path.join(clientDir, 'billing.json');

    if (!fs.existsSync(configPath)) {
      validationErrors.push(`Missing config.json for client: ${clientId}`);
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!config.client || !config.client.name) {
        validationErrors.push(`Invalid client name in config for: ${clientId}`);
      }

      if (!config.billing || !config.billing.type) {
        validationErrors.push(`Missing billing type for client: ${clientId}`);
      }

      if (!config.services || config.services.length === 0) {
        validationWarnings.push(`No services configured for client: ${clientId}`);
      }

      if (fs.existsSync(billingPath)) {
        const billing = JSON.parse(fs.readFileSync(billingPath, 'utf8'));

        if (!billing.subscriptions || billing.subscriptions.length === 0) {
          validationWarnings.push(`No active subscriptions for client: ${clientId}`);
        }
      } else {
        validationWarnings.push(`No billing.json found for client: ${clientId}`);
      }

      console.log(`✓ ${config.client.name} validated successfully`);

    } catch (error) {
      validationErrors.push(`Failed to parse configuration for ${clientId}: ${error.message}`);
    }
  });

  if (validationErrors.length > 0) {
    console.error('\n❌ Validation Errors:');
    validationErrors.forEach(error => console.error(`  - ${error}`));
  }

  if (validationWarnings.length > 0) {
    console.warn('\n⚠️  Validation Warnings:');
    validationWarnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (validationErrors.length === 0) {
    console.log('\n✅ All validations passed!');
    return true;
  }

  return false;
}

if (require.main === module) {
  const isValid = validateSetup();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateSetup };