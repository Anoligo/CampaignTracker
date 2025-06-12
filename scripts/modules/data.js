/**
 * Data Module - Compatibility Layer
 * 
 * This file provides backward compatibility for imports from './modules/data.js'.
 * New code should import from './modules/data/index.js' instead.
 */

// Re-export all the necessary components from the new module structure
export { Quest, QuestType, QuestStatus } from './quests/index.js';
export { Note } from './notes.js';
export { Item, ItemType, ItemRarity } from './loot.js';
export { Location, LocationType, DiscoveryStatus } from './locations/index.js';
export { Player, PlayerClass } from './players/index.js';
export { Condition } from './conditions/index.js';
export { GuildActivity, GuildActivityType, GuildResource, GuildResourceType } from './guild/index.js';

// Import the new DataService as DataManager for backward compatibility
import { DataService as DataManager, StateValidator } from './data/index.js';

export { DataManager, StateValidator };

export default new DataManager();