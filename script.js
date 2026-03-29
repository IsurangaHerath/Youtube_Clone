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

// Handle search functionality
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        const filteredVideos = videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            video.channel.toLowerCase().includes(searchTerm)
        );
        
        renderVideos(filteredVideos);
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
