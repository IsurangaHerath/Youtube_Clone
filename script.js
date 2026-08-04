/*
 * script.js - all the logic for the YouTube clone
 *
 * This handles everything on the page: the hash router, rendering the
 * home grid and the watch page, search with suggestions, and all the
 * little interactive bits like likes, subscribes and comments.
 *
 * A lot of things are saved to localStorage so that the app remembers
 * your history, liked videos, subscriptions and so on between visits.
 */

// ---------- Tiny helper functions ----------

// Shortcut for document.querySelector - saves typing all over the place.
const $ = (sel, root = document) => root.querySelector(sel);

// Same but returns all matches as a real array so we can use .forEach.
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Delays calling a function until the user stops typing/clicking.
// Used for the search bar so we don't re-filter on every single keypress.
function debounce(fn, ms = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Turns a big number into a short readable one, e.g. 1200000 -> "1.2M".
function formatCount(n) {
  if (n >= 1e9) return +(n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return +(n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return +(n / 1e3).toFixed(1) + 'K';
  return String(n);
}

// Escapes HTML special characters so user input (like comments) can never
// inject markup into the page.
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// Turns any string into a number between 0-359 that we use as a hue.
// Every channel gets its own avatar colour based on its name.
function hue(str) {
  let h = 0;
  for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

// Grabs the first letter of a name so we can use it as an avatar.
function initial(str) {
  return (String(str).trim()[0] || 'Y').toUpperCase();
}

// Builds a CSS hsl() colour string from h/s/l values.
function hsl(h, s, l) {
  return `hsl(${h},${Math.round(s * 100)}%,${Math.round(l * 100)}%)`;
}

// Generates a simple SVG thumbnail as a data URL. This is used when the
// normal thumbnail image fails to load so the card still looks decent.
function fallbackThumb(id) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><defs><linearGradient id='g${id}' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${hsl(hue('a' + id), 0.35, 0.24)}'/><stop offset='1' stop-color='${hsl(hue('b' + id), 0.5, 0.14)}'/></linearGradient></defs><rect width='640' height='360' fill='url(#g${id})'/><text x='320' y='196' font-size='42' fill='#ffffffcc' text-anchor='middle' font-family='Arial, sans-serif'>Video ${id}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Every SVG icon used in the app, stored as strings so we can drop them
// into templates easily. Most use currentColor so they follow the theme.
const icons = {
  like: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3z"/><path d="M7 10l5-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7"/></svg>',
  dislike: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3z"/><path d="M17 14l-5 7a2 2 0 0 1-2-2v-4H5a2 2 0 0 1-2-2l1-7a2 2 0 0 1 2-2h11"/></svg>',
  share: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  save: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  verified: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1l2.6 2.1 3.3-.4 1.1 3.2 3 1.6-.9 3.2 2.1 2.6-2.3 2.4.6 3.3-3.2 1.1-1.3 3-3.2-1.4L12 23l-2.9-1.6-3.2 1.3-1.2-3.2-3.2-.9L2.5 15 1.6 12 3.4 9.8 2.4 6.6l3.3-.9L7 2.5l3.2.8z"/><path d="M10.5 15.2 7.8 12.5l1.4-1.4 1.3 1.3 4.2-4.2 1.4 1.4z" fill="#fff"/></svg>',
  likeSm: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3z"/><path d="M7 10l5-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7"/></svg>',
  dislikeSm: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3z"/><path d="M17 14l-5 7a2 2 0 0 1-2-2v-4H5a2 2 0 0 1-2-2l1-7a2 2 0 0 1 2-2h11"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  sun: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/></svg>',
  moon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
};

// ---------- localStorage wrapper ----------

// Small helper object around localStorage so all the data is stored under
// the "ytc." prefix and we never have to write try/catch everywhere.
const store = {
  // Read an array from storage, fallback if missing or corrupted.
  get(ns, fallback = []) {
    try {
      const v = JSON.parse(localStorage.getItem('ytc.' + ns));
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  },

  // Save an array to storage.
  set(ns, value) {
    localStorage.setItem('ytc.' + ns, JSON.stringify(value));
  },

  // Check whether an id exists inside a stored list.
  has(ns, id) {
    return this.get(ns).includes(id);
  },

  // Add/remove an id from a list and return true if it was added.
  toggle(ns, id) {
    const arr = this.get(ns);
    const i = arr.indexOf(id);
    if (i > -1) arr.splice(i, 1);
    else arr.unshift(id);
    this.set(ns, arr);
    return i === -1;
  },

  // Add an id to the front of a list, skipping duplicates.
  push(ns, id) {
    const arr = this.get(ns);
    if (!arr.includes(id)) {
      arr.unshift(id);
      this.set(ns, arr);
    }
  }
};

// ---------- Routing ----------

// The different pages of the app (all rendered inside #app). The order
// here also matches the sidebar so highlighting stays in sync.
const PAGES = ['home', 'trending', 'subscriptions', 'library', 'history', 'liked'];

// Human readable titles used for both the document title and the sidebar.
const PAGE_TITLES = {
  home: 'Home',
  trending: 'Trending',
  subscriptions: 'Subscriptions',
  library: 'Library',
  history: 'History',
  liked: 'Liked videos'
};

// Remember which category filter is active on the home page.
let currentCategory = 'All';

// Timer handle for the toast notification.
let toastTimer;

// Changes the url hash, which triggers the router. Pass an id for watch pages.
function navigate(page, id) {
  location.hash = id != null ? `#/${page}/${id}` : `#/${page}`;
}

// Reads the current hash and splits it into page name + id, e.g. "#/watch/5".
function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name = 'home', id] = raw.split('/');
  return { name: name || 'home', id };
}

// Highlights the sidebar link that matches the current page.
function setActiveSidebar(page) {
  $$('.side-link').forEach((link) => link.classList.toggle('active', link.dataset.route === page));
}

// The main router. Decides which view to render based on the hash and
// closes any open mobile menus before switching.
function resolveRoute() {
  const { name, id } = parseRoute();
  document.body.classList.remove('sidebar-open', 'search-open');

  if (name === 'watch') {
    setActiveSidebar(null);
    document.title = 'Watch - YouTube Clone';
    renderWatch(id);
    return;
  }

  const page = PAGES.includes(name) ? name : 'home';
  setActiveSidebar(page);
  document.title = `${PAGE_TITLES[page]} - YouTube Clone`;
  renderHome(page);
}

// Returns the starting list of videos for each sidebar page.
// Trending sorts by views, the rest filter from stored activity.
function getBaseVideos(page) {
  switch (page) {
    case 'trending':
      return [...videos].sort((a, b) => b.views - a.views).slice(0, 8);
    case 'subscriptions':
      return videos.filter((v) => store.has('subscriptions', v.channelId));
    case 'library':
      return store.get('watchLater').map((id) => videos.find((v) => v.id === id)).filter(Boolean);
    case 'history':
      return store.get('history').map((id) => videos.find((v) => v.id === id)).filter(Boolean);
    case 'liked':
      return store.get('liked').map((id) => videos.find((v) => v.id === id)).filter(Boolean);
    default:
      return [...videos];
  }
}

// Returns the [title, description] to show when a page has nothing in it.
function pageEmpty(page) {
  const list = getBaseVideos(page);
  if (page === 'subscriptions')
    return ['No subscriptions yet', 'Hit Subscribe on any channel and its videos will show up here.'];
  if (page === 'history') return ['No watch history', 'Videos you watch will appear here.'];
  if (page === 'liked') return ['No liked videos', 'Tap the like button on a video to save it here.'];
  if (page === 'library') return ['Your library is empty', 'Use Save on a video to add it to your library.'];
  return list.length ? null : ['No videos found', 'Try a different category.'];
}

// ---------- Home page ----------

// Renders the category chips + an empty grid, then fills the grid.
function renderHome(page) {
  currentCategory = 'All';
  const chips = ['All', ...new Set(videos.map((v) => v.category))];

  $('#app').innerHTML = `
    <div class="chips" id="chips">
      ${chips.map((c) => `<button class="chip${c === 'All' ? ' active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
    </div>
    <div class="grid" id="grid"></div>`;

  // Clicking a chip filters the current page's videos by category.
  $('#chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    currentCategory = chip.dataset.cat;
    $$('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderGrid(page);
  });

  renderGrid(page);
}

// Fills the grid with skeleton cards first for a smooth feel, then swaps
// in the real video cards (or an empty state) after a tiny delay.
function renderGrid(page) {
  const grid = $('#grid');
  if (!grid) return;

  grid.innerHTML = skeletonCards(8);
  clearTimeout(grid._t);
  grid._t = setTimeout(() => {
    let list = getBaseVideos(page);
    if (currentCategory !== 'All') list = list.filter((v) => v.category === currentCategory);

    if (!list.length) {
      const [title, sub] = pageEmpty(page);
      grid.innerHTML = emptyState(title, sub);
      return;
    }
    grid.innerHTML = list.map((v) => videoCard(v)).join('');
  }, 300);
}

// Checks if the user is subscribed to this video's channel.
function isSubscribed(v) {
  return store.has('subscriptions', v.channelId);
}

// Builds the HTML for one video card in the grid.
function videoCard(v) {
  return `
    <article class="card" data-id="${v.id}" tabindex="0" aria-label="Watch ${escapeHtml(v.title)}">
      <div class="thumb">
        <img src="${v.thumbnail}" alt="${escapeHtml(v.title)}" loading="lazy" onerror="this.onerror=null;this.src=fallbackThumb(${v.id})" />
        <span class="duration-badge">${v.duration}</span>
      </div>
      <div class="card-body">
        <div class="avatar avatar-sm" style="--hue:${hue(v.channel)}">${initial(v.channel)}</div>
        <div class="card-info">
          <h3 class="card-title">${escapeHtml(v.title)}</h3>
          <p class="card-channel">${escapeHtml(v.channel)}${isSubscribed(v) ? icons.verified : ''}</p>
          <p class="card-meta">${formatCount(v.views)} views · ${v.uploaded}</p>
        </div>
      </div>
    </article>`;
}

// Renders the search results page with a header showing how many matched.
function renderSearch(query) {
  const results = videos.filter((v) =>
    `${v.title} ${v.channel} ${v.category}`.toLowerCase().includes(query.toLowerCase())
  );

  $('#app').innerHTML = `
    <div class="results-header">
      <h1>Search results for &quot;${escapeHtml(query)}&quot;</h1>
      <p>${results.length} video${results.length === 1 ? '' : 's'} found</p>
    </div>
    <div class="grid" id="grid"></div>`;

  const grid = $('#grid');
  grid.innerHTML = skeletonCards(6);
  clearTimeout(grid._t);
  grid._t = setTimeout(() => {
    grid.innerHTML = results.length
      ? results.map((v) => videoCard(v)).join('')
      : emptyState('No results found', `Nothing matches "${escapeHtml(query)}". Try a different search.`);
  }, 300);
}

// Returns a string of skeleton placeholder cards for the loading state.
function skeletonCards(n = 8) {
  return Array.from(
    { length: n },
    () => `
      <article class="card sk">
        <div class="thumb shimmer"></div>
        <div class="card-body">
          <div class="avatar shimmer"></div>
          <div class="card-info">
            <div class="shimmer line w80"></div>
            <div class="shimmer line w60"></div>
            <div class="shimmer line w40"></div>
          </div>
        </div>
      </article>`
  ).join('');
}

// Builds the centered "nothing here" message used on empty pages.
function emptyState(title, sub) {
  return `
    <div class="empty">
      ${icons.search}
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(sub)}</p>
    </div>`;
}

// ---------- Watch page ----------

// Renders the full video player page for the given video id.
function renderWatch(id) {
  const video = videos.find((v) => v.id === +id);
  const app = $('#app');

  if (!video) {
    document.title = 'Video not found - YouTube Clone';
    app.innerHTML = emptyState('Video not found', 'This video may have been removed or the link is invalid.');
    return;
  }

  document.title = `${video.title} - YouTube Clone`;
  store.push('history', video.id);

  const liked = store.has('liked', video.id);
  const saved = store.has('watchLater', video.id);
  const subscribed = store.has('subscriptions', video.channelId);
  const related = videos.filter((v) => v.id !== video.id).slice(0, 10);
  const seedComments = getCommentsForVideo(video.id);
  const myComments = store.get('comments.' + video.id);
  const commentTotal = seedComments.length + myComments.length;

  app.innerHTML = `
    <div class="watch">
      <div class="watch-main">
        <div class="player">
          <iframe src="${video.videoUrl}?rel=0" title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>

        <h1 class="watch-title">${escapeHtml(video.title)}</h1>
        <div class="watch-meta">
          <span>${formatCount(video.views)} views</span>
          <span>·</span>
          <span>${video.uploaded}</span>
          <span>·</span>
          <span>${formatCount(video.likes + (liked ? 1 : 0))} likes</span>
        </div>

        <div class="watch-actions">
          <div class="actions-group">
            <button class="action-btn ${liked ? 'active' : ''}" id="likeBtn" type="button">
              ${icons.like}<span class="like-count">${formatCount(video.likes + (liked ? 1 : 0))}</span>
            </button>
            <span class="divider"></span>
            <button class="action-btn" id="dislikeBtn" type="button">${icons.dislike}</button>
          </div>
          <button class="action-btn" id="shareBtn" type="button">${icons.share}<span>Share</span></button>
          <button class="action-btn ${saved ? 'active' : ''}" id="saveBtn" type="button">
            ${icons.save}<span class="save-label">${saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        <div class="channel-row">
          <div class="avatar" style="--hue:${hue(video.channel)}">${initial(video.channel)}</div>
          <div class="channel-meta">
            <strong>${escapeHtml(video.channel)}${isSubscribed(video) ? ' ' + icons.verified : ''}</strong>
            <span>${formatCount(video.subscribers)} subscribers</span>
          </div>
          <button class="subscribe-btn ${subscribed ? 'subscribed' : ''}" id="subscribeBtn" type="button">
            ${subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        <div class="description">
          <p><strong>${formatCount(video.views)} views · ${video.uploaded}</strong></p>
          <p style="margin-top:8px">${escapeHtml(video.description).replace(/\n/g, '<br>')}</p>
        </div>

        <section class="comments">
          <h2><span id="commentCount">${formatCount(commentTotal)}</span> Comments</h2>
          <div class="add-comment">
            <div class="avatar avatar-sm" style="--hue:200">Y</div>
            <input class="comment-input" id="commentInput" type="text" placeholder="Add a comment..." autocomplete="off" />
          </div>
          <div class="comment-list" id="commentList">${commentHtml([...myComments, ...seedComments])}</div>
        </section>
      </div>

      <aside class="related-list">
        <h3 class="related-title">Related videos</h3>
        ${related.map((v) => relatedItem(v)).join('')}
      </aside>
    </div>`;

  bindWatchActions(video, seedComments.length);
}

// Builds one item in the "Related videos" sidebar.
function relatedItem(v) {
  return `
    <div class="related" data-id="${v.id}" tabindex="0" role="button" aria-label="Watch ${escapeHtml(v.title)}">
      <div class="related-thumb">
        <img src="${v.thumbnail}" alt="" loading="lazy" onerror="this.onerror=null;this.src=fallbackThumb(${v.id})" />
        <span class="duration-badge">${v.duration}</span>
      </div>
      <div class="related-info">
        <h4>${escapeHtml(v.title)}</h4>
        <p>${escapeHtml(v.channel)}</p>
        <p>${formatCount(v.views)} views · ${v.uploaded}</p>
      </div>
    </div>`;
}

// Turns an array of comment objects into the comment list markup.
function commentHtml(list) {
  return list
    .map(
      (c) => `
      <div class="comment">
        <div class="avatar avatar-sm" style="--hue:${hue(c.user)}">${initial(c.user)}</div>
        <div class="comment-body">
          <div class="comment-head"><strong>${escapeHtml(c.user)}</strong><span>${c.time}</span></div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
          <div class="comment-actions">${icons.likeSm}<span class="count">${formatCount(c.likes)}</span>${icons.dislikeSm}<span>Reply</span></div>
        </div>
      </div>`
    )
    .join('');
}

// Wires up all the click handlers on the watch page (like, save, etc.).
function bindWatchActions(video, seedCount) {
  const likeBtn = $('#likeBtn');
  const dislikeBtn = $('#dislikeBtn');
  const shareBtn = $('#shareBtn');
  const saveBtn = $('#saveBtn');
  const subscribeBtn = $('#subscribeBtn');
  const commentInput = $('#commentInput');

  // Like/Unlike toggle, stored so the Liked page stays in sync.
  likeBtn.addEventListener('click', () => {
    const liked = store.toggle('liked', video.id);
    likeBtn.classList.toggle('active', liked);
    $('.like-count', likeBtn).textContent = formatCount(video.likes + (liked ? 1 : 0));
    if (liked) dislikeBtn.classList.remove('active');
    toast(liked ? 'Added to Liked videos' : 'Removed from Liked videos');
  });

  // Dislike is just a visual toggle for now.
  dislikeBtn.addEventListener('click', () => {
    const disliked = dislikeBtn.classList.toggle('active');
    if (disliked && likeBtn.classList.contains('active')) {
      likeBtn.classList.remove('active');
      $('.like-count', likeBtn).textContent = formatCount(video.likes);
    }
  });

  // Copies the current page url to the clipboard.
  shareBtn.addEventListener('click', () => {
    navigator.clipboard
      .writeText(location.href)
      .then(() => toast('Link copied to clipboard'))
      .catch(() => toast('Could not copy link'));
  });

  // Save/un-save to the Library (watch later).
  saveBtn.addEventListener('click', () => {
    const saved = store.toggle('watchLater', video.id);
    saveBtn.classList.toggle('active', saved);
    $('.save-label', saveBtn).textContent = saved ? 'Saved' : 'Save';
    toast(saved ? 'Saved to Library' : 'Removed from Library');
  });

  // Subscribe/unsubscribe, stored by channel so the Subscriptions page works.
  subscribeBtn.addEventListener('click', () => {
    const subscribed = store.toggle('subscriptions', video.channelId);
    subscribeBtn.classList.toggle('subscribed', subscribed);
    subscribeBtn.textContent = subscribed ? 'Subscribed' : 'Subscribe';
    toast(subscribed ? `Subscribed to ${video.channel}` : 'Unsubscribed');
  });

  // Pressing Enter in the comment box posts the comment to the top of the list.
  commentInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const text = commentInput.value.trim();
    if (!text) return;

    const key = 'comments.' + video.id;
    const list = store.get(key);
    list.unshift({ user: 'You', text, time: 'just now', likes: 0 });
    store.set(key, list);

    commentInput.value = '';
    $('#commentList').innerHTML = commentHtml([...list, ...getCommentsForVideo(video.id)]);
    $('#commentCount').textContent = formatCount(list.length + seedCount);
    toast('Comment posted');
  });
}

// ---------- Search ----------

// Sets up the whole search experience: live filtering, the suggestion
// dropdown, keyboard navigation and the mobile search button.
function initSearch() {
  const input = $('#searchInput');
  const form = $('#searchForm');
  const box = $('#suggestions');
  const mobileBtn = $('#searchMobileBtn');
  let selected = -1;

  // Hides the suggestion dropdown and resets keyboard selection.
  const close = () => {
    box.hidden = true;
    selected = -1;
  };

  // Draws the suggestion buttons inside the dropdown.
  const renderItems = (items, q) => {
    if (!items.length) return close();
    box.innerHTML = items
      .map(
        (item, i) => `
        <button class="sugg" type="button" data-i="${i}" data-text="${escapeHtml(item.text)}">
          ${item.type === 'history' ? icons.clock : icons.search}
          <span class="sugg-text">${highlight(item.text, q)}</span>
          ${item.type === 'history' ? '<span class="sugg-x">×</span>' : ''}
        </button>`
      )
      .join('');
    box.hidden = false;
  };

  // Collects the suggestions (recent searches + matching titles).
  const update = (q) => {
    const history = store.get('searchHistory');
    const items = [];

    history
      .filter((h) => h.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5)
      .forEach((h) => items.push({ type: 'history', text: h }));

    if (q) {
      videos
        .filter((v) => v.title.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 5)
        .forEach((v) => items.push({ type: 'video', text: v.title }));
    } else {
      history.slice(0, 8).forEach((h) => items.push({ type: 'history', text: h }));
    }

    renderItems(items.slice(0, 8), q);
  };

  // Actually runs the search: saves it to history and renders results.
  const submit = (q) => {
    q = q.trim();
    close();
    input.blur();
    if (!q) {
      navigate('home');
      return;
    }
    const history = store.get('searchHistory');
    store.set('searchHistory', [q, ...history.filter((h) => h.toLowerCase() !== q.toLowerCase())].slice(0, 8));
    renderSearch(q);
  };

  // Live filter as you type + show suggestions when focusing.
  input.addEventListener('input', debounce(() => update(input.value.trim()), 200));
  input.addEventListener('focus', () => update(input.value.trim()));

  // Arrow keys move through suggestions, Enter submits, Escape closes.
  input.addEventListener('keydown', (e) => {
    const items = $$('.sugg', box);

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return update(input.value.trim());
      selected =
        e.key === 'ArrowDown' ? Math.min(selected + 1, items.length - 1) : Math.max(selected - 1, 0);
      items.forEach((b, i) => b.classList.toggle('selected', i === selected));
      items[selected]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected > -1 && items[selected]) {
        input.value = items[selected].dataset.text;
        submit(items[selected].dataset.text);
      } else {
        submit(input.value);
      }
    } else if (e.key === 'Escape') {
      close();
      input.blur();
    }
  });

  // Clicking a suggestion runs it; clicking the × removes it from history.
  box.addEventListener('click', (e) => {
    const remove = e.target.closest('.sugg-x');
    if (remove) {
      const text = e.target.closest('.sugg').dataset.text;
      store.set(
        'searchHistory',
        store.get('searchHistory').filter((h) => h !== text)
      );
      update(input.value.trim());
      return;
    }
    const item = e.target.closest('.sugg');
    if (item) {
      input.value = item.dataset.text;
      submit(item.dataset.text);
    }
  });

  // Form submit (Enter or the search button) runs the search.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit(input.value);
  });

  // On mobile the search bar is hidden; this toggles it open.
  mobileBtn.addEventListener('click', () => {
    document.body.classList.toggle('search-open');
    if (document.body.classList.contains('search-open')) input.focus();
  });

  // Clicking anywhere outside the search box closes the suggestions.
  document.addEventListener('click', (e) => {
    if (!$('#search').contains(e.target)) close();
  });
}

// Wraps the matching part of a suggestion in a <mark> tag.
function highlight(text, q) {
  const safe = escapeHtml(text);
  if (!q) return safe;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return safe;
  return (
    escapeHtml(text.slice(0, i)) +
    '<mark>' +
    escapeHtml(text.slice(i, i + q.length)) +
    '</mark>' +
    escapeHtml(text.slice(i + q.length))
  );
}

// ---------- Theme + sidebar ----------

// Reads the saved theme (dark/light), applies it, and handles the toggle.
function initTheme() {
  const btn = $('#themeBtn');
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    btn.innerHTML = theme === 'dark' ? icons.sun : icons.moon;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  apply(localStorage.getItem('ytc.theme') || 'dark');
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ytc.theme', next);
    apply(next);
  });
}

// Handles the sidebar: mini mode on desktop, slide-in drawer on mobile.
function initSidebar() {
  const menuBtn = $('#menuBtn');
  const overlay = $('#overlay');
  const isMobile = () => window.innerWidth <= 768;

  // Applies (or removes) the mini sidebar class based on saved state.
  const applyMini = () => {
    document.body.classList.toggle('sidebar-mini', store.get('sidebarMini', false) && !isMobile());
  };

  applyMini();

  menuBtn.addEventListener('click', () => {
    if (isMobile()) {
      const open = document.body.classList.toggle('sidebar-open');
      overlay.classList.toggle('active', open);
    } else {
      store.set('sidebarMini', !store.get('sidebarMini', false));
      applyMini();
    }
  });

  // Tapping the dark overlay closes the mobile drawer.
  overlay.addEventListener('click', () => {
    document.body.classList.remove('sidebar-open');
    overlay.classList.remove('active');
  });

  // Re-evaluate on resize so the sidebar behaves when crossing breakpoints.
  window.addEventListener('resize', debounce(applyMini, 150));
}

// ---------- Global click handling ----------

// Event delegation for opening videos. The grid, related list and keyboard
// support all funnel through here, so we don't attach per-card listeners.
function initDelegation() {
  const openFrom = (el) => {
    const id = +el.dataset.id;
    store.push('history', id);
    navigate('watch', id);
  };

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-id]');
    if (card) return openFrom(card);
    const related = e.target.closest('.related[data-id]');
    if (related) openFrom(related);
  });

  // Enter/Space on a focused card also opens the video.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('.card[data-id], .related[data-id]');
    if (el) {
      e.preventDefault();
      openFrom(el);
    }
  });
}

// Shows a small toast message at the bottom of the screen.
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ---------- Startup ----------

// Boots everything once the DOM is ready, then renders the current route.
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initSearch();
  initDelegation();
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
});
