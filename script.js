// === Global State ===
let allReps = [];
let currentRecipient = null;
let accessToken = null;
let isGmailAuthorized = false;
let locationInfo = null;
let favorites = [];
let selectedIssue = null;
let searchHistory = [];
let repDataMap = new Map();
let userSettings = { name: '', city: '', email: '' };

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  if (!CONFIG.CICERO_API_KEY || CONFIG.CICERO_API_KEY === 'your-cicero-api-key') {
    document.getElementById('config-notice').style.display = 'block';
  }

  document.getElementById('findBtn').addEventListener('click', findRepresentatives);
  document.getElementById('zipInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') findRepresentatives();
  });

  if (CONFIG.ENABLE_EMAIL && CONFIG.GMAIL_CLIENT_ID) {
    initGmailAuth();
  }

  setupSheetGestures();
  loadFavorites();
  loadSearchHistory();
  loadUserSettings();
  setupSettingsPanel();

  console.log('✅ App initialized');
});

// === Favorites System ===
function loadFavorites() {
  try {
    const stored = localStorage.getItem('repFavorites');
    favorites = stored ? JSON.parse(stored) : [];
  } catch (e) {
    favorites = [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('repFavorites', JSON.stringify(favorites));
  } catch (e) {
    console.error('Could not save favorites:', e);
  }
}

function isFavorite(rep) {
  return favorites.some(f => f.name === rep.name && f.office === rep.office);
}

function toggleFavorite(rep) {
  const index = favorites.findIndex(f => f.name === rep.name && f.office === rep.office);
  if (index >= 0) {
    favorites.splice(index, 1);
    showToast(`${rep.name} removed from favorites`);
  } else {
    favorites.push(rep);
    showToast(`${rep.name} added to favorites`);
  }
  saveFavorites();
  return isFavorite(rep);
}

function showToast(message) {
  const toast = document.getElementById('favorites-toast');
  const msgEl = document.getElementById('toast-message');
  msgEl.textContent = message;
  toast.style.display = 'block';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 2000);
}

function handleFavoriteClickDirect() {
  if (!currentRecipient) return;
  const nowFavorite = toggleFavorite(currentRecipient);
  updateFavoriteButtons(nowFavorite);
}

function updateFavoriteButtons(nowFavorite) {
  const mobileBtn = document.getElementById('fav-btn-mobile');
  if (mobileBtn) {
    mobileBtn.classList.toggle('favorited', nowFavorite);
    const iconEl = mobileBtn.querySelector('.quick-action-icon');
    const labelEl = mobileBtn.querySelector('.quick-action-label');
    if (iconEl) iconEl.textContent = nowFavorite ? '⭐' : '☆';
    if (labelEl) labelEl.textContent = nowFavorite ? 'Saved' : 'Save';
  }

  const desktopBtn = document.getElementById('fav-btn-desktop');
  if (desktopBtn) {
    desktopBtn.classList.toggle('favorited', nowFavorite);
    desktopBtn.classList.toggle('secondary', !nowFavorite);
    desktopBtn.textContent = nowFavorite ? '⭐ Saved' : '☆ Save';
  }
}

// === User Settings ===
function loadUserSettings() {
  try {
    const stored = localStorage.getItem('userSettings');
    userSettings = stored ? JSON.parse(stored) : { name: '', city: '', email: '' };
  } catch (e) {
    userSettings = { name: '', city: '', email: '' };
  }
}

function saveUserSettings() {
  try {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
  } catch (e) {
    console.error('Could not save user settings:', e);
  }
}

function setupSettingsPanel() {
  const settingsBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-settings');
  const overlay = document.getElementById('settings-overlay');
  const panel = document.getElementById('settings-panel');
  const saveBtn = document.getElementById('save-settings');

  const openSettings = () => {
    panel.classList.add('active');
    overlay.classList.add('active');
    document.getElementById('user-name').value = userSettings.name || '';
    document.getElementById('user-city').value = userSettings.city || '';
    document.getElementById('user-email').value = userSettings.email || '';
  };

  const closeSettings = () => {
    panel.classList.remove('active');
    overlay.classList.remove('active');
  };

  settingsBtn.addEventListener('click', openSettings);
  closeBtn.addEventListener('click', closeSettings);
  overlay.addEventListener('click', closeSettings);

  saveBtn.addEventListener('click', () => {
    userSettings.name = document.getElementById('user-name').value.trim();
    userSettings.city = document.getElementById('user-city').value.trim();
    userSettings.email = document.getElementById('user-email').value.trim();
    saveUserSettings();
    closeSettings();
    alert('Settings saved!');
  });
}

// === Search History ===
function loadSearchHistory() {
  try {
    const stored = localStorage.getItem('repSearchHistory');
    searchHistory = stored ? JSON.parse(stored) : [];
    renderSearchHistory();
  } catch (e) {
    searchHistory = [];
  }
}

