/**
 * PlayerRace Enum
 * Defines the available player character races
 */

export const PlayerRace = {
    HUMAN: 'human',
    ELF: 'elf',
    DWARF: 'dwarf',
    HALFLING: 'halfling',
    GNOME: 'gnome',
    HALF_ELF: 'half-elf',
    HALF_ORC: 'half-orc',
    TIEFLING: 'tiefling',
    AASIMAR: 'aasimar',
    GOBLIN: 'goblin',
    KOBOLD: 'kobold',
    LIZARDFOLK: 'lizardfolk',
    ORC: 'orc',
    RATFOLK: 'ratfolk',
    CATFOLK: 'catfolk',
    TENGU: 'tengu',
    KITSUNE: 'kitsune',
    STRIX: 'strix',
    SYLPH: 'sylph',
    UNDINE: 'undine',
    IFRIT: 'ifrit',
    OREAD: 'oread',
    SULI: 'suli',
    // Add more races as needed
};

/**
 * Helper function to get a display name for a race
 * @param {string} race - The race key (e.g., 'HUMAN')
 * @returns {string} The formatted display name (e.g., 'Human')
 */
export function getRaceDisplayName(race) {
    if (!race) return '';
    
    // Convert to string in case a number is passed
    const raceStr = String(race).toUpperCase();
    
    // Handle special cases
    switch (raceStr) {
        case 'HALF_ELF':
            return 'Half-Elf';
        case 'HALF_ORC':
            return 'Half-Orc';
        case 'LIZARDFOLK':
            return 'Lizardfolk';
        case 'RATFOLK':
            return 'Ratfolk';
        case 'CATFOLK':
            return 'Catfolk';
        default:
            // Convert snake_case to Title Case with spaces
            return raceStr
                .toLowerCase()
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
    }
}

/**
 * Get all races as an array of {value, label} objects
 * @returns {Array<{value: string, label: string}>} Array of race options
 */
export function getRaceOptions() {
    return Object.entries(PlayerRace).map(([key, value]) => ({
        value,
        label: getRaceDisplayName(key)
    }));
}
