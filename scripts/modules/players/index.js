// Re-export all the main components for easier importing
export * from './enums/player-enums.js';

// Models
export { Player } from './models/player-model.js';

// Services
export { PlayerService } from './services/player-service-new.js';

// UI Components
export { PlayerUI } from './ui/player-ui-new.js';
export { PlayerForms } from './ui/player-forms.js';

// Manager
export { PlayersManager } from './players-manager-new.js';

// Section Initializer
export { initializePlayersSection } from './players-section.js';

// For backward compatibility
export { PlayerService as LegacyPlayerService } from './services/player-service.js';