function saveSearchToHistory(zip, location) {
  searchHistory = searchHistory.filter(s => s.zip !== zip);
  searchHistory.unshift({ zip, location, timestamp: Date.now() });
  searchHistory = searchHistory.slice(0, 5);
  try {
    localStorage.setItem('repSearchHistory', JSON.stringify(searchHistory));
  } catch (e) {
    console.error('Could not save search history:', e);
  }
  renderSearchHistory();
}

function renderSearchHistory() {
  let historyContainer = document.getElementById('search-history');
  if (!historyContainer) {
    const lookupCard = document.querySelector('.lookup-card');
    if (!lookupCard) return;
    historyContainer = document.createElement('div');
    historyContainer.id = 'search-history';
    historyContainer.className = 'search-history';
    lookupCard.appendChild(historyContainer);
  }

  if (searchHistory.length === 0) {
    historyContainer.style.display = 'none';
    return;
  }

  historyContainer.style.display = 'block';
  historyContainer.innerHTML = `
    <div class="history-label">Recent searches</div>
    <div class="history-chips">
      ${searchHistory.map(s => `
        <button class="history-chip" onclick="quickSearch('${s.zip}')">
          📍 ${s.location || s.zip}
        </button>
      `).join('')}
    </div>
  `;
}

function quickSearch(zip) {
  document.getElementById('zipInput').value = zip;
  findRepresentatives();
}

// === Gmail Auth ===
function initGmailAuth() {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = () => {
    window.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.GMAIL_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.send',
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          isGmailAuthorized = true;
          console.log('✅ Gmail authorized');
          updateAuthUI();
        }
      },
      error_callback: (error) => {
        console.error('OAuth error:', error);
      }
    });
    console.log('✅ Gmail auth initialized');
    updateAuthUI();
  };
  document.head.appendChild(script);
}

function updateAuthUI() {
  const authSection = document.getElementById('auth-section');
  const authButton = document.getElementById('authorize-button');

  if (isGmailAuthorized) {
    authSection.style.display = 'none';
  } else {
    authSection.style.display = 'block';
    authButton.onclick = () => {
      if (window.tokenClient) {
        window.tokenClient.requestAccessToken();
      }
    };
  }
}

// === Cicero Proxy ===
const CICERO_WORKER_URL = 'https://round-frost-3717.mmasterge.workers.dev';

async function fetchWithCorsProxy(ciceroUrl) {
  const url = new URL(ciceroUrl);
  const zip = url.searchParams.get('search_postal');
  const workerUrl = `${CICERO_WORKER_URL}/?zip=${encodeURIComponent(zip)}`;
  const response = await fetch(workerUrl);
  if (!response.ok) throw new Error(`Worker returned HTTP ${response.status}`);
  return response;
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
  document.getElementById('results').style.display = 'none';
  repDataMap.clear();

  try {
    const ciceroUrl = `https://app.cicerodata.com/v3.1/official?search_postal=${zip}&search_country=US&format=json&key=${CONFIG.CICERO_API_KEY}`;

    const response = await fetchWithCorsProxy(ciceroUrl);
    const data = await response.json();

    if (data.response && data.response.errors && data.response.errors.length > 0) {
      throw new Error(data.response.errors.join(', '));
    }

    if (!data.response || !data.response.results) {
      throw new Error('Invalid response from API');
    }

    if (data.response.results.candidates && data.response.results.candidates.length > 0) {
      const candidate = data.response.results.candidates[0];
      locationInfo = {
        city: candidate.match_city,
        state: candidate.match_region,
        zip: candidate.match_postal,
        county: candidate.match_county
      };

      document.getElementById('location-text').textContent = `${locationInfo.city}, ${locationInfo.state} ${locationInfo.zip}`;
      document.getElementById('location-display').style.display = 'block';
      document.getElementById('state-title').textContent = getStateName(locationInfo.state);
      document.getElementById('county-title').textContent = locationInfo.county || 'County';
      document.getElementById('local-title').textContent = locationInfo.city || 'Local';

      saveSearchToHistory(zip, `${locationInfo.city}, ${locationInfo.state}`);
    }

    allReps = processRepresentatives(data);
    displayRepresentatives(allReps);

  } catch (error) {
    console.error('Error finding representatives:', error);
    let errorMessage = 'Unable to find representatives. ';
    if (error.message.includes('CORS') || error.message.includes('proxy') || error.message.includes('Failed to fetch')) {
      errorMessage += 'Network error - please check your internet connection and try again.';
    } else if (error.message.includes('API')) {
      errorMessage += 'API error - the service may be temporarily unavailable.';
    } else {
      errorMessage += 'Please check your ZIP code and try again.';
    }
    showError(errorMessage);
  } finally {
    showLoading(false);
  }
}

