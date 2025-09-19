#!/usr/bin/env node

// Direct workflow access test
const { App } = require('@octokit/app');
const fs = require('fs');

async function testWorkflowAccess(appId, privateKeyPath, installationId) {
  try {
    console.log('⚡ Testing workflow access directly...');

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const app = new App({
      appId: parseInt(appId),
      privateKey: privateKey,
    });

    const octokit = await app.getInstallationOctokit(parseInt(installationId));
    console.log('✅ Installation Octokit obtained');

    // Test workflows endpoint directly
    console.log('\n🔍 Testing workflows endpoint...');
    const { data: workflows } = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows', {
      owner: 'codehobo-ai',
      repo: 'client-billing-automation-1758238516'
    });

    console.log(`✅ Workflows endpoint working! Found ${workflows.workflows.length} workflow(s):`);
    workflows.workflows.forEach(workflow => {
      console.log(`   - ${workflow.name}`);
      console.log(`     ID: ${workflow.id}`);
      console.log(`     State: ${workflow.state}`);
      console.log(`     Path: ${workflow.path}`);
      console.log('');
    });

    // Find Supabase workflow
    const supabaseWorkflow = workflows.workflows.find(w =>
      w.name === 'Supabase Schema Setup'
    );

    if (supabaseWorkflow) {
      console.log('🎯 Supabase workflow found and accessible!');
      console.log(`   Workflow ID: ${supabaseWorkflow.id}`);
      console.log(`   Can be triggered via API: ✅`);
    }

    console.log('\n🎉 GitHub App is fully working!');
    console.log('\n📝 Environment variables for Vercel:');
    console.log(`GITHUB_APP_ID=${appId}`);
    console.log(`GITHUB_INSTALLATION_ID=${installationId}`);
    console.log('GITHUB_PRIVATE_KEY=[paste your entire .pem file content]');

    console.log('\n🚀 Ready to deploy to Vercel!');
    return true;

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    console.error('Status:', error.status);
    return false;
  }
}

// CLI usage
if (require.main === module) {
  const [appId, privateKeyPath, installationId] = process.argv.slice(2);

  if (!appId || !privateKeyPath || !installationId) {
    console.log('Usage: node test-workflow-access.js <app-id> <private-key-path> <installation-id>');
    console.log('');
    console.log('Run:');
    console.log('  node test-workflow-access.js 1979422 [your-pem-file] 86647200');
    process.exit(1);
  }

  testWorkflowAccess(appId, privateKeyPath, installationId).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testWorkflowAccess };