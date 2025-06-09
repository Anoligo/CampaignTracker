import { GuildService } from './services/guild-service.js';
import { GuildUI } from './ui/guild-ui.js';

/**
 * GuildManager coordinates between the UI and the GuildService
 * It serves as the main interface for guild-related operations
 */
export class GuildManager {
    /**
     * Create a new GuildManager instance
     * @param {Object} dataManager - The application's data manager
     */
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.guildService = new GuildService(dataManager);
        this.guildUI = null;
        this.initialized = false;
    }
    
    /**
     * Initialize the guild section
     */
    async initialize() {
        if (this.initialized) {
            console.log('Guild manager already initialized');
            return;
        }
        
        console.log('Initializing guild manager...');
        
        try {
            // Initialize guild data if it doesn't exist
            this.initializeGuildData();
            
            // Create the UI
            this.guildUI = new GuildUI(this);
            
            this.initialized = true;
            console.log('Guild manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize guild manager:', error);
            throw error;
        }
    }

    /**
     * Initialize the guild data
     */
    initializeGuildData() {
        // Initialize guild data if it doesn't exist
        if (!this.dataManager.appState.guildLogs) {
            console.log('Initializing guild data...');
            this.dataManager.appState.guildLogs = {
                activities: [],
                resources: []
            };
            
            // Add some sample data if the arrays are empty
            if (this.dataManager.appState.guildLogs.activities.length === 0) {
                console.log('Adding sample activities...');
                this.dataManager.appState.guildLogs.activities = [
                    {
                        id: 'act1',
                        name: 'First Guild Quest',
                        description: 'A simple quest to get started',
                        type: 'quest',
                        status: 'in-progress',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
            }
            
            if (this.dataManager.appState.guildLogs.resources.length === 0) {
                console.log('Adding sample resources...');
                this.dataManager.appState.guildLogs.resources = [
                    {
                        id: 'res1',
                        name: 'Gold Coins',
                        description: 'Standard currency',
                        type: 'gold',
                        quantity: 100,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
            }
            
            // Save the updated state
            this.dataManager.saveState();
        }
    }
    
    /**
     * Get all guild activities
     * @returns {Array} Array of guild activities
     */
    getAllActivities() {
        return this.guildService.getAllActivities();
    }
    
    /**
     * Get all guild resources
     * @returns {Array} Array of guild resources
     */
    getAllResources() {
        return this.guildService.getAllResources();
    }
    
    /**
     * Create a new guild activity
     * @param {Object} activityData - The activity data
     * @returns {Object} The created activity
     */
    createNewActivity(activityData) {
        return this.guildService.createActivity(activityData);
    }
    
    /**
     * Create a new guild resource
     * @param {Object} resourceData - The resource data
     * @returns {Object} The created resource
     */
    createNewResource(resourceData) {
        return this.guildService.createResource(resourceData);
    }
    
    /**
     * Update an existing guild activity
     * @param {string} id - The activity ID
     * @param {Object} updates - The updates to apply
     * @returns {Object|null} The updated activity or null if not found
     */
    updateActivity(id, updates) {
        return this.guildService.updateActivity(id, updates);
    }
    
    /**
     * Update an existing guild resource
     * @param {string} id - The resource ID
     * @param {Object} updates - The updates to apply
     * @returns {Object|null} The updated resource or null if not found
     */
    updateResource(id, updates) {
        return this.guildService.updateResource(id, updates);
    }
    
    /**
     * Delete a guild activity
     * @param {string} id - The activity ID
     * @returns {boolean} True if deleted, false otherwise
     */
    deleteActivity(id) {
        return this.guildService.deleteActivity(id);
    }
    
    /**
     * Delete a guild resource
     * @param {string} id - The resource ID
     * @returns {boolean} True if deleted, false otherwise
     */
    deleteResource(id) {
        return this.guildService.deleteResource(id);
    }
    
    /**
     * Initialize the guild UI
     */
    async initializeUI() {
        const guildSection = document.getElementById('guild');
        if (!guildSection) {
            console.error('Guild section not found');
            return;
        }
        
        // Set up the guild section UI
        guildSection.innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h2 class="text-accent mb-4">Guild Management</h2>
                        
                        <!-- Tabs -->
                        <ul class="nav nav-tabs mb-4" id="guildTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="activities-tab" data-bs-toggle="tab" 
                                    data-bs-target="#activities" type="button" role="tab" aria-controls="activities" 
                                    aria-selected="true">Activities</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="resources-tab" data-bs-toggle="tab" 
                                    data-bs-target="#resources" type="button" role="tab" aria-controls="resources" 
                                    aria-selected="false">Resources</button>
                            </li>
                        </ul>
                        
                        <!-- Tab Content -->
                        <div class="tab-content" id="guildTabsContent">
                            <!-- Activities Tab -->
                            <div class="tab-pane fade show active" id="activities" role="tabpanel" aria-labelledby="activities-tab">
                                <div class="card mb-4">
                                    <div class="card-header bg-card d-flex justify-content-between align-items-center">
                                        <h3 class="mb-0">Guild Activities</h3>
                                        <button class="button" id="add-activity-btn">
                                            <i class="fas fa-plus"></i> Add Activity
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <div class="input-group">
                                                <input type="text" class="form-control bg-card text" 
                                                    id="activity-search" placeholder="Search activities...">
                                                <button class="button" type="button" id="activity-search-btn">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="activity-list">
                                            <!-- Activities will be rendered here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Resources Tab -->
                            <div class="tab-pane fade" id="resources" role="tabpanel" aria-labelledby="resources-tab">
                                <div class="card">
                                    <div class="card-header bg-card d-flex justify-content-between align-items-center">
                                        <h3 class="mb-0">Guild Resources</h3>
                                        <button class="button" id="add-resource-btn">
                                            <i class="fas fa-plus"></i> Add Resource
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <div class="input-group">
                                                <input type="text" class="form-control bg-card text" 
                                                    id="resource-search" placeholder="Search resources...">
                                                <button class="button" type="button" id="resource-search-btn">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="resource-list">
                                            <!-- Resources will be rendered here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize the guild UI
        if (this.guildUI) {
            this.guildUI.initializeUI();
        }
        
        // Set up event listeners for the UI
        this.setupEventListeners();
        
        // Setup event listeners after recreating the DOM elements
        if (this.guildUI) {
            this.guildUI.setupResourceEventListeners();
            this.guildUI.initialize();
        }
    }
    
    /**
     * Set up event listeners for the guild UI
     */
    setupEventListeners() {
        // Add activity button
        const addActivityBtn = document.getElementById('add-activity-btn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => {
                if (this.guildUI) {
                    this.guildUI.showNewActivityForm();
                }
            });
        }
        
        // Add resource button
        const addResourceBtn = document.getElementById('add-resource-btn');
        if (addResourceBtn) {
            addResourceBtn.addEventListener('click', () => {
                if (this.guildUI) {
                    this.guildUI.showNewResourceForm();
                }
            });
        }
        
        // Activity search
        const activitySearchBtn = document.getElementById('activity-search-btn');
        const activitySearchInput = document.getElementById('activity-search');
        if (activitySearchBtn && activitySearchInput) {
            activitySearchBtn.addEventListener('click', () => {
                if (this.guildUI) {
                    this.guildUI.handleSearch(activitySearchInput.value);
                }
            });
            
            activitySearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.guildUI) {
                    this.guildUI.handleSearch(activitySearchInput.value);
                }
            });
        }
        
        // Resource search
        const resourceSearchBtn = document.getElementById('resource-search-btn');
        const resourceSearchInput = document.getElementById('resource-search');
        if (resourceSearchBtn && resourceSearchInput) {
            resourceSearchBtn.addEventListener('click', () => {
                if (this.guildUI) {
                    this.guildUI.handleResourceSearch(resourceSearchInput.value);
                }
            });
            
            resourceSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.guildUI) {
                    this.guildUI.handleResourceSearch(resourceSearchInput.value);
                }
            });
        }
    }

    // Activity Methods
    /**
     * Create a new guild activity
     * @param {Object} formData - Form data for the new activity
     */
    createNewActivity(formData) {
        const newActivity = this.guildService.createActivity({
            name: formData['activity-name'],
            description: formData['activity-description'],
            type: formData['activity-type'],
            status: 'pending',
            rewards: [],
            participants: []
        });
        this.guildUI.renderActivityList();
        return newActivity;
    }

    /**
     * Update an existing activity
     * @param {string} activityId - ID of the activity to update
     * @param {Object} updates - Object containing the updates
     */
    updateActivity(activityId, updates) {
        const updated = this.guildService.updateActivity(activityId, {
            ...updates,
            updatedAt: new Date()
        });
        this.guildUI.renderActivityList();
        return updated;
    }

    /**
     * Delete an activity
     * @param {string} activityId - ID of the activity to delete
     */
    deleteActivity(activityId) {
        const success = this.guildService.deleteActivity(activityId);
        if (success) {
            this.guildUI.renderActivityList();
        }
        return success;
    }

    // Resource Methods
    /**
     * Create a new guild resource
     * @param {Object} formData - Form data for the new resource
     */
    createNewResource(formData) {
        const newResource = this.guildService.createResource({
            name: formData['resource-name'],
            description: formData['resource-description'],
            type: formData['resource-type'],
            quantity: parseInt(formData['resource-quantity'], 10) || 0
        });
        this.guildUI.renderResourceList();
        return newResource;
    }

    /**
     * Update an existing resource
     * @param {string} resourceId - ID of the resource to update
     * @param {Object} updates - Object containing the updates
     */
    updateResource(resourceId, updates) {
        const updated = this.guildService.updateResource(resourceId, {
            ...updates,
            updatedAt: new Date()
        });
        this.guildUI.renderResourceList();
        return updated;
    }

    /**
     * Delete a resource
     * @param {string} resourceId - ID of the resource to delete
     */
    deleteResource(resourceId) {
        const success = this.guildService.deleteResource(resourceId);
        if (success) {
            this.guildUI.renderResourceList();
        }
        return success;
    }

    /**
     * Add quantity to a resource
     * @param {string} resourceId - ID of the resource
     * @param {number} amount - Amount to add
     */
    addResourceQuantity(resourceId, amount) {
        const resource = this.guildService.getResourceById(resourceId);
        if (resource) {
            resource.quantity += amount;
            this.guildService.updateResource(resourceId, resource);
            this.guildUI.renderResourceList();
            return true;
        }
        return false;
    }

    /**
     * Remove quantity from a resource
     * @param {string} resourceId - ID of the resource
     * @param {number} amount - Amount to remove
     */
    removeResourceQuantity(resourceId, amount) {
        const resource = this.guildService.getResourceById(resourceId);
        if (resource && resource.quantity >= amount) {
            resource.quantity -= amount;
            this.guildService.updateResource(resourceId, resource);
            this.guildUI.renderResourceList();
            return true;
        }
        return false;
    }

    // Getters for UI
    get guildSection() {
        return this.guildUI.guildSection;
    }

    // Delegate to service for direct access if needed
    getActivityById(id) {
        return this.guildService.getActivityById(id);
    }

    getResourceById(id) {
        return this.guildService.getResourceById(id);
    }

    getAllActivities() {
        return this.guildService.getAllActivities();
    }

    getAllResources() {
        return this.guildService.getAllResources();
    }
}
