/**
 * Pathfinder World Tracker - Main Entry Point
 * 
 * This is a lightweight entry point that initializes the application core.
 * Most of the application logic has been moved to the core modules.
 */

// Import core application
import './core/index.js';

// Import global styles
import { applyGlobalStyles } from './global-styles.js';

// Initialize global styles
applyGlobalStyles();

// Show a welcome message in the console
console.log('%cPathfinder World Tracker', 'font-size: 24px; font-weight: bold; color: #d4a017;');
console.log('%cInitializing application...', 'color: #4a6fa5;');
