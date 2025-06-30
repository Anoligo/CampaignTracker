import { GuildResourceType } from '../../enums/index.js';
import { FormComponent } from './base/FormComponent.js';

/**
 * Form component for creating/editing resources
 */
export class ResourceForm extends FormComponent {
    /**
     * Create a new ResourceForm instance
     * @param {HTMLElement} container - The container element for the form
     * @param {Object} callbacks - Object containing callback functions
     * @param {Function} callbacks.onSubmit - Called when form is submitted
     * @param {Function} [callbacks.onCancel] - Called when cancel is clicked
     * @param {Function} [callbacks.onDelete] - Called when delete is clicked
     */
    constructor(container, { onSubmit, onCancel, onDelete }) {
        super(container, {
            title: 'New Resource',
            entityName: 'resource',
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
        this.title = data.id ? 'Edit Resource' : 'New Resource';
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
                <label for="resource-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="resource-name" name="name" 
                       value="${data.name || ''}" required>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="resource-type" class="form-label">Type</label>
                        <select class="form-select" id="resource-type" name="type" required>
                            ${Object.entries(GuildResourceType).map(([key, value]) => `
                                <option value="${value}" ${data.type === value ? 'selected' : ''}>
                                    ${this.formatResourceType(value)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="resource-quantity" class="form-label">Quantity</label>
                        <input type="number" class="form-control" id="resource-quantity" 
                               name="quantity" min="1" value="${data.quantity || '1'}">
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="resource-location" class="form-label">Location</label>
                <input type="text" class="form-control" id="resource-location" name="location" 
                       value="${data.location || ''}">
            </div>
            
            <div class="mb-3">
                <label for="resource-value" class="form-label">Value (in gold)</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-coins"></i></span>
                    <input type="number" class="form-control" id="resource-value" 
                           name="value" min="0" step="0.01" value="${data.value || '0'}">
                </div>
            </div>
            
            <div class="mb-3">
                <label for="resource-description" class="form-label">Description</label>
                <textarea class="form-control" id="resource-description" name="description" 
                          rows="4">${data.description || ''}</textarea>
            </div>
            
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="resource-is-important" 
                       name="isImportant" ${data.isImportant ? 'checked' : ''}>
                <label class="form-check-label" for="resource-is-important">
                    Mark as important
                </label>
            </div>
        `;
    }

    /**
     * Format resource type for display
     * @param {string} type - Resource type
     * @returns {string} Formatted type
     * @private
     */
    formatResourceType(type) {
        if (!type) return '';
        return type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}
