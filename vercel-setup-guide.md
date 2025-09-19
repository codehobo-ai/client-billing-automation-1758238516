# Vercel Dashboard Setup Guide

## 🚀 Quick Setup Checklist

### ✅ Step 1: Deploy Project
1. Go to: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import: `codehobo-ai/client-billing-automation-1758238516`
4. Click "Deploy"

### ✅ Step 2: Add Environment Variables
Go to **Settings → Environment Variables** and add:

```
GITHUB_TOKEN = ghp_your_github_token_here
GITHUB_OWNER = codehobo-ai
GITHUB_REPO = client-billing-automation-1758238516
WEBHOOK_SECRET = your-random-secret-string
ALLOWED_DOMAINS = https://your-project-name.vercel.app
```

### ✅ Step 3: Redeploy
After adding variables:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

### ✅ Step 4: Get Your URLs
After deployment, you'll have:
- **Form URL**: `https://your-project.vercel.app/` (shows your form)
- **API URL**: `https://your-project.vercel.app/api/setup-handler` (backend API)

## 🔧 Configuration Details

### GitHub Token Scopes Needed:
- ✅ `repo` (repository access)
- ✅ `workflow` (trigger GitHub Actions)

### WEBHOOK_SECRET:
Generate a random string:
```bash
# Any random string works:
openssl rand -hex 32
# or just use: my-super-secret-webhook-key-123
```

### ALLOWED_DOMAINS:
Your Vercel app URL, comma-separated if multiple:
```
https://your-app.vercel.app,https://your-custom-domain.com
```

## 🧪 Testing Your Deployment

### 1. Test the Form
Visit: `https://your-app.vercel.app/`
- Form should load properly
- All fields should be visible
- Should look professional and responsive

### 2. Test the API
```bash
curl -X POST https://your-app.vercel.app/api/setup-handler \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Client",
    "email": "test@example.com",
    "supabaseUrl": "https://test.supabase.co",
    "supabaseKey": "test-key",
    "databasePassword": "test-pass",
    "dryRun": true
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Supabase schema setup initiated successfully"
}
```

### 3. Check GitHub Actions
1. Go to your repo: https://github.com/codehobo-ai/client-billing-automation-1758238516/actions
2. Should see a new "Supabase Schema Setup" workflow run
3. Check that it triggered properly

## 🚨 Common Issues & Solutions

### "Environment variables not found"
**Solution**: Redeploy after adding variables
- Deployments tab → Click "..." → Redeploy

### "CORS error in browser"
**Solution**: Check ALLOWED_DOMAINS matches your Vercel URL exactly

### "GitHub workflow not triggering"
**Solution**: Verify GitHub token:
```bash
node scripts/test-github-token.js ghp_your_token
```

### "Function timeout"
**Solution**: The function might be taking too long. Check logs in Vercel Functions tab.

## 📊 Monitoring Your Deployment

### Vercel Dashboard Features:
- **Functions**: See API call logs and performance
- **Analytics**: Track form usage
- **Deployments**: History of all deployments
- **Domains**: Manage custom domains

### GitHub Actions:
- Monitor workflow runs
- Check for successful schema deployments
- Review setup reports

## 🎯 Next Steps After Deployment

1. **Update the form** with your API endpoint URL
2. **Test end-to-end** with a real Supabase project (dry run)
3. **Share the form URL** with your clients
4. **Monitor usage** through Vercel analytics
5. **Set up alerts** for any failures

Your form will be live at: `https://your-project-name.vercel.app/`