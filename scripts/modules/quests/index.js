// Re-export all the main components for easier importing
export * from './enums/quest-enums.js';
export { Quest } from './models/quest-model.js';
export { QuestService } from './services/quest-service.js';
export { QuestsManager } from './quests-manager.js';

// Export UI components
export { QuestUI } from './ui/quest-ui-new.js';

// Constants
export const QUEST_TYPES = {
    MAIN: 'main',
    SIDE: 'side',
    GUILD: 'guild',
    OTHER: 'other'
};

export const QUEST_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed',
    ON_HOLD: 'on-hold'
};
