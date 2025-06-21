// Simple test script to verify unified storage functionality
const { DataService } = require('./scripts/core/data-service.js');

// Initialize data service with test storage
const dataService = new DataService({
    autoSave: true,
    storageKey: 'test-app-state',
    initialState: {
        loot: [],
        players: [],
        quests: [],
        notes: [],
        locations: []
    }
});

// Test data
const testData = {
    loot: { name: 'Test Loot', value: 100 },
    players: { name: 'Test Player', level: 1 },
    quests: { title: 'Test Quest', status: 'active' },
    notes: { title: 'Test Note', content: 'Test content' },
    locations: { name: 'Test Location', type: 'city' }
};

// Test CRUD operations
async function testCRUD(collection, itemData) {
    console.log(`\n=== Testing ${collection} ===`);
    
    try {
        // Test Create
        const created = await dataService.add(collection, itemData);
        console.log(`✅ Created ${collection}:`, created.id);
        
        // Test Read
        const read = await dataService.get(collection, created.id);
        if (read) {
            console.log(`✅ Read ${collection}:`, read.id);
        } else {
            throw new Error(`Failed to read ${collection}`);
        }
        
        // Test Update
        const updateData = { ...itemData, name: `Updated ${itemData.name || itemData.title}` };
        const updated = await dataService.update(collection, created.id, updateData);
        if (updated && (updated.name === updateData.name || updated.title === updateData.title)) {
            console.log(`✅ Updated ${collection}:`, updated.id);
        } else {
            throw new Error(`Failed to update ${collection}`);
        }
        
        // Test Delete
        const deleted = await dataService.remove(collection, created.id);
        if (deleted) {
            console.log(`✅ Deleted ${collection}:`, created.id);
        } else {
            throw new Error(`Failed to delete ${collection}`);
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Error testing ${collection}:`, error.message);
        return false;
    }
}

// Run tests
async function runTests() {
    console.log('=== Starting Unified Storage Tests ===\n');
    
    let allPassed = true;
    
    for (const [collection, data] of Object.entries(testData)) {
        const success = await testCRUD(collection, data);
        allPassed = allPassed && success;
    }
    
    console.log('\n=== Test Results ===');
    if (allPassed) {
        console.log('✅ All tests passed!');
    } else {
        console.log('❌ Some tests failed');
    }
    
    console.log('\n=== Test Complete ===');
}

// Run the tests
runTests().catch(console.error);
