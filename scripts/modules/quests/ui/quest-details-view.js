import { formatEnumValue, getStatusBadgeClass, getQuestTypeBadgeClass } from './quest-utils.js';
import { formatDate } from '../../../utils/date-utils.js';
import { showToast } from '../../../components/ui-components.js';

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
        const statusClass = `status-${quest.status.toLowerCase().replace(/\s+/g, '-')}`;
        const typeClass = `type-${quest.type.toLowerCase()}`;

        details.innerHTML = `
            <div class="quest-details">
                <div class="quest-header">
                    <h2>${quest.name}</h2>
                    <div class="quest-meta">
                        <span class="quest-type ${typeClass}">${formatEnumValue(quest.type)}</span>
                        <span class="quest-status ${statusClass}">${formatEnumValue(quest.status)}</span>
                    </div>
                </div>
                <div class="quest-content">
                    <h3>Description</h3>
                    <p>${quest.description || 'No description provided.'}</p>
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
                </div>
            </div>`;
    }
};
