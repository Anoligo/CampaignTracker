/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} [duration=3000] - Duration in milliseconds to show the notification
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.padding = '12px 20px';
    toast.style.marginBottom = '10px';
    toast.style.borderRadius = '4px';
    toast.style.color = '#fff';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Set message
    toast.textContent = message;
    
    // Add to container
    container.appendChild(toast);
    
    // Trigger reflow to enable transition
    // eslint-disable-next-line no-unused-expressions
    toast.offsetHeight;
    
    // Show toast
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
    
    // Auto-remove after duration
    const timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        
        // Remove from DOM after fade out
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
                
                // Remove container if no more toasts
                if (container.children.length === 0) {
                    document.body.removeChild(container);
                }
            }
        }, 300);
    }, duration);
    
    // Allow manual dismissal
    toast.addEventListener('click', () => {
        clearTimeout(timer);
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        
        // Remove from DOM after fade out
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
                
                // Remove container if no more toasts
                if (container.children.length === 0) {
                    document.body.removeChild(container);
                }
            }
        }, 300);
    });
    
    return {
        dismiss: () => {
            clearTimeout(timer);
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(120%)';
            
            // Remove from DOM after fade out
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                    
                    // Remove container if no more toasts
                    if (container.children.length === 0) {
                        document.body.removeChild(container);
                    }
                }
            }, 300);
        }
    };
}

// Add some basic styles if not already present
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(120%); opacity: 0; }
        }
        
        .toast {
            animation: slideInRight 0.3s forwards;
        }
        
        .toast.hide {
            animation: slideOutRight 0.3s forwards;
        }
    `;
    document.head.appendChild(style);
}
