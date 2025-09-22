#!/usr/bin/env node

// Simplified test - just list installations to find the right ID
const { App } = require('@octokit/app');
const fs = require('fs');

async function listInstallations(appId, privateKeyPath) {
  try {
    console.log('🔍 Finding your installation ID...');

    // Load private key
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    // Initialize app
    const app = new App({
      appId: parseInt(appId),
      privateKey: privateKey,
    });

    console.log('✅ GitHub App authenticated successfully');

    // List all installations
    const { data: installations } = await app.octokit.rest.apps.listInstallations();

    console.log(`\n📋 Found ${installations.length} installation(s):`);

    installations.forEach((installation, index) => {
      console.log(`\n${index + 1}. Installation ID: ${installation.id}`);
      console.log(`   Account: ${installation.account.login}`);
      console.log(`   Type: ${installation.account.type}`);
      console.log(`   Created: ${installation.created_at}`);
      console.log(`   Permissions: ${Object.keys(installation.permissions).join(', ')}`);

      if (installation.repository_selection === 'selected') {
        console.log(`   Repository access: Selected repositories only`);
      } else {
        console.log(`   Repository access: All repositories`);
      }
    });

    console.log('\n💡 Use one of these Installation IDs in your test command:');
    installations.forEach(installation => {
      console.log(`   node scripts/debug-github-app.js ${appId} ${privateKeyPath} ${installation.id}`);
    });

    return installations;

  } catch (error) {
    console.error('❌ Failed to list installations:', error.message);

    if (error.status === 401) {
      console.log('\n💡 Authentication failed - check:');
      console.log('   - App ID is correct');
      console.log('   - Private key file is valid');
    }

    return null;
  }
}

// CLI usage
if (require.main === module) {
  const [appId, privateKeyPath] = process.argv.slice(2);

  if (!appId || !privateKeyPath) {
    console.log('Usage: node simple-app-test.js <app-id> <private-key-path>');
    console.log('');
    console.log('This will show you all available installation IDs');
    process.exit(1);
  }

  listInstallations(appId, privateKeyPath);
}

module.exports = { listInstallations };