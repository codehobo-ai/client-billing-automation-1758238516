// Example backend API handler for Supabase setup
// Deploy this to Vercel, Netlify Functions, or your preferred serverless platform

const { Octokit } = require('@octokit/rest');
const { App } = require('@octokit/app');
const crypto = require('crypto');

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
  // CORS headers
  const origin = ALLOWED_DOMAINS[0] === '*' ? '*' : req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Validate required fields
    const required = ['clientName', 'email', 'supabaseUrl', 'supabaseKey', 'databasePassword'];
    for (const field of required) {
      if (!body[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate Supabase URL format (allow various formats)
    if (!body.supabaseUrl.includes('supabase.co') && !body.supabaseUrl.includes('supbase.co')) {
      return res.status(400).json({ error: 'Invalid Supabase URL format' });
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
    const response = await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow_id: 'supabase-setup.yml',
      ref: 'main',
      inputs: {
        client_name: body.clientName,
        supabase_url: body.supabaseUrl,
        supabase_service_key: body.supabaseKey,
        database_password: body.databasePassword,
        setup_vector_extension: String(body.vectorExtension || true),
        dry_run: String(body.dryRun || false)
      }
    });

    // Log the setup request (you might want to store this in a database)
    console.log(`Setup initiated for ${body.clientName} by ${body.email} - Run ID: ${runId}`);

    // Optional: Send email notification
    // await sendEmailNotification(body.email, body.clientName, runId);

    // Optional: Store in database for tracking
    // await storeSetupRequest(body, runId);

    return res.status(200).json({
      success: true,
      message: 'Supabase schema setup initiated successfully',
      runId: runId,
      workflowUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`,
      note: body.dryRun ? 'Running in DRY RUN mode - no changes will be made' : 'Deploying schema to your Supabase project'
    });

  } catch (error) {
    console.error('Setup error:', error);
    console.error('Environment check:', {
      GITHUB_APP_ID: !!GITHUB_APP_ID,
      GITHUB_INSTALLATION_ID: !!GITHUB_INSTALLATION_ID,
      GITHUB_PRIVATE_KEY: !!GITHUB_PRIVATE_KEY,
      GITHUB_OWNER,
      GITHUB_REPO
    });

    return res.status(500).json({
      error: 'Failed to initiate setup',
      message: error.message,
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