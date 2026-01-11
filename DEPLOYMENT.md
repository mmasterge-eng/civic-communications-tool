# Deployment Guide

This guide will help you publish your Contact Your Representatives app to the web.

## Pre-Deployment Checklist

- [ ] API keys configured in `config.js`
- [ ] API keys restricted to your domain in Google Cloud Console
- [ ] `config.js` added to `.gitignore`
- [ ] Tested locally and working
- [ ] Privacy policy reviewed
- [ ] Contact information added (optional)

## Deployment Options

### Option 1: GitHub Pages (Recommended for Free Hosting)

**Pros:** Free, easy, automatic deployment, custom domain support
**Cons:** Code is public (but config.js stays private)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/contact-your-reps.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Click Save

3. **Configure Domain (Optional)**
   - Add custom domain in Pages settings
   - Update DNS records at your domain provider

4. **Update OAuth Redirect URIs**
   - Go to Google Cloud Console → Credentials
   - Add your GitHub Pages URL to authorized JavaScript origins:
     - `https://yourusername.github.io`

5. **Test**
   - Visit: `https://yourusername.github.io/contact-your-reps`

### Option 2: Netlify

**Pros:** Free tier, drag-and-drop deployment, custom domains, environment variables
**Cons:** None for this use case

1. **Create Account**
   - Sign up at [netlify.com](https://netlify.com)

2. **Deploy**
   - Option A: Drag and drop your folder into Netlify
   - Option B: Connect to GitHub repository

3. **Configure Environment Variables** (for better security)
   - Site settings → Environment variables
   - Add your API keys
   - Modify `config.js` to use environment variables:
     ```javascript
     CIVIC_API_KEY: process.env.CIVIC_API_KEY || 'fallback-key',
     ```

4. **Update OAuth**
   - Add Netlify URL to Google Cloud Console authorized origins

5. **Custom Domain** (Optional)
   - Site settings → Domain management
   - Add custom domain

### Option 3: Vercel

**Pros:** Similar to Netlify, great performance
**Cons:** None for this use case

1. **Install Vercel CLI** (Optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   Or use the web interface

3. **Configure**
   - Add environment variables in project settings
   - Update OAuth origins

### Option 4: Traditional Web Hosting

**Pros:** Full control, any domain
**Cons:** Usually costs money, requires more setup

1. **Upload Files**
   - Use FTP/SFTP to upload all files
   - Common hosts: Bluehost, SiteGround, HostGator

2. **Configure**
   - Ensure all files are in public_html or www folder
   - Set proper file permissions (644 for files, 755 for folders)

3. **SSL Certificate**
   - Enable HTTPS (usually free with Let's Encrypt)
   - Required for OAuth to work properly

4. **Update OAuth**
   - Add your domain to authorized origins

## Security Configuration

### Restrict API Keys (IMPORTANT!)

1. **Google Cloud Console**
   - Go to Credentials
   - Click on your API key
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add your domain(s):
       ```
       https://yourdomain.com/*
       https://www.yourdomain.com/*
       ```

2. **API Restrictions**
   - Restrict key to only:
     - Google Civic Information API
     - Gmail API (if using)

### OAuth Configuration

1. **OAuth Consent Screen**
   - User type: External
   - Add app name, support email
   - Add privacy policy URL (see below)
   - Add your domain to Authorized domains

2. **OAuth Client**
   - Authorized JavaScript origins:
     ```
     https://yourdomain.com
     https://www.yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     https://yourdomain.com
     ```

## Privacy Policy

You'll need a privacy policy. Here's a simple template:

```markdown
# Privacy Policy

Last updated: [Date]

This application ("Contact Your Representatives"):

- Does NOT collect personal information
- Does NOT track user activity
- Does NOT store data on servers
- Stores favorites locally in browser only
- Uses Google Civic Information API to find representatives
- Uses Gmail API only when you authorize it
- Only sends emails when you explicitly click "Send"

Google APIs used:
- Google Civic Information API: To retrieve representative data
- Gmail API: To send emails on your behalf (optional)

Data is subject to Google's privacy policies.

Your favorites are stored in browser local storage only.

For questions: [Your email]
```

## Post-Deployment

### Testing

- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Test ZIP code lookup
- [ ] Test email sending (if enabled)
- [ ] Test favorite saving
- [ ] Verify all links work

### Monitoring

1. **Google Cloud Console**
   - Monitor API usage in Quotas section
   - Check for errors in Logs

2. **Browser Console**
   - Check for JavaScript errors
   - Monitor API calls

### Maintenance

- Update API keys if they expire
- Monitor API quota usage
- Keep OAuth consent screen updated
- Update contact information as needed

## Troubleshooting Deployment

### CORS Errors
- Ensure API key restrictions include your domain
- Check OAuth origins match exactly (include https://)

### OAuth Not Working
- Verify authorized origins don't have trailing slashes
- Ensure site is using HTTPS
- Check OAuth consent screen is configured

### API Quota Exceeded
- Check usage in Google Cloud Console
- Consider adding usage limits
- Request quota increase if needed (usually not necessary)

### Mixed Content Warnings
- Ensure all resources load via HTTPS
- No http:// links in HTML/CSS/JS

## Scaling Considerations

If you expect high traffic:

1. **Caching**
   - Cache API responses for same ZIP code
   - Set reasonable cache expiration (1 day)

2. **Rate Limiting**
   - Implement client-side rate limiting
   - Add debouncing to ZIP lookup

3. **CDN**
   - Use a CDN for static assets
   - Cloudflare free tier works well

4. **Analytics** (Optional)
   - Add privacy-focused analytics
   - Plausible or Simple Analytics recommended
   - Avoid Google Analytics for privacy reasons

## Cost Estimates

### Free Tier (Most Users)
- Hosting: $0 (GitHub Pages, Netlify, Vercel)
- APIs: $0 (within Google's free quotas)
- Domain: $10-15/year (optional)

### High Traffic (10,000+ users/month)
- Hosting: Still $0
- APIs: Monitor usage, likely still free
- Domain: Same

Google Civic API: 25,000 requests/day free
Gmail API: Generous free tier

## Going Live Checklist

- [ ] All API keys configured and restricted
- [ ] OAuth configured for production domain
- [ ] Privacy policy published
- [ ] Tested on production URL
- [ ] HTTPS enabled
- [ ] Mobile tested
- [ ] Error handling tested
- [ ] Contact information added
- [ ] Analytics configured (optional)
- [ ] Domain name pointed correctly (if using custom domain)

## Support

After deployment, monitor:
- Google Cloud Console for errors
- Browser console on your deployed site
- User feedback

For issues:
1. Check this guide
2. Review Google Cloud documentation
3. Check browser console for errors
4. Verify API restrictions

---

**Ready to deploy?** Choose your hosting option above and follow the steps!
