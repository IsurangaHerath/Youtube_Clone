/*
 * data.js - all the sample data for the site
 *
 * The `videos` array drives everything: the home grid, search results,
 * related videos and the watch page. Each video has:
 *
 *   id          - unique number used in the url hash (#/watch/12)
 *   title       - video title
 *   channel     - display name of the channel
 *   channelId   - internal id, used to track subscriptions
 *   subscribers - total subscribers of the channel
 *   category    - used for the filter chips on the home page
 *   duration    - shown as a badge on the thumbnail ("LIVE" for streams)
 *   views       - raw number, formatted by script.js
 *   uploaded    - relative time shown to the user
 *   uploadDate  - ISO date, useful if we ever add sorting by date
 *   likes       - raw like count
 *   thumbnail   - image shown on the card
 *   videoUrl    - youtube embed url for the player iframe
 *   description - shown under the player, "\n" becomes a line break
 *
 * The `comments` array is a pool of generic comments. getCommentsForVideo()
 * picks a deterministic subset for each video so they don't all look the same.
 */

const videos = [
  {
    id: 1,
    title: "HTML Tutorial for Beginners - Build Your First Website",
    channel: "CodeMaster Pro",
    channelId: "codemaster-pro",
    subscribers: 1240000,
    category: "Programming",
    duration: "15:30",
    views: 1200000,
    uploaded: "2 days ago",
    uploadDate: "2024-03-23",
    likes: 45100,
    thumbnail: "https://picsum.photos/seed/html-basics/640/360",
    videoUrl: "https://www.youtube.com/embed/Pjwc6lncN4o",
    description:
      "Learn HTML from scratch in this beginner-friendly tutorial. We cover document structure, headings, links, images, forms, and semantic markup - everything you need to build your first website.\n\n00:00 Intro\n02:00 Setup\n08:00 Core tags\n30:00 Forms and media\n45:00 Publishing your site"
  },
  {
    id: 2,
    title: "Learn CSS - Flexbox, Grid and Modern Layout",
    channel: "Web Dev Simplified",
    channelId: "webdev-simplified",
    subscribers: 890000,
    category: "Web Dev",
    duration: "22:45",
    views: 890000,
    uploaded: "1 week ago",
    uploadDate: "2024-03-18",
    likes: 32000,
    thumbnail: "https://picsum.photos/seed/css-layout/640/360",
    videoUrl: "https://www.youtube.com/embed/yfoY53QXEnI",
    description:
      "Master modern CSS with practical examples. From selectors and the box model to Flexbox, Grid, and responsive design - this guide walks through real layouts step by step."
  },
  {
    id: 3,
    title: "JavaScript Crash Course - Full Introduction",
    channel: "CodeMaster Pro",
    channelId: "codemaster-pro",
    subscribers: 1240000,
    category: "Programming",
    duration: "45:00",
    views: 2100000,
    uploaded: "3 days ago",
    uploadDate: "2024-03-22",
    likes: 88900,
    thumbnail: "https://picsum.photos/seed/js-crash/640/360",
    videoUrl: "https://www.youtube.com/embed/PkZNo7MFNFg",
    description:
      "A fast-paced introduction to JavaScript: variables, functions, arrays, objects, the DOM, and ES6+ features with hands-on exercises along the way."
  },
  {
    id: 4,
    title: "Python for Beginners - Complete Course",
    channel: "Python Academy",
    channelId: "python-academy",
    subscribers: 2100000,
    category: "Data Science",
    duration: "1:30:00",
    views: 3400000,
    uploaded: "1 month ago",
    uploadDate: "2024-02-25",
    likes: 152000,
    thumbnail: "https://picsum.photos/seed/python-course/640/360",
    videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
    description:
      "The complete beginner course for Python. Learn syntax, control flow, functions, data structures, and build mini-projects to reinforce each concept."
  },
  {
    id: 5,
    title: "Learn React - Build a Modern Todo App",
    channel: "Frontend Masters",
    channelId: "frontend-masters",
    subscribers: 640000,
    category: "Web Dev",
    duration: "35:15",
    views: 445000,
    uploaded: "2 weeks ago",
    uploadDate: "2024-03-11",
    likes: 18400,
    thumbnail: "https://picsum.photos/seed/react-todo/640/360",
    videoUrl: "https://www.youtube.com/embed/DLuxEQ9wBcA",
    description:
      "Build a working Todo app with React. Covers components, props, state, hooks, and event handling - the perfect starting point for modern frontend development."
  },
  {
    id: 6,
    title: "Big Buck Bunny - Open Source Short Film in 4K",
    channel: "Blender Foundation",
    channelId: "blender-foundation",
    subscribers: 950000,
    category: "Films & Animation",
    duration: "10:34",
    views: 7800000,
    uploaded: "3 weeks ago",
    uploadDate: "2024-02-10",
    likes: 214000,
    thumbnail: "https://picsum.photos/seed/big-buck-bunny/640/360",
    videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    description:
      "Enjoy the classic open-source short film from the Blender Foundation. Watch the gentle giant of the forest take on the village bullies in stunning quality."
  },
  {
    id: 7,
    title: "Never Gonna Give You Up - Official Music Video",
    channel: "Music Official",
    channelId: "music-official",
    subscribers: 5600000,
    category: "Music",
    duration: "3:32",
    views: 15000000,
    uploaded: "1 week ago",
    uploadDate: "2024-03-14",
    likes: 890000,
    thumbnail: "https://picsum.photos/seed/rickroll/640/360",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:
      "The legendary music video that never gives up. One of the most watched videos on the internet."
  },
  {
    id: 8,
    title: "Gangnam Style - The Global Phenomenon",
    channel: "PSY Official",
    channelId: "psy-official",
    subscribers: 2300000,
    category: "Music",
    duration: "4:12",
    views: 9800000,
    uploaded: "2 months ago",
    uploadDate: "2024-01-05",
    likes: 432000,
    thumbnail: "https://picsum.photos/seed/gangnam/640/360",
    videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    description:
      "The global phenomenon that broke the internet. Watch the iconic dance routine that started it all."
  },
  {
    id: 9,
    title: "Me at the Zoo - The First YouTube Video",
    channel: "YouTube Founders",
    channelId: "youtube-founders",
    subscribers: 1800000,
    category: "Entertainment",
    duration: "0:19",
    views: 320000000,
    uploaded: "2 years ago",
    uploadDate: "2022-04-23",
    likes: 910000,
    thumbnail: "https://picsum.photos/seed/me-at-the-zoo/640/360",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    description: "The very first video ever uploaded to YouTube. A piece of internet history."
  },
  {
    id: 10,
    title: "Lofi Hip Hop Radio - Beats to Relax / Study To",
    channel: "Lofi Girl",
    channelId: "lofi-girl",
    subscribers: 4200000,
    category: "Music",
    duration: "LIVE",
    views: 56000000,
    uploaded: "4 months ago",
    uploadDate: "2023-11-30",
    likes: 1200000,
    thumbnail: "https://picsum.photos/seed/lofi/640/360",
    videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
    description:
      "24/7 lofi hip hop radio - beats to relax/study to. The perfect background soundtrack for coding, studying, or unwinding."
  },
  {
    id: 11,
    title: "YouTube Data API - Build Powerful Integrations",
    channel: "Google Developers",
    channelId: "google-developers",
    subscribers: 3100000,
    category: "Programming",
    duration: "18:40",
    views: 275000,
    uploaded: "5 days ago",
    uploadDate: "2024-03-21",
    likes: 9800,
    thumbnail: "https://picsum.photos/seed/youtube-api/640/360",
    videoUrl: "https://www.youtube.com/embed/M7lc1UVf-VE",
    description:
      "Learn how to use the YouTube Data API and Google APIs in your own apps - fetch videos, run searches, and build powerful integrations."
  },
  {
    id: 12,
    title: "Node.js Full Course for Beginners - Build a REST API",
    channel: "Backend Buddy",
    channelId: "backend-buddy",
    subscribers: 780000,
    category: "Backend",
    duration: "55:00",
    views: 780000,
    uploaded: "4 days ago",
    uploadDate: "2024-03-21",
    likes: 26700,
    thumbnail: "https://picsum.photos/seed/nodejs/640/360",
    videoUrl: "https://www.youtube.com/embed/1b2IXQygD1I",
    description:
      "A complete Node.js course for beginners: modules, the file system, HTTP servers, npm, and a real REST API project you can extend on your own."
  }
];

