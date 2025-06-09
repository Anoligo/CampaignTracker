/**
 * Utility functions for applying Iron Meridian styling to form elements
 */

/**
 * Apply Iron Meridian styling to all form elements in the document
 * This should be called after the DOM is loaded
 */
export function applyIronMeridianStyling() {
    // Add text class to all form labels
    document.querySelectorAll('.form-label').forEach(label => {
        label.classList.add('text');
    });
    
    // Add bg-card and text classes to all form controls
    document.querySelectorAll('.form-control, .form-select').forEach(input => {
        input.classList.add('bg-card', 'text');
    });
    
    // Style buttons appropriately
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger, .btn-success, .btn-warning, .btn-info').forEach(btn => {
        if (!btn.classList.contains('text')) {
            btn.classList.add('text');
        }
    });
    
    // Style card headers and bodies
    document.querySelectorAll('.card-header').forEach(header => {
        if (!header.classList.contains('bg-card')) {
            header.classList.add('bg-card');
        }
    });
    
    document.querySelectorAll('.card-body').forEach(body => {
        if (!body.classList.contains('bg-card')) {
            body.classList.add('bg-card');
        }
    });
    
    // Style modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        if (!content.classList.contains('bg-card')) {
            content.classList.add('bg-card');
        }
    });
    
    // Style close buttons
    document.querySelectorAll('.btn-close').forEach(btn => {
        if (!btn.classList.contains('btn-close-white')) {
            btn.classList.add('btn-close-white');
        }
    });
    
    // Style headings in cards and modals
    document.querySelectorAll('.card-header h1, .card-header h2, .card-header h3, .card-header h4, .card-header h5, .card-header h6, .modal-header h1, .modal-header h2, .modal-header h3, .modal-header h4, .modal-header h5, .modal-header h6').forEach(heading => {
        if (!heading.classList.contains('text-accent')) {
            heading.classList.add('text-accent');
        }
    });
    
    console.log('Iron Meridian styling applied to form elements');
}

/**
 * Apply Iron Meridian styling to a specific container element
 * @param {HTMLElement} container - The container element to style
 */
export function applyIronMeridianStylingToContainer(container) {
    if (!container) return;
    
    // Add text class to all form labels
    container.querySelectorAll('.form-label').forEach(label => {
        label.classList.add('text');
    });
    
    // Add bg-card and text classes to all form controls
    container.querySelectorAll('.form-control, .form-select').forEach(input => {
        input.classList.add('bg-card', 'text');
    });
    
    // Style buttons appropriately
    container.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger, .btn-success, .btn-warning, .btn-info').forEach(btn => {
        if (!btn.classList.contains('text')) {
            btn.classList.add('text');
        }
    });
    
    // Style card headers and bodies
    container.querySelectorAll('.card-header').forEach(header => {
        if (!header.classList.contains('bg-card')) {
            header.classList.add('bg-card');
        }
    });
    
    container.querySelectorAll('.card-body').forEach(body => {
        if (!body.classList.contains('bg-card')) {
            body.classList.add('bg-card');
        }
    });
    
    // Style modal content
    container.querySelectorAll('.modal-content').forEach(content => {
        if (!content.classList.contains('bg-card')) {
            content.classList.add('bg-card');
        }
    });
    
    // Style close buttons
    container.querySelectorAll('.btn-close').forEach(btn => {
        if (!btn.classList.contains('btn-close-white')) {
            btn.classList.add('btn-close-white');
        }
    });
    
    // Style headings in cards and modals
    container.querySelectorAll('.card-header h1, .card-header h2, .card-header h3, .card-header h4, .card-header h5, .card-header h6, .modal-header h1, .modal-header h2, .modal-header h3, .modal-header h4, .modal-header h5, .modal-header h6').forEach(heading => {
        if (!heading.classList.contains('text-accent')) {
            heading.classList.add('text-accent');
        }
    });
    
    console.log('Iron Meridian styling applied to container:', container);
}
