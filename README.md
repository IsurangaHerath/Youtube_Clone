# YouTube Clone

A modern, fully functional YouTube clone built with **vanilla HTML, CSS, and JavaScript** — no frameworks, no build tools. It's a single-page app with hash routing, a dark/light theme, live search with suggestions, and persistent likes, subscriptions, watch history, and comments.

> Everything runs in the browser. Your activity (likes, history, subscriptions, comments) is saved to `localStorage`, so it survives page reloads.

## Features

- **Single-page app** — Home, search results, and the video player all live in one `index.html` and swap via clean hash routes (`#/home`, `#/watch/12`).
- **Real video playback** — The player embeds actual YouTube videos, each with a related-videos sidebar.
- **Live search** — Filters videos as you type, with a suggestion dropdown (recent searches + matching titles), keyboard navigation, and search history.
- **Category filters** — Pill chips for All, Programming, Web Dev, Music, Films & Animation, and more.
- **Full interactivity** — Like / dislike, share (copies the link), save to your library, and subscribe to channels.
- **Smart sidebar** — Home, Trending, Subscriptions, Library, History, and Liked videos are real views backed by your actual activity.
- **Comments** — Post comments that persist per video.
- **Theme toggle** — Dark and light themes with the choice remembered between visits.
- **Responsive** — Collapsible mini-sidebar on desktop, slide-in drawer + expanding search on mobile.
- **Polish** — Skeleton loading, shimmer effects, empty states, toast notifications, keyboard accessibility, and fallback thumbnails if an image fails to load.

## Project structure

```
youtube-clone/
├── index.html    # App shell: header, sidebar, and the <main id="app"> views render into
├── style.css     # Design tokens, dark/light theming, responsive layout
├── script.js     # Router, rendering, search, state, and all interactions
├── data.js       # Video catalog + comment pool and getCommentsForVideo()
├── video.html    # Legacy redirect so old /video.html?id=N links still work
└── README.md
```

## Getting started

Any static file server works — there's no build step.

```bash
# Python
python -m http.server 8000

# Or with npx
npx serve .
```

Then open `http://localhost:8000`. You can also just double-click `index.html`.

## How it works

**Routing.** The app listens for `hashchange`. `#/` renders the home grid, `#/watch/:id` renders the player for that video. Clicking any card navigates via the hash, so the browser back button works too.

**State.** All user data lives in `localStorage` under the `ytc.*` prefix:

| Key | Purpose |
| --- | --- |
| `ytc.theme` | `dark` / `light` |
| `ytc.sidebarMini` | Whether the desktop sidebar is collapsed |
| `ytc.searchHistory` | Recent searches |
| `ytc.history` | Videos you've watched |
| `ytc.liked` | Videos you've liked |
| `ytc.watchLater` | Videos you've saved |
| `ytc.subscriptions` | Channels you're subscribed to |
| `ytc.comments.<videoId>` | Your comments on each video |

**Rendering.** Views are generated from template strings in `script.js`. Data is escaped before being inserted, so user input (e.g. comments) can't inject HTML.

## Tech

- HTML5, CSS3 (Grid, Flexbox, custom properties), vanilla JavaScript
- [Roboto](https://fonts.google.com/specimen/Roboto) for typography
- [Picsum Photos](https://picsum.photos/) for thumbnails, with auto-generated SVG placeholders as a fallback
- Real YouTube embeds for playback

## License

MIT — free to use for learning and for your portfolio.