// === Process API Data ===
function processRepresentatives(data) {
  const reps = [];
  // Cicero API returns officials nested in candidates array
  const officials = data.response.results.officials ||
    (data.response.results.candidates && data.response.results.candidates[0]?.officials) ||
    [];

  officials.forEach(official => {
    const office = official.office || {};
    const district = official.office?.district || {};

    let level = 'other';
    const districtType = district.district_type || '';
    const officeType = office.office_type || '';

    if (districtType.includes('NATIONAL') || officeType.includes('NATIONAL')) {
      level = 'federal';
    } else if (districtType.includes('STATE') || officeType.includes('STATE')) {
      level = 'state';
    } else if (districtType.includes('COUNTY') || officeType.includes('COUNTY')) {
      level = 'county';
    } else if (districtType.includes('LOCAL') || districtType.includes('CITY') || districtType.includes('PLACE')) {
      level = 'local';
    }

    let branch = 'other';
    const chamberType = office.chamber_type || '';
    // Check all possible title locations for branch/direct detection
    const fullTitle = (office.title || official.title || office.name || '').toLowerCase();

    if (chamberType === 'EXEC' || fullTitle.includes('president') || fullTitle.includes('governor') || fullTitle.includes('mayor')) {
      branch = 'executive';
    } else if (chamberType === 'UPPER' || chamberType === 'LOWER' || fullTitle.includes('senator') || fullTitle.includes('representative') || fullTitle.includes('assembly') || fullTitle.includes('delegate')) {
      branch = 'legislative';
    }

    const urls = (official.urls || []).map(u => {
      if (typeof u === 'string') return u;
      if (u && u.url) return u.url;
      return null;
    }).filter(Boolean);

    if (official.web_form_url) {
      urls.push(official.web_form_url);
    }

    const emails = (official.email_addresses || []).map(e => {
      if (typeof e === 'string') return e;
      if (e && e.email) return e.email;
      return null;
    }).filter(Boolean);

    const phones = (official.phone_numbers || official.phones || []).map(p => {
      if (typeof p === 'string') return p;
      if (p && p.phone_number) return p.phone_number;
      return null;
    }).filter(Boolean);

    // Direct reps: US Congress (Sen/Rep) OR State Gov/Leg
    const isDirect = (level === 'federal' && (branch === 'legislative' || fullTitle.includes('senator') || fullTitle.includes('representative'))) ||
      (level === 'state' && (branch === 'legislative' || fullTitle.includes('governor') || fullTitle.includes('senator') || fullTitle.includes('representative')));

    reps.push({
      name: `${official.first_name || ''} ${official.last_name || ''}`.trim(),
      office: office.title || official.title || office.name || 'Official',
      party: official.party || 'Unknown',
      level,
      branch,
      isDirect,
      district: district.name || district.district_id || '',
      photo: official.photo_origin_url || official.photo_url || null,
      urls,
      emails,
      phones,
      addresses: official.addresses || [],
      social: official.identifiers || []
    });
  });

  return reps;
}

