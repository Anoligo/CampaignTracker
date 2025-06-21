/**
 * Unified Storage CRUD Tests
 * 
 * This script tests CRUD operations across all modules to ensure they work
 * correctly with the unified appState storage approach.
 */

import { DataService } from '../../scripts/core/data-service.js';

// Import all services
import { LootService } from '../../scripts/modules/loot/services/loot-service.js';
import { PlayerService } from '../../scripts/modules/players/services/player-service.js';
import { QuestService } from '../../scripts/modules/quests/services/quest-service.js';
import { NotesService } from '../../scripts/modules/notes/services/notes-service-new.js';
import { LocationService } from '../../scripts/modules/locations/services/location-service.js';

// Test configuration
const TEST_PREFIX = 'test-';

// Helper function to generate test data
function generateTestData(prefix, type) {
    const now = new Date().toISOString();
    
    switch(type) {
        case 'loot':
            return {
                name: `${prefix} Test Loot`,
                description: 'Test description',
                value: 100,
                quantity: 1,
                weight: 1,
                type: 'item',
                rarity: 'common',
                attunement: false,
                notes: 'Test notes',
                createdAt: now,
                updatedAt: now
            };
            
        case 'player':
            return {
                name: `${prefix} Test Player`,
                race: 'Human',
                class: 'Fighter',
                level: 1,
                notes: 'Test player',
                createdAt: now,
                updatedAt: now
            };
            
        case 'quest':
            return {
                title: `${prefix} Test Quest`,
                description: 'Test quest description',
                status: 'active',
                difficulty: 'medium',
                rewards: [],
                notes: 'Test quest notes',
                createdAt: now,
                updatedAt: now
            };
            
        case 'note':
            return {
                title: `${prefix} Test Note`,
                content: 'Test note content',
                category: 'lore',
                tags: ['test'],
                createdAt: now,
                updatedAt: now
            };
            
        case 'condition':
            return {
                name: `${prefix} Test Condition`,
                effect: 'Test effect',
                duration: '1 hour',
                notes: 'Test condition notes'
            };
            
        case 'location':
            return {
                name: `${prefix} Test Location`,
                description: 'Test location description',
                type: 'city',
                x: 0,
                y: 0,
                notes: 'Test location notes'
            };
            
        default:
            throw new Error(`Unknown test data type: ${type}`);
    }
}

// Test runner
class StorageTestRunner {
    constructor() {
        // Initialize data service with test storage
        this.dataService = new DataService({
            autoSave: false, // Disable auto-save for testing
            storageKey: 'test-app-state',
            initialState: {}
        });
        
        // Initialize all services
        this.services = {
            loot: new LootService(this.dataService),
            players: new PlayerService(this.dataService),
            quests: new QuestService(this.dataService),
            notes: new NotesService(this.dataService),
            locations: new LocationService(this.dataService)
        };
        
        // Store test results
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        
        // Store test data
        this.testData = {};
    }
    
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('=== Starting Unified Storage Tests ===\n');
        
