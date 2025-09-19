#!/usr/bin/env node

// Version-compatible GitHub App test
const { App } = require('@octokit/app');
const fs = require('fs');

async function workingAppTest(appId, privateKeyPath) {
  try {
    console.log('🔍 Working GitHub App test...');

    // Load private key
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    console.log('✅ Private key loaded');

    // Create App
    const app = new App({
      appId: parseInt(appId),
      privateKey: privateKey,
    });
    console.log('✅ App object created');

    // Method 1: Try app.octokit.request (newer API)
    console.log('\n🧪 Testing Method 1: app.octokit.request...');
    try {
      const response = await app.octokit.request('GET /app');
      console.log('✅ Method 1 successful!');
      console.log(`   App name: ${response.data.name}`);
      console.log(`   App ID: ${response.data.id}`);
      console.log(`   Owner: ${response.data.owner.login}`);

      // Now let's list installations using this method
      console.log('\n📋 Listing installations...');
      const installsResponse = await app.octokit.request('GET /app/installations');
      console.log(`✅ Found ${installsResponse.data.length} installation(s):`);

      installsResponse.data.forEach(installation => {
        console.log(`   - ID: ${installation.id}, Account: ${installation.account.login}`);
      });

      return { success: true, installations: installsResponse.data };

    } catch (method1Error) {
      console.log('❌ Method 1 failed:', method1Error.message);

      // Method 2: Try direct Octokit import
      console.log('\n🧪 Testing Method 2: Direct Octokit...');
      const { Octokit } = require('@octokit/rest');

      try {
        // Get a JWT token from the app
        const jwt = app.getSignedJsonWebToken();
        console.log('✅ Got JWT token');

        // Create Octokit with JWT
        const octokit = new Octokit({
          auth: jwt,
        });

        const appResponse = await octokit.rest.apps.getAuthenticated();
        console.log('✅ Method 2 successful!');
        console.log(`   App name: ${appResponse.data.name}`);
        console.log(`   App ID: ${appResponse.data.id}`);

        // List installations
        const installsResponse = await octokit.rest.apps.listInstallations();
        console.log(`✅ Found ${installsResponse.data.length} installation(s):`);

        installsResponse.data.forEach(installation => {
          console.log(`   - ID: ${installation.id}, Account: ${installation.account.login}`);
        });

        return { success: true, installations: installsResponse.data };

      } catch (method2Error) {
        console.log('❌ Method 2 failed:', method2Error.message);
        throw method2Error;
      }
    }

  } catch (error) {
    console.error('\n❌ All methods failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test installation access
async function testInstallationAccess(appId, privateKeyPath, installationId) {
  try {
    console.log(`\n🔐 Testing installation access for ID: ${installationId}`);

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const app = new App({
      appId: parseInt(appId),
      privateKey: privateKey,
    });

    // Get installation Octokit
    const octokit = await app.getInstallationOctokit(parseInt(installationId));

    if (!octokit) {
      throw new Error('getInstallationOctokit returned null/undefined');
    }

    console.log('✅ Installation Octokit obtained');

    // Test repository access
    try {
      const { data: repos } = await octokit.rest.apps.listReposAccessibleToInstallation();
      console.log(`✅ Installation has access to ${repos.repositories.length} repository(ies):`);

      repos.repositories.forEach(repo => {
        console.log(`   - ${repo.full_name}`);
      });

      // Check for our specific repo
      const targetRepo = repos.repositories.find(r =>
        r.full_name === 'codehobo-ai/client-billing-automation-1758238516'
      );

      if (targetRepo) {
        console.log('✅ Target repository found in installation!');

        // Test workflow access
        const { data: workflows } = await octokit.rest.actions.listRepoWorkflows({
          owner: 'codehobo-ai',
          repo: 'client-billing-automation-1758238516'
        });

        console.log(`✅ Found ${workflows.workflows.length} workflow(s) in target repo`);
        workflows.workflows.forEach(w => console.log(`   - ${w.name}`));

        return true;
      } else {
        console.log('❌ Target repository not found in installation');
        return false;
      }

    } catch (repoError) {
      console.error('❌ Repository access failed:', repoError.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Installation test failed:', error.message);
    return false;
  }
}

// CLI usage
if (require.main === module) {
  const [appId, privateKeyPath, installationId] = process.argv.slice(2);

  if (!appId || !privateKeyPath) {
    console.log('Usage: node working-app-test.js <app-id> <private-key-path> [installation-id]');
    console.log('');
    console.log('Examples:');
    console.log('  node working-app-test.js 123456 ./my-app.pem');
    console.log('  node working-app-test.js 123456 ./my-app.pem 87654321');
    process.exit(1);
  }

  workingAppTest(appId, privateKeyPath).then(async (result) => {
    if (result.success && installationId) {
      await testInstallationAccess(appId, privateKeyPath, installationId);
    } else if (result.success) {
      console.log('\n💡 To test a specific installation, run:');
      result.installations.forEach(installation => {
        console.log(`   node working-app-test.js ${appId} ${privateKeyPath} ${installation.id}`);
      });
    }
  });
}

module.exports = { workingAppTest, testInstallationAccess };