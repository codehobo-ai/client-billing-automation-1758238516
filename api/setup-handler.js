// Example backend API handler for Supabase setup
// Deploy this to Vercel, Netlify Functions, or your preferred serverless platform

const { Octokit } = require('@octokit/rest');
const { App } = require('@octokit/app');
const crypto = require('crypto');
const { createLogger } = require('../utils/logger');
const { getMonitor } = require('../utils/monitoring');

// Environment variables (set in your hosting platform)
const GITHUB_APP_ID = process.env.GITHUB_APP_ID; // GitHub App ID
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY; // GitHub App private key
const GITHUB_INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID; // Installation ID
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'codehobo-ai';
const GITHUB_REPO = process.env.GITHUB_REPO || 'client-billing-automation-1758238516';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET; // For validating requests
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS?.split(',') || ['*']; // CORS domains

// Main handler function for Vercel
export default async function handler(req, res) {
  // Initialize logging for this request
  const runId = crypto.randomBytes(8).toString('hex');
  const logger = createLogger('api-handler', { runId });
  const monitor = getMonitor();

  // CORS headers
  const origin = ALLOWED_DOMAINS[0] === '*' ? '*' : req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    logger.debug('CORS preflight request');
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    logger.warn('Invalid HTTP method', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  logger.serviceStart('automation-setup', { runId });

  try {
    const body = req.body;

    // Validate required fields
    const required = ['clientName', 'email'];
    for (const field of required) {
      if (!body[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate service-specific requirements
    if (body.setupSupabase !== false) {
      const supabaseRequired = ['supabaseUrl', 'supabaseKey', 'databasePassword'];
      for (const field of supabaseRequired) {
        if (!body[field]) {
          return res.status(400).json({ error: `Missing required Supabase field: ${field}` });
        }
      }

      // Validate Supabase URL format
      if (!body.supabaseUrl.includes('supabase.co') && !body.supabaseUrl.includes('supbase.co')) {
        return res.status(400).json({ error: 'Invalid Supabase URL format' });
      }
    }

    if (body.setupAirtable === true) {
      if (!body.airtableApiKey) {
        return res.status(400).json({ error: 'Missing required Airtable API key' });
      }
    }

    if (body.setupN8n === true) {
      const n8nRequired = ['n8nUrl', 'n8nApiKey'];
      for (const field of n8nRequired) {
        if (!body[field]) {
          return res.status(400).json({ error: `Missing required n8n field: ${field}` });
        }
      }
    }

    // Create workflow run ID
    const runId = crypto.randomBytes(8).toString('hex');

    // Initialize GitHub App
    const app = new App({
      appId: parseInt(GITHUB_APP_ID),
      privateKey: GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
    });

    // Get authenticated Octokit instance for the installation
    const octokit = await app.getInstallationOctokit(GITHUB_INSTALLATION_ID);

    // Trigger GitHub Actions workflow
    const workflowInputs = {
      client_name: body.clientName,
      email: body.email,

      // Supabase inputs
      setup_supabase: String(body.setupSupabase !== false),
      supabase_url: body.supabaseUrl || '',
      supabase_service_key: body.supabaseKey || '',
      database_password: body.databasePassword || '',

      // Airtable inputs
      setup_airtable: String(body.setupAirtable === true),
      airtable_api_key: body.airtableApiKey || '',
      airtable_base_id: body.airtableBaseId || '',
      airtable_create_new: String(body.airtableCreateNew === true),

      // n8n inputs
      setup_n8n: String(body.setupN8n === true),
      n8n_url: body.n8nUrl || '',
      n8n_api_key: body.n8nApiKey || '',
      n8n_activate_workflows: String(body.n8nActivateWorkflows === true),

      // General options
      dry_run: String(body.dryRun || false)
    };

    const response = await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow_id: 'full-automation-setup.yml',
      ref: 'main',
      inputs: workflowInputs
    });

    const selectedServices = [];
    if (body.setupSupabase) selectedServices.push('Supabase');
    if (body.setupAirtable) selectedServices.push('Airtable');
    if (body.setupN8n) selectedServices.push('n8n');

    // Track deployment start
    monitor.trackDeploymentStart(runId, selectedServices, body.clientName);

    logger.info('Automation setup initiated', {
      client: body.clientName,
      email: body.email,
      services: selectedServices,
      dryRun: body.dryRun
    });

    const duration = Date.now() - startTime;
    monitor.trackDeploymentComplete(runId, true, duration, {
      services: selectedServices,
      dryRun: body.dryRun
    });

    logger.serviceComplete('automation-setup', {
      runId,
      duration,
      services: selectedServices
    });

    return res.status(200).json({
      success: true,
      message: 'Automation setup initiated successfully',
      runId: runId,
      workflowUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`,
      services: selectedServices,
      note: body.dryRun ? 'Running in DRY RUN mode - no changes will be made' : 'Deploying automation to your services'
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.serviceError('automation-setup', error, {
      runId,
      duration,
      client: body?.clientName,
      services: body ? [
        body.setupSupabase && 'Supabase',
        body.setupAirtable && 'Airtable',
        body.setupN8n && 'n8n'
      ].filter(Boolean) : []
    });

    monitor.trackDeploymentComplete(runId, false, duration, {
      error: error.message,
      stack: error.stack
    });

    logger.debug('Environment check', {
      GITHUB_APP_ID: !!GITHUB_APP_ID,
      GITHUB_INSTALLATION_ID: !!GITHUB_INSTALLATION_ID,
      GITHUB_PRIVATE_KEY: !!GITHUB_PRIVATE_KEY,
      GITHUB_OWNER,
      GITHUB_REPO
    });

    return res.status(500).json({
      error: 'Failed to initiate setup',
      message: error.message,
      runId: runId,
      details: error.status ? `HTTP ${error.status}: ${error.message}` : error.message
    });
  }
}

// Optional: Email notification function
async function sendEmailNotification(email, clientName, runId) {
  // Implement email sending using SendGrid, AWS SES, etc.
  // Example:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: email,
  //   from: 'noreply@yourdomain.com',
  //   subject: `Supabase Setup Initiated for ${clientName}`,
  //   text: `Your setup request has been received. Run ID: ${runId}`,
  //   html: `<p>Your setup request has been received.</p><p>Run ID: <strong>${runId}</strong></p>`
  // });
}

// Optional: Store setup request
async function storeSetupRequest(data, runId) {
  // Store in your database (Supabase, PostgreSQL, etc.)
  // This allows you to track setup history and status
}