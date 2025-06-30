import { GuildActivityType } from '../../enums/index.js';
import { FormComponent } from './base/FormComponent.js';

/**
 * Form component for creating/editing activities
 */
export class ActivityForm extends FormComponent {
    /**
     * Create a new ActivityForm instance
     * @param {HTMLElement} container - The container element for the form
     * @param {Object} callbacks - Object containing callback functions
     * @param {Function} callbacks.onSubmit - Called when form is submitted
     * @param {Function} [callbacks.onCancel] - Called when cancel is clicked
     * @param {Function} [callbacks.onDelete] - Called when delete is clicked
     */
    constructor(container, { onSubmit, onCancel, onDelete }) {
        super(container, {
            title: 'New Activity',
            entityName: 'activity',
            onSubmit,
            onCancel,
            onDelete
        });
    }

    /**
     * Initialize the form with data (for edit mode)
     * @param {Object} data - Form data
     */
    init(data = {}) {
        this.title = data.id ? 'Edit Activity' : 'New Activity';
        super.init(data);
    }

    /**
     * Get the form fields HTML
     * @param {Object} data - Form data
     * @returns {string} HTML string
     */
    getFormFields(data = {}) {
        return `
            <div class="mb-3">
                <label for="activity-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="activity-name" name="name" 
                       value="${data.name || ''}" required>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="activity-type" class="form-label">Type</label>
                        <select class="form-select" id="activity-type" name="type" required>
                            ${Object.entries(GuildActivityType).map(([key, value]) => `
                                <option value="${value}" ${data.type === value ? 'selected' : ''}>
                                    ${this.formatActivityType(value)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="activity-status" class="form-label">Status</label>
                        <select class="form-select" id="activity-status" name="status" required>
                            <option value="planned" ${data.status === 'planned' ? 'selected' : ''}>Planned</option>
                            <option value="in-progress" ${data.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${data.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="failed" ${data.status === 'failed' ? 'selected' : ''}>Failed</option>
                            <option value="on-hold" ${data.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="activity-date" class="form-label">Date</label>
                <input type="date" class="form-control" id="activity-date" name="date" 
                       value="${data.date || ''}">
            </div>
            
            <div class="mb-3">
                <label for="activity-location" class="form-label">Location</label>
                <input type="text" class="form-control" id="activity-location" name="location" 
                       value="${data.location || ''}">
            </div>
            
            <div class="mb-3">
                <label for="activity-description" class="form-label">Description</label>
                <textarea class="form-control" id="activity-description" name="description" 
                          rows="4">${data.description || ''}</textarea>
            </div>
        `;
    }

    /**
     * Format activity type for display
     * @param {string} type - Activity type
     * @returns {string} Formatted type
     * @private
     */
    formatActivityType(type) {
        if (!type) return '';
        return type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}
