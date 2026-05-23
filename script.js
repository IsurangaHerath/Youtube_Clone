// YouTube Clone - JavaScript

// Get URL parameter for video ID
function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Get the video grid element
const videoGrid = document.getElementById('videoGrid');

// Create HTML for a video card (modern approach with data attributes)
function createVideoCard(video) {
    return `
        <article class="video-card" data-video-id="${video.id}" tabindex="0" role="button" aria-label="Watch ${video.title}">
            <div class="thumbnail-container">
                <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail" loading="lazy" onerror="this.src='https://picsum.photos/320/180?random=${video.id}'">
                <span class="duration">${video.duration}</span>
            </div>
            <div class="video-info">
                <img src="${video.thumbnail}" alt="" class="channel-avatar-small" loading="lazy" onerror="this.src='https://picsum.photos/36/36?random=${video.id}'">
                <div class="video-details">
                    <h3 class="video-card-title">${video.title}</h3>
                    <p class="channel-name">${video.channel}</p>
                    <p class="video-meta">${video.views} • ${video.uploaded}</p>
                </div>
            </div>
        </article>
    `;
}

// Event delegation for video cards (more efficient than inline handlers)
function setupVideoCardListeners() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;
    
    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.video-card');
        if (card) {
            const videoId = card.dataset.videoId;
            navigateToVideo(videoId);
        }
    });
    
    // Add keyboard support (Enter/Space to open video)
    grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const card = e.target.closest('.video-card');
            if (card) {
                e.preventDefault();
                const videoId = card.dataset.videoId;
                navigateToVideo(videoId);
            }
        }
    });
}

// Modern hash-based routing for navigation
function navigateToVideo(videoId) {
    window.location.hash = `video/${videoId}`;
}

// Parse hash route (modern routing)
function parseRoute() {
    const hash = window.location.hash.slice(1); // Remove leading '#'
    if (hash.startsWith('video/')) {
        const videoId = hash.split('/')[1];
        return { page: 'video', id: videoId };
    }
    return { page: 'home', id: null };
}

// Legacy openVideo for backwards compatibility
function openVideo(videoId) {
    window.location.href = `video.html?id=${videoId}`;
}

// Create skeleton loading card
function createSkeletonCard() {
    return `
        <div class="video-card skeleton">
            <div class="thumbnail-container">
                <div class="skeleton-thumbnail"></div>
                <span class="duration skeleton-duration"></span>
            </div>
            <div class="video-info">
                <div class="skeleton-avatar"></div>
                <div class="video-details">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-channel"></div>
                    <div class="skeleton-meta"></div>
                </div>
            </div>
        </div>
    `;
}

// Show skeleton loading cards
function showSkeletonLoading(count = 8) {
    if (!videoGrid) return;
    videoGrid.innerHTML = Array(count).fill(null).map(() => createSkeletonCard()).join('');
}

// Filter videos by category
function filterByCategory(category) {
    if (category === 'all') {
        renderVideos(videos);
        return;
    }
    const filtered = videos.filter(video => video.category === category);
    renderVideos(filtered);
}

// Sort videos by criteria
function sortVideos(sortBy) {
    let sortedVideos = [...videos];
    
    switch(sortBy) {
        case 'date':
            sortedVideos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            break;
        case 'views':
            sortedVideos.sort((a, b) => parseInt(b.views.replace(/[^0-9]/g, '')) - parseInt(a.views.replace(/[^0-9]/g, '')));
            break;
        case 'alphabetical':
            sortedVideos.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    renderVideos(sortedVideos);
}

// Lazy load images with Intersection Observer
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Render videos to the page
function renderVideos(videoList = videos) {
    if (!videoGrid) return;
    videoGrid.innerHTML = videoList.map(createVideoCard).join('');
}

// Debounce function to limit rapid API calls
function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Search history management with localStorage
const SearchHistory = {
    STORAGE_KEY: 'youtube_clone_search_history',
    MAX_ITEMS: 10,
    
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    },
    
    addToHistory(query) {
        if (!query.trim()) return;
        let history = this.getHistory();
        history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
        history.unshift(query);
        history = history.slice(0, this.MAX_ITEMS);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    },
    
    clearHistory() {
        localStorage.removeItem(this.STORAGE_KEY);
    },
    
    getMatchingHistory(searchTerm) {
        if (!searchTerm) return this.getHistory();
        return this.getHistory().filter(item => 
            item.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
};

// Highlight matching text in results
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Get search suggestions (history + video titles)
function getSearchSuggestions(searchTerm) {
    const suggestions = [];
    const historyMatches = SearchHistory.getMatchingHistory(searchTerm);
    suggestions.push(...historyMatches.map(text => ({ type: 'history', text })));
    
    if (searchTerm) {
        const titleMatches = videos
            .filter(v => v.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 5)
            .map(v => ({ type: 'video', text: v.title }));
        suggestions.push(...titleMatches);
    }
    
    return suggestions.slice(0, 8);
}

// Render search suggestions dropdown
function renderSuggestions(suggestions, searchTerm) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    if (suggestions.length === 0) {
        container.classList.remove('active');
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = suggestions.map((item, index) => {
        const icon = item.type === 'history' ? '🕐' : '🔍';
        const highlightedText = highlightText(item.text, searchTerm);
        return `
            <div class="suggestion-item ${item.type}" data-index="${index}" data-text="${item.text}">
                <span class="suggestion-icon">${icon}</span>
                <span class="suggestion-text">${highlightedText}</span>
                ${item.type === 'history' ? '<button class="suggestion-remove" data-text="' + item.text + '" title="Remove">×</button>' : ''}
            </div>
        `;
    }).join('');
    
    container.classList.add('active');
}

// Handle search functionality (modern with debounce, suggestions, history)
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!searchInput) return;
    
    let selectedIndex = -1;
    let currentSuggestions = [];
    
    const performSearch = debounce((searchTerm) => {
        const filteredVideos = videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.channel.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        renderVideos(filteredVideos);
        
        if (searchTerm) {
            currentSuggestions = getSearchSuggestions(searchTerm);
            renderSuggestions(currentSuggestions, searchTerm);
        } else {
            currentSuggestions = SearchHistory.getHistory().map(text => ({ type: 'history', text }));
            renderSuggestions(currentSuggestions, '');
        }
        selectedIndex = -1;
    }, 250);
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        performSearch(searchTerm);
    });
    
    searchInput.addEventListener('focus', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            currentSuggestions = getSearchSuggestions(searchTerm);
            renderSuggestions(currentSuggestions, searchTerm);
        } else {
            currentSuggestions = SearchHistory.getHistory().map(text => ({ type: 'history', text }));
            renderSuggestions(currentSuggestions, '');
        }
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (!suggestionsContainer.classList.contains('active')) return;
        
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelectedSuggestion(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedSuggestion(items, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const selectedItem = currentSuggestions[selectedIndex];
            if (selectedItem) {
                searchInput.value = selectedItem.text;
                SearchHistory.addToHistory(selectedItem.text);
                suggestionsContainer.classList.remove('active');
                renderVideos(videos.filter(v => 
                    v.title.toLowerCase().includes(selectedItem.text.toLowerCase()) ||
                    v.channel.toLowerCase().includes(selectedItem.text.toLowerCase())
                ));
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.classList.remove('active');
            searchInput.blur();
        }
    });
    
    function updateSelectedSuggestion(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
    }
    
    suggestionsContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.suggestion-remove');
        if (removeBtn) {
            e.stopPropagation();
            const text = removeBtn.dataset.text;
            let history = SearchHistory.getHistory();
            history = history.filter(item => item !== text);
            localStorage.setItem(SearchHistory.STORAGE_KEY, JSON.stringify(history));
            const searchTerm = searchInput.value.trim();
            currentSuggestions = getSearchSuggestions(searchTerm);
            renderSuggestions(currentSuggestions, searchTerm);
            return;
        }
        
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const text = item.dataset.text;
            searchInput.value = text;
            SearchHistory.addToHistory(text);
            suggestionsContainer.classList.remove('active');
            renderVideos(videos.filter(v => 
                v.title.toLowerCase().includes(text.toLowerCase()) ||
                v.channel.toLowerCase().includes(text.toLowerCase())
            ));
        }
    });
    
    document.addEventListener('click', (e) => {
        const container = document.getElementById('searchContainer');
        if (container && !container.contains(e.target)) {
            suggestionsContainer.classList.remove('active');
        }
    });
}

// Navigate to video page
function openVideo(videoId) {
    window.location.href = `video.html?id=${videoId}`;
}

// Load video details on video page (modern hash routing support)
function loadVideoDetails() {
    // Support both hash-based routing (#/video/1) and query params (?id=1)
    const route = parseRoute();
    let videoId = route.id || getUrlParameter('id');
    
    if (!videoId) {
        document.getElementById('videoTitle').textContent = 'Video not found';
        return;
    }
    
    videoId = parseInt(videoId);
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
        document.getElementById('videoTitle').textContent = 'Video not found';
        return;
    }
    
    const videoFrame = document.getElementById('videoFrame');
    if (videoFrame) {
        videoFrame.src = video.videoUrl;
    }
    
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoViews').textContent = video.views;
    document.getElementById('videoDate').textContent = '• Uploaded ' + video.uploaded;
    document.getElementById('channelName').textContent = video.channel;
    document.getElementById('channelAvatar').textContent = video.channel.charAt(0);
    
    document.title = video.title + ' - YouTube Clone';
    
    loadRelatedVideos(videoId);
    renderComments();
}

