import { formatEnumValue, getStatusBadgeClass, getQuestTypeBadgeClass } from './quest-utils.js';
import { formatDate } from '../../../utils/date-utils.js';
import { showToast } from '../../../components/ui-components.js';

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export const detailsView = {
    async showQuestDetails(questId) {
        try {
            const quest = await this.questService.getQuestById(questId);
            if (!quest) return;

            this.currentQuest = quest;
            this.renderQuestDetails(quest);

            document.querySelectorAll('.quest-item').forEach(item => {
                item.classList.toggle('active', item.dataset.id === questId);
            });

            this.elements.editButton.disabled = false;
            this.elements.deleteButton.disabled = false;
        } catch (error) {
            console.error('Error loading quest details:', error);
            showToast('Failed to load quest details', 'error');
        }
    },

    renderQuestDetails(quest) {
        const { details } = this.elements;
        const contentEl = details.querySelector('#questDetailsContent') || details;
        const statusClass = `status-${quest.status.toLowerCase().replace(/\s+/g, '-')}`;
        const typeClass = `type-${quest.type.toLowerCase()}`;

        const formatEntities = (ids, type) => {
            if (!ids || ids.length === 0) return '<span class="text-muted">None</span>';
            return ids.map(id => {
                const entity = this.dataManager?.appState?.[`${type}s`]?.find(e => e.id === id);
                return entity ? `<span class="badge bg-secondary me-1">${escapeHtml(entity.name || entity.title)}</span>` : '';
            }).join('');
        };

        const resolution = quest.resolution || {};
        contentEl.innerHTML = `
            <div class="quest-details">
                <div class="quest-header">
                    <h2>${escapeHtml(quest.name)}</h2>
                    <div class="quest-meta">
                        <span class="quest-type ${typeClass}">${formatEnumValue(quest.type)}</span>
                        <span class="quest-status ${statusClass}">${formatEnumValue(quest.status)}</span>
                    </div>
                </div>
                <div class="quest-content">
                    <h3>Description</h3>
                    <p>${escapeHtml(quest.description || 'No description provided.')}</p>
                    <h3>Notes</h3>
                    <p>${escapeHtml(quest.notes || 'None')}</p>
                    <div class="quest-dates">
                        <div class="date-item">
                            <span class="date-label">Created:</span>
                            <span class="date-value">${formatDate(quest.createdAt)}</span>
                        </div>
                        <div class="date-item">
                            <span class="date-label">Last Updated:</span>
                            <span class="date-value">${formatDate(quest.updatedAt)}</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <h4 class="mb-1">Related Locations</h4>
                        <div>${formatEntities(quest.relatedLocations, 'location')}</div>
                        <h4 class="mt-3 mb-1">Related Items</h4>
                        <div>${formatEntities(quest.relatedItems, 'loot')}</div>
                        <h4 class="mt-3 mb-1">Related Factions</h4>
                        <div>${formatEntities(quest.relatedFactions, 'faction')}</div>
                        <h4 class="mt-3 mb-1">Related Quests</h4>
                        <div>${formatEntities(quest.relatedQuests, 'quest')}</div>
                    </div>
                    <div class="mt-3">
                        <h4 class="mb-1">Resolution</h4>
                        <p>Session: ${escapeHtml(resolution.session || 'N/A')}</p>
                        <p>Date: ${resolution.date ? formatDate(resolution.date) : 'N/A'}</p>
                        <p>XP Gain: ${resolution.xp || 0}</p>
                    </div>
                </div>
            </div>`;
    }
};
