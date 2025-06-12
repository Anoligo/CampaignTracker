/**
 * Game Data Service
 * Centralized service for game-related data like races, classes, etc.
 */

export class GameDataService {
    constructor() {
        // Initialize data
        this._races = this._initializeRaces();
        this._classes = this._initializeClasses();
    }

    /**
     * Initialize race data
     * @private
     */
    _initializeRaces() {
        return [
            { id: 'human', name: 'Human' },
            { id: 'elf', name: 'Elf' },
            { id: 'dwarf', name: 'Dwarf' },
            { id: 'halfling', name: 'Halfling' },
            { id: 'gnome', name: 'Gnome' },
            { id: 'half-elf', name: 'Half-Elf' },
            { id: 'half-orc', name: 'Half-Orc' },
            { id: 'tiefling', name: 'Tiefling' },
            { id: 'aasimar', name: 'Aasimar' },
            { id: 'goblin', name: 'Goblin' },
            { id: 'kobold', name: 'Kobold' },
            { id: 'lizardfolk', name: 'Lizardfolk' },
            { id: 'orc', name: 'Orc' },
            { id: 'ratfolk', name: 'Ratfolk' },
            { id: 'catfolk', name: 'Catfolk' },
            { id: 'tengu', name: 'Tengu' },
            { id: 'kitsune', name: 'Kitsune' },
            { id: 'strix', name: 'Strix' },
            { id: 'sylph', name: 'Sylph' },
            { id: 'undine', name: 'Undine' },
            { id: 'ifrit', name: 'Ifrit' },
            { id: 'oread', name: 'Oread' },
            { id: 'suli', name: 'Suli' }
        ];
    }

    /**
     * Initialize class data
     * @private
     */
    _initializeClasses() {
        return [
            { id: 'alchemist', name: 'Alchemist' },
            { id: 'barbarian', name: 'Barbarian' },
            { id: 'bard', name: 'Bard' },
            { id: 'champion', name: 'Champion' },
            { id: 'cleric', name: 'Cleric' },
            { id: 'druid', name: 'Druid' },
            { id: 'fighter', name: 'Fighter' },
            { id: 'inventor', name: 'Inventor' },
            { id: 'investigator', name: 'Investigator' },
            { id: 'kineticist', name: 'Kineticist' },
            { id: 'magus', name: 'Magus' },
            { id: 'monk', name: 'Monk' },
            { id: 'oracle', name: 'Oracle' },
            { id: 'psychic', name: 'Psychic' },
            { id: 'ranger', name: 'Ranger' },
            { id: 'rogue', name: 'Rogue' },
            { id: 'sorcerer', name: 'Sorcerer' },
            { id: 'summoner', name: 'Summoner' },
            { id: 'swashbuckler', name: 'Swashbuckler' },
            { id: 'thaumaturge', name: 'Thaumaturge' },
            { id: 'witch', name: 'Witch' },
            { id: 'wizard', name: 'Wizard' },
            { id: 'gunslinger', name: 'Gunslinger' }
        ];
    }

    /**
     * Get all races
     * @returns {Array} Array of race objects
     */
    getRaces() {
        return [...this._races];
    }

    /**
     * Get all classes
     * @returns {Array} Array of class objects
     */
    getClasses() {
        return [...this._classes];
    }

    /**
     * Get race by ID
     * @param {string} id - Race ID
     * @returns {Object|null} Race object or null if not found
     */
    getRaceById(id) {
        return this._races.find(race => race.id === id) || null;
    }

    /**
     * Get class by ID
     * @param {string} id - Class ID
     * @returns {Object|null} Class object or null if not found
     */
    getClassById(id) {
        return this._classes.find(cls => cls.id === id) || null;
    }

    /**
     * Get race name by ID
     * @param {string} id - Race ID
     * @returns {string} Race name or empty string if not found
     */
    getRaceName(id) {
        const race = this.getRaceById(id);
        return race ? race.name : '';
    }

    /**
     * Get class name by ID
     * @param {string} id - Class ID
     * @returns {string} Class name or empty string if not found
     */
    getClassName(id) {
        const cls = this.getClassById(id);
        return cls ? cls.name : '';
    }
}

// Export a singleton instance
export const gameDataService = new GameDataService();
