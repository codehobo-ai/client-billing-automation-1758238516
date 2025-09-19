# GitHub App Setup (Most Secure)

## Why GitHub Apps Are More Secure

### Personal Access Token Issues:
- ❌ Tied to your personal account
- ❌ If compromised, affects all repos you have access to
- ❌ Harder to audit and revoke granularly

### GitHub App Benefits:
- ✅ Repository-specific permissions
- ✅ Not tied to personal account
- ✅ Better audit trail
- ✅ Can be revoked per-installation
- ✅ Fine-grained permissions

## Setup Steps

### 1. Create GitHub App
1. Go to: https://github.com/settings/apps
2. Click "New GitHub App"
3. Fill in details:
   - **Name**: `Supabase Setup Automation`
   - **Homepage URL**: `https://your-vercel-app.vercel.app`
   - **Webhook URL**: `https://your-vercel-app.vercel.app/api/webhook` (optional)

### 2. Set Permissions
**Repository permissions**:
- ✅ **Actions**: Write (to trigger workflows)
- ✅ **Contents**: Read (to access repo)
- ✅ **Metadata**: Read (basic repo info)

**Account permissions**: None needed

### 3. Generate Private Key
1. Scroll down to "Private keys"
2. Click "Generate a private key"
3. Download the `.pem` file

### 4. Install App on Repository
1. Go to app settings
2. Click "Install App"
3. Select your repository
4. Note the Installation ID from URL

### 5. Update Vercel Environment Variables
```bash
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_INSTALLATION_ID=12345678
```

### 6. Update API Code
```javascript
const { App } = require('@octokit/app');

const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
});

// Get authenticated client
const octokit = await app.getInstallationOctokit(
  process.env.GITHUB_INSTALLATION_ID
);

// Trigger workflow
await octokit.rest.actions.createWorkflowDispatch({
  owner: 'codehobo-ai',
  repo: 'client-billing-automation-1758238516',
  workflow_id: 'supabase-setup.yml',
  ref: 'main',
  inputs: { /* workflow inputs */ }
});
```

## Benefits Over PAT

### Security:
- Repository-specific access only
- No personal account compromise risk
- Better audit trail in GitHub

### Management:
- Can be managed by organization
- Easier to revoke if needed
- Fine-grained permission control

### Compliance:
- Better for enterprise environments
- Clearer audit trails
- Separation of concerns