// === Display Representatives ===
function displayRepresentatives(reps) {
  const levels = {
    federal: { reps: [], container: document.getElementById('federal-officials'), count: document.getElementById('federal-count') },
    state: { reps: [], container: document.getElementById('state-officials'), count: document.getElementById('state-count') },
    county: { reps: [], container: document.getElementById('county-officials'), count: document.getElementById('county-count') },
    local: { reps: [], container: document.getElementById('local-officials'), count: document.getElementById('local-count') }
  };

  reps.forEach(rep => {
    if (levels[rep.level]) {
      levels[rep.level].reps.push(rep);
    } else {
      levels.local.reps.push(rep);
    }
  });

  Object.entries(levels).forEach(([levelKey, level]) => {
    level.container.innerHTML = '';
    level.count.textContent = level.reps.length;

    // Get the parent level section
    const levelSection = level.container.closest('.level');

    if (level.reps.length === 0) {
      // Hide county and local sections if they have no data
      if (levelKey === 'county' || levelKey === 'local') {
        if (levelSection) {
          levelSection.classList.add('hidden');
        }
      } else {
        // For federal/state, show "no results" message
        level.container.innerHTML = '<div class="no-results">No officials found at this level</div>';
      }
      return;
    }

    // Show section if it has data (remove hidden class if it was previously hidden)
    if (levelSection && levelSection.classList.contains('hidden')) {
      levelSection.classList.remove('hidden');
    }

    const branches = { executive: [], legislative: [], other: [] };
    level.reps.forEach(rep => {
      branches[rep.branch].push(rep);
    });

    let repIndex = 0;

    // Executive branch - always expanded
    if (branches.executive.length > 0) {
      const label = document.createElement('div');
      label.className = 'branch-label';
      label.textContent = 'Executive';
      level.container.appendChild(label);
      branches.executive.forEach(rep => {
        level.container.appendChild(createOfficialCard(rep, `${levelKey}_exec_${repIndex++}`));
      });
    }

    // Legislative branch - show direct reps, collapse others
    if (branches.legislative.length > 0) {
      const label = document.createElement('div');
      label.className = 'branch-label branch-label-collapsible';
      label.innerHTML = 'Legislative <span class="expand-icon">▼</span>';
      label.setAttribute('data-branch', `${levelKey}_legislative`);
      level.container.appendChild(label);

      const container = document.createElement('div');
      container.className = 'branch-container expanded';
      container.setAttribute('data-branch', `${levelKey}_legislative`);

      // Separate direct reps from others
      const directReps = branches.legislative.filter(r => r.isDirect);
      const otherReps = branches.legislative.filter(r => !r.isDirect);

      directReps.forEach(rep => {
        container.appendChild(createOfficialCard(rep, `${levelKey}_leg_${repIndex++}`));
      });

      if (otherReps.length > 0) {
        const moreContainer = document.createElement('div');
        moreContainer.className = 'more-officials collapsed';
        moreContainer.setAttribute('data-branch', `${levelKey}_legislative_more`);

        otherReps.forEach(rep => {
          moreContainer.appendChild(createOfficialCard(rep, `${levelKey}_leg_${repIndex++}`));
        });

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'show-more-btn';
        toggleBtn.textContent = `Show ${otherReps.length} more officials`;
        toggleBtn.onclick = (e) => {
          e.stopPropagation();
          moreContainer.classList.toggle('collapsed');
          toggleBtn.textContent = moreContainer.classList.contains('collapsed')
            ? `Show ${otherReps.length} more officials`
            : `Show fewer officials`;
        };

        container.appendChild(toggleBtn);
        container.appendChild(moreContainer);
      }

      level.container.appendChild(container);

      // Make label clickable to collapse entire branch
      label.onclick = () => toggleBranch(`${levelKey}_legislative`);
    }

    // Other Officials - collapsed by default
    if (branches.other.length > 0) {
      const label = document.createElement('div');
      label.className = 'branch-label branch-label-collapsible';
      label.innerHTML = 'Other Officials <span class="expand-icon">▼</span>';
      label.setAttribute('data-branch', `${levelKey}_other`);
      level.container.appendChild(label);

      const container = document.createElement('div');
      container.className = 'branch-container collapsed';
      container.setAttribute('data-branch', `${levelKey}_other`);

      branches.other.forEach(rep => {
        container.appendChild(createOfficialCard(rep, `${levelKey}_other_${repIndex++}`));
      });

      level.container.appendChild(container);
      label.onclick = () => toggleBranch(`${levelKey}_other`);
    }
  });

  document.getElementById('results').style.display = 'flex';
  document.querySelector('.level-federal').classList.add('expanded');
}

function toggleBranch(branchId) {
  const container = document.querySelector(`.branch-container[data-branch="${branchId}"]`);
  const label = document.querySelector(`.branch-label[data-branch="${branchId}"]`);

  if (container && label) {
    container.classList.toggle('collapsed');
    container.classList.toggle('expanded');

    const icon = label.querySelector('.expand-icon');
    if (icon) {
      icon.textContent = container.classList.contains('collapsed') ? '▶' : '▼';
    }
  }
}

// === Filtering ===
window.filterReps = function (category, btnElement) {
  // Update buttons
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');

  const levels = document.querySelectorAll('.level');
  const connectors = document.querySelectorAll('.connector');
  const cards = document.querySelectorAll('.official-card');
  const labels = document.querySelectorAll('.branch-label');

  if (category === 'all') {
    levels.forEach(l => l.style.display = 'block');
    connectors.forEach(c => c.style.display = 'block');
    labels.forEach(l => l.style.display = 'block');
    cards.forEach(c => c.style.display = 'flex');
  } else {
    // Hide everything first
    levels.forEach(l => l.style.display = 'none');
    connectors.forEach(c => c.style.display = 'none');
    labels.forEach(l => l.style.display = 'none');
    cards.forEach(c => c.style.display = 'none');

    // Show the specific level
    const targetLevel = document.querySelector(`.level[data-level="${category}"]`);
    if (targetLevel) {
      targetLevel.style.display = 'block';

      // Show only direct reps in this level
      const directCards = targetLevel.querySelectorAll('.official-card[data-is-direct="true"]');
      directCards.forEach(c => {
        c.style.display = 'flex';
        // Show the branch label above this card if it exists
        let prev = c.previousElementSibling;
        while (prev && !prev.classList.contains('official-card')) {
          if (prev.classList.contains('branch-label')) {
            prev.style.display = 'block';
          }
          prev = prev.previousElementSibling;
        }
      });
    }
  }
}

