// Re-export all the main components for easier importing
export * from './enums/note-enums.js';

// Models
export { Note } from './models/note-model.js';

// Services
export { NotesService } from './services/notes-service-new.js';

// Manager
export { NotesManager } from './notes-manager-new.js';

// UI Components
export { NotesUI } from './ui/notes-ui-new.js';

// For backward compatibility
export { NotesService as LegacyNotesService } from './services/notes-service.js';
export { NotesManager as LegacyNotesManager } from './notes-manager.js';
