# YouTube Clone

A modern, fully functional YouTube clone built with vanilla HTML, CSS, and JavaScript. Single-page app with hash routing, dark/light themes, search with suggestions, and persistent likes, subscriptions, history, and comments.

## Features

- **Single-page app** - Home, search results, and video player all served from one `index.html` with clean hash routing (`#/home`, `#/watch/12`)
- **Live video playback** - Real YouTube embeds with related videos sidebar
- **Search** - Instant filtered results, suggestion dropdown with history + title matches, keyboard navigation
- **Category chips** - Filter the grid by topic (All, Programming, Music, ...)
- **Interactivity** - Like / dislike, share (copies link), save to library, subscribe to channels - all persisted in `localStorage`
- **Smart sidebar** - Home, Trending, Subscriptions, Library, History, and Liked videos are real views backed by your activity
- **Comments** - Post comments that persist per video
- **Theme toggle** - Dark and light themes, remembered across visits
- **Responsive** - Desktop mini-sidebar, mobile drawer, and expanding mobile search
- **Polish** - Skeleton loading, shimmer effects, empty states, toasts, keyboard accessibility

## Project Structure

```
youtube-clone/
├── index.html    # App shell: header, sidebar, routing container
├── style.css     # Design tokens, theming, responsive layout
├── script.js     # Router, views, search, state, interactions
├── data.js       # Video catalog, comments, helper for per-video comments
├── video.html    # Legacy redirect (old /video.html?id=N links still work)
└── README.md
```

## How to Run

Any static server works. Open `index.html` directly, or better:

```bash
# Python
python -m http.server 8000

# Or npx
npx serve .
```

Then open `http://localhost:8000`.

## How State Works

Everything is stored under the `ytc.*` keys in `localStorage`:

| Key | Purpose |
| --- | --- |
| `ytc.theme` | `dark` / `light` |
| `ytc.sidebarMini` | Desktop sidebar collapsed state |
| `ytc.searchHistory` | Recent searches |
| `ytc.history` | Videos you watched |
| `ytc.liked` | Videos you liked |
| `ytc.watchLater` | Videos you saved |
| `ytc.subscriptions` | Channels you subscribed to |
| `ytc.comments.<videoId>` | Your comments per video |

## Tech

- HTML5, CSS3 (Grid, Flexbox, custom properties), vanilla JavaScript
- Google Fonts (Roboto) and Picsum Photos for thumbnails
- Self-generated SVG placeholders if thumbnails fail to load
