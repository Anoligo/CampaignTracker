import { Item, ItemType, ItemRarity, LootManager } from '../scripts/modules/loot.js';
import { MockDataManager, testHelpers, mockFormValues } from './test-setup.js';

describe('Item', () => {
    let item;

    beforeEach(() => {
        item = testHelpers.createMockItem();
    });

    test('should create a new item with correct properties', () => {
        expect(item.name).toBe('Test Item');
        expect(item.type).toBe(ItemType.WEAPON);
        expect(item.description).toBe('A test weapon');
        expect(item.rarity).toBe(ItemRarity.COMMON);
        expect(item.isCursed).toBe(false);
        expect(item.curseEffects).toEqual([]);
        expect(item.owner).toBeNull();
        expect(item.questSource).toBeNull();
        console.log('item.createdAt:', item.createdAt, 'type:', typeof item.createdAt, 'instanceof Date:', item.createdAt instanceof Date);
        console.log('item.updatedAt:', item.updatedAt, 'type:', typeof item.updatedAt, 'instanceof Date:', item.updatedAt instanceof Date);
        expect(item.createdAt instanceof Date).toBe(true);
        expect(item.updatedAt instanceof Date).toBe(true);
    });

    test('should add curse effect', () => {
        item.addCurseEffect('Causes damage over time');
        expect(item.isCursed).toBe(true);
        expect(item.curseEffects).toContain('Causes damage over time');
    });

    test('should not add duplicate curse effect', () => {
        item.addCurseEffect('Causes damage over time');
        item.addCurseEffect('Causes damage over time');
        expect(item.curseEffects).toHaveLength(1);
    });

    test('should remove curse effect', () => {
        item.addCurseEffect('Causes damage over time');
        item.removeCurseEffect('Causes damage over time');
        expect(item.isCursed).toBe(false);
        expect(item.curseEffects).not.toContain('Causes damage over time');
    });

    test('should assign owner', () => {
        item.assignOwner('Player 1');
        expect(item.owner).toBe('Player 1');
    });

    test('should set quest source', () => {
        item.setQuestSource('Quest 1');
        expect(item.questSource).toBe('Quest 1');
    });

    test('should update name', () => {
        item.updateName('New Name');
        expect(item.name).toBe('New Name');
    });

    test('should update description', () => {
        item.updateDescription('New description');
        expect(item.description).toBe('New description');
    });

    test('should update rarity', () => {
        item.updateRarity(ItemRarity.RARE);
        expect(item.rarity).toBe(ItemRarity.RARE);
    });
});

describe('LootManager', () => {
    let lootManager;
    let mockDataManager;

    beforeEach(() => {
        mockDataManager = new MockDataManager();
        lootManager = new LootManager(mockDataManager, true);
    });

    test('should initialize loot section', () => {
        const lootSection = document.getElementById('loot');
        expect(lootSection.innerHTML).toContain('Loot &amp; Curses');
        expect(lootSection.innerHTML).toContain('New Item');
    });

    test('should create new item', () => {
        const form = testHelpers.createMockForm(mockFormValues.item);
        lootManager.createNewItem(form);
        expect(mockDataManager.appState.loot).toHaveLength(1);
        const item = mockDataManager.appState.loot[0];
        expect(item.name).toBe('Test Item');
        expect(item.type).toBe(ItemType.WEAPON);
        expect(item.description).toBe('A test weapon');
        expect(item.rarity).toBe(ItemRarity.COMMON);
    });

    test('should filter items by type', () => {
        const item1 = testHelpers.createMockItem({ type: ItemType.WEAPON, name: 'Item 1' });
        const item2 = testHelpers.createMockItem({ type: ItemType.ARMOR, name: 'Item 2' });
        mockDataManager.appState.loot.push(item1, item2);
        lootManager.handleTypeFilter(ItemType.WEAPON);
        const itemList = document.getElementById('itemList');
        expect(itemList.innerHTML).toContain('Item 1');
        expect(itemList.innerHTML).not.toContain('Item 2');
    });

    test('should search items', () => {
        const item1 = testHelpers.createMockItem({ name: 'Item 1' });
        const item2 = testHelpers.createMockItem({ name: 'Item 2' });
        mockDataManager.appState.loot.push(item1, item2);
        lootManager.handleSearch('Item 1');
        const itemList = document.getElementById('itemList');
        expect(itemList.innerHTML).toContain('Item 1');
        expect(itemList.innerHTML).not.toContain('Item 2');
    });

    test('should add curse effect to item', () => {
        const item = testHelpers.createMockItem();
        mockDataManager.appState.loot.push(item);
        lootManager.addCurseEffect(item.id, 'Causes damage over time');
        expect(item.isCursed).toBe(true);
        expect(item.curseEffects).toContain('Causes damage over time');
    });

    test('should assign owner to item', () => {
        const item = testHelpers.createMockItem();
        mockDataManager.appState.loot.push(item);
        lootManager.assignOwner(item.id, 'Player 1');
        expect(item.owner).toBe('Player 1');
    });

    test('should set quest source for item', () => {
        const item = testHelpers.createMockItem();
        mockDataManager.appState.loot.push(item);
        lootManager.setQuestSource(item.id, 'Quest 1');
        expect(item.questSource).toBe('Quest 1');
    });

    test('should update item name', () => {
        const item = testHelpers.createMockItem();
        mockDataManager.appState.loot.push(item);
        const form = testHelpers.createMockForm({ itemName: 'New Name' });
        lootManager.updateItemName(item.id, form);
        expect(item.name).toBe('New Name');
    });

    test('should update item description', () => {
        const item = testHelpers.createMockItem();
        mockDataManager.appState.loot.push(item);
        const form = testHelpers.createMockForm({ itemDescription: 'New description' });
        lootManager.updateItemDescription(item.id, form);
        expect(item.description).toBe('New description');
    });

    test('should update item rarity', () => {
        const item = testHelpers.createMockItem();
        mockDataManager.appState.loot.push(item);
        const form = testHelpers.createMockForm({ itemRarity: ItemRarity.RARE });
        lootManager.updateItemRarity(item.id, form);
        expect(item.rarity).toBe(ItemRarity.RARE);
    });
}); 