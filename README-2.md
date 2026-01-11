# Contact Your Representatives

A web application that makes it easy for citizens to find and contact their elected officials at the federal, state, and local levels.

## Features

- 🔍 **Find Representatives by ZIP Code** - Quickly look up all your elected officials
- 📧 **Email Directly** - Compose and send messages right from the app
- 📞 **Multiple Contact Methods** - Email, phone, website, and social media links
- ⭐ **Save Favorites** - Keep track of representatives you contact frequently
- 📝 **Email Templates** - Start with pre-written templates for common issues
- 📱 **Mobile Responsive** - Works great on phones, tablets, and desktops
- 🔒 **Privacy First** - All data stays in your browser, nothing stored on servers

## Quick Start

### 1. Get API Keys

#### Google Civic Information API (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Civic Information API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

#### Gmail API (Optional - for sending emails)
1. In the same Google Cloud project
2. Enable the **Gmail API**
3. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Configure consent screen if prompted
5. Choose **Web application** as application type
6. Add authorized JavaScript origins: `http://localhost` and your domain
7. Copy the Client ID

### 2. Configure the App

1. Open `config.js`
2. Replace the placeholder values:

```javascript
const CONFIG = {
  CIVIC_API_KEY: 'your-actual-civic-api-key',
  GMAIL_OAUTH_CLIENT_ID: 'your-actual-oauth-client-id',
  GMAIL_API_KEY: 'your-actual-gmail-api-key',
  
  ENABLE_EMAIL: true,
  ENABLE_FAVORITES: true
};
```

3. Save the file

### 3. Run the App

#### Option A: Local Development
1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js
   npx serve
   ```
3. Open `http://localhost:8000`

#### Option B: Deploy to Web
Upload all files to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Your own server

## Usage Guide

### Finding Your Representatives

1. Enter your 5-digit ZIP code
2. Click "Find My Reps"
3. View your representatives organized by:
   - Federal (President, Senators, House Representative)
   - State (Governor, State Legislators)
   - Local (Mayor, Council Members, etc.)

### Contacting Representatives

#### Send Email
1. Click "Send Email" on any representative card
2. Choose a template or write your own message
3. Fill in subject and body
4. Click "Send Email"

**Tips for effective emails:**
- Be clear and concise
- State your position early
- Include specific bill numbers if applicable
- Share personal stories or local impact
- Be respectful and professional
- Include your contact information

#### Call
- Click the "Call" button to dial directly (on mobile)
- Or copy the phone number displayed

#### Visit Website or Social Media
- Click the website button to visit their official page
- Click social media links to connect on Twitter, Facebook, etc.

### Saving Favorites

Click the star (☆) on any representative to save them to your favorites for quick access.

## File Structure

```
contact-your-reps/
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Application logic
├── config.js           # API configuration (DO NOT COMMIT WITH REAL KEYS)
├── README.md           # This file
└── .gitignore          # Prevents committing sensitive files
```

## Security Best Practices

### Before Publishing

1. **Never commit API keys to version control**
   - Add `config.js` to `.gitignore`
   - Use environment variables for production

2. **Restrict API Keys**
   - In Google Cloud Console, restrict your API keys:
   - Add HTTP referrer restrictions (your domain only)
   - Limit to specific APIs

3. **OAuth Settings**
   - Add only trusted domains to authorized JavaScript origins
   - Configure OAuth consent screen properly

### Example .gitignore

```
# API Configuration
config.js

# OS Files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
```

## Customization

### Disable Features

In `config.js`:
```javascript
ENABLE_EMAIL: false,     // Disable email functionality
ENABLE_FAVORITES: false, // Disable favorites feature
```

### Add Email Templates

In `config.js`, add to `EMAIL_TEMPLATES`:
```javascript
'custom-template': {
  subject: 'Your Subject',
  body: `Your message template...`
}
```

### Styling

Edit `style.css` to customize:
- Colors (search for hex codes like `#667eea`)
- Fonts (change `font-family` values)
- Layout (modify padding, margins, max-width)

## Browser Support

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Optimized

## Troubleshooting

### "Configuration Required" message
- Make sure you've added your API keys to `config.js`
- Check that the keys are not the placeholder text

### Can't find representatives
- Verify your ZIP code is valid
- Check that Civic Information API is enabled in Google Cloud
- Verify API key restrictions allow your domain

### Email not sending
- Make sure you've authorized Gmail (click the button)
- Check that Gmail API is enabled
- Verify OAuth client ID is correct
- Try the mailto fallback if Gmail API fails

### Representatives missing contact info
- Some officials don't provide all contact methods to the API
- Use the website link to find additional contact information

## API Limits

### Google Civic Information API
- Free tier: 25,000 requests/day
- Should be more than enough for personal use
- Consider caching results if deploying publicly

### Gmail API
- Free tier: Generous limits for personal use
- Rate limits apply to prevent spam

## Contributing

Suggestions for improvements:
1. Add bill tracking integration
2. Add legislative voting records
3. Create shareable action campaigns
4. Add multi-language support
5. Integration with other civic APIs

## Privacy Policy

This app:
- Does NOT collect or store personal information
- Does NOT track usage
- Stores favorites locally in browser only
- Only uses Gmail API when you explicitly authorize it
- Only sends emails when you click "Send"

All data stays in your browser. When you close the tab, only your favorites (if enabled) persist in local storage.

## License

MIT License - feel free to modify and distribute.

## Acknowledgments

- Data provided by [Google Civic Information API](https://developers.google.com/civic-information)
- Built to empower civic engagement and democratic participation

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Google Cloud Console for API errors
3. Check browser console for error messages

---

**Remember:** Your voice matters. Use this tool to stay engaged with your representatives on issues that matter to you! 🗳️
