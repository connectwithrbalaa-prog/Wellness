# Email & AI Features Setup Guide

This guide covers setting up two key features in your Liver Wellness Portal:
1. **Email Functionality** - Send patient reports via email using Resend
2. **AI-Powered Explanations** (Optional) - Generate patient-friendly report explanations using OpenAI

---

## Part 1: Email Functionality (Required)

The email functionality uses **Resend** - a modern, reliable email API service.

### What It Does

When a doctor approves a patient report, they can click "Email to Patient" to automatically send:
- Professionally formatted report with branding
- Full medical analysis and recommendations
- Clinical disclaimers
- Contact information

---

### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click **"Sign Up"** (free to start)
3. Verify your email address
4. Complete onboarding

**Free Tier Includes:**
- 100 emails per day
- 3,000 emails per month
- Perfect for testing and small clinics

---

### Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Click **"API Keys"** in left sidebar
3. Click **"Create API Key"**
4. Name it "Liver Wellness Portal"
5. Select permissions: **"Sending access"**
6. Click **"Add"**
7. **COPY THE API KEY** (you'll only see it once!)

Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 3: Configure Your Sending Domain

#### Option A: Use Resend's Subdomain (Easiest - 5 minutes)

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourclinic.com`)
4. Resend suggests using subdomain like `mail.yourclinic.com`
5. Copy the DNS records provided
6. Add records to your domain's DNS settings (via your registrar)
7. Wait 5-15 minutes for DNS propagation
8. Click **"Verify"** in Resend

#### Option B: Use Existing Domain

Same process but requires more DNS records. Follow Resend's instructions.

---

### Step 4: Update Sender Email in Code

1. Open: `supabase/functions/send-patient-report/index.ts`
2. Find line 126:
   ```typescript
   from: 'Liver Wellness Portal <noreply@yourdomain.com>',
   ```
3. Replace with your verified domain:
   ```typescript
   from: 'Liver Wellness Portal <noreply@yourclinic.com>',
   ```
4. Save the file

---

### Step 5: Add API Key to Supabase

#### Using Supabase Dashboard:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"Project Settings"** (gear icon)
4. Click **"Edge Functions"**
5. Scroll to **"Manage secrets"**
6. Click **"Add new secret"**
7. Add:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
8. Click **"Save"**

#### Using Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

---

### Step 6: Redeploy Edge Function (If You Updated Code)

If you changed the sender email:

```bash
supabase functions deploy send-patient-report
```

The function is already deployed - it will automatically use the new secret.

---

### Step 7: Test Email Functionality

1. Log in to your portal
2. Create test patient with valid email
3. Create visit and generate report
4. Approve the report
5. Click **"Email to Patient"**
6. Check inbox (and spam folder)

---

## Part 2: AI-Powered Explanations (Optional Enhancement)

This feature generates simplified, patient-friendly explanations of medical reports.

### What It Does

- Converts technical medical data into easy-to-understand language
- Uses OpenAI's GPT-4o-mini (cost-effective)
- Falls back to template-based explanations if not configured
- Provides compassionate, motivational guidance
- **Requires doctor review before sharing**

### Benefits

- Improved patient understanding
- Better patient engagement
- Reduced patient anxiety
- More effective communication

---

### AI Setup Step 1: Create OpenAI Account

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Click **"Sign Up"**
3. Verify your email
4. Add payment method (required for API access)

**Pricing:**
- GPT-4o-mini: $0.150 per 1M input tokens, $0.600 per 1M output tokens
- Typical cost: ~$0.002-0.005 per report explanation
- Very affordable for medical practices

---

### AI Setup Step 2: Get OpenAI API Key

1. Log in to OpenAI Platform
2. Click **"API Keys"** in left sidebar
3. Click **"Create new secret key"**
4. Name it "Liver Wellness Portal"
5. **COPY THE KEY** (you'll only see it once!)

Format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### AI Setup Step 3: Add API Key to Supabase

#### Using Supabase Dashboard:

1. Go to your Supabase project settings
2. Navigate to **Edge Functions** → **Manage secrets**
3. Click **"Add new secret"**
4. Add:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
5. Click **"Save"**

#### Using Supabase CLI:

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-your_actual_api_key_here
```

---

### AI Setup Step 4: Test AI Explanations

1. Generate a new patient report
2. The system will automatically use AI for explanations
3. Review the generated patient-friendly text
4. Doctor must review and approve before sharing

**Note:** If OpenAI key is not configured, the system automatically falls back to template-based explanations (still functional, just less personalized).

---

## Troubleshooting

### Email Issues

#### "Email service not configured" Error

**Problem**: RESEND_API_KEY not set

**Solution**:
- Check secret name is exactly `RESEND_API_KEY` (case-sensitive)
- Wait 1-2 minutes after adding for propagation
- Verify in Supabase dashboard under Edge Functions secrets

#### "Failed to send email" Error

**Possible causes:**
1. Invalid API key
2. Domain not verified
3. Sending limit exceeded

**Solution**:
- Check Resend dashboard for error logs
- Verify domain shows as "Verified"
- Check sending limits (free tier: 100/day)

#### Email Goes to Spam

**Problem**: Email authentication not configured

**Solution**:
- Ensure all DNS records added (SPF, DKIM, DMARC)
- Wait 24-48 hours for full DNS propagation
- Test with different email providers

---

### AI Explanation Issues

#### Using Template Instead of AI

**Problem**: OpenAI key not configured or invalid

**Solution**:
- Check `OPENAI_API_KEY` is set correctly
- Verify key is active in OpenAI dashboard
- Check OpenAI account has available credits
- Review edge function logs in Supabase

#### AI Generation Too Slow

**Problem**: Network latency or token limits

**Solution**:
- GPT-4o-mini is optimized for speed (typically 2-5 seconds)
- Check OpenAI API status
- Review token limits in your OpenAI account

#### AI Content Not Appropriate

**Problem**: Prompt needs adjustment

**Solution**:
- Edit the prompt in `supabase/functions/generate-patient-explanation/index.ts`
- Adjust temperature parameter (lower = more conservative)
- Add specific guidelines to the system prompt

---

## Production Checklist

### Email Functionality

- [ ] Resend account created and verified
- [ ] API key generated and stored
- [ ] Custom domain added and verified
- [ ] All DNS records added (SPF, DKIM, DMARC)
- [ ] Sender email updated in code
- [ ] RESEND_API_KEY added to Supabase
- [ ] Edge function deployed
- [ ] Test email sent successfully
- [ ] Email not going to spam
- [ ] Content reviewed and approved

### AI Explanations (Optional)

- [ ] OpenAI account created with payment method
- [ ] API key generated
- [ ] OPENAI_API_KEY added to Supabase
- [ ] Test explanation generated
- [ ] Content quality reviewed
- [ ] Doctor review process established
- [ ] Fallback template tested

---

## Cost Management

### Email Costs (Resend)

- **Free**: 100 emails/day, 3,000/month - Perfect for small clinics
- **Pro ($20/mo)**: 50,000 emails/month
- **Business ($80/mo)**: 100,000 emails/month

### AI Costs (OpenAI - Optional)

- **GPT-4o-mini**: ~$0.002-0.005 per explanation
- **Monthly estimate**:
  - 100 reports/month = $0.20-0.50
  - 500 reports/month = $1.00-2.50
  - 1000 reports/month = $2.00-5.00

Very affordable for the value provided!

---

## Security Best Practices

1. **Never commit API keys to Git** - Always use environment variables
2. **Use Edge Functions** - Never expose keys in frontend code
3. **Enable JWT verification** - Functions protected by Supabase auth
4. **Monitor usage** - Check dashboards regularly
5. **Rotate keys periodically** - Every 6-12 months
6. **Set spending limits** - Configure in OpenAI dashboard
7. **Review audit logs** - Track all email sends and AI generations

---

## Alternative Services

### Email Alternatives to Resend

- **SendGrid** - Popular enterprise solution
- **AWS SES** - If you're on AWS
- **Mailgun** - Another reliable option
- **Postmark** - Excellent for transactional emails

Edge function would need modifications. Let me know if you need help!

### AI Alternatives to OpenAI

- **Anthropic Claude** - High quality, similar pricing
- **Google Gemini** - Good for cost optimization
- **Local LLMs** - For complete data privacy (slower, requires setup)

---

## Quick Start Summary

### For Email (Required):

1. Sign up at resend.com
2. Get API key
3. Verify your domain
4. Update sender email in code (line 126 of send-patient-report/index.ts)
5. Add `RESEND_API_KEY` to Supabase secrets
6. Test!

### For AI (Optional):

1. Sign up at platform.openai.com
2. Add payment method
3. Get API key
4. Add `OPENAI_API_KEY` to Supabase secrets
5. Test!

**Total setup time:**
- Email only: 15-30 minutes
- Email + AI: 30-45 minutes

---

## Support Resources

- **Resend Docs**: [https://resend.com/docs](https://resend.com/docs)
- **OpenAI Docs**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Supabase Edge Functions**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **DNS Help**: Contact your domain registrar

---

## Summary

Both edge functions are already deployed and ready:
- ✅ `send-patient-report` - Deployed
- ✅ `generate-patient-explanation` - Deployed

You just need to:
1. Configure Resend (required for email)
2. Configure OpenAI (optional for AI explanations)

The system works without AI (uses template), but AI provides better patient experience!