        try {
            // Test each service
            await this.testService('loot');
            await this.testService('players');
            await this.testService('quests');
            await this.testService('notes');
            await this.testService('conditions');
            await this.testService('locations');
            
            // Print summary
            this.printSummary();
            
        } catch (error) {
            console.error('Test runner error:', error);
            this.recordError('Test runner', error);
            this.printSummary();
        }
    }
    
    /**
     * Test a specific service
     */
    async testService(serviceName) {
        const service = this.services[serviceName];
        const testId = `${TEST_PREFIX}${Date.now()}`;
        
        console.log(`\n=== Testing ${serviceName} service ===`);
        
        try {
            // Generate test data
            this.testData[serviceName] = generateTestData(testId, serviceName);
            
            // Test CRUD operations
            await this.testCreate(serviceName, testId);
            await this.testRead(serviceName, testId);
            await this.testUpdate(serviceName, testId);
            await this.testDelete(serviceName, testId);
            
            // Test listing
            await this.testList(serviceName);
            
            console.log(`✅ ${serviceName} tests passed`);
            
        } catch (error) {
            console.error(`❌ ${serviceName} tests failed:`, error);
            this.recordError(serviceName, error);
        }
    }
    
    /**
     * Test create operation
     */
    async testCreate(serviceName, testId) {
        this.recordTest('create');
        const service = this.services[serviceName];
        const testData = this.testData[serviceName];
        
        const result = await service[`create${this.capitalize(serviceName.slice(0, -1))}`](testData);
        
        if (!result || !result.id) {
            throw new Error('Create operation did not return an item with an ID');
        }
        
        // Store the ID for subsequent tests
        this.testData[`${serviceName}Id`] = result.id;
        
        // Verify the item was added to the data service
        const items = this.dataService.appState[serviceName];
        const itemExists = items && items.some(item => item.id === result.id);
        
        if (!itemExists) {
            throw new Error('Created item not found in appState');
        }
        
        console.log(`  ✓ create: Created ${serviceName.slice(0, -1)} with ID: ${result.id}`);
    }
    
    /**
     * Test read operation
     */
    async testRead(serviceName, testId) {
        this.recordTest('read');
        const service = this.services[serviceName];
        const itemId = this.testData[`${serviceName}Id`];
        
        if (!itemId) {
            throw new Error('No item ID available for read test');
        }
        
        const item = await service[`get${this.capitalize(serviceName.slice(0, -1))}ById`](itemId);
        
        if (!item) {
            throw new Error('Could not retrieve item by ID');
        }
        
        console.log(`  ✓ read: Retrieved ${serviceName.slice(0, -1)} with ID: ${itemId}`);
    }
    
    /**
     * Test update operation
     */
    async testUpdate(serviceName, testId) {
        this.recordTest('update');
        const service = this.services[serviceName];
        const itemId = this.testData[`${serviceName}Id`];
        
        if (!itemId) {
            throw new Error('No item ID available for update test');
        }
        
        const updates = { name: `Updated ${testId}` };
        const updatedItem = await service[`update${this.capitalize(serviceName.slice(0, -1))}`](itemId, updates);
        
        if (!updatedItem) {
            throw new Error('Update operation failed');
        }
        
        if (updatedItem.name !== updates.name) {
            throw new Error('Update did not apply changes correctly');
        }
        
        // Verify the update in the data service
        const items = this.dataService.appState[serviceName];
        const itemInState = items && items.find(item => item.id === itemId);
        
        if (!itemInState || itemInState.name !== updates.name) {
            throw new Error('Update not reflected in appState');
        }
        
        console.log(`  ✓ update: Updated ${serviceName.slice(0, -1)} with ID: ${itemId}`);
    }
    
    /**
     * Test delete operation
     */
    async testDelete(serviceName, testId) {
        this.recordTest('delete');
        const service = this.services[serviceName];
        const itemId = this.testData[`${serviceName}Id`];
        
        if (!itemId) {
            throw new Error('No item ID available for delete test');
        }
        
        const result = await service[`delete${this.capitalize(serviceName.slice(0, -1))}`](itemId);
        
        if (!result) {
            throw new Error('Delete operation failed');
        }
        
        // Verify the item was removed from the data service
        const items = this.dataService.appState[serviceName] || [];
        const itemExists = items.some(item => item.id === itemId);
        
        if (itemExists) {
            throw new Error('Item still exists in appState after deletion');
        }
        
        console.log(`  ✓ delete: Deleted ${serviceName.slice(0, -1)} with ID: ${itemId}`);
    }
    
    /**
     * Test list operation
     */
    async testList(serviceName) {
        this.recordTest('list');
        const service = this.services[serviceName];
        
        let items;
        if (serviceName === 'notes') {
            items = service.getAllNotes();
        } else if (serviceName === 'locations') {
            items = service.getAllLocations();
        } else if (serviceName === 'players') {
            items = service.getAllPlayers();
        } else if (serviceName === 'quests') {
            items = service.getAllQuests();
        } else if (serviceName === 'loot') {
            items = service.getAllLoot();
        } else {
            throw new Error(`Unsupported service for list test: ${serviceName}`);
        }
        
        if (!Array.isArray(items)) {
            throw new Error('List operation did not return an array');
        }
        
        console.log(`  ✓ list: Retrieved ${items.length} ${serviceName}`);
    }
    
    /**
     * Record a test result
     */
    recordTest(operation) {
        this.results.total++;
        this.results.passed++;
    }
    
    /**
     * Record an error
     */
    recordError(service, error) {
        this.results.total++;
        this.results.failed++;
        this.results.errors.push({
            service,
            error: error.message || String(error)
        });
    }
    
    /**
     * Print test summary
     */
    printSummary() {
        console.log('\n=== Test Summary ===');
        console.log(`Total tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        
        if (this.results.errors.length > 0) {
            console.log('\nErrors:');
            this.results.errors.forEach((err, index) => {
                console.log(`  ${index + 1}. ${err.service}: ${err.error}`);
            });
        }
        
        console.log('\n=== Test Complete ===');
    }
    
    /**
     * Capitalize the first letter of a string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Export for ES modules
export { StorageTestRunner };

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    // Import required modules
    const { DataService } = require('../../scripts/core/data-service.js');
    const { LootService } = require('../../scripts/modules/loot/services/loot-service.js');
    const { PlayerService } = require('../../scripts/modules/players/services/player-service.js');
    const { QuestService } = require('../../scripts/modules/quests/services/quest-service.js');
    const { NotesService } = require('../../scripts/modules/notes/services/notes-service-new.js');
    const { ConditionService } = require('../../scripts/modules/conditions/services/condition-service.js');
    const { LocationService } = require('../../scripts/modules/locations/services/location-service.js');
    
    // Run tests
    const testRunner = new StorageTestRunner();
    testRunner.runAllTests()
        .then(() => console.log('Tests completed'))
        .catch(console.error);
}
