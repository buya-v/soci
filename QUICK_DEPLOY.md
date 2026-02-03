# 🚀 Quick Deployment Guide

## Step 1: Install & Generate Password

```bash
npm install
node scripts/generate-password-hash.js MySecurePassword123
```

Copy the generated hash.

## Step 2: Vercel Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

```bash
PASSWORD_HASH=<paste your hash>
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ALLOWED_ORIGIN=https://your-app.vercel.app
```

## Step 3: Deploy

```bash
git add .
git commit -m "Security improvements implemented"
git push origin main
```

## Step 4: Test

1. Login with your new password
2. Generate AI content
3. Verify no API keys in browser DevTools

## Done! 🎉

For full details, see `SECURITY_IMPROVEMENTS.md`
