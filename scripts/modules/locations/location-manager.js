import { LocationService } from './services/location-service.js';
import { LocationUI } from './location-ui.js';

/**
 * Main manager for the Locations module
 * Coordinates between the service layer and UI components
 */
export class LocationManager {
    /**
     * Create a new LocationManager instance
     * @param {Object} dataManager - The application's data manager
     * @param {HTMLElement} container - The container element for the UI
     */
    constructor(dataManager, container) {
        console.log('LocationManager constructor called');
        this.dataManager = dataManager;
        this.container = document.createElement('div');
        this.container.className = 'locations-module';
        this.initialized = false;
        
        // Initialize services
        this.locationService = new LocationService(dataManager);
        
        // Create some sample locations if none exist
        if (this.locationService.getAllLocations().length === 0) {
            this.createSampleLocations();
        }
        
        // Add event listener for hash changes to handle navigation
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Initial check for current hash
        this.handleHashChange();
    }
    
    /**
     * Handle hash changes to show/hide the locations section
     */
    handleHashChange() {
        const isLocationsPage = window.location.hash === '#locations';
        const locationsSection = document.getElementById('locations');
        
        if (!locationsSection) {
            console.error('Locations section not found in the DOM');
            return;
        }
        
        if (isLocationsPage) {
            console.log('Navigated to locations page');
            locationsSection.style.display = 'block';
            locationsSection.classList.add('active');
            
            // Ensure the UI is initialized
            if (!this.initialized) {
                console.log('Locations UI not initialized, initializing now');
                this.initialize();
            } else if (this.locationUI) {
                // If already initialized, just refresh the UI
                console.log('Refreshing locations UI');
                this.locationUI.refresh();
                
                // Ensure the map is rendered with a small delay to allow DOM updates
                if (this.locationUI.renderMapView) {
                    console.log('Scheduling map view render');
                    // Use setTimeout to ensure the DOM is ready
                    setTimeout(() => {
                        console.log('Rendering map view');
                        try {
                            this.locationUI.renderMapView();
                        } catch (error) {
                            console.error('Error rendering map view:', error);
                        }
                    }, 100);
                }
            }
        } else {
            // Hide the section if we're not on the locations page
            locationsSection.style.display = 'none';
            locationsSection.classList.remove('active');
        }
    }
    
