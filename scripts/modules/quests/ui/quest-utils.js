export function formatEnumValue(str) {
    if (!str) return '';
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function getStatusBadgeClass(status) {
    const statusMap = {
        NOT_STARTED: 'bg-secondary',
        IN_PROGRESS: 'bg-primary',
        COMPLETED: 'bg-success',
        FAILED: 'bg-danger',
        ON_HOLD: 'bg-warning',
        ABANDONED: 'bg-dark'
    };
    return statusMap[status] || 'bg-secondary';
}

export function getQuestTypeBadgeClass(type) {
    const typeMap = {
        MAIN: 'bg-primary',
        SIDE_QUEST: 'bg-info',
        PERSONAL: 'bg-success',
        FACTION: 'bg-warning',
        EVENT: 'bg-purple',
        OTHER: 'bg-secondary'
    };
    return typeMap[type] || 'bg-secondary';
}
