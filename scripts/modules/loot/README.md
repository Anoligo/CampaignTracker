# Loot Module

This module handles the management of in-game items, treasures, and equipment within the Campaign Tracker application.

## Architecture

The loot module follows a modular architecture with clear separation of concerns:

```
loot/
├── enums/           # Enumerations for item types, rarities, etc.
├── models/          # Data models and interfaces
├── services/        # Business logic and data access
├── ui/              # User interface components
│   ├── LootForm.js  # Form for adding/editing items
│   ├── LootList.js  # List view of items
│   └── LootUI.js    # Main UI controller
└── loot-manager.js  # Module entry point and coordinator
```

## Components

### LootUI

The main controller for the Loot UI, extending `BaseUI`. Handles:
- Item listing and filtering
- Item creation/editing
- Search functionality
- State management

### LootList

Displays a list of items with filtering and sorting capabilities.

### LootForm

Handles the form for adding and editing items, including validation and submission.

## Usage

```javascript
import { LootManager, LootUI } from './scripts/modules/loot';

// Initialize the loot module
const lootManager = new LootManager(lootService, dataManager);
await lootManager.initialize();

// Access the UI component
const lootUI = lootManager.getUI();
```

## Data Model

### Item

Represents an in-game item with properties like:
- `id`: Unique identifier
- `name`: Item name
- `type`: Item type (weapon, armor, etc.)
- `rarity`: Item rarity (common, uncommon, etc.)
- `description`: Detailed description
- `value`: Monetary value
- `quantity`: Number of items in stack
- `attuned`: Whether the item is attuned
- `notes`: Additional notes

## Events

The module emits the following events:

- `loot:itemAdded`: When a new item is added
- `loot:itemUpdated`: When an item is updated
- `loot:itemDeleted`: When an item is deleted

## Styling

Uses Bootstrap 5 for styling with custom CSS variables for theming. Follows the application's dark theme with gold accents.

## Dependencies

- `BaseUI`: Base UI component
- `lootService`: Handles data operations
- `dataManager`: Manages application state

## Development

### Adding New Features

1. Add new methods to `LootService` for data operations
2. Update the UI components to use the new methods
3. Add any new form fields to `LootForm`
4. Update the `Item` model if needed

### Testing

Run the test suite with:

```bash
npm test
```