    /**
     * Initialize the location manager
     */
    initialize() {
        console.log('Initializing LocationManager');
        
        // Check if already initialized to prevent duplicate initialization
        if (this.initialized) {
            console.log('LocationManager already initialized, refreshing UI');
            if (this.locationUI) {
                console.log('Refreshing LocationUI');
                this.locationUI.refresh();
                
                // Ensure the map is rendered if we're on the locations page
                if (window.location.hash === '#locations' && this.locationUI.renderMapView) {
                    console.log('Ensuring map is rendered');
                    // Use setTimeout to ensure the DOM is ready
                    setTimeout(() => {
                        this.locationUI.renderMapView();
                    }, 100);
                }
            }
            // Make sure we handle the current hash
            this.handleHashChange();
            return;
        }
        
        // Get or create the locations section
        let locationsSection = document.getElementById('locations');
        if (!locationsSection) {
            console.log('Creating locations section');
            locationsSection = document.createElement('div');
            locationsSection.id = 'locations';
            locationsSection.className = 'section';
            const mainContent = document.querySelector('main .content-area');
            if (mainContent) {
                mainContent.appendChild(locationsSection);
            } else {
                document.body.appendChild(locationsSection);
            }
        } else {
            console.log('Using existing locations section');
        }
        
        // Ensure the section is visible
        locationsSection.style.display = 'block';
        locationsSection.classList.add('active');
        
        // Get all locations and log them for debugging
        const allLocations = this.locationService.getAllLocations();
        console.log('All locations from service:', allLocations);
        
        // Check if we have any locations, create samples if not
        if (allLocations.length === 0) {
            console.log('No locations found, creating sample locations');
            this.createSampleLocations();
        }
        
        // Clear the section and set up the basic structure
        locationsSection.innerHTML = '';
        this.setupLocationSection(locationsSection);
        
        // Get the container for the location UI
        const locationUIContainer = document.getElementById('locationUIContainer');
        if (!locationUIContainer) {
            console.error('Location UI container not found');
            return;
        }
        
        // Create the UI if it doesn't exist yet
        if (!this.locationUI) {
            console.log('Creating LocationUI');
            this.locationUI = new LocationUI(this.locationService, this.dataManager);
            
            // Initialize the UI after a short delay to ensure DOM is ready
            console.log('Initializing LocationUI');
            setTimeout(() => {
                this.locationUI.init();
                // Force a refresh to ensure everything is displayed
                if (this.locationUI.refresh) {
                    this.locationUI.refresh();
                }
            }, 100);
        } else {
            // If UI already exists, just refresh it
            console.log('Refreshing existing LocationUI');
            if (this.locationUI.refresh) {
                this.locationUI.refresh();
            }
        }
        
        // Set up a multi-stage initialization to ensure everything loads properly
        // Stage 1: Initial refresh
        console.log('Stage 1: Initial refresh');
        this.locationUI.refresh();
        
        // Stage 2: Check map initialization after a short delay
        setTimeout(() => {
            console.log('Stage 2: Checking map initialization');
            if (this.locationUI && !this.locationUI.map) {
                console.log('Map not initialized, attempting to render map view');
                this.locationUI.renderMapView();
            }
            
            // Stage 3: Final check and force refresh if needed
            setTimeout(() => {
                console.log('Stage 3: Final check and refresh');
                
                // Log locations again to ensure they're still available
                const locationsAfterDelay = this.locationService.getAllLocations();
                console.log('Locations after delay:', locationsAfterDelay);
                
                // Check if map was initialized properly
                if (this.locationUI && !this.locationUI.map) {
                    console.log('Map still not initialized, final attempt to render map view');
                    this.locationUI.renderMapView();
                }
                
                // Check if locations list is populated
                const locationsList = document.getElementById('locations-list');
                if (locationsList && locationsList.children.length === 0 && locationsAfterDelay.length > 0) {
                    console.log('Locations list is empty but we have locations, forcing list render');
                    if (this.locationUI.renderList) {
                        this.locationUI.renderList(locationsAfterDelay);
                    } else {
                        console.log('renderList method not found, using refresh instead');
                        this.locationUI.refresh();
                    }
                }
                
                // Add a manual refresh button in case all else fails
                const refreshButton = document.createElement('button');
                refreshButton.id = 'manual-refresh-btn';
                refreshButton.className = 'btn btn-sm btn-outline-primary mt-2';
                refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Map & Locations';
                refreshButton.style.position = 'absolute';
                refreshButton.style.top = '10px';
                refreshButton.style.right = '10px';
                refreshButton.style.zIndex = '1000';
                refreshButton.addEventListener('click', () => {
                    console.log('Manual refresh requested');
                    this.locationUI.renderMapView();
                    this.locationUI.refresh();
                });
                
                // Only add if it doesn't already exist
                if (!document.getElementById('manual-refresh-btn')) {
                    const mapContainer = document.getElementById('worldMapContainer');
                    if (mapContainer) {
                        mapContainer.appendChild(refreshButton);
                    } else {
                        locationsSection.appendChild(refreshButton);
                    }
                }
                
            }, 1500);
            
        }, 500);
        
        // Mark as initialized
        this.initialized = true;
    }
    
