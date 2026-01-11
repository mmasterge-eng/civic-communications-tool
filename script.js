// script.js - Main Application Logic

// Global state
let allReps = [];
let currentRecipient = null;
let isGmailAuthorized = false;

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  // Check configuration
  const missingConfig = validateConfig();
  if (missingConfig.length > 0) {
    showConfigNotice(missingConfig);
    return;
  }
  
  // Initialize event listeners
  document.getElementById('findBtn').addEventListener('click', findRepresentatives);
  document.getElementById('zipInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') findRepresentatives();
  });
  
  document.getElementById('send-email-btn').addEventListener('click', sendEmail);
  document.getElementById('email-template').addEventListener('change', applyEmailTemplate);
  
  // Load favorites on startup
  if (CONFIG.ENABLE_FAVORITES) {
    loadFavorites();
  }
  
  console.log('✅ App initialized');
});

// === Google API Setup ===
function handleClientLoad() {
  if (!CONFIG.ENABLE_EMAIL) {
    console.log('Email features disabled');
    return;
  }
  
  console.log('Loading Google API client...');
  gapi.load('client:auth2', initGmailClient);
}

async function initGmailClient() {
  try {
    await gapi.client.init({
      apiKey: CONFIG.GMAIL_API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest']
    });
    
    const auth = await gapi.auth2.init({
      client_id: CONFIG.GMAIL_OAUTH_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.send'
    });
    
    auth.isSignedIn.listen(updateAuthStatus);
    updateAuthStatus(auth.isSignedIn.get());
    
    document.getElementById('authorize-button').onclick = () => auth.signIn();
    document.getElementById('auth-section').style.display = 'block';
    
    console.log('✅ Gmail API initialized');
  } catch (error) {
    console.error('Gmail API initialization failed:', error);
    showError('Gmail setup failed. Email features will be unavailable.');
  }
}

function updateAuthStatus(isSignedIn) {
  isGmailAuthorized = isSignedIn;
  const authSection = document.getElementById('auth-section');
  if (authSection) {
    authSection.style.display = isSignedIn ? 'none' : 'block';
  }
  console.log('Gmail authorization status:', isSignedIn);
}

// === Configuration Notice ===
function showConfigNotice(missing) {
  const notice = document.getElementById('config-notice');
  notice.innerHTML = `
    <strong>⚠️ Configuration Required</strong>
    <p>Please configure the following in <code>config.js</code>:</p>
    <ul>
      ${missing.map(item => `<li>${item}</li>`).join('')}
    </ul>
    <p>See <code>README.md</code> for detailed setup instructions.</p>
  `;
  notice.style.display = 'block';
}

