// Re-export all the main components for easier importing
export * from './schemas/state-schema.js';
export * from './validators/state-validator.js';
export * from './services/data-service.js';

// For backward compatibility
export { DataService as DataManager, saveData } from './services/data-service.js';
