import { DataService } from '../modules/data/services/data-service.js';

export class DataManagementPage {
    constructor() {
        this.exportDataBtn = document.getElementById('exportDataBtn');
        this.importFileInput = document.getElementById('importFileInput');
        this.importDataBtn = document.getElementById('importDataBtn');
        this.importStatus = document.getElementById('importStatus');
        
        // Ensure the import button is initially disabled
        if (this.importDataBtn) {
            this.importDataBtn.disabled = true;
            this.importDataBtn.classList.add('btn-secondary');
        }
        
        this.dataService = new DataService();
        this._bindEvents();
        
        console.log('DataManagementPage initialized');
    }
    
    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        if (this.exportDataBtn) {
            this.exportDataBtn.addEventListener('click', () => this._exportData());
        }
        
        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => this._handleFileSelect(e));
        }
        
        if (this.importDataBtn) {
            this.importDataBtn.addEventListener('click', () => this._importData());
        }
    }
    
    /**
     * Export all data to a JSON file
     * @private
     */
    _exportData() {
        try {
            const data = this.dataService.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `pathfinder-world-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this._showStatus('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this._showStatus('Export failed. Please check console for details.', 'error');
        }
    }
    
    /**
     * Handle file selection for import
     * @param {Event} event - The file input change event
     * @private
     */
    _handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            this.importDataBtn.disabled = true;
            return;
        }
        
        if (!file.name.endsWith('.json')) {
            this._showStatus('Please select a valid JSON file.', 'error');
            this.importDataBtn.disabled = true;
            return;
        }
        
        // Enable the import button and update its state
        this.importDataBtn.disabled = false;
        this.importDataBtn.classList.remove('btn-secondary');
        this.importDataBtn.classList.add('btn-primary');
        
        this._showStatus(`Ready to import: ${file.name}`, 'info');
    }
    
    /**
     * Import data from a JSON file
     * @private
     */
    async _importData() {
        const file = this.importFileInput.files[0];
        if (!file) return;
        
        try {
            const fileContent = await this._readFileAsText(file);
            const data = JSON.parse(fileContent);
            
            // Confirm before overwriting data
            if (!confirm('This will overwrite all current data. Are you sure?')) {
                return;
            }
            
            this.dataService.importData(data);
            this._showStatus('Data imported successfully! Reloading...', 'success');
            
            // Reload after a short delay to show the success message
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('Import failed:', error);
            this._showStatus('Failed to import data. Invalid or corrupted file.', 'error');
        }
    }
    
    /**
     * Read a file as text
     * @param {File} file - The file to read
     * @returns {Promise<string>} The file content as text
     * @private
     */
    _readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
    
    /**
     * Show a status message
     * @param {string} message - The message to show
     * @param {string} type - The message type (success, error, info)
     * @private
     */
    _showStatus(message, type = 'info') {
        if (!this.importStatus) return;
        
        this.importStatus.textContent = message;
        this.importStatus.className = `alert alert-${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.importStatus.textContent = '';
            this.importStatus.className = '';
        }, 5000);
    }
}
