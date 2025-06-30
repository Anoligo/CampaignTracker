import { ActivityList, ResourceList, ActivityForm, ResourceForm } from './components/index.js';
import { GuildActivityType, GuildResourceType } from '../enums/index.js';

/**
 * Initialize the guild section
 * This is the entry point for the guild module
 * @returns {Promise<void>}
 */
export async function initializeGuildSection() {
    // Helper function to initialize the guild UI after DOM is ready
    const initGuildUI = async () => {
        try {
            console.log('Initializing guild section...');
            
            // Check if the guild container exists (try both 'guild-logs' and 'guild' for backward compatibility)
            const container = document.getElementById('guild-logs') || document.getElementById('guild');
            if (!container) {
                console.error('Guild container not found');
                return;
            }
            
            // Show loading state
            container.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-2">Loading guild data...</span>
                </div>
            `;
            
            // Ensure window.app and app.state exist
            if (!window.app) window.app = {};
            if (!window.app.state) window.app.state = {};
            
            // Create a simple data manager with saveData method
            const dataManager = {
                appState: window.app.state,
                saveData: window.app.state._saveState ? window.app.state._saveState.bind(window.app.state) : () => {}
            };
            
            const { GuildManager } = await import('../guild-manager.js');
            
            try {
                if (!window.app.guildManager) {
                    console.log('Initializing guild manager...');
                    window.app.guildManager = new GuildManager(dataManager);
                    console.log('Guild manager initialized');
                } else {
                    console.log('Using existing guild manager instance');
                }
                
                // Initialize the GuildUI with the container
                console.log('Initializing GuildUI...');
                const guildUI = new GuildUI(window.app.guildManager, container);
                console.log('GuildUI initialized successfully');
                
                // Store the guildUI instance for future reference
                window.app.guildUI = guildUI;
                
                // Clear the loading state and initialize the UI
                container.innerHTML = '';
                container.classList.add('section');
                
                // Initialize the UI
                await guildUI.initializeUI();
                
                console.log('Guild section initialized successfully');
            } catch (error) {
                console.error('Error initializing guild section:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <h5>Failed to initialize guild section</h5>
                        <p class="mb-1">${errorMessage}</p>
                        ${error.stack ? `<pre class="small mt-2 mb-0">${error.stack}</pre>` : ''}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error in initializeGuildSection:', error);
        }
    };
    
    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', initGuildUI);
    } else {
        // DOM is already loaded, initialize immediately
        initGuildUI();
    }
}

/**
 * Main Guild UI controller that orchestrates all guild-related UI components
 */
export class GuildUI {
    /**
     * Show an error message as a toast or alert
     * @param {string} message - Error message to display
     * @param {string} [type='danger'] - Toast type (danger, success, etc.)
     */
    showError(message, type = 'danger') {
        // Arcane-terminal style: dark background, gold/yellow accent for important cues
        // Accessible: aria-live, dismissible, high contrast
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '1100';
        toast.style.background = 'var(--bg-dark, #1a1a1a)';
        toast.style.color = 'var(--accent, #ffd966)';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        document.body.appendChild(toast);
        if (window.bootstrap && window.bootstrap.Toast) {
            const bsToast = new window.bootstrap.Toast(toast, { autohide: true, delay: 5000 });
            bsToast.show();
            toast.addEventListener('hidden.bs.toast', () => toast.remove());
        } else {
            // Fallback: remove after 5s
            setTimeout(() => toast.remove(), 5000);
        }
    }

    /**
     * Stub for modal initialization
     */
    initModals() {
        // If you have modal logic, initialize it here. Otherwise, this prevents runtime errors.
    }
    /**
     * Create a new GuildUI instance
     * @param {Object} guildManager - The guild manager instance
     * @param {HTMLElement} container - The container element for the guild UI
     */
    constructor(guildManager, container = null) {
        this.guildManager = guildManager;
        this.container = container || document.getElementById('guild-logs') || document.getElementById('guild');
        this.initialized = false;
        
        if (!this.container) {
            console.error('Guild container element not found in the DOM');
            return;
        }
        
        // Add section class if not present
        this.container.classList.add('section');
        
        // Initialize UI
        this.initializeUI();
    }
    
    /**
     * Initialize the guild UI
     */
    initializeUI() {
        console.log('Initializing Guild UI...');
        
        // Ensure container exists and is visible
        this.container = document.getElementById('guild-logs');
        if (!this.container) {
            console.error('Guild UI container (#guild-logs) not found');
            return false;
        }
        
        // Apply base styles to container
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.height = '100%';
        this.container.style.minHeight = 'calc(100vh - 56px)'; // Account for header
        this.container.style.backgroundColor = '#1a1a1a';
        this.container.style.color = '#e0e0e0';
        this.container.style.padding = '1rem';
        this.container.style.overflow = 'hidden';
        
        // Log container info for debugging
        console.log('Guild UI container found:', this.container);
        console.log('Container dimensions:', {
            width: this.container.offsetWidth,
            height: this.container.offsetHeight,
            parent: this.container.parentElement?.tagName,
            computedStyle: window.getComputedStyle(this.container)
        });
        
        // Set up the UI structure with proper flex layout
        this.container.innerHTML = `
            <div class="guild-ui-container" style="
                display: flex;
                flex-direction: column;
                height: 100%;
                gap: 1.5rem;
            ">
                <div class="d-flex justify-content-between align-items-center">
                    <h2 style="
                        font-size: 1.75rem;
                        color: var(--accent-light);
                        margin: 0;
                        font-weight: 500;
                    ">
                        Guild Management
                    </h2>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" id="refresh-btn" title="Refresh Data">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                
                <div class="row g-3 flex-grow-1" style="
                    margin: 0;
                    min-height: 0;
                    height: 100%;
                ">
                    <!-- Activities Column -->
                    <div class="col-lg-6 d-flex flex-column" style="height: 100%;">
                        <div class="card h-100" style="
                            border: 1px solid #333;
                            background: #222;
                            display: flex;
                            flex-direction: column;
                            min-height: 0;
                        ">
                            <div class="card-header d-flex justify-content-between align-items-center" style="
                                background: #2a2a2a;
                                border-bottom: 1px solid #3a3a3a;
                                padding: 0.75rem 1.25rem;
                            ">
                                <h5 class="mb-0" style="
                                    font-size: 1.1rem;
                                    font-weight: 500;
                                    color: var(--accent-light);
                                ">
                                    <i class="fas fa-tasks me-2"></i>Activities
                                </h5>
                                <button class="btn btn-sm btn-outline-accent" id="add-activity-btn" style="
                                    border-color: var(--accent);
                                    color: var(--accent);
                                ">
                                    <i class="fas fa-plus me-1"></i> Add Activity
                                </button>
                            </div>
                            <div class="card-body p-0 d-flex flex-column" style="overflow: hidden;">
                                <div id="activities-list" style="flex: 1; overflow: hidden; min-height: 0;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Resources Column -->
                    <div class="col-lg-6 d-flex flex-column" style="height: 100%;">
                        <div class="card h-100" style="
                            border: 1px solid #333;
                            background: #222;
                            display: flex;
                            flex-direction: column;
                            min-height: 0;
                        ">
                            <div class="card-header d-flex justify-content-between align-items-center" style="
                                background: #2a2a2a;
                                border-bottom: 1px solid #3a3a3a;
                                padding: 0.75rem 1.25rem;
                            ">
                                <h5 class="mb-0" style="
                                    font-size: 1.1rem;
                                    font-weight: 500;
                                    color: var(--accent-light);
                                ">
                                    <i class="fas fa-cubes me-2"></i>Resources
                                </h5>
                                <button class="btn btn-sm btn-outline-accent" id="add-resource-btn" style="
                                    border-color: var(--accent);
                                    color: var(--accent);
                                ">
                                    <i class="fas fa-plus me-1"></i> Add Resource
                                </button>
                            </div>
                            <div class="card-body p-0 d-flex flex-column" style="overflow: hidden;">
                                <div id="resources-list" style="flex: 1; overflow: hidden; min-height: 0;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Modal for forms -->
                <div class="modal fade" id="guild-form-modal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content bg-dark text-light">
                            <div class="modal-header border-secondary">
                                <h5 class="modal-title" id="guild-form-modal-label">Loading...</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body" id="guild-form-modal-body">
                            <div class="d-flex justify-content-center my-4">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading form...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize components
        this.initializeComponents();
        this.setupEventListeners();
        
        // Load initial data
        this.refreshAll();
        
        this.initialized = true;
        console.log('Guild UI initialized successfully');
    } catch (error) {
        console.error('Error initializing Guild UI:', error);
        this.showError('Failed to initialize Guild UI');
    }

    // Initialize UI components
    initializeComponents() {
        console.log('Initializing components...');
        
        try {
            // Initialize activity list
            this.activityList = new ActivityList(this.container.querySelector('#activities-list'), {
                onActivitySelect: (activityId) => this.showActivityDetails(activityId),
                onAddActivity: () => this.showActivityForm()
            });
            
            // Initialize resource list
            this.resourceList = new ResourceList(this.container.querySelector('#resources-list'), {
                onResourceSelect: (resourceId) => this.showResourceDetails(resourceId),
                onAddResource: () => this.showResourceForm()
            });
            
            // Initialize modals
            this.initModals();
            
            // Log the entire container HTML for inspection
            console.log('Guild UI container HTML:', this.container.outerHTML);
        } catch (error) {
            console.error('Error initializing components:', error);
            this.showError('Failed to initialize UI components');
        }
    }
    
    // Set up event listeners
    setupEventListeners() {
        try {
            // Add activity button
            const addActivityBtn = this.container.querySelector('#add-activity-btn');
            if (addActivityBtn) {
                addActivityBtn.addEventListener('click', () => this.showActivityForm());
            }
            
            // Add resource button
            const addResourceBtn = this.container.querySelector('#add-resource-btn');
            if (addResourceBtn) {
                addResourceBtn.addEventListener('click', () => this.showResourceForm());
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            this.showError('Failed to set up event listeners');
        }
    }
    
    // Refresh all data and UI components
    async refreshAll() {
        try {
            console.log('Starting refreshAll...');
            await this.refreshActivities();
            console.log('Activities refreshed');
            await this.refreshResources();
            console.log('Resources refreshed');
            
            // Force a reflow/repaint to ensure the UI updates
            this.container.style.display = 'none';
            // eslint-disable-next-line no-void
            void this.container.offsetWidth; // Trigger reflow
            this.container.style.display = '';
            
            console.log('Refresh completed successfully');
        } catch (error) {
            console.error('Error in refreshAll:', error);
            this.showError('Failed to refresh data');
            throw error; // Re-throw to allow callers to handle the error
        }
    }
    
    // Refresh activities list
    async refreshActivities() {
        try {
            console.log('Fetching activities from guild service...');
            const activities = await this.guildManager.guildService.getAllActivities();
            console.log('Activities loaded:', activities);
            
            if (this.activityList) {
                console.log('Rendering activities...');
                
                // Ensure container is visible
                if (this.activityList.container) {
                    this.activityList.container.style.visibility = 'visible';
                    this.activityList.container.style.opacity = '1';
                    
                    // Render activities
                    this.activityList.render(activities);
                    
                    // Log the rendered HTML
                    console.log('Rendered activities HTML:', this.activityList.container.innerHTML);
                    
                    // Force a reflow
                    // eslint-disable-next-line no-void
                    void this.activityList.container.offsetWidth;
                    
                    // Log container dimensions after render
                    const rect = this.activityList.container.getBoundingClientRect();
                    console.log('ActivityList container dimensions after render:', {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        computedStyles: window.getComputedStyle(this.activityList.container)
                    });
                } else {
                    console.error('ActivityList container not found');
                }
            } else {
                console.error('ActivityList not initialized');
            }
        } catch (error) {
            console.error('Error refreshing activities:', error);
            this.showError('Failed to refresh activities');
        }
    }

    // Refresh resources list
    async refreshResources() {
        try {
            console.log('Fetching resources from guild service...');
            const resources = await this.guildManager.guildService.getAllResources();
            console.log('Resources loaded:', resources);
            
            if (this.resourceList && this.resourceList.container) {
                console.log('Rendering resource list with', resources.length, 'resources');
                
                // Ensure container is visible
                this.resourceList.container.style.visibility = 'visible';
                this.resourceList.container.style.opacity = '1';
                
                // Render resources
                this.resourceList.render(resources);
                
                // Log the rendered HTML
                console.log('Rendered resources HTML:', this.resourceList.container.innerHTML);
                
                // Force a reflow
                // eslint-disable-next-line no-void
                void this.resourceList.container.offsetWidth;
                
                // Log container dimensions after render
                const rect = this.resourceList.container.getBoundingClientRect();
                console.log('ResourceList container dimensions after render:', {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    computedStyles: window.getComputedStyle(this.resourceList.container)
                });
            } else {
                console.error('ResourceList not initialized or container not found');
            }
        } catch (error) {
            console.error('Error refreshing resources:', error);
    } 
}

// Set up event listeners
setupEventListeners() {
    try {
        // Add activity button
        const addActivityBtn = this.container.querySelector('#add-activity-btn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => this.showActivityForm());
        }

        // Add resource button
        const addResourceBtn = this.container.querySelector('#add-resource-btn');
        if (addResourceBtn) {
            addResourceBtn.addEventListener('click', () => this.showResourceForm());
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
        this.showError('Failed to set up event listeners');
    }
}

// Refresh all data and UI components
async refreshAll() {
    try {
        console.log('Starting refreshAll...');
        await this.refreshActivities();
        console.log('Activities refreshed');
        await this.refreshResources();
        console.log('Resources refreshed');

        // Force a reflow/repaint to ensure the UI updates
        this.container.style.display = 'none';
        // eslint-disable-next-line no-void
        void this.container.offsetWidth; // Trigger reflow
        this.container.style.display = '';

        console.log('Refresh completed successfully');
    } catch (error) {
        console.error('Error in refreshAll:', error);
        this.showError('Failed to refresh data');
        throw error; // Re-throw to allow callers to handle the error
    }
}

// Refresh activities list
async refreshActivities() {
    try {
        console.log('Fetching activities from guild service...');
        const activities = await this.guildManager.guildService.getAllActivities();
        console.log('Activities loaded:', activities);

        if (this.activityList) {
            console.log('Rendering activities...');
            this.activityList.render(activities);
        } else {
            console.error('ActivityList not initialized');
        }
    } catch (error) {
        console.error('Error refreshing activities:', error);
        this.showError('Failed to refresh activities');
    }
}

// Refresh resources list
async refreshResources() {
    try {
        console.log('Fetching resources from guild service...');
        const resources = await this.guildManager.guildService.getAllResources();
        console.log('Resources loaded:', resources);

        if (this.resourceList) {
            console.log('Rendering resources...');
            this.resourceList.render(resources);
        } else {
            console.error('ResourceList not initialized');
        }
    } catch (error) {
        console.error('Error refreshing resources:', error);
        this.showError('Failed to refresh resources');
    }
}

// Show activity details in a modal
async showActivityDetails(activityId) {
    try {
        const activity = await this.guildManager.guildService.getActivityById(activityId);
        if (!activity) throw new Error('Activity not found');
        // Delegate modal rendering to ActivityForm or a dedicated modal component
        this.activityForm.open(activity);
    } catch (error) {
        this.showError('Failed to load activity details');
    }
}

// Show resource details in a modal
async showResourceDetails(resourceId) {
    try {
        const resource = await this.guildManager.guildService.getResourceById(resourceId);
        if (!resource) throw new Error('Resource not found');
        // Delegate modal rendering to ResourceForm or a dedicated modal component
        this.resourceForm.open(resource);
    } catch (error) {
        this.showError('Failed to load resource details');
    }
}

// Show activity form in a modal
showActivityForm(activityId = null) {
    this.activityForm.open(activityId);
}

// Show resource form in a modal
showResourceForm(resourceId = null) {
    this.resourceForm.open(resourceId);
}

}
