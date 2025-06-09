import { LocationType, DiscoveryStatus } from './constants/location-constants.js';
import { formatLocationForDisplay, filterLocations } from './utils/location-utils.js';
import { LocationForm } from './components/location-form.js';
import { LocationList } from './components/location-list.js';
import { InteractiveMap } from './components/map/interactive-map.js';

/**
 * LocationUI - Main UI component for managing locations
 */
export class LocationUI {
    /**
     * Create a new LocationUI instance
     * @param {Object} options - Configuration options
     * @param {string} options.containerId - ID of the container element
     * @param {Function} options.onSave - Callback when a location is saved
     * @param {Function} options.onDelete - Callback when a location is deleted
     * @param {Function} options.onSelect - Callback when a location is selected
     */
    constructor({
        containerId = 'location-manager',
        onSave = () => {},
        onDelete = () => {},
        onSelect = () => {},
        locationService = null
    } = {}) {
        // DOM elements
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container element with ID "${containerId}" not found`);
            return;
        }
        
        // Callbacks
        this.onSave = onSave;
        this.onDelete = onDelete;
        this.onSelect = onSelect;
        this.locationService = locationService;
        
        // State
        this.locations = this.locationService ? this.locationService.getAllLocations() : [];
        this.selectedLocation = null;
        this.isEditing = false;
        this.searchQuery = '';
        
        // Initialize UI components
        this.initializeComponents();
        this.setupEventListeners();
        
        // Initial render
        this.render();
    }
    
    /**
     * Initialize UI components
     */
    initializeComponents() {
        // Create main container structure
        this.container.innerHTML = `
            <div class="location-manager">
                <div class="location-header">
                    <h2>Locations</h2>
                    <div class="location-actions">
                        <div class="search-box">
                            <input type="text" id="locationSearch" placeholder="Search locations..." class="form-control">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <button id="addLocationBtn" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Location
                        </button>
                    </div>
                </div>
                <div class="location-content">
                    <div class="location-list-container">
                        <div id="locationList"></div>
                    </div>
                    <div class="location-details-container">
                        <div id="locationDetails">
                            <div class="empty-state">
                                <i class="fas fa-map-marked-alt"></i>
                                <p>Select a location to view details</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="locationMapContainer" class="location-map-container">
                    <div id="locationMap" class="location-map"></div>
                    <div class="map-controls">
                        <button id="zoomInBtn" class="btn btn-sm btn-outline-light" title="Zoom In">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button id="zoomOutBtn" class="btn btn-sm btn-outline-light" title="Zoom Out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button id="resetViewBtn" class="btn btn-sm btn-outline-light" title="Reset View">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize components
        this.locationList = new LocationList(
            document.getElementById('locationList'),
            {
                onSelect: (locationId) => this.handleSelectLocation(locationId),
                onDelete: (locationId) => this.handleDeleteLocation(locationId),
                onEdit: (locationId) => this.handleEditLocation(locationId)
            }
        );
        
        this.locationForm = new LocationForm(
            document.getElementById('locationDetails'),
            {
                onSubmit: (locationData) => this.handleSaveLocation(locationData),
                onCancel: () => this.cancelEdit()
            }
        );
        
        // Initialize map
        this.initializeMap();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Add location button
        const addButton = this.container.querySelector('#addLocationBtn');
        if (addButton) {
            addButton.addEventListener('click', () => this.handleAddLocation());
        }
        
        // Search input
        const searchInput = this.container.querySelector('#locationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.renderLocationList();
            });
        }
        
        // Map controls
        const zoomInBtn = this.container.querySelector('#zoomInBtn');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.interactiveMap.zoomIn());
        }
        
        const zoomOutBtn = this.container.querySelector('#zoomOutBtn');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.interactiveMap.zoomOut());
        }
        
        const resetViewBtn = this.container.querySelector('#resetViewBtn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.interactiveMap.resetView());
        }
    }
    
    /**
     * Initialize the interactive map
     */
    initializeMap() {
        const mapContainer = this.container.querySelector('#locationMap');
        if (!mapContainer) return;
        
        this.interactiveMap = new InteractiveMap({
            container: mapContainer,
            onLocationClick: (locationId) => this.handleSelectLocation(locationId),
            onLocationAdd: (coordinates) => this.handleAddLocationAt(coordinates)
        });
        
        // Add existing locations to the map
        this.updateMapMarkers();
    }
    
    /**
     * Update map markers for all locations
     */
    updateMapMarkers() {
        if (!this.interactiveMap) return;
        
        // Clear existing markers
        this.interactiveMap.clearMarkers();
        
        // Add markers for each location with coordinates
        this.locations.forEach(location => {
            if (location.coordinates) {
                this.interactiveMap.addMarker({
                    id: location.id,
                    title: location.name,
                    type: location.type,
                    status: location.discoveryStatus,
                    coordinates: location.coordinates,
                    onClick: () => this.handleSelectLocation(location.id)
                });
            }
        });
    }
    
    /**
     * Render the main UI
     */
    render() {
        this.renderLocationList();
        this.renderLocationDetails();
    }
    
    /**
     * Render the location list
     */
    renderLocationList() {
        if (!this.locationList) return;
        
        // Filter locations based on search query
        const filteredLocations = this.searchQuery 
            ? filterLocations(this.locations, this.searchQuery)
            : this.locations;
        
        this.locationList.render(filteredLocations, this.selectedLocation?.id);
    }
    
    /**
     * Render the location details or form
     */
    renderLocationDetails() {
        if (!this.locationForm) return;
        
        if (this.isEditing) {
            // Show form for editing or adding a location
            this.locationForm.render(this.selectedLocation || {});
        } else if (this.selectedLocation) {
            // Show location details
            const detailsContainer = document.getElementById('locationDetails');
            if (!detailsContainer) return;
            
            const location = formatLocationForDisplay(this.selectedLocation);
            
            detailsContainer.innerHTML = `
                <div class="location-details">
                    <div class="location-header">
                        <h3>${escapeHtml(location.formattedName)}</h3>
                        <div class="location-meta">
                            <span class="badge location-type ${location.type.toLowerCase()}">
                                ${location.formattedType}
                            </span>
                            <span class="badge status-${location.discoveryStatus.toLowerCase()}">
                                ${location.formattedStatus}
                            </span>
                        </div>
                    </div>
                    
                    <div class="location-content">
                        <div class="section">
                            <h4>Description</h4>
                            <p>${location.formattedDescription}</p>
                        </div>
                        
                        ${location.notes ? `
                            <div class="section">
                                <h4>Notes</h4>
                                <p>${location.formattedNotes}</p>
                            </div>
                        ` : ''}
                        
                        ${location.coordinates ? `
                            <div class="section">
                                <h4>Coordinates</h4>
                                <p>X: ${location.coordinates.x}, Y: ${location.coordinates.y}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="location-actions">
                        <button id="editLocationBtn" class="btn btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button id="deleteLocationBtn" class="btn btn-danger">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners for action buttons
            const editButton = detailsContainer.querySelector('#editLocationBtn');
            if (editButton) {
                editButton.addEventListener('click', () => this.handleEditLocation(this.selectedLocation.id));
            }
            
            const deleteButton = detailsContainer.querySelector('#deleteLocationBtn');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => 
                    this.handleDeleteLocation(this.selectedLocation.id, this.selectedLocation.name)
                );
            }
        } else {
            // Show empty state
            const detailsContainer = document.getElementById('locationDetails');
            if (detailsContainer) {
                detailsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-map-marked-alt"></i>
                        <p>Select a location to view details</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Handle location selection
     * @param {string} locationId - ID of the selected location
     */
    handleSelectLocation(locationId) {
        this.selectedLocation = this.locations.find(loc => loc.id === locationId) || null;
        this.isEditing = false;
        this.render();
        
        // Pan to location on map if it has coordinates
        if (this.selectedLocation?.coordinates && this.interactiveMap) {
            this.interactiveMap.panTo(this.selectedLocation.coordinates);
        }
        
        // Notify parent component
        if (typeof this.onSelect === 'function') {
            this.onSelect(this.selectedLocation);
        }
    }
    
    /**
     * Handle adding a new location
     */
    handleAddLocation() {
        this.selectedLocation = null;
        this.isEditing = true;
        this.renderLocationDetails();
    }
    
    /**
     * Handle adding a new location at specific coordinates
     * @param {Object} coordinates - The map coordinates where to add the location
     */
    handleAddLocationAt(coordinates) {
        this.selectedLocation = { coordinates };
        this.isEditing = true;
        this.renderLocationDetails();
    }
    
    /**
     * Handle editing a location
     * @param {string} locationId - ID of the location to edit
     */
    handleEditLocation(locationId) {
        this.selectedLocation = this.locations.find(loc => loc.id === locationId) || null;
        this.isEditing = true;
        this.renderLocationDetails();
    }
    
    /**
     * Handle saving a location
     * @param {Object} locationData - The location data to save
     */
    handleSaveLocation(locationData) {
        // If we're editing an existing location, preserve its ID
        if (this.selectedLocation?.id) {
            locationData.id = this.selectedLocation.id;
        }

        // If we have coordinates from the map, include them
        if (this.selectedLocation?.coordinates) {
            locationData.coordinates = this.selectedLocation.coordinates;
        }

        let saved = null;
        if (this.locationService) {
            const data = { ...locationData };
            if (data.coordinates) {
                data.x = data.coordinates.x;
                data.y = data.coordinates.y;
                delete data.coordinates;
            }
            if (locationData.id) {
                saved = this.locationService.updateLocation(locationData.id, data);
            } else {
                saved = this.locationService.createLocation(data);
            }
            this.locations = this.locationService.getAllLocations();
            this.updateMapMarkers();
        }

        if (typeof this.onSave === 'function') {
            this.onSave(saved || locationData);
        }

        this.isEditing = false;
        this.render();
    }
    
    /**
     * Handle deleting a location
     * @param {string} locationId - ID of the location to delete
     * @param {string} locationName - Name of the location (for confirmation)
     */
    handleDeleteLocation(locationId, locationName) {
        if (!confirm(`Are you sure you want to delete "${escapeHtml(locationName || 'this location')}"?`)) {
            return;
        }
        
        // Call the delete callback
        if (typeof this.onDelete === 'function') {
            this.onDelete(locationId);
        }
        
        // Reset selection if the deleted location was selected
        if (this.selectedLocation?.id === locationId) {
            this.selectedLocation = null;
            this.isEditing = false;
        }
        
        this.render();
    }
    
    /**
     * Cancel editing and return to view mode
     */
    cancelEdit() {
        this.isEditing = false;
        this.render();
    }
    
    /**
     * Update the locations data and refresh the UI
     * @param {Array<Object>} locations - New array of locations
     */
    updateLocations(locations) {
        this.locations = locations || [];
        
        // Update the location list
        if (this.locationList) {
            this.locationList.updateLocations(locations);
        }
        
        // Update map markers
        this.updateMapMarkers();
        
        // If the selected location is no longer in the list, clear the selection
        if (this.selectedLocation && !locations.some(loc => loc.id === this.selectedLocation.id)) {
            this.selectedLocation = null;
            this.isEditing = false;
        }
        
        // Re-render the details view
        this.renderLocationDetails();
    }
    
    /**
     * Set the selected location by ID
     * @param {string} locationId - ID of the location to select
     */
    setSelectedLocation(locationId) {
        this.handleSelectLocation(locationId);
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Initialize the locations section
export function initializeLocationsSection() {
    try {
        console.log('Initializing locations section...');
        
        // Check if the locations container exists
        const container = document.getElementById('locations');
        if (!container) {
            console.error('Locations container not found');
            return;
        }
        
        // Initialize the map if the map container exists
        const mapContainer = document.getElementById('worldMapContainer');
        if (mapContainer) {
            // Check if the map is already initialized
            if (!window.app?.locationMap) {
                console.log('Initializing interactive map...');
                try {
                    // Create a new interactive map instance
                    const interactiveMap = new InteractiveMap({
                        containerId: 'worldMapContainer',
                        onLocationClick: (location) => {
                            console.log('Location clicked:', location);
                            // Handle location click (e.g., show details)
                        },
                        onMapClick: (coordinates) => {
                            console.log('Map clicked at:', coordinates);
                            // Handle map click (e.g., add new location)
                        }
                    });
                    
                    // Store the map instance for later use
                    window.app = window.app || {};
                    window.app.locationMap = interactiveMap;
                    
                    // Load locations if available
                    if (window.appState?.state?.locations) {
                        interactiveMap.setLocations(window.appState.state.locations);
                    }
                    
                    console.log('Interactive map initialized');
                } catch (error) {
                    console.error('Failed to initialize interactive map:', error);
                    mapContainer.innerHTML = `
                        <div class="alert alert-danger">
                            Failed to load the map. Please check the console for details.
                        </div>
                    `;
                }
            } else {
                console.log('Map already initialized');
            }
        } else {
            console.warn('Map container not found');
        }
        
        // Initialize the location manager if it doesn't exist
        if (!window.app?.locationManager) {
            console.log('Initializing location manager...');
            try {
                // Import the location manager dynamically to avoid circular dependencies
                import('./location-manager.js').then(module => {
                    if (module.LocationManager) {
                        window.app.locationManager = new module.LocationManager();
                        console.log('Location manager initialized');
                    }
                });
            } catch (error) {
                console.error('Failed to initialize location manager:', error);
            }
        } else {
            console.log('Location manager already initialized');
        }
        
        console.log('Locations section initialized');
    } catch (error) {
        console.error('Error initializing locations section:', error);
    }
}

export default LocationUI;
