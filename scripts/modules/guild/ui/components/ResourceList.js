import { GuildResourceType } from '../../enums/index.js';
import { createBadge } from '../utils/ui-utils.js';
import { ListComponent } from './base/ListComponent.js';

/**
 * Component for displaying a list of guild resources
 */
export class ResourceList extends ListComponent {
    /**
     * Create a new ResourceList instance
     * @param {HTMLElement} container - The container element for the list
     * @param {Object} callbacks - Object containing callback functions
     * @param {Function} callbacks.onResourceSelect - Called when a resource is selected
     * @param {Function} callbacks.onAddResource - Called when add resource is clicked
     */
    constructor(container, { onResourceSelect, onAddResource }) {
        const filters = [
            { value: 'all', label: 'All', icon: 'fa-list' },
            { value: GuildResourceType.GOLD, label: 'Gold', icon: 'fa-coins' },
            { value: GuildResourceType.MATERIAL, label: 'Materials', icon: 'fa-cubes' },
            { value: GuildResourceType.ITEM, label: 'Items', icon: 'fa-box-open' },
            { value: GuildResourceType.INFORMATION, label: 'Information', icon: 'fa-scroll' },
            { value: GuildResourceType.OTHER, label: 'Other', icon: 'fa-ellipsis-h' }
        ];

        super(container, {
            entityName: 'resource',
            onItemSelect: onResourceSelect,
            onAddItem: onAddResource,
            getItemTemplate: (resource) => this.getResourceItem(resource),
            filters
        });
    }

    /**
     * Get the empty state HTML
     * @returns {string} HTML string
     * @override
     */
    getEmptyState() {
        return `
            <div class="d-flex flex-column align-items-center justify-content-center p-5 text-center" style="
                height: 200px;
                color: #777;
            ">
                <i class="fas fa-cubes fa-3x mb-3" style="opacity: 0.5;"></i>
                <p class="mb-2" style="font-size: 1.1rem;">No resources found</p>
                <p class="small mb-0">Track your guild's inventory, assets, and resources here.</p>
                <button class="btn btn-sm btn-outline-accent mt-3" style="border-color: var(--accent); color: var(--accent);">
                    <i class="fas fa-plus me-1"></i> Add Your First Resource
                </button>
            </div>
        `;
    }

    /**
     * Get the HTML template for the resource list
     * @returns {string} HTML string
     * @override
     */
    getTemplate() {
        // Add debug styles
        const debugStyles = `
            border: 1px solid rgba(255, 0, 255, 0.3);
            min-height: 200px;
            display: flex;
            flex-direction: column;
            height: 100%;
        `;
        
        return `
            <div class="resource-list-container" style="${debugStyles}">
                ${super.getSearchAndFilters()}
                <div class="list-group list-group-flush flex-grow-1" style="overflow-y: auto;">
                    ${this.items.length > 0 
                        ? this.items.map(item => this.getItemTemplate(item)).join('')
                        : this.getEmptyState()}
                </div>
            </div>
        `;
    }

    /**
     * Get the HTML for a single resource item
     * @param {Object} resource - Resource object
     * @returns {string} HTML string
     * @private
     */
    getResourceItem(resource) {
        const typeClass = this.getTypeBadgeClass(resource.type);
        
        return `
            <div class="list-group-item" style="border: 1px solid rgba(255,255,255,0.1);">
                <a href="#" class="list-group-item-action resource-item" 
                   data-resource-id="${resource.id}">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${resource.name}</h5>
                        ${createBadge(resource.type, typeClass)}
                    </div>
                <p class="mb-1 text-muted">
                    <i class="fas ${this.getResourceTypeIcon(resource.type)} me-1"></i>
                    ${resource.type}
                </p>
                <small class="text-muted">
                    ${resource.quantity ? `Qty: ${resource.quantity}` : ''}
                    ${resource.location ? `• ${resource.location}` : ''}
                </small>
            </a>
        `;
    }

    /**
     * Get the appropriate badge class for a resource type
     * @param {string} type - Resource type
     * @returns {string} CSS class for the badge
     * @private
     */
    getTypeBadgeClass(type) {
        const typeClasses = {
            [GuildResourceType.GOLD]: 'bg-warning text-dark',
            [GuildResourceType.MATERIAL]: 'bg-info text-dark',
            [GuildResourceType.ITEM]: 'bg-primary',
            [GuildResourceType.INFORMATION]: 'bg-success',
            [GuildResourceType.OTHER]: 'bg-secondary'
        };
        
        return typeClasses[type] || 'bg-secondary';
    }

    /**
     * Get the appropriate icon for a resource type
     * @param {string} type - Resource type
     * @returns {string} Icon class
     * @private
     */
    getResourceTypeIcon(type) {
        const typeIcons = {
            [GuildResourceType.GOLD]: 'fa-coins',
            [GuildResourceType.MATERIAL]: 'fa-cubes',
            [GuildResourceType.ITEM]: 'fa-box-open',
            [GuildResourceType.INFORMATION]: 'fa-scroll',
            [GuildResourceType.OTHER]: 'fa-ellipsis-h'
        };
        
        return typeIcons[type] || 'fa-box';
    }
}
