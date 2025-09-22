#!/usr/bin/env node

// Most basic test possible
const { App } = require('@octokit/app');
const fs = require('fs');

async function basicAppTest(appId, privateKeyPath) {
  try {
    console.log('🔍 Basic GitHub App test...');
    console.log(`App ID: ${appId}`);
    console.log(`Private key file: ${privateKeyPath}`);

    // Step 1: Check if file exists
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`Private key file not found: ${privateKeyPath}`);
    }
    console.log('✅ Private key file exists');

    // Step 2: Read the file
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    console.log(`✅ Private key loaded (${privateKey.length} characters)`);

    // Step 3: Check basic format
    if (!privateKey.includes('-----BEGIN')) {
      throw new Error('Private key missing BEGIN marker');
    }
    if (!privateKey.includes('-----END')) {
      throw new Error('Private key missing END marker');
    }
    console.log('✅ Private key format looks correct');

    // Step 4: Parse App ID
    const parsedAppId = parseInt(appId);
    if (isNaN(parsedAppId)) {
      throw new Error(`Invalid App ID: ${appId} (must be a number)`);
    }
    console.log(`✅ App ID parsed: ${parsedAppId}`);

    // Step 5: Try to create App object
    console.log('🚀 Creating App object...');
    const app = new App({
      appId: parsedAppId,
      privateKey: privateKey,
    });

    console.log('✅ App object created');
    console.log(`App object type: ${typeof app}`);
    console.log(`Has octokit property: ${!!app.octokit}`);

    if (!app.octokit) {
      throw new Error('App object created but octokit property is missing');
    }

    console.log('✅ App has octokit property');
    console.log(`Octokit type: ${typeof app.octokit}`);
    console.log(`Has rest property: ${!!app.octokit.rest}`);

    // Step 6: Try a basic authenticated call
    console.log('📡 Testing basic authentication...');
    try {
      const { data: app_info } = await app.octokit.rest.apps.getAuthenticated();
      console.log(`✅ App authenticated successfully!`);
      console.log(`   App name: ${app_info.name}`);
      console.log(`   App ID: ${app_info.id}`);
      console.log(`   Owner: ${app_info.owner.login}`);
    } catch (authError) {
      console.error('❌ App authentication failed:', authError.message);
      throw authError;
    }

    console.log('\n🎉 Basic app test successful!');
    console.log('The App ID and private key are working correctly.');
    console.log('The issue is likely with the Installation ID.');

    return true;

  } catch (error) {
    console.error('\n❌ Basic app test failed:', error.message);

    // Helpful error messages
    if (error.message.includes('ENOENT')) {
      console.log('\n💡 File not found:');
      console.log(`   - Check the path: ${privateKeyPath}`);
      console.log(`   - Current directory: ${process.cwd()}`);
      console.log(`   - Files here: ${fs.readdirSync('.').filter(f => f.endsWith('.pem')).join(', ')}`);
    }

    if (error.message.includes('Invalid App ID')) {
      console.log('\n💡 App ID issue:');
      console.log('   - Must be a number (like 123456)');
      console.log('   - Find it at: https://github.com/settings/apps');
    }

    if (error.message.includes('BEGIN') || error.message.includes('END')) {
      console.log('\n💡 Private key format issue:');
      console.log('   - Re-download the .pem file from GitHub');
      console.log('   - Ensure it starts with -----BEGIN RSA PRIVATE KEY-----');
    }

    return false;
  }
}

// CLI usage
if (require.main === module) {
  const [appId, privateKeyPath] = process.argv.slice(2);

  if (!appId || !privateKeyPath) {
    console.log('Usage: node basic-app-test.js <app-id> <private-key-path>');
    console.log('');
    console.log('Example:');
    console.log('  node basic-app-test.js 123456 ./my-app.pem');
    process.exit(1);
  }

  basicAppTest(appId, privateKeyPath).then(success => {
    if (success) {
      console.log('\n✅ Next step: Find your Installation ID');
      console.log(`Run: node scripts/simple-app-test.js ${appId} ${privateKeyPath}`);
    }
    process.exit(success ? 0 : 1);
  });
}