    /**
     * Set up the location section with the basic structure
     * @param {HTMLElement} locationsSection - The locations section element
     */
    /**
     * Set up the location section with the basic structure
     * @param {HTMLElement} locationsSection - The locations section element
     */
    setupLocationSection(locationsSection) {
        console.log('Setting up location section structure');
        
        try {
            // Clear the section first
            locationsSection.innerHTML = '';
            
            // Create the main container for the location UI
            const locationUIContainer = document.createElement('div');
            locationUIContainer.id = 'locationUIContainer';
            locationUIContainer.className = 'location-ui-container';
            
            // Create the map container
            const mapContainer = document.createElement('div');
            mapContainer.id = 'worldMapContainer';
            mapContainer.className = 'location-map-container mb-4';
            mapContainer.style.width = '100%';
            mapContainer.style.height = '500px';
            mapContainer.style.position = 'relative';
            mapContainer.style.overflow = 'hidden';
            mapContainer.style.border = '1px solid #444';
            mapContainer.style.borderRadius = '4px';
            
            // Create the loading overlay for the map
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'mapLoadingOverlay';
            loadingOverlay.className = 'map-loading-overlay';
            loadingOverlay.style.position = 'absolute';
            loadingOverlay.style.top = '0';
            loadingOverlay.style.left = '0';
            loadingOverlay.style.width = '100%';
            loadingOverlay.style.height = '100%';
            loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.justifyContent = 'center';
            loadingOverlay.style.alignItems = 'center';
            loadingOverlay.style.zIndex = '1000';
            loadingOverlay.innerHTML = `
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-light ms-2 mb-0">Loading map...</p>
            `;
            
            // Add the loading overlay to the map container
            mapContainer.appendChild(loadingOverlay);
            
            // Create the main content area for list and details
            const mainContent = document.createElement('div');
            mainContent.className = 'location-main-content mt-3';
            
            // Create a row for the locations list and details
            const row = document.createElement('div');
            row.className = 'row';
            
            // Locations list column
            const listCol = document.createElement('div');
            listCol.className = 'col-md-4';
            
            // Create the locations list card
            const listCard = document.createElement('div');
            listCard.className = 'card h-100';
            listCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Locations</h5>
                    <button class="btn btn-sm btn-outline-secondary" id="refreshLocationsBtn">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="card-body p-0">
                    <div class="input-group p-3">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" id="locationSearch" class="form-control" placeholder="Search locations...">
                    </div>
                    <div class="list-group list-group-flush" id="locationList" style="max-height: 500px; overflow-y: auto;">
                        <div class="text-center p-3 text-muted">
                            <i class="fas fa-map-marker-alt mb-2"></i>
                            <p class="mb-0">Click on the map to add a location</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Details column
            const detailsCol = document.createElement('div');
            detailsCol.className = 'col-md-8';
            
            // Create the details card
            const detailsCard = document.createElement('div');
            detailsCard.className = 'card h-100';
            detailsCard.innerHTML = `
                <div class="card-header">
                    <h5 class="mb-0">Location Details</h5>
                </div>
                <div class="card-body" id="locationDetails">
                    <div class="empty-state text-center p-5">
                        <i class="fas fa-map-marker-alt fa-3x mb-3 text-muted"></i>
                        <p class="text-muted">Select a location to view details</p>
                    </div>
                </div>
            `;
            
            // Assemble the columns
            listCol.appendChild(listCard);
            detailsCol.appendChild(detailsCard);
            row.appendChild(listCol);
            row.appendChild(detailsCol);
            mainContent.appendChild(row);
            
            // Add elements to the container
            locationUIContainer.appendChild(mapContainer);
            locationUIContainer.appendChild(mainContent);
            
            // Add the container to the section
            locationsSection.appendChild(locationUIContainer);
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('Location section structure set up');
            return locationUIContainer;
            
        } catch (error) {
            console.error('Error setting up location section:', error);
            throw error;
        }
    }
    
