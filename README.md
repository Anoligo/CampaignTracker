# Iron Meridian Campaign Tracker

## Running Locally

1. Install dependencies with `npm install`.
2. Build the CSS using `npm run build`.
3. Open `index.html` directly in your browser. The page is fully
   self‑contained so it can also be hosted from services like GitHub Pages.
4. *(Optional)* Run `npm start` to launch a small dev server if you
   prefer live includes while editing templates.

## Functional Specification (Non-Technical)

This document outlines the full user-facing functional structure of the Iron Meridian Campaign Tracker for Pathfinder 2e.

---

## 🔼 Global Navigation

### Left-Hand Navigation Panel

* The application should use a **left-hand sidebar navigation panel** to access major sections.
* This panel should include clearly labeled links to:

  * Dashboard
  * Quests
  * Players
  * Locations
  * Loot
  * Factions
  * Map
  * NPCs
  * Notes
* Active section should be highlighted
* Sidebar remains visible on all pages (collapsible on mobile)

---

## 💾 Data Persistence & Portability

### Purpose

Ensure user-entered campaign data is reliably saved and can be exported or imported easily.

### Behavior

* All user data should be **persisted locally using Local Storage** by default.
* Data should be automatically saved on change.
* Provide clear UI options to:

  * **Export Data** as a `.json` file
  * **Import Data** from a `.json` file
* Show a confirmation before overwriting existing data when importing
* Allow optional manual save/load buttons in a settings or tools panel

---

## 📅 1. Dashboard Overview

### Purpose

A central control panel for quick access to high-level game state, recent activity, and core sections.

### Features

* Recently updated quests, characters, and factions
* Quick summaries of character status
* Recent map activity or discovered locations
* Action buttons: "New Quest", "Add Loot", "Log Session"

---

## 📖 2. Quest Management

### Purpose

Track all quests (active, completed, failed) and their relationships with other world elements.

### Features

* Create/edit/delete quests
* Fields: title, description, type (main, side, personal), status, notes
* Attach related locations, items, and factions via searchable dropdowns
* Relational linking with other quests
* Resolution tracking (e.g. session, date, XP gain)

---

## 🦝 3. Player & Character Management

### Purpose

Maintain character details, backstories, current status, and unique effects.

### Features

* Character profile with name, class, level, ancestry
* Backstory (long-form text)
* Inventory and loot (including cursed/special items)
* GM notes and tags
* Activity log or XP progression (optional)

---

## 🏛️ 4. Location Tracker

### Purpose

Manage known and discovered locations within the world.

### Features

* Add/edit location entries with:

  * Name, description, type, tags
  * Linked quests or factions (dropdown)
  * record coordinates and show interactive pins on map
* Faction control indicator
* Discovered/unexplored toggle

---

## 💼 5. Item & Loot Management

### Purpose

Track all lootable items, magical objects, and cursed artifacts.

### Features

* Item entry includes name, description, rarity, tags
* Assign loot to quests or characters via searchable dropdowns
* Random loot pool generator
* Filter by rarity or type (weapon, trinket, cursed, etc.)
* GM notes for each item

---

## 🛡️ 6. Faction Tracker

### Purpose

Represent political, religious, or arcane powers influencing the world.

### Features

* Faction profile includes:

  * Name, description, alignment, influence (0–100)
  * Relationship to guild (ally, neutral, hostile)
  * Known NPCs and locations
  * Associated quests (dropdown-linked)
* Tags and influence chart for visual display

---

## 📜 7. Notes & Backstory Logs

### Purpose

Store long-form content for both players and the GM.

### Features

* Markdown-compatible entries
* Tagged by type: backstory, GM notes, session recap
* Linkable to characters, quests, or locations
* Searchable index or filter by author/date/type

---

## 🧙 8. NPC Management

### Purpose

Keep track of non-player characters, especially recurring or quest-critical ones.

### Features

* Name, role, physical notes, known affiliations
* Faction link (dropdown)
* Linked quests and known locations
* Status (alive, missing, dead, ascended, etc.)

---

## ☣️ 9. Curses, Conditions & Effects

### Purpose

Apply and track magical or supernatural states on player characters.

### Features

* Name, effect, duration, and description
* Assign via searchable dropdown to one or more characters
* Display active effects on character cards
* Filter characters by effect presence

---

## 🔍 10. Global Search & Filters

### Purpose

Quickly access and refine data across all tracker categories.

### Features

* Search bar with auto-complete (quests, characters, locations, etc.)
* Filters for quest status, faction alignment, item rarity, etc.
* Sorting tools in list or grid views

---

## 🌎 11. Interactive Map System

### Purpose

Allow users to explore and interact with the campaign world visually.

### Features

* Pins for each known location
* Clickable map pins open location detail panel
* Click a location in the sidebar list to zoom to its map pin and highlight it
* Smooth pan/zoom, optional grid/map skin overlays
* Location filters (e.g. show only discovered, only faction-controlled)
* Add new locations via "drop a pin" interface
* Hover or tooltip previews for each pin

---

## 🔗 12. Relational Link UX Rule

### Global Rule for Linking Items:

> All connections between entities (e.g. quests to loot, locations to factions, characters to curses) must use **searchable dropdown fields**. Do not use raw text inputs, modals, or ID entry.

### Components Used:

* Multi-select capable dropdowns
* Grouped/tagged results
* Clear and intuitive label + value visibility

---

This structure ensures the application stays user-friendly, visually consistent, and focused on easy campaign management without excessive complexity.
