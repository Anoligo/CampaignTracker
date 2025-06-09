import { locationListColumns } from '../constants/location-constants.js';
import { escapeHtml } from '../utils/location-utils.js';

/**
 * Location List Component
 * Handles the rendering and interaction for the location list
 */
export class LocationList {
    /**
     * Create a new LocationList instance
     * @param {HTMLElement} container - The container element for the list
     * @param {Object} options - Configuration options
     * @param {Function} options.onSelect - Callback when a location is selected
     * @param {Function} options.onDelete - Callback when a location is deleted
     * @param {Function} options.onEdit - Callback when a location is edited
     */
    constructor(container, { onSelect, onDelete, onEdit }) {
        this.container = container;
        this.onSelect = onSelect;
        this.onDelete = onDelete;
        this.onEdit = onEdit;
        this.locations = [];
        this.selectedId = null;
        this.sortConfig = { field: 'name', ascending: true };
        
        // Bind methods
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSort = this.handleSort.bind(this);
    }
    
    /**
     * Render the location list
     * @param {Array<Object>} locations - Array of location objects
     * @param {string} selectedId - ID of the currently selected location
     */
    render(locations = [], selectedId = null) {
        this.locations = locations || [];
        this.selectedId = selectedId;
        
        // Create table element
        const table = document.createElement('table');
        table.className = 'table table-hover location-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        locationListColumns.forEach(column => {
            const th = document.createElement('th');
            th.scope = 'col';
            
            if (column.sortable) {
                th.className = 'sortable';
                th.setAttribute('data-sort', column.id);
                th.setAttribute('aria-sort', 
                    this.sortConfig.field === column.id ? 
                    (this.sortConfig.ascending ? 'ascending' : 'descending') : 
                    'none'
                );
                th.tabIndex = 0;
                th.addEventListener('click', () => this.handleSort(column.id));
                th.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleSort(column.id);
                    }
                });
            }
            
            const headerText = document.createTextNode(column.label);
            th.appendChild(headerText);
            
            // Add sort indicator
            if (column.sortable) {
                const sortIcon = document.createElement('span');
                sortIcon.className = 'sort-icon';
                if (this.sortConfig.field === column.id) {
                    sortIcon.textContent = this.sortConfig.ascending ? ' ↑' : ' ↓';
                } else {
                    sortIcon.textContent = ' ↕';
                }
                th.appendChild(sortIcon);
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        if (this.locations.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = locationListColumns.length;
            emptyCell.className = 'text-center text-muted py-4';
            emptyCell.textContent = 'No locations found';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            // Sort locations
            const sortedLocations = this.getSortedLocations();
            
            // Add location rows
            sortedLocations.forEach(location => {
                const row = this.createLocationRow(location);
                tbody.appendChild(row);
            });
        }
        
        table.appendChild(tbody);
        
        // Clear and update container
        this.container.innerHTML = '';
        this.container.appendChild(table);
    }
    
    /**
     * Create a table row for a location
     * @param {Object} location - The location object
     * @returns {HTMLElement} The table row element
     */
    createLocationRow(location) {
        const row = document.createElement('tr');
        row.className = location.id === this.selectedId ? 'table-active' : '';
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        row.setAttribute('data-location-id', location.id);
        
        // Add click handler for row selection
        row.addEventListener('click', () => this.handleSelect(location.id));
        row.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleSelect(location.id);
            }
        });
        
        // Add cells for each column
        locationListColumns.forEach(column => {
            const cell = document.createElement('td');
            
            switch (column.id) {
                case 'actions':
                    // Action buttons
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'btn-group btn-group-sm';
                    
                    // Edit button
                    const editButton = document.createElement('button');
                    editButton.type = 'button';
                    editButton.className = 'btn btn-outline-primary btn-edit';
                    editButton.title = 'Edit';
                    editButton.innerHTML = '<i class="fas fa-edit"></i>';
                    editButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleEdit(location.id);
                    });
                    
                    // Delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.type = 'button';
                    deleteButton.className = 'btn btn-outline-danger btn-delete';
                    deleteButton.title = 'Delete';
                    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleDelete(location.id, location.name);
                    });
                    
                    actionsDiv.appendChild(editButton);
                    actionsDiv.appendChild(deleteButton);
                    cell.appendChild(actionsDiv);
                    break;
                    
                default:
                    // Default cell content
                    cell.textContent = location[column.id] || '-';
                    break;
            }
            
            row.appendChild(cell);
        });
        
        return row;
    }
    
    /**
     * Get locations sorted according to current sort config
     * @returns {Array<Object>} Sorted locations
     */
    getSortedLocations() {
        return [...this.locations].sort((a, b) => {
            let valueA = a[this.sortConfig.field];
            let valueB = b[this.sortConfig.field];
            
            // Handle undefined/null values
            if (valueA === undefined || valueA === null) return this.sortConfig.ascending ? 1 : -1;
            if (valueB === undefined || valueB === null) return this.sortConfig.ascending ? -1 : 1;
            
            // Convert to string for comparison
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();
            
            if (valueA < valueB) return this.sortConfig.ascending ? -1 : 1;
            if (valueA > valueB) return this.sortConfig.ascending ? 1 : -1;
            return 0;
        });
    }
    
    /**
     * Handle location selection
     * @param {string} locationId - ID of the selected location
     */
    handleSelect(locationId) {
        if (typeof this.onSelect === 'function') {
            this.onSelect(locationId);
        }
    }
    
    /**
     * Handle location deletion
     * @param {string} locationId - ID of the location to delete
     * @param {string} locationName - Name of the location (for confirmation)
     */
    handleDelete(locationId, locationName) {
        if (confirm(`Are you sure you want to delete "${escapeHtml(locationName)}"?`)) {
            if (typeof this.onDelete === 'function') {
                this.onDelete(locationId);
            }
        }
    }
    
    /**
     * Handle location edit
     * @param {string} locationId - ID of the location to edit
     */
    handleEdit(locationId) {
        if (typeof this.onEdit === 'function') {
            this.onEdit(locationId);
        }
    }
    
    /**
     * Handle column sorting
     * @param {string} field - Field to sort by
     */
    handleSort(field) {
        if (this.sortConfig.field === field) {
            // Toggle sort direction if same field
            this.sortConfig.ascending = !this.sortConfig.ascending;
        } else {
            // Sort by new field, default to ascending
            this.sortConfig.field = field;
            this.sortConfig.ascending = true;
        }
        
        // Re-render with new sort config
        this.render(this.locations, this.selectedId);
    }
    
    /**
     * Update the list of locations
     * @param {Array<Object>} locations - New array of locations
     */
    updateLocations(locations) {
        this.locations = locations || [];
        this.render(this.locations, this.selectedId);
    }
    
    /**
     * Set the selected location
     * @param {string} locationId - ID of the selected location
     */
    setSelectedLocation(locationId) {
        this.selectedId = locationId;
        this.render(this.locations, this.selectedId);
    }
}

export default LocationList;
