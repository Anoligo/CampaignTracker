# Core Modules

This directory contains the core modules of the Pathfinder World Tracker application.

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
scripts/
├── core/
│   ├── state/           # State management
│   │   ├── app-state.js     # Application-specific state
│   │   └── state-manager.js # Generic state management
│   │
│   ├── navigation/      # Navigation and routing
│   │   └── navigation-manager.js
│   │
│   ├── storage/         # Data persistence
│   │   └── storage-manager.js
│   │
│   ├── utils/           # Utility functions
│   │
│   └── initialization/  # Application initialization
│       └── app-initializer.js
│
├── modules/            # Feature modules
│   ├── characters/      # Character management
│   ├── quests/          # Quest management
│   └── ...
└── components/         # Reusable UI components
```

## Core Components

### State Management

- **StateManager**: Generic state management with persistence and subscriptions
- **AppState**: Application-specific state management extending StateManager

### Navigation

- **NavigationManager**: Handles client-side routing and navigation

### Storage

- **StorageManager**: Handles localStorage operations with error handling

### Initialization

- **AppInitializer**: Coordinates application startup

## Usage

### Accessing State

```javascript
import { appState } from './core/state/app-state.js';

// Subscribe to state changes
const unsubscribe = appState.subscribe((state) => {
  console.log('State changed:', state);
});

// Update state
appState.update({ ui: { theme: 'dark' } });

// Unsubscribe
unsubscribe();
```

### Navigation

```javascript
import NavigationManager from './core/navigation/navigation-manager.js';

const navManager = new NavigationManager({
  defaultSection: 'dashboard',
  onNavigate: (section) => {
    console.log(`Navigated to: ${section}`);
  }
});

// Navigate to a section
navManager.navigateTo('characters');
```

### Storage

```javascript
import { StorageManager } from './core/storage/storage-manager.js';

// Save data
StorageManager.save('key', { foo: 'bar' });

// Load data
const data = StorageManager.load('key');

// Remove data
StorageManager.remove('key');
```

## Development Guidelines

1. **State Management**
   - Use `appState` for all application state
   - Keep state updates minimal and focused
   - Subscribe to state changes for reactive updates

2. **Navigation**
   - Use the NavigationManager for all navigation
   - Keep URLs clean and meaningful
   - Use data attributes for navigation links

3. **Storage**
   - Use StorageManager for all persistent storage
   - Handle errors gracefully
   - Be mindful of storage limits

4. **Initialization**
   - Add initialization code to AppInitializer
   - Keep the main entry point clean and minimal
