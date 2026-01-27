# Deployment Guide

This guide will help you deploy your Liver Wellness application to Vercel so it can be accessed by anyone via a public URL.

## Prerequisites

1. A GitHub account (free) - [Sign up here](https://github.com/join)
2. A Vercel account (free) - [Sign up here](https://vercel.com/signup)

## Step 1: Push Your Code to GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., "liver-wellness-app")
4. Choose "Private" or "Public" (your choice)
5. Click "Create repository"

6. In your terminal/command prompt, run these commands from your project directory:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
   - If this is your first time, you'll need to authorize Vercel to access your GitHub account
   - Select the repository you just created
4. Configure your project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)

5. **Add Environment Variables** (CRITICAL):
   Click "Environment Variables" and add:

   - Variable name: `VITE_SUPABASE_URL`
     Value: `https://akpshqlrletntfxjhzfo.supabase.co`

   - Variable name: `VITE_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcHNocWxybGV0bnRmeGpoemZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDQ0NTYsImV4cCI6MjA4NTA4MDQ1Nn0.UW4mwR7buySVEqHMJIyVB_xFpKfruvJ3ONEOkA1WDvU`

6. Click "Deploy"

Vercel will now build and deploy your application. This usually takes 1-2 minutes.

## Step 3: Access Your Live Application

Once deployment is complete, Vercel will provide you with a URL like:

```
https://your-app-name.vercel.app
```

You can now share this URL with anyone, and they'll be able to access your application from anywhere in the world.

## Step 4: Update Supabase Configuration (IMPORTANT)

To ensure your application works correctly in production, you need to add your Vercel domain to Supabase's allowed URLs:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel URL to the **Site URL** field:
   - Example: `https://your-app-name.vercel.app`
5. Add your Vercel URL to the **Redirect URLs** list:
   - Example: `https://your-app-name.vercel.app/**`
6. Click "Save"

## Making Updates

Whenever you make changes to your code:

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push
   ```

2. Vercel will automatically detect the changes and redeploy your application

## Custom Domain (Optional)

If you want to use your own domain name (e.g., `liverwellness.com`):

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions provided by Vercel

## Troubleshooting

**Build Fails:**
- Check the build logs in Vercel dashboard
- Ensure all environment variables are set correctly

**App Loads But Login Doesn't Work:**
- Verify you've added your Vercel URL to Supabase's allowed URLs (Step 4)
- Check that environment variables are set correctly in Vercel

**Database Connection Issues:**
- Confirm your Supabase environment variables are correct
- Check that your Supabase project is active and accessible

## Support

If you encounter any issues during deployment, you can:
- Check Vercel's [documentation](https://vercel.com/docs)
- Check Supabase's [documentation](https://supabase.com/docs)
- Review build logs in the Vercel dashboard for error messages
