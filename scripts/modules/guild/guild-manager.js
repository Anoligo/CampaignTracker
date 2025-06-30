import { GuildService } from './services/guild-service.js';
import { GuildUI } from './ui/GuildUI.js';

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
        }
        
        // Add some sample data if the arrays are empty
        if (!this.dataManager.appState.guildLogs.activities || this.dataManager.appState.guildLogs.activities.length === 0) {
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
        
        if (!this.dataManager.appState.guildLogs.resources || this.dataManager.appState.guildLogs.resources.length === 0) {
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
        
        // Persist the updated state
        if (this.dataManager.saveData) {
            this.dataManager.saveData();
        } else if (this.dataManager.appState?._saveState) {
            this.dataManager.appState._saveState();
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
        // Try both 'guild-logs' and 'guild' for backward compatibility
        const guildSection = document.getElementById('guild-logs') || document.getElementById('guild');
        if (!guildSection) {
            console.error('Guild section not found');
            return;
        }
        
        console.log('Initializing guild UI with existing template');
        
        // Check if we need to initialize the template (for backward compatibility)
        if (guildSection.children.length === 0) {
            console.log('No template content found, initializing basic structure');
            guildSection.innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <h2 class="text-accent mb-4">Guild Management</h2>
                            
                            <!-- Activity Log Section -->
                            <div class="card mb-4">
                                <div class="card-header bg-card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h3 class="h5 mb-0">Guild Activities</h3>
                                        <button class="btn btn-primary btn-sm new-activity-btn">
                                            <i class="fas fa-plus me-1"></i> New Activity
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="activity-list">
                                        <div class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                            <p class="mt-2 text-muted">Loading activities...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Resources Section -->
                            <div class="card">
                                <div class="card-header bg-card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h3 class="h5 mb-0">Guild Resources</h3>
                                        <button class="btn btn-primary btn-sm new-resource-btn">
                                            <i class="fas fa-plus me-1"></i> New Resource
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div class="resource-list">
                                        <div class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                            <p class="mt-2 text-muted">Loading resources...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
        
        // Initialize the guild UI
        if (this.guildUI) {
            await this.guildUI.initialize();
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadInitialData();
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
