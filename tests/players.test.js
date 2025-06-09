import { Player, PlayerClass, PlayerManager } from '../scripts/modules/players.js';
import { MockDataManager, testHelpers, mockFormValues } from './test-setup.js';

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = testHelpers.createMockPlayer();
    });

    test('should create a new player with correct properties', () => {
        expect(player.name).toBe('Test Player');
        expect(player.class).toBe(PlayerClass.FIGHTER);
        expect(player.level).toBe(1);
        expect(player.experience).toBe(0);
        expect(player.inventory).toEqual([]);
        expect(player.activeQuests).toEqual([]);
        expect(player.completedQuests).toEqual([]);
        expect(player.createdAt instanceof Date).toBe(true);
        expect(player.updatedAt instanceof Date).toBe(true);
    });

    test('should add item to inventory', () => {
        player.addToInventory('Item 1');
        expect(player.inventory).toContain('Item 1');
    });

    test('should not add duplicate item to inventory', () => {
        player.addToInventory('Item 1');
        player.addToInventory('Item 1');
        expect(player.inventory).toHaveLength(1);
    });

    test('should remove item from inventory', () => {
        player.addToInventory('Item 1');
        player.removeFromInventory('Item 1');
        expect(player.inventory).not.toContain('Item 1');
    });

    test('should add active quest', () => {
        player.addActiveQuest('Quest 1');
        expect(player.activeQuests).toContain('Quest 1');
    });

    test('should not add duplicate active quest', () => {
        player.addActiveQuest('Quest 1');
        player.addActiveQuest('Quest 1');
        expect(player.activeQuests).toHaveLength(1);
    });

    test('should remove active quest', () => {
        player.addActiveQuest('Quest 1');
        player.removeActiveQuest('Quest 1');
        expect(player.activeQuests).not.toContain('Quest 1');
    });

    test('should add completed quest', () => {
        player.addCompletedQuest('Quest 1');
        expect(player.completedQuests).toContain('Quest 1');
    });

    test('should not add duplicate completed quest', () => {
        player.addCompletedQuest('Quest 1');
        player.addCompletedQuest('Quest 1');
        expect(player.completedQuests).toHaveLength(1);
    });

    test('should remove completed quest', () => {
        player.addCompletedQuest('Quest 1');
        player.removeCompletedQuest('Quest 1');
        expect(player.completedQuests).not.toContain('Quest 1');
    });

    test('should add experience', () => {
        player.addExperience(100);
        expect(player.experience).toBe(100);
    });

    test('should level up when experience threshold is reached', () => {
        player.addExperience(1000);
        expect(player.level).toBe(2);
    });

    test('should update name', () => {
        player.updateName('New Name');
        expect(player.name).toBe('New Name');
    });

    test('should update class', () => {
        player.updateClass(PlayerClass.WIZARD);
        expect(player.class).toBe(PlayerClass.WIZARD);
    });
});

describe('PlayerManager', () => {
    let playerManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        playerManager = new PlayerManager(mockDataManager, true);
    });

    test('should initialize players section', () => {
        const playersSection = document.getElementById('players');
        expect(playersSection.innerHTML).toContain('Players');
        expect(playersSection.innerHTML).toContain('New Player');
    });

    test('should create new player', () => {
        const form = testHelpers.createMockForm(mockFormValues.player);
        playerManager.createNewPlayer(form);
        expect(mockDataManager.appState.players).toHaveLength(1);
        const player = mockDataManager.appState.players[0];
        expect(player.name).toBe('Test Player');
        expect(player.class).toBe(PlayerClass.FIGHTER);
        expect(player.level).toBe(1);
        expect(player.experience).toBe(0);
    });

    test('should filter players by class', () => {
        const player1 = testHelpers.createMockPlayer({ class: PlayerClass.FIGHTER, name: 'Player 1' });
        const player2 = testHelpers.createMockPlayer({ class: PlayerClass.WIZARD, name: 'Player 2' });
        mockDataManager.appState.players.push(player1, player2);
        playerManager.handleClassFilter(PlayerClass.FIGHTER);
        const playerList = document.getElementById('playerList');
        expect(playerList.innerHTML).toContain('Player 1');
        expect(playerList.innerHTML).not.toContain('Player 2');
    });

    test('should search players', () => {
        const player1 = testHelpers.createMockPlayer({ name: 'Player 1' });
        const player2 = testHelpers.createMockPlayer({ name: 'Player 2' });
        mockDataManager.appState.players.push(player1, player2);
        playerManager.handleSearch('Player 1');
        const playerList = document.getElementById('playerList');
        expect(playerList.innerHTML).toContain('Player 1');
        expect(playerList.innerHTML).not.toContain('Player 2');
    });

    test('should add item to player inventory', () => {
        const player = testHelpers.createMockPlayer();
        mockDataManager.appState.players.push(player);
        playerManager.addToInventory(player.id, 'Item 1');
        expect(player.inventory).toContain('Item 1');
    });

    test('should add active quest to player', () => {
        const player = testHelpers.createMockPlayer();
        mockDataManager.appState.players.push(player);
        playerManager.addActiveQuest(player.id, 'Quest 1');
        expect(player.activeQuests).toContain('Quest 1');
    });

    test('should add completed quest to player', () => {
        const player = testHelpers.createMockPlayer();
        mockDataManager.appState.players.push(player);
        playerManager.addCompletedQuest(player.id, 'Quest 1');
        expect(player.completedQuests).toContain('Quest 1');
    });

    test('should add experience to player', () => {
        const player = testHelpers.createMockPlayer();
        mockDataManager.appState.players.push(player);
        playerManager.addExperience(player.id, 100);
        expect(player.experience).toBe(100);
    });

    test('should update player name', () => {
        const player = testHelpers.createMockPlayer();
        const form = testHelpers.createMockForm({
            playerName: 'Updated Player'
        });
        playerManager.updatePlayerName(player.id, form);
        const updatedPlayer = mockDataManager.getPlayerById(player.id);
        expect(updatedPlayer.name).toBe('Updated Player');
    });

    test('should update player class', () => {
        const player = testHelpers.createMockPlayer();
        const form = testHelpers.createMockForm({
            playerClass: 'wizard'
        });
        playerManager.updatePlayerClass(player.id, form);
        const updatedPlayer = mockDataManager.getPlayerById(player.id);
        expect(updatedPlayer.class).toBe('wizard');
    });
}); 