// === Find Representatives ===
async function findRepresentatives() {
  const zip = document.getElementById('zipInput').value.trim();
  
  if (!/^\d{5}$/.test(zip)) {
    showError('Please enter a valid 5-digit ZIP code.');
    return;
  }
  
  showLoading(true);
  clearError();
  hideAllSections();
  
  try {
    const url = `https://www.googleapis.com/civicinfo/v2/representatives?key=${CONFIG.CIVIC_API_KEY}&address=${zip}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    allReps = processRepresentatives(data);
    displayRepresentatives(allReps);
    
  } catch (error) {
    console.error('Error fetching representatives:', error);
    showError('Unable to find representatives. Please check your ZIP code and try again.');
  } finally {
    showLoading(false);
  }
}

// === Process API Data ===
function processRepresentatives(data) {
  const reps = [];
  
  if (!data.offices || !data.officials) {
    return reps;
  }
  
  data.offices.forEach(office => {
    office.officialIndices.forEach(index => {
      const official = data.officials[index];
      
      reps.push({
        name: official.name,
        office: office.name,
        party: official.party || 'Unknown',
        photo: official.photoUrl || '',
        phones: official.phones || [],
        emails: official.emails || [],
        urls: official.urls || [],
        channels: official.channels || [],
        address: official.address?.[0] || null,
        level: determineLevel(office.name),
        division: office.divisionId || ''
      });
    });
  });
  
  return reps;
}

function determineLevel(officeName) {
  const lower = officeName.toLowerCase();
  
  if (lower.includes('president') || lower.includes('senate') || 
      lower.includes('representative') && lower.includes('u.s.')) {
    return 'federal';
  }
  
  if (lower.includes('governor') || lower.includes('state senate') || 
      lower.includes('state house') || lower.includes('state representative')) {
    return 'state';
  }
  
  return 'local';
}

// === Display Representatives ===
function displayRepresentatives(reps) {
  const federal = reps.filter(r => r.level === 'federal');
  const state = reps.filter(r => r.level === 'state');
  const local = reps.filter(r => r.level === 'local');
  
  if (federal.length > 0) {
    displayRepGroup('federal', federal);
    document.getElementById('federal-section').style.display = 'block';
  }
  
  if (state.length > 0) {
    displayRepGroup('state', state);
    document.getElementById('state-section').style.display = 'block';
  }
  
  if (local.length > 0) {
    displayRepGroup('local', local);
    document.getElementById('local-section').style.display = 'block';
  }
  
  if (CONFIG.ENABLE_FAVORITES) {
    displayFavorites();
  }
}

function displayRepGroup(groupId, reps) {
  const container = document.getElementById(`${groupId}-reps`);
  container.innerHTML = '';
  
  reps.forEach(rep => {
    container.appendChild(createRepCard(rep));
  });
}

function createRepCard(rep) {
  const card = document.createElement('div');
  card.className = 'rep-card';
  
  const isFavorite = isFavorited(rep);
  
  card.innerHTML = `
    <div class="rep-header">
      ${createPhotoElement(rep)}
      <div class="rep-info">
        <div class="rep-name">${rep.name}</div>
        <span class="rep-party party-${rep.party}">${rep.party}</span>
        <div class="rep-office">${rep.office}</div>
      </div>
    </div>
    
    ${createContactMethods(rep)}
    
    <div class="actions">
      ${rep.emails && rep.emails.length > 0 ? 
        `<button class="action-btn primary" onclick="openEmailModal('${escapeHtml(JSON.stringify(rep))}')">
          ✉️ Send Email
        </button>` : ''}
      ${rep.phones && rep.phones.length > 0 ? 
        `<button class="action-btn" onclick="callRep('${rep.phones[0]}')">
          📞 Call ${rep.phones[0]}
        </button>` : ''}
      ${rep.urls && rep.urls.length > 0 ? 
        `<button class="action-btn" onclick="window.open('${rep.urls[0]}', '_blank')">
          🌐 Website
        </button>` : ''}
    </div>
    
    ${CONFIG.ENABLE_FAVORITES ? 
      `<button class="favorite-btn ${isFavorite ? 'favorited' : ''}" 
              onclick="toggleFavorite('${escapeHtml(JSON.stringify(rep))}')"
              title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
        ${isFavorite ? '⭐' : '☆'}
      </button>` : ''}
  `;
  
  return card;
}

function createPhotoElement(rep) {
  if (rep.photo) {
    return `<img src="${rep.photo}" alt="${rep.name}" class="rep-photo" onerror="this.outerHTML=createPlaceholder('${rep.name}')">`;
  } else {
    return createPlaceholder(rep.name);
  }
}

function createPlaceholder(name) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
  return `<div class="rep-photo placeholder">${initials}</div>`;
}

function createContactMethods(rep) {
  const methods = [];
  
  if (rep.emails && rep.emails.length > 0) {
    methods.push(`<div class="contact-item">📧 <a href="mailto:${rep.emails[0]}">${rep.emails[0]}</a></div>`);
  }
  
  if (rep.phones && rep.phones.length > 0) {
    methods.push(`<div class="contact-item">📞 ${rep.phones[0]}</div>`);
  }
  
  if (rep.channels && rep.channels.length > 0) {
    rep.channels.forEach(channel => {
      const icon = getSocialIcon(channel.type);
      methods.push(`<div class="contact-item">${icon} <a href="${getSocialUrl(channel.type, channel.id)}" target="_blank">@${channel.id}</a></div>`);
    });
  }
  
  if (methods.length === 0) return '';
  
  return `<div class="contact-methods">${methods.join('')}</div>`;
}

function getSocialIcon(type) {
  const icons = {
    'Twitter': '🐦',
    'Facebook': '👥',
    'YouTube': '📺',
    'Instagram': '📷'
  };
  return icons[type] || '🔗';
}

function getSocialUrl(type, id) {
  const urls = {
    'Twitter': `https://twitter.com/${id}`,
    'Facebook': `https://facebook.com/${id}`,
    'YouTube': `https://youtube.com/${id}`,
    'Instagram': `https://instagram.com/${id}`
  };
  return urls[type] || '#';
}

