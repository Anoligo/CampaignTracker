/**
 * Locations Module - Compatibility Layer
 * 
 * This file provides backward compatibility for imports from './modules/locations.js'.
 * New code should import from './modules/locations/index.js' instead.
 *
 * @deprecated Import from './modules/locations/index.js' instead.
 */

// Re-export all the necessary components from the new module structure
export { Location, LocationType, DiscoveryStatus, LocationManager } from './locations/index.js';

// For backward compatibility
export { Location as default } from './locations/index.js';
