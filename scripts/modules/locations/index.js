// Export constants
export * from './constants/location-constants.js';

// Export utilities
export * from './utils/location-utils.js';

// Export components
export { default as LocationForm } from './components/location-form.js';
export { default as LocationList } from './components/location-list.js';

// Export the main UI component
export { default as LocationUI } from './location-ui.js';

// Export models
export { Location } from './models/location-model.js';

// Export manager and initializer for section registration
export { LocationManager } from './location-manager.js';
export { initializeLocationsSection } from './location-ui.js';
