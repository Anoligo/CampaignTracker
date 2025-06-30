// Use a relative path so this module works regardless of the site's base URL.
import { DataServiceInitializer } from '../../../core/initialization/data-service-initializer.js';

/**
 * Data Management UI
 * Handles the data import/export functionality
 */
export class DataManagementUI {
    /**
     * Create a new DataManagementUI
     * @param {DataService} dataService - The data service instance
     */
    constructor(dataService = null) {
        this.dataService = dataService || DataServiceInitializer.getDataService();
        this.initialize();
    }
    
    /**
     * Initialize the UI components
     */
    initialize() {
        console.log('Initializing DataManagementUI...');
        
        this.exportDataBtn = document.getElementById('exportDataBtn');
        this.importFileInput = document.getElementById('importFileInput');
        this.importDataBtn = document.getElementById('importDataBtn');
        this.importStatus = document.getElementById('importStatus');
        this.modalElement = document.getElementById('dataManagementModal');
        this.modalLink = document.getElementById('dataManagementLink');
        
        console.log('Elements found:', {
            exportDataBtn: !!this.exportDataBtn,
            importFileInput: !!this.importFileInput,
            importDataBtn: !!this.importDataBtn,
            importStatus: !!this.importStatus,
            modalElement: !!this.modalElement,
            modalLink: !!this.modalLink
        });
        
        // Initialize the modal
        this._initModal();
        this._bindEvents();
        
        console.log('DataManagementUI initialized');
    }
    // Constructor is now moved to the top with DataService injection
    
    /**
     * Initialize the modal
     * @private
     */
    _initModal() {
        console.log('Initializing modal...');
        if (!this.modalElement) {
            console.error('Modal element not found');
            return;
        }
        
        // Initialize the modal if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
            console.log('Bootstrap found, initializing modal...');
            try {
                this.modal = new bootstrap.Modal(this.modalElement, {
                    backdrop: true,
                    keyboard: true
                });
                console.log('Bootstrap Modal initialized successfully');
            } catch (error) {
                console.error('Error initializing Bootstrap modal:', error);
            }
        } else {
            console.warn('Bootstrap not found, using fallback modal implementation');
        }
        
        console.log('Modal initialization complete');
    }
    
    /**
     * Show the modal
     * @public
     */
    show() {
        console.log('show() called');
        
        // Force show the modal regardless of Bootstrap
        this._showFallbackModal();
        
        // Still try to use Bootstrap if available
        if (this.modal) {
            console.log('Using Bootstrap modal.show()');
            try {
                this.modal.show();
                console.log('Bootstrap modal.show() completed');
            } catch (error) {
                console.error('Error in Bootstrap modal.show():', error);
            }
        }
        
        // Force visibility
        this._forceModalVisibility();
        
        // Check visibility after a short delay
        setTimeout(() => {
            console.log('Modal visibility check:', {
                display: window.getComputedStyle(this.modalElement).display,
                visibility: window.getComputedStyle(this.modalElement).visibility,
                opacity: window.getComputedStyle(this.modalElement).opacity,
                zIndex: window.getComputedStyle(this.modalElement).zIndex,
                classList: this.modalElement.className
            });
            
            // If still not visible, force it again
            if (window.getComputedStyle(this.modalElement).display === 'none') {
                console.warn('Modal is still hidden, forcing visibility again');
                this._forceModalVisibility();
            }
        }, 50);
    }
    
    /**
     * Fallback method to show modal without Bootstrap
     * @private
     */
    _showFallbackModal() {
        console.log('Using fallback modal show method');
        if (!this.modalElement) return;
        
        // Show the modal
        this.modalElement.style.display = 'block';
        this.modalElement.style.visibility = 'visible';
        this.modalElement.style.opacity = '1';
        this.modalElement.classList.add('show');
        this.modalElement.style.paddingRight = '15px';
        this.modalElement.setAttribute('aria-modal', 'true');
        this.modalElement.removeAttribute('aria-hidden');
        this.modalElement.style.pointerEvents = 'auto';
        
        // Add modal-open class to body
        document.body.classList.add('modal-open');
        document.body.style.paddingRight = '15px';
        document.body.style.overflow = 'hidden';
        
        // Ensure modal dialog is visible
        const modalDialog = this.modalElement.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.style.display = 'block';
            modalDialog.style.pointerEvents = 'auto';
        }
        
        // Add or show backdrop
        let backdrop = document.querySelector('.modal-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.style.display = 'block';
            backdrop.style.opacity = '0.5';
            document.body.appendChild(backdrop);
        } else {
            backdrop.style.display = 'block';
        }
        
        console.log('Fallback modal shown');
    }
    
    /**
     * Force the modal to be visible and interactive
     * @private
     */
    _forceModalVisibility() {
        if (!this.modalElement) return;
        
        console.log('Forcing modal visibility');
        
        // Force modal styles
        this.modalElement.style.display = 'block';
        this.modalElement.style.visibility = 'visible';
        this.modalElement.style.opacity = '1';
        this.modalElement.style.pointerEvents = 'auto';
        this.modalElement.classList.add('show');
        
        // Ensure modal dialog is visible
        const modalDialog = this.modalElement.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.style.display = 'block';
            modalDialog.style.opacity = '1';
            modalDialog.style.visibility = 'visible';
            modalDialog.style.pointerEvents = 'auto';
        }
        
        // Ensure modal content is interactive
        const modalContent = this.modalElement.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.pointerEvents = 'auto';
        }
        
        // Ensure body has modal-open class
        document.body.classList.add('modal-open');
        
        console.log('Modal visibility forced');
    }
    
    /**
     * Hide the modal
     * @public
     */
    hide() {
        if (this.modal) {
            this.modal.hide();
        } else {
            // Fallback if Bootstrap modal is not available
            this.modalElement.classList.remove('show');
            this.modalElement.style.display = 'none';
            this.modalElement.setAttribute('aria-hidden', 'true');
            this.modalElement.removeAttribute('aria-modal');
            document.body.classList.remove('modal-open');
            
            // Remove backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
    }
    
    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        // Data management link click
        if (this.modalLink) {
            this.modalLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.show();
            });
        }
        
        // Close button click
        const closeButton = this.modalElement ? this.modalElement.querySelector('[data-bs-dismiss="modal"]') : null;
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }
        
        // Export button click
        if (this.exportDataBtn) {
            this.exportDataBtn.addEventListener('click', () => this._exportData());
        }
        
        // Import file input change
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => this._handleFileSelect(e));
        }
        
        // Import button click
        if (this.importDataBtn) {
            this.importDataBtn.addEventListener('click', () => this._importData());
        }
        
        // Close modal when clicking on the backdrop
        if (this.modalElement) {
            this.modalElement.addEventListener('click', (e) => {
                if (e.target === this.modalElement) {
                    this.hide();
                }
            });
        }
    }
    
    /**
     * Export all data to a JSON file
     * @private
     */
    _exportData() {
        try {
            // Get the current state from the data service
            const data = this.dataService.exportData();
            
            // Create a blob with the data
            const blob = new Blob([data], { type: 'application/json' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaign-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            // Trigger the download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
            
            this._showStatus('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this._showStatus('Error exporting data. Check console for details.', 'error');
        }
    }
    
    /**
     * Handle file selection for import
     * @param {Event} event - The file input change event
     * @private
     */
    _handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Only allow JSON files
        if (!file.name.endsWith('.json')) {
            this._showStatus('Please select a valid JSON file.', 'error');
            return;
        }
        
        // Enable the import button
        if (this.importDataBtn) {
            this.importDataBtn.disabled = false;
        }
        
        this._showStatus(`Selected file: ${file.name}`, 'info');
    }
    
    /**
     * Import data from a JSON file
     * @private
     */
    _importData() {
        const fileInput = this.importFileInput;
        if (!fileInput.files || fileInput.files.length === 0) {
            this._showStatus('No file selected.', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                
                // Ask for confirmation before importing
                if (confirm('WARNING: This will overwrite all current data. Are you sure you want to continue?')) {
                    // Import the data using the data service
                    const success = this.dataService.importData(data);
                    
                    if (success) {
                        this._showStatus('Data imported successfully! The page will now reload.', 'success');
                        
                        // Reload the page to apply changes
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        this._showStatus('Error importing data. The file may be corrupted or in an invalid format.', 'error');
                    }
                } else {
                    this._showStatus('Import cancelled.', 'info');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                this._showStatus('Error importing data. The file may be corrupted or in an invalid format.', 'error');
            }
        };
        
        reader.onerror = () => {
            this._showStatus('Error reading file.', 'error');
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Show status message
     * @param {string} message - The message to display
     * @param {string} type - The message type (success, error, info, warning)
     * @private
     */
    _showStatus(message, type = 'info') {
        if (!this.importStatus) return;
        
        this.importStatus.textContent = message;
        this.importStatus.className = `small text-${type}`;
    }
    
    /**
     * Close the modal
     * @private
     */
    _closeModal() {
        if (!this.modalElement) return;
        
        // Hide the modal
        this.modalElement.style.display = 'none';
        this.modalElement.classList.remove('show');
        
        // Remove the backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.style.display = 'none';
        }
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        // Reset the file input
        if (this.importFileInput) {
            this.importFileInput.value = '';
        }
        
        // Reset the import button
        if (this.importDataBtn) {
            this.importDataBtn.disabled = true;
        }
        
        // Clear any status messages
        if (this.importStatus) {
            this.importStatus.textContent = '';
            this.importStatus.className = 'small';
        }
    }
}

// Export the class for use in the data management page
export { DataManagementUI };
