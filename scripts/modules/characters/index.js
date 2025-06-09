// Re-export all components for the characters module
export { Character } from './characters.js';
export { CharacterService } from './services/character-service.js';
export { CharacterUI } from './ui/character-ui.js';
// CharacterDetails uses a named export, so re-export it accordingly
export { CharacterDetails } from './ui/character-details.js';
export { CharactersManager } from './characters-manager.js';
export { initializeCharactersSection } from './characters-section.js';
