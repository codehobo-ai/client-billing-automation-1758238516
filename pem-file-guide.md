# How to Use Your GitHub App .pem File

## ✅ What the .pem File Should Look Like

Your downloaded `.pem` file contains a private key that looks like this:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN
OPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQR
STUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV
WXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234
567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678
90abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ab
cdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdef
ghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghij
klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmn
opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqr
stuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuv
wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz
ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCD
EFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGH
IJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL
MNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP
QRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST
UVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX
YZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12
34567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456
7890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcd
efghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefgh
ijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijkl
mnopqrstuvwxyz
-----END RSA PRIVATE KEY-----
```

**This is EXACTLY what you need!** The random-looking characters are the encrypted private key.

## 📋 Steps to Add to Vercel

### Step 1: Open Your .pem File
1. **Find the downloaded file** (usually named something like `your-app-name.2024-xx-xx.private-key.pem`)
2. **Open with any text editor**:
   - Windows: Notepad, VS Code
   - Mac: TextEdit, VS Code
   - Linux: nano, vim, VS Code

### Step 2: Copy the ENTIRE Content
1. **Select ALL text** (Ctrl+A / Cmd+A)
2. **Copy** (Ctrl+C / Cmd+C)
3. **Include everything**:
   - ✅ `-----BEGIN RSA PRIVATE KEY-----`
   - ✅ All the random characters in between
   - ✅ `-----END RSA PRIVATE KEY-----`

### Step 3: Add to Vercel Environment Variables
1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add new variable**:
   - **Name**: `GITHUB_PRIVATE_KEY`
   - **Value**: Paste the entire .pem file content
   - **Environment**: Production
3. **Click Save**

## 🧪 Test Locally First

Before deploying, test that your key works:

```bash
# Test the GitHub App authentication
node scripts/test-github-app.js YOUR_APP_ID ./path/to/your-file.pem YOUR_INSTALLATION_ID
```

## ⚠️ Common Issues

### "Invalid private key format"
**Problem**: Missing BEGIN/END lines or corrupted content
**Solution**: Re-download the .pem file from GitHub

### "Authentication failed"
**Problem**: Wrong App ID or Installation ID
**Solution**: Double-check the IDs from GitHub App settings

### "Newline issues in Vercel"
**Problem**: Vercel sometimes has issues with newlines
**Solution**: Our code handles this automatically with `.replace(/\\n/g, '\n')`

## 🔐 Security Notes

### DO:
- ✅ Store in Vercel environment variables
- ✅ Keep the .pem file secure locally
- ✅ Use the entire file content including BEGIN/END

### DON'T:
- ❌ Commit .pem files to git
- ❌ Share the private key
- ❌ Store in frontend code
- ❌ Modify the key content

## 📱 Mobile/Web Copy-Paste

If you're having trouble copying the file:

### Option 1: Terminal/Command Line
```bash
# Linux/Mac: Display file content
cat your-app-name.private-key.pem

# Windows: Display file content
type your-app-name.private-key.pem
```

### Option 2: Online Tools (NOT RECOMMENDED for production)
For testing only, you can use online PEM viewers, but **never use these for production keys**.

## ✅ Verification

Your key is correct if:
- ✅ Starts with `-----BEGIN RSA PRIVATE KEY-----`
- ✅ Ends with `-----END RSA PRIVATE KEY-----`
- ✅ Has many lines of random-looking characters
- ✅ Is typically 1600-3200 characters long

The "bunch of RSA fingerprints" you're seeing is exactly what a private key should look like!