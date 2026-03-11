# SimpletonNote
Notion? Obsidian?
Trying to study productively but run into terrible overly complicated "2nd Brain" apps? Apps with learning curves so high that you might as well want to go back to Google Docs?

SimpletonNote is the very solution that merges the simplicity of old widely used Doc applications, and the task management of Obsidian and Notion.

These apps have many things in common with each other like linking and complex note taking, but sometimes its easier to just be able to write things down without having to think. Our premade templates prioritize ease of note taking for College lectures, homework, and life planning.

# Features:
- rich text editing (with Docs like editing)
- infinite canvas + shapes and arrows
- many premade themes

# Available on:
- Android
- Html
- Demo site(https://aidhshtsk.github.io/SimpletonNote/)

# Multi-File Build

## File Structure

```
simpletonnote/
├── index.html          # Entry point — HTML shell + script tags
├── css/
│   └── styles.css      # All styles (themes, components, layouts)
└── js/
    ├── state.js        # App state (A), save/load, IndexedDB, localStorage
    ├── ui.js           # Sidebar, projects, search, tags, favorites, drag & drop, context menus
    ├── pages.js        # Notebook/page creation, utils, templates (ADHD + classic)
    ├── editor.js       # Rich text editor, toolbar, page tasks panel
    ├── canvas.js       # Infinite & finite canvas, drawing, pressure, zoom
    ├── code.js         # Code editor, JS runner, quiz page type
    ├── tasks.js        # Tasks (list/calendar views), add task modal
    ├── journal.js      # Daily journal, calendar picker, mood/habits/gratitude
    ├── algebra.js      # Algebra solver, step-by-step, inline panel
    └── settings.js     # Settings, themes, autosave listeners, keyboard shortcuts
```

## Running Locally

Because the JS files use `<script src="...">`, you need a local HTTP server
(browsers block file:// cross-origin requests for scripts).

**Quickest options:**

```bash
# Python (built-in)
cd simpletonnote
python3 -m http.server 8080
# → open http://localhost:8080

# Node (npx, no install needed)
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

## Data Persistence

Data is saved to **two independent stores** so nothing is lost:

| Store | Key | Notes |
|-------|-----|-------|
| `localStorage` | `stn5` | Primary; fast sync |
| `localStorage` | `stn5_bak` | Rolling backup of previous save |
| `IndexedDB` | `stn` db → `state` key | Secondary; higher quota (~250 MB) |

**Save triggers:** every edit (debounced 700 ms), tab close (`beforeunload`),
tab switch (`visibilitychange`), window blur, and every 30 s.

**Save File** (⚙ Settings → Save File) bakes all data into a self-contained
`simpletonnote.html` you can keep as a local backup.

## Module Load Order

Scripts must load in the order listed in `index.html`. `state.js` defines the
global `A` object and `saveA`/`loadA` that every other module depends on.
`settings.js` must load last because it calls `loadA()` and `applySettings()`
to boot the app.
