import { GuildActivityType } from '../../enums/index.js';
import { createBadge } from '../utils/ui-utils.js';
import { ListComponent } from './base/ListComponent.js';

/**
 * Component for displaying a list of guild activities
 */
export class ActivityList extends ListComponent {
    /**
     * Create a new ActivityList instance
     * @param {HTMLElement} container - The container element for the list
     * @param {Object} callbacks - Object containing callback functions
     * @param {Function} callbacks.onActivitySelect - Called when an activity is selected
     * @param {Function} callbacks.onAddActivity - Called when add activity is clicked
     */
    constructor(container, { onActivitySelect, onAddActivity }) {
        const filters = [
            { value: 'all', label: 'All', icon: 'fa-list' },
            { value: GuildActivityType.QUEST, label: 'Quests', icon: 'fa-scroll' },
            { value: GuildActivityType.MISSION, label: 'Missions', icon: 'fa-flag' },
            { value: GuildActivityType.EVENT, label: 'Events', icon: 'fa-calendar' },
            { value: GuildActivityType.GATHERING, label: 'Gatherings', icon: 'fa-users' },
            { value: GuildActivityType.OTHER, label: 'Other', icon: 'fa-ellipsis-h' }
        ];

        super(container, {
            entityName: 'activity',
            onItemSelect: onActivitySelect,
            onAddItem: onAddActivity,
            getItemTemplate: (activity) => this.getActivityItem(activity),
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
                <i class="fas fa-tasks fa-3x mb-3" style="opacity: 0.5;"></i>
                <p class="mb-2" style="font-size: 1.1rem;">No activities found</p>
                <p class="small mb-0">Track your guild's activities, quests, and events here.</p>
                <button class="btn btn-sm btn-outline-accent mt-3" style="border-color: var(--accent); color: var(--accent);">
                    <i class="fas fa-plus me-1"></i> Add Your First Activity
                </button>
            </div>
        `;
    }

    /**
     * Get the HTML template for the activity list
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
            <div class="activity-list-container" style="${debugStyles}">
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
     * Get the HTML for a single activity item
     * @param {Object} activity - Activity object
     * @returns {string} HTML string
     * @private
     */
    getActivityItem(activity) {
        const statusClass = this.getStatusBadgeClass(activity.status);
        
        return `
            <a href="#" class="list-group-item list-group-item-action activity-item" 
               data-activity-id="${activity.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${activity.name}</h5>
                    ${createBadge(activity.status, statusClass)}
                </div>
                <p class="mb-1 text-muted">
                    <i class="fas ${this.getActivityTypeIcon(activity.type)} me-1"></i>
                    ${activity.type}
                </p>
                <small class="text-muted">
                    ${activity.date ? new Date(activity.date).toLocaleDateString() : 'No date'}
                </small>
            </a>
        `;
    }



    /**
     * Get the appropriate badge class for a status
     * @param {string} status - Status value
     * @returns {string} CSS class for the badge
     * @private
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'planned': 'bg-info',
            'in-progress': 'bg-primary',
            'completed': 'bg-success',
            'failed': 'bg-danger',
            'on-hold': 'bg-warning'
        };
        
        return statusClasses[status] || 'bg-secondary';
    }

    /**
     * Get the appropriate icon for an activity type
     * @param {string} type - Activity type
     * @returns {string} Icon class
     * @private
     */
    getActivityTypeIcon(type) {
        const typeIcons = {
            [GuildActivityType.QUEST]: 'fa-scroll',
            [GuildActivityType.MISSION]: 'fa-flag',
            [GuildActivityType.EVENT]: 'fa-calendar',
            [GuildActivityType.GATHERING]: 'fa-users',
            [GuildActivityType.OTHER]: 'fa-ellipsis-h'
        };
        
        return typeIcons[type] || 'fa-tasks';
    }
}