    /**
     * Set up event listeners for the locations module
     */
    setupEventListeners() {
        try {
            // Add refresh button functionality
            const refreshBtn = document.getElementById('refreshLocationsBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    if (this.locationUI && typeof this.locationUI.refresh === 'function') {
                        this.locationUI.refresh();
                    }
                });
            }
            
            // Add search functionality
            const searchInput = document.getElementById('locationSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    try {
                        const searchTerm = e.target.value.toLowerCase();
                        const locations = this.locationService.getAllLocations();
                        const filteredLocations = locations.filter(location => 
                            location && 
                            location.name && 
                            (location.name.toLowerCase().includes(searchTerm) ||
                            (location.description && location.description.toLowerCase().includes(searchTerm)))
                        );
                        
                        if (this.locationUI && typeof this.locationUI.renderList === 'function') {
                            this.locationUI.renderList(filteredLocations);
                        }
                    } catch (error) {
                        console.error('Error handling search input:', error);
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }
    
    /**
     * Render the locations module
     */
    render() {
        console.log('LocationManager render called');
        
        // Only render if we're on the locations page
        if (window.location.hash !== '#locations') {
            console.log('Not on locations page, skipping render');
            return;
        }
        
        // Get the locations section
        let locationsSection = document.getElementById('locations');
        if (!locationsSection) {
            console.error('Locations section not found, cannot render');
            return;
        }
        
        // Make sure the section is visible
        locationsSection.style.display = 'block';
        locationsSection.classList.add('active');
        
        // Refresh the UI to render the location list
        if (this.locationUI) {
            this.locationUI.refresh();
            console.log('Rendered locations list with', this.locationService.getAllLocations().length, 'locations');
        }
    }
    
    /**
     * Get the HTML element for this module
     * @returns {HTMLElement} The container element
     */
    getElement() {
        return this.container;
    }
    
    /**
     * Create sample locations for demonstration
     */
    createSampleLocations() {
        const sampleLocations = [
            {
                name: 'Ironforge City',
                description: 'A bustling city known for its skilled blacksmiths and imposing stone architecture.',
                type: 'CITY',
                x: 250,
                y: 150,
                discovered: true
            },
            {
                name: 'Whispering Woods',
                description: 'A mysterious forest where the trees seem to whisper ancient secrets.',
                type: 'FOREST',
                x: 150,
                y: 200,
                discovered: true
            },
            {
                name: 'Dragon\'s Lair Cave',
                description: 'A dangerous cave system rumored to house an ancient dragon.',
                type: 'CAVE',
                x: 300,
                y: 100,
                discovered: false
            },
            {
                name: 'Sunhaven Village',
                description: 'A peaceful village known for its annual harvest festival.',
                type: 'TOWN',
                x: 200,
                y: 250,
                discovered: true
            },
            {
                name: 'Ancient Temple Ruins',
                description: 'The crumbling remains of a once-grand temple dedicated to a forgotten deity.',
                type: 'RUINS',
                x: 350,
                y: 200,
                discovered: false
            }
        ];
        
        sampleLocations.forEach(location => {
            this.locationService.createLocation(location);
        });
        
        console.log('Created sample locations');
    }
    
    /**
     * Handle hash change events to manage the locations section
     */
    handleHashChange() {
        try {
            const currentHash = window.location.hash;
            console.log('[LocationManager] Hash changed, current hash:', currentHash);
            
            // Only proceed if this is the locations section
            if (currentHash === '#locations') {
                console.log('[LocationManager] Locations section active');
                
                // Initialize if not already initialized
                if (!this.initialized) {
                    console.log('[LocationManager] Initializing...');
                    this.initialize();
                } else {
                    console.log('[LocationManager] Already initialized, refreshing...');
                    this.refresh();
                }
                
                // Make sure our container is in the DOM
                const locationsSection = document.getElementById('locations');
                if (locationsSection) {
                    // Only append if not already there
                    if (!locationsSection.contains(this.container)) {
                        locationsSection.appendChild(this.container);
                    }
                    
                    // Ensure the section is visible (NavigationManager handles the actual display)
                    locationsSection.style.display = 'block';
                    locationsSection.classList.add('active');
                } else {
                    console.error('[LocationManager] Could not find locations section');
                }
            } else {
                console.log('[LocationManager] Not on locations page, cleaning up...');
                
                // Remove our container from the DOM if it's there
                if (this.container && this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }
            }
        } catch (error) {
            console.error('Error in handleHashChange:', error);
        }
    }
    
    /**
     * Refresh the UI with the latest data
     */
    /**
     * Refresh the UI with the latest data
     */
    refresh() {
        try {
            if (this.locationUI && typeof this.locationUI.refresh === 'function') {
                this.locationUI.refresh();
            } else {
                console.warn('LocationUI not available or refresh method not found');
            }
        } catch (error) {
            console.error('Error refreshing location UI:', error);
        }
    }
    
    /**
     * Clean up event listeners and resources
     */
    destroy() {
        // Clean up any event listeners or resources
        this.container.innerHTML = '';
        
        // Remove hash change event listener
        window.removeEventListener('hashchange', this.handleHashChange);
    }
}
