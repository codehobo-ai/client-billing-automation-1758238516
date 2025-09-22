#!/usr/bin/env node

/**
 * n8n Workflow Deployment Script
 * Imports and configures n8n workflows with proper credential mapping
 */

const axios = require('axios');
const fs = require('fs');

class N8NWorkflowDeployer {
  constructor(n8nUrl, apiKey) {
    this.n8nUrl = n8nUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.headers = {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    };
    this.deployedWorkflows = [];
  }

  /**
   * Deploy workflow from JSON file
   */
  async deployWorkflow(workflowPath, options = {}) {
    console.log(`🚀 Deploying workflow from: ${workflowPath}`);

    try {
      // Load workflow JSON
      const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

      // Update workflow metadata
      workflowData.name = options.name || workflowData.name || 'Imported Workflow';
      workflowData.active = options.activate || false;

      // Update credentials if mapping provided
      if (options.credentialMapping) {
        workflowData = this.mapCredentials(workflowData, options.credentialMapping);
      }

      // Update webhook URLs if needed
      if (options.webhookBaseUrl) {
        workflowData = this.updateWebhookUrls(workflowData, options.webhookBaseUrl);
      }

      // Update Airtable base IDs if provided
      if (options.airtableBaseId) {
        workflowData = this.updateAirtableBaseId(workflowData, options.airtableBaseId);
      }

      // Create workflow via API
      const response = await axios.post(
        `${this.n8nUrl}/api/v1/workflows`,
        workflowData,
        { headers: this.headers }
      );

      const deployedWorkflow = response.data;
      this.deployedWorkflows.push({
        id: deployedWorkflow.id,
        name: deployedWorkflow.name,
        webhookUrl: this.extractWebhookUrl(deployedWorkflow)
      });

      console.log(`✅ Workflow deployed: ${deployedWorkflow.name} (ID: ${deployedWorkflow.id})`);

      // Activate workflow if requested
      if (options.activate) {
        await this.activateWorkflow(deployedWorkflow.id);
      }

      return deployedWorkflow;

    } catch (error) {
      console.error('❌ Workflow deployment failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Map credentials in workflow nodes
   */
  mapCredentials(workflowData, credentialMapping) {
    console.log('🔐 Mapping credentials...');

    workflowData.nodes = workflowData.nodes.map(node => {
      // Check if node has credentials
      if (node.credentials) {
        Object.keys(node.credentials).forEach(credType => {
          const oldCredId = node.credentials[credType].id;
          const newCredId = credentialMapping[oldCredId] || credentialMapping[credType];

          if (newCredId) {
            console.log(`  Mapping ${credType}: ${oldCredId} → ${newCredId}`);
            node.credentials[credType] = {
              id: newCredId,
              name: node.credentials[credType].name
            };
          }
        });
      }

      // Handle OAuth2 and other authentication in parameters
      if (node.parameters?.authentication) {
        const authType = node.parameters.authentication;
        if (credentialMapping[authType]) {
          node.parameters.authentication = credentialMapping[authType];
        }
      }

      return node;
    });

    return workflowData;
  }

  /**
   * Update webhook URLs in workflow
   */
  updateWebhookUrls(workflowData, webhookBaseUrl) {
    console.log('🔗 Updating webhook URLs...');

    workflowData.nodes = workflowData.nodes.map(node => {
      if (node.type === 'n8n-nodes-base.webhook') {
        // Generate unique path for webhook
        const uniquePath = this.generateWebhookPath(workflowData.name, node.name);
        node.parameters.path = uniquePath;
        node.webhookUrl = `${webhookBaseUrl}/webhook/${uniquePath}`;
        console.log(`  Webhook updated: ${node.webhookUrl}`);
      }
      return node;
    });

    return workflowData;
  }

  /**
   * Update Airtable base ID in all Airtable nodes
   */
  updateAirtableBaseId(workflowData, airtableBaseId) {
    console.log(`📊 Updating Airtable base ID to: ${airtableBaseId}`);

    workflowData.nodes = workflowData.nodes.map(node => {
      if (node.type && node.type.includes('airtable')) {
        // Update base ID in node parameters
        if (node.parameters?.base) {
          node.parameters.base = airtableBaseId;
          console.log(`  Updated Airtable node: ${node.name}`);
        }

        // Update in operation-specific parameters
        if (node.parameters?.operation) {
          ['list', 'read', 'update', 'create', 'delete'].forEach(op => {
            if (node.parameters[op]?.base) {
              node.parameters[op].base = airtableBaseId;
            }
          });
        }
      }
      return node;
    });

    return workflowData;
  }

  /**
   * Activate a deployed workflow
   */
  async activateWorkflow(workflowId) {
    console.log(`⚡ Activating workflow: ${workflowId}`);

    try {
      const response = await axios.patch(
        `${this.n8nUrl}/api/v1/workflows/${workflowId}`,
        { active: true },
        { headers: this.headers }
      );

      console.log('✅ Workflow activated');
      return response.data;

    } catch (error) {
      console.error('❌ Workflow activation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create credentials in n8n
   */
  async createCredential(credentialData) {
    console.log(`🔑 Creating credential: ${credentialData.name}`);

    try {
      const response = await axios.post(
        `${this.n8nUrl}/api/v1/credentials`,
        credentialData,
        { headers: this.headers }
      );

      console.log(`✅ Credential created: ${response.data.id}`);
      return response.data;

    } catch (error) {
      console.error('❌ Credential creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Set up Airtable credentials
   */
  async setupAirtableCredentials(apiKey) {
    const credentialData = {
      name: 'Airtable API',
      type: 'airtableApi',
      data: {
        apiKey: apiKey
      }
    };

    return await this.createCredential(credentialData);
  }

  /**
   * Set up Supabase credentials
   */
  async setupSupabaseCredentials(supabaseUrl, supabaseKey) {
    const credentialData = {
      name: 'Supabase API',
      type: 'supabaseApi',
      data: {
        url: supabaseUrl,
        serviceKey: supabaseKey
      }
    };

    return await this.createCredential(credentialData);
  }

  /**
   * Generate unique webhook path
   */
  generateWebhookPath(workflowName, nodeName) {
    const cleanName = (workflowName + '-' + nodeName)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const randomSuffix = Math.random().toString(36).substring(7);
    return `${cleanName}-${randomSuffix}`;
  }

  /**
   * Extract webhook URL from deployed workflow
   */
  extractWebhookUrl(workflow) {
    const webhookNode = workflow.nodes?.find(n => n.type === 'n8n-nodes-base.webhook');
    if (webhookNode) {
      return webhookNode.webhookUrl || `${this.n8nUrl}/webhook/${webhookNode.parameters?.path}`;
    }
    return null;
  }

  /**
   * Deploy multiple workflows from directory
   */
  async deployWorkflowDirectory(directory, options = {}) {
    console.log(`📁 Deploying workflows from: ${directory}`);

    const files = fs.readdirSync(directory).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} workflow files`);

    for (const file of files) {
      const filePath = `${directory}/${file}`;
      await this.deployWorkflow(filePath, options);
    }

    return this.deployedWorkflows;
  }

  /**
   * Test workflow execution
   */
  async testWorkflow(workflowId, testData = {}) {
    console.log(`🧪 Testing workflow: ${workflowId}`);

    try {
      const response = await axios.post(
        `${this.n8nUrl}/api/v1/workflows/${workflowId}/execute`,
        { data: testData },
        { headers: this.headers }
      );

      console.log('✅ Workflow test completed');
      return response.data;

    } catch (error) {
      console.error('❌ Workflow test failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate deployment report
   */
  generateReport() {
    console.log('\n📊 n8n Deployment Report');
    console.log('=' .repeat(50));
    console.log(`Deployed Workflows: ${this.deployedWorkflows.length}`);

    this.deployedWorkflows.forEach(workflow => {
      console.log(`\n- ${workflow.name}`);
      console.log(`  ID: ${workflow.id}`);
      if (workflow.webhookUrl) {
        console.log(`  Webhook: ${workflow.webhookUrl}`);
      }
    });

    console.log('\n' + '='.repeat(50));
  }
}

// Export for use in other scripts
module.exports = N8NWorkflowDeployer;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node n8n-workflow-deploy.js <n8n-url> <api-key> <workflow-file> [options]');
    console.log('Options:');
    console.log('  --activate             Activate workflow after deployment');
    console.log('  --airtable-base=ID     Set Airtable base ID');
    console.log('  --webhook-url=URL      Set webhook base URL');
    process.exit(1);
  }

  const [n8nUrl, apiKey, workflowFile] = args;

  // Parse options
  const options = {
    activate: args.includes('--activate'),
    airtableBaseId: args.find(a => a.startsWith('--airtable-base='))?.split('=')[1],
    webhookBaseUrl: args.find(a => a.startsWith('--webhook-url='))?.split('=')[1]
  };

  // Deploy workflow
  const deployer = new N8NWorkflowDeployer(n8nUrl, apiKey);
  deployer.deployWorkflow(workflowFile, options)
    .then(() => {
      deployer.generateReport();
      console.log('\n✅ Deployment complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    });
}