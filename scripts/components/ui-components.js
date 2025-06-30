/**
 * Shared UI Components
 * Provides reusable UI components for consistent interface across all modules
 */

/**
 * Creates a standard list item/card for entity lists (quests, characters, etc.)
 * @param {Object} options - Configuration options
 * @param {string} options.id - Entity ID
 * @param {string} options.title - Entity title/name
 * @param {string} options.subtitle - Optional subtitle (class, status, etc.)
 * @param {string} options.icon - Optional icon class (Font Awesome)
 * @param {boolean} options.isSelected - Whether this item is currently selected
 * @param {Object} options.metadata - Optional key-value pairs for additional metadata
 * @param {Function} options.onClick - Click handler function
 * @returns {HTMLElement} The created list item element
 */
export function createListItem(options) {
    const { id, title, subtitle, icon, isSelected, metadata = {}, onClick } = options;
    
    const listItem = document.createElement('div');
    listItem.className = `entity-card ${isSelected ? 'entity-card-selected' : ''}`;
    listItem.dataset.entityId = id;
    
    // Build the inner HTML with consistent structure
    listItem.innerHTML = `
        <div class="d-flex align-items-center p-2">
            ${icon ? `<div class="entity-icon me-2"><i class="${icon}"></i></div>` : ''}
            <div class="entity-info flex-grow-1">
                <h6 class="entity-title mb-1">${title}</h6>
                ${subtitle ? `<div class="entity-subtitle text-meta">${subtitle}</div>` : ''}
                ${Object.entries(metadata).map(([key, value]) => 
                    `<div class="entity-meta text-meta"><small>${key}: ${value}</small></div>`
                ).join('')}
            </div>
        </div>
    `;
    
    // Add click handler
    if (onClick) {
        listItem.addEventListener('click', (e) => onClick(id, e));
    }
    
    return listItem;
}

/**
 * Creates a standard details panel for showing entity details
 * @param {Object} options - Configuration options
 * @param {string} options.title - Entity title/name
 * @param {Object} options.data - Entity data object
 * @param {Array} options.actions - Action buttons configuration
 * @param {Array} options.sections - Content sections configuration
 * @returns {HTMLElement} The created details panel element
 */
export function createDetailsPanel(options) {
    const { title, data, actions = [], sections = [] } = options;
    
    const detailsPanel = document.createElement('div');
    detailsPanel.className = 'entity-details card h-100';
    
    // Create header with title and action buttons
    const header = document.createElement('div');
    header.className = 'card-header d-flex justify-content-between align-items-center';
    
    const titleEl = document.createElement('h5');
    titleEl.className = 'mb-0';
    titleEl.textContent = title;
    
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'entity-actions';
    
    // Add action buttons
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = `btn btn-${action.type || 'secondary'} btn-sm ms-2`;
        button.innerHTML = action.icon ? `<i class="${action.icon} me-1"></i>${action.label}` : action.label;
        
        if (action.onClick) {
            button.addEventListener('click', () => action.onClick(data));
        }
        
        actionsContainer.appendChild(button);
    });
    
    header.appendChild(titleEl);
    header.appendChild(actionsContainer);
    detailsPanel.appendChild(header);
    
    // Create body with sections
    const body = document.createElement('div');
    body.className = 'card-body';
    
    sections.forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'entity-section mb-4';
        
        if (section.title) {
            const sectionTitle = document.createElement('h6');
            sectionTitle.className = 'section-title mb-2';
            sectionTitle.textContent = section.title;
            sectionEl.appendChild(sectionTitle);
        }
        
        if (section.content) {
            const contentEl = document.createElement('div');
            contentEl.className = 'section-content';
            
            if (typeof section.content === 'string') {
                contentEl.innerHTML = section.content;
            } else if (section.content instanceof HTMLElement) {
                contentEl.appendChild(section.content);
            }
            
            sectionEl.appendChild(contentEl);
        }
        
        body.appendChild(sectionEl);
    });
    
    detailsPanel.appendChild(body);
    return detailsPanel;
}

