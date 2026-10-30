// ========== Data & Storage ==========
const STORAGE_KEY = 'spookyYardVotes_v3';

// Reliable Halloween-themed images (Unsplash + Wikimedia)
const SAFE_IMAGES = [
  'https://images.unsplash.com/photo-1635376325430-95af2fc43954?auto=format&fit=crop&w=800&h=500&q=80', // skeleton yard + spider webs
  'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?auto=format&fit=crop&w=800&h=500&q=80', // glowing jack-o-lanterns
  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&h=500&q=80', // lit haunted house
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Halloween_Yards_Decorations.jpg/800px-Halloween_Yards_Decorations.jpg', // classic yard decor
  'https://images.unsplash.com/photo-1509248961158-e54f69324553?auto=format&fit=crop&w=800&h=500&q=80', // outdoor halloween lights
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&h=500&q=80'  // skeleton
];

const DEFAULT_YARDS = [
  {
    id: '1',
    name: 'The Miller Haunt',
    street: '412 Old Oaks Lane',
    desc: 'Full animatronic graveyard with fog machines, jumping skeletons, and a 12-ft inflatable reaper. Kids scream, parents cheer.',
    image: SAFE_IMAGES[0],
    votes: 47,
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: '2',
    name: "Witch's Brew Estate",
    street: '88 Oak Ridge Court',
    desc: 'Purple lighting, bubbling cauldrons, flying bats on wires, and a life-size witch that cackles when you walk by.',
    image: SAFE_IMAGES[1],
    votes: 39,
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: '3',
    name: 'Pumpkin Patch Palace',
    street: '225 Acorn Circle',
    desc: "Over 200 carved pumpkins, glowing jack-o'-lantern pathway, and a giant spider web covering the entire front yard.",
    image: SAFE_IMAGES[2],
    votes: 52,
    createdAt: Date.now() - 86400000 * 6
  },
  {
    id: '4',
    name: 'Zombie Apocalypse Zone',
    street: '17 Willow Oak Drive',
    desc: 'Zombies rising from the lawn, bloody handprints, broken windows, and a "quarantine" zone. Extremely realistic!',
    image: SAFE_IMAGES[3],
    votes: 31,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: '5',
    name: 'Ghostly Manor',
    street: '9 Live Oak Boulevard',
    desc: 'Sheer white sheets on fishing line create floating ghosts. Soft blue lights and eerie classical music complete the vibe.',
    image: SAFE_IMAGES[4],
    votes: 28,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: '6',
    name: 'Candy Corn Castle',
    street: '333 Old Oaks Parkway',
    desc: 'Bright, family-friendly candy theme with giant candy corn, lollipops, and a photo booth. Perfect for little ones.',
    image: SAFE_IMAGES[5],
    votes: 44,
    createdAt: Date.now() - 86400000 * 1
  }
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        yards: data.yards || [],
        votedIds: new Set(data.votedIds || [])
      };
    }
  } catch (e) {
    console.warn('Failed to load data', e);
  }
  const data = { yards: DEFAULT_YARDS, votedIds: new Set() };
  saveData(data);
  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    yards: data.yards,
    votedIds: [...data.votedIds]
  }));
}

let state = loadData();

// ========== Helpers ==========
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function getRandomImage() {
  return SAFE_IMAGES[Math.floor(Math.random() * SAFE_IMAGES.length)];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== QR Code ==========
function getBaseUrl() {
  return window.location.href.split('#')[0].split('?')[0];
}

function getPageUrl() {
  return getBaseUrl();
}

/** Deep-link URL that auto-votes for a specific yard */
function getVoteUrl(yardId) {
  return getBaseUrl() + '?vote=' + encodeURIComponent(yardId);
}

function qrApiUrlFor(data, size = 280) {
  const url = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${url}&margin=10&color=1a0a00&bgcolor=ffffff`;
}

function qrApiUrl(size = 280) {
  return qrApiUrlFor(getPageUrl(), size);
}

function updateQrDisplays() {
  const url = getPageUrl();
  const imgUrl = qrApiUrl(280);
  const modalImgUrl = qrApiUrl(240);

  const mainImg = document.getElementById('qr-image');
  const modalImg = document.getElementById('qr-modal-image');
  const urlDisplay = document.getElementById('qr-url-display');
  const modalUrl = document.getElementById('qr-modal-url');

  if (mainImg) {
    mainImg.src = imgUrl;
    mainImg.alt = 'QR code linking to ' + url;
  }
  if (modalImg) {
    modalImg.src = modalImgUrl;
  }
  if (urlDisplay) urlDisplay.textContent = url;
  if (modalUrl) modalUrl.textContent = url;
}

function downloadQr() {
  const link = document.createElement('a');
  link.href = qrApiUrl(400);
  link.download = 'halloween-vote-qr.png';
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  toast('QR code opened — right-click → Save Image As…');
}

function copyLink() {
  const url = getPageUrl();
  navigator.clipboard.writeText(url).then(() => {
    toast('Link copied to clipboard!');
  }).catch(() => {
    toast('Could not copy — select the URL manually');
  });
}

function openQrModal() {
  updateQrDisplays();
  document.getElementById('qr-modal').classList.remove('hidden');
}

function closeQrModal() {
  document.getElementById('qr-modal').classList.add('hidden');
}

/** Show a yard-specific QR in the modal */
function openYardQr(yardId) {
  const yard = state.yards.find(y => y.id === yardId);
  if (!yard) return;
  const voteUrl = getVoteUrl(yardId);
  const imgUrl = qrApiUrlFor(voteUrl, 280);

  const modal = document.getElementById('qr-modal');
  const modalImg = document.getElementById('qr-modal-image');
  const modalUrl = document.getElementById('qr-modal-url');
  const title = modal.querySelector('h2');

  if (title) title.textContent = '📱 Scan to vote for ' + yard.name;
  if (modalImg) {
    modalImg.src = imgUrl;
    modalImg.alt = 'QR to vote for ' + yard.name;
  }
  if (modalUrl) modalUrl.textContent = voteUrl;

  // Wire download for this yard QR
  const dl = document.getElementById('modal-download');
  if (dl) {
    dl.onclick = () => {
      const a = document.createElement('a');
      a.href = qrApiUrlFor(voteUrl, 400);
      a.download = 'vote-' + yard.name.replace(/\s+/g, '-').toLowerCase() + '-qr.png';
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast('QR opened — save the image');
    };
  }

  modal.classList.remove('hidden');
}

/** Handle ?vote=ID deep link — auto-cast vote once */
function handleVoteDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const voteId = params.get('vote');
  if (!voteId) return;

  // Clean URL so refresh doesn't re-trigger confusion
  const clean = getBaseUrl() + (window.location.hash || '');
  window.history.replaceState({}, '', clean);

  // Small delay so UI is ready
  setTimeout(() => {
    const yard = state.yards.find(y => y.id === voteId);
    if (!yard) {
      toast('Yard not found');
      return;
    }
    if (state.votedIds.has(voteId)) {
      toast('You already voted for ' + yard.name);
      // Still highlight the card
      highlightYard(voteId);
      return;
    }
    vote(voteId);
    highlightYard(voteId);
  }, 400);
}

function highlightYard(id) {
  switchTab('gallery');
  setTimeout(() => {
    const card = document.querySelector('.yard-card[data-id="' + id + '"]');
    if (card) {
      card.classList.add('highlight');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => card.classList.remove('highlight'), 2500);
    }
  }, 100);
}

// ========== Rendering ==========
function updateStats() {
  const totalVotes = state.yards.reduce((sum, y) => sum + y.votes, 0);
  const top = state.yards.length ? Math.max(...state.yards.map(y => y.votes)) : 0;
  document.getElementById('total-yards').textContent = state.yards.length;
  document.getElementById('total-votes').textContent = totalVotes;
  document.getElementById('top-score').textContent = top;
}

function renderGallery() {
  const grid = document.getElementById('yard-grid');
  const search = document.getElementById('search').value.trim().toLowerCase();
  const sort = document.getElementById('sort').value;

  let list = [...state.yards];

  if (search) {
    list = list.filter(y =>
      y.name.toLowerCase().includes(search) ||
      y.street.toLowerCase().includes(search) ||
      (y.desc || '').toLowerCase().includes(search)
    );
  }

  list.sort((a, b) => {
    if (sort === 'votes-desc') return b.votes - a.votes;
    if (sort === 'votes-asc') return a.votes - b.votes;
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'newest') return b.createdAt - a.createdAt;
    return 0;
  });

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="empty-icon">👻</div>
        <p>No yards match your search. Try a different term or add a new one!</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(yard => {
    const hasVoted = state.votedIds.has(yard.id);
    return `
      <article class="yard-card" data-id="${yard.id}">
        <img class="yard-image" src="${yard.image}" alt="${escapeHtml(yard.name)}" loading="lazy"
             onerror="this.src='${getRandomImage()}'" />
        <div class="yard-body">
          <h3 class="yard-name">${escapeHtml(yard.name)}</h3>
          <p class="yard-street">📍 ${escapeHtml(yard.street)}</p>
          <p class="yard-desc">${escapeHtml(yard.desc || 'No description provided.')}</p>
          <div class="yard-footer">
            <div class="vote-count">${yard.votes} <span>vote${yard.votes !== 1 ? 's' : ''}</span></div>
            <div class="card-actions">
              <button class="btn btn-qr-sm yard-qr-btn" data-id="${yard.id}" title="QR code to vote for this yard">📱 QR</button>
              <button class="btn btn-primary vote-btn" ${hasVoted ? 'disabled' : ''} data-id="${yard.id}">
                ${hasVoted ? '✓ Voted' : '🎃 Vote'}
              </button>
            </div>
          </div>
        </div>
      </article>`;
  }).join('');

  grid.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => vote(btn.dataset.id));
  });
  grid.querySelectorAll('.yard-qr-btn').forEach(btn => {
    btn.addEventListener('click', () => openYardQr(btn.dataset.id));
  });
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const ranked = [...state.yards].sort((a, b) => b.votes - a.votes);

  if (ranked.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🏆</div>
        <p>No yards yet. Be the first to add one!</p>
      </div>`;
    return;
  }

  list.innerHTML = ranked.map((yard, i) => {
    const rankClass = i < 3 ? `top-${i + 1}` : '';
    return `
      <div class="rank-item ${rankClass}">
        <div class="rank-num">#${i + 1}</div>
        <div class="rank-info">
          <div class="rank-name">${escapeHtml(yard.name)}</div>
          <div class="rank-street">${escapeHtml(yard.street)}</div>
        </div>
        <div class="rank-votes">${yard.votes} 🎃</div>
      </div>`;
  }).join('');
}

function refresh() {
  updateStats();
  renderGallery();
  renderLeaderboard();
  updateQrDisplays();
}

// ========== Actions ==========
function vote(id) {
  if (state.votedIds.has(id)) return;

  const yard = state.yards.find(y => y.id === id);
  if (!yard) return;

  yard.votes += 1;
  state.votedIds.add(id);
  saveData(state);
  refresh();
  toast(`You voted for ${yard.name}! 🎃`);
}

// Holds the chosen photo as a data URL (set by file input)
let pendingPhotoDataUrl = null;

function clearPhotoPreview() {
  pendingPhotoDataUrl = null;
  const input = document.getElementById('yard-photo');
  if (input) input.value = '';
  const preview = document.getElementById('photo-preview');
  const dropzone = document.getElementById('photo-dropzone');
  if (preview) preview.classList.add('hidden');
  if (dropzone) dropzone.classList.remove('hidden');
}

/** Resize & compress image to keep localStorage under control */
function fileToDataUrl(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          resolve(reader.result); // fallback original
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onPhotoSelected(file) {
  if (!file) return;
  try {
    toast('Processing photo…');
    const dataUrl = await fileToDataUrl(file);
    pendingPhotoDataUrl = dataUrl;
    const preview = document.getElementById('photo-preview');
    const img = document.getElementById('preview-img');
    const dropzone = document.getElementById('photo-dropzone');
    if (img) img.src = dataUrl;
    if (preview) preview.classList.remove('hidden');
    if (dropzone) dropzone.classList.add('hidden');
    toast('Photo ready 📷');
  } catch (err) {
    console.warn(err);
    toast('Could not use that photo. Try another.');
    clearPhotoPreview();
  }
}

async function addYard(e) {
  e.preventDefault();
  const name = document.getElementById('yard-name').value.trim();
  const street = document.getElementById('yard-street').value.trim();
  const desc = document.getElementById('yard-desc').value.trim();
  const urlImage = document.getElementById('yard-image').value.trim();

  if (!name || !street) return;

  let image = pendingPhotoDataUrl || urlImage || getRandomImage();

  const newYard = {
    id: uid(),
    name,
    street,
    desc,
    image,
    votes: 0,
    createdAt: Date.now()
  };

  state.yards.unshift(newYard);
  try {
    saveData(state);
  } catch (err) {
    // localStorage full — try without the big image
    console.warn('Storage full, retrying without photo', err);
    newYard.image = getRandomImage();
    state.yards[0] = newYard;
    try {
      saveData(state);
      toast('Photo too large for storage — used a placeholder instead');
    } catch (e2) {
      state.yards.shift();
      toast('Could not save — storage is full. Remove some yards first.');
      return;
    }
  }

  document.getElementById('add-form').reset();
  clearPhotoPreview();
  refresh();
  switchTab('gallery');
  toast(`${name} has been added! Go vote for it 👻`);
}

function resetAll() {
  if (!confirm('This will erase all yards and votes and restore the sample data. Continue?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadData();
  refresh();
  toast('Data reset to defaults');
}

// ========== Tabs ==========
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === tabId));
  if (tabId === 'qr') updateQrDisplays();
}

// ========== Particles ==========
function createParticles() {
  const container = document.getElementById('particles');
  const emojis = ['🎃', '👻', '🦇', '🕸', '💀', '🕷', '🌕'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = 8 + Math.random() * 12 + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.fontSize = 0.9 + Math.random() * 1.1 + 'rem';
    container.appendChild(p);
  }
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Search & sort
  document.getElementById('search').addEventListener('input', renderGallery);
  document.getElementById('sort').addEventListener('change', renderGallery);

  // Form
  document.getElementById('add-form').addEventListener('submit', addYard);

  // Photo upload
  const photoInput = document.getElementById('yard-photo');
  const dropzone = document.getElementById('photo-dropzone');
  const removeBtn = document.getElementById('remove-photo');

  if (photoInput) {
    photoInput.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];
      if (file) onPhotoSelected(file);
    });
  }

  if (dropzone) {
    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });
    dropzone.addEventListener('drop', e => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) onPhotoSelected(file);
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', clearPhotoPreview);
  }

  // Reset
  document.getElementById('reset-btn').addEventListener('click', resetAll);

  // QR buttons
  document.getElementById('qr-btn').addEventListener('click', openQrModal);
  document.getElementById('download-qr').addEventListener('click', downloadQr);
  document.getElementById('copy-link').addEventListener('click', copyLink);
  document.getElementById('modal-download').addEventListener('click', downloadQr);
  document.getElementById('modal-close').addEventListener('click', closeQrModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeQrModal);

  createParticles();
  refresh();
  handleVoteDeepLink();
});
