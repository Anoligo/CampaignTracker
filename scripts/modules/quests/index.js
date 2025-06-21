// Re-export all the main components for easier importing
export * from './enums/quest-enums.js';

// Models
export { Quest } from './models/quest-model.js';

// Services
export { QuestService } from './services/quest-service-new.js';

// Manager
export { QuestsManager } from './quests-manager-new.js';

// UI Components
export { QuestUI } from './ui/quest-ui-main.js';

// Constants - Use enums instead of these constants
import { QuestStatus, QuestType } from './enums/quest-enums.js';

export const QUEST_TYPES = {
    MAIN: QuestType.MAIN,
    SIDE: QuestType.SIDE,
    GUILD: QuestType.GUILD,
    OTHER: QuestType.OTHER
};

export const QUEST_STATUS = {
    ACTIVE: QuestStatus.ACTIVE,
    COMPLETED: QuestStatus.COMPLETED,
    FAILED: QuestStatus.FAILED,
    AVAILABLE: QuestStatus.AVAILABLE
};

// For backward compatibility
export { QuestService as LegacyQuestService } from './services/quest-service.js';
export { QuestsManager as LegacyQuestsManager } from './quests-manager.js';
