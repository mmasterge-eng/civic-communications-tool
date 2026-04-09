// config.js
// Configuration file for My Representatives App

const CONFIG = {
  // Cicero API Key
  CICERO_API_KEY: 'CICERO_API_KEY_PLACEHOLDER',

  // Gmail OAuth Configuration
  GMAIL_CLIENT_ID: 'GMAIL_CLIENT_ID_PLACEHOLDER',

  // Feature Flags
  ENABLE_EMAIL: true,
  ENABLE_FAVORITES: true,

  // Issue Categories for Quick Communication
  ISSUE_CATEGORIES: [
    {
      id: 'economy',
      name: 'Economy & Jobs',
      icon: '💼',
      topics: [
        { id: 'jobs', name: 'Job Creation', subject: 'Constituent Request: Support for Job Creation Initiatives' },
        { id: 'wages', name: 'Minimum Wage', subject: 'Constituent Concern: Minimum Wage Policy' },
        { id: 'inflation', name: 'Inflation & Cost of Living', subject: 'Constituent Concern: Rising Cost of Living' },
        { id: 'taxes', name: 'Tax Policy', subject: 'Constituent Input on Tax Policy' },
        { id: 'small-business', name: 'Small Business Support', subject: 'Request: Support for Small Businesses' }
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: '🏥',
      topics: [
        { id: 'coverage', name: 'Health Insurance Coverage', subject: 'Constituent Concern: Healthcare Coverage' },
        { id: 'costs', name: 'Prescription Drug Costs', subject: 'Request: Lower Prescription Drug Prices' },
        { id: 'mental-health', name: 'Mental Health Services', subject: 'Support Needed: Mental Health Services' },
        { id: 'medicare', name: 'Medicare/Medicaid', subject: 'Constituent Input: Medicare/Medicaid Policy' },
        { id: 'reproductive', name: 'Reproductive Healthcare', subject: 'Constituent Position on Reproductive Healthcare' }
      ]
    },
    {
      id: 'education',
      name: 'Education',
      icon: '📚',
      topics: [
        { id: 'k12-funding', name: 'K-12 School Funding', subject: 'Request: Increased K-12 Education Funding' },
        { id: 'college-costs', name: 'College Affordability', subject: 'Constituent Concern: College Affordability' },
        { id: 'student-loans', name: 'Student Loan Relief', subject: 'Request: Student Loan Relief Measures' },
        { id: 'teachers', name: 'Teacher Pay & Support', subject: 'Support for Teachers and Educators' },
        { id: 'curriculum', name: 'School Curriculum', subject: 'Constituent Input on Education Curriculum' }
      ]
    },
    {
      id: 'environment',
      name: 'Environment & Climate',
      icon: '🌍',
      topics: [
        { id: 'climate', name: 'Climate Change Action', subject: 'Urgent: Support Climate Action Now' },
        { id: 'clean-energy', name: 'Clean Energy', subject: 'Request: Support for Clean Energy Initiatives' },
        { id: 'pollution', name: 'Air & Water Quality', subject: 'Constituent Concern: Environmental Pollution' },
        { id: 'conservation', name: 'Conservation & Parks', subject: 'Support for Conservation Efforts' },
        { id: 'wildlife', name: 'Wildlife Protection', subject: 'Request: Protect Endangered Species' }
      ]
    },
    {
      id: 'safety',
      name: 'Public Safety',
      icon: '🛡️',
      topics: [
        { id: 'gun-safety', name: 'Gun Safety Laws', subject: 'Constituent Position on Gun Safety Legislation' },
        { id: 'police-reform', name: 'Police Reform', subject: 'Request: Support Police Reform Measures' },
        { id: 'crime', name: 'Crime Prevention', subject: 'Constituent Concern: Community Safety' },
        { id: 'emergency', name: 'Emergency Services', subject: 'Support for Emergency Services Funding' },
        { id: 'domestic-violence', name: 'Domestic Violence', subject: 'Support for Domestic Violence Prevention' }
      ]
    },
    {
      id: 'immigration',
      name: 'Immigration',
      icon: '🗽',
      topics: [
        { id: 'reform', name: 'Immigration Reform', subject: 'Constituent Input: Immigration Reform' },
        { id: 'border', name: 'Border Policy', subject: 'Constituent Position on Border Policy' },
        { id: 'dreamers', name: 'DACA/Dreamers', subject: 'Request: Protect DACA Recipients' },
        { id: 'asylum', name: 'Asylum & Refugees', subject: 'Constituent Position on Asylum Policy' },
        { id: 'visas', name: 'Visa Programs', subject: 'Input on Immigration Visa Programs' }
      ]
    },
    {
      id: 'civil-rights',
      name: 'Civil Rights',
      icon: '⚖️',
      topics: [
        { id: 'voting', name: 'Voting Rights', subject: 'Protect Voting Rights for All Citizens' },
        { id: 'equality', name: 'Equal Rights', subject: 'Support for Equal Rights Legislation' },
        { id: 'lgbtq', name: 'LGBTQ+ Rights', subject: 'Constituent Position on LGBTQ+ Rights' },
        { id: 'disability', name: 'Disability Rights', subject: 'Support for Disability Rights & Access' },
        { id: 'discrimination', name: 'Anti-Discrimination', subject: 'Request: Strengthen Anti-Discrimination Laws' }
      ]
    },
    {
      id: 'housing',
      name: 'Housing',
      icon: '🏠',
      topics: [
        { id: 'affordability', name: 'Affordable Housing', subject: 'Urgent: Affordable Housing Crisis' },
        { id: 'homelessness', name: 'Homelessness', subject: 'Request: Address Homelessness in Our Community' },
        { id: 'rent', name: 'Rent Control', subject: 'Constituent Position on Rent Control' },
        { id: 'homeownership', name: 'First-Time Homebuyer Support', subject: 'Support for First-Time Homebuyers' },
        { id: 'zoning', name: 'Zoning & Development', subject: 'Constituent Input on Housing Development' }
      ]
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: '🛣️',
      topics: [
        { id: 'roads', name: 'Roads & Bridges', subject: 'Request: Infrastructure Investment Needed' },
        { id: 'transit', name: 'Public Transit', subject: 'Support for Public Transportation' },
        { id: 'broadband', name: 'Broadband Internet', subject: 'Request: Expand Broadband Access' },
        { id: 'utilities', name: 'Water & Utilities', subject: 'Constituent Concern: Utility Infrastructure' },
        { id: 'airports', name: 'Transportation Hubs', subject: 'Input on Transportation Infrastructure' }
      ]
    },
    {
      id: 'veterans',
      name: 'Veterans & Military',
      icon: '🎖️',
      topics: [
        { id: 'va-services', name: 'VA Healthcare', subject: 'Improve VA Healthcare Services' },
        { id: 'benefits', name: 'Veteran Benefits', subject: 'Support for Veteran Benefits' },
        { id: 'housing-vets', name: 'Veteran Housing', subject: 'Address Veteran Homelessness' },
        { id: 'jobs-vets', name: 'Veteran Employment', subject: 'Support Veteran Job Programs' },
        { id: 'mental-health-vets', name: 'Veteran Mental Health', subject: 'Urgent: Veteran Mental Health Support' }
      ]
    },
    {
      id: 'seniors',
      name: 'Seniors & Aging',
      icon: '👴',
      topics: [
        { id: 'social-security', name: 'Social Security', subject: 'Protect Social Security Benefits' },
        { id: 'elder-care', name: 'Elder Care Services', subject: 'Support for Senior Care Programs' },
        { id: 'nursing-homes', name: 'Nursing Home Standards', subject: 'Improve Nursing Home Oversight' },
        { id: 'senior-housing', name: 'Senior Housing', subject: 'Affordable Senior Housing Needed' },
        { id: 'scams', name: 'Elder Fraud Protection', subject: 'Protect Seniors from Financial Scams' }
      ]
    },
    {
      id: 'local',
      name: 'Local Issues',
      icon: '🏘️',
      topics: [
        { id: 'pothole', name: 'Road Repairs', subject: 'Road Repair Needed in My Area' },
        { id: 'parks', name: 'Parks & Recreation', subject: 'Request: Park Improvements' },
        { id: 'trash', name: 'Waste & Recycling', subject: 'Constituent Input on Waste Services' },
        { id: 'noise', name: 'Noise Complaints', subject: 'Community Noise Concern' },
        { id: 'business', name: 'Local Business Issues', subject: 'Local Business Concern' }
      ]
    }
  ],

  // Email Templates
  EMAIL_TEMPLATES: {
    general: {
      subject: 'Constituent Concern Regarding [Your Issue]',
      body: `Dear [Representative Name],

I am writing to you as your constituent regarding [describe your concern].

[Explain your position and why this matters to you]

I urge you to [your request - vote for/against, support, investigate, etc.].

Thank you for your time and consideration.`
    },
    support: {
      subject: 'Support for [Bill Number/Issue]',
      body: `Dear [Representative Name],

I am writing to express my strong support for [Bill Number/Issue Name].

[Explain why you support this legislation and how it affects you or your community]

I urge you to vote in favor of this important legislation.

Thank you for your service.`
    },
    oppose: {
      subject: 'Opposition to [Bill Number/Issue]',
      body: `Dear [Representative Name],

I am writing to express my strong opposition to [Bill Number/Issue Name].

[Explain your concerns and how this legislation would negatively impact you or your community]

I urge you to vote against this legislation.

Thank you for considering my concerns.`
    },
    'local-issue': {
      subject: 'Local Concern: [Brief Description]',
      body: `Dear [Representative Name],

I am a resident and I am writing to bring your attention to a local issue that affects our community: [describe the issue].

[Explain the problem, its impact, and what you'd like to see done]

I would appreciate your assistance in addressing this matter.

Thank you for your attention to this important local issue.`
    },
    'thank-you': {
      subject: 'Thank You for Your Support of [Issue]',
      body: `Dear [Representative Name],

I wanted to take a moment to thank you for your support of [issue/bill/action].

[Explain why this matters to you and the positive impact]

Your leadership on this issue is greatly appreciated.`
    },
    'issue-specific': {
      subject: '[ISSUE_SUBJECT]',
      body: `Dear [Representative Name],

I am writing to you as your constituent about [ISSUE_NAME].

As someone who lives in your district, this issue directly affects me and my community. [Add your personal story or specific concerns here]

I would appreciate knowing your position on this matter and what actions you plan to take.

Thank you for representing us and for your attention to this important issue.`
    }
  }
};
