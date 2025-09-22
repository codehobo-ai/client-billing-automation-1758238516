#!/usr/bin/env node

// Debug version with detailed error checking
const { App } = require('@octokit/app');
const fs = require('fs');

async function debugGitHubApp(appId, privateKeyPath, installationId) {
  try {
    console.log('🔍 Starting GitHub App debug...');
    console.log(`   App ID: ${appId}`);
    console.log(`   Installation ID: ${installationId}`);
    console.log(`   Private Key Path: ${privateKeyPath}`);

    // Step 1: Validate inputs
    if (!appId || !privateKeyPath || !installationId) {
      throw new Error('Missing required parameters');
    }

    // Step 2: Load private key
    console.log('\n📄 Loading private key...');
    let privateKey;

    if (fs.existsSync(privateKeyPath)) {
      privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      console.log('✅ Private key loaded from file');
      console.log(`   File size: ${privateKey.length} characters`);
      console.log(`   Starts with: ${privateKey.substring(0, 30)}...`);
      console.log(`   Ends with: ...${privateKey.substring(privateKey.length - 30)}`);
    } else {
      console.log('❌ Private key file not found');
      console.log(`   Tried to read: ${privateKeyPath}`);
      console.log(`   Current directory: ${process.cwd()}`);
      console.log(`   Files in current directory:`);
      fs.readdirSync('.').forEach(file => console.log(`     - ${file}`));
      throw new Error('Private key file not found');
    }

    // Step 3: Validate private key format
    if (!privateKey.includes('-----BEGIN') || !privateKey.includes('-----END')) {
      throw new Error('Invalid private key format - missing BEGIN/END markers');
    }

    // Step 4: Initialize App
    console.log('\n🚀 Initializing GitHub App...');
    const app = new App({
      appId: parseInt(appId),
      privateKey: privateKey,
    });
    console.log('✅ GitHub App object created');

    // Step 5: Get installation Octokit
    console.log('\n🔐 Getting installation authentication...');
    try {
      const octokit = await app.getInstallationOctokit(parseInt(installationId));
      console.log('✅ Installation Octokit obtained');

      // Step 6: Test basic API call
      console.log('\n📡 Testing API access...');
      const { data: user } = await octokit.rest.users.getAuthenticated();
      console.log(`✅ Authenticated as: ${user.login} (${user.type})`);

      // Step 7: Test repository access
      console.log('\n📁 Testing repository access...');
      const { data: repo } = await octokit.rest.repos.get({
        owner: 'codehobo-ai',
        repo: 'client-billing-automation-1758238516'
      });
      console.log(`✅ Repository access confirmed: ${repo.full_name}`);

      // Step 8: Test workflow access
      console.log('\n⚡ Testing workflow access...');
      const { data: workflows } = await octokit.rest.actions.listRepoWorkflows({
        owner: 'codehobo-ai',
        repo: 'client-billing-automation-1758238516'
      });
      console.log(`✅ Found ${workflows.workflows.length} workflows`);

      const supabaseWorkflow = workflows.workflows.find(w => w.name === 'Supabase Schema Setup');
      if (supabaseWorkflow) {
        console.log(`✅ Supabase workflow found: ${supabaseWorkflow.id}`);
      } else {
        console.log('⚠️  Supabase workflow not found');
        console.log('Available workflows:');
        workflows.workflows.forEach(w => console.log(`   - ${w.name}`));
      }

      console.log('\n🎉 All tests passed! GitHub App is working correctly.');
      return true;

    } catch (authError) {
      console.error('❌ Installation authentication failed:', authError.message);

      if (authError.status === 404) {
        console.log('\n💡 Installation not found - possible causes:');
        console.log('   - Installation ID is incorrect');
        console.log('   - App is not installed on the repository');
        console.log('   - Installation was removed');
      }

      throw authError;
    }

  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);

    if (error.message.includes('PEM')) {
      console.log('\n💡 Private key issues:');
      console.log('   - Check the .pem file is not corrupted');
      console.log('   - Ensure it starts with -----BEGIN RSA PRIVATE KEY-----');
      console.log('   - Verify it ends with -----END RSA PRIVATE KEY-----');
    }

    if (error.message.includes('App ID')) {
      console.log('\n💡 App ID issues:');
      console.log('   - Check the App ID is correct (6-7 digit number)');
      console.log('   - Find it at: https://github.com/settings/apps');
    }

    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify App ID from GitHub App settings');
    console.log('2. Re-download the private key if needed');
    console.log('3. Check Installation ID from installation URL');
    console.log('4. Ensure app is installed on the repository');

    return false;
  }
}

// CLI usage
if (require.main === module) {
  const [appId, privateKeyPath, installationId] = process.argv.slice(2);

  if (!appId || !privateKeyPath || !installationId) {
    console.log('Usage: node debug-github-app.js <app-id> <private-key-path> <installation-id>');
    console.log('');
    console.log('Example:');
    console.log('  node debug-github-app.js 123456 ./my-app.pem 87654321');
    process.exit(1);
  }

  debugGitHubApp(appId, privateKeyPath, installationId).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { debugGitHubApp };