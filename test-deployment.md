# Vercel Deployment Testing Checklist

## ✅ Pre-Deployment Tests

### 1. Local API Testing
```bash
# Test the API handler locally
cd your-repo
node api/setup-handler.js
```

### 2. Environment Variables Check
- [ ] `GITHUB_TOKEN` - GitHub PAT with repo/workflow permissions
- [ ] `GITHUB_OWNER` - Repository owner name
- [ ] `GITHUB_REPO` - Repository name
- [ ] `WEBHOOK_SECRET` - Random secret string
- [ ] `ALLOWED_DOMAINS` - Comma-separated domains

## ✅ Post-Deployment Tests

### 1. Form Accessibility
- [ ] Form loads at your Vercel URL
- [ ] All fields render correctly
- [ ] Responsive design works on mobile
- [ ] HTTPS certificate is valid

### 2. API Endpoint Testing
```bash
# Test API endpoint
curl -X POST https://your-app.vercel.app/api/setup-handler \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Client",
    "email": "test@example.com",
    "supabaseUrl": "https://test.supabase.co",
    "supabaseKey": "test-key",
    "databasePassword": "test-pass",
    "vectorExtension": true,
    "dryRun": true
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Supabase schema setup initiated successfully",
  "runId": "abc123def456",
  "workflowUrl": "https://github.com/owner/repo/actions"
}
```

### 3. Security Validation
- [ ] CORS headers work correctly
- [ ] Invalid requests are rejected
- [ ] Credentials are not logged
- [ ] GitHub Actions workflow triggers
- [ ] Form works in different browsers

### 4. Error Handling
Test these scenarios:
- [ ] Missing required fields
- [ ] Invalid Supabase URL format
- [ ] Invalid credentials
- [ ] Network timeouts
- [ ] GitHub API failures

## 🔧 Common Issues & Solutions

### Issue: "Function timeout"
**Solution**: Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/setup-handler.js": {
      "maxDuration": 60
    }
  }
}
```

### Issue: "CORS error"
**Solution**: Add your domain to `ALLOWED_DOMAINS`:
```
ALLOWED_DOMAINS=https://your-form-domain.com,https://localhost:3000
```

### Issue: "GitHub workflow not triggering"
**Solution**: Check GitHub PAT permissions:
- Must have `repo` and `workflow` scopes
- Must be for the correct repository
- Must not be expired

### Issue: "Environment variables not found"
**Solution**: Redeploy after setting variables:
```bash
vercel --prod
```

## 📊 Monitoring & Analytics

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor function performance
- Track error rates

### GitHub Actions Monitoring
- Check workflow run history
- Monitor for failed deployments
- Set up failure notifications

### Custom Logging
Add to your API handler:
```javascript
console.log(`Setup request: ${body.clientName} - ${new Date().toISOString()}`);
```

## 🚀 Production Ready Checklist

- [ ] All environment variables configured
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Error handling implemented
- [ ] Rate limiting added (optional)
- [ ] Monitoring/logging enabled
- [ ] Backup GitHub PAT created
- [ ] Documentation updated with live URLs