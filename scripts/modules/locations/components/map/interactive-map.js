import { renderMethods } from "./interactive-map-render.js";
import { eventMethods } from "./interactive-map-events.js";
import { utilMethods } from "./interactive-map-utils.js";

export class InteractiveMap {
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
            // Attempt to recover by setting a default size
            if (!this.container.style.height || parseInt(this.container.style.height, 10) === 0) {
                this.container.style.height = '600px';
            }
            return false;
        }

        return true;
    }

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
            if (!this.container.style.height) {
                // Only set height if not already defined to avoid collapsing to zero
                this.container.style.height = '100%';
            }
            if (!this.container.style.minHeight) {
                this.container.style.minHeight = '500px'; // Ensure minimum height
            }

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

                // Notify listeners that the map has loaded
                if (this.container) {
                    this.container.dispatchEvent(new CustomEvent('interactiveMapLoaded', { detail: this }));
                }
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
}

Object.assign(InteractiveMap.prototype, renderMethods, eventMethods, utilMethods);

