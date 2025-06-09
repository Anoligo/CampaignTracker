/**
 * Players Module - Compatibility Layer
 * 
 * This file provides backward compatibility for imports from './modules/players.js'.
 * New code should import directly from './modules/players/index.js' instead.
 */

// Re-export all the necessary components from the new module structure
export { Player, PlayerClass, PlayerStatus } from './players/index.js';
import { PlayersManager } from './players/players-manager.js';

// Export PlayersManager as PlayerManager for backward compatibility
export { PlayersManager as PlayerManager };

// Default export for backward compatibility
export default {
    Player,
    PlayerClass,
    PlayerStatus,
    PlayerManager: PlayersManager
};
