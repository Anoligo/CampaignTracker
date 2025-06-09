/**
 * Guild UI Component
 * Handles the rendering and interaction for guild-related UI elements
 * Uses the BaseUI class for consistent UI patterns
 */

import { BaseUI } from '../../../components/base-ui.js';
import { createListItem, createDetailsPanel, showToast } from '../../../components/ui-components.js';
import { GuildActivityType, GuildResourceType } from '../enums/guild-enums.js';

export class GuildUI extends BaseUI {
    /**
     * Create a new GuildUI instance
     * @param {Object} guildService - Instance of GuildService
     * @param {Object} dataManager - Instance of DataManager for accessing related entities
     */
    constructor(guildService, dataManager) {
        super({
            containerId: 'guild',
            listId: 'activityList',
            detailsId: 'activityDetails',
            searchId: 'activitySearch',
            addButtonId: 'addActivityBtn',
            entityName: 'activity',
            getAll: () => guildService.getAllActivities(),
            getById: (id) => guildService.getActivityById(id),
            add: (activity) => guildService.createActivity(activity),
            update: (id, updates) => guildService.updateActivity(id, updates),
            delete: (id) => guildService.deleteActivity(id)
        });
        
        this.guildService = guildService;
        this.dataManager = dataManager;
        
        // Bind additional methods
        this.getStatusBadgeClass = this.getStatusBadgeClass.bind(this);
        this.renderResourceList = this.renderResourceList.bind(this);
        this.handleResourceSelect = this.handleResourceSelect.bind(this);
        
        // Initialize resource UI elements
        this.resourceListElement = null;
        this.resourceDetailsElement = null;
        this.currentResource = null;
    }
    
    /**
     * Initialize the UI
     */
    initialize() {
        super.init();
        
        // Set up resource UI elements
        this.resourceListElement = document.getElementById('resourceList');
        this.resourceDetailsElement = document.getElementById('resourceDetails');
        
        // Set up additional event listeners for resources
        this.setupResourceEventListeners();
    }
    