// === Email Functions ===
function openEmailModal(repJson) {
  currentRecipient = JSON.parse(unescapeHtml(repJson));
  
  if (!currentRecipient.emails || currentRecipient.emails.length === 0) {
    alert('No email address available for this representative.');
    return;
  }
  
  if (CONFIG.ENABLE_EMAIL && !isGmailAuthorized) {
    alert('Please authorize Gmail first to send emails.');
    return;
  }
  
  // Populate recipient info
  document.getElementById('recipient-info').innerHTML = `
    <strong>To:</strong> ${currentRecipient.name} (${currentRecipient.office})<br>
    <strong>Email:</strong> ${currentRecipient.emails[0]}
  `;
  
  // Reset form
  document.getElementById('email-template').value = '';
  document.getElementById('email-subject').value = '';
  document.getElementById('email-body').value = '';
  
  // Show modal
  document.getElementById('email-modal').style.display = 'flex';
}

function closeEmailModal() {
  document.getElementById('email-modal').style.display = 'none';
  currentRecipient = null;
}

function applyEmailTemplate() {
  const templateId = document.getElementById('email-template').value;
  if (!templateId) return;
  
  const template = CONFIG.EMAIL_TEMPLATES[templateId];
  if (!template) return;
  
  document.getElementById('email-subject').value = template.subject;
  document.getElementById('email-body').value = template.body.replace(/\[Representative Name\]/g, currentRecipient.name);
}

async function sendEmail() {
  if (!currentRecipient) return;
  
  const subject = document.getElementById('email-subject').value.trim();
  const body = document.getElementById('email-body').value.trim();
  
  if (!subject || !body) {
    alert('Please fill in both subject and message.');
    return;
  }
  
  if (CONFIG.ENABLE_EMAIL && isGmailAuthorized) {
    // Send via Gmail API
    try {
      const email = createEmailMessage(currentRecipient.emails[0], subject, body);
      await gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: { raw: email }
      });
      
      alert(`✅ Email sent successfully to ${currentRecipient.name}!`);
      closeEmailModal();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again or use mailto link.');
    }
  } else {
    // Fallback to mailto
    const mailto = `mailto:${currentRecipient.emails[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    closeEmailModal();
  }
}

function createEmailMessage(to, subject, body) {
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\r\n');
  
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// === Favorites ===
function toggleFavorite(repJson) {
  if (!CONFIG.ENABLE_FAVORITES) return;
  
  const rep = JSON.parse(unescapeHtml(repJson));
  let favorites = loadFavoritesFromStorage();
  
  const index = favorites.findIndex(f => f.name === rep.name && f.office === rep.office);
  
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(rep);
  }
  
  saveFavoritesToStorage(favorites);
  
  // Refresh all displays
  if (allReps.length > 0) {
    displayRepresentatives(allReps);
  } else {
    displayFavorites();
  }
}

function isFavorited(rep) {
  const favorites = loadFavoritesFromStorage();
  return favorites.some(f => f.name === rep.name && f.office === rep.office);
}

function loadFavorites() {
  displayFavorites();
}

function displayFavorites() {
  if (!CONFIG.ENABLE_FAVORITES) return;
  
  const favorites = loadFavoritesFromStorage();
  const section = document.getElementById('favorites-section');
  const container = document.getElementById('favorites-reps');
  
  if (favorites.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  container.innerHTML = '';
  favorites.forEach(rep => {
    container.appendChild(createRepCard(rep));
  });
  
  section.style.display = 'block';
}

function loadFavoritesFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('rep-favorites') || '[]');
  } catch (e) {
    return [];
  }
}

function saveFavoritesToStorage(favorites) {
  localStorage.setItem('rep-favorites', JSON.stringify(favorites));
}

// === Helper Functions ===
function callRep(phone) {
  window.location.href = `tel:${phone}`;
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  document.getElementById('findBtn').disabled = show;
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function clearError() {
  document.getElementById('error').style.display = 'none';
}

function hideAllSections() {
  document.getElementById('federal-section').style.display = 'none';
  document.getElementById('state-section').style.display = 'none';
  document.getElementById('local-section').style.display = 'none';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function unescapeHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent;
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('email-modal');
  if (event.target === modal) {
    closeEmailModal();
  }
};
