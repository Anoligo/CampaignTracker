# Guild Module

This module handles guild-related functionality including activities and resource management.

## Structure

```
guild/
├── enums/
│   └── guild-enums.js      # Guild-related enums (activity types, resource types)
├── models/
│   ├── guild-activity-model.js  # GuildActivity class
│   └── guild-resource-model.js  # GuildResource class
├── services/
│   └── guild-service.js   # Business logic for guild operations
├── ui/
│   └── guild-ui.js        # UI components for the guild module
├── guild-manager.js       # Main manager for guild functionality
└── index.js               # Public API exports
```

## Usage

### Importing

```javascript
// Recommended (new code)
import { GuildManager, GuildActivity, GuildResource } from './modules/guild/index.js';

// Legacy (deprecated but still works)
import GuildManager from './modules/guild.js';
```

### Creating a GuildManager

```javascript
const guildManager = new GuildManager(dataManager);
```

### Managing Activities

```javascript
// Create a new activity
const activity = guildManager.createNewActivity({
    name: 'Dragon Slaying',
    description: 'Defeat the ancient red dragon',
    type: GuildActivityType.QUEST
});

// Get all activities
const activities = guildManager.getAllActivities();

// Update an activity
guildManager.updateActivity(activityId, {
    status: 'completed',
    description: 'Updated description'
});

// Delete an activity
guildManager.deleteActivity(activityId);
```

### Managing Resources

```javascript
// Create a new resource
const resource = guildManager.createNewResource({
    name: 'Gold Coins',
    description: 'Standard currency',
    type: GuildResourceType.GOLD,
    quantity: 1000
});

// Add/remove quantity
guildManager.addResourceQuantity(resourceId, 500);
guildManager.removeResourceQuantity(resourceId, 200);

// Get all resources
const resources = guildManager.getAllResources();
```

## Data Structure

### GuildActivity
- `id`: Unique identifier
- `name`: Activity name
- `description`: Detailed description
- `type`: Type of activity (from GuildActivityType)
- `status`: Current status (pending, in-progress, completed, failed)
- `rewards`: Array of reward strings
- `participants`: Array of participant strings
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### GuildResource
- `id`: Unique identifier
- `name`: Resource name
- `description`: Resource description
- `type`: Type of resource (from GuildResourceType)
- `quantity`: Current quantity
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Enums

### GuildActivityType
- `QUEST`: Standard quest
- `MISSION`: Special mission
- `RESOURCE`: Resource gathering
- `REPUTATION`: Reputation task
- `MEMBER`: Member-related activity
- `OTHER`: Other type of activity

### GuildResourceType
- `GOLD`: Currency
- `ITEM`: Physical items
- `REPUTATION`: Reputation points
- `OTHER`: Other type of resource
