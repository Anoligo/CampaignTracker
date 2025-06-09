/**
 * @file This is a compatibility layer that re-exports from the new module structure.
 * New code should import directly from the specific module files:
 * - `./notes/enums/note-enums` for NoteCategory and NoteTag
 * - `./notes/models/note-model` for the Note class
 * - `./notes/notes-manager` for the NotesManager class
 */

// Re-export all enums
export * from "./notes/enums/note-enums.js";

// Re-export the Note class
export { Note } from "./notes/models/note-model.js";

// Re-export the NotesManager class
export { NotesManager } from "./notes/notes-manager.js";
