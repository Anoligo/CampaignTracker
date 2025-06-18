// Re-export all components for the characters module
export { Character } from './characters.js';

export * from './services/character-service-new.js';
export { CharacterUI } from './ui/character-ui.js';

export { CharacterDetails } from './ui/character-details.js';

export { CharactersManager } from './characters-manager-new.js';

export { initializeCharactersSection } from './characters-section.js';

// For backward compatibility
export { CharacterService as LegacyCharacterService } from './services/character-service.js';
