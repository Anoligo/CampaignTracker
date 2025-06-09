/**
 * Location Types
 * @readonly
 * @enum {string}
 */
export const LocationType = Object.freeze({
    TOWN: 'TOWN',
    CITY: 'CITY',
    DUNGEON: 'DUNGEON',
    LANDMARK: 'LANDMARK',
    REGION: 'REGION',
    SETTLEMENT: 'SETTLEMENT',
    RUIN: 'RUIN',
    TEMPLE: 'TEMPLE',
    TAVERN: 'TAVERN',
    SHOP: 'SHOP',
    OTHER: 'OTHER'
});

/**
 * Discovery Status
 * @readonly
 * @enum {string}
 */
export const DiscoveryStatus = Object.freeze({
    UNDISCOVERED: 'UNDISCOVERED',
    DISCOVERED: 'DISCOVERED',
    VISITED: 'VISITED',
    EXPLORED: 'EXPLORED'
});

/**
 * Default location form fields configuration
 * @type {Array<Object>}
 */
export const locationFormFields = [
    {
        id: 'name',
        label: 'Location Name',
        type: 'text',
        required: true,
        placeholder: 'Enter location name'
    },
    {
        id: 'type',
        label: 'Location Type',
        type: 'select',
        required: true,
        options: Object.entries(LocationType).map(([key, value]) => ({
            value,
            label: key.charAt(0) + key.slice(1).toLowerCase()
        }))
    },
    {
        id: 'discoveryStatus',
        label: 'Discovery Status',
        type: 'select',
        required: true,
        options: Object.entries(DiscoveryStatus).map(([key, value]) => ({
            value,
            label: key.charAt(0) + key.slice(1).toLowerCase()
        }))
    },
    {
        id: 'x',
        label: 'Map X',
        type: 'number',
        placeholder: '0-100',
        required: false
    },
    {
        id: 'y',
        label: 'Map Y',
        type: 'number',
        placeholder: '0-100',
        required: false
    },
    {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter location description'
    },
    {
        id: 'notes',
        label: 'Notes',
        type: 'textarea',
        placeholder: 'Enter additional notes'
    },
    {
        id: 'tags',
        label: 'Tags',
        type: 'text',
        placeholder: 'Comma separated tags'
    }
];

/**
 * Default location list columns configuration
 * @type {Array<Object>}
 */
export const locationListColumns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'type', label: 'Type', sortable: true },
    { id: 'discoveryStatus', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false }
];

export default {
    LocationType,
    DiscoveryStatus,
    locationFormFields,
    locationListColumns
};
