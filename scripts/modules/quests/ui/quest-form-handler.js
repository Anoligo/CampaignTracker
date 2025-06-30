import { QuestType, QuestStatus } from '../enums/quest-enums.js';
import { showToast } from '../../../components/ui-components.js';
import { formatEnumValue } from './quest-utils.js';
import { initEntityDropdown, getDropdownValue } from '../../../utils/relational-inputs.js';

export const formHandler = {
    toggleListVisibility(show = true) {
        const { list, search, addButton } = this.elements;
        const method = show ? 'remove' : 'add';
        list?.classList[method]('d-none');
        search?.classList[method]('d-none');
        addButton?.classList[method]('d-none');
    },
    showQuestForm(quest = null) {
        this.isEditing = !!quest;
        this.currentQuest = quest || null;
        const { details } = this.elements;
        const contentEl = details.querySelector('#questDetailsContent') || details;

        const formHtml = `
            <form id="questForm" class="quest-form">
                <div class="mb-3">
                    <label for="questName">Quest Name *</label>
                    <input type="text" id="questName" name="name" value="${quest ? quest.name : ''}" required>
                </div>
                <div class="row g-3">
                    <div class="col-12 col-sm-6 mb-3">
                        <label for="questType">Type</label>
                        <select id="questType" name="type" required>
                            ${Object.values(QuestType).map(type =>
                                `<option value="${type}" ${quest && quest.type === type ? 'selected' : ''}>${formatEnumValue(type)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="col-12 col-sm-6 mb-3">
                        <label for="questStatus">Status</label>
                        <select id="questStatus" name="status" required>
                            ${Object.values(QuestStatus).map(status =>
                                `<option value="${status}" ${quest && quest.status === status ? 'selected' : ''}>${formatEnumValue(status)}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="questDescription">Description</label>
                    <textarea id="questDescription" name="description" rows="5">${quest ? quest.description : ''}</textarea>
                </div>
                <div class="mb-3">
                    <label for="questNotes">Notes</label>
                    <textarea id="questNotes" name="notes" rows="3">${quest ? quest.notes || '' : ''}</textarea>
                </div>
                <div class="row g-3">
                    <div class="col-12 col-sm-6 mb-3">
                        <label for="questLocations">Locations</label>
                        <select id="questLocations" name="relatedLocations" multiple></select>
                    </div>
                    <div class="col-12 col-sm-6 mb-3">
                        <label for="questItems">Items</label>
                        <select id="questItems" name="relatedItems" multiple></select>
                    </div>
                </div>
                <div class="row g-3">
                    <div class="col-12 col-sm-6 mb-3">
                        <label for="questFactions">Factions</label>
                        <select id="questFactions" name="relatedFactions" multiple></select>
                    </div>
                    <div class="col-12 col-sm-6 mb-3">
                        <label for="relatedQuests">Related Quests</label>
                        <select id="relatedQuests" name="relatedQuests" multiple></select>
                    </div>
                </div>
                <div class="row g-3">
                    <div class="col-12 col-md-4 mb-3">
                        <label for="resolutionSession">Resolution Session</label>
                        <input type="text" id="resolutionSession" name="resolutionSession" value="${quest && quest.resolution ? quest.resolution.session : ''}">
                    </div>
                    <div class="col-12 col-md-4 mb-3">
                        <label for="resolutionDate">Resolution Date</label>
                        <input type="date" id="resolutionDate" name="resolutionDate" value="${quest && quest.resolution && quest.resolution.date ? new Date(quest.resolution.date).toISOString().split('T')[0] : ''}">
                    </div>
                    <div class="col-12 col-md-4 mb-3">
                        <label for="resolutionXp">XP Gain</label>
                        <input type="number" id="resolutionXp" name="resolutionXp" value="${quest && quest.resolution ? quest.resolution.xp : 0}" min="0">
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancelQuestBtn">Cancel</button>
                    <button type="submit" class="btn btn-primary">${quest ? 'Update' : 'Create'} Quest</button>
                </div>
            </form>`;

        contentEl.innerHTML = formHtml;

        this.toggleListVisibility(false);

        const form = document.getElementById('questForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Initialize relational dropdowns
        const locations = this.dataManager?.appState.locations || [];
        initEntityDropdown('#questLocations', 'location', locations, { multiple: true, useElementDirectly: false, selectedId: null });
        const items = this.dataManager?.appState.loot || [];
        initEntityDropdown('#questItems', 'item', items, { multiple: true });
        const factions = this.dataManager?.appState.factions || [];
        initEntityDropdown('#questFactions', 'faction', factions, { multiple: true });
        const quests = this.dataManager?.appState.quests?.filter(q => !quest || q.id !== quest.id) || [];
        initEntityDropdown('#relatedQuests', 'quest', quests, { multiple: true });

        document.getElementById('cancelQuestBtn').addEventListener('click', () => {
            this.toggleListVisibility(true);
            if (this.currentQuest) {
                this.showQuestDetails(this.currentQuest.id);
            } else {
                const c = this.elements.details.querySelector('#questDetailsContent') || this.elements.details;
                c.innerHTML = '';
            }
        });
    },

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const questName = formData.get('name');
        const questData = {
            name: questName,
            title: questName, // Ensure title is set to match name
            type: formData.get('type'),
            status: formData.get('status'),
            description: formData.get('description'),
            notes: formData.get('notes') || '',
            relatedLocations: getDropdownValue('#questLocations') || [],
            relatedItems: getDropdownValue('#questItems') || [],
            relatedFactions: getDropdownValue('#questFactions') || [],
            relatedQuests: getDropdownValue('#relatedQuests') || [],
            resolution: {
                session: formData.get('resolutionSession') || '',
                date: formData.get('resolutionDate') || null,
                xp: parseInt(formData.get('resolutionXp') || '0', 10)
            }
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
                const c = this.elements.details.querySelector('#questDetailsContent') || this.elements.details;
                c.innerHTML = '';
            }
            this.toggleListVisibility(true);
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
                const c = this.elements.details.querySelector('#questDetailsContent') || this.elements.details;
                c.innerHTML = `
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
