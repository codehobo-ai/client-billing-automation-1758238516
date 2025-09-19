# GitHub Authentication Methods Comparison

## GITHUB_TOKEN (Automatic)
**Scope**: Inside GitHub Actions only

```yaml
# ✅ Works inside GitHub Actions
- name: Call another workflow
  run: |
    curl -X POST \
      -H "Authorization: Bearer ${{ secrets.GITHUB_TOKEN }}" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/owner/repo/dispatches
```

**Limitations**:
- ❌ Only available during workflow execution
- ❌ Cannot be used from external services (like Vercel)
- ❌ Expires when workflow ends
- ❌ No access outside GitHub's infrastructure

## Personal Access Token (What We Need)
**Scope**: External services → GitHub API

```javascript
// ✅ Works from Vercel/external APIs
const response = await fetch('https://api.github.com/repos/owner/repo/actions/workflows/workflow.yml/dispatches', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, // PAT
    'Accept': 'application/vnd.github.v3+json'
  },
  body: JSON.stringify({
    ref: 'main',
    inputs: { client_name: 'Test Client' }
  })
});
```

**Capabilities**:
- ✅ Works from any external service
- ✅ Long-lived (you set expiration)
- ✅ Fine-grained permissions
- ✅ Can trigger workflows remotely

## GitHub Apps (Most Secure Alternative)
**Scope**: Enterprise-grade authentication

```javascript
// ✅ Most secure approach
const { App } = require('@octokit/app');

const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
});

const octokit = await app.getInstallationOctokit(installationId);
```

**Benefits**:
- ✅ Fine-grained repository permissions
- ✅ Audit logging
- ✅ Revocable per-installation
- ✅ No user account dependency

**Complexity**: Much more setup required