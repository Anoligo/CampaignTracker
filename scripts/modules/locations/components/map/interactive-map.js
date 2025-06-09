/**
 * Interactive Map Component
 * Displays a world map with interactive location pins
 * Supports zooming, panning, and adding new location pins
 */

export class InteractiveMap {
    /**
     * Create a new InteractiveMap instance
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.container - The container element for the map
     * @param {string} [options.mapImagePath='./images/WorldMap.png'] - Path to the map image
     * @param {Array} [options.locations=[]] - Array of location objects with {id, name, x, y}
     * @param {Function} [options.onLocationClick] - Callback when a location is clicked
     * @param {Function} [options.onMapClick] - Callback when the map background is clicked
     */
    constructor(options) {
        if (!options) {
            throw new Error('InteractiveMap requires options');
        }

        // Handle container as either an element or an ID
        if (options.container) {
            this.container = typeof options.container === 'string' 
                ? document.getElementById(options.container)
                : options.container;
        } else if (options.containerId) {
            this.container = document.getElementById(options.containerId);
        }

        if (!this.container) {
            throw new Error('InteractiveMap requires a valid container element or containerId');
        }

        // Store options
        this.mapImagePath = options.mapImagePath || './images/WorldMap.png';
        this.onLocationClick = typeof options.onLocationClick === 'function' ? options.onLocationClick : null;
        this.onMapClick = typeof options.onMapClick === 'function' ? options.onMapClick : null;
        this.onAddLocation = typeof options.onAddLocation === 'function' ? options.onAddLocation : null;
        this.lastClickCoordinates = null;
        this.markers = new Map();
        this._pendingCenter = null;

        // Initialize locations array
        this.locations = [];
        if (Array.isArray(options.locations) && options.locations.length > 0) {
            console.log('Initializing map with provided locations:', options.locations);
            this.locations = options.locations;
        } else {
            console.warn('No locations provided or invalid locations array');
        }

        // Map state
        this.scale = 1;
        this.minScale = 0.5;
        this.maxScale = 3;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartOffsetX = 0;
        this.dragStartOffsetY = 0;
        this.selectedLocationId = null;
        this._isInitialized = false;
        this._resizeObserver = null;

        // Define all methods first
        this.handleWheel = (e) => this._handleWheel(e);
        this.handleMouseDown = (e) => this._handleMouseDown(e);
        this.handleMouseMove = (e) => this._handleMouseMove(e);
        this.handleMouseUp = () => this._handleMouseUp();
        this.handleMapClick = (e) => this._handleMapClick(e);
        this.render = () => this._render();
        this.zoom = (factor, center) => this._zoom(factor, center);
        this.resetView = () => this._resetView();
        this.constrainMapBounds = () => this._constrainMapBounds();
        this.selectLocation = (locationId) => this._selectLocation(locationId);
        this.centerOnLocation = (locationId, zoomLevel) => this._centerOnLocation(locationId, zoomLevel);
        this.updateLocations = (locations) => this._updateLocations(locations);
        this.isContainerReady = () => this._isContainerReady();
        this.showError = (message) => this._showError(message);
        this.init = () => this._init();
        this.addEventListeners = () => this._addEventListeners();
        this.getLocationAt = (x, y) => this._getLocationAt(x, y);
        this.createButton = (text, title, onClick) => this._createButton(text, title, onClick);
        this._setupResizeObserver = () => this.__setupResizeObserver();
        this._processPendingCenter = () => this.__processPendingCenter();

        // Initialize the map
        this.init();
    }

