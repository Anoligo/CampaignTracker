import { GuildActivityType, GuildResourceType } from '../enums/guild-enums.js';

// Initialize the guild section
export async function initializeGuildSection() {
    try {
        console.log('Initializing guild section...');
        
        // Check if the guild container exists
        const container = document.getElementById('guild');
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
        
        // Import the data manager and guild manager
        const { dataManager } = await import('../../../core/state/app-state.js');
        const { GuildManager } = await import('../guild-manager.js');
        
        // Initialize the guild manager if it doesn't exist
        if (!window.app) window.app = {};
        
        if (!window.app.guildManager) {
            console.log('Initializing guild manager...');
            try {
                window.app.guildManager = new GuildManager(dataManager);
                console.log('Guild manager initialized');
            } catch (error) {
                console.error('Failed to initialize guild manager:', error);
                container.innerHTML = `
                    <div class="alert alert-danger">
                        Failed to initialize guild manager. Please check the console for details.
                    </div>
                `;
                return;
            }
        } else {
            console.log('Using existing guild manager instance');
        }
        
        // Initialize the UI
        try {
            const guildUI = new GuildUI(window.app.guildManager);
            guildUI.initializeUI();
            console.log('Guild UI initialized');
        } catch (error) {
            console.error('Failed to initialize guild UI:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    Failed to initialize guild UI. Please check the console for details.
                </div>
            `;
            return;
        }
        
        console.log('Guild section initialized successfully');
    } catch (error) {
        console.error('Error initializing guild section:', error);
        const container = document.getElementById('guild');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    An error occurred while initializing the guild section. Please check the console for details.
                </div>
            `;
        }
    }
}

export class GuildUI {
    constructor(guildManager) {
        this.guildManager = guildManager;
        this.guildSection = document.getElementById('guild');
        this.initialized = false;
        
        // Initialize the UI
        this.initializeUI();
    }

    initializeUI() {
        if (this.initialized) {
            console.log('Guild UI already initialized');
            return;
        }
        
        console.log('Initializing Guild UI...');
        
        try {
            // Render the UI components
            this.renderActivityList();
            this.renderResourceList();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('Guild UI initialized successfully');
        } catch (error) {
            console.error('Error initializing Guild UI:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Activity event listeners
        this.guildSection.addEventListener('click', (e) => {
            if (e.target.matches('.new-activity-btn')) {
                this.showNewActivityForm();
            } else if (e.target.matches('.activity-filter')) {
                this.handleActivityTypeFilter(e.target.dataset.type);
            } else if (e.target.matches('.activity-search-btn')) {
                const searchTerm = this.guildSection.querySelector('.activity-search-input').value;
                this.handleSearch(searchTerm);
            }
        });

        // Resource event listeners
        this.guildSection.addEventListener('click', (e) => {
            if (e.target.matches('.new-resource-btn')) {
                this.showNewResourceForm();
            } else if (e.target.matches('.resource-filter')) {
                this.handleResourceTypeFilter(e.target.dataset.type);
            } else if (e.target.matches('.resource-search-btn')) {
                const searchTerm = this.guildSection.querySelector('.resource-search-input').value;
                this.handleResourceSearch(searchTerm);
            }
        });
    }

    // Activity UI Methods
    renderActivityList(activities = this.guildManager.getAllActivities()) {
        const activityList = this.guildSection.querySelector('.activity-list');
        if (!activityList) return;

        if (!activities || activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state p-3 text-center">
                    <p>No activities found. Create your first activity to get started!</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = `
            <div class="display-grid">
                ${activities.map(activity => `
                    <div class="card mb-3" data-activity-id="${activity.id}">
                        <div class="card-body bg-card">
                            <h5 class="text-accent">${activity.name || 'Unnamed Activity'}</h5>
                            <h6 class="mb-2">${activity.type || 'General'}</h6>
                            <p class="text">${activity.description || 'No description'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-${this.getStatusBadgeClass(activity.status || 'pending')}">
                                    ${activity.status || 'Pending'}
                                </span>
                                <div>
                                    <button class="button btn-sm edit-activity-btn" 
                                            data-activity-id="${activity.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="button btn-sm delete-activity-btn" 
                                            data-activity-id="${activity.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="button view-activity-btn" 
                                            data-activity-id="${activity.id}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners to the buttons
        activityList.querySelectorAll('.view-activity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const activityId = btn.dataset.activityId;
                this.showActivityDetails(activityId);
            });
        });

        activityList.querySelectorAll('.edit-activity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const activityId = btn.dataset.activityId;
                // Implement edit functionality
                console.log('Edit activity:', activityId);
            });
        });

        activityList.querySelectorAll('.delete-activity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const activityId = btn.dataset.activityId;
                this.showDeleteConfirmationModal('activity', activityId);
            });
        });
    }

    showActivityDetails(activityId) {
        const activity = this.guildManager.guildService.getActivityById(activityId);
        if (!activity) return;

        // Show activity details in a modal or dedicated section
        const modal = this.createActivityDetailsModal(activity);
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Remove the modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    showNewActivityForm() {
        const form = document.createElement('form');
        form.id = 'new-activity-form';
        form.innerHTML = `
            <div class="mb-3">
                <label for="activity-name" class="form-label">Activity Name</label>
                <input type="text" class="form-control bg-card text" id="activity-name" required>
            </div>
            <div class="mb-3">
                <label for="activity-description" class="form-label">Description</label>
                <textarea class="form-control bg-card text" id="activity-description" rows="3" required></textarea>
            </div>
            <div class="mb-3">
                <label for="activity-type" class="form-label">Type</label>
                <select class="form-select bg-card text searchable-select" id="activity-type" required>
                    ${Object.entries(GuildActivityType).map(([key, value]) => 
                        `<option value="${value}">${key.charAt(0) + key.slice(1).toLowerCase()}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="button" id="cancel-activity-btn">Cancel</button>
                <button type="submit" class="button">Create Activity</button>
            </div>
        `;

        // Show the form in a modal or dedicated section
        this.showFormInModal('New Activity', form, (formData) => {
            this.guildManager.createNewActivity(formData);
        });
        
        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('activity-type');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    plugins: ['dropdown_input']
                });
            }
        }, 100);
        
        // Add cancel button event listener
        document.getElementById('cancel-activity-btn')?.addEventListener('click', () => {
            const modal = document.querySelector('.modal');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });
    }

    // Resource UI Methods
    renderResourceList(resources = this.guildManager.getAllResources()) {
        const resourceList = this.guildSection.querySelector('.resource-list');
        if (!resourceList) return;

        if (!resources || resources.length === 0) {
            resourceList.innerHTML = `
                <div class="empty-state p-3 text-center">
                    <p>No resources found. Add your first resource to get started!</p>
                </div>
            `;
            return;
        }

        resourceList.innerHTML = `
            <div class="display-grid">
                ${resources.map(resource => `
                    <div class="card mb-3" data-resource-id="${resource.id}">
                        <div class="card-body bg-card">
                            <h5 class="text-accent">${resource.name || 'Unnamed Resource'}</h5>
                            <h6 class="mb-2">${resource.type || 'General'}</h6>
                            <p class="text">${resource.description || 'No description'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-secondary">
                                    Quantity: ${resource.quantity || 0}
                                </span>
                                <div>
                                    <button class="button btn-sm edit-resource-btn" 
                                            data-resource-id="${resource.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="button btn-sm delete-resource-btn" 
                                            data-resource-id="${resource.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="button view-resource-btn" 
                                            data-resource-id="${resource.id}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners to the buttons
        resourceList.querySelectorAll('.view-resource-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const resourceId = btn.dataset.resourceId;
                this.showResourceDetails(resourceId);
            });
        });

        resourceList.querySelectorAll('.edit-resource-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const resourceId = btn.dataset.resourceId;
                // Implement edit functionality
                console.log('Edit resource:', resourceId);
            });
        });

        resourceList.querySelectorAll('.delete-resource-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const resourceId = btn.dataset.resourceId;
                this.showDeleteConfirmationModal('resource', resourceId);
            });
        });
    }

    showResourceDetails(resourceId) {
        const resource = this.guildManager.guildService.getResourceById(resourceId);
        if (!resource) return;

        // Show resource details in a modal or dedicated section
        const modal = this.createResourceDetailsModal(resource);
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Remove the modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    showNewResourceForm() {
        const form = document.createElement('form');
        form.id = 'new-resource-form';
        form.innerHTML = `
            <div class="mb-3">
                <label for="resource-name" class="form-label">Resource Name</label>
                <input type="text" class="form-control" id="resource-name" required>
            </div>
            <div class="mb-3">
                <label for="resource-description" class="form-label">Description</label>
                <textarea class="form-control" id="resource-description" rows="2"></textarea>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="resource-type" class="form-label">Type</label>
                    <select class="form-select" id="resource-type" required>
                        ${Object.entries(GuildResourceType).map(([key, value]) => 
                            `<option value="${value}">${key.toLowerCase()}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="resource-quantity" class="form-label">Quantity</label>
                    <input type="number" class="form-control" id="resource-quantity" min="0" value="0" required>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Add Resource</button>
        `;

        // Show the form in a modal or dedicated section
        this.showFormInModal('New Resource', form, (formData) => {
            this.guildManager.createNewResource(formData);
        });
    }

    // Helper Methods
    getStatusBadgeClass(status) {
        const statusClasses = {
            'pending': 'warning',
            'in-progress': 'primary',
            'completed': 'success',
            'failed': 'danger',
            'on-hold': 'secondary'
        };
        return statusClasses[status.toLowerCase()] || 'secondary';
    }

    showFormInModal(title, form, onSubmit) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.tabIndex = '-1';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        `;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.appendChild(form);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = this.getFormData(form);
            onSubmit(formData);
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
        });

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Remove the modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    getFormData(form) {
        const formData = {};
        const formElements = form.elements;
        
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.name) {
                if (element.type === 'number') {
                    formData[element.name] = parseInt(element.value, 10) || 0;
                } else if (element.type === 'checkbox') {
                    formData[element.name] = element.checked;
                } else {
                    formData[element.name] = element.value;
                }
            }
        }
        
        return formData;
    }

    // Event Handlers
    handleActivityTypeFilter(type) {
        const activities = this.guildManager.guildService.getAllActivities();
        const filtered = type === 'all' 
            ? activities 
            : activities.filter(activity => activity.type === type);
        this.renderActivityList(filtered);
    }

    handleSearch(query) {
        const activities = this.guildManager.guildService.getAllActivities();
        const filtered = activities.filter(activity => 
            activity.name.toLowerCase().includes(query.toLowerCase()) ||
            activity.description.toLowerCase().includes(query.toLowerCase())
        );
        this.renderActivityList(filtered);
    }

    handleResourceTypeFilter(type) {
        const resources = this.guildManager.guildService.getAllResources();
        const filtered = type === 'all' 
            ? resources 
            : resources.filter(resource => resource.type === type);
        this.renderResourceList(filtered);
    }

    handleResourceSearch(query) {
        const resources = this.guildManager.guildService.getAllResources();
        const filtered = resources.filter(resource => 
            resource.name.toLowerCase().includes(query.toLowerCase()) ||
            resource.description.toLowerCase().includes(query.toLowerCase())
        );
        this.renderResourceList(filtered);
    }
    
    /**
     * Show the form to create a new resource
     */
    showNewResourceForm() {
        const form = document.createElement('form');
        form.id = 'new-resource-form';
        form.innerHTML = `
            <div class="mb-3">
                <label for="resource-name" class="form-label">Resource Name</label>
                <input type="text" class="form-control bg-card text" id="resource-name" required>
            </div>
            <div class="mb-3">
                <label for="resource-description" class="form-label">Description</label>
                <textarea class="form-control bg-card text" id="resource-description" rows="3" required></textarea>
            </div>
            <div class="mb-3">
                <label for="resource-type" class="form-label">Type</label>
                <select class="form-select bg-card text searchable-select" id="resource-type" required>
                    ${Object.entries(GuildResourceType).map(([key, value]) => 
                        `<option value="${value}">${key.charAt(0) + key.slice(1).toLowerCase()}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="resource-quantity" class="form-label">Quantity</label>
                <input type="number" class="form-control bg-card text" id="resource-quantity" min="0" value="0" required>
            </div>
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="button" id="cancel-resource-btn">Cancel</button>
                <button type="submit" class="button">Add Resource</button>
            </div>
        `;

        // Show the form in a modal
        this.showFormInModal('New Resource', form, (formData) => {
            this.guildManager.createNewResource(formData);
        });
        
        // Initialize Tom Select for searchable dropdown
        setTimeout(() => {
            const selectElement = document.getElementById('resource-type');
            if (selectElement) {
                new TomSelect(selectElement, {
                    create: false,
                    sortField: { field: 'text', direction: 'asc' },
                    plugins: ['dropdown_input']
                });
            }
        }, 100);
        
        // Add cancel button event listener
        document.getElementById('cancel-resource-btn')?.addEventListener('click', () => {
            const modal = document.querySelector('.modal');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });
    }
    
    /**
     * Show a form in a modal dialog
     * @param {string} title - The modal title
     * @param {HTMLElement} form - The form element to show
     * @param {Function} submitCallback - Callback to execute on form submission
     */
    showFormInModal(title, form, submitCallback) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="modal-form-container">
                    </div>
                </div>
            </div>
        `;
        
        // Add the form to the modal
        document.body.appendChild(modal);
        const formContainer = modal.querySelector('#modal-form-container');
        formContainer.appendChild(form);
        
        // Initialize the Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Add form submission handler
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect form data
            const formData = {};
            for (const element of form.elements) {
                if (element.id) {
                    formData[element.id] = element.value;
                }
            }
            
            // Call the submit callback
            submitCallback(formData);
            
            // Close the modal
            modalInstance.hide();
            
            // Remove the modal from DOM after it's hidden
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        });
        
        // Remove the modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        });
    }
    
    /**
     * Get the appropriate badge class for a status
     * @param {string} status - The status value
     * @returns {string} The badge class
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'pending': 'secondary',
            'in_progress': 'primary',
            'completed': 'success',
            'failed': 'danger',
            'cancelled': 'warning'
        };
        return statusClasses[status] || 'secondary';
    }
    
    /**
     * Create a modal for activity details
     * @param {Object} activity - The activity object
     * @returns {HTMLElement} The modal element
     */
    /**
     * Show a confirmation modal for deleting an entity
     * @param {string} entityType - The type of entity to delete (activity, resource)
     * @param {string} entityId - The ID of the entity to delete
     */
    showDeleteConfirmationModal(entityType, entityId) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'deleteConfirmationModal';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">Confirm Deletion</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this ${entityType}? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="button btn-danger" id="confirmDeleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add the modal to the DOM
        document.body.appendChild(modal);
        
        // Initialize the Bootstrap modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Add event listener for the confirm button
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            if (entityType === 'activity') {
                this.guildManager.deleteActivity(entityId);
            } else if (entityType === 'resource') {
                this.guildManager.deleteResource(entityId);
            }
            
            // Hide and remove the modal
            modalInstance.hide();
            modal.addEventListener('hidden.bs.modal', () => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            });
        });
        
        // Remove the modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        });
    }
    
    createActivityDetailsModal(activity) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent">${activity.name || 'Activity Details'}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <h6 class="text-accent">Description</h6>
                            <div class="p-3 bg-card rounded border border-secondary text">
                                ${activity.description || 'No description available.'}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <h6 class="text-accent">Type</h6>
                                    <p>${activity.type || 'General'}</p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <h6 class="text-accent">Status</h6>
                                    <span class="badge bg-${this.getStatusBadgeClass(activity.status || 'pending')}">
                                        ${activity.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        ${activity.rewards && activity.rewards.length > 0 ? `
                            <div class="mb-3">
                                <h6 class="text-accent">Rewards</h6>
                                <ul class="list-group">
                                    ${activity.rewards.map(reward => `
                                        <li class="list-group-item bg-card">${reward.name}: ${reward.amount}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${activity.participants && activity.participants.length > 0 ? `
                            <div class="mb-3">
                                <h6 class="text-accent">Participants</h6>
                                <ul class="list-group">
                                    ${activity.participants.map(participant => `
                                        <li class="list-group-item bg-card">${participant.name}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="button" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="button edit-activity-btn" data-activity-id="${activity.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }
}
