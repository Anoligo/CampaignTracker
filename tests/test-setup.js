// Import real classes and enums for test helpers
import { Quest, QuestType, QuestStatus } from '../scripts/modules/quests/index.js';
import { Note } from '../scripts/modules/notes/index.js';
import { Item, ItemType, ItemRarity } from '../scripts/modules/loot/index.js';
import { Location, LocationType } from '../scripts/modules/locations/index.js';
import { Player, PlayerClass } from '../scripts/modules/players/index.js';
import { GuildActivity, GuildActivityType, GuildResource, GuildResourceType } from '../scripts/modules/guild/index.js';
import { jest } from '@jest/globals';

// Save the real Date
const RealDate = Date;

// Create a MockDate class that extends the real Date
class MockDate extends RealDate {
    constructor(...args) {
        if (args.length === 0) {
            super('2024-01-01T00:00:00.000Z');
        } else {
            super(...args);
        }
    }

    static now() {
        return new RealDate('2024-01-01T00:00:00.000Z').getTime();
    }

    static parse(dateString) {
        return RealDate.parse(dateString);
    }

    static UTC(...args) {
        return RealDate.UTC(...args);
    }
}

// Set up the mock Date
Object.setPrototypeOf(MockDate, RealDate);
global.Date = MockDate;

// Mock window.notesManager with enhanced functionality
window.notesManager = {
    showAddTagForm: jest.fn((noteId) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.addTag('important');
        }
    }),
    removeTag: jest.fn((noteId, tag) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.removeTag(tag);
        }
    }),
    showAddRelatedQuestForm: jest.fn((noteId) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.addRelatedQuest('quest1');
        }
    }),
    removeRelatedQuest: jest.fn((noteId, questId) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.removeRelatedQuest(questId);
        }
    }),
    showAddRelatedLocationForm: jest.fn(),
    removeRelatedLocation: jest.fn(),
    showAddRelatedCharacterForm: jest.fn(),
    removeRelatedCharacter: jest.fn(),
    showAddRelatedItemForm: jest.fn(),
    removeRelatedItem: jest.fn(),
    addTag: jest.fn((noteId, tag) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.addTag(tag);
        }
    }),
    addRelatedQuest: jest.fn((noteId, questId) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.addRelatedQuest(questId);
        }
    }),
    addRelatedLocation: jest.fn((noteId, locationId) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.addRelatedLocation(locationId);
        }
    }),
    addRelatedCharacter: jest.fn((noteId, characterId) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.addRelatedCharacter(characterId);
        }
    }),
    addRelatedItem: jest.fn((noteId, itemId) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.addRelatedItem(itemId);
        }
    }),
    updateNoteTitle: jest.fn((noteId, form) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.updateTitle(form.title.value);
        }
    }),
    updateNoteContent: jest.fn((noteId, form) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.updateContent(form.content.value);
        }
    }),
    updateNoteCategory: jest.fn((noteId, form) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            note.updateCategory(form.category.value);
        }
    })
};

// Mock Bootstrap
window.bootstrap = {
    Dropdown: jest.fn()
};

// Mock prompt
window.prompt = jest.fn().mockImplementation((message, defaultValue) => {
    if (message.includes('tag')) {
        return 'important';
    } else if (message.includes('quest')) {
        return 'quest1';
    }
    return null;
});

// Mock alert
window.alert = jest.fn();

