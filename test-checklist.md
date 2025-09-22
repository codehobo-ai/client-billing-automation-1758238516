# GitHub App Testing Checklist

## 📋 Information You Need

### 1. App ID
- **Where to find**: GitHub App settings page
- **Looks like**: `123456` (6-7 digits)
- **Your App ID**: _______________

### 2. Installation ID
- **Where to find**: Installation URL after installing app
- **Looks like**: `12345678` (8+ digits)
- **Your Installation ID**: _______________

### 3. Private Key File
- **Where to find**: Downloaded .pem file
- **File path**: `./your-app-name.pem`
- **Your file path**: _______________

## 🧪 Test Command

Once you have all three values, run:

```bash
node scripts/test-github-app.js [APP_ID] [PEM_FILE_PATH] [INSTALLATION_ID]
```

## ✅ Expected Success Output

```
🔍 Testing GitHub App configuration...
✅ Private key loaded from file
✅ GitHub App initialized - App ID: 123456
✅ Installation authenticated - Installation ID: 12345678
✅ Repository access confirmed - codehobo-ai/client-billing-automation-1758238516
✅ Found 2 workflows:
   - Client Billing Setup Automation (active)
   - Supabase Schema Setup (active)
✅ Supabase workflow ready - ID: 190732746

🧪 Testing workflow dispatch permissions...
✅ GitHub App has workflow dispatch permissions

🎉 GitHub App is properly configured!
   ✅ App authentication working
   ✅ Installation permissions valid
   ✅ Repository access confirmed
   ✅ Workflow access available
   ✅ Ready for production use
```

## ❌ Common Error Messages

### "Bad credentials"
- Check App ID is correct
- Verify private key file exists and is readable
- Ensure app is installed on repository

### "Not Found"
- Verify Installation ID is correct
- Check app is installed on correct repository
- Ensure app has required permissions (Actions: Write, Contents: Read)

### "Private key not found"
- Check file path is correct
- Verify file permissions (should be readable)
- Make sure you downloaded the .pem file

## 🔧 Troubleshooting

If the test fails:

1. **Double-check all IDs** - they must be exact
2. **Verify file path** - use `ls` to confirm file exists
3. **Check permissions** - ensure app is installed on repo
4. **Re-download key** - if key seems corrupted

## 📱 Quick Commands

```bash
# Check if .pem file exists
ls *.pem

# Display first few lines of .pem file
head -3 *.pem

# Should show: -----BEGIN RSA PRIVATE KEY-----
```