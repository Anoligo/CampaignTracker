// Core application entry point
import { appState } from './state/app-state.js';
import { AppInitializer } from './initialization/app-initializer.js';
import { showToast } from '../components/ui-components.js';

// Make appState available globally for debugging
// Check for development mode using URL parameter or hostname
const isDevelopment = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    new URLSearchParams(window.location.search).has('debug');

if (isDevelopment) {
    console.log('Running in development mode');
    window.appState = appState;
}

// Initialize the application when the DOM is fully loaded
const initApp = async () => {
    try {
        // Show loading state
        document.documentElement.classList.add('loading');
        
        // Initialize the application
        await AppInitializer.initialize();
        
        // Application is ready
        document.documentElement.classList.remove('loading');
        document.documentElement.classList.add('ready');
        
        // Add 'ready' class to body to enable transitions
        document.body.classList.add('ready');
        
        console.log('Application started successfully');
    } catch (error) {
        console.error('Failed to start application:', error);
        showToast('Failed to start application. Please check the console for details.', 'error');
        document.documentElement.classList.add('error');
    }
};

// Start the application when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export the public API
export { appState };
export default {
    appState,
    initialize: AppInitializer.initialize
};