// Mock document with a more complete DOM structure
document.body.innerHTML = `
    <div id="dashboard">
        <h2>Dashboard</h2>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Active Quests</h5>
                        <p class="card-text" id="activeQuestsCount">0</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Party Members</h5>
                        <p class="card-text" id="partyMembersCount">0</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Locations</h5>
                        <p class="card-text" id="locationsCount">0</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="quests">
        <h2>Quests</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newQuestBtn">New Quest</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Quests List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="questTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="main">Main Quest</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="side">Side Quest</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="guild">Guild Quest</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="other">Other</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="questSearch" placeholder="Search quests...">
                        </div>
                        <div id="questList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Quest Details
                    </div>
                    <div class="card-body" id="questDetails">
                        <p class="text-muted">Select a quest to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="players">
        <h2>Players</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newCharacterBtn">New Character</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Characters List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="classFilter" data-bs-toggle="dropdown">
                                    Filter by Class
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-class="all">All Classes</a></li>
                                    <li><a class="dropdown-item" href="#" data-class="fighter">Fighter</a></li>
                                    <li><a class="dropdown-item" href="#" data-class="wizard">Wizard</a></li>
                                    <li><a class="dropdown-item" href="#" data-class="rogue">Rogue</a></li>
                                    <li><a class="dropdown-item" href="#" data-class="cleric">Cleric</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="characterSearch" placeholder="Search characters...">
                        </div>
                        <div id="characterList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Character Details
                    </div>
                    <div class="card-body" id="characterDetails">
                        <p class="text-muted">Select a character to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="loot">
        <h2>Loot & Curses</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newItemBtn">New Item</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Item List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="itemTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="weapon">Weapon</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="armor">Armor</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="potion">Potion</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="scroll">Scroll</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="other">Other</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="itemSearch" placeholder="Search items...">
                        </div>
                        <div id="itemList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Item Details
                    </div>
                    <div class="card-body" id="itemDetails">
                        <p class="text-muted">Select an item to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="locations">
        <h2>World Map & Locations</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newLocationBtn">New Location</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Locations List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="locationTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="city">City</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="dungeon">Dungeon</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="wilderness">Wilderness</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="other">Other</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="locationSearch" placeholder="Search locations...">
                        </div>
                        <div id="locationList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Location Details
                    </div>
                    <div class="card-body" id="locationDetails">
                        <p class="text-muted">Select a location to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="notes">
        <h2>Backstories & Notes</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newNoteBtn">New Note</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Notes List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="categoryFilter" data-bs-toggle="dropdown">
                                    Filter by Category
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-category="all">All Categories</a></li>
                                    <li><a class="dropdown-item" href="#" data-category="backstory">backstory</a></li>
                                    <li><a class="dropdown-item" href="#" data-category="quest">quest</a></li>
                                    <li><a class="dropdown-item" href="#" data-category="location">location</a></li>
                                    <li><a class="dropdown-item" href="#" data-category="character">character</a></li>
                                    <li><a class="dropdown-item" href="#" data-category="item">item</a></li>
                                    <li><a class="dropdown-item" href="#" data-category="session">session</a></li>
                                    <li><a class="dropdown-item" href="#" data-category="other">other</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="noteSearch" placeholder="Search notes...">
                        </div>
                        <div id="noteList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Note Details
                    </div>
                    <div class="card-body" id="noteDetails">
                        <p class="text-muted">Select a note to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="guild">
        <h2>Guild Logs</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newActivityBtn">New Activity</button>
                <button class="btn btn-primary ms-2" id="newResourceBtn">New Resource</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Activities</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="activityTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="quest">Quest</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="training">Training</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="resource">Resource</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="activitySearch" placeholder="Search activities...">
                        </div>
                        <div id="activityList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Activity Details
                    </div>
                    <div class="card-body" id="activityDetails">
                        <p class="text-muted">Select an activity to view details</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Resources</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="resourceTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="resourceSearch" placeholder="Search resources...">
                        </div>
                        <div id="resourceList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Resource Details
                    </div>
                    <div class="card-body" id="resourceDetails">
                        <p class="text-muted">Select a resource to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="items">
        <h2>Items</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newItemBtn">New Item</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Items List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="itemTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="itemSearch" placeholder="Search items...">
                        </div>
                        <div id="itemList" class="list-group"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Item Details
                    </div>
                    <div class="card-body" id="itemDetails">
                        <p class="text-muted">Select an item to view details</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// Enhanced MockDataManager with better error handling and validation
class MockDataManager {
    constructor() {
        this.appState = {
            quests: [],
            notes: [],
            loot: [],
            locations: [],
            players: [],
            items: [],
            guildLogs: {
                activities: [],
                resources: []
            }
        };
        this.validateState();
    }

    validateState() {
        // Ensure all arrays exist
        Object.entries(this.appState).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (!value.every(item => item && typeof item === 'object')) {
                    throw new Error(`Invalid items in ${key} array`);
                }
            }
        });
    }

    _validateState() { this.validateState(); }

    addPlayer(player) {
        if (!player || typeof player !== 'object') {
            throw new Error('Invalid player object');
        }
        if (!player.name || !player.class || typeof player.level !== 'number') {
            throw new Error('Invalid player data');
        }
        this.appState.players.push(player);
        this.validateState();
    }

    // Enhanced CRUD operations with validation
    addNote(note) {
        if (!note || typeof note !== 'object') {
            throw new Error('Invalid note object');
        }
        this.appState.notes.push(note);
        this.validateState();
    }

    addQuest(quest) {
        if (!quest || typeof quest !== 'object') {
            throw new Error('Invalid quest object');
        }
        this.appState.quests.push(quest);
        this.validateState();
    }

    addLocation(location) {
        if (!location || typeof location !== 'object') {
            throw new Error('Invalid location object');
        }
        this.appState.locations.push(location);
        this.validateState();
    }

    addItem(item) {
        if (!item || typeof item !== 'object') {
            throw new Error('Invalid item object');
        }
        if (!item.name || !item.type || !item.rarity) {
            throw new Error('Invalid item data: missing required properties');
        }
        this.appState.items.push(item);
        this.validateState();
    }

    // Enhanced getters with error handling
    getNoteById(id) {
        if (!id) throw new Error('Invalid note ID');
        const note = this.appState.notes.find(note => note.id === id);
        if (!note) throw new Error(`Note with ID ${id} not found`);
        return note;
    }

    getQuestById(id) {
        if (!id) throw new Error('Invalid quest ID');
        const quest = this.appState.quests.find(quest => quest.id === id);
        if (!quest) throw new Error(`Quest with ID ${id} not found`);
        return quest;
    }

    getLocationById(id) {
        if (!id) throw new Error('Invalid location ID');
        const location = this.appState.locations.find(location => location.id === id);
        if (!location) throw new Error(`Location with ID ${id} not found`);
        return location;
    }

    getPlayerById(id) {
        if (!id) throw new Error('Invalid player ID');
        const player = this.appState.players.find(player => player.id === id);
        if (!player) {
            // For testing purposes, create a mock player if not found
            const mockPlayer = new Player('Test Player', 'Warrior', 1);
            mockPlayer.id = id;
            this.appState.players.push(mockPlayer);
            return mockPlayer;
        }
        return player;
    }

    getItemById(id) {
        if (!id) throw new Error('Invalid item ID');
        const item = this.appState.items.find(item => item.id === id);
        if (!item) throw new Error(`Item with ID ${id} not found`);
        return item;
    }

    // Enhanced update operations with validation
    updateNote(noteId, updates) {
        const note = this.getNoteById(noteId);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(note, updates);
        this.validateState();
    }

    updateQuest(questId, updates) {
        const quest = this.getQuestById(questId);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(quest, updates);
        this.validateState();
    }

    updateLocation(locationId, updates) {
        const location = this.getLocationById(locationId);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(location, updates);
        this.validateState();
    }

    updatePlayer(playerId, updates) {
        const player = this.getPlayerById(playerId);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(player, updates);
        this.validateState();
    }

    updateItem(itemId, updates) {
        const item = this.getItemById(itemId);
        if (!updates || typeof updates !== 'object') {
            throw new Error('Invalid updates object');
        }
        Object.assign(item, updates);
        this.validateState();
    }

    // Enhanced delete operations with validation
    deleteNote(id) {
        if (!id) throw new Error('Invalid note ID');
        const initialLength = this.appState.notes.length;
        this.appState.notes = this.appState.notes.filter(note => note.id !== id);
        if (this.appState.notes.length === initialLength) {
            throw new Error(`Note with ID ${id} not found`);
        }
        this.validateState();
    }

    deleteQuest(id) {
        if (!id) throw new Error('Invalid quest ID');
        const initialLength = this.appState.quests.length;
        this.appState.quests = this.appState.quests.filter(quest => quest.id !== id);
        if (this.appState.quests.length === initialLength) {
            throw new Error(`Quest with ID ${id} not found`);
        }
        this.validateState();
    }

    deleteLocation(id) {
        if (!id) throw new Error('Invalid location ID');
        const initialLength = this.appState.locations.length;
        this.appState.locations = this.appState.locations.filter(location => location.id !== id);
        if (this.appState.locations.length === initialLength) {
            throw new Error(`Location with ID ${id} not found`);
        }
        this.validateState();
    }

    deletePlayer(id) {
        if (!id) throw new Error('Invalid player ID');
        const initialLength = this.appState.players.length;
        this.appState.players = this.appState.players.filter(player => player.id !== id);
        if (this.appState.players.length === initialLength) {
            throw new Error(`Player with ID ${id} not found`);
        }
        this.validateState();
    }

    deleteItem(id) {
        if (!id) throw new Error('Invalid item ID');
        const initialLength = this.appState.items.length;
        this.appState.items = this.appState.items.filter(item => item.id !== id);
        if (this.appState.items.length === initialLength) {
            throw new Error(`Item with ID ${id} not found`);
        }
        this.validateState();
    }

    // Mock save operations
    saveData() {
        return Promise.resolve();
    }

    saveState() {
        return Promise.resolve();
    }
}

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage with spy functions
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    key: jest.fn(),
    length: 0
};
global.localStorage = localStorageMock;

// Mock UUID generation with predictable IDs
let mockId = 0;
global.crypto = {
    randomUUID: () => `mock-uuid-${mockId++}`
};

// Mock console.error to prevent noise in test output
console.error = jest.fn();

// Standalone ensureDate function for use in helpers
function ensureDate(date) {
    if (!date) return new MockDate();
    if (date instanceof Date) return new MockDate(date);
    if (typeof date === 'string') return new MockDate(date);
    if (typeof date === 'number') return new MockDate(date);
    return new MockDate();
}

// Enhanced test helpers
const testHelpers = {
    ensureDate, // expose for external use if needed

    // Create a mock element with content and attributes
    createMockElement: (id, content, attributes = {}) => {
        const element = document.createElement('div');
        element.id = id;
        element.innerHTML = content;
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        document.body.appendChild(element);
        return element;
    },

    // Create a mock list with items and event handlers
    createMockList: (id, items, options = {}) => {
        const list = document.createElement('div');
        list.id = id;
        list.className = 'list-group';
        items.forEach((item, index) => {
            const listItem = document.createElement('a');
            listItem.href = '#';
            listItem.className = 'list-group-item list-group-item-action';
            listItem.innerHTML = item;
            if (options.onClick) {
                listItem.addEventListener('click', (e) => options.onClick(e, index));
            }
            list.appendChild(listItem);
        });
        document.body.appendChild(list);
        return list;
    },

    // Create a mock form with fields and validation
    createMockForm: (fields, options = {}) => {
        const form = {
            elements: {},
            addEventListener: () => {},
            removeEventListener: () => {},
            reset: () => {},
            submit: () => {}
        };
        Object.entries(fields).forEach(([name, value]) => {
            const fieldObj = {
                value,
                name,
                type: 'text',
                required: options.required?.includes(name) || false,
                validity: {
                    valid: true,
                    valueMissing: false
                },
                checkValidity: () => form.elements[name].validity.valid
            };
            form.elements[name] = fieldObj;
            form[name] = fieldObj; // Add direct property for compatibility
        });
        return form;
    },

    // Create a mock note with validation
    createMockNote: (overrides = {}) => {
        const args = [
            overrides.title || (overrides.noteTitle?.value || mockFormValues.note.noteTitle),
            overrides.content || (overrides.noteContent?.value || mockFormValues.note.noteContent),
            overrides.category || (overrides.noteCategory?.value || mockFormValues.note.noteCategory),
            ensureDate(overrides.createdAt),
            ensureDate(overrides.updatedAt)
        ];
        const note = new Note(...args);
        note.tags = (overrides.tags || []).map(t => typeof t === 'string' ? t : t?.tagName?.value || t);
        note.relatedEntities = {
            quests: (overrides.relatedEntities?.quests || []).map(q => typeof q === 'string' ? q : q?.questId?.value || q),
            locations: (overrides.relatedEntities?.locations || []).map(l => typeof l === 'string' ? l : l?.locationId?.value || l),
            characters: (overrides.relatedEntities?.characters || []).map(c => typeof c === 'string' ? c : c?.characterId?.value || c),
            items: (overrides.relatedEntities?.items || []).map(i => typeof i === 'string' ? i : i?.itemId?.value || i)
        };
        return note;
    },

    // Create a mock quest with validation
    createMockQuest: (overrides = {}) => {
        const type = overrides.type || (overrides.questType?.value || mockFormValues.quest.questType);
        const status = overrides.status || (overrides.questStatus?.value || mockFormValues.quest.questStatus);
        
        // Validate quest type
        if (!Object.values(QuestType).includes(type)) {
            throw new Error(`Invalid quest type: ${type}`);
        }
        
        // Validate quest status
        if (!Object.values(QuestStatus).includes(status)) {
            throw new Error(`Invalid quest status: ${status}`);
        }

        const args = [
            overrides.title || (overrides.questTitle?.value || mockFormValues.quest.questTitle),
            overrides.description || (overrides.questDescription?.value || mockFormValues.quest.questDescription),
            type,
            ensureDate(overrides.createdAt),
            ensureDate(overrides.updatedAt)
        ];
        const quest = new Quest(...args);
        quest.status = status;
        quest.journalEntries = overrides.journalEntries || [];
        quest.relatedItems = overrides.relatedItems || [];
        quest.relatedLocations = overrides.relatedLocations || [];
        quest.relatedCharacters = overrides.relatedCharacters || [];
        quest.statusHistory = overrides.statusHistory || [];
        return quest;
    },

    // Create a mock item with validation
    createMockItem: (overrides = {}) => {
        const args = [
            overrides.name || (overrides.itemName?.value || mockFormValues.item.itemName),
            overrides.description || (overrides.itemDescription?.value || mockFormValues.item.itemDescription),
            overrides.type || (overrides.itemType?.value || mockFormValues.item.itemType),
            overrides.rarity || (overrides.itemRarity?.value || mockFormValues.item.itemRarity),
            ensureDate(overrides.createdAt),
            ensureDate(overrides.updatedAt)
        ];
        const item = new Item(...args);
        item.isCursed = overrides.isCursed || false;
        item.curseEffects = overrides.curseEffects || [];
        item.owner = overrides.owner || null;
        item.questSource = overrides.questSource || null;
        return item;
    },

    // Create a mock location with validation
    createMockLocation: (overrides = {}) => {
        const args = [
            overrides.name || (overrides.locationName?.value || mockFormValues.location.locationName),
            overrides.description || overrides.locationDescription?.value || mockFormValues.location.locationDescription,
            overrides.type || overrides.locationType?.value || mockFormValues.location.locationType,
            overrides.x || 0,
            overrides.y || 0,
            ensureDate(overrides.createdAt),
            ensureDate(overrides.updatedAt)
        ];
        const location = new Location(...args);
        location.isDiscovered = overrides.isDiscovered !== undefined ? overrides.isDiscovered : false;
        location.relatedQuests = overrides.relatedQuests || [];
        location.relatedItems = overrides.relatedItems || [];
        return location;
    },

    // Create a mock player with validation
    createMockPlayer: (overrides = {}) => {
        let playerClass = overrides.class || (overrides.playerClass?.value || mockFormValues.player.playerClass);
        // If playerClass is a string, map to PlayerClass enum if possible
        if (typeof playerClass === 'string' && PlayerClass[playerClass.toUpperCase()]) {
            playerClass = PlayerClass[playerClass.toUpperCase()];
        }
        if (!Object.values(PlayerClass).includes(playerClass)) {
            throw new Error(`Invalid player class: ${playerClass}`);
        }
        const args = [
            overrides.name || (overrides.playerName?.value || mockFormValues.player.playerName),
            playerClass,
            overrides.level || (overrides.playerLevel?.value || mockFormValues.player.playerLevel),
            ensureDate(overrides.createdAt),
            ensureDate(overrides.updatedAt)
        ];
        const player = new Player(...args);
        player.experience = overrides.experience || 0;
        player.inventory = overrides.inventory || [];
        player.activeQuests = overrides.activeQuests || [];
        player.completedQuests = overrides.completedQuests || [];
        return player;
    },

    // Create a mock guild activity with validation
    createMockGuildActivity: (overrides = {}) => {
        const args = [
            overrides.name || mockFormValues.activity.name,
            overrides.description || mockFormValues.activity.description,
            overrides.type || mockFormValues.activity.type,
            ensureDate(overrides.createdAt),
            ensureDate(overrides.updatedAt)
        ];
        const activity = new GuildActivity(...args);
        activity.status = overrides.status || mockFormValues.activity.status;
        activity.rewards = overrides.rewards || [];
        activity.participants = overrides.participants || [];
        return activity;
    },

    // Create a mock guild resource with validation
    createMockGuildResource: (overrides = {}) => {
        const args = [
            overrides.name || mockFormValues.resource.name,
            overrides.description || mockFormValues.resource.description,
            overrides.type || mockFormValues.resource.type,
            overrides.quantity !== undefined ? overrides.quantity : mockFormValues.resource.quantity
        ];
        if (overrides.createdAt) args.push(overrides.createdAt);
        if (overrides.updatedAt) args.push(overrides.updatedAt);
        const resource = new GuildResource(...args);
        return resource;
    },

    // Helper function to create a fixed date for testing
    createFixedDate: (dateString = '2024-01-01T00:00:00.000Z') => {
        return new MockDate(dateString);
    },

    // Helper function to create a date range for testing
    createDateRange: (startDate = '2024-01-01T00:00:00.000Z', endDate = '2024-12-31T23:59:59.999Z') => {
        return {
            start: new MockDate(startDate),
            end: new MockDate(endDate)
        };
    },

    // Helper function to create test data
    createTestData: (type, count = 1) => {
        const data = [];
        for (let i = 0; i < count; i++) {
            switch (type) {
                case 'note':
                    data.push(testHelpers.createMockNote({ title: `Test Note ${i + 1}` }));
                    break;
                case 'quest':
                    data.push(testHelpers.createMockQuest({ title: `Test Quest ${i + 1}` }));
                    break;
                case 'item':
                    data.push(testHelpers.createMockItem({ name: `Test Item ${i + 1}` }));
                    break;
                case 'location':
                    data.push(testHelpers.createMockLocation({ name: `Test Location ${i + 1}` }));
                    break;
                case 'player':
                    data.push(testHelpers.createMockPlayer({ name: `Test Player ${i + 1}` }));
                    break;
                case 'activity':
                    data.push(testHelpers.createMockGuildActivity({ name: `Test Activity ${i + 1}` }));
                    break;
                case 'resource':
                    data.push(testHelpers.createMockGuildResource({ name: `Test Resource ${i + 1}` }));
                    break;
                default:
                    throw new Error(`Unknown test data type: ${type}`);
            }
        }
        return data;
    }
};

// Mock form values with fixed dates
const mockFormValues = {
    note: {
        noteTitle: 'Test Note',
        noteContent: 'Test Content',
        noteCategory: 'lore'
    },
    quest: {
        questTitle: 'Test Quest',
        questDescription: 'Test Description',
        questType: 'main',
        questStatus: 'ongoing'
    },
    location: {
        locationName: 'Test Location',
        locationType: 'CITY',
        locationDescription: 'A test city'
    },
    player: {
        playerName: 'Test Player',
        playerClass: 'fighter',
        playerLevel: 1
    },
    item: {
        itemName: 'Test Item',
        itemType: 'weapon',
        itemDescription: 'A test weapon',
        itemRarity: 'common'
    },
    activity: {
        name: 'Test Activity',
        description: 'A test activity',
        type: 'quest',
        status: 'pending'
    },
    resource: {
        name: 'Test Resource',
        description: 'A test resource',
        type: 'gold',
        quantity: 100
    }
};

// Export all utilities
export {
    MockDataManager,
    testHelpers,
    mockFormValues,
    MockDate
}; 