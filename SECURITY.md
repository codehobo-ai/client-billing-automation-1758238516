# Security Guidelines for Public Supabase Setup Form

## 🛡️ Security Architecture

### Frontend (Public Form)
- ✅ No sensitive data stored
- ✅ HTTPS only communication
- ✅ Input validation and sanitization
- ✅ Rate limiting via browser

### Backend (Vercel API)
- ✅ Secure environment variables
- ✅ Server-side validation
- ✅ CORS protection
- ✅ Request logging
- ✅ GitHub API authentication

## 🔒 Critical Security Measures

### 1. Never Expose Service Keys
```javascript
// ❌ NEVER DO THIS
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// ✅ DO THIS INSTEAD
const response = await fetch('/api/setup-handler', {
  method: 'POST',
  body: JSON.stringify({ supabaseKey: userInputKey })
});
```

### 2. Validate All Inputs
```javascript
// Server-side validation
function validateSupabaseUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('https://')) return false;
  if (!url.includes('supabase.co')) return false;
  return true;
}
```

### 3. Use HTTPS Everywhere
- Form hosted on HTTPS (GitHub Pages/Vercel)
- API endpoints use HTTPS only
- Supabase connections use HTTPS

### 4. Implement Rate Limiting
```javascript
// Optional: Add rate limiting
const rateLimiter = {
  requests: new Map(),

  isAllowed(ip) {
    const now = Date.now();
    const requests = this.requests.get(ip) || [];
    const recent = requests.filter(time => now - time < 60000); // 1 minute

    if (recent.length >= 5) return false; // Max 5 requests per minute

    recent.push(now);
    this.requests.set(ip, recent);
    return true;
  }
};
```

## 🔐 Environment Variable Security

### Required Variables (Vercel Dashboard)
```bash
# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx  # GitHub PAT
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name

# Security
WEBHOOK_SECRET=random-secure-string-123456789
ALLOWED_DOMAINS=https://your-domain.vercel.app,https://localhost:3000

# Optional: Email notifications
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
NOTIFICATION_EMAIL=admin@yourdomain.com
```

### GitHub PAT Permissions (Minimal)
- ✅ `repo` - Repository access
- ✅ `workflow` - Trigger GitHub Actions
- ❌ No admin permissions needed
- ❌ No user data access

## 🚨 Risk Assessment

### Low Risk ✅
- Form submission data
- GitHub Actions workflow triggers
- Public repository access
- Vercel function logs

### Medium Risk ⚠️
- GitHub PAT exposure (if compromised)
- Supabase service key handling
- Client credential validation
- Rate limiting bypasses

### High Risk ❌
- Storing client credentials permanently
- Exposing service keys in frontend
- Unvalidated SQL execution
- Cross-site scripting (XSS)

## 🛡️ Additional Security Measures

### 1. Input Sanitization
```javascript
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS
    .substring(0, 500);   // Limit length
}
```

### 2. Request Logging
```javascript
// Log all requests (without sensitive data)
console.log({
  timestamp: new Date().toISOString(),
  clientName: sanitizeInput(body.clientName),
  email: sanitizeInput(body.email),
  supabaseProject: extractProjectId(body.supabaseUrl),
  dryRun: body.dryRun,
  userAgent: event.headers['user-agent'],
  ip: event.headers['x-forwarded-for']
});
```

### 3. Error Handling
```javascript
// Don't expose internal errors
try {
  // API logic
} catch (error) {
  console.error('Internal error:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'Setup failed. Please try again or contact support.'
    })
  };
}
```

### 4. CORS Configuration
```javascript
const headers = {
  'Access-Control-Allow-Origin': getAllowedOrigin(event.headers.origin),
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

function getAllowedOrigin(origin) {
  const allowed = process.env.ALLOWED_DOMAINS?.split(',') || [];
  return allowed.includes(origin) ? origin : allowed[0];
}
```

## 🔍 Security Monitoring

### What to Monitor
- ✅ Failed authentication attempts
- ✅ Unusual request patterns
- ✅ GitHub Actions failures
- ✅ Vercel function errors
- ✅ High-frequency requests from single IP

### Alerting Setup
```javascript
// Optional: Alert on suspicious activity
if (failedAttempts > 10) {
  await sendAlert({
    type: 'security',
    message: `High failure rate detected from IP: ${clientIp}`,
    timestamp: new Date().toISOString()
  });
}
```

## 📋 Security Checklist

### Pre-Deployment
- [ ] All environment variables set in Vercel
- [ ] GitHub PAT has minimal required permissions
- [ ] CORS domains correctly configured
- [ ] Input validation implemented
- [ ] Error handling doesn't leak info
- [ ] HTTPS enforced everywhere

### Post-Deployment
- [ ] Test with invalid inputs
- [ ] Verify CORS protection works
- [ ] Check GitHub Actions trigger correctly
- [ ] Monitor initial usage patterns
- [ ] Set up error alerting
- [ ] Document incident response plan

### Ongoing Security
- [ ] Rotate GitHub PAT every 90 days
- [ ] Monitor Vercel function logs
- [ ] Review GitHub Actions workflow history
- [ ] Update dependencies regularly
- [ ] Audit access patterns monthly

## 🚨 Incident Response

### If GitHub PAT is Compromised
1. Immediately revoke the token in GitHub
2. Generate new PAT with minimal permissions
3. Update Vercel environment variable
4. Review recent GitHub Actions for unauthorized runs
5. Check repository access logs

### If Suspicious Activity Detected
1. Temporarily disable the form
2. Review Vercel function logs
3. Check for unusual GitHub Actions triggers
4. Investigate source IPs
5. Update security measures as needed

## 📞 Support & Reporting

For security concerns:
1. Check this documentation first
2. Review Vercel function logs
3. Check GitHub Actions workflow logs
4. Contact repository maintainer
5. Report vulnerabilities responsibly