function createOfficialCard(rep, index) {
  const card = document.createElement('div');
  card.className = 'official-card';

  const repId = `rep_${index}`;
  repDataMap.set(repId, rep);
  card.setAttribute('data-rep-id', repId);
  card.setAttribute('data-level', rep.level);
  card.setAttribute('data-is-direct', rep.isDirect);
  card.onclick = () => showRepDetailById(repId);

  const initials = getInitials(rep.name);
  const escapedInitials = initials.replace(/'/g, "\\'");
  const photoHTML = rep.photo
    ? `<img src="${rep.photo}" alt="${escapeHtml(rep.name)}" onerror="this.parentElement.innerHTML='${escapedInitials}'">`
    : initials;

  card.innerHTML = `
    <div class="official-photo">${photoHTML}</div>
    <div class="official-info">
      <div class="official-name">${escapeHtml(rep.name)}</div>
      <div class="official-role">${escapeHtml(rep.office)}${rep.district ? ' - ' + escapeHtml(rep.district) : ''}</div>
    </div>
    <span class="official-party party-${rep.party.replace(/\s+/g, '')}">${rep.party.charAt(0)}</span>
    <span class="official-arrow">›</span>
  `;

  return card;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === Detail View ===
function showRepDetailById(repId) {
  const rep = repDataMap.get(repId);
  if (!rep) {
    console.error('Rep not found for id:', repId);
    return;
  }
  currentRecipient = rep;

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    showMobileSheet(rep);
  } else {
    showDesktopPanel(rep);
  }

  document.getElementById('overlay').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function showMobileSheet(rep) {
  const sheet = document.getElementById('detail-sheet');

  const initials = getInitials(rep.name);
  const photoEl = document.getElementById('detail-photo');
  const safeProto = typeof rep.photo === 'string' ? rep.photo : '';
  photoEl.innerHTML = safeProto
    ? `<img src="${safeProto}" alt="${escapeHtml(rep.name)}" onerror="this.parentElement.innerHTML='${initials}'">`
    : initials;

  document.getElementById('detail-name').textContent = rep.name;
  document.getElementById('detail-role').textContent = rep.office;

  const partyBadge = document.getElementById('detail-party');
  const safeParty = String(rep.party || 'Unknown');
  partyBadge.textContent = safeParty;
  partyBadge.className = `detail-party-badge party-${safeParty.replace(/\s+/g, '')}`;

  const quickActions = document.getElementById('quick-actions');
  quickActions.innerHTML = '';
  const isFav = isFavorite(rep);

  if ((rep.emails && rep.emails.length > 0) || (rep.urls && rep.urls.length > 0)) {
    quickActions.innerHTML += `
      <button class="quick-action" onclick="openIssueSelector()">
        <div class="quick-action-icon">📋</div>
        <div class="quick-action-label">Contact</div>
      </button>`;
  }

  if (rep.phones && rep.phones.length > 0) {
    quickActions.innerHTML += `
      <button class="quick-action" onclick="window.location.href='tel:${rep.phones[0]}'">
        <div class="quick-action-icon">📞</div>
        <div class="quick-action-label">Call</div>
      </button>`;
  }

  if (rep.urls && rep.urls.length > 0) {
    const websiteUrl = ensureHttps(rep.urls[0]);
    quickActions.innerHTML += `
      <button class="quick-action" onclick="window.open('${websiteUrl}', '_blank')">
        <div class="quick-action-icon">🌐</div>
        <div class="quick-action-label">Website</div>
      </button>`;
  }

  quickActions.innerHTML += `
    <button class="quick-action ${isFav ? 'favorited' : ''}" id="fav-btn-mobile" onclick="handleFavoriteClickDirect()">
      <div class="quick-action-icon">${isFav ? '⭐' : '☆'}</div>
      <div class="quick-action-label">${isFav ? 'Saved' : 'Save'}</div>
    </button>`;

  const contactSection = document.getElementById('contact-section');
  contactSection.innerHTML = '<div class="contact-title">Contact</div>';

  if (rep.emails && rep.emails.length > 0) {
    contactSection.innerHTML += `
      <div class="contact-item" onclick="window.location.href='mailto:${rep.emails[0]}'">
        <div class="contact-icon">📧</div>
        <div class="contact-text">${rep.emails[0]}</div>
      </div>`;
  }

  if (rep.phones && rep.phones.length > 0) {
    contactSection.innerHTML += `
      <div class="contact-item" onclick="window.location.href='tel:${rep.phones[0]}'">
        <div class="contact-icon">📞</div>
        <div class="contact-text">${rep.phones[0]}</div>
      </div>`;
  }

  if (rep.urls && rep.urls.length > 0) {
    const websiteUrl = ensureHttps(rep.urls[0]);
    contactSection.innerHTML += `
      <div class="contact-item" onclick="window.open('${websiteUrl}', '_blank')">
        <div class="contact-icon">🌐</div>
        <div class="contact-text">Official Website</div>
      </div>`;
  }

  sheet.classList.add('visible');
}

function showDesktopPanel(rep) {
  const panel = document.getElementById('detail-panel');

  const initials = getInitials(rep.name);
  const photoEl = document.getElementById('panel-photo');
  const safeProto = typeof rep.photo === 'string' ? rep.photo : '';
  photoEl.innerHTML = safeProto
    ? `<img src="${safeProto}" alt="${escapeHtml(rep.name)}" onerror="this.parentElement.innerHTML='${initials}'">`
    : initials;

  document.getElementById('panel-name').textContent = rep.name;
  document.getElementById('panel-role').textContent = rep.office;

  const partyBadge = document.getElementById('panel-party');
  const safeParty = String(rep.party || 'Unknown');
  partyBadge.textContent = safeParty;
  partyBadge.className = `panel-party-badge party-${safeParty.replace(/\s+/g, '')}`;

  const actions = document.getElementById('panel-actions');
  actions.innerHTML = '';
  const isFav = isFavorite(rep);

  if ((rep.emails && rep.emails.length > 0) || (rep.urls && rep.urls.length > 0)) {
    actions.innerHTML += `<button class="panel-action-btn primary" onclick="openIssueSelector()">📋 Contact About Issue</button>`;
  }

  if (rep.phones && rep.phones.length > 0) {
    actions.innerHTML += `<button class="panel-action-btn secondary" onclick="window.location.href='tel:${rep.phones[0]}'">📞 Call</button>`;
  }

  if (rep.urls && rep.urls.length > 0) {
    const websiteUrl = ensureHttps(rep.urls[0]);
    actions.innerHTML += `<button class="panel-action-btn secondary" onclick="window.open('${websiteUrl}', '_blank')">🌐 Website</button>`;
  }

  actions.innerHTML += `<button class="panel-action-btn ${isFav ? 'favorited' : 'secondary'}" id="fav-btn-desktop" onclick="handleFavoriteClickDirect()">${isFav ? '⭐ Saved' : '☆ Save'}</button>`;

  const contact = document.getElementById('panel-contact');
  contact.innerHTML = '<div class="panel-section-title">Contact Information</div>';

  if (rep.emails && rep.emails.length > 0) {
    contact.innerHTML += `
      <div class="panel-contact-item" onclick="window.location.href='mailto:${rep.emails[0]}'">
        <span class="panel-contact-icon">📧</span>
        <span>${rep.emails[0]}</span>
      </div>`;
  }

  if (rep.phones && rep.phones.length > 0) {
    contact.innerHTML += `
      <div class="panel-contact-item" onclick="window.location.href='tel:${rep.phones[0]}'">
        <span class="panel-contact-icon">📞</span>
        <span>${rep.phones[0]}</span>
      </div>`;
  }

  if (rep.urls && rep.urls.length > 0) {
    const websiteUrl = ensureHttps(rep.urls[0]);
    contact.innerHTML += `
      <div class="panel-contact-item" onclick="window.open('${websiteUrl}', '_blank')">
        <span class="panel-contact-icon">🌐</span>
        <span>Official Website</span>
      </div>`;
  }

  panel.classList.add('visible');
}

function closeAllPanels() {
  document.getElementById('detail-sheet').classList.remove('visible');
  document.getElementById('detail-panel').classList.remove('visible');
  document.getElementById('overlay').classList.remove('visible');
  document.body.style.overflow = '';
}

function toggleLevel(el) {
  el.classList.toggle('expanded');
}

// === Issue Selector ===
function openIssueSelector() {
  if (!currentRecipient) return;

  const hasEmail = currentRecipient.emails && currentRecipient.emails.length > 0;
  const hasUrl = currentRecipient.urls && currentRecipient.urls.length > 0;

  if (!hasEmail && !hasUrl) {
    alert('No contact method available for this representative.');
    return;
  }

  document.getElementById('issue-recipient').innerHTML = `
    <div class="issue-recipient-card">
      <strong>Contacting:</strong> ${currentRecipient.name}<br>
      <span class="issue-recipient-role">${currentRecipient.office}</span>
    </div>
  `;

  renderIssueCategories();
  document.getElementById('issue-modal').style.display = 'flex';
}

function renderIssueCategories() {
  const container = document.getElementById('issue-categories');
  container.innerHTML = '';
  document.getElementById('issue-topics').style.display = 'none';
  document.getElementById('issue-categories').style.display = 'grid';

  CONFIG.ISSUE_CATEGORIES.forEach(category => {
    const card = document.createElement('div');
    card.className = 'issue-category-card';
    card.onclick = () => showTopicsForCategory(category);
    card.innerHTML = `
      <div class="issue-category-icon">${category.icon}</div>
      <div class="issue-category-name">${category.name}</div>
      <div class="issue-category-count">${category.topics.length} topics</div>
    `;
    container.appendChild(card);
  });
}

function showTopicsForCategory(category) {
  document.getElementById('issue-categories').style.display = 'none';
  document.getElementById('issue-topics').style.display = 'block';

  const topicsList = document.getElementById('topics-list');
  topicsList.innerHTML = `<h4>${category.icon} ${category.name}</h4>`;

  category.topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'topic-btn';
    btn.innerHTML = `<span class="topic-name">${topic.name}</span>`;
    btn.onclick = () => selectTopic(topic);
    topicsList.appendChild(btn);
  });
}

