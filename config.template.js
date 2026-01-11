// config.template.js
// 
// INSTRUCTIONS:
// 1. Copy this file and rename it to "config.js"
// 2. Fill in your actual API keys (see README.md for how to get them)
// 3. Never commit config.js with real keys to version control
// 4. Keep config.template.js as a reference

const CONFIG = {
  // ========================================
  // REQUIRED: Google Civic Information API Key
  // ========================================
  // Get it from: https://console.cloud.google.com/
  // 1. Create a project
  // 2. Enable "Google Civic Information API"
  // 3. Create an API key
  CIVIC_API_KEY: 'AIzaSyBr-fZ_DbkMib5W5znWQwMd2QcEa-0qQcU',
  
  // ========================================
  // OPTIONAL: Gmail API Configuration
  // ========================================
  // Only needed if you want to send emails through Gmail
  // Get from: https://console.cloud.google.com/apis/credentials
  GMAIL_OAUTH_CLIENT_ID: 'YOUR_OAUTH_CLIENT_ID_HERE',
  GMAIL_API_KEY: 'YOUR_GMAIL_API_KEY_HERE',
  
  // ========================================
  // Feature Flags
  // ========================================
  ENABLE_EMAIL: true,        // Set to false to disable email features entirely
  ENABLE_FAVORITES: true,     // Set to false to disable favorites
  
  // ========================================
  // Email Templates
  // ========================================
  // You can customize these or add your own
  EMAIL_TEMPLATES: {
    general: {
      subject: 'Constituent Concern Regarding [Your Issue]',
      body: `Dear [Representative Name],

I am writing to you as your constituent from [City, State ZIP] regarding [describe your concern].

[Explain your position and why this matters to you]

I urge you to [your request - vote for/against, support, investigate, etc.].

Thank you for your time and consideration.

Sincerely,
[Your Name]
[Your Address]
[Your Email]
[Your Phone]`
    },
    support: {
      subject: 'Support for [Bill Number/Issue]',
      body: `Dear [Representative Name],

I am writing to express my strong support for [Bill Number/Issue Name].

[Explain why you support this legislation and how it affects you or your community]

I urge you to vote in favor of this important legislation.

Thank you for your service.

Sincerely,
[Your Name]
[Your City, State ZIP]`
    },
    oppose: {
      subject: 'Opposition to [Bill Number/Issue]',
      body: `Dear [Representative Name],

I am writing to express my strong opposition to [Bill Number/Issue Name].

[Explain your concerns and how this legislation would negatively impact you or your community]

I urge you to vote against this legislation.

Thank you for considering my concerns.

Sincerely,
[Your Name]
[Your City, State ZIP]`
    },
    'local-issue': {
      subject: 'Local Concern: [Brief Description]',
      body: `Dear [Representative Name],

I am a resident of [City/Town] and I am writing to bring your attention to a local issue that affects our community: [describe the issue].

[Explain the problem, its impact, and what you'd like to see done]

I would appreciate your assistance in addressing this matter.

Thank you for your attention to this important local issue.

Sincerely,
[Your Name]
[Your Address]`
    },
    'thank-you': {
      subject: 'Thank You for Your Support of [Issue]',
      body: `Dear [Representative Name],

I wanted to take a moment to thank you for your support of [issue/bill/action].

[Explain why this matters to you and the positive impact]

Your leadership on this issue is greatly appreciated.

Sincerely,
[Your Name]
[Your City, State ZIP]`
    }
  }
};

// Validate configuration on load
function validateConfig() {
  const missing = [];
  
  if (!CONFIG.CIVIC_API_KEY || CONFIG.CIVIC_API_KEY === 'YOUR_GOOGLE_CIVIC_API_KEY_HERE') {
    missing.push('Google Civic Information API Key');
  }
  
  if (CONFIG.ENABLE_EMAIL) {
    if (!CONFIG.GMAIL_OAUTH_CLIENT_ID || CONFIG.GMAIL_OAUTH_CLIENT_ID === 'YOUR_OAUTH_CLIENT_ID_HERE') {
      missing.push('Gmail OAuth Client ID (or disable email feature)');
    }
    if (!CONFIG.GMAIL_API_KEY || CONFIG.GMAIL_API_KEY === 'YOUR_GMAIL_API_KEY_HERE') {
      missing.push('Gmail API Key (or disable email feature)');
    }
  }
  
  return missing;
}
