export const renderMethods = {
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
    },

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
    },

    /**
     * Reset the map view (private implementation)
     * @private
     */
    _resetView() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.render();
    },

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
};
