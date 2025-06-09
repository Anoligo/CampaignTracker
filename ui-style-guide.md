# Iron Meridian UI Code & Style Conventions

## General Code Style & Formatting

### ✨ Visual Philosophy

* Dark, clean, "arcane-terminal" look.
* Light text on matte-black backgrounds.
* Gold/yellow accents only for focus guidance or highlights.

### ἰ8 Palette Definition

Use CSS custom properties declared in `_variables.scss`. **Never hard-code hex values.**

```scss
--bg-dark:        #1c1c1c;
--bg-card:        #2a2a2a;
--text:           #f5f5f5;
--accent:         #ffc107;
--accent-light:   #ffd966;
--border-light:   #444;
```

### 🌐 Surface & Element Rules

* **Cards** (`.card`, `.report`, `.player-card`):

  * `border-left: 3px solid #555`
  * `box-shadow: none` (default), `transform: translateY(-2px)` on hover
* **Buttons** (`.btn`, `.button`):

  * `background: #2c2c2c; border: var(--border-light)`
  * On hover: `border-color: var(--accent)`
* **Sidebar**:

  * `background: #1f1f1f`
  * Active/hover: `background-color: rgba(255, 217, 102, 0.15)`

### 📅 Typography

* **Headings**:

  * Font size: `clamp(1.25rem, 2vw, 2rem)`
  * Color: `--accent-light`
  * No all-caps
* **Body text**:

  * Font size: `1rem` (desktop) / `0.95rem` (mobile)
  * Color: `--text`
  * Line-height: `1.6`
* **Meta text**:

  * Class: `.text-meta`
  * Font size: `0.85rem`
  * Color: `#bbbbbb` with `opacity: 0.85`
* **Buttons**:

  * Bold
  * Sentence case
  * Size scales with viewport

### ♿ Accessibility Baseline

* WCAG AA 4.5:1 contrast minimum
* Never use color-only visual cues
* Dropdowns and lists are fully keyboard-navigable
* Hit areas must be ≥ 40x40px

---

## 📁 File Size Limits & Folder Structure

### File Scope

* JS/TS modules: ≤ 300 logical lines of code
* SCSS partials: ≤ 250 LOC
* HTML templates: ≤ 250 LOC
* Split at \~80% of limit

### Structure Rules

* One file = one responsibility
* Avoid "misc" catch-alls
* Flat folder hierarchy preferred
* Max nesting depth: 3 levels

### SCSS Syntax

* Max two-level nesting
* One component per file
* Blank lines only between blocks (not inside)

---

## 🔖 Naming Conventions

### CSS / SCSS

* Classes: `kebab-case` (e.g. `.player-card`, `.quest-badge`)
* Utility classes: `u-` prefix (e.g. `.u-hidden`)
* Variables: `--bg-card`, `$z-index-modal`

### JavaScript / TypeScript

* Variables/functions: `camelCase`
* Classes/components: `PascalCase`
* Constants: `UPPER_SNAKE_CASE`

### Files & Folders

* Names: `kebab-case` only
* Name = purpose; avoid `helper.js`, `misc.scss`

#### File Suffixes

* `.component.js` / `.component.ts` — UI component
* `.service.js` / `.service.ts` — data or API service
* `.util.js` / `.util.ts` — utility logic
* `.store.js` / `.store.ts` — state container

`index.js`/`ts` = re-export barrels only — no logic.

---

## 🔧 Functions & UX Logic

### General

* Keep helpers/handlers < 20 lines
* Use early return pattern to avoid nesting
* Arrow functions (< 3 statements), named otherwise

### Relational Data Input

> All relational inputs (e.g. attaching loot to quests, assigning NPCs to factions) **must use a searchable dropdown.**

#### Required features:

* Type-to-search
* Optional multi-select
* Clearable
* Grouping/tagging support

#### Recommended Libraries:

* `Tom Select`
* `Choices.js`
* `Select2`

> Never use free-text fields, ID inputs, or popups for relationship binding.

### Functional Preferences

* Prefer `map`, `filter`, `reduce` over imperative loops
* Encapsulate repeated DOM logic into modules
* Include keyboard support + `aria-*` attributes

---

## 📊 Data Handling Principles

* Theme values (colors, spacing, z-index) are defined in a central map
* Theme tokens = immutable (`!default`, `Object.freeze`, etc.)
* Store form state in structured objects — no primitive soup
* Use `data-*` attributes to store metadata in DOM
* Validation belongs in a dedicated component/class
* Follow RO-RO (Receive Object → Return Object) pattern

---

This guide governs the presentation and formatting of the Iron Meridian UI. It ensures consistency, accessibility, and a clean dark-fantasy tone across all interactions.
