import { QuestType, QuestStatus } from '../enums/quest-enums.js';
import { showToast } from '../../../components/ui-components.js';
import { formatEnumValue } from './quest-utils.js';

export const formHandler = {
    showQuestForm(quest = null) {
        this.isEditing = !!quest;
        this.currentQuest = quest || null;
        const { details } = this.elements;

        const formHtml = `
            <form id="questForm" class="quest-form">
                <div class="form-group">
                    <label for="questName">Quest Name *</label>
                    <input type="text" id="questName" name="name" value="${quest ? quest.name : ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="questType">Type</label>
                        <select id="questType" name="type" required>
                            ${Object.values(QuestType).map(type =>
                                `<option value="${type}" ${quest && quest.type === type ? 'selected' : ''}>${formatEnumValue(type)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="questStatus">Status</label>
                        <select id="questStatus" name="status" required>
                            ${Object.values(QuestStatus).map(status =>
                                `<option value="${status}" ${quest && quest.status === status ? 'selected' : ''}>${formatEnumValue(status)}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="questDescription">Description</label>
                    <textarea id="questDescription" name="description" rows="5">${quest ? quest.description : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancelQuestBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">${quest ? 'Update' : 'Create'} Quest</button>
                </div>
            </form>`;

        details.innerHTML = formHtml;

        const form = document.getElementById('questForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        document.getElementById('cancelQuestBtn').addEventListener('click', () => {
            if (this.currentQuest) {
                this.showQuestDetails(this.currentQuest.id);
            } else {
                this.elements.details.innerHTML = '';
            }
        });
    },

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const questData = {
            name: formData.get('name'),
            type: formData.get('type'),
            status: formData.get('status'),
            description: formData.get('description')
        };

        try {
            if (this.isEditing && this.currentQuest) {
                await this.questService.updateQuest(this.currentQuest.id, questData);
                showToast('Quest updated successfully', 'success');
            } else {
                await this.questService.createQuest(questData);
                showToast('Quest created successfully', 'success');
            }

            await this.renderQuestList();
            if (this.isEditing && this.currentQuest) {
                this.showQuestDetails(this.currentQuest.id);
            } else {
                this.elements.details.innerHTML = '';
            }
        } catch (error) {
            console.error('Error saving quest:', error);
            showToast(`Failed to save quest: ${error.message}`, 'error');
        }
    },

    async deleteQuest(questId) {
        if (!confirm('Are you sure you want to delete this quest?')) {
            return;
        }
        try {
            await this.questService.deleteQuest(questId);
            showToast('Quest deleted successfully', 'success');
            if (this.currentQuest && this.currentQuest.id === questId) {
                this.currentQuest = null;
                this.elements.details.innerHTML = `
                    <div class="text-muted text-center py-5">
                        <i class="fas fa-scroll fa-3x mb-3"></i>
                        <p>Select a quest or create a new one</p>
                    </div>`;
                this.elements.editButton.disabled = true;
                this.elements.deleteButton.disabled = true;
            }
            await this.renderQuestList();
        } catch (error) {
            console.error('Error deleting quest:', error);
            showToast('Failed to delete quest', 'error');
        }
    }
};
