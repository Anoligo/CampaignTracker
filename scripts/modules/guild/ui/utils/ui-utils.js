/**
 * Creates a loading spinner element
 * @param {string} message - Loading message to display
 * @returns {string} HTML string for the loading spinner
 */
export function createLoadingSpinner(message = 'Loading...') {
    return `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">${message}</span>
            </div>
            ${message ? `<p class="mt-2 text-muted">${message}</p>` : ''}
        </div>
    `;
}

/**
 * Creates an empty state message
 * @param {string} message - Message to display
 * @param {string} [icon] - Optional icon class (e.g., 'fa-inbox')
 * @returns {string} HTML string for the empty state
 */
export function createEmptyState(message, icon = 'fa-inbox') {
    return `
        <div class="empty-state p-4 text-center">
            ${icon ? `<i class="fas ${icon} fa-3x text-muted mb-3"></i>` : ''}
            <p class="mb-0">${message}</p>
        </div>
    `;
}

/**
 * Creates a badge element with the given class and text
 * @param {string} text - Text to display in the badge
 * @param {string} [badgeClass='bg-secondary'] - CSS class for the badge
 * @returns {string} HTML string for the badge
 */
export function createBadge(text, badgeClass = 'bg-secondary') {
    return `<span class="badge ${badgeClass}">${text}</span>`;
}