function showCategories() {
  document.getElementById('issue-topics').style.display = 'none';
  document.getElementById('issue-categories').style.display = 'grid';
}

function selectTopic(topic) {
  selectedIssue = topic;
  closeIssueModal();
  openEmailWithIssue(topic);
}

function openEmailWithIssue(topic) {
  const hasEmail = currentRecipient.emails && currentRecipient.emails.length > 0;
  const hasUrl = currentRecipient.urls && currentRecipient.urls.length > 0;

  // If no email but has URL, use web form workflow
  if (!hasEmail && hasUrl) {
    openWebFormContact(topic);
    return;
  }

  const contactMethod = hasEmail ? currentRecipient.emails[0] : 'Via Official Website';

  document.getElementById('recipient-info').innerHTML = `
    <strong>To:</strong> ${currentRecipient.name} (${currentRecipient.office})<br>
    <strong>Contact:</strong> ${contactMethod}<br>
    <strong>Topic:</strong> ${topic.name}
  `;

  updateEmailModalButton();

  // Use topic's bodyTemplate if available, otherwise fall back to generic template
  let bodyText;
  if (topic.bodyTemplate) {
    bodyText = topic.bodyTemplate.replace(/\[Representative Name\]/g, currentRecipient.name);
  } else {
    // Fallback to old template for backward compatibility
    const template = CONFIG.EMAIL_TEMPLATES['issue-specific'];
    bodyText = template.body
      .replace(/\[Representative Name\]/g, currentRecipient.name)
      .replace(/\[ISSUE_NAME\]/g, topic.name);
  }

  document.getElementById('email-subject').value = topic.subject;
  document.getElementById('email-body').value = bodyText + generateEmailSignature();

  document.getElementById('email-template').value = '';
  document.getElementById('email-modal').style.display = 'flex';
}

