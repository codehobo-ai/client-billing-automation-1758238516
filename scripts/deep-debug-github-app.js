#!/usr/bin/env node

// Ultra-detailed debug version
const { App } = require('@octokit/app');
const fs = require('fs');

async function deepDebugGitHubApp(appId, privateKeyPath, installationId) {
  try {
    console.log('🔍 Starting deep GitHub App debug...');
    console.log(`   App ID: ${appId} (type: ${typeof appId})`);
    console.log(`   Installation ID: ${installationId} (type: ${typeof installationId})`);
    console.log(`   Private Key Path: ${privateKeyPath}`);

    // Step 1: Load and validate private key
    console.log('\n📄 Loading private key...');
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    console.log(`   Length: ${privateKey.length} characters`);
    console.log(`   First 50 chars: ${privateKey.substring(0, 50)}`);
    console.log(`   Last 50 chars: ${privateKey.substring(privateKey.length - 50)}`);

    // Step 2: Initialize App with detailed logging
    console.log('\n🚀 Initializing GitHub App...');
    const app = new App({
      appId: parseInt(appId),
      privateKey: privateKey,
    });
    console.log('✅ App object created successfully');
    console.log(`   App object type: ${typeof app}`);
    console.log(`   App has getInstallationOctokit: ${typeof app.getInstallationOctokit}`);

    // Step 3: Test the installation authentication step by step
    console.log('\n🔐 Testing installation authentication...');
    console.log(`   Attempting to authenticate installation: ${installationId}`);

    try {
      // Check if installation exists first
      console.log('   Step 1: Checking if installation exists...');
      const installations = await app.octokit.rest.apps.listInstallations();
      console.log(`   Found ${installations.data.length} installation(s):`);

      installations.data.forEach(installation => {
        console.log(`     - ID: ${installation.id}, Account: ${installation.account.login}, Type: ${installation.account.type}`);
      });

      const targetInstallation = installations.data.find(i => i.id.toString() === installationId.toString());
      if (!targetInstallation) {
        console.log(`❌ Installation ${installationId} not found in available installations`);
        console.log('💡 Available installation IDs:', installations.data.map(i => i.id));
        throw new Error(`Installation ${installationId} not found`);
      }

      console.log(`✅ Installation ${installationId} found for account: ${targetInstallation.account.login}`);

      // Step 4: Get the installation Octokit
      console.log('   Step 2: Getting installation Octokit...');
      const octokit = await app.getInstallationOctokit(parseInt(installationId));

      console.log(`   Octokit result type: ${typeof octokit}`);
      console.log(`   Octokit is null: ${octokit === null}`);
      console.log(`   Octokit is undefined: ${octokit === undefined}`);

      if (!octokit) {
        throw new Error('getInstallationOctokit returned null/undefined');
      }

      console.log(`   Octokit has rest property: ${!!octokit.rest}`);
      console.log(`   Octokit rest has users: ${!!octokit.rest?.users}`);

      // Step 5: Test API call
      console.log('   Step 3: Testing API call...');
      const { data: user } = await octokit.rest.users.getAuthenticated();
      console.log(`✅ Authenticated as: ${user.login} (${user.type})`);

      console.log('\n🎉 Deep debug successful!');
      return true;

    } catch (installError) {
      console.error('❌ Installation error:', installError);

      if (installError.status === 404) {
        console.log('\n💡 404 Error - Installation not found. Possible causes:');
        console.log('   - Installation ID is wrong');
        console.log('   - App was uninstalled');
        console.log('   - No permission to access installation');
      }

      if (installError.status === 401) {
        console.log('\n💡 401 Error - Authentication failed. Possible causes:');
        console.log('   - App ID is wrong');
        console.log('   - Private key is invalid');
        console.log('   - App permissions are insufficient');
      }

      throw installError;
    }

  } catch (error) {
    console.error('\n❌ Deep debug failed:', error.message);
    console.error('Full error:', error);

    // Specific guidance based on error
    if (error.message.includes('ENOENT')) {
      console.log('\n💡 File not found - check your .pem file path');
    }

    if (error.message.includes('PEM')) {
      console.log('\n💡 Private key format issue - re-download the .pem file');
    }

    return false;
  }
}

// CLI usage
if (require.main === module) {
  const [appId, privateKeyPath, installationId] = process.argv.slice(2);

  if (!appId || !privateKeyPath || !installationId) {
    console.log('Usage: node deep-debug-github-app.js <app-id> <private-key-path> <installation-id>');
    process.exit(1);
  }

  deepDebugGitHubApp(appId, privateKeyPath, installationId).then(success => {
    process.exit(success ? 0 : 1);
  });
}