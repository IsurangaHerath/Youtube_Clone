# YouTube Clone - 12 Week Development Roadmap

A beginner-friendly YouTube clone project for learning web development and building your GitHub portfolio.

---

## 📁 Project Folder Structure

```
youtube-clone/
├── index.html          # Homepage with video grid
├── video.html          # Video player page
├── style.css           # All styling
├── script.js           # JavaScript functionality
├── data.js             # Sample video data
├── assets/
│   └── images/         # Thumbnails placeholders
├── plans/              # Development plans
└── README.md           # Project documentation
```

---

## 📅 12-Week Development Roadmap

### Week 1: Project Setup & Basic HTML Structure

**Goal:** Set up the project and create the basic HTML structure for the homepage.

**Features:**
- Create project folder structure
- Create basic index.html with header and video grid container
- Add basic CSS reset and font setup

**Files to Create/Update:**
- `index.html` - Basic structure with header, search bar placeholder, video grid
- `style.css` - Basic reset and layout styles

**Example Code - index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Clone</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="logo">YouTube</div>
        <input type="text" class="search-bar" placeholder="Search">
    </header>

    <!-- Main Content -->
    <main class="video-grid">
        <!-- Videos will be added here -->
    </main>
</body>
</html>
```

**GitHub Commit Message:** "Set up project structure and basic HTML for homepage"

---

### Week 2: Video Card Component

**Goal:** Create the video card component to display video thumbnails, titles, and channel names.

**Features:**
- Design video card HTML structure
- Style video cards with CSS
- Add sample video data in data.js

**Files to Create/Update:**
- `index.html` - Add video card container
- `style.css` - Style video cards
- `data.js` - Create sample video data array

**Example Code - data.js:**
```javascript
// Sample video data - simple array of video objects
const videos = [
    {
        id: 1,
        title: "Learn Web Development in 2024",
        channel: "CodeMaster",
        thumbnail: "https://picsum.photos/320/180?random=1",
        views: "1.2M views",
        uploaded: "2 days ago"
    },
    // Add more videos...
];
```

**GitHub Commit Message:** "Add video card component and sample video data"

---

### Week 3: Render Videos with JavaScript

**Goal:** Use JavaScript to dynamically render video cards from the data array.

**Features:**
- Create renderVideos() function in script.js
- Generate HTML for each video card
- Append to video grid container

**Files to Create/Update:**
- `script.js` - Add renderVideos function

**Example Code - script.js:**
```javascript
// Get video grid container
const videoGrid = document.querySelector('.video-grid');

// Function to create video card HTML
function createVideoCard(video) {
    return `
        <div class="video-card">
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.channel}</p>
                <span>${video.views} • ${video.uploaded}</span>
            </div>
        </div>
    `;
}

// Render all videos
function renderVideos() {
    videoGrid.innerHTML = videos.map(createVideoCard).join('');
}

// Call on page load
renderVideos();
```

**GitHub Commit Message:** "Implement dynamic video rendering with JavaScript"

---

### Week 4: Video Player Page

**Goal:** Create the video player page and navigation between home and video pages.

**Features:**
- Create video.html page
- Add video player iframe
- Pass video ID via URL parameters
- Load selected video on video page

**Files to Create/Update:**
- `video.html` - New video player page
- `style.css` - Video player styles
- `script.js` - Add logic to load video based on URL

**Example Code - video.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <a href="index.html" class="back-button">← Back</a>
        <h1 class="video-title">Video Title</h1>
    </header>
    
    <main class="video-player-container">
        <div class="video-player">
            <iframe id="video-frame" width="100%" height="480" frameborder="0"></iframe>
        </div>
        <div class="video-details">
            <h2 id="video-title">Video Title</h2>
            <p id="video-channel">Channel Name</p>
        </div>
    </main>
    
    <script src="data.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

**GitHub Commit Message:** "Add video player page with URL parameter navigation"

---

### Week 5: Search Functionality

**Goal:** Add search bar to filter videos by title in real-time.

**Features:**
- Add search input event listener
- Filter videos array based on search query
- Re-render video grid with filtered results

**Files to Update:**
- `script.js` - Add search functionality

**Example Code - script.js:**
```javascript
// Search functionality
const searchBar = document.querySelector('.search-bar');

searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Filter videos by title
    const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm)
    );
    
    // Re-render with filtered videos
    renderVideos(filteredVideos);
});

// Update renderVideos to accept parameter
function renderVideos(videoList = videos) {
    videoGrid.innerHTML = videoList.map(createVideoCard).join('');
}
```

**GitHub Commit Message:** "Implement search functionality to filter videos"

---

### Week 6: Responsive Layout

**Goal:** Make the video grid responsive for different screen sizes.

**Features:**
- Use CSS Grid for responsive layout
- Add media queries for mobile, tablet, desktop
- Adjust video card sizes accordingly

**Files to Update:**
- `style.css` - Add responsive grid and media queries

**Example Code - style.css:**
```css
/* Video Grid - Responsive */
.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 20px;
}

/* Tablet */
@media (max-width: 768px) {
    .video-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
}

