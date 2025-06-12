/**
 * Test Script for Quest and Player Creation
 * 
 * This script tests the creation of quests and players to ensure proper validation and persistence.
 */

import { AppState } from './scripts/core/state/app-state.js';
import { QuestService } from './scripts/modules/quests/services/quest-service.js';
import { PlayerService } from './scripts/modules/players/services/player-service.js';

// Initialize the application state
console.log('Initializing application state...');
const appState = new AppState();

// Create a simple data manager for the services
const dataManager = {
    appState,
    saveData: () => {
        console.log('Saving data...');
        // The actual save is handled by the appState's internal mechanisms
    }
};

// Initialize services
console.log('Initializing services...');
const questService = new QuestService(dataManager);
const playerService = new PlayerService(dataManager);

// Test quest creation
async function testQuestCreation() {
    console.log('\n=== Testing Quest Creation ===');
    
    const questData = {
        title: 'Test Quest',
        description: 'This is a test quest',
        type: 'main',
        status: 'available',
        notes: 'Test notes',
        relatedItems: [],
        relatedLocations: [],
        relatedFactions: [],
        relatedQuests: [],
        resolution: {
            session: '',
            date: null,
            xp: 0
        }
    };
    
    try {
        console.log('Creating quest...');
        const quest = await questService.createQuest(questData);
        console.log('Quest created successfully:', quest);
        
        // Verify the quest was added to the state
        const quests = appState.state.quests || [];
        console.log(`Total quests in state: ${quests.length}`);
        
        // Find the created quest
        const createdQuest = quests.find(q => q.id === quest.id);
        if (createdQuest) {
            console.log('Found created quest in state:', createdQuest);
        } else {
            console.error('Created quest not found in state');
        }
        
        return quest;
    } catch (error) {
        console.error('Error creating quest:', error);
        throw error;
    }
}

// Test player creation
async function testPlayerCreation() {
    console.log('\n=== Testing Player Creation ===');
    
    const playerData = {
        name: 'Test Player',
        playerClass: 'fighter',
        level: 1,
        experience: 0,
        attributes: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        },
        skills: {},
        inventory: [],
        quests: [],
        bio: 'Test player character',
        notes: 'Test notes',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        console.log('Creating player...');
        const player = await playerService.createPlayer(playerData);
        console.log('Player created successfully:', player);
        
        // Verify the player was added to the state
        const players = appState.state.players || [];
        console.log(`Total players in state: ${players.length}`);
        
        // Find the created player
        const createdPlayer = players.find(p => p.id === player.id);
        if (createdPlayer) {
            console.log('Found created player in state:', createdPlayer);
        } else {
            console.error('Created player not found in state');
        }
        
        return player;
    } catch (error) {
        console.error('Error creating player:', error);
        throw error;
    }
}

// Run the tests
async function runTests() {
    try {
        // Test quest creation
        const quest = await testQuestCreation();
        
        // Test player creation
        const player = await testPlayerCreation();
        
        // Output the final state
        console.log('\n=== Final State ===');
        console.log('Quests:', appState.state.quests?.length || 0);
        console.log('Players:', appState.state.players?.length || 0);
        
        console.log('\nTests completed successfully!');
    } catch (error) {
        console.error('Tests failed:', error);
        process.exit(1);
    }
}

// Run the tests
runTests();
