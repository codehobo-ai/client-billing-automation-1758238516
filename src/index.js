#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const config = require('../config/default.json');

class ClientBillingAutomation {
  constructor() {
    this.config = config;
    this.dataDir = path.join(__dirname, '..', 'data');
    this.ensureDirectories();
  }

  ensureDirectories() {
    const directories = [
      this.dataDir,
      path.join(this.dataDir, 'clients'),
      path.join(__dirname, '..', 'templates'),
      path.join(__dirname, '..', 'logs')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async createClient(clientData) {
    const { name, billing, tier } = clientData;
    const clientId = name.toLowerCase().replace(/\s+/g, '-');

    console.log(`Creating client: ${name}`);

    try {
      // Create client configuration
      const { createClientConfig } = require('../scripts/create-client-config');
      await createClientConfig(name, billing, tier);

      // Setup billing
      const { setupBilling } = require('../scripts/setup-billing');
      await setupBilling(name, billing);

      // Generate documentation
      const { generateDocumentation } = require('../scripts/generate-docs');
      await generateDocumentation(name);

      console.log(`✅ Client ${name} created successfully`);
      return { success: true, clientId };

    } catch (error) {
      console.error(`❌ Error creating client ${name}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async listClients() {
    const clientsDir = path.join(this.dataDir, 'clients');

    if (!fs.existsSync(clientsDir)) {
      return [];
    }

    const clients = fs.readdirSync(clientsDir)
      .filter(file => fs.statSync(path.join(clientsDir, file)).isDirectory())
      .map(clientId => {
        const configPath = path.join(clientsDir, clientId, 'config.json');
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          return {
            id: clientId,
            name: config.client.name,
            tier: config.billing.tier,
            status: config.client.status,
            created: config.client.created
          };
        }
        return null;
      })
      .filter(client => client !== null);

    return clients;
  }

  async getClient(clientId) {
    const configPath = path.join(this.dataDir, 'clients', clientId, 'config.json');
    const billingPath = path.join(this.dataDir, 'clients', clientId, 'billing.json');

    if (!fs.existsSync(configPath)) {
      throw new Error(`Client ${clientId} not found`);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const billing = fs.existsSync(billingPath)
      ? JSON.parse(fs.readFileSync(billingPath, 'utf8'))
      : null;

    return { config, billing };
  }

  async validateAll() {
    const { validateSetup } = require('../scripts/validate-setup');
    return await validateSetup();
  }
}

// CLI Interface
if (require.main === module) {
  const automation = new ClientBillingAutomation();
  const args = process.argv.slice(2);

  switch (args[0]) {
    case 'create':
      if (args.length < 4) {
        console.error('Usage: node index.js create <name> <billing> <tier>');
        process.exit(1);
      }
      automation.createClient({
        name: args[1],
        billing: args[2],
        tier: args[3]
      });
      break;

    case 'list':
      automation.listClients().then(clients => {
        console.log('Clients:');
        clients.forEach(client => {
          console.log(`  - ${client.name} (${client.tier}) - ${client.status}`);
        });
      });
      break;

    case 'get':
      if (args.length < 2) {
        console.error('Usage: node index.js get <client-id>');
        process.exit(1);
      }
      automation.getClient(args[1]).then(client => {
        console.log(JSON.stringify(client, null, 2));
      }).catch(error => {
        console.error('Error:', error.message);
      });
      break;

    case 'validate':
      automation.validateAll().then(isValid => {
        process.exit(isValid ? 0 : 1);
      });
      break;

    default:
      console.log('Available commands:');
      console.log('  create <name> <billing> <tier> - Create a new client');
      console.log('  list                           - List all clients');
      console.log('  get <client-id>                - Get client details');
      console.log('  validate                       - Validate all setups');
      break;
  }
}

module.exports = ClientBillingAutomation;