    /**
     * Set up event listeners for resource-related UI elements
     */
    setupResourceEventListeners() {
        // Add resource button
        const addResourceBtn = document.getElementById('addResourceBtn');
        if (addResourceBtn) {
            addResourceBtn.addEventListener('click', () => this.handleAddResource());
        }
        
        // Resource search input
        const resourceSearch = document.getElementById('resourceSearch');
        if (resourceSearch) {
            resourceSearch.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                this.filterResources(query);
            });
        }
    }
    
    /**
     * Render the UI
     */
    render() {
        // Render the main container if it doesn't exist
        if (!this.containerElement) {
            this.containerElement = document.getElementById(this.containerId);
            if (!this.containerElement) {
                console.error(`Container element with ID '${this.containerId}' not found`);
                return;
            }
        }
        
        // Create the UI structure if it doesn't exist
        if (this.containerElement.children.length === 0) {
            this.containerElement.innerHTML = `
                <div class="container">
                    <h2 class="text-accent mb-4">Guild Management</h2>
                    
                    <!-- Tabs -->
                    <ul class="nav nav-tabs mb-4" id="guildTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="activities-tab" data-bs-toggle="tab" data-bs-target="#activities" type="button" role="tab" aria-controls="activities" aria-selected="true">
                                <i class="fas fa-tasks me-2"></i>Activities
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="resources-tab" data-bs-toggle="tab" data-bs-target="#resources" type="button" role="tab" aria-controls="resources" aria-selected="false">
                                <i class="fas fa-box me-2"></i>Resources
                            </button>
                        </li>
                    </ul>
                    
                    <!-- Tab Content -->
                    <div class="tab-content" id="guildTabContent">
                        <!-- Activities Tab -->
                        <div class="tab-pane fade show active" id="activities" role="tabpanel" aria-labelledby="activities-tab">
                            <div class="row">
                                <!-- Activity List -->
                                <div class="col-md-4">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h4 class="mb-0">Activities</h4>
                                        <button id="addActivityBtn" class="btn btn-primary">
                                            <i class="fas fa-plus"></i> Add Activity
                                        </button>
                                    </div>
                                    <div class="card mb-3">
                                        <div class="card-header bg-card">
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                                <input type="text" id="activitySearch" class="form-control" placeholder="Search activities...">
                                            </div>
                                        </div>
                                        <div class="card-body p-0 bg-card">
                                            <div id="activityList" class="list-group list-group-flush" style="max-height: 600px; overflow-y: auto;">
                                                <!-- Activity list will be populated here -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Activity Details -->
                                <div class="col-md-8">
                                    <div id="activityDetails" class="card h-100 bg-card">
                                        <div class="empty-state">
                                            <i class="fas fa-tasks fa-3x mb-3"></i>
                                            <p class="empty-state-message">Select an activity to view details</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Resources Tab -->
                        <div class="tab-pane fade" id="resources" role="tabpanel" aria-labelledby="resources-tab">
                            <div class="row">
                                <!-- Resource List -->
                                <div class="col-md-4">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h4 class="mb-0">Resources</h4>
                                        <button id="addResourceBtn" class="btn btn-primary">
                                            <i class="fas fa-plus"></i> Add Resource
                                        </button>
                                    </div>
                                    <div class="card mb-3">
                                        <div class="card-header bg-card">
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                                <input type="text" id="resourceSearch" class="form-control" placeholder="Search resources...">
                                            </div>
                                        </div>
                                        <div class="card-body p-0 bg-card">
                                            <div id="resourceList" class="list-group list-group-flush" style="max-height: 600px; overflow-y: auto;">
                                                <!-- Resource list will be populated here -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Resource Details -->
                                <div class="col-md-8">
                                    <div id="resourceDetails" class="card h-100 bg-card">
                                        <div class="empty-state">
                                            <i class="fas fa-box fa-3x mb-3"></i>
                                            <p class="empty-state-message">Select a resource to view details</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Re-initialize UI elements after creating the structure
            this.listElement = document.getElementById(this.listId);
            this.detailsElement = document.getElementById(this.detailsId);
            this.searchElement = document.getElementById(this.searchId);
            this.addButtonElement = document.getElementById(this.addButtonId);
            
            this.resourceListElement = document.getElementById('resourceList');
            this.resourceDetailsElement = document.getElementById('resourceDetails');
            
            // Set up event listeners
            this.setupEventListeners();
            this.setupResourceEventListeners();
        }
        
        // Render the activity list
        this.renderList();
        
        // Render the resource list
        this.renderResourceList();
    }
    
    /**
     * Create a list item for an activity
     * @param {Object} activity - Activity to create list item for
     * @returns {HTMLElement} The created list item
     */
    createListItem(activity) {
        return createListItem({
            id: activity.id,
            title: activity.name,
            subtitle: this.formatActivityType(activity.type),
            icon: 'fas fa-tasks',
            isSelected: this.currentEntity && this.currentEntity.id === activity.id,
            badgeClass: this.getStatusBadgeClass(activity.status),
            metadata: {
                'Status': this.formatStatus(activity.status),
                'Date': activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'
            },
            onClick: (id) => this.handleSelect(id)
        });
    }
    
    /**
     * Render the details for an activity
     * @param {Object} activity - Activity to render details for
     */
    renderDetails(activity) {
        // Create sections for the details panel
        const sections = [
            {
                title: 'Description',
                content: `
                    <div class="mb-3">
                        <p>${activity.description || 'No description available.'}</p>
                    </div>
                `
            },
            {
                title: 'Details',
                content: `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Type:</strong> ${this.formatActivityType(activity.type)}</p>
                            <p><strong>Status:</strong> <span class="badge ${this.getStatusBadgeClass(activity.status)}">${this.formatStatus(activity.status)}</span></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Date:</strong> ${activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Location:</strong> ${activity.location || 'N/A'}</p>
                        </div>
                    </div>
                `
            }
        ];
        
        // Add participants section if there are participants
        if (activity.participants && activity.participants.length > 0) {
            sections.push({
                title: 'Participants',
                content: `
                    <div class="mb-3">
                        <ul class="list-group">
                            ${activity.participants.map(participant => `
                                <li class="list-group-item bg-card">${participant.name || participant}</li>
                            `).join('')}
                        </ul>
                    </div>
                `
            });
        }
        
        // Add rewards section if there are rewards
        if (activity.rewards && activity.rewards.length > 0) {
            sections.push({
                title: 'Rewards',
                content: `
                    <div class="mb-3">
                        <ul class="list-group">
                            ${activity.rewards.map(reward => `
                                <li class="list-group-item bg-card">${reward.name || reward}: ${reward.amount || ''}</li>
                            `).join('')}
                        </ul>
                    </div>
                `
            });
        }
        
        // Create the details panel
        const detailsPanel = createDetailsPanel({
            title: activity.name,
            subtitle: `<span class="badge ${this.getStatusBadgeClass(activity.status)}">${this.formatStatus(activity.status)}</span>`,
            data: activity,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEdit(activity)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDelete(activity.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(detailsPanel);
    }
    
    /**
     * Handle adding a new activity
     */
    handleAdd() {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'activity-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Activity</h5>
            </div>
            <div class="card-body bg-card">
                <form id="activity-form">
                    <div class="mb-3">
                        <label for="activity-name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="activity-name" required>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="activity-type" class="form-label">Type</label>
                            <select class="form-select" id="activity-type" required>
                                <option value="">Select Type</option>
                                ${Object.entries(GuildActivityType).map(([key, value]) => 
                                    `<option value="${value}">${this.formatActivityType(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="activity-status" class="form-label">Status</label>
                            <select class="form-select" id="activity-status" required>
                                <option value="">Select Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="activity-description" class="form-label">Description</label>
                        <textarea class="form-control" id="activity-description" rows="4"></textarea>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="activity-date" class="form-label">Date</label>
                            <input type="date" class="form-control" id="activity-date">
                        </div>
                        <div class="col-md-6">
                            <label for="activity-location" class="form-label">Location</label>
                            <input type="text" class="form-control" id="activity-location">
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-activity-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Activity
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('activity-form');
        const cancelBtn = document.getElementById('cancel-activity-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleActivityFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }
    
    /**
     * Handle editing an activity
     * @param {Object} activity - Activity to edit
     */
    handleEdit(activity) {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'activity-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Activity: ${activity.name}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="activity-form" data-activity-id="${activity.id}">
                    <div class="mb-3">
                        <label for="activity-name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="activity-name" value="${activity.name || ''}" required>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="activity-type" class="form-label">Type</label>
                            <select class="form-select" id="activity-type" required>
                                <option value="">Select Type</option>
                                ${Object.entries(GuildActivityType).map(([key, value]) => 
                                    `<option value="${value}" ${activity.type === value ? 'selected' : ''}>${this.formatActivityType(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="activity-status" class="form-label">Status</label>
                            <select class="form-select" id="activity-status" required>
                                <option value="">Select Status</option>
                                <option value="pending" ${activity.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="in_progress" ${activity.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="completed" ${activity.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="failed" ${activity.status === 'failed' ? 'selected' : ''}>Failed</option>
                                <option value="cancelled" ${activity.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="activity-description" class="form-label">Description</label>
                        <textarea class="form-control" id="activity-description" rows="4">${activity.description || ''}</textarea>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="activity-date" class="form-label">Date</label>
                            <input type="date" class="form-control" id="activity-date" value="${activity.date ? new Date(activity.date).toISOString().split('T')[0] : ''}">
                        </div>
                        <div class="col-md-6">
                            <label for="activity-location" class="form-label">Location</label>
                            <input type="text" class="form-control" id="activity-location" value="${activity.location || ''}">
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-activity-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-activity-btn">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('activity-form');
        const cancelBtn = document.getElementById('cancel-activity-btn');
        const deleteBtn = document.getElementById('delete-activity-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleActivityFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.refresh(activity.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete(activity.id);
            });
        }
    }
    
    /**
     * Handle activity form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleActivityFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const activityId = isEdit ? form.getAttribute('data-activity-id') : null;
            
            // Get form values
            const activityData = {
                name: document.getElementById('activity-name').value,
                type: document.getElementById('activity-type').value,
                status: document.getElementById('activity-status').value,
                description: document.getElementById('activity-description').value,
                date: document.getElementById('activity-date').value || new Date().toISOString().split('T')[0],
                location: document.getElementById('activity-location').value
            };
            
            let result;
            
            if (isEdit) {
                // Update existing activity
                result = this.update(activityId, activityData);
                showToast({
                    message: 'Activity updated successfully',
                    type: 'success'
                });
            } else {
                // Create new activity
                result = this.add(activityData);
                showToast({
                    message: 'Activity created successfully',
                    type: 'success'
                });
            }
            
            // Refresh the UI and select the activity
            this.refresh(isEdit ? activityId : result.id);
        } catch (error) {
            console.error('Error saving activity:', error);
            showToast({
                message: `Error saving activity: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Get the appropriate badge class for a status
     * @param {string} status - The status value
     * @returns {string} The badge class
     */
    getStatusBadgeClass(status) {
        switch (status) {
            case 'pending':
                return 'bg-warning text-dark';
            case 'in_progress':
                return 'bg-info text-dark';
            case 'completed':
                return 'bg-success';
            case 'failed':
                return 'bg-danger';
            case 'cancelled':
                return 'bg-secondary';
            default:
                return 'bg-primary';
        }
    }
    
    /**
     * Format an activity type for display
     * @param {string} type - The activity type value
     * @returns {string} The formatted type
     */
    formatActivityType(type) {
        if (!type) return 'General';
        
        // Convert snake_case to Title Case
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    /**
     * Format a status for display
     * @param {string} status - The status value
     * @returns {string} The formatted status
     */
    formatStatus(status) {
        if (!status) return 'Pending';
        
        // Convert snake_case to Title Case
        return status.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    /**
     * Render the resource list
     * @param {Array} resources - Resources to render, defaults to all resources
     */
    renderResourceList(resources = null) {
        if (!this.resourceListElement) {
            this.resourceListElement = document.getElementById('resourceList');
            if (!this.resourceListElement) return;
        }
        
        const resourcesToRender = resources || this.guildService.getAllResources();
        
        if (!resourcesToRender || resourcesToRender.length === 0) {
            this.resourceListElement.innerHTML = `
                <div class="empty-state p-3 text-center">
                    <p>No resources found. Create your first resource to get started!</p>
                </div>
            `;
            return;
        }
        
        this.resourceListElement.innerHTML = '';
        
        resourcesToRender.forEach(resource => {
            const resourceItem = this.createResourceListItem(resource);
            this.resourceListElement.appendChild(resourceItem);
        });
    }
    
    /**
     * Create a list item for a resource
     * @param {Object} resource - Resource to create list item for
     * @returns {HTMLElement} The created list item
     */
    createResourceListItem(resource) {
        return createListItem({
            id: resource.id,
            title: resource.name,
            subtitle: this.formatResourceType(resource.type),
            icon: 'fas fa-box',
            isSelected: this.currentResource && this.currentResource.id === resource.id,
            metadata: {
                'Quantity': resource.quantity || '0',
                'Value': resource.value ? `${resource.value} gp` : 'N/A'
            },
            onClick: (id) => this.handleResourceSelect(id)
        });
    }
    
    /**
     * Format a resource type for display
     * @param {string} type - The resource type value
     * @returns {string} The formatted type
     */
    formatResourceType(type) {
        if (!type) return 'General';
        
        // Convert snake_case to Title Case
        return type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    /**
     * Handle resource selection
     * @param {string} resourceId - ID of the resource to select
     */
    handleResourceSelect(resourceId) {
        try {
            const resource = this.guildService.getResourceById(resourceId);
            if (!resource) {
                console.error(`Resource with ID ${resourceId} not found`);
                return;
            }
            
            this.currentResource = resource;
            this.renderResourceDetails(resource);
            
            // Update selected state in the list
            const items = this.resourceListElement.querySelectorAll('.list-item');
            items.forEach(item => {
                if (item.getAttribute('data-id') === resourceId) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        } catch (error) {
            console.error('Error selecting resource:', error);
            showToast({
                message: `Error selecting resource: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Render the details for a resource
     * @param {Object} resource - Resource to render details for
     */
    renderResourceDetails(resource) {
        if (!this.resourceDetailsElement) {
            this.resourceDetailsElement = document.getElementById('resourceDetails');
            if (!this.resourceDetailsElement) return;
        }
        
        // Create sections for the details panel
        const sections = [
            {
                title: 'Description',
                content: `
                    <div class="mb-3">
                        <p>${resource.description || 'No description available.'}</p>
                    </div>
                `
            },
            {
                title: 'Details',
                content: `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Type:</strong> ${this.formatResourceType(resource.type)}</p>
                            <p><strong>Quantity:</strong> ${resource.quantity || '0'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Value:</strong> ${resource.value ? `${resource.value} gp` : 'N/A'}</p>
                            <p><strong>Location:</strong> ${resource.location || 'N/A'}</p>
                        </div>
                    </div>
                `
            }
        ];
        
        // Add properties section if there are properties
        if (resource.properties && resource.properties.length > 0) {
            sections.push({
                title: 'Properties',
                content: `
                    <div class="mb-3">
                        <ul class="list-group">
                            ${resource.properties.map(property => `
                                <li class="list-group-item bg-card">${property.name || property}: ${property.value || ''}</li>
                            `).join('')}
                        </ul>
                    </div>
                `
            });
        }
        
        // Create the details panel
        const detailsPanel = createDetailsPanel({
            title: resource.name,
            subtitle: this.formatResourceType(resource.type),
            data: resource,
            actions: [
                {
                    label: 'Edit',
                    icon: 'fas fa-edit',
                    type: 'primary',
                    onClick: () => this.handleEditResource(resource)
                },
                {
                    label: 'Delete',
                    icon: 'fas fa-trash',
                    type: 'danger',
                    onClick: () => this.handleDeleteResource(resource.id)
                }
            ],
            sections: sections
        });
        
        // Clear the details element and append the new details panel
        this.resourceDetailsElement.innerHTML = '';
        this.resourceDetailsElement.appendChild(detailsPanel);
    }
    
    /**
     * Handle adding a new resource
     */
    handleAddResource() {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'resource-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Add New Resource</h5>
            </div>
            <div class="card-body bg-card">
                <form id="resource-form">
                    <div class="mb-3">
                        <label for="resource-name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="resource-name" required>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="resource-type" class="form-label">Type</label>
                            <select class="form-select" id="resource-type" required>
                                <option value="">Select Type</option>
                                ${Object.entries(GuildResourceType).map(([key, value]) => 
                                    `<option value="${value}">${this.formatResourceType(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="resource-quantity" class="form-label">Quantity</label>
                            <input type="number" class="form-control" id="resource-quantity" min="0" value="0">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="resource-description" class="form-label">Description</label>
                        <textarea class="form-control" id="resource-description" rows="4"></textarea>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="resource-value" class="form-label">Value (gp)</label>
                            <input type="number" class="form-control" id="resource-value" min="0" step="0.1" value="0">
                        </div>
                        <div class="col-md-6">
                            <label for="resource-location" class="form-label">Location</label>
                            <input type="text" class="form-control" id="resource-location">
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-resource-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i> Save Resource
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        if (!this.resourceDetailsElement) {
            this.resourceDetailsElement = document.getElementById('resourceDetails');
            if (!this.resourceDetailsElement) return;
        }
        
        this.resourceDetailsElement.innerHTML = '';
        this.resourceDetailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('resource-form');
        const cancelBtn = document.getElementById('cancel-resource-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleResourceFormSubmit(e, false));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                // Clear the form and show empty state
                this.resourceDetailsElement.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box fa-3x mb-3"></i>
                        <p class="empty-state-message">Select a resource to view details</p>
                    </div>
                `;
            });
        }
    }
    
    /**
     * Handle editing a resource
     * @param {Object} resource - Resource to edit
     */
    handleEditResource(resource) {
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.id = 'resource-form-container';
        formContainer.className = 'card';
        
        // Create form content
        formContainer.innerHTML = `
            <div class="card-header bg-card">
                <h5 class="card-title mb-0">Edit Resource: ${resource.name}</h5>
            </div>
            <div class="card-body bg-card">
                <form id="resource-form" data-resource-id="${resource.id}">
                    <div class="mb-3">
                        <label for="resource-name" class="form-label">Name</label>
                        <input type="text" class="form-control" id="resource-name" value="${resource.name || ''}" required>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="resource-type" class="form-label">Type</label>
                            <select class="form-select" id="resource-type" required>
                                <option value="">Select Type</option>
                                ${Object.entries(GuildResourceType).map(([key, value]) => 
                                    `<option value="${value}" ${resource.type === value ? 'selected' : ''}>${this.formatResourceType(value)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="resource-quantity" class="form-label">Quantity</label>
                            <input type="number" class="form-control" id="resource-quantity" min="0" value="${resource.quantity || 0}">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="resource-description" class="form-label">Description</label>
                        <textarea class="form-control" id="resource-description" rows="4">${resource.description || ''}</textarea>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="resource-value" class="form-label">Value (gp)</label>
                            <input type="number" class="form-control" id="resource-value" min="0" step="0.1" value="${resource.value || 0}">
                        </div>
                        <div class="col-md-6">
                            <label for="resource-location" class="form-label">Location</label>
                            <input type="text" class="form-control" id="resource-location" value="${resource.location || ''}">
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" id="cancel-resource-btn">
                            <i class="fas fa-times me-1"></i> Cancel
                        </button>
                        <div>
                            <button type="button" class="btn btn-danger me-2" id="delete-resource-btn">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to details panel
        if (!this.resourceDetailsElement) {
            this.resourceDetailsElement = document.getElementById('resourceDetails');
            if (!this.resourceDetailsElement) return;
        }
        
        this.resourceDetailsElement.innerHTML = '';
        this.resourceDetailsElement.appendChild(formContainer);
        
        // Set up event listeners
        const form = document.getElementById('resource-form');
        const cancelBtn = document.getElementById('cancel-resource-btn');
        const deleteBtn = document.getElementById('delete-resource-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleResourceFormSubmit(e, true));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.currentResource = resource;
                this.renderResourceDetails(resource);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteResource(resource.id);
            });
        }
    }
    
    /**
     * Handle deleting a resource
     * @param {string} resourceId - ID of the resource to delete
     */
    handleDeleteResource(resourceId) {
        // Create confirmation modal
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal fade';
        confirmModal.id = 'deleteResourceConfirmModal';
        confirmModal.setAttribute('tabindex', '-1');
        confirmModal.setAttribute('aria-labelledby', 'deleteResourceConfirmModalLabel');
        confirmModal.setAttribute('aria-hidden', 'true');
        
        confirmModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-card">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-accent" id="deleteResourceConfirmModalLabel">Confirm Deletion</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this resource? This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteResourceBtn">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the document
        document.body.appendChild(confirmModal);
        
        // Initialize the Bootstrap modal
        const modal = new bootstrap.Modal(confirmModal);
        modal.show();
        
        // Set up event listener for the confirm button
        const confirmBtn = document.getElementById('confirmDeleteResourceBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                try {
                    // Delete the resource
                    const result = this.guildService.deleteResource(resourceId);
                    
                    if (result) {
                        // Show success message
                        showToast({
                            message: 'Resource deleted successfully',
                            type: 'success'
                        });
                        
                        // Clear the current resource
                        this.currentResource = null;
                        
                        // Refresh the resource list
                        this.renderResourceList();
                        
                        // Show empty state in details panel
                        if (this.resourceDetailsElement) {
                            this.resourceDetailsElement.innerHTML = `
                                <div class="empty-state">
                                    <i class="fas fa-box fa-3x mb-3"></i>
                                    <p class="empty-state-message">Select a resource to view details</p>
                                </div>
                            `;
                        }
                    } else {
                        showToast({
                            message: 'Error deleting resource',
                            type: 'error'
                        });
                    }
                } catch (error) {
                    console.error('Error deleting resource:', error);
                    showToast({
                        message: `Error deleting resource: ${error.message}`,
                        type: 'error'
                    });
                } finally {
                    // Close and remove the modal
                    modal.hide();
                    confirmModal.addEventListener('hidden.bs.modal', () => {
                        if (confirmModal.parentNode) {
                            confirmModal.parentNode.removeChild(confirmModal);
                        }
                    });
                }
            });
        }
        
        // Clean up the modal when it's closed
        confirmModal.addEventListener('hidden.bs.modal', () => {
            if (confirmModal.parentNode) {
                confirmModal.parentNode.removeChild(confirmModal);
            }
        });
    }
    
    /**
     * Handle resource form submission
     * @param {Event} e - Form submit event
     * @param {boolean} isEdit - Whether this is an edit operation
     */
    handleResourceFormSubmit(e, isEdit = false) {
        e.preventDefault();
        
        try {
            const form = e.target;
            const resourceId = isEdit ? form.getAttribute('data-resource-id') : null;
            
            // Get form values
            const resourceData = {
                name: document.getElementById('resource-name').value,
                type: document.getElementById('resource-type').value,
                quantity: parseInt(document.getElementById('resource-quantity').value) || 0,
                description: document.getElementById('resource-description').value,
                value: parseFloat(document.getElementById('resource-value').value) || 0,
                location: document.getElementById('resource-location').value
            };
            
            let result;
            
            if (isEdit) {
                // Update existing resource
                result = this.guildService.updateResource(resourceId, resourceData);
                showToast({
                    message: 'Resource updated successfully',
                    type: 'success'
                });
            } else {
                // Create new resource
                result = this.guildService.createResource(resourceData);
                showToast({
                    message: 'Resource created successfully',
                    type: 'success'
                });
            }
            
            // Update the current resource
            this.currentResource = result;
            
            // Refresh the resource list
            this.renderResourceList();
            
            // Show the resource details
            this.renderResourceDetails(result);
        } catch (error) {
            console.error('Error saving resource:', error);
            showToast({
                message: `Error saving resource: ${error.message}`,
                type: 'error'
            });
        }
    }
    
    /**
     * Filter resources based on a search query
     * @param {string} query - Search query
     */
    filterResources(query) {
        if (!query) {
            this.renderResourceList();
            return;
        }
        
        const resources = this.guildService.getAllResources();
        const filteredResources = resources.filter(resource => {
            const searchableText = `${resource.name} ${resource.description} ${resource.type}`.toLowerCase();
            return searchableText.includes(query.toLowerCase());
        });
        
        this.renderResourceList(filteredResources);
    }
}
