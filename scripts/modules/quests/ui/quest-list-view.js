import { formatEnumValue, getStatusBadgeClass, getQuestTypeBadgeClass } from './quest-utils.js';
import { formatDate } from '../../../utils/date-utils.js';

export const listView = {
    filterQuests(searchTerm) {
        const quests = this.questService.getAllQuests();
        const filtered = searchTerm
            ? quests.filter(q =>
                q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (q.description && q.description.toLowerCase().includes(searchTerm.toLowerCase()))
              )
            : quests;
        this.renderQuestList(filtered);
    },

    renderQuestList(quests) {
        const list = this.elements.list;
        quests = quests || this.questService.getAllQuests();
        list.innerHTML = '';

        if (quests.length === 0) {
            list.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-scroll fa-3x mb-3"></i>
                    <p>No quests found. Click \"Add Quest\" to get started.</p>
                </div>`;
            return;
        }

        quests.forEach(quest => {
            const item = this.createQuestItem(quest);
            list.appendChild(item);
        });
    },

    createQuestItem(quest) {
        const item = document.createElement('div');
        item.className = 'quest-item';
        item.dataset.id = quest.id;

        if (this.currentQuest && this.currentQuest.id === quest.id) {
            item.classList.add('active');
        }

        const statusClass = getStatusBadgeClass(quest.status);
        const typeClass = getQuestTypeBadgeClass(quest.type);

        item.innerHTML = `
            <div class="quest-item-header">
                <h4>${quest.name}</h4>
                <span class="quest-status ${statusClass}">${formatEnumValue(quest.status)}</span>
            </div>
            <div class="quest-item-meta">
                <span class="quest-type ${typeClass}">${formatEnumValue(quest.type)}</span>
                <span class="quest-date">${formatDate(quest.updatedAt)}</span>
            </div>
            <p class="quest-description">
                ${quest.description ? quest.description.substring(0, 100) + (quest.description.length > 100 ? '...' : '') : 'No description'}
            </p>`;

        item.addEventListener('click', () => this.showQuestDetails(quest.id));
        return item;
    }
};
