import { locationFormFields } from '../constants/location-constants.js';
import { validateLocation, escapeHtml } from '../utils/location-utils.js';

/**
 * Location Form Component
 * Handles the rendering and validation of the location form
 */
export class LocationForm {
    /**
     * Create a new LocationForm instance
     * @param {HTMLElement} container - The container element for the form
     * @param {Object} options - Configuration options
     * @param {Function} options.onSubmit - Callback when the form is submitted
     * @param {Function} options.onCancel - Callback when the form is cancelled
     */
    constructor(container, { onSubmit, onCancel }) {
        this.container = container;
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
        this.location = null;
        
        // Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }
    
    /**
     * Render the form
     * @param {Object} location - The location data to edit (or null for new location)
     */
    render(location = null) {
        this.location = location || {};
        
        // Create form element
        const form = document.createElement('form');
        form.className = 'location-form';
        form.noValidate = true;
        
        // Add form fields
        locationFormFields.forEach(field => {
            const fieldGroup = this.createFormField(field);
            if (fieldGroup) {
                form.appendChild(fieldGroup);
            }
        });
        
        // Add form actions
        const actions = document.createElement('div');
        actions.className = 'form-actions';
        
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'btn btn-primary';
        submitButton.textContent = location ? 'Update Location' : 'Add Location';
        
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', this.handleCancel);
        
        actions.appendChild(cancelButton);
        actions.appendChild(submitButton);
        form.appendChild(actions);
        
        // Add event listeners
        form.addEventListener('submit', this.handleSubmit);
        
        // Clear and update container
        this.container.innerHTML = '';
        this.container.appendChild(form);
        
        // Focus first input
        const firstInput = this.container.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    /**
     * Create a form field element
     * @param {Object} field - Field configuration
     * @returns {HTMLElement} The form field element
     */
    createFormField(field) {
        const { id, label, type, required, placeholder, options } = field;
        const value = this.location ? escapeHtml(String(this.location[id] || '')) : '';
        
        const group = document.createElement('div');
        group.className = 'form-group';
        
        const labelEl = document.createElement('label');
        labelEl.htmlFor = `location-${id}`;
        labelEl.textContent = label;
        if (required) {
            labelEl.innerHTML += ' <span class="required">*</span>';
        }
        
        group.appendChild(labelEl);
        
        let input;
        
        switch (type) {
            case 'select':
                input = document.createElement('select');
                input.id = `location-${id}`;
                input.name = id;
                input.required = required;
                
                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = `Select ${label.toLowerCase()}`;
                defaultOption.disabled = true;
                defaultOption.selected = !value;
                input.appendChild(defaultOption);
                
                // Add options
                if (options && Array.isArray(options)) {
                    options.forEach(option => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option.value;
                        optionEl.textContent = option.label;
                        optionEl.selected = option.value === value;
                        input.appendChild(optionEl);
                    });
                }
                break;
                
            case 'textarea':
                input = document.createElement('textarea');
                input.id = `location-${id}`;
                input.name = id;
                input.placeholder = placeholder || '';
                input.required = required;
                input.value = value;
                break;
                
            default: // text, number, etc.
                input = document.createElement('input');
                input.type = type || 'text';
                input.id = `location-${id}`;
                input.name = id;
                input.placeholder = placeholder || '';
                input.required = required;
                input.value = value;
        }
        
        input.className = 'form-control';
        group.appendChild(input);
        
        return group;
    }
    
    /**
     * Handle form submission
     * @param {Event} event - The form submit event
     */
    handleSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const location = {};

        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
            if (key === 'x' || key === 'y') {
                const num = parseFloat(value);
                if (!isNaN(num)) location[key] = num;
            } else if (key === 'tags') {
                location[key] = value.split(',').map(t => t.trim()).filter(t => t);
            } else {
                location[key] = value.trim();
            }
        }
        
        // Validate location
        const { isValid, errors } = validateLocation(location);
        
        if (!isValid) {
            // Show validation errors
            this.showErrors(errors);
            return;
        }
        
        // Call onSubmit callback with location data
        if (typeof this.onSubmit === 'function') {
            // Preserve ID if editing
            if (this.location && this.location.id) {
                location.id = this.location.id;
            }
            
            this.onSubmit(location);
        }
    }
    
    /**
     * Handle cancel button click
     */
    handleCancel() {
        if (typeof this.onCancel === 'function') {
            this.onCancel();
        }
    }
    
    /**
     * Show validation errors
     * @param {Array<string>} errors - Array of error messages
     */
    showErrors(errors) {
        // Remove any existing error messages
        const existingErrors = this.container.querySelectorAll('.error-message');
        existingErrors.forEach(el => el.remove());
        
        if (!errors || errors.length === 0) return;
        
        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'alert alert-danger';
        errorContainer.role = 'alert';
        
        const errorList = document.createElement('ul');
        errorList.className = 'mb-0';
        
        // Add error messages
        errors.forEach(error => {
            const errorItem = document.createElement('li');
            errorItem.textContent = error;
            errorList.appendChild(errorItem);
        });
        
        errorContainer.appendChild(errorList);
        
        // Insert error container at the top of the form
        const form = this.container.querySelector('form');
        if (form) {
            form.insertBefore(errorContainer, form.firstChild);
        }
    }
    
    /**
     * Reset the form
     */
    reset() {
        const form = this.container.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

export default LocationForm;
