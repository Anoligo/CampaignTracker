import { jest } from '@jest/globals';

// Save the real Date
const RealDate = Date;

class MockDate extends RealDate {
    constructor(...args) {
        if (args.length === 0) {
            return new RealDate('2025-01-01T00:00:00.000Z');
        }
        return new RealDate(...args);
    }
    static now() {
        return new RealDate('2025-01-01T00:00:00.000Z').getTime();
    }
}

// Set global Date to MockDate
Object.setPrototypeOf(MockDate, RealDate);
global.Date = MockDate;

// Mock window.notesManager
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

// Mock DataManager
window.mockDataManager = {
    appState: {
        notes: [],
        quests: [],
        locations: [],
        players: [],
        loot: [],
        guildLogs: {
            activities: [],
            resources: []
        }
    },
    saveData: jest.fn(),
    addNote: jest.fn((note) => {
        window.mockDataManager.appState.notes.push(note);
    }),
    addQuest: jest.fn((quest) => {
        window.mockDataManager.appState.quests.push(quest);
    }),
    addLocation: jest.fn((location) => {
        window.mockDataManager.appState.locations.push(location);
    }),
    addPlayer: jest.fn((player) => {
        window.mockDataManager.appState.players.push(player);
    }),
    addItem: jest.fn((item) => {
        window.mockDataManager.appState.loot.push(item);
    }),
    addActivity: jest.fn((activity) => {
        window.mockDataManager.appState.guildLogs.activities.push(activity);
    }),
    addResource: jest.fn((resource) => {
        window.mockDataManager.appState.guildLogs.resources.push(resource);
    }),
    updateNote: jest.fn((noteId, updates) => {
        const note = window.mockDataManager.appState.notes.find(n => n.id === noteId);
        if (note) {
            Object.assign(note, updates);
        }
    }),
    updateQuest: jest.fn((questId, updates) => {
        const quest = window.mockDataManager.appState.quests.find(q => q.id === questId);
        if (quest) {
            Object.assign(quest, updates);
        }
    }),
    updateLocation: jest.fn((locationId, updates) => {
        const location = window.mockDataManager.appState.locations.find(l => l.id === locationId);
        if (location) {
            Object.assign(location, updates);
        }
    }),
    updatePlayer: jest.fn((playerId, updates) => {
        const player = window.mockDataManager.appState.players.find(p => p.id === playerId);
        if (player) {
            Object.assign(player, updates);
        }
    }),
    updateItem: jest.fn((itemId, updates) => {
        const item = window.mockDataManager.appState.loot.find(i => i.id === itemId);
        if (item) {
            Object.assign(item, updates);
        }
    }),
    updateActivity: jest.fn((activityId, updates) => {
        const activity = window.mockDataManager.appState.guildLogs.activities.find(a => a.id === activityId);
        if (activity) {
            Object.assign(activity, updates);
        }
    }),
    updateResource: jest.fn((resourceId, updates) => {
        const resource = window.mockDataManager.appState.guildLogs.resources.find(r => r.id === resourceId);
        if (resource) {
            Object.assign(resource, updates);
        }
    })
};

// Mock DOM elements
document.body.innerHTML = `
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
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="statusFilter" data-bs-toggle="dropdown">
                                    Filter by Status
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-status="all">All Statuses</a></li>
                                    <li><a class="dropdown-item" href="#" data-status="ongoing">Ongoing</a></li>
                                    <li><a class="dropdown-item" href="#" data-status="completed">Completed</a></li>
                                    <li><a class="dropdown-item" href="#" data-status="failed">Failed</a></li>
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
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="typeFilter" data-bs-toggle="dropdown">
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
    <div id="guild">
        <h2>Guild Logs</h2>
        <div class="row mb-4">
            <div class="col">
                <button class="btn btn-primary" id="newActivityBtn">New Activity</button>
                <button class="btn btn-primary" id="newResourceBtn">New Resource</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Activities List</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="activityTypeFilter" data-bs-toggle="dropdown">
                                    Filter by Type
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" data-type="all">All Types</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="quest">Quest</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="training">Training</a></li>
                                    <li><a class="dropdown-item" href="#" data-type="other">Other</a></li>
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
    </div>
`;

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock console.error to prevent noise in test output
console.error = jest.fn(); 