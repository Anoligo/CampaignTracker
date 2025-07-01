/**
 * Test suite for LootUI
 */
import { jest } from '@jest/globals';
import { LootUI } from '../scripts/modules/loot/ui/index.js';
import { ItemType, ItemRarity } from '../scripts/modules/loot/enums/loot-enums.js';

// Mock dependencies
const mockLootService = {
    getAllItems: jest.fn(),
    getItemById: jest.fn(),
    createItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn()
};

const mockDataManager = {
    // Add any required methods used by LootUI
};

describe.skip('LootUI', () => {
    let lootUI;
    let container;

    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
            <div id="loot">
                <div id="itemList"></div>
                <div id="itemDetails"></div>
                <button id="addItemBtn">Add Item</button>
                <button id="addFirstItemBtn">Add First Item</button>
                <input id="test-lootItemSearch" type="text" data-search-type="loot">
            </div>
        `;

        // Initialize LootUI with mock services
        lootUI = new LootUI(mockLootService, mockDataManager);
        container = document.getElementById('loot');
    });

    afterEach(() => {
        // Clean up after each test
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        it('should initialize with the correct container', () => {
            expect(lootUI.container).toBe(container);
        });

        it('should set up event listeners for add item buttons', () => {
            const addItemBtn = document.getElementById('addItemBtn');
            const addFirstItemBtn = document.getElementById('addFirstItemBtn');
            
            // Simulate click on add item button
            addItemBtn.click();
            
            // Check if the modal was created
            expect(document.querySelector('.modal')).not.toBeNull();
            
            // Clean up
            document.querySelector('.modal')?.remove();
            
            // Simulate click on add first item button
            addFirstItemBtn.click();
            
            // Check if the modal was created
            expect(document.querySelector('.modal')).not.toBeNull();
        });
    });

    describe('handleAdd', () => {
        it('should create a modal for adding a new item', () => {
            // Trigger handleAdd
            lootUI.handleAdd();
            
            // Check if modal was created
            const modal = document.querySelector('.modal');
            expect(modal).not.toBeNull();
            
            // Check if form fields are present
            expect(modal.querySelector('#item-name')).not.toBeNull();
            expect(modal.querySelector('#item-type')).not.toBeNull();
            expect(modal.querySelector('#item-rarity')).not.toBeNull();
            expect(modal.querySelector('#item-value')).not.toBeNull();
            expect(modal.querySelector('#item-description')).not.toBeNull();
        });

        it('should populate type and rarity dropdowns with correct options', () => {
            // Trigger handleAdd
            lootUI.handleAdd();
            
            const typeSelect = document.querySelector('#item-type');
            const raritySelect = document.querySelector('#item-rarity');
            
            // Check if options are populated (excluding the default 'Select...' options)
            expect(typeSelect.options.length).toBe(Object.keys(ItemType).length + 1);
            expect(raritySelect.options.length).toBe(Object.keys(ItemRarity).length + 1);
        });

        it('should show/hide attunement section based on checkbox', () => {
            // Trigger handleAdd
            lootUI.handleAdd();
            
            const requiresAttunement = document.querySelector('#item-requires-attunement');
            const attunementSection = document.querySelector('#item-attunement-section');
            
            // Initially should be hidden
            expect(attunementSection.style.display).toBe('none');
            
            // Check the checkbox
            requiresAttunement.checked = true;
            requiresAttunement.dispatchEvent(new Event('change'));
            
            // Should be visible now
            expect(attunementSection.style.display).toBe('block');
            
            // Uncheck the checkbox
            requiresAttunement.checked = false;
            requiresAttunement.dispatchEvent(new Event('change'));
            
            // Should be hidden again
            expect(attunementSection.style.display).toBe('none');
        });
    });

    describe('Form Submission', () => {
        it('should call createItem with correct data on form submission', async () => {
            // Mock the createItem method to resolve
            mockLootService.createItem.mockResolvedValue({ id: '123', name: 'Test Item' });
            
            // Trigger handleAdd to show the form
            lootUI.handleAdd();
            
            // Fill out the form
            document.querySelector('#item-name').value = 'Test Item';
            document.querySelector('#item-type').value = ItemType.WEAPON;
            document.querySelector('#item-rarity').value = ItemRarity.UNCOMMON;
            document.querySelector('#item-value').value = '100';
            document.querySelector('#item-description').value = 'A test item';
            
            // Submit the form
            const form = document.querySelector('#add-item-form');
            const submitEvent = new Event('submit');
            form.dispatchEvent(submitEvent);
            
            // Check if createItem was called with the correct data
            expect(mockLootService.createItem).toHaveBeenCalledWith({
                name: 'Test Item',
                type: ItemType.WEAPON,
                rarity: ItemRarity.UNCOMMON,
                value: 100,
                description: 'A test item',
                requiresAttunement: false,
                attunedTo: '',
                effects: []
            });
            
            // Since we're using async/await, we need to let the event loop process
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Check if the modal was closed
            expect(document.querySelector('.modal')).toBeNull();
        });

        it('should show error if form submission fails', async () => {
            // Mock the createItem method to reject
            const error = new Error('Failed to create item');
            mockLootService.createItem.mockRejectedValue(error);
            
            // Mock console.error to track if it was called
            console.error = jest.fn();
            
            // Mock showToast
            const mockShowToast = jest.fn();
            window.showToast = mockShowToast;
            
            // Trigger handleAdd to show the form
            lootUI.handleAdd();
            
            // Fill out the form
            document.querySelector('#item-name').value = 'Test Item';
            document.querySelector('#item-type').value = ItemType.WEAPON;
            
            // Submit the form
            const form = document.querySelector('#add-item-form');
            const submitEvent = new Event('submit', { cancelable: true });
            form.dispatchEvent(submitEvent);
            
            // Let the event loop process
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Check if error was logged and toast was shown
            expect(console.error).toHaveBeenCalledWith('Error adding item:', error);
            expect(mockShowToast).toHaveBeenCalledWith('Failed to add item', 'error');
        });
    });

    describe('createListItem', () => {
        it('should create a list item with correct data', () => {
            const item = {
                id: '1',
                name: 'Sword of Testing',
                type: ItemType.WEAPON,
                rarity: ItemRarity.RARE,
                value: 500,
                attunedTo: 'Test Character'
            };
            
            const listItem = lootUI.createListItem(item);
            
            // Check if the list item was created with correct data
            expect(listItem.querySelector('.loot-item__name').textContent).toBe('Sword of Testing');
            expect(listItem.querySelector('.loot-item__meta span:first-child').textContent).toBe('Weapon');
            expect(listItem.querySelector('.loot-item__meta span:last-child').textContent).toBe('500 gp');
            expect(listItem.querySelector('.rarity-badge')).not.toBeNull();
            expect(listItem.querySelector('.fa-link')).not.toBeNull();
        });
    });
});
