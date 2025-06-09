import { NoteCategory } from '../enums/note-enums.js';

export class NotesUI {
    constructor(notesManager) {
        this.notesManager = notesManager;
        this.dataManager = notesManager.dataManager;
        this.service = notesManager.service;
    }

    initializeNotesSection() {
        const notesSection = document.getElementById('notes');
        if (!notesSection) return;

        notesSection.innerHTML = `
            <div class="container">
                <h2 class="text-accent">Backstories &amp; Notes</h2>
                <div class="row mb-4">
                    <div class="col">
                        <button class="button" id="newNoteBtn">New Note</button>
                    </div>
                </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header bg-card">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="text-accent">Notes List</span>
                                <div class="btn-group">
                                    <button class="button dropdown-toggle" type="button" id="categoryFilter" data-bs-toggle="dropdown">
                                        Filter by Category
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" data-category="all">All Categories</a></li>
                                        ${Object.entries(NoteCategory).map(([key, value]) => 
                                            `<li><a class="dropdown-item" href="#" data-category="${value}">${key.charAt(0) + key.slice(1).toLowerCase()}</a></li>`
                                        ).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body bg-card">
                            <div class="mb-3">
                                <input type="text" class="form-control bg-card text" id="noteSearch" placeholder="Search notes...">
                            </div>
                            <div id="noteList" class="list-group"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-card">
                            <span class="text-accent">Note Details</span>
                        </div>
                        <div class="card-body bg-card" id="noteDetails">
                            <p>Select a note to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.renderNoteList();
    }

    setupEventListeners() {
        // New note button
        const newNoteBtn = document.getElementById('newNoteBtn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.notesManager.showNewNoteForm());
        }

        // Category filter dropdown
        document.querySelectorAll('[data-category]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                this.notesManager.handleCategoryFilter(category);
            });
        });

        // Search input
        const noteSearch = document.getElementById('noteSearch');
        if (noteSearch) {
            noteSearch.addEventListener('input', (e) => {
                this.notesManager.handleSearch(e.target.value);
            });
        }
    }


    renderNoteList(notes = null) {
        const noteList = document.getElementById('noteList');
        if (!noteList) return;

        const notesToRender = notes || this.dataManager.appState.notes || [];
        
        if (notesToRender.length === 0) {
            noteList.innerHTML = '<div class="list-group-item">No notes found</div>';
            return;
        }

        noteList.innerHTML = notesToRender.map(note => `
            <a href="#" class="card mb-2" data-note-id="${note.id}">
                <div class="d-flex w-100 justify-content-between p-2">
                    <h6 class="mb-1 text-accent">${this.escapeHtml(note.title)}</h6>
                    <small class="badge ${this.getCategoryBadgeClass(note.category)}">${note.category}</small>
                </div>
                <p class="mb-1 text-truncate p-2">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                <small class="p-2">Last updated: ${new Date(note.updatedAt).toLocaleString()}</small>
            </a>
        `).join('');

        // Add click event listeners to note items
        noteList.querySelectorAll('[data-note-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const noteId = item.getAttribute('data-note-id');
                this.notesManager.showNoteDetails(noteId);
            });
        });
    }


    showNoteDetails(note) {
        const noteDetails = document.getElementById('noteDetails');
        if (!noteDetails) return;

        // Format related entities
        const formatRelatedEntities = (entities, type) => {
            if (!entities || entities.length === 0) return 'None';
            return entities.map(id => {
                const entity = this.dataManager[`get${type.charAt(0).toUpperCase() + type.slice(1)}ById`](id);
                return entity ? `<span class="badge bg-secondary me-1">${entity.name || entity.title}</span>` : '';
            }).join('');
        };

        // Format tags
        const formatTags = (tags) => {
            if (!tags || tags.length === 0) return 'None';
            return tags.map(tag => `<span class="badge bg-info me-1">${tag}</span>`).join('');
        };

        noteDetails.innerHTML = `
            <div class="card">
                <div class="card-header bg-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="text-accent mb-0">${this.escapeHtml(note.title)}</h4>
                        <div>
                            <button class="button me-1" id="editNoteBtn">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="button" id="deleteNoteBtn">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <p class="text-muted mb-0">
                        <small>
                            Created: ${new Date(note.createdAt).toLocaleString()} | 
                            Updated: ${new Date(note.updatedAt).toLocaleString()} | 
                            Category: <span class="badge ${this.getCategoryBadgeClass(note.category)}">${note.category}</span>
                        </small>
                    </p>
                </div>
                
                <div class="card-body bg-card">
                    <div class="mb-4">
                        <h5 class="text-accent">Content</h5>
                        <div class="p-3 bg-card rounded border border-secondary text">
                            ${this.escapeHtml(note.content).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-header bg-card d-flex justify-content-between align-items-center">
                                    <span class="text-accent">Tags</span>
                                    <button class="button btn-sm" id="addTagBtn">
                                        <i class="fas fa-plus"></i> Add Tag
                                    </button>
                                </div>
                                <div class="card-body bg-card">
                                    <div id="noteTags">${formatTags(note.tags)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-card">
                                    <span class="text-accent">Related Entities</span>
                                </div>
                                <div class="card-body bg-card">
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6 class="text-accent mb-0">Quests</h6>
                                            <button class="button btn-sm" id="addQuestBtn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div id="relatedQuests" class="d-flex flex-wrap gap-1">
                                            ${formatRelatedEntities(note.relatedEntities?.quests, 'quest')}
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6 class="text-accent mb-0">Locations</h6>
                                            <button class="button btn-sm" id="addLocationBtn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div id="relatedLocations" class="d-flex flex-wrap gap-1">
                                            ${formatRelatedEntities(note.relatedEntities?.locations, 'location')}
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6 class="text-accent mb-0">Characters</h6>
                                            <button class="button btn-sm" id="addCharacterBtn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div id="relatedCharacters" class="d-flex flex-wrap gap-1">
                                            ${formatRelatedEntities(note.relatedEntities?.characters, 'character')}
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6 class="text-accent mb-0">Items</h6>
                                            <button class="button btn-sm" id="addItemBtn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </div>
                                        <div id="relatedItems" class="d-flex flex-wrap gap-1">
                                            ${formatRelatedEntities(note.relatedEntities?.items, 'item')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('editNoteBtn')?.addEventListener('click', () => this.notesManager.showEditNoteForm(note.id));
        document.getElementById('deleteNoteBtn')?.addEventListener('click', () => this.confirmDeleteNote(note.id));
        document.getElementById('addTagBtn')?.addEventListener('click', () => this.notesManager.showAddTagForm(note.id));
        
        // Add related entity buttons
        document.getElementById('addQuestBtn')?.addEventListener('click', () => this.notesManager.showAddRelatedQuestForm(note.id));
        document.getElementById('addLocationBtn')?.addEventListener('click', () => this.notesManager.showAddRelatedLocationForm(note.id));
        document.getElementById('addCharacterBtn')?.addEventListener('click', () => this.notesManager.showAddRelatedCharacterForm(note.id));
        document.getElementById('addItemBtn')?.addEventListener('click', () => this.notesManager.showAddRelatedItemForm(note.id));
    }

    showNewNoteForm() {
        const noteDetails = document.getElementById('noteDetails');
        if (!noteDetails) return;

        noteDetails.innerHTML = `
            <div class="card">
                <div class="card-header bg-card">
                    <h4 class="text-accent mb-0">Create New Note</h4>
                </div>
                <div class="card-body bg-card">
                    <form id="newNoteForm">
                        <div class="mb-3">
                            <label for="noteTitle" class="form-label">Title</label>
                            <input type="text" class="form-control bg-card text" id="noteTitle" required>
                        </div>
                        <div class="mb-3">
                            <label for="noteCategory" class="form-label">Category</label>
                            <select class="form-select bg-card text searchable-select" id="noteCategory" required>
                                ${Object.entries(NoteCategory).map(([key, value]) => 
                                    `<option value="${value}">${key.charAt(0) + key.slice(1).toLowerCase()}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="noteContent" class="form-label">Content</label>
                            <textarea class="form-control bg-card text" id="noteContent" rows="8" required></textarea>
                        </div>
                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="button" id="cancelNoteBtn">Cancel</button>
                            <button type="submit" class="button">Save Note</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add form submission handler
        const form = document.getElementById('newNoteForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.notesManager.createNewNote(form);
            });
        }

        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('noteCategory');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    plugins: ['dropdown_input']
                });
            }
        }, 100);

        // Add cancel button handler
        const cancelBtn = document.getElementById('cancelNoteBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const noteDetails = document.getElementById('noteDetails');
                if (noteDetails) {
                    noteDetails.innerHTML = '<p class="text-muted">Select a note to view details</p>';
                }
            });
        }
    }

    showEditNoteForm(note) {
        const noteDetails = document.getElementById('noteDetails');
        if (!noteDetails) return;

        noteDetails.innerHTML = `
            <div class="card">
                <div class="card-header bg-card">
                    <h4 class="text-accent mb-0">Edit Note</h4>
                </div>
                <div class="card-body bg-card">
                    <form id="editNoteForm">
                        <div class="mb-3">
                            <label for="editNoteTitle" class="form-label">Title</label>
                            <input type="text" class="form-control bg-card text" id="editNoteTitle" value="${this.escapeHtml(note.title)}" required>
                        </div>
                        <div class="mb-3">
                            <label for="editNoteCategory" class="form-label">Category</label>
                            <select class="form-select bg-card text searchable-select" id="editNoteCategory" required>
                                ${Object.entries(NoteCategory).map(([key, value]) => 
                                    `<option value="${value}" ${note.category === value ? 'selected' : ''}>
                                        ${key.charAt(0) + key.slice(1).toLowerCase()}
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="editNoteContent" class="form-label">Content</label>
                            <textarea class="form-control bg-card text" id="editNoteContent" rows="8" required>${this.escapeHtml(note.content)}</textarea>
                        </div>
                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="button" id="cancelEditBtn">Cancel</button>
                            <button type="submit" class="button">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add form submission handler
        const form = document.getElementById('editNoteForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.notesManager.updateNote(note.id, form);
            });
        }

        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('editNoteCategory');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    plugins: ['dropdown_input']
                });
            }
        }, 100);

        // Add cancel button handler
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.notesManager.showNoteDetails(note.id));
        }
    }


    // Utility methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCategoryBadgeClass(category) {
        const categoryClasses = {
            [NoteCategory.BACKSTORY]: 'bg-primary',
            [NoteCategory.QUEST]: 'bg-success',
            [NoteCategory.LOCATION]: 'bg-info',
            [NoteCategory.CHARACTER]: 'bg-warning text-dark',
            [NoteCategory.ITEM]: 'bg-secondary',
            [NoteCategory.SESSION]: 'bg-dark',
            [NoteCategory.LORE]: 'bg-purple',
            [NoteCategory.OTHER]: 'bg-secondary',
            [NoteCategory.GENERAL]: 'bg-light text-dark border'
        };
        return categoryClasses[category] || 'bg-secondary';
    }

    getCategoryColor(category) {
        const colors = {
            [NoteCategory.BACKSTORY]: '#0d6efd',
            [NoteCategory.QUEST]: '#198754',
            [NoteCategory.LOCATION]: '#0dcaf0',
            [NoteCategory.CHARACTER]: '#ffc107',
            [NoteCategory.ITEM]: '#6c757d',
            [NoteCategory.SESSION]: '#212529',
            [NoteCategory.LORE]: '#6f42c1',
            [NoteCategory.OTHER]: '#6c757d',
            [NoteCategory.GENERAL]: '#f8f9fa'
        };
        return colors[category] || '#6c757d';
    }

    confirmDeleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            this.notesManager.deleteNote(noteId);
        }
    }
}
