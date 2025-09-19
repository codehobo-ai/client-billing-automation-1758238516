#!/usr/bin/env node

// Check what repositories the app actually has access to
const { App } = require('@octokit/app');
const fs = require('fs');

async function checkAppRepos(appId, privateKeyPath, installationId) {
  try {
    console.log('🔍 Checking app repository access...');

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const app = new App({
      appId: parseInt(appId),
      privateKey: privateKey,
    });

    // Get installation details first
    console.log('\n📋 Getting installation details...');
    const installationResponse = await app.octokit.request('GET /app/installations/{installation_id}', {
      installation_id: parseInt(installationId)
    });

    const installation = installationResponse.data;
    console.log(`✅ Installation found:`);
    console.log(`   Account: ${installation.account.login}`);
    console.log(`   Type: ${installation.account.type}`);
    console.log(`   Repository selection: ${installation.repository_selection}`);
    console.log(`   Created: ${installation.created_at}`);

    // Get installation Octokit
    const octokit = await app.getInstallationOctokit(parseInt(installationId));

    // Method 1: Try to list accessible repos using installation token
    console.log('\n📁 Method 1: Checking accessible repositories...');
    try {
      // Use the installation token to check what repos we can access
      const reposResponse = await octokit.request('GET /installation/repositories');
      console.log(`✅ Found ${reposResponse.data.total_count} accessible repository(ies):`);

      reposResponse.data.repositories.forEach(repo => {
        console.log(`   - ${repo.full_name} (private: ${repo.private})`);
      });

      // Check if our target repo is in the list
      const targetRepo = reposResponse.data.repositories.find(r =>
        r.full_name === 'codehobo-ai/client-billing-automation-1758238516'
      );

      if (targetRepo) {
        console.log('\n✅ Target repository found in accessible list!');
        return { success: true, hasAccess: true, repos: reposResponse.data.repositories };
      } else {
        console.log('\n❌ Target repository NOT found in accessible list');
        console.log('Available repositories:');
        reposResponse.data.repositories.forEach(repo => {
          console.log(`   - ${repo.full_name}`);
        });
      }

    } catch (reposError) {
      console.log('❌ Method 1 failed:', reposError.message);

      // Method 2: Try alternative approach
      console.log('\n📁 Method 2: Checking individual repository access...');
      try {
        const { data: userRepos } = await octokit.request('GET /user/repos', {
          type: 'all',
          per_page: 100
        });

        console.log(`Found ${userRepos.length} repositories via user endpoint:`);
        userRepos.forEach(repo => {
          console.log(`   - ${repo.full_name}`);
        });

      } catch (userReposError) {
        console.log('❌ Method 2 also failed:', userReposError.message);
      }
    }

    // Check installation permissions
    console.log('\n🔐 Installation permissions:');
    if (installation.permissions) {
      Object.keys(installation.permissions).forEach(permission => {
        console.log(`   ${permission}: ${installation.permissions[permission]}`);
      });
    } else {
      console.log('   No permissions listed');
    }

    console.log('\n💡 Next steps to fix this:');
    console.log('1. Go to: https://github.com/settings/installations');
    console.log(`2. Click on your app installation`);
    console.log('3. Make sure "codehobo-ai/client-billing-automation-1758238516" is selected');
    console.log('4. If using "Selected repositories", add the repository');
    console.log('5. Ensure permissions include:');
    console.log('   - Actions: Write');
    console.log('   - Contents: Read');
    console.log('   - Metadata: Read');

    return { success: false, hasAccess: false, installation: installation };

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    return { success: false, error: error.message };
  }
}

// CLI usage
if (require.main === module) {
  const [appId, privateKeyPath, installationId] = process.argv.slice(2);

  if (!appId || !privateKeyPath || !installationId) {
    console.log('Usage: node check-app-repos.js <app-id> <private-key-path> <installation-id>');
    console.log('');
    console.log('Run with your values:');
    console.log('  node check-app-repos.js 1979422 [your-pem-file] 86647200');
    process.exit(1);
  }

  checkAppRepos(appId, privateKeyPath, installationId);
}

module.exports = { checkAppRepos };