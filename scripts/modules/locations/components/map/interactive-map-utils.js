export const utilMethods = {
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
    },

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
    },

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
    },

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
    },

    _getLocationAt(x, y) {
        const location = this.locations.find(loc => {
            const pinX = (loc.x / 100) * this.mapImage.naturalWidth;
            const pinY = (loc.y / 100) * this.mapImage.naturalHeight;
            const distance = Math.sqrt(Math.pow(pinX - x, 2) + Math.pow(pinY - y, 2));
            return distance < 20; // Adjust the distance threshold as needed
        });
        return location || null;
    },

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
    },

    addMarker({ id, title = '', coordinates, status, onClick }) {
        if (!this.pinsContainer || !coordinates) return;

        // Allow coordinates to be provided in pixels or percentages
        let { x, y } = coordinates;
        if (this.mapImage && (x > 100 || y > 100)) {
            const mapW = this.mapImage.naturalWidth || 0;
            const mapH = this.mapImage.naturalHeight || 0;
            if (mapW && mapH) {
                x = (x / mapW) * 100;
                y = (y / mapH) * 100;
            }
        }

        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.style.left = `${x}%`;
        pin.style.top = `${y}%`;

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
    },

    clearMarkers() {
        this.markers.forEach(el => el.remove());
        this.markers.clear();
    },

    panTo(coordinates, zoomLevel) {
        if (!coordinates) return;
        this._centerOnCoordinates(coordinates, zoomLevel);
        if (coordinates.id) {
            this.highlightMarker(coordinates.id);
        }
    },

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
    },

    highlightMarker(id) {
        this.markers.forEach(pin => pin.classList.remove('selected'));
        const pin = this.markers.get(id);
        if (pin) {
            pin.classList.add('selected');
        }
    }
};