// A shared pool of comments. Each video shows a different slice of this
// list so the comment section always looks populated but varied.
const comments = [
  { user: "Alex Johnson", time: "1 day ago", likes: 342, text: "This is exactly what I needed. The pacing is perfect and the examples are super clear." },
  { user: "Sarah Miller", time: "2 days ago", likes: 189, text: "Finally a tutorial that explains things simply without skipping the important details." },
  { user: "Mike Chen", time: "3 days ago", likes: 156, text: "Please make a part 2! I'd love to see more advanced topics covered like this." },
  { user: "Emily Davis", time: "5 days ago", likes: 98, text: "I've been learning for a while and still picked up several new tricks. Thanks for sharing!" },
  { user: "Chris Wilson", time: "1 week ago", likes: 67, text: "The section at 5:30 clarified something I've been stuck on for days. Great work." },
  { user: "Priya Patel", time: "3 days ago", likes: 210, text: "Straight to the point and no fluff. This is how tutorials should be made." },
  { user: "James Brown", time: "4 days ago", likes: 45, text: "Bookmarked this one. Going to watch it again with my teammates." },
  { user: "Lena Fischer", time: "2 weeks ago", likes: 78, text: "The examples are really relatable and the code is clean. Subscribed!" },
  { user: "Tom Okafor", time: "6 days ago", likes: 52, text: "Anyone else here because they want to switch careers? This gives me confidence." },
  { user: "Hana Kim", time: "1 month ago", likes: 120, text: "Quality content. The timestamps in the description are super helpful." }
];

// Returns the same 5 comments every time for a given video id, so each
// video feels like it has its own comment section.
function getCommentsForVideo(videoId) {
  const start = (videoId * 5) % comments.length;
  return [...comments.slice(start), ...comments.slice(0, start)].slice(0, 5);
}
