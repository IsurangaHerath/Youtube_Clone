// ========================================
// YouTube Clone - JavaScript Functions
// Simple and readable code
// ========================================

// Get URL parameters - used to know which page we're on
function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ========================================
// HOMEPAGE FUNCTIONS
// ========================================

// Get the video grid element from the page
const videoGrid = document.getElementById('videoGrid');

// Function to create HTML for a single video card
function createVideoCard(video) {
    // Return the HTML template for a video card
    return `
        <div class="video-card" onclick="openVideo(${video.id})">
            <div class="thumbnail-container">
                <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail">
                <span class="duration">${video.duration}</span>
            </div>
            <div class="video-info">
                <img src="${video.thumbnail}" alt="" class="channel-avatar-small">
                <div class="video-details">
                    <h3 class="video-card-title">${video.title}</h3>
                    <p class="channel-name">${video.channel}</p>
                    <p class="video-meta">${video.views} • ${video.uploaded}</p>
                </div>
            </div>
        </div>
    `;
}

// Function to render all videos on the homepage
function renderVideos(videoList = videos) {
    // Check if we're on the homepage (videoGrid exists)
    if (!videoGrid) return;
    
    // Map each video to its HTML and join them together
    videoGrid.innerHTML = videoList.map(createVideoCard).join('');
}

// Function to handle search
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    
    // Only run if we're on the homepage with search input
    if (!searchInput) return;
    
    // Add event listener for typing in the search bar
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        // Filter videos based on the search term
        const filteredVideos = videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            video.channel.toLowerCase().includes(searchTerm)
        );
        
        // Re-render with filtered videos
        renderVideos(filteredVideos);
    });
}

// ========================================
// VIDEO PLAYER PAGE FUNCTIONS
// ========================================

// Function to open a video in the player page
function openVideo(videoId) {
    // Navigate to video page with the video ID as a parameter
    window.location.href = `video.html?id=${videoId}`;
}

// Function to load video details on the player page
function loadVideoDetails() {
    // Get the video ID from the URL
    const videoId = parseInt(getUrlParameter('id'));
    
    // Find the video in our data
    const video = videos.find(v => v.id === videoId);
    
    // If video not found, show error message
    if (!video) {
        document.getElementById('videoTitle').textContent = 'Video not found';
        return;
    }
    
    // Update the video player iframe
    const videoFrame = document.getElementById('videoFrame');
    if (videoFrame) {
        videoFrame.src = video.videoUrl;
    }
    
    // Update video details
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoViews').textContent = video.views;
    document.getElementById('videoDate').textContent = '• Uploaded ' + video.uploaded;
    document.getElementById('channelName').textContent = video.channel;
    document.getElementById('channelAvatar').textContent = video.channel.charAt(0);
    
    // Update page title
    document.title = video.title + ' - YouTube Clone';
    
    // Load related videos (all videos except current one)
    loadRelatedVideos(videoId);
    
    // Load comments
    renderComments();
}

// Function to load related videos in the sidebar
function loadRelatedVideos(currentVideoId) {
    const relatedContainer = document.getElementById('relatedVideos');
    if (!relatedContainer) return;
    
    // Filter out the current video and take first 10
    const related = videos.filter(v => v.id !== currentVideoId).slice(0, 10);
    
    // Create HTML for related videos
    relatedContainer.innerHTML = related.map(video => `
        <div class="related-video-item" onclick="openVideo(${video.id})">
            <img src="${video.thumbnail}" alt="" class="related-thumbnail">
            <div class="related-info">
                <h4 class="related-video-title">${video.title}</h4>
                <p class="related-channel-name">${video.channel}</p>
                <p class="related-meta">${video.views} • ${video.uploaded}</p>
            </div>
        </div>
    `).join('');
}

// Function to render comments
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    // Create HTML for each comment
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

// ========================================
// INTERACTIVE BUTTONS
// ========================================

// Handle like button click
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

// Handle subscribe button click
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

// Helper function to format numbers (e.g., 1200 -> 1.2K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ========================================
// INITIALIZATION
// ========================================

// This runs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and load the appropriate content
    
    // If we're on the homepage (videoGrid exists)
    if (videoGrid) {
        renderVideos();
        handleSearch();
    }
    
    // If we're on the video page (videoFrame exists)
    if (document.getElementById('videoFrame')) {
        loadVideoDetails();
        setupLikeButton();
        setupSubscribeButton();
    }
});
