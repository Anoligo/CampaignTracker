import { createBadge } from '../../utils/ui-utils.js';

/**
 * Base class for form components with common functionality
 */
export class FormComponent {
    /**
     * Create a new FormComponent
     * @param {HTMLElement} container - The container element for the form
     * @param {Object} config - Configuration object
     * @param {string} config.title - Form title
     * @param {string} config.entityName - Name of the entity (e.g., 'activity', 'resource')
     * @param {Function} config.onSubmit - Called when form is submitted
     * @param {Function} [config.onCancel] - Called when cancel is clicked
     * @param {Function} [config.onDelete] - Called when delete is clicked
     */
    constructor(container, { title, entityName, onSubmit, onCancel, onDelete }) {
        this.container = container;
        this.title = title;
        this.entityName = entityName;
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
        this.onDelete = onDelete;
        this.isEditMode = false;
        this.currentId = null;
    }

    /**
     * Initialize the form with data (for edit mode)
     * @param {Object} data - Form data
     */
    init(data = {}) {
        this.isEditMode = !!data.id;
        this.currentId = data.id || null;
        this.render(data);
    }

    /**
     * Render the form
     * @param {Object} data - Initial form data
     */
    render(data = {}) {
        this.container.innerHTML = `
            <div class="card h-100">
                <div class="card-header bg-card-header d-flex justify-content-between align-items-center">
                    <h3 class="h5 mb-0">${this.title}</h3>
                    ${this.isEditMode && this.onDelete ? `
                        <button type="button" class="btn btn-sm btn-outline-danger delete-${this.entityName}-btn">
                            <i class="fas fa-trash me-1"></i> Delete
                        </button>
                    ` : ''}
                </div>
                <div class="card-body">
                    <form id="${this.entityName}-form">
                        ${this.getFormFields(data)}
                        <div class="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" class="btn btn-outline-secondary" id="cancel-${this.entityName}-btn">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                ${this.isEditMode ? 'Update' : 'Create'} ${this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    /**
     * Get the form fields HTML (to be implemented by child classes)
     * @param {Object} data - Form data
     * @returns {string} HTML string
     * @abstract
     */
    getFormFields(data) {
        throw new Error('Method getFormFields() must be implemented by child class');
    }

    /**
     * Get form data as an object
     * @returns {Object} Form data
     */
    getFormData() {
        const form = this.container.querySelector(`#${this.entityName}-form`);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * Set up event listeners
     * @private
     */
    setupEventListeners() {
        const form = this.container.querySelector(`#${this.entityName}-form`);
        const cancelBtn = this.container.querySelector(`#cancel-${this.entityName}-btn`);
        const deleteBtn = this.container.querySelector(`.delete-${this.entityName}-btn`);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = this.getFormData();
                if (this.isEditMode && this.currentId) {
                    formData.id = this.currentId;
                }
                this.onSubmit(formData);
            });
        }

        if (cancelBtn && this.onCancel) {
            cancelBtn.addEventListener('click', () => this.onCancel());
        }

        if (deleteBtn && this.onDelete) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                    this.onDelete(this.currentId);
                }
            });
        }
    }

    /**
     * Show validation errors
     * @param {Object} errors - Object with field names as keys and error messages as values
     */
    showErrors(errors) {
        // Clear previous error states
        this.container.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
            
            const feedback = el.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.remove();
            }
        });

        // Add new error states
        Object.entries(errors).forEach(([field, message]) => {
            const input = this.container.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('is-invalid');
                
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = message;
                
                input.parentNode.insertBefore(feedback, input.nextSibling);
            }
        });
    }
}
