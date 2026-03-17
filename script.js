// YouTube Clone - JavaScript

// Get URL parameter for video ID
function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Get the video grid element
const videoGrid = document.getElementById('videoGrid');

// Create HTML for a video card
function createVideoCard(video) {
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

// Load video details on video page
function loadVideoDetails() {
    const videoId = parseInt(getUrlParameter('id'));
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

// Load related videos in sidebar
function loadRelatedVideos(currentVideoId) {
    const relatedContainer = document.getElementById('relatedVideos');
    if (!relatedContainer) return;
    
    const related = videos.filter(v => v.id !== currentVideoId).slice(0, 10);
    
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (videoGrid) {
        renderVideos();
        handleSearch();
    }
    
    if (document.getElementById('videoFrame')) {
        loadVideoDetails();
        setupLikeButton();
        setupSubscribeButton();
    }
});
