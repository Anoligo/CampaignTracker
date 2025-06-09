/**
 * Quests Module - Compatibility Layer
 * 
 * This file provides backward compatibility for imports from './modules/quests.js'.
 * New code should import directly from './modules/quests/index.js' instead.
 */

// Re-export all the necessary components from the new module structure
export { Quest, QuestType, QuestStatus } from './quests/index.js';
export { QuestsManager as QuestManager } from './quests/quests-manager.js';

// Default export for backward compatibility
export default {
    Quest,
    QuestType,
    QuestStatus,
    QuestManager: QuestsManager
};