    /**
     * Show an error message in the map container (private implementation)
     * @param {string} message - The error message to display
     * @private
     */
    _showError(message) {
        console.error(message);
        this.container.innerHTML = `
            <div style="
                padding: 20px; 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                margin: 10px 0;
            ">
                <h4>Map Error</h4>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Check if the map container is visible and has dimensions
     * @returns {boolean} True if the container is ready for rendering
     */
    _isContainerReady() {
        if (!this.container || !this.container.parentElement) {
            console.warn('Map container or its parent is not in the DOM');
            return false;
        }

        // Check if container is visible
        const style = window.getComputedStyle(this.container);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            console.warn('Map container is not visible');
            return false;
        }

        // Check container dimensions
        const { width, height } = this.container.getBoundingClientRect();
        if (width <= 0 || height <= 0) {
            console.warn(`Map container has invalid dimensions: ${width}x${height}`);
            return false;
        }

        return true;
    }

    /**
     * Initialize the map (private implementation)
     * @private
     */
    _init() {
        console.log('Initializing map...');

        try {
            // Ensure container is ready
            if (!this._isContainerReady()) {
                console.warn('Map container is not ready for initialization, will retry...');
                setTimeout(() => this.init(), 100);
                return;
            }

            // Clear any existing content
            this.container.innerHTML = '';

            // Ensure container has dimensions
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            this.container.style.minHeight = '500px'; // Ensure minimum height

            // Create map container
            this.mapContainer = document.createElement('div');
            this.mapContainer.className = 'map-container';
            this.mapContainer.style.position = 'relative';
            this.mapContainer.style.width = '100%';
            this.mapContainer.style.height = '100%';
            this.mapContainer.style.overflow = 'hidden';
            this.mapContainer.style.cursor = 'grab';

            // Create map image
            this.mapImage = new Image();
            this.mapImage.className = 'map-image';
            this.mapImage.style.position = 'absolute';
            this.mapImage.style.top = '0';
            this.mapImage.style.left = '0';
            this.mapImage.style.width = '100%';
            this.mapImage.style.height = '100%';
            this.mapImage.style.objectFit = 'contain';
            this.mapImage.style.transformOrigin = '0 0';
            this.mapImage.src = this.mapImagePath;

            // Handle image load
            this.mapImage.onload = () => {
                console.log('Map image loaded successfully');
                // Set pins container size based on image natural size
                if (this.pinsContainer) {
                    this.pinsContainer.style.width = `${this.mapImage.naturalWidth}px`;
                    this.pinsContainer.style.height = `${this.mapImage.naturalHeight}px`;
                }

                // Initialize resize observer
                this.__setupResizeObserver();

                // Initial render
                this._isInitialized = true;
                this.resetView();
                this.render();

                // Process any pending center operations
                this.__processPendingCenter();
            };

            // Handle image error
            this.mapImage.onerror = () => {
                console.error('Failed to load map image:', this.mapImagePath);
                this.showError(`Failed to load map image: ${this.mapImagePath}. Please check the image path.`);
            };

            // Create pins container
            this.pinsContainer = document.createElement('div');
            this.pinsContainer.className = 'map-pins-container';
            this.pinsContainer.style.position = 'absolute';
            this.pinsContainer.style.top = '0';
            this.pinsContainer.style.left = '0';
            this.pinsContainer.style.width = '0';
            this.pinsContainer.style.height = '0';
            this.pinsContainer.style.pointerEvents = 'auto'; // Changed to allow interaction
            this.pinsContainer.style.transformOrigin = '0 0';
            this.pinsContainer.style.zIndex = '10';
            this.pinsContainer.style.overflow = 'visible';

            // Create controls container
            this.controlsContainer = document.createElement('div');
            this.controlsContainer.className = 'map-controls';
            this.controlsContainer.style.position = 'absolute';
            this.controlsContainer.style.bottom = '20px';
            this.controlsContainer.style.right = '20px';
            this.controlsContainer.style.zIndex = '20';
            this.controlsContainer.style.display = 'flex';
            this.controlsContainer.style.flexDirection = 'column';
            this.controlsContainer.style.gap = '5px';

            // Add zoom controls
            const zoomInBtn = this.createButton('+', 'Zoom In', () => this.zoom(1.2));
            const zoomOutBtn = this.createButton('-', 'Zoom Out', () => this.zoom(0.8));
            const resetBtn = this.createButton('↺', 'Reset View', () => this.resetView());

            this.controlsContainer.appendChild(zoomInBtn);
            this.controlsContainer.appendChild(zoomOutBtn);
            this.controlsContainer.appendChild(resetBtn);

            // Assemble the map
            this.mapContainer.appendChild(this.mapImage);
            this.mapContainer.appendChild(this.pinsContainer);
            this.mapContainer.appendChild(this.controlsContainer);
            this.container.appendChild(this.mapContainer);

            // Add event listeners
            this.addEventListeners();

            console.log('Map initialization complete');

        } catch (error) {
            console.error('Error initializing map:', error);
            this.showError(`Failed to initialize map: ${error.message}`);
        }
    }

    /**
     * Set up a resize observer to handle container size changes
     */
    __setupResizeObserver() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }

        this._resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target === this.container || entry.target.contains(this.container)) {
                    console.log('Container resized, updating map');
                    this.render();
                    this.__processPendingCenter();
                }
            }
        });

        // Observe both the container and its parent for size changes
        this._resizeObserver.observe(this.container);
        if (this.container.parentElement) {
            this._resizeObserver.observe(this.container.parentElement);
        }
    }

    /**
     * Process any pending center operations
     */
    __processPendingCenter() {
        if (this._pendingCenter && this._isInitialized) {
            const { locationId, zoomLevel, coords } = this._pendingCenter;
            this._pendingCenter = null;
            if (coords) {
                this._centerOnCoordinates(coords, zoomLevel);
            } else {
                this.centerOnLocation(locationId, zoomLevel);
            }
        }
    }

    /**
     * Center the map on a specific location and optionally set zoom level
     * @param {string} locationId - The ID of the location to center on
     * @param {number} [zoomLevel=1.5] - Optional zoom level (defaults to 1.5x)
     */
    _centerOnLocation(locationId, zoomLevel = 1.5) {
        // If not initialized yet, store the request and try again later
        if (!this._isInitialized) {
            console.log('Map not initialized yet, queuing center operation');
            this._pendingCenter = { locationId, zoomLevel };
            return;
        }

        const location = this.locations.find(loc => loc.id === locationId);
        if (!location) {
            console.warn(`Location with ID ${locationId} not found`);
            return;
        }

        console.log('Centering on location:', location);
        this.selectedLocationId = locationId;
        this.highlightMarker(locationId);

        // If the image isn't loaded yet, wait for it
        if (!this.mapImage || !this.mapImage.complete || this.mapImage.naturalWidth === 0) {
            console.log('Waiting for image to load before centering...');
            const onImageLoad = () => {
                this.mapImage.removeEventListener('load', onImageLoad);
                this.centerOnLocation(locationId, zoomLevel);
            };
            this.mapImage.addEventListener('load', onImageLoad);
            return;
        }

        // Ensure container is ready
        if (!this._isContainerReady()) {
            console.warn('Container not ready for centering, will retry...');
            this._pendingCenter = { locationId, zoomLevel };
            return;
        }

        // Set the zoom level if provided
        if (zoomLevel) {
            this.scale = Math.max(this.minScale, Math.min(this.maxScale, zoomLevel));
        }

        // Calculate the position to center on
        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;

        // Ensure we have valid dimensions
        if (containerWidth === 0 || containerHeight === 0) {
            console.warn('Map container has zero dimensions, will retry...');
            this._pendingCenter = { locationId, zoomLevel };
            return;
        }

        // Calculate the pin position in the original image coordinates
        const pinX = (location.x / 100) * this.mapImage.naturalWidth;
        const pinY = (location.y / 100) * this.mapImage.naturalHeight;

        console.log('Centering calculations:', {
            containerWidth,
            containerHeight,
            pinX,
            pinY,
            scale: this.scale,
            naturalWidth: this.mapImage.naturalWidth,
            naturalHeight: this.mapImage.naturalHeight
        });

        // Center the view on the selected location
        this.offsetX = (containerWidth / 2) - (pinX * this.scale);
        this.offsetY = (containerHeight / 2) - (pinY * this.scale);

        // Ensure the map stays within bounds
        this.constrainMapBounds();

        // Update the display
        this.render();

        console.log('Map centered on:', {
            location: location.name,
            pinX,
            pinY,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            scale: this.scale
        });
    }

    /**
     * Clean up event listeners and release resources
     */
    destroy() {
        try {
            // Remove event listeners from map container if it exists
            if (this.mapContainer) {
                this.mapContainer.removeEventListener('wheel', this.handleWheel);
                this.mapContainer.removeEventListener('mousedown', this.handleMouseDown);
                this.mapContainer.removeEventListener('click', this.handleMapClick);
                this.mapContainer.removeEventListener('mouseleave', this.handleMouseUp);
                
                // Clear any custom data attributes
                delete this.mapContainer._interactiveMapInstance;
            }
            
            // Remove document-level event listeners
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
            
            // Clean up resize observer
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }
            
            // Clean up image
            if (this.mapImage) {
                this.mapImage.onload = null;
                this.mapImage.onerror = null;
                this.mapImage.src = '';
                this.mapImage.remove();
            }
            
            // Clear any intervals or timeouts
            if (this._initRetryTimeout) {
                clearTimeout(this._initRetryTimeout);
                this._initRetryTimeout = null;
            }
            
            // Clear references to DOM elements
            if (this.container) {
                this.container.innerHTML = '';
            }
            
            // Clear data
            this.locations = [];
            this._pendingCenter = null;
            this._isInitialized = false;
            
            console.log('InteractiveMap instance destroyed');
        } catch (error) {
            console.error('Error during InteractiveMap destruction:', error);
        }
    }

    /**
     * Select a location by ID and center the view on it
     * @param {string} locationId - The ID of the location to select
     */
    _selectLocation(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (!location) return;

        this.selectedLocationId = locationId;

        // Calculate the position to center on
        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;

        const x = (location.x / 100) * this.mapImage.naturalWidth;
        const y = (location.y / 100) * this.mapImage.naturalHeight;

        // Center the view on the selected location
        this.offsetX = (containerWidth / 2) - (x * this.scale);
        this.offsetY = (containerHeight / 2) - (y * this.scale);

        // Constrain the map bounds
        this.constrainMapBounds();

        // Re-render to update the view
        this.render();
    }

    /**
     * Create a button element (private implementation)
     * @param {string} text - Button text
     * @param {string} title - Button title/tooltip
     * @param {Function} onClick - Click handler
     * @returns {HTMLElement} The created button element
     * @private
     */
    _createButton(text, title, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = title;
        button.style.cursor = 'pointer';
        button.style.padding = '5px 10px';
        button.style.borderRadius = '5px';
        button.style.border = 'none';
        button.style.background = '#007bff';
        button.style.color = '#fff';
        button.style.margin = '5px';
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * Handle mouse wheel events for zooming (private implementation)
     * @param {WheelEvent} e - The wheel event
     * @private
     */
    _handleWheel(e) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.2 : 0.8;
        this.zoom(factor);
    }

    /**
     * Handle mouse down event for dragging (private implementation)
     * @param {MouseEvent} e - The mouse event
     * @private
     */
    _handleMouseDown(e) {
        // Only start dragging on left mouse button
        if (e.button !== 0) return;
        
        try {
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.dragStartOffsetX = this.offsetX;
            this.dragStartOffsetY = this.offsetY;
            
            // Change cursor to grabbing
            if (this.mapContainer) {
                this.mapContainer.style.cursor = 'grabbing';
            }
        } catch (error) {
            console.error('Error in _handleMouseDown:', error);
            this.isDragging = false;
        }
    }

    /**
     * Handle mouse move event for dragging (private implementation)
     * @param {MouseEvent} e - The mouse event
     * @private
     */
    _handleMouseMove(e) {
        if (!this.isDragging) return;
        
        try {
            // Prevent text selection while dragging
            e.preventDefault();
            
            this.offsetX = this.dragStartOffsetX + (e.clientX - this.dragStartX);
            this.offsetY = this.dragStartOffsetY + (e.clientY - this.dragStartY);
            
            // Constrain the map bounds during drag for better UX
            this.constrainMapBounds();
            
            // Throttle rendering for better performance during drag
            if (!this._lastRenderTime || performance.now() - this._lastRenderTime > 16) { // ~60fps
                this.render();
                this._lastRenderTime = performance.now();
            }
        } catch (error) {
            console.error('Error in _handleMouseMove:', error);
            this.isDragging = false;
        }
    }

    /**
     * Handle mouse up event for dragging (private implementation)
     * @private
     */
    _handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            
            // Reset cursor to grab
            if (this.mapContainer) {
                this.mapContainer.style.cursor = 'grab';
            }
        }
    }

    /**
     * Handle map click event (private implementation)
     * @param {MouseEvent} e - The mouse event
     * @private
     */
    _handleMapClick(e) {
        if (!this.mapContainer || !this.mapImage) return;

        const rect = this.mapContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offsetX) / this.scale;
        const y = (e.clientY - rect.top - this.offsetY) / this.scale;

        const location = this._getLocationAt(x, y);
        if (location) {
            if (this.onLocationClick) {
                this.onLocationClick(location.id);
            }
            return;
        }

        if (this.mapImage.naturalWidth && this.mapImage.naturalHeight) {
            const coords = {
                x: (x / this.mapImage.naturalWidth) * 100,
                y: (y / this.mapImage.naturalHeight) * 100
            };
            this.lastClickCoordinates = coords;
            if (this.onAddLocation) {
                this.onAddLocation(coords);
            }
            if (this.onMapClick) {
                this.onMapClick(coords);
            }
        }
    }

    /**
     * Render the map (private implementation)
     * @private
     */
    _render() {
        if (!this.mapImage || !this.mapImage.complete || this.mapImage.naturalWidth === 0) {
            return;
        }

        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;

        // Calculate the map position and scale
        const mapWidth = this.mapImage.naturalWidth * this.scale;
        const mapHeight = this.mapImage.naturalHeight * this.scale;

        // Update the map image position and scale
        this.mapImage.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;

        // Update the pins container position and scale
        this.pinsContainer.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;

        // Update the controls container position
        this.controlsContainer.style.transform = `translate(0, ${containerHeight - 50}px)`;
    }

    /**
     * Zoom the map by a factor (private implementation)
     * @param {number} factor - The zoom factor (e.g., 1.1 for zoom in, 0.9 for zoom out)
     * @param {Object} [center] - Optional center point for zooming
     * @private
     */
    _zoom(factor, center) {
        if (center) {
            const containerWidth = this.mapContainer.clientWidth;
            const containerHeight = this.mapContainer.clientHeight;
            const centerX = center.x - this.offsetX;
            const centerY = center.y - this.offsetY;
            this.offsetX = centerX - (centerX * factor);
            this.offsetY = centerY - (centerY * factor);
        }

        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * factor));
        this.render();
    }

    /**
     * Reset the map view (private implementation)
     * @private
     */
    _resetView() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.render();
    }

    /**
     * Constrain the map bounds to prevent panning outside the container (private implementation)
     * @private
     */
    _constrainMapBounds() {
        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;
        const mapWidth = this.mapImage.naturalWidth * this.scale;
        const mapHeight = this.mapImage.naturalHeight * this.scale;

        if (this.offsetX > 0) {
            this.offsetX = 0;
        } else if (this.offsetX + mapWidth < containerWidth) {
            this.offsetX = containerWidth - mapWidth;
        }

        if (this.offsetY > 0) {
            this.offsetY = 0;
        } else if (this.offsetY + mapHeight < containerHeight) {
            this.offsetY = containerHeight - mapHeight;
        }
    }

    /**
     * Get the location at the specified coordinates (private implementation)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} The location at the coordinates, or null if none
     * @private
     */
    _getLocationAt(x, y) {
        const location = this.locations.find(loc => {
            const pinX = (loc.x / 100) * this.mapImage.naturalWidth;
            const pinY = (loc.y / 100) * this.mapImage.naturalHeight;
            const distance = Math.sqrt(Math.pow(pinX - x, 2) + Math.pow(pinY - y, 2));
            return distance < 20; // Adjust the distance threshold as needed
        });
        return location || null;
    }

    /**
     * Update the locations on the map (private implementation)
     * @param {Array} locations - Array of location objects
     * @private
     */
    _updateLocations(locations) {
        if (!Array.isArray(locations)) {
            console.warn('Invalid locations array provided to updateLocations');
            return;
        }

        console.log('Updating map locations:', locations);
        this.locations = locations;

        // Re-render the map to show the updated locations
        if (this._isInitialized) {
            this.render();
            this.clearMarkers();
            this.locations.forEach(loc => {
                if (loc.x !== undefined && loc.y !== undefined) {
                    this.addMarker({
                        id: loc.id,
                        title: loc.name,
                        coordinates: { x: loc.x, y: loc.y },
                        status: loc.discoveryStatus
                    });
                }
            });
        }
    }

    /**
     * Add a marker to the map
     * @param {Object} options - Marker options
     */
    addMarker({ id, title = '', coordinates, status, onClick }) {
        if (!this.pinsContainer || !coordinates) return;

        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.style.left = `${coordinates.x}%`;
        pin.style.top = `${coordinates.y}%`;

        const icon = document.createElement('div');
        icon.className = 'pin-icon';
        if (status === 'UNDISCOVERED') {
            icon.classList.add('undiscovered');
        }
        icon.innerHTML = '<i class="fas fa-map-marker-alt"></i>';

        const label = document.createElement('div');
        label.className = 'pin-label';
        label.textContent = title;

        pin.appendChild(icon);
        pin.appendChild(label);

        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof onClick === 'function') {
                onClick(id);
            }
            this.highlightMarker(id);
        });

        this.pinsContainer.appendChild(pin);
        this.markers.set(id, pin);
    }

    /**
     * Remove all markers from the map
     */
    clearMarkers() {
        this.markers.forEach(el => el.remove());
        this.markers.clear();
    }

    /**
     * Pan the map to specific coordinates
     */
    panTo(coordinates, zoomLevel) {
        if (!coordinates) return;
        this._centerOnCoordinates(coordinates, zoomLevel);
        if (coordinates.id) {
            this.highlightMarker(coordinates.id);
        }
    }

    _centerOnCoordinates(coords, zoomLevel = 1.5) {
        if (!this._isInitialized || !this.mapImage) {
            this._pendingCenter = { coords, zoomLevel };
            return;
        }

        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;
        const pinX = (coords.x / 100) * this.mapImage.naturalWidth;
        const pinY = (coords.y / 100) * this.mapImage.naturalHeight;

        if (zoomLevel) {
            this.scale = Math.max(this.minScale, Math.min(this.maxScale, zoomLevel));
        }

        this.offsetX = (containerWidth / 2) - (pinX * this.scale);
        this.offsetY = (containerHeight / 2) - (pinY * this.scale);
        this.constrainMapBounds();
        this.render();
    }

    /**
     * Highlight a marker
     */
    highlightMarker(id) {
        this.markers.forEach(pin => pin.classList.remove('selected'));
        const pin = this.markers.get(id);
        if (pin) {
            pin.classList.add('selected');
        }
    }

    /**
     * Add event listeners for map interaction (private implementation)
     * @private
     */
    /**
     * Add event listeners for map interaction (private implementation)
     * @private
     */
    _addEventListeners() {
        if (!this.mapContainer) {
            console.error('mapContainer is not defined');
            return;
        }
        
        try {
            // Store a reference to the instance on the container for debugging
            this.mapContainer._interactiveMapInstance = this;
            
            // Add passive: false to wheel event to allow preventDefault()
            this.mapContainer.addEventListener('wheel', this.handleWheel, { passive: false });
            this.mapContainer.addEventListener('mousedown', this.handleMouseDown);
            this.mapContainer.addEventListener('click', this.handleMapClick);
            this.mapContainer.addEventListener('mouseleave', this.handleMouseUp);
            
            // Use capture phase for document events to ensure they're caught
            document.addEventListener('mousemove', this.handleMouseMove, { capture: true });
            document.addEventListener('mouseup', this.handleMouseUp, { capture: true });
            
            // Add keyboard navigation support
            document.addEventListener('keydown', this._handleKeyDown);
        } catch (error) {
            console.error('Failed to add event listeners:', error);
        }
    }
}
