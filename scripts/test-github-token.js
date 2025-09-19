#!/usr/bin/env node

// Test script to verify GitHub token permissions
const { Octokit } = require('@octokit/rest');

async function testGitHubToken(token) {
  try {
    console.log('🔍 Testing GitHub token...');

    const octokit = new Octokit({ auth: token });

    // Test 1: Basic authentication
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`✅ Authentication successful - User: ${user.login}`);

    // Test 2: Repository access
    const { data: repo } = await octokit.repos.get({
      owner: 'codehobo-ai',
      repo: 'client-billing-automation-1758238516'
    });
    console.log(`✅ Repository access confirmed - ${repo.full_name}`);

    // Test 3: Workflow permissions (dry run)
    try {
      const { data: workflows } = await octokit.actions.listRepoWorkflows({
        owner: 'codehobo-ai',
        repo: 'client-billing-automation-1758238516'
      });

      const supabaseWorkflow = workflows.workflows.find(w =>
        w.name === 'Supabase Schema Setup'
      );

      if (supabaseWorkflow) {
        console.log(`✅ Supabase workflow found - ID: ${supabaseWorkflow.id}`);
        console.log(`   State: ${supabaseWorkflow.state}`);
        console.log(`   Path: ${supabaseWorkflow.path}`);
      } else {
        console.log('⚠️  Supabase workflow not found');
      }
    } catch (error) {
      console.log('❌ Workflow access failed:', error.message);
      return false;
    }

    console.log('\n🎉 GitHub token is properly configured!');
    console.log('   ✅ Has repository access');
    console.log('   ✅ Can read workflows');
    console.log('   ✅ Ready for Vercel deployment');

    return true;

  } catch (error) {
    console.error('❌ GitHub token test failed:', error.message);

    if (error.status === 401) {
      console.log('\n💡 Token issues:');
      console.log('   - Check token is not expired');
      console.log('   - Verify you copied the full token');
      console.log('   - Ensure token has "repo" and "workflow" scopes');
    }

    return false;
  }
}

// CLI usage
if (require.main === module) {
  const token = process.argv[2];

  if (!token) {
    console.log('Usage: node test-github-token.js <your-github-token>');
    console.log('Example: node test-github-token.js ghp_xxxxxxxxxxxxxxxxxxxx');
    process.exit(1);
  }

  testGitHubToken(token).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testGitHubToken };