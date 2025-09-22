# GitHub App Troubleshooting Guide

## Common Error: "Cannot read properties of undefined (reading 'repos')"

This error means the `octokit` object wasn't created, usually due to authentication failure.

## 🔍 Most Common Issues

### 1. Wrong App ID
**Symptoms**: Authentication fails immediately
**Solution**:
- Go to https://github.com/settings/apps
- Click your app
- Copy the exact App ID (6-7 digits)

### 2. Wrong Installation ID
**Symptoms**: "Installation not found" or 404 error
**Solution**:
- Go to https://github.com/settings/installations
- Click your app installation
- Copy ID from URL: `installations/12345678`

### 3. Corrupted Private Key
**Symptoms**: PEM parsing errors
**Solution**:
- Re-download the .pem file from GitHub
- Ensure it starts with `-----BEGIN RSA PRIVATE KEY-----`
- Ensure it ends with `-----END RSA PRIVATE KEY-----`

### 4. App Not Installed on Repository
**Symptoms**: Repository access denied
**Solution**:
- Go to your app settings
- Click "Install App"
- Select the repository
- Grant permissions

### 5. Wrong Permissions
**Symptoms**: Can authenticate but can't access workflows
**Solution**: App needs these permissions:
- ✅ **Actions**: Write
- ✅ **Contents**: Read
- ✅ **Metadata**: Read

## 🧪 Quick Tests

### Test 1: Check App ID
```bash
# Should be 6-7 digits
echo "App ID: YOUR_APP_ID"
```

### Test 2: Check .pem File
```bash
# Should show BEGIN line
head -1 your-file.pem

# Should show END line
tail -1 your-file.pem
```

### Test 3: Check Installation
```bash
# Visit this URL (replace APP_ID):
# https://github.com/settings/installations/APP_ID
```

## 🔧 Step-by-Step Fix

### If Authentication Fails:
1. **Double-check App ID** - must be exact
2. **Re-download private key** - might be corrupted
3. **Verify installation** - app must be installed on repo

### If Repository Access Fails:
1. **Check permissions** - app needs Actions + Contents
2. **Verify installation scope** - must include your repository
3. **Check repository name** - must be exact match

### If Workflow Access Fails:
1. **Verify Actions permission** - must be "Write"
2. **Check workflow exists** - must be in repository
3. **Confirm workflow name** - "Supabase Schema Setup"

## 📋 Information Checklist

Fill this out and verify each item:

- [ ] **App ID**: _____________ (from app settings page)
- [ ] **Installation ID**: _____________ (from installation URL)
- [ ] **Private key file**: _____________ (path to .pem file)
- [ ] **App installed**: ✅ on correct repository
- [ ] **Permissions set**: ✅ Actions (Write), Contents (Read)
- [ ] **Repository access**: ✅ codehobo-ai/client-billing-automation-1758238516

## 🚨 If All Else Fails

1. **Delete and recreate** the GitHub App
2. **Use fine-grained PAT** instead (simpler but less secure)
3. **Contact GitHub support** if persistent issues