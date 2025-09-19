# Public Supabase Schema Setup

This public form allows clients to automatically deploy the billing automation database schema to their Supabase projects.

## 🌐 Live Form

**GitHub Pages URL**: https://codehobo-ai.github.io/client-billing-automation-1758238516/

## 🔧 Setup Options

### Option 1: GitHub Pages (Static Form)
- Simple HTML form hosted on GitHub Pages
- Requires backend API for security
- Free hosting with GitHub

### Option 2: Full-Stack Solution
- Deploy the API handler to Vercel/Netlify
- Secure credential handling
- Email notifications
- Usage tracking

## 🚀 Deployment Steps

### 1. Enable GitHub Pages
```bash
# In your repository settings:
# Settings → Pages → Source: Deploy from a branch
# Branch: main → /docs folder
```

### 2. Deploy Backend API (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# - GITHUB_TOKEN (GitHub PAT with repo permissions)
# - WEBHOOK_SECRET (random secret key)
# - ALLOWED_DOMAINS (your form domain)
```

### 3. Update Form Configuration
```javascript
// In docs/index.html, update:
const API_ENDPOINT = 'https://your-vercel-app.vercel.app/api/setup-handler';
```

## 🔒 Security Considerations

### For Production Use:
1. **Never expose service keys** in frontend code
2. **Use backend API** to handle credentials securely
3. **Validate all inputs** on the server side
4. **Rate limit** requests to prevent abuse
5. **Log all requests** for audit purposes
6. **Use HTTPS** for all communications

### Required Environment Variables:
- `GITHUB_TOKEN`: GitHub PAT with workflow permissions
- `WEBHOOK_SECRET`: Secret for validating requests
- `ALLOWED_DOMAINS`: Comma-separated list of allowed origins

## 📋 Form Fields

| Field | Required | Description |
|-------|----------|-------------|
| Client Name | ✅ | Reference name for the setup |
| Email | ✅ | Contact email for notifications |
| Supabase URL | ✅ | Project URL (https://project.supabase.co) |
| Service Key | ✅ | Service role key from Supabase |
| Database Password | ✅ | Database connection password |
| Vector Extension | ⚪ | Enable pgvector for AI features |
| Dry Run | ⚪ | Test mode without making changes |

## 🎯 What Gets Created

### Database Tables:
- **accounts** - Chart of accounts management
- **vendors** - Vendor information and processing
- **locations** - Location/class management
- **ai_processed_bills** - AI-processed bill data

### Features:
- Vector embeddings for AI similarity search
- QuickBooks Online integration fields
- Performance indexes
- Foreign key constraints
- JSON metadata support

## 📊 Workflow Process

1. **Form Submission** → Backend API
2. **Validation** → Input sanitization and verification
3. **GitHub Actions** → Automated workflow trigger
4. **Schema Deployment** → SQL execution in Supabase
5. **Verification** → Schema validation and reporting
6. **Notification** → Email confirmation (optional)

## 🛠️ Customization

### Add Custom Fields:
```javascript
// In the form HTML
<div class="form-group">
    <label for="customField">Custom Field</label>
    <input type="text" id="customField" name="customField">
</div>
```

### Add Email Notifications:
```javascript
// In setup-handler.js
const sgMail = require('@sendgrid/mail');
// Configure SendGrid, AWS SES, etc.
```

### Add Database Logging:
```javascript
// Store setup requests in Supabase/PostgreSQL
await supabase.from('setup_logs').insert({
    client_name: body.clientName,
    email: body.email,
    status: 'initiated',
    run_id: runId
});
```

## 📱 Mobile Responsive

The form is fully responsive and works on:
- Desktop browsers
- Mobile devices
- Tablets
- Touch interfaces

## 🔍 Testing

### Test the Form:
1. Use **Dry Run mode** first
2. Test with invalid credentials
3. Verify error handling
4. Check email notifications
5. Monitor GitHub Actions logs

### Local Development:
```bash
# Serve locally
python -m http.server 8000
# or
npx serve docs/

# Open: http://localhost:8000
```

## 📞 Support

For issues with the public form:
1. Check browser console for errors
2. Verify all form fields are filled
3. Test Supabase credentials manually
4. Check GitHub Actions workflow logs
5. Contact support with the Run ID