// Load related videos in sidebar (modern event handling)
function loadRelatedVideos(currentVideoId) {
    const relatedContainer = document.getElementById('relatedVideos');
    if (!relatedContainer) return;
    
    const related = videos.filter(v => v.id !== currentVideoId).slice(0, 10);
    
    relatedContainer.innerHTML = related.map(video => `
        <article class="related-video-item" data-video-id="${video.id}" tabindex="0" role="button" aria-label="Watch ${video.title}">
            <img src="${video.thumbnail}" alt="" class="related-thumbnail" loading="lazy">
            <div class="related-info">
                <h4 class="related-video-title">${video.title}</h4>
                <p class="related-channel-name">${video.channel}</p>
                <p class="related-meta">${video.views} • ${video.uploaded}</p>
            </div>
        </article>
    `).join('');
}

// Setup related videos click handling
function setupRelatedVideosListener() {
    const container = document.getElementById('relatedVideos');
    if (!container) return;
    
    container.addEventListener('click', (e) => {
        const item = e.target.closest('.related-video-item');
        if (item) {
            const videoId = item.dataset.videoId;
            navigateToVideo(videoId);
        }
    });
    
    container.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const item = e.target.closest('.related-video-item');
            if (item) {
                e.preventDefault();
                const videoId = item.dataset.videoId;
                navigateToVideo(videoId);
            }
        }
    });
}

// Listen for hash changes (modern SPA routing)
function setupHashRouting() {
    window.addEventListener('hashchange', () => {
        const route = parseRoute();
        if (route.page === 'video' && document.getElementById('videoFrame')) {
            loadVideoDetails();
        }
    });
}

// Render comments
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <img src="${comment.avatar}" alt="" class="user-avatar comment-avatar">
            <div class="comment-body">
                <div class="comment-header">
                    <span class="comment-user">${comment.user}</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
                <div class="comment-actions">
                    <span class="comment-action">👍 ${comment.likes}</span>
                    <span class="comment-action">👎</span>
                    <span class="comment-action">Reply</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Like button functionality
function setupLikeButton() {
    const likeBtn = document.getElementById('likeBtn');
    if (!likeBtn) return;
    
    let liked = false;
    let likeCount = 1250;
    
    likeBtn.addEventListener('click', () => {
        liked = !liked;
        
        if (liked) {
            likeCount++;
            likeBtn.classList.add('liked');
            document.getElementById('likeCount').textContent = formatNumber(likeCount);
        } else {
            likeCount--;
            likeBtn.classList.remove('liked');
            document.getElementById('likeCount').textContent = formatNumber(likeCount);
        }
    });
}

// Subscribe button functionality
function setupSubscribeButton() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    if (!subscribeBtn) return;
    
    let subscribed = false;
    
    subscribeBtn.addEventListener('click', () => {
        subscribed = !subscribed;
        
        if (subscribed) {
            subscribeBtn.textContent = 'Subscribed ✓';
            subscribeBtn.classList.add('subscribed');
        } else {
            subscribeBtn.textContent = 'Subscribe';
            subscribeBtn.classList.remove('subscribed');
        }
    });
}

// Format numbers (e.g., 1200 -> 1.2K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Initialize on page load (modern approach)
document.addEventListener('DOMContentLoaded', () => {
    // Setup sidebar toggle on all pages (Week 7)
    setupSidebarToggle();
    
    // Check if in hash route mode
    const route = parseRoute();
    
    if (route.page === 'video' && document.getElementById('videoFrame')) {
        // Video page - load with hash routing
        loadVideoDetails();
        setupLikeButton();
        setupSubscribeButton();
        setupRelatedVideosListener();
        setupHashRouting();
    } else if (videoGrid) {
        // Home page
        showSkeletonLoading(8);
        
        setTimeout(() => {
            renderVideos();
            handleSearch();
            setupLazyLoading();
            setupCategoryFilters();
            setupVideoCardListeners(); // Modern event delegation
        }, 500);
    }
    
    // Handle initial hash load
    if (window.location.hash) {
        const route = parseRoute();
        if (route.page === 'video') {
            loadVideoDetails();
        }
    }
});

// Setup category filter buttons
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get category from button text
            const category = btn.textContent;
            
            // Map button text to category values
            const categoryMap = {
                'All': 'all',
                'Web Development': 'Web Dev',
                'JavaScript': 'Programming',
                'Python': 'Programming',
                'CSS': 'Web Dev',
                'React': 'Web Dev',
                'Tutorials': 'all'
            };
            
            filterByCategory(categoryMap[category] || category);
        });
    });
}

// =============================================
// Week 7: Sidebar Navigation Toggle System
// =============================================

// Sidebar state management
const SidebarState = {
    STORAGE_KEY: 'youtube_clone_sidebar_collapsed',
    
    isCollapsed() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || false;
        } catch {
            return false;
        }
    },
    
    setCollapsed(collapsed) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collapsed));
    }
};

// Get current screen size breakpoint
function getBreakpoint() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 992) return 'tablet';
    return 'desktop';
}

// Setup sidebar toggle functionality
function setupSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mainContainer = document.querySelector('.main-container');
    
    if (!menuToggle || !sidebar) return;
    
    let sidebarOpen = false; // For mobile/tablet
    
    // Restore desktop sidebar state
    if (getBreakpoint() === 'desktop' && SidebarState.isCollapsed()) {
        sidebar.classList.add('collapsed');
        if (mainContainer) mainContainer.classList.add('sidebar-collapsed');
    }
    
    // Toggle sidebar based on current breakpoint
    function toggleSidebar() {
        const breakpoint = getBreakpoint();
        
        if (breakpoint === 'mobile') {
            // Mobile: slide sidebar in/out
            sidebarOpen = !sidebarOpen;
            sidebar.classList.toggle('mobile-open', sidebarOpen);
            if (overlay) overlay.classList.toggle('active', sidebarOpen);
            menuToggle.classList.toggle('active', sidebarOpen);
            menuToggle.setAttribute('aria-expanded', sidebarOpen.toString());
            
            // Prevent body scroll when sidebar is open
            document.body.style.overflow = sidebarOpen ? 'hidden' : '';
            
        } else if (breakpoint === 'tablet') {
            // Tablet: expand sidebar overlay on top of content
            sidebarOpen = !sidebarOpen;
            sidebar.classList.toggle('expanded', sidebarOpen);
            if (overlay) overlay.classList.toggle('active', sidebarOpen);
            menuToggle.classList.toggle('active', sidebarOpen);
            menuToggle.setAttribute('aria-expanded', sidebarOpen.toString());
            
        } else {
            // Desktop: collapse/expand sidebar inline
            const isCollapsed = sidebar.classList.toggle('collapsed');
            if (mainContainer) mainContainer.classList.toggle('sidebar-collapsed', isCollapsed);
            SidebarState.setCollapsed(isCollapsed);
            menuToggle.setAttribute('aria-expanded', (!isCollapsed).toString());
        }
    }
    
    // Close sidebar (for mobile/tablet)
    function closeSidebar() {
        sidebarOpen = false;
        sidebar.classList.remove('mobile-open', 'expanded');
        if (overlay) overlay.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    // Click handler for menu toggle
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Keyboard support for menu toggle (Enter/Space)
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar();
        }
    });
    
    // Click overlay to close sidebar
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarOpen) {
            closeSidebar();
        }
    });
    
    // Close mobile/tablet sidebar when a link is clicked
    sidebar.addEventListener('click', (e) => {
        const link = e.target.closest('.sidebar-link');
        if (link && (getBreakpoint() === 'mobile' || getBreakpoint() === 'tablet')) {
            closeSidebar();
        }
    });
    
    // Handle window resize - reset sidebar state when crossing breakpoints
    let lastBreakpoint = getBreakpoint();
    
    window.addEventListener('resize', debounce(() => {
        const currentBreakpoint = getBreakpoint();
        
        if (currentBreakpoint !== lastBreakpoint) {
            // Reset mobile/tablet states when changing breakpoints
            sidebar.classList.remove('mobile-open', 'expanded');
            if (overlay) overlay.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
            sidebarOpen = false;
            
            // Restore desktop collapsed state
            if (currentBreakpoint === 'desktop') {
                const isCollapsed = SidebarState.isCollapsed();
                sidebar.classList.toggle('collapsed', isCollapsed);
                if (mainContainer) mainContainer.classList.toggle('sidebar-collapsed', isCollapsed);
            } else {
                sidebar.classList.remove('collapsed');
                if (mainContainer) mainContainer.classList.remove('sidebar-collapsed');
            }
            
            lastBreakpoint = currentBreakpoint;
        }
    }, 150));
}
