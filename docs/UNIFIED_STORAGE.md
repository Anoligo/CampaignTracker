# Unified Storage Architecture

This document outlines the unified storage architecture used throughout the application for data persistence. All modules should follow this pattern to ensure consistency and reliability.

## Overview

The application uses a single, unified state object (`appState`) for all data persistence. This object is managed by the `DataService` and is automatically persisted to `localStorage`.

## Key Principles

1. **Single Source of Truth**: All application data is stored in a single `appState` object.
2. **Immutable Updates**: State updates should be immutable to ensure predictable behavior.
3. **Separation of Concerns**:
   - **Services**: Handle business logic and data operations
   - **UI Components**: Handle presentation and user interactions
   - **State Management**: Handled by `DataService`
4. **Type Safety**: Use TypeScript interfaces/types for all data structures.

## Implementation Guidelines

### 1. Service Layer

Each module should have a service that handles all data operations. The service should:

- Be initialized with a `DataService` instance
- Access data through `this.dataService.appState`
- Implement CRUD operations for the module's data
- Handle data validation and normalization

Example:

```typescript
export class ExampleService {
  constructor(dataService) {
    this.dataService = dataService;
    this.ensureInitialized();
  }

  ensureInitialized() {
    if (!Array.isArray(this.dataService.appState.examples)) {
      this.dataService.appState.examples = [];
    }
  }

  // CRUD operations...
}
```

### 2. Data Structure

All data should follow this structure:

```typescript
interface AppState {
  // Module data
  loot: LootItem[];
  players: Player[];
  quests: Quest[];
  notes: Note[];
  locations: Location[];
  
  // UI state (if needed)
  ui: {
    // Module-specific UI state
    [module: string]: any;
  };
}
```

### 3. CRUD Operations

Each service should implement these standard CRUD operations:

- `createX(data)`: Create a new item
- `getXById(id)`: Retrieve an item by ID
- `getAllX()`: Retrieve all items
- `updateX(id, updates)`: Update an item
- `deleteX(id)`: Delete an item

### 4. Data Validation

Always validate data before saving it to the state. Use a validation library or custom validation functions.

### 5. Error Handling

Handle errors gracefully and provide meaningful error messages. Log errors for debugging.

### 6. Testing

Write tests for all service methods. Use the `StorageTestRunner` for testing CRUD operations.

## Best Practices

1. **Immutability**: Always create new objects/arrays when updating state.
2. **Normalization**: Store data in a normalized form when possible.
3. **Performance**: Be mindful of performance when working with large datasets.
4. **Security**: Never store sensitive information in `localStorage`.
5. **Backward Compatibility**: Handle data migration when changing data structures.

## Example Implementation

### Service Implementation

```typescript
// services/example-service.js
export class ExampleService {
  constructor(dataService) {
    this.dataService = dataService;
    this.ensureInitialized();
  }

  ensureInitialized() {
    if (!Array.isArray(this.dataService.appState.examples)) {
      this.dataService.appState.examples = [];
    }
  }

  createExample(data) {
    const example = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.dataService.appState.examples = [
      ...this.dataService.appState.examples,
      example
    ];

    this.dataService.saveData();
    return example;
  }

  // Other CRUD methods...
}
```

### Manager Implementation

```typescript
// managers/example-manager.js
export class ExampleManager {
  constructor(dataService) {
    this.service = new ExampleService(dataService);
    this.ui = new ExampleUI(this);
  }

  // Public API methods...
}
```

## Testing

Use the `StorageTestRunner` to test CRUD operations:

```javascript
import { StorageTestRunner } from '../tests/storage/unified-storage-tests';

const testRunner = new StorageTestRunner();
testRunner.runAllTests().catch(console.error);
```

## Migration Guide

When adding a new module:

1. Create a service class that follows the pattern above
2. Add the module's data structure to `AppState`
3. Implement CRUD operations in the service
4. Write tests using `StorageTestRunner`
5. Update this documentation if needed

## Troubleshooting

### Data Not Persisting
- Ensure `dataService.saveData()` is called after modifications
- Check for errors in the console
- Verify the storage key is correct

### Performance Issues
- Avoid deep cloning large objects
- Use pagination for large lists
- Consider using indexes for frequent lookups

## Future Improvements

- Add support for offline-first functionality
- Implement data synchronization with a backend
- Add data migration utilities
- Implement data versioning

---

*Last updated: June 2025*