/**
 * Creates a standard search/filter bar
 * @param {Object} options - Configuration options
 * @param {string} options.placeholder - Placeholder text
 * @param {Function} options.onSearch - Search handler function
 * @param {Array} options.filters - Optional filter options
 * @returns {HTMLElement} The created search bar element
 */
export function createSearchBar(options) {
    const { placeholder, onSearch, filters = [] } = options;
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'd-flex align-items-center mb-3';
    
    // Create search input
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    
    const searchIcon = document.createElement('span');
    searchIcon.className = 'input-group-text';
    searchIcon.innerHTML = '<i class="fas fa-search"></i>';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control search-input';
    searchInput.placeholder = placeholder || 'Search...';
    
    if (onSearch) {
        searchInput.addEventListener('input', (e) => onSearch(e.target.value));
    }
    
    inputGroup.appendChild(searchIcon);
    inputGroup.appendChild(searchInput);
    searchContainer.appendChild(inputGroup);
    
    // Add filters if provided
    if (filters.length > 0) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'ms-2';
        
        filters.forEach(filter => {
            const filterButton = document.createElement('button');
            filterButton.className = 'btn btn-outline-secondary btn-sm ms-1';
            filterButton.textContent = filter.label;
            
            if (filter.onClick) {
                filterButton.addEventListener('click', () => filter.onClick());
            }
            
            filterContainer.appendChild(filterButton);
        });
        
        searchContainer.appendChild(filterContainer);
    }
    
    return searchContainer;
}

/**
 * Creates a confirmation modal
 * @param {Object} options - Configuration options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message
 * @param {string} options.confirmText - Text for confirm button
 * @param {string} options.cancelText - Text for cancel button
 * @param {Function} options.onConfirm - Confirm handler function
 * @param {Function} options.onCancel - Cancel handler function
 * @returns {HTMLElement} The created modal element
 */
export function createConfirmationModal(options) {
    const { title, message, confirmText, cancelText, onConfirm, onCancel } = options;
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal fade';
    modalContainer.id = 'confirmationModal';
    modalContainer.tabIndex = '-1';
    modalContainer.setAttribute('aria-hidden', 'true');
    
    // Create modal content
    modalContainer.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title || 'Confirm Action'}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>${message || 'Are you sure you want to proceed?'}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText || 'Cancel'}</button>
                    <button type="button" class="btn btn-danger" id="confirmBtn">${confirmText || 'Confirm'}</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to document body
    document.body.appendChild(modalContainer);
    
    // Create Bootstrap modal instance
    const modal = new bootstrap.Modal(modalContainer);
    
    // Set up event handlers
    const confirmBtn = modalContainer.querySelector('#confirmBtn');
    if (confirmBtn && onConfirm) {
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            modal.hide();
        });
    }
    
    const cancelBtn = modalContainer.querySelector('.btn-secondary');
    if (cancelBtn && onCancel) {
        cancelBtn.addEventListener('click', onCancel);
    }
    
    // Set up modal hidden event to remove from DOM
    modalContainer.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modalContainer);
    });
    
    // Show the modal
    modal.show();
    
    return modalContainer;
}

/**
 * Creates a toast notification
 * @param {Object} options - Configuration options
 * @param {string} options.message - Toast message
 * @param {string} options.type - Toast type (success, error, warning, info)
 * @param {number} options.duration - Duration in milliseconds
 */
export function showToast(options, type, duration) {
    // Support legacy signature showToast(message, type, duration)
    if (typeof options === 'string') {
        options = { message: options, type, duration };
    }

    const { message, type: toastType = 'info', duration: toastDuration = 5000 } = options || {};

    if (!message) return;
    
    // Create or get toast container
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${toastType} border-0`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Add content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, toastDuration);
}