/* Mobile */
@media (max-width: 480px) {
    .video-grid {
        grid-template-columns: 1fr;
    }
    
    .header {
        flex-direction: column;
        gap: 10px;
    }
}
```

**GitHub Commit Message:** "Add responsive layout with CSS Grid and media queries"

---

### Week 7: Sidebar Navigation

**Goal:** Add a sidebar with navigation links.

**Features:**
- Create sidebar HTML structure
- Style sidebar with links (Home, Trending, Subscriptions)
- Make sidebar collapsible on mobile

**Files to Update:**
- `index.html` - Add sidebar
- `style.css` - Style sidebar

**Example Code - index.html:**
```html
<body>
    <nav class="sidebar">
        <a href="index.html" class="sidebar-link active">Home</a>
        <a href="#" class="sidebar-link">Trending</a>
        <a href="#" class="sidebar-link">Subscriptions</a>
        <a href="#" class="sidebar-link">Library</a>
    </nav>
    
    <main class="main-content">
        <!-- existing content -->
    </main>
</body>
```

**GitHub Commit Message:** "Add sidebar navigation with responsive behavior"

---

### Week 8: Like and Subscribe Buttons

**Goal:** Add interactive like and subscribe buttons to the video page.

**Features:**
- Add like button with counter
- Add subscribe button
- Simple JavaScript toggle functionality

**Files to Update:**
- `video.html` - Add buttons
- `style.css` - Style buttons
- `script.js` - Add button functionality

**Example Code - video.html (in video-details):**
```html
<div class="video-actions">
    <button class="like-btn" id="like-btn">
        👍 Like <span id="like-count">0</span>
    </button>
    <button class="subscribe-btn" id="subscribe-btn">
        Subscribe
    </button>
</div>
```

**GitHub Commit Message:** "Add like and subscribe buttons with interactivity"

---

### Week 9: Comments Section

**Goal:** Add a simple comments section to the video page.

**Features:**
- Display static comment data
- Add comment input form
- Show comment count

**Files to Update:**
- `video.html` - Add comments section
- `style.css` - Style comments
- `data.js` - Add sample comments data
- `script.js` - Render comments

**Example Code - data.js:**
```javascript
// Add to each video object
const sampleComments = [
    { user: "User1", text: "Great video!", time: "1 day ago" },
    { user: "User2", text: "Thanks for sharing", time: "2 days ago" },
];
```

**GitHub Commit Message:** "Add comments section to video page"

---

### Week 10: Video Upload UI (Basic)

**Goal:** Create a simple video upload interface (frontend only).

**Features:**
- Create upload.html page
- Add file input for video selection
- Add form for title, description, tags
- Show upload progress (simulated)

**Files to Create:**
- `upload.html` - Upload page
- `style.css` - Upload page styles
- `script.js` - Upload form handling

**Example Code - upload.html:**
```html
<main class="upload-container">
    <h1>Upload Video</h1>
    <form class="upload-form" id="upload-form">
        <div class="file-input">
            <input type="file" id="video-file" accept="video/*">
            <label for="video-file">Choose Video</label>
        </div>
        <input type="text" placeholder="Video Title">
        <textarea placeholder="Description"></textarea>
        <button type="submit">Upload</button>
    </form>
</main>
```

**GitHub Commit Message:** "Add video upload UI with form handling"

---

### Week 11: UI Improvements

**Goal:** Polish the UI with better styling and user experience.

**Features:**
- Improve color scheme and typography
- Add hover effects on cards and buttons
- Improve spacing and alignment
- Add loading states

**Files to Update:**
- `style.css` - Polish all styles

**Example Improvements:**
- Add box-shadow on video cards
- Add hover scale effect on thumbnails
- Improve button styles
- Add smooth transitions

**GitHub Commit Message:** "Polish UI with improved styling and hover effects"

---

### Week 12: Final Touches & Documentation

**Goal:** Complete the project with final touches and documentation.

**Features:**
- Fix any bugs or issues
- Add README.md with project info
- Clean up code and add comments
- Test all features

**Files to Update/Create:**
- `README.md` - Project documentation
- All files - Add final comments and cleanup

**GitHub Commit Message:** "Complete project with documentation and final improvements"

---

## 📝 README Template

```markdown
# YouTube Clone

A beginner-friendly YouTube clone built with HTML, CSS, and JavaScript.

## Features

- Video homepage with grid layout
- Video player page
- Search functionality
- Responsive design
- Like and subscribe buttons
- Comments section
- Video upload UI

## Tech Stack

- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript (Vanilla)

## Getting Started

1. Clone the repository
2. Open index.html in your browser

## Project Structure

```
youtube-clone/
├── index.html      - Homepage
├── video.html      - Video player
├── style.css       - Styles
├── script.js       - JavaScript
└── data.js         - Sample data
```

## License

MIT

## Author

Your Name
```

---

## 🎯 Tips for Success

1. **Commit weekly** - Make small, incremental changes
2. **Test frequently** - Check your work in the browser after each feature
3. **Ask questions** - Use comments in code to mark areas you don't understand
4. **Keep it simple** - Don't overcomplicate; focus on learning the basics
5. **Customize** - Add your own style and features to make it unique

---

## 📚 Learning Outcomes

After completing this project, you will understand:

- HTML structure and semantics
- CSS layout (Grid, Flexbox)
- JavaScript DOM manipulation
- URL parameters and navigation
- Responsive design principles
- Form handling
- Basic state management
- Code organization and comments