function openCustomEmail() {
  closeIssueModal();
  openEmailModal();
}

function closeIssueModal() {
  document.getElementById('issue-modal').style.display = 'none';
  selectedIssue = null;
}

// === Email Functions ===
function openEmailModal() {
  if (!currentRecipient) return;

  const hasEmail = currentRecipient.emails && currentRecipient.emails.length > 0;
  const hasUrl = currentRecipient.urls && currentRecipient.urls.length > 0;

  if (!hasEmail && !hasUrl) {
    alert('No contact method available for this representative.');
    return;
  }

  const contactMethod = hasEmail ? currentRecipient.emails[0] : 'Via Official Website';

  document.getElementById('recipient-info').innerHTML = `
    <strong>To:</strong> ${currentRecipient.name} (${currentRecipient.office})<br>
    <strong>Contact:</strong> ${contactMethod}
  `;

  updateEmailModalButton();

  document.getElementById('email-subject').value = '';
  document.getElementById('email-body').value = '';
  document.getElementById('email-template').value = '';
  document.getElementById('email-modal').style.display = 'flex';
}

function closeEmailModal() {
  document.getElementById('email-modal').style.display = 'none';
}

function generateEmailSignature() {
  let signature = '\n\nBest regards,';
  if (userSettings.name) {
    signature += `\n${userSettings.name}`;
  }
  if (userSettings.city) {
    signature += `\n${userSettings.city}`;
  }
  if (userSettings.email) {
    signature += `\n${userSettings.email}`;
  }
  return signature;
}

function applyEmailTemplate() {
  const templateName = document.getElementById('email-template').value;
  if (!templateName || !CONFIG.EMAIL_TEMPLATES[templateName]) return;

  const template = CONFIG.EMAIL_TEMPLATES[templateName];
  document.getElementById('email-subject').value = template.subject;
  const bodyText = template.body.replace(/\[Representative Name\]/g, currentRecipient.name);
  document.getElementById('email-body').value = bodyText + generateEmailSignature();
}

async function sendEmail() {
  const subject = document.getElementById('email-subject').value;
  const body = document.getElementById('email-body').value;

  if (!subject || !body) {
    alert('Please fill in both subject and message.');
    return;
  }

  if (isGmailAuthorized && accessToken) {
    try {
      const email = [
        `To: ${currentRecipient.emails[0]}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        body
      ].join('\r\n');

      const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (response.ok) {
        alert('Email sent successfully!');
        closeEmailModal();
        closeAllPanels();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      window.location.href = `mailto:${currentRecipient.emails[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  } else {
    window.location.href = `mailto:${currentRecipient.emails[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

function updateEmailModalButton() {
  const btn = document.querySelector('#email-modal .btn-primary');
  // Remove old event listeners by cloning
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  const hasEmail = currentRecipient.emails && currentRecipient.emails.length > 0;

  if (hasEmail) {
    newBtn.innerHTML = '📤 Send';
    newBtn.onclick = sendEmail;
    newBtn.style.display = 'block';
  } else if (currentRecipient.urls && currentRecipient.urls.length > 0) {
    newBtn.innerHTML = '📋 Copy & Open Site';
    newBtn.onclick = copyAndOpenSite;
    newBtn.style.display = 'block';
  } else {
    newBtn.style.display = 'none';
  }
}

// Web Form Contact Workflow
function openWebFormContact(topic) {
  // Generate the message
  let bodyText;
  if (topic.bodyTemplate) {
    bodyText = topic.bodyTemplate.replace(/\[Representative Name\]/g, currentRecipient.name);
  } else {
    const template = CONFIG.EMAIL_TEMPLATES['issue-specific'];
    bodyText = template.body
      .replace(/\[Representative Name\]/g, currentRecipient.name)
      .replace(/\[ISSUE_NAME\]/g, topic.name);
  }

  const fullMessage = bodyText + generateEmailSignature();
  const contactUrl = currentRecipient.urls[0];

  // Show web form mode in email modal
  document.getElementById('recipient-info').innerHTML = `
    <div class="web-form-notice">
      <strong>📝 Web Form Contact</strong><br>
      <p>This representative uses a web form for contact. We'll copy your message and open their contact page.</p>
      <strong>To:</strong> ${currentRecipient.name} (${currentRecipient.office})<br>
      <strong>Topic:</strong> ${topic.name}
    </div>
  `;

  // Show the pre-filled message (read-only)
  document.getElementById('email-subject').value = topic.subject;
  document.getElementById('email-subject').readOnly = true;
  document.getElementById('email-body').value = fullMessage;
  document.getElementById('email-body').readOnly = true;

  // Hide template selector for web form mode
  document.getElementById('email-template').style.display = 'none';

  // Update button to "Copy & Open Form"
  const modalFooter = document.querySelector('#email-modal .modal-footer');
  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeWebFormModal()">Cancel</button>
    <button class="btn btn-primary" onclick="copyMessageAndOpenForm()">📋 Copy & Open Form</button>
  `;

  document.getElementById('email-modal').style.display = 'flex';
}

function copyMessageAndOpenForm() {
  const subject = document.getElementById('email-subject').value;
  const body = document.getElementById('email-body').value;

  const textToCopy = `Subject: ${subject}\n\n${body}`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('✅ Message copied to clipboard!\n\nNow opening the contact form in a new tab. Please paste your message into their form.');
    const url = ensureHttps(currentRecipient.urls[0]);
    window.open(url, '_blank');
    closeWebFormModal();
    closeAllPanels();
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Could not copy to clipboard automatically. Please copy the message manually.\n\nOpening contact form...');
    const url = ensureHttps(currentRecipient.urls[0]);
    window.open(url, '_blank');
  });
}

function closeWebFormModal() {
  // Reset to normal email modal state
  document.getElementById('email-subject').readOnly = false;
  document.getElementById('email-body').readOnly = false;
  document.getElementById('email-template').style.display = 'block';

  // Restore normal modal footer
  const modalFooter = document.querySelector('#email-modal .modal-footer');
  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeEmailModal()">Cancel</button>
    <button class="btn btn-primary" onclick="sendEmail()">📤 Send</button>
  `;

  closeEmailModal();
}

function copyAndOpenSite() {
  const subject = document.getElementById('email-subject').value;
  const body = document.getElementById('email-body').value;

  const textToCopy = `Subject: ${subject}\n\n${body}`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('Message copied to clipboard! Opening contact page...');
    const url = ensureHttps(currentRecipient.urls[0]);
    window.open(url, '_blank');
    closeEmailModal();
    closeAllPanels();
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Could not copy to clipboard. Opening site anyway...');
    const url = ensureHttps(currentRecipient.urls[0]);
    window.open(url, '_blank');
  });
}

// === Utility Functions ===
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showError(message) {
  const errorEl = document.getElementById('error');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function clearError() {
  document.getElementById('error').style.display = 'none';
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function ensureHttps(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
}

function getStateName(abbrev) {
  const states = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'Washington D.C.'
  };
  return states[abbrev] || abbrev;
}

function setupSheetGestures() {
  const sheet = document.getElementById('detail-sheet');
  let startY = 0;
  let currentY = 0;

  sheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  });

  sheet.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) {
      sheet.style.transform = `translateY(${diff}px)`;
    }
  });

  sheet.addEventListener('touchend', () => {
    const diff = currentY - startY;
    if (diff > 100) {
      closeAllPanels();
    }
    sheet.style.transform = '';
    startY = 0;
    currentY = 0;
  });
}
