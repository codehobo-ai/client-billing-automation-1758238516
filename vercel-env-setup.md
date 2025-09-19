# Complete Vercel Environment Variables Setup

## 📝 Copy-Paste Values

### 1. GITHUB_APP_ID
```
1979422
```

### 2. GITHUB_INSTALLATION_ID
```
86647200
```

### 3. GITHUB_PRIVATE_KEY
```
[Open your .pem file and copy ALL content including -----BEGIN and -----END lines]
```

### 4. GITHUB_OWNER
```
codehobo-ai
```

### 5. GITHUB_REPO
```
client-billing-automation-1758238516
```

### 6. WEBHOOK_SECRET
```
supabase-webhook-secret-2024-abc123
```

### 7. ALLOWED_DOMAINS
```
[Replace with your actual Vercel URL after deployment]
```

## 🔧 Vercel Setup Process

### Step 1: Find Your Vercel URL
After deploying, your URL will be something like:
- `https://client-billing-automation-abc123.vercel.app`
- Use this exact URL for ALLOWED_DOMAINS

### Step 2: Add Variables One by One
In Vercel Dashboard → Settings → Environment Variables:

1. **Add GITHUB_APP_ID**
   - Name: `GITHUB_APP_ID`
   - Value: `1979422`
   - Environment: Production ✅

2. **Add GITHUB_INSTALLATION_ID**
   - Name: `GITHUB_INSTALLATION_ID`
   - Value: `86647200`
   - Environment: Production ✅

3. **Add GITHUB_PRIVATE_KEY**
   - Name: `GITHUB_PRIVATE_KEY`
   - Value: [paste entire .pem file content]
   - Environment: Production ✅

4. **Add GITHUB_OWNER**
   - Name: `GITHUB_OWNER`
   - Value: `codehobo-ai`
   - Environment: Production ✅

5. **Add GITHUB_REPO**
   - Name: `GITHUB_REPO`
   - Value: `client-billing-automation-1758238516`
   - Environment: Production ✅

6. **Add WEBHOOK_SECRET**
   - Name: `WEBHOOK_SECRET`
   - Value: `supabase-webhook-secret-2024-abc123`
   - Environment: Production ✅

7. **Add ALLOWED_DOMAINS**
   - Name: `ALLOWED_DOMAINS`
   - Value: `https://your-actual-vercel-url.vercel.app`
   - Environment: Production ✅

### Step 3: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Test
1. Visit your Vercel URL
2. Fill out the form
3. Submit with dry-run enabled
4. Check GitHub Actions for workflow trigger

## 🔍 Verification Checklist

- [ ] All 7 environment variables added
- [ ] ALLOWED_DOMAINS matches your actual Vercel URL
- [ ] GITHUB_PRIVATE_KEY includes BEGIN and END lines
- [ ] Redeployed after adding variables
- [ ] Form loads at Vercel URL
- [ ] Test submission works