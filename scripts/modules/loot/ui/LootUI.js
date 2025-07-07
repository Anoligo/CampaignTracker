/**
 * LootUI Component
 * Main controller for the Loot UI
 */

import { BaseUI } from '../../../components/base-ui.js';
import { LootList } from './LootList.js';
import { LootForm } from './LootForm.js';
import { showToast } from '../../../components/ui-components.js';
import { formatEnumValue, getRarityColor } from '../../../utils/style-utils.js';

export class LootUI extends BaseUI {
    // Class field syntax for methods to ensure proper binding
    getAll = async () => {
        console.log('[LootUI] Getting all items');
        return await this.lootService.getAllItems();
    };
    
    getById = async (id) => {
        console.log(`[LootUI] Getting item by id: ${id}`);
        return await this.lootService.getItemById(id);
    };
    
    add = async (item) => {
        console.log('[LootUI] Adding item:', item);
        return await this.lootService.createItem(item);
    };
    
    update = async (id, updates) => {
        console.log(`[LootUI] Updating item ${id}:`, updates);
        return await this.lootService.updateItem(id, updates);
    };
    
    delete = async (id) => {
        console.log(`[LootUI] Deleting item ${id}`);
        return await this.lootService.deleteItem(id);
    };
    
    refreshList = async () => {
        try {
            const items = await this.getAll();
            this.entities = items || [];
            this.renderList(this.entities);
            
            // If we have a current item, refresh its details
            if (this.currentItemId) {
                const freshItem = await this.getById(this.currentItemId);
                if (freshItem) {
                    this.currentEntity = freshItem;
                    this.renderDetails(freshItem);
                }
            }
        } catch (error) {
            console.error('[LootUI] Error refreshing list:', error);
            showToast('Error loading items', 'error');
        }
    };
    
    // Override BaseUI's refresh to handle async operations
    refresh = async (entityId = null) => {
        console.groupCollapsed(`[LootUI] Refreshing UI${entityId ? ' for entity ' + entityId : ''}`);
        
        try {
            console.log('[LootUI] Fetching all items...');
            this.entities = await this.getAll() || [];
            console.log(`[LootUI] Fetched ${this.entities.length} items`);
            
            // Render the list with the fresh data
            console.log('[LootUI] Rendering list...');
            this.renderList(this.entities);
            
            // Get the form and details containers
            const formContainer = document.getElementById(this.config.formContainerId);
            const detailsContainer = document.getElementById(this.config.detailsId);
            
            // If we're currently showing the form, don't change the view
            const isFormVisible = formContainer && formContainer.style.display !== 'none';
            
            // If an entity ID is provided, select it
            if (entityId) {
                console.log(`[LootUI] Refreshing entity ${entityId}...`);
                const freshEntity = await this.getById(entityId);
                if (freshEntity) {
                    console.log('[LootUI] Entity found, selecting...');
                    this.currentEntity = freshEntity;
                    this.currentItemId = entityId;
                    
                    // Only update the view if we're not in the middle of editing
                    if (!isFormVisible) {
                        // Show details view
                        if (detailsContainer) {
                            detailsContainer.style.display = 'block';
                        }
                        if (formContainer) {
                            formContainer.style.display = 'none';
                        }
                        
                        // Render the details
                        this.renderDetails(freshEntity);
                    }
                } else {
                    console.warn(`[LootUI] Entity ${entityId} not found`);
                    // If the entity wasn't found, clear the details view
                    if (detailsContainer) {
                        detailsContainer.innerHTML = `
                            <div class="empty-state empty-state--details">
                                <i class="fas fa-exclamation-circle fa-3x mb-3 text-warning"></i>
                                <p class="empty-state__message">Item not found</p>
                                <button class="btn btn-outline-secondary btn-sm" id="backToListBtn">
                                    <i class="fas fa-arrow-left me-1"></i> Back to List
                                </button>
                            </div>
                        `;
                        
                        // Add event listener to the back button
                        const backBtn = detailsContainer.querySelector('#backToListBtn');
                        if (backBtn) {
                            backBtn.addEventListener('click', () => {
                                if (detailsContainer) detailsContainer.style.display = 'none';
                                if (formContainer) formContainer.style.display = 'none';
                            });
                        }
                    }
                }
            } else if (this.currentItemId && !isFormVisible) {
                // Otherwise, refresh the current entity if available and we're not editing
                console.log(`[LootUI] Refreshing current entity ${this.currentItemId}...`);
                const freshEntity = await this.getById(this.currentItemId);
                if (freshEntity) {
                    console.log('[LootUI] Current entity found, updating details...');
                    this.currentEntity = freshEntity;
                    
                    // Show details view
                    if (detailsContainer) {
                        detailsContainer.style.display = 'block';
                    }
                    if (formContainer) {
                        formContainer.style.display = 'none';
                    }
                    
                    this.renderDetails(freshEntity);
                } else {
                    console.warn(`[LootUI] Current entity ${this.currentItemId} not found`);
                    this.currentItemId = null;
                    this.currentEntity = null;
                    
                    // Clear the details view
                    if (detailsContainer) {
                        detailsContainer.style.display = 'none';
                    }
                }
            } else {
                console.log('[LootUI] No entity ID provided and no current item selected');
                // If we're not showing the form, ensure the details view is hidden
                if (!isFormVisible && detailsContainer) {
                    detailsContainer.style.display = 'none';
                }
            }
            
            console.log('[LootUI] Refresh completed successfully');
        } catch (error) {
            console.error('[LootUI] Error refreshing UI:', error);
            showToast('Error refreshing data', 'error');
        } finally {
            console.groupEnd();
        }
    };
    
    /**
     * Handle add button click
     */
    handleAdd = (e) => {
        console.groupCollapsed('[LootUI] handleAdd called');
        console.log('Event:', e);
        
        try {
            e?.preventDefault();
            
            console.log('Setting isEditing to false');
            this.isEditing = false;
            this.currentItemId = null;
            this.currentEntity = null;
            
            // Ensure the form is properly initialized
            if (!this.lootForm) {
                console.warn('lootForm is not initialized, initializing now');
                this.initializeComponents();
            }
            
            // Clear any existing form data
            if (this.lootForm) {
                console.log('Calling clearForm on lootForm');
                this.lootForm.clearForm();
                
                // Show the form
                console.log('Calling showForm');
                this.showForm();
                
                // Ensure form is visible
                const formContainer = document.getElementById(this.config.formContainerId);
                if (formContainer) {
                    formContainer.style.display = 'block';
                }
                
                // Hide details view
                const detailsContainer = document.getElementById(this.config.detailsId);
                if (detailsContainer) {
                    detailsContainer.style.display = 'none';
                }
                
                // Focus the first input field for better UX
                setTimeout(() => {
                    const firstInput = formContainer?.querySelector('input, select, textarea');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 100);
            } else {
                console.error('lootForm is still not available after initialization attempt');
            }
            
            console.log('handleAdd completed successfully');
        } catch (error) {
            console.error('Error in handleAdd:', error);
            showToast('Error preparing the add item form', 'error');
        } finally {
            console.groupEnd();
        }
    };
    
    /**
     * Handle edit button click
     * @param {string} id - The ID of the item to edit
     */
    handleEdit = async (id) => {
        console.groupCollapsed(`[LootUI] Edit item: ${id}`);
        try {
            this.isEditing = true;
            this.currentItemId = id;
            
            // Show the form in the right pane
            const formContainer = document.getElementById(this.config.formContainerId);
            const detailsContainer = document.getElementById(this.config.detailsId);
            
            if (formContainer) {
                formContainer.style.display = 'block';
            }
            if (detailsContainer) {
                detailsContainer.style.display = 'none';
            }
            
            // Show the form with the item data
            await this.lootForm.show(id);
            
            console.log('[LootUI] Edit form shown');
        } catch (error) {
            console.error('[LootUI] Error in handleEdit:', error);
            showToast('Error loading item for editing', 'error');
        } finally {
            console.groupEnd();
        }
    };
    
    /**
     * Handle item click in the list
     * @param {string} id - The ID of the clicked item
     */
    handleItemClick = async (id) => {
        console.log(`[LootUI] Item clicked: ${id}`);
        this.currentItemId = id;
        
        // Show the details in the right pane
        const formContainer = document.getElementById(this.config.formContainerId);
        const detailsContainer = document.getElementById(this.config.detailsId);
        
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        if (detailsContainer) {
            detailsContainer.style.display = 'block';
        }
        
        await this.selectEntity(id);
    };
    
    /**
     * Handle delete button click
     * @param {string} id - The ID of the item to delete
     */
    handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await this.delete(id);
                await this.refreshList();
                showToast('Item deleted successfully', 'success');
            } catch (error) {
                console.error('[LootUI] Error deleting item:', error);
                showToast('Error deleting item', 'error');
            }
        }
    };
    
    /**
     * Handle cancel edit
     */
    cancelEdit = () => {
        this.hideForm();
    };
    
    /**
     * Show the form
     */
    showForm() {
        console.groupCollapsed('[LootUI] Showing form...');
        try {
            console.log(`[LootUI] Looking for form container with ID: ${this.config.formContainerId}`);
            
            // Log all elements with the ID to check for duplicates
            const allElements = document.querySelectorAll(`#${this.config.formContainerId}`);
            console.log(`[LootUI] Found ${allElements.length} elements with ID ${this.config.formContainerId}:`, allElements);
            
            const formContainer = document.getElementById(this.config.formContainerId);
            
            if (!formContainer) {
                console.error(`[LootUI] Form container not found: ${this.config.formContainerId}`);
                console.log('[LootUI] Document body:', document.body);
                console.log('[LootUI] Loot container:', document.getElementById('loot'));
                console.groupEnd();
                return;
            }
            
            console.log('[LootUI] Form container found:', formContainer);
            
            // Ensure form is properly initialized
            if (!this.lootForm) {
                console.error('[LootUI] lootForm is not initialized');
                console.groupEnd();
                return;
            }
            
            // Clear the form if we're not editing
            if (!this.isEditing) {
                console.log('[LootUI] Clearing form for new item');
                this.lootForm.clearForm();
            }
            
            // Show the form with the current item (or null for new item)
            const itemToEdit = this.isEditing && this.currentItemId ? this.currentItemId : null;
            console.log(`[LootUI] Showing form for ${itemToEdit ? 'edit' : 'new item'}`);
            this.lootForm.show(itemToEdit);
            
            // Ensure the form is visible
            console.log('[LootUI] Making form container visible');
            formContainer.style.display = 'block';
            
            // Hide the details view
            const detailsContainer = document.getElementById(this.config.detailsId);
            if (detailsContainer) {
                detailsContainer.style.display = 'none';
            }
            
            // Scroll to the form for better UX
            console.log('[LootUI] Scrolling to form');
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            console.log('[LootUI] Form shown successfully');
        } catch (error) {
            console.error('[LootUI] Error in showForm:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Hide the form
     */
    hideForm() {
        const formContainer = document.getElementById(this.config.formContainerId);
        if (formContainer) {
            formContainer.style.display = 'none';
        }
    }
    
    /**
     * Handle search input
     * @param {string} query - The search query
     */
    handleSearch(query) {
        console.log(`[LootUI] Searching for: ${query}`);
        if (!query.trim()) {
            this.refreshList();
            return;
        }
        
        const filteredItems = this.entities.filter(item => {
            const searchStr = `${item.name} ${item.description} ${item.type}`.toLowerCase();
            return searchStr.includes(query.toLowerCase());
        });
        
        this.renderList(filteredItems);
    }
    
    /**
     * Select and display an entity
     * @param {string} id - The ID of the entity to select
     */
    async selectEntity(id) {
        console.groupCollapsed(`[LootUI] Selecting entity ${id}`);
        
        try {
            if (!id) {
                console.warn('[LootUI] No ID provided for selectEntity');
                return;
            }
            
            console.log(`[LootUI] Fetching item ${id}...`);
            const item = await this.getById(id);
            
            if (item) {
                console.log('[LootUI] Item found, updating current entity and rendering details');
                this.currentEntity = item;
                this.currentItemId = id;
                this.renderDetails(item);
            } else {
                console.warn(`[LootUI] Item ${id} not found`);
                this.currentEntity = null;
                this.currentItemId = null;
            }
            
            console.log('[LootUI] Entity selection complete');
        } catch (error) {
            console.error(`[LootUI] Error selecting item ${id}:`, error);
            showToast('Error loading item details', 'error');
            throw error; // Re-throw to allow callers to handle the error
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Handle item click in the list
     * @param {string} id - The ID of the clicked item
     */
    // Removed duplicate handleItemClick method;
    
    /**
     * Render the item list
     * @param {Array} items - The items to render
     */
    renderList = (items) => {
        if (this.lootList) {
            this.lootList.render(items);
        }
    };
    
    /**
     * Render the item details in the right pane
     * @param {Object} item - The item to display details for
     */
    renderDetails = (item) => {
        console.groupCollapsed('[LootUI] Rendering item details:', item?.id);
        
        try {
            if (!item) {
                console.warn('[LootUI] No item provided to renderDetails');
                return;
            }
            
            const detailsContainer = document.getElementById(this.config.detailsId);
            if (!detailsContainer) {
                console.warn('[LootUI] Details container not found:', this.config.detailsId);
                return;
            }
            
            // Skip rendering if we're currently showing the form
            const formContainer = document.getElementById(this.config.formContainerId);
            if (formContainer && formContainer.style.display !== 'none') {
                console.log('[LootUI] Form is currently visible, skipping details render');
                return;
            }
            
            // Show the details container
            detailsContainer.style.display = 'block';
            
            // Format the item details
            const rarity = item.rarity ? formatEnumValue(item.rarity) : 'Common';
            const type = item.type ? formatEnumValue(item.type) : 'Miscellaneous';
            const value = item.value ? `${item.value} gp` : '—';
            const weight = item.weight !== undefined ? `${item.weight} lb` : '—';
            
            // Create the HTML for the item details
            detailsContainer.innerHTML = `
                <div class="loot-details-content">
                    <div class="loot-details-header">
                        <h3 class="loot-item-name">${item.name || 'Unnamed Item'}</h3>
                        <div class="loot-item-meta">
                            <span class="badge bg-${getRarityColor(item.rarity || 'common')}">${rarity}</span>
                            <span class="badge bg-secondary">${type}</span>
                        </div>
                    </div>
                    
                    <div class="loot-details-body">
                        ${item.description ? `
                            <div class="loot-item-description">
                                <p>${item.description}</p>
                            </div>
                        ` : ''}
                        
                        <div class="loot-item-stats">
                            <div class="stat-row">
                                <span class="stat-label">Value:</span>
                                <span class="stat-value">${value}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Weight:</span>
                                <span class="stat-value">${weight}</span>
                            </div>
                            ${item.requiresAttunement ? `
                                <div class="stat-row">
                                    <span class="stat-label">Attunement:</span>
                                    <span class="stat-value">Required</span>
                                </div>
                            ` : ''}
                            ${item.isCursed ? `
                                <div class="stat-row text-danger">
                                    <i class="fas fa-exclamation-triangle me-1"></i>
                                    <span class="stat-label fw-bold">Cursed:</span>
                                    <span class="stat-value">This item is cursed</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="loot-details-footer">
                        <button class="btn btn-outline-primary btn-sm" id="editItemBtn">
                            <i class="fas fa-edit me-1"></i> Edit
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listener to the edit button
            const editBtn = detailsContainer.querySelector('#editItemBtn');
            if (editBtn) {
                editBtn.addEventListener('click', () => this.handleEdit(item.id));
            }
            
            console.log('[LootUI] Item details rendered');
        } catch (error) {
            console.error('[LootUI] Error rendering item details:', error);
            showToast('Error displaying item details', 'error');
        } finally {
            console.groupEnd();
        }
    }
    
    constructor(lootService, dataManager) {
        console.log('[LootUI] Initializing with service:', lootService ? 'valid' : 'invalid');
        
        // Define config first (don't use 'this' before super())
        const config = {
            containerId: 'loot',
            listId: 'itemList',
            detailsId: 'itemDetails',
            searchId: 'lootItemSearch',
            addButtonId: 'addItemBtn',
            formContainerId: 'lootFormContainer',
            entityName: 'item'
        };
               
        // Initialize BaseUI with config (MUST be called before accessing 'this')
        super(config);
        
        // Store service references and config
        this.lootService = lootService;
        this.dataManager = dataManager;
        this.config = config;
        this.isEditing = false;
        this.currentItemId = null;
        this.initialized = false;
        
        // Methods are already bound using arrow functions
        // No need for explicit .bind() calls
        
        console.log('[LootUI] Constructor complete');
    }
    
    /**
     * Initialize the UI components
     * @returns {Promise<void>}
     */
    async init() {
        console.groupCollapsed('[LootUI] Initializing LootUI...');
        
        if (this.initialized) {
            console.warn('[LootUI] Already initialized, skipping...');
            console.groupEnd();
            return;
        }
        
        // Set flag early to prevent re-entrancy
        this.initialized = true;
        
        try {
            console.log('[LootUI] Initializing components...');
            await this.initializeComponents();
            
            console.log('[LootUI] Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('[LootUI] Performing initial refresh...');
            await this.refreshList();
            
            // Hide form initially
            const formContainer = document.getElementById(this.config.formContainerId);
            if (formContainer) {
                console.log('[LootUI] Hiding form container');
                formContainer.style.display = 'none';
            } else {
                console.warn('[LootUI] Form container not found:', this.config.formContainerId);
            }
            
            console.log('[LootUI] Initialization complete');
        } catch (error) {
            console.error('[LootUI] Error during initialization:', error);
            // Reset initialized flag on error
            this.initialized = false;
            throw error;
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Initialize child components
     * @private
     */
    async initializeComponents() {
        console.groupCollapsed('[LootUI] Initializing components...');
        
        try {
            // Clean up any existing instances
            if (this.lootList) {
                console.log('[LootUI] Cleaning up existing LootList instance');
                if (typeof this.lootList.cleanup === 'function') {
                    try {
                        this.lootList.cleanup();
                    } catch (error) {
                        console.error('[LootUI] Error cleaning up LootList:', error);
                    }
                }
                this.lootList = null;
            } else {
                console.log('[LootUI] No existing LootList to clean up');
            }
            
            if (this.lootForm) {
                console.log('[LootUI] Cleaning up existing LootForm instance');
                if (typeof this.lootForm.cleanup === 'function') {
                    try {
                        this.lootForm.cleanup();
                    } catch (error) {
                        console.error('[LootUI] Error cleaning up LootForm:', error);
                    }
                }
                this.lootForm = null;
            } else {
                console.log('[LootUI] No existing LootForm to clean up');
            }
            
            // Ensure the form container exists in the DOM
            let formContainer = document.getElementById(this.config.formContainerId);
            if (!formContainer) {
                console.log('[LootUI] Form container not found, creating one...');
                const detailsContainer = document.querySelector('.loot-details-container');
                if (detailsContainer) {
                    formContainer = document.createElement('div');
                    formContainer.id = this.config.formContainerId;
                    formContainer.className = 'loot-form-container';
                    detailsContainer.parentNode.insertBefore(formContainer, detailsContainer);
                    console.log('[LootUI] Form container created');
                } else {
                    console.error('[LootUI] Could not find loot details container to insert form');
                }
            }
            
            // Initialize LootList with parent reference
            this.lootList = new LootList(this);
            
            // Update the config with the correct IDs
            this.config.listId = this.config.listId || 'itemList';
            this.config.searchId = this.config.searchId || 'lootItemSearch';
            
            // Initialize LootForm with parent reference
            this.lootForm = new LootForm(this);
            
            // Ensure the form container is hidden initially
            if (formContainer) {
                formContainer.style.display = 'none';
            }
            
            // Force a refresh of the list to ensure data is loaded
            await this.refreshList();
            
            console.log('[LootUI] Components initialized');
            return true;
        } catch (error) {
            console.error('[LootUI] Error initializing components:', error);
            throw error;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        console.groupCollapsed('[LootUI] Setting up event listeners');
        
        try {
            // Log the current state
            console.log('Current config:', this.config);
            
            // Remove any existing event listeners first
            console.log('Removing any existing event listeners...');
            this.removeEventListeners();
            
            // Helper function to set up the add button
            const setupAddButton = () => {
                console.log(`[setupAddButton] Looking for add button with ID: ${this.config.addButtonId}`);
                this.addButton = document.getElementById(this.config.addButtonId);
                
                if (this.addButton) {
                    console.log('[setupAddButton] Add button found, adding click listener');
                    
                    // Remove any existing listeners to prevent duplicates
                    this.addButton.removeEventListener('click', this.handleAdd);
                    
                    // Add the click handler
                    this.addButton.addEventListener('click', (e) => {
                        console.group('[Add Button Click Handler]');
                        console.log('Event target:', e.target);
                        console.log('Current target:', e.currentTarget);
                        console.log('Button state:', {
                            disabled: e.currentTarget.disabled,
                            id: e.currentTarget.id,
                            classList: e.currentTarget.classList.toString()
                        });
                        
                        try {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Calling handleAdd...');
                            this.handleAdd(e);
                        } catch (error) {
                            console.error('Error in add button click handler:', error);
                        } finally {
                            console.groupEnd();
                        }
                    });
                    
                    // Also set up the "Add Your First Item" button if it exists
                    const firstItemBtn = document.getElementById('addFirstItemBtn');
                    if (firstItemBtn) {
                        console.log('[setupAddButton] Found "Add Your First Item" button, adding click listener');
                        firstItemBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Add first item button clicked');
                            this.handleAdd(e);
                        });
                    }
                    
                    console.log('[setupAddButton] Add button setup complete');
                } else {
                    console.warn(`[setupAddButton] Add button not found with ID: ${this.config.addButtonId}`);
                    
                    // Try to find the button by class or other means as a fallback
                    const potentialButtons = document.querySelectorAll('button');
                    console.log(`[setupAddButton] Found ${potentialButtons.length} buttons in document`);
                    
                    potentialButtons.forEach((btn, index) => {
                        if (btn.textContent.includes('Add Item') || btn.textContent.includes('Add Your First Item')) {
                            console.log(`[setupAddButton] Found potential add button at index ${index}:`, {
                                id: btn.id,
                                text: btn.textContent.trim(),
                                classList: btn.classList.toString()
                            });
                        }
                    });
                }
            };
            
            // Set up the add button immediately
            setupAddButton();
            
            // Also set up a mutation observer to handle dynamic content loading
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                    let shouldCheckButton = false;
                    
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length > 0) {
                            shouldCheckButton = true;
                        }
                    });
                    
                    if (shouldCheckButton && !this.addButton) {
                        console.log('[MutationObserver] DOM changed, checking for add button again...');
                        setupAddButton();
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                this._mutationObserver = observer;
            }
            
            // Search input
            console.log(`Looking for search input with ID: ${this.config.searchId}`);
            this.searchInput = document.getElementById(this.config.searchId);
            if (this.searchInput) {
                console.log('Search input found, adding input listener');
                this.searchInput.addEventListener('input', (e) => {
                    console.log('Search input changed:', e.target.value);
                    this.handleSearch(e.target.value);
                });
            } else {
                console.warn(`[LootUI] Search input not found with ID: ${this.config.searchId}`);
            }
            
            console.log('Event listeners setup completed');
        } catch (error) {
            console.error('[LootUI] Error setting up event listeners:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Remove all event listeners
     * @private
     */
    removeEventListeners() {
        console.groupCollapsed('[LootUI] Removing event listeners');
        
        try {
            // Remove add button listeners
            if (this.addButton) {
                console.log('Removing event listeners from add button');
                
                // Remove the debug handler if it exists
                if (this._debugClickHandler) {
                    this.addButton.removeEventListener('click', this._debugClickHandler);
                    this._debugClickHandler = null;
                }
                
                // Remove the main handler
                this.addButton.removeEventListener('click', this.handleAdd);
                this.addButton = null;
            }
            
            // Remove search input listener
            if (this.searchInput) {
                console.log('Removing event listeners from search input');
                // We need to store a reference to the handler to remove it properly
                if (!this._searchHandler) {
                    this._searchHandler = (e) => this.handleSearch(e.target.value);
                }
                this.searchInput.removeEventListener('input', this._searchHandler);
                this.searchInput = null;
            }
            
            console.log('All event listeners removed');
        } catch (error) {
            console.error('[LootUI] Error removing event listeners:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Remove all event listeners and clean up resources
     * @returns {void}
     */
    cleanup() {
        console.log('[LootUI] Cleaning up resources');
        this.removeEventListeners();
        
        // Clean up child components
        if (this.lootList && typeof this.lootList.cleanup === 'function') {
            this.lootList.cleanup();
            this.lootList = null;
        }
        
        if (this.lootForm && typeof this.lootForm.cleanup === 'function') {
            this.lootForm.cleanup();
            this.lootForm = null;
        }
        
        // Clear references
        this.container = null;
        this.initialized = false;
    }
    
    /**
     * Remove all event listeners
     * @private
     */
    removeEventListeners = () => {
        console.log('[LootUI] Removing event listeners');
        
        // Remove add button listener
        if (this.addButton) {
            this.addButton.removeEventListener('click', this.handleAdd);
            this.addButton = null;
        }
        
        // Remove search input listener
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearch);
            this.searchInput = null;
        }
    }
}
