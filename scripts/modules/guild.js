/**
 * Guild Module - Compatibility Layer
 * 
 * This file provides backward compatibility for imports from './modules/guild.js'.
 * New code should import from './modules/guild/index.js' instead.
 *
 * @deprecated Import from './modules/guild/index.js' instead.
 */

// Re-export all the necessary components from the new module structure
export { GuildActivity, GuildResource, GuildActivityType, GuildResourceType } from './guild/index.js';

// Import the GuildManager for backward compatibility
import { GuildManager } from './guild/index.js';

export { GuildManager };
export default GuildManager;
