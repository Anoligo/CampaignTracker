export const eventMethods = {
    /**
     * Handle mouse wheel events for zooming (private implementation)
     * @param {WheelEvent} e - The wheel event
     * @private
     */
    _handleWheel(e) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.2 : 0.8;
        this.zoom(factor);
    },

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
    },

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
    },

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
    },

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
    